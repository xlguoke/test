import type { SignPostionConfigEntity } from '../SignPostionConfigEntity'

interface IPdfSignHelperConfig {
  isReadonly?: boolean
  renderFilter: (datas: SignPostionConfigEntity[]) => SignPostionConfigEntity[]
}
export class PdfSignHelper {
  /** # pdfjs实例？ */
  PDFViewerApplication?: any

  /** # 签名数据列表(初始化传入)  */
  signDataList: Ref<SignPostionConfigEntity[]> = ref([])

  /** # 缩放比率 */
  scale: number = 1

  /** # 复位数据 */
  resetData?: SignPostionConfigEntity

  /** # 最大宽度 */
  maxWidth = 0

  /** # 最大高度 */
  maxHeight = 0

  /** # 总页码 */
  pagesCount = 0

  /** # 当前页码 */
  get page() {
    return this.PDFViewerApplication?.page
  }

  initDragOffsetX = 0

  initDragOffsetY = 0

  config?: IPdfSignHelperConfig

  constructor(PDFViewerApplication: any, signDataList?: Ref<SignPostionConfigEntity[]>, config?: IPdfSignHelperConfig) {
    if (!PDFViewerApplication) {
      throw new Error('PDFViewerApplication为空')
    }
    if (signDataList) {
      this.signDataList = signDataList
    }
    this.PDFViewerApplication = PDFViewerApplication
    this.pagesCount = PDFViewerApplication?.pagesCount
    this.config = config

    // 绑定this上下文
    this.setPositon = this.setPositon.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleDragStart = this.handleDragStart.bind(this)
  }

  /**
   * # 渲染签名占位项
   */
  render() {
    // 根据缩放比率对坐标信息和宽高进行换算
    this.scale = this.PDFViewerApplication.pdfViewer.currentScale
    // 获取pdfjs当前已渲染的页面列表
    const viewerContainer = this.PDFViewerApplication.pdfViewer.container
    const renderedPages = Array.from(viewerContainer.querySelectorAll('.page')) as HTMLElement[]
    const renderedWrapper = Array.from(viewerContainer.querySelectorAll('.canvasWrapper')) as HTMLElement[]
    // 移除页面中所有sign-tag
    viewerContainer.querySelectorAll('.sign-tag').forEach((item: HTMLElement) => {
      item.remove()
    })
    // 移除id为toolbarViewerRight的工具
    viewerContainer.ownerDocument.querySelector('#toolbarViewerRight')?.remove()
    // 事件监听
    viewerContainer.ownerDocument.removeEventListener('dragend', this.setPositon)
    viewerContainer.ownerDocument.removeEventListener('dragstart', this.handleDragStart)
    viewerContainer.ownerDocument.addEventListener('dragend', this.setPositon)
    viewerContainer.ownerDocument.addEventListener('dragstart', this.handleDragStart)
    viewerContainer.ownerDocument.removeEventListener('click', this.handleClick)
    viewerContainer.ownerDocument.addEventListener('click', this.handleClick)
    const { width, height } = renderedWrapper?.[0]?.getBoundingClientRect()
    if (width && height) {
      this.maxWidth = Number((width / this.scale).toFixed(2)) || 0
      this.maxHeight = Number((height / this.scale).toFixed(2)) || 0
    }
    // 将对应页码数据渲染进对应页面dom中
    renderedPages.forEach((pageDom: HTMLElement) => {
      pageDom.style.position = 'relative'
      // 获取页面最大宽高

      const pageNumber = pageDom.dataset.pageNumber
      let pageData = this.signDataList.value.filter((item) => {
        return item.pageNo === Number(pageNumber)
      })
      if (this.config?.renderFilter) {
        pageData = this.config.renderFilter(pageData)
      }
      if (pageData.length) {
        // 监听该dom下的拖拽事件
        pageData.forEach((item) => {
          const signDom = this.createDraggableDom(item)
          // 把签名节点添加到页面上
          pageDom.appendChild(signDom)
        })
      }
    })
  }

  /**
   * # 按传入数据创建一个可拖拽dom节点
   * 节点被移动时返回坐标信息
   */
  createDraggableDom(data: SignPostionConfigEntity) {
    // 创建一个可拖拽元素
    const dom = document.createElement('div')
    dom.style.cssText = `
      position: absolute;
      width: ${data.signWidth * this.scale}px;
      height: ${data.signHeight * this.scale}px;
      line-height: ${data.signHeight * this.scale}px;
      left: ${data.signX * this.scale}px;
      bottom: ${data.signY * this.scale}px;
      font-size: ${16 * this.scale}px;
      white-space: nowrap;
      border: 1px dashed ${data.isTarget ? '#06e0d6' : '#797979'};
      border-radius: 4px;
      text-align: center;
      z-index: 999;
      cursor: move;
    `
    if (data.isTarget) {
      dom.style.backgroundColor = '#ffff00'
      dom.style.zIndex = '9999'
      dom.style.color = '#000'
    }
    else {
      dom.style.backgroundColor = 'var(--colorPrimary)'
      dom.style.zIndex = '999'
      dom.style.color = '#fff'
    }
    // 设置元素的draggable为true
    if (!this.config?.isReadonly) {
      dom.setAttribute('draggable', 'true')
    }
    dom.id = data.id
    dom.classList.add('sign-tag')
    dom.innerHTML = data.userName || ''
    dom.dataset.payload = JSON.stringify(data)
    return dom
  }

  handleDragStart(e: DragEvent) {
    // 记录鼠标点相对元素的偏移量
    this.initDragOffsetX = e.offsetX
    this.initDragOffsetY = e.offsetY
    const target = e.target as HTMLElement
    const payload = JSON.parse(target?.dataset?.payload || '') as SignPostionConfigEntity
    // 记录复位数据
    this.resetData = payload
  }

  setPositon(e: DragEvent) {
    const target = e.target as HTMLElement
    this.setTarget(target)
    // 更新元素位置
    const { offsetX, offsetY } = e
    const payload = JSON.parse(target?.dataset?.payload || '') as SignPostionConfigEntity

    target.style.left = `${payload.signX * this.scale + offsetX - this.initDragOffsetX}px`
    target.style.bottom = `${payload.signY * this.scale - offsetY + this.initDragOffsetY}px`
    const newData = {
      ...payload,
      signX: (payload.signX * this.scale + offsetX - this.initDragOffsetX) / this.scale,
      signY: (payload.signY * this.scale - offsetY + this.initDragOffsetY) / this.scale,
    } as SignPostionConfigEntity
    target.dataset.payload = JSON.stringify(newData)
    this.updateData(newData)
    this.checkCrossPage(e.target as HTMLElement)
  }

  private handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.classList.contains('sign-tag')) {
      // 获取当前点击的dom
      const dom = target as HTMLElement
      // 更新数据
      this.setTarget(dom)
    }
  }

  /**
   * # 移除一个dom节点
   */
  removeDom(data: SignPostionConfigEntity) {
    const viewer = this.PDFViewerApplication.pdfViewer.viewer as HTMLElement
    viewer.querySelectorAll('.sign-tag').forEach((item) => {
      if (item.id === data.id) {
        item.remove()
      }
    })
  }

  /**
   * # 更新数据
   */
  updateData(data: SignPostionConfigEntity) {
    const index = this.signDataList.value.findIndex(item => item.id === data.id)
    data.signX = Number(data.signX.toFixed(2))
    data.signY = Number(data.signY.toFixed(2))
    this.signDataList.value.splice(index, 1, data)
  }

  /**
   * # 检查是否跨越页面
   */
  checkCrossPage(dom: HTMLElement) {
    const rect = dom.getBoundingClientRect()
    const currentWrapper = dom.parentElement!
    const wrapperRect = currentWrapper.getBoundingClientRect()
    if (rect.left < wrapperRect.left || rect.right > wrapperRect.right || rect.top < wrapperRect.top || rect.bottom > wrapperRect.bottom) {
      // 跨越页面，需要重新定位
      this.repositionDomAcrossPages(dom)
    }
  }

  /**
   * # 根据位置获取页面编号
   */
  getPageNumberFromPosition(x: number, y: number) {
    const viewerContainer = this.PDFViewerApplication.pdfViewer.container

    const pages = Array.from(viewerContainer.querySelectorAll('.page')) as HTMLElement[]

    for (const page of pages) {
      const canvasWrapper = page.querySelector('.canvasWrapper')
      if (!canvasWrapper)
        continue
      const rect = canvasWrapper.getBoundingClientRect()
      const pageNumber = page.dataset.pageNumber

      if (x >= rect.left && x <= rect.right
        && y >= rect.top && y <= rect.bottom) {
        return Number(pageNumber)
      }
    }
    return null
  }

  /**
   * # 重新定位跨越页面的DOM
   */
  async repositionDomAcrossPages(dom: HTMLElement) {
    const payload = JSON.parse(dom.dataset.payload || '') as SignPostionConfigEntity
    const { pageNo } = payload

    // 获取元素相当于视口x,y坐标
    const rect = dom.getBoundingClientRect()

    // 获取新的页面编号
    const newPageNumber = this.getPageNumberFromPosition(rect.left, rect.top)

    if (!newPageNumber) {
      // 如果没有找到对应页面，复位
      if (this.resetData) {
        dom.style.left = `${this.resetData.signX * this.scale}px`
        dom.style.bottom = `${this.resetData.signY * this.scale}px`
        dom.dataset.payload = JSON.stringify(this.resetData)
        this.setTarget(dom)
        this.updateData(this.resetData)
      }
      return
    }
    if (newPageNumber !== pageNo) {
      const viewerContainer = this.PDFViewerApplication.pdfViewer.container
      const pages = Array.from(viewerContainer.querySelectorAll('.page')) as HTMLElement[]
      const newWrapper = pages.find((page) => {
        const pageNumber = page.dataset.pageNumber
        return Number(pageNumber) === newPageNumber
      })
      if (newWrapper) {
        // 获取新的页面的canvasWrapper
        const newCanvasWrapper = newWrapper.querySelector('.canvasWrapper') as HTMLElement
        // 计算dom在新容器中的位置
        dom.style.left = `${rect.left - newCanvasWrapper.getBoundingClientRect().left}px`
        dom.style.bottom = `${newCanvasWrapper.getBoundingClientRect().bottom - rect.bottom}px`
        // 把dom移到新容器中
        newCanvasWrapper.appendChild(dom)
        const newData = {
          ...payload,
          pageNo: newPageNumber,
          signX: (rect.left - newCanvasWrapper.getBoundingClientRect().left) / this.scale,
          signY: (newCanvasWrapper.getBoundingClientRect().bottom - rect.bottom) / this.scale,
        } as SignPostionConfigEntity
        dom.dataset.payload = JSON.stringify(newData)
        this.updateData(newData)
      }
    }
  }

  scrollTo(id: string) {
    const viewerContainer = this.PDFViewerApplication.pdfViewer.container as HTMLElement
    const dom = viewerContainer.querySelector(`[id="${id}"]`) as HTMLElement
    this.setTarget(dom)
    dom.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    })
  }

  setTarget(dom: HTMLElement) {
    const viewerContainer = this.PDFViewerApplication.pdfViewer.container as HTMLElement
    const domData = JSON.parse(dom.dataset.payload || '') as SignPostionConfigEntity
    viewerContainer.querySelectorAll('.sign-tag').forEach((item) => {
      const payload = JSON.parse((item as unknown as HTMLElement).dataset.payload || '') as SignPostionConfigEntity
      const newData = {
        ...payload,
        isTarget: domData.id === payload.id,
      } as SignPostionConfigEntity

      if (domData.id === payload.id) {
        (item as unknown as HTMLElement).style.backgroundColor = '#ffff00';
        (item as unknown as HTMLElement).style.borderColor = '#06e0d6'
      }
      else {
        (item as unknown as HTMLElement).style.backgroundColor = 'unset';
        (item as unknown as HTMLElement).style.borderColor = '#797979'
      }

      (item as unknown as HTMLElement).dataset.payload = JSON.stringify(newData)
      this.updateData(newData)
    })
  }
}
