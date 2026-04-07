/*
 * @Title: PDF转图片功能
 * @Descripttion: 将PDF转为图片输出
 * @Author: dengyy
 * @Date: 2022-08-26 11:02:19
 * @LastEditors: dengyy
 * @LastEditTime: 2022-08-30 19:57:12
 */

export default class PDF2Image {
  /**
   * @param pdfUrl pdf地址
   */
  constructor(pdfUrl, page, container) {
    this.pdfUrl = pdfUrl
    this.container = container
    this.container.innerHTML = ''
    this.currentPage = page || 1
    // 总页数
    this.totalPage = 0
    // 缩放比例
    this.scale = 1
    this.pdfDocument = undefined

    if (this.pdfUrl) {
      this.getPDFFile()
    }
    else {
      console.error('没有PDF文件地址')
    }
  }

  // blob对象转JSON对象
  BlobToJSON(blob, cb) {
    try {
      if (blob instanceof Blob) {
        const reader = new FileReader() // 创建一个FileReader实例
        reader.readAsText(blob, 'utf-8') // 读取文件,结果用字符串形式表示
        reader.onload = function () {
          // 读取完成后,**获取reader.result**
          try {
            const errData = JSON.parse(reader.result)
            cb && cb(errData)
          }
          // eslint-disable-next-line unused-imports/no-unused-vars
          catch (e) {
            cb
            && cb({
              error: {
                message: reader.result,
              },
            })
          }
        }
      }
      else {
        cb && cb(blob)
      }
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (e) {
      cb
      && cb({
        error: {
          message: '文件获取失败！',
        },
      })
    }
  }

  // 获取PDF文件
  getPDFFile() {
    const that = this
    const pdfUrl = this.pdfUrl

    const xhr = new XMLHttpRequest()
    xhr.open('GET', pdfUrl, true)
    xhr.responseType = 'blob'
    xhr.onload = () => {
      if (xhr.status === 200) {
        if (
          ['application/pdf', 'application/octet-stream'].includes(xhr.response.type)
        ) {
          that.readPDFFile(xhr.response)
        }
        else {
          that.BlobToJSON(xhr.response, (result) => {
            if (!result.state) { /* empty */ }
          })
        }
      }
      else if (xhr.status === 404) {
        const message = 'PDF文件404'
        console.error(message)
      }
      else {
        const message = 'PDF文件请求失败'
        console.error(message)
      }
    }
    xhr.onerror = function () {
      const message = 'PDF文件请求失败'
      console.error(message)
    }
    xhr.send()
  }

  // 读取PDF文件
  readPDFFile(fileStream) {
    const that = this

    // 二进制流转为blob
    const blob = new Blob([fileStream], {
      type: 'application/pdf',
    })

    const reader = new FileReader()
    reader.readAsDataURL(blob) // 将文件读取为 DataURL
    reader.onload = function () {
      const loadingTask = window.pdfjsLib.getDocument(reader.result)
      loadingTask.promise.then((pdf) => {
        if (pdf) {
          that.pdfDocument = pdf
          const totalPage = pdf.numPages // 获取pdf文件总页数
          that.totalPage = totalPage

          that.renderCanvas(that.currentPage)
        }
      })
    }
  }

  renderCanvas(i, cb) {
    const container = this.container
    const ele = container.getElementsByClassName(`pageNum${i}`)
    if (ele && ele.length > 0) {
      ele[0].style.display = 'block'
      this.pdfDisplay()
      return
    }

    const pdf = this.pdfDocument
    const canvas = document.createElement('canvas')
    canvas.className = `pageNum${i}`
    this.container.append(canvas)
    const context = canvas.getContext('2d')
    this.renderImg(pdf, i, context, () => {
      cb && cb()
    })
  }

  // 渲染图片
  renderImg(pdfFile, pageNumber, canvasContext, cb) {
    const that = this
    const container = this.container

    pdfFile.getPage(pageNumber).then((page) => {
      // 逐页解析PDF
      const viewport = page.getViewport({
        scale: 1,
      }) // 页面缩放比例
      const newcanvas = canvasContext.canvas

      // 设置canvas宽高
      newcanvas.width = viewport.width
      newcanvas.height = viewport.height
      newcanvas.style.width = `${container.clientWidth}px`
      newcanvas.style.height = `${container.clientHeight}px`

      // //设置canvas真实宽高
      // newcanvas.width = viewport.width;
      // newcanvas.height = viewport.height;

      // //设置canvas在浏览中宽高
      // newcanvas.style.width = viewport.width + "px";
      // newcanvas.style.height = viewport.height + "px";

      // // 设置容器宽高
      // if (pageNumber == 1) {
      //   that.container.style.width = viewport.width + "px";
      //   that.container.style.height = viewport.height + "px";
      // }

      that.pdfDisplay()

      const renderContext = {
        canvasContext,
        viewport,
      }

      page.render(renderContext) // 渲染生成

      cb && cb()
    })
  }

  /**
   * 上一页
   */
  prePage() {
    const currentPage = this.currentPage
    if (!currentPage || currentPage <= 1) {
      return
    }

    this.currentPage = currentPage - 1
    this.renderCanvas(this.currentPage)
  }

  /**
   * 下一页
   */
  nextPage() {
    const currentPage = this.currentPage
    const totalPage = this.totalPage
    if (!currentPage || currentPage >= totalPage) {
      return
    }

    this.currentPage = currentPage + 1
    this.renderCanvas(this.currentPage)
  }

  /**
   * 跳转
   */
  toPage(page) {
    const totalPage = this.totalPage
    if (page && page > 0 && page <= totalPage) {
      this.currentPage = page
      this.renderCanvas(this.currentPage)
    }
  }

  /**
   * 控制pdf展示
   */
  pdfDisplay() {
    const { totalPage, currentPage, container } = this

    for (let i = 1; i <= totalPage; i++) {
      if (i === currentPage) {
        continue
      }

      const ele = container.getElementsByClassName(`pageNum${i}`)
      if (ele && ele.length > 0) {
        ele[0].style.display = 'none'
      }
    }
  }
}
