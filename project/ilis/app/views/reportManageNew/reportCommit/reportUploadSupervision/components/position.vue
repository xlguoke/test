<template>
  <div>
    <a-modal
      v-model:open="visible"
      title="补录防伪码"
      :width="modalWidth"
      centered
      :body-style="bodyStyle"
      :destroy-on-close="true"
      :draggable="false"
      wrap-class-name="positionModal"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <div ref="warpperRef" class="warpper">
        <div class="left">
          <a-form ref="formRef" :model="activePage">
            <h3 style="font-weight: bold">
              报告文件
            </h3>
            <div class="overflow-y-auto h-[120px] pb-[50px] pr-3">
              <div
                v-for="(item, index) in files"
                :key="index"
                class="flex gap-3"
              >
                <a-button
                  class="flex-1 w-0 text-left"
                  :title="item.name"
                  :type="showColor(item.id === file.id)"
                  @click="openFile(item)"
                >
                  {{
                    item.name.length > 30
                      ? `${item.name.slice(0, 30)}...`
                      : item.name
                  }}
                  <img
                    v-if="item.hasQrCode"
                    :src="qrSvg"
                    class="qr-code-icon"
                    alt=""
                  />
                </a-button>
                <a-button
                  danger
                  class="w-[50px]"
                  @click="delFile(item)"
                >
                  <DeleteOutlined class="dataCollection-drawer-delete" />
                </a-button>
              </div>
            </div>
            <div class="mr-3">
              <a-button
                type="dashed"
                block
                @click="addFile"
              >
                <PlusOutlined />
              </a-button>
            </div>
            <h4 style="font-weight: bold; margin: 10px 0">
              文件页码
            </h4>
            <div class="overflow-y-auto h-[120px] pb-[50px] pr-3">
              <span v-for="(item, index) in file.pagination" :key="index">
                <a-button
                  :type="showColor(item.pageNumber === activePage.pageNumber)"
                  style="width: 40px; margin-left: 10px; margin-top: 10px"
                  @click="openPage(item)"
                >
                  {{ item.pageNumber }}
                  <img
                    v-if="item.hasQrCode"
                    :src="qrSvg"
                    class="qr-code-icon"
                    alt=""
                  />
                </a-button>
              </span>
            </div>
            <div>
              <h4 style="font-weight: bold; margin: 10px 0">
                防伪码及位置信息
              </h4>
              <div v-if="activePage.hasQrCode" class="qr-code-position">
                <a-form-item
                  label="防伪码大小缩放："
                  :label-col="{ span: 8 }"
                  :wrapper-col="{ span: 16 }"
                >
                  <a-input-number
                    v-model:value="activePage.zoomRatio"
                    type="number"
                    :min="0.5"
                    :step="0.1"
                    :max="activePage.width"
                    :precision="1"
                    @change="(e) => changeZoomRatio(e)"
                  />
                </a-form-item>
                <p style="color: #999; font-size: 12px; margin-bottom: 20px">
                  *
                  参考缩放原点为图片左上角；建议缩放不小于0.5，否则会影响扫码识别
                </p>

                <a-form-item
                  label="防伪码坐标X："
                  :label-col="{ span: 8 }"
                  :wrapper-col="{ span: 16 }"
                >
                  <a-input-number
                    v-model:value="activePage.imgLeft"
                    type="number"
                    :min="0"
                    :precision="0"
                    @change="(e) => numberChange(e, 'imgLeft')"
                  />
                </a-form-item>
                <a-form-item
                  label="防伪码坐标Y："
                  :label-col="{ span: 8 }"
                  :wrapper-col="{ span: 16 }"
                >
                  <a-input-number
                    v-model:value="activePage.imgTop"
                    type="number"
                    :min="0"
                    :precision="0"
                    @change="(e) => numberChange(e, 'imgTop')"
                  />
                </a-form-item>
                <p style="color: #999; font-size: 12px">
                  * 参考坐标原点为纸张左上角
                </p>
              </div>
              <p
                v-else-if="
                  file.id !== undefined && file.id !== null && file.id !== ''
                "
                class="qr-code-position"
                style="color: #999; font-size: 12px"
              >
                * 本页暂无防伪码位置信息，请点击
                <a-button type="primary" @click="addQrCode()">
                  添加
                </a-button>
              </p>
              <p v-else class="qr-code-position"></p>
            </div>
            <div>
              <a-row>
                <a-col span="11">
                  <a-button
                    type="primary"
                    :disabled="
                      activePage.pageNumber === -1 || !activePage.hasQrCode
                    "
                    block
                    @click="resetPosition()"
                  >
                    重置防伪码设置
                  </a-button>
                </a-col>
                <a-col span="11" offset="1">
                  <a-button
                    danger
                    :disabled="
                      activePage.pageNumber === -1 || !activePage.hasQrCode
                    "
                    block
                    @click="removeQrCode()"
                  >
                    移除本页防伪码
                  </a-button>
                </a-col>
              </a-row>
            </div>
          </a-form>
        </div>
        <div class="right">
          <div
            ref="aBox"
            class="aBox"
            :style="`width:${activePage.width + 2}px;height:${
              activePage.height + 2
            }px;`"
          >
            <div
              ref="pdfContainer"
              class="preview-pdf"
              :style="`width:${activePage.width}px;height:${activePage.height}px;`"
            ></div>
            <div
              v-if="!pdfCompleted && activePage.pageNumber !== -1"
              class="loading-parent"
              :style="`width:${activePage.width}px;height:${activePage.height}px;`"
            >
              <div class="loading loading-child">
                <a-spin tip="正在加载报告文件..." />
              </div>
            </div>
            <div
              v-show="pdfCompleted"
              id="dragimg"
              draggable="true"
              class="imgblok"
              :style="`left:${activePage.imgLeft}px;
                       top:${activePage.imgTop}px;
                       width:${activePage.imgWidth}px;
                       height:${activePage.imgHeight}px;`"
            >
              <img :src="imgSrc" alt="" />
            </div>
          </div>
        </div>
      </div>
    </a-modal>
    <ht-modal
      id="choiceFile"
      v-model:open="choiceFile.visible"
      title="选择报告文件"
      ok-text="确定"
      cancel-text="取消"
      width="40%"
      :body-style="choiceFile.bodyStyle"
      :destroy-on-close="true"
      @ok="choiceFile.onOk()"
      @cancel="choiceFile.onCancel()"
    >
      <a-row style="margin-bottom: 10px">
        <a-col span="12">
          <a-input-search
            placeholder="请输入报告文件名后回车即可查询"
            enter-button
            @search="choiceFile.onSearch"
          />
        </a-col>
      </a-row>
      <a-table
        :columns="choiceFile.columns"
        :data-source="choiceFile.files"
        bordered
        :pagination="false"
        :row-key="(record) => record.id"
        :row-selection="{
          selectedRowKeys: choiceFile.selectedRowKeys,
          onChange: choiceFile.onSelectChange,
        }"
      >
      </a-table>
    </ht-modal>
  </div>
</template>

<script>
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import Pdf2image from '~/providers/libs/pdf2image'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import image from './image'

export default {
  name: 'Position',
  components: {
    DeleteOutlined,
    PlusOutlined,
  },
  props: ['callback'],
  emits: ['callback'],
  data() {
    return {
      pdfViewer: null,
      coordinates: [],
      files: [],
      qrSize: 80, // 二维码默认大小
      aOffsetTop: 0, //  A4纸的偏移
      aOffsetLeft: 0, //  A4纸的偏移
      dragimg: '',
      x: '', // 记录到点击时鼠标到移动框左边和上边的距离
      y: '', // 记录到点击时鼠标到移动框左边和上边的距离
      cx: '', // 验证码左边距离
      cy: '', // 验证码上边距离
      imgSrc: image.qrCode,
      dataObj: null,
      spinning: false,
      regulatoryConfig: {}, // 监管系统配置
      visible: false,
      choiceFile: {
        visible: false,
        files: [],
        columns: [
          {
            title: '报告文件',
            dataIndex: 'name',
            key: 'name',
            width: '100%',
          },
        ],
        bodyStyle: {
          minHeight: '280px',
        },
        selectedRowKeys: [],
        onOk: () => {
          // 找到本次选择的文件
          const selectedFiles = this.dbFiles.filter(it =>
            this.choiceFile.selectedRowKeys.includes(it.id),
          )
          selectedFiles.forEach((it) => {
            const _file = JSON.parse(JSON.stringify(it))
            this.files.push(_file)
            const index = this.choiceFile.files.findIndex(
              it => _file.id === it.id,
            )
            this.choiceFile.files.splice(index, 1)
            if (
              this.file.id === ''
              || this.file.id === undefined
              || this.file.id === null
            ) {
              this.openFile(_file)
            }
          })
          this.choiceFile.selectedRowKeys = []
          this.choiceFile.visible = false
        },
        onCancel: () => {
          this.choiceFile.selectedRowKeys = []
          this.choiceFile.visible = false
        },
        onSelectChange: (selectedRowKeys) => {
          this.choiceFile.selectedRowKeys = selectedRowKeys
        },
        onSearch: (value) => {
          const searchFiles = this.dbFiles.filter(
            it => it.name.toLowerCase().includes(value.toLowerCase()),
          )
          this.choiceFile.files = []
          searchFiles.forEach((it) => {
            if (this.files.findIndex(i => i.id === it.id) === -1) {
              this.choiceFile.files.push(it)
            }
          })
        },
      }, // 选择报告文件控制
      bodyStyle: {
        height: `${document.body.clientHeight - 100}px`,
        overflow: 'hidden',
        overflowY: 'hidden',
      },
      file: {
        // 当前正在编辑的报告
        id: '',
        name: '', // 报告名称
        pagination: [], // 页码信息
        reportId: '', // 报告ID
        filePath: '', // 报告文件
        fileName: '', // 报告文件名称
        hasQrCode: false, //  是否有防伪码
      },
      activePage: {
        // 当前页面
        width: 417, //  页面宽度
        height: 590, //  页面高度
        imgLeft: 5, //  防伪码坐标X
        imgTop: 5, //  防伪码坐标Y
        imgWidth: 80 * 0.7, //  防伪码宽度
        imgHeight: 80 * 0.7, //  防伪码高度
        imgSrc: image.qrCode, //  防伪码图片
        hasQrCode: false, //  是否有防伪码
        pageNumber: -1, //  当前页码
        zoomRatio: 1,
      },
      files: [], // 参与配置的报告文件
      dbFiles: [], // 报告文件
      reportId: '', // 报告ID
      pdfCompleted: false, // 是否完成加载
      qrSvg: new URL('/assets/img/qr_icon.svg', import.meta.url).href,
    }
  },
  computed: {
    modalWidth() {
      let width = 950

      if (this.activePage.width > 500) {
        width += 590 - 417
      }

      return `${width}px`
    },
  },
  methods: {
    loadPdfFile(pageNumber) {
      this.pdfViewer = new Pdf2image(
        this.file.filePath,
        pageNumber,
        this.$refs.pdfContainer,
      )

      const interval = setInterval(() => {
        if (this.pdfViewer.pdfDocument) {
          this.pdfCompleted = true
          clearInterval(interval)
        }
      }, 200)
    },

    initActivePage() {
      this.activePage = {
        // 当前页面
        width: this.activePage.width, //  页面宽度
        height: this.activePage.height, //  页面高度
        imgLeft: 0, //  防伪码坐标X
        imgTop: 0, //  防伪码坐标Y
        zoomRatio: 1, //  缩放比例
        imgWidth: 80 * 0.7, //  防伪码宽度
        imgHeight: 80 * 0.7, //  防伪码高度
        imgSrc: image.qrCode, //  防伪码图片
        hasQrCode: false, //  是否有防伪码
        pageNumber: -1, //  当前页码
      }
    },

    /**
     * 重置页面
     */
    resetActivePage() {
      this.activePage.imgLeft = 0
      this.activePage.imgTop = 0
      this.activePage.zoomRatio = 1
      this.activePage.imgWidth = 80 * 0.7
      this.activePage.imgHeight = 80 * 0.7
    },

    isNumber(value) {
      // eslint-disable-next-line regexp/no-super-linear-backtracking
      const reg = /^\d+(?=\.?\d+$|$)/
      return !(value && !reg.test(value))
    },
    numberChange(value, column) {
      if (this.isNumber(value)) {
        window.$oNextTick(() => {
          this.activePage[column] = value
          if (column === 'imgWidth') {
            const lefts = Number(this.activePage.imgLeft) + value
            // 右边超出
            if (lefts > this.activePage.width) {
              this.activePage.imgLeft = this.activePage.width - value
            }
            // width 大于A4纸的width，left为0
            if (value >= this.activePage.width) {
              this.activePage.imgLeft = 0
            }
          }
          if (column === 'imgHeight') {
            const tops = Number(this.activePage.imgTop) + value
            // 下边超出高度
            if (tops > this.activePage.height) {
              this.activePage.imgTop = this.activePage.height - value
            }
            // height 大于A4纸的高，top为0
            if (value >= this.activePage.height) {
              this.activePage.imgTop = 0
            }
          }
          // a4纸awidth -图片的宽
          if (column === 'imgLeft') {
            const lefts
              = Number(this.activePage.width) - Number(this.activePage.imgWidth)
            if (lefts <= 0) {
              this.activePage.imgLeft = 0
              window.$oAntdModal.warning(window.$oMsgTips.info('请调整图片的宽度！'))
              return
            }
            if (value > lefts) {
              this.activePage.imgLeft = lefts
            }
          }
          if (column === 'imgTop') {
            const tops
              = Number(this.activePage.height) - Number(this.activePage.imgHeight)
            if (tops <= 0) {
              this.activePage.imgTop = 0
              window.$oAntdModal.warning(window.$oMsgTips.info('请调整图片的高度！'))
              return
            }
            if (value > tops) {
              this.activePage.imgTop = tops
            }
          }
        })
      }
    },
    // 修改缩放比例
    changeZoomRatio(value) {
      if (!this.isNumber(value))
        return
      if (!value || value < 0)
        value = 1
      const scale = Math.min(
        this.activePage.width / this.qrSize,
        this.activePage.height / this.qrSize,
      )
      if (value > scale)
        value = scale
      this.activePage.imgWidth = this.qrSize * 0.7 * value
      this.activePage.imgHeight = this.qrSize * 0.7 * value
      this.activePage.zoomRatio = value
      this.numberChange(this.activePage.imgWidth, 'imgWidth')
      this.numberChange(this.activePage.imgHeight, 'imgHeight')
    },
    // 初始化拖拽事件
    initDrapFun() {
      this.dragimg = document.querySelector('#dragimg')
      this.drawImage()
    },
    // 获取弹窗容器坐标
    getModalOffset() {
      let oParent = this.$refs.aBox.offsetParent
      let left = 0
      let top = 0
      while (oParent) {
        if (oParent && oParent.tagName.toLocaleLowerCase() !== 'body') {
          left += oParent.offsetLeft
          top += oParent.offsetTop
          oParent = oParent.offsetParent
        }
      }
      return {
        left,
        top,
      }
    },
    drawImage() {
      let { dragimg, x, y } = this
      dragimg.ondragstart = (e) => {
        if (this.activePage.pageNumber === -1) {
          window.$oAntdMessage.warning({
            content: '请先选择需要添加防伪码的页码!',
            duration: 5,
          })
          return
        }
        e.dataTransfer.effectAllowed = 'move' // 移动效果
        e.dataTransfer.setData('text', '') // 附加数据，没有这一项，firefox中无法移动

        const { left, top } = this.getModalOffset()

        x = e.offsetX || e.layerX
        y = e.offsetY || e.layerY
        this.dragHandle(x + left, y + top)
      }
    },
    // 获取由于滚动条导致的滚动偏差
    getScrollDirection(type) {
      const warpperRef = this.$refs.warpperRef
      const modalRef = document.getElementsByClassName('positionModal')
      let direction = 0

      if (type === 'top') {
        direction += warpperRef.scrollTop || 0

        if (modalRef && modalRef.length) {
          direction += modalRef[0].scrollTop || 0
        }
      }

      if (type === 'left') {
        direction += warpperRef.scrollLeft

        if (modalRef && modalRef.length) {
          direction += modalRef[0].scrollLeft || 0
        }
      }

      return direction
    },
    // 拖拽逻辑处理
    dragHandle(x, y) {
      const self = this.activePage
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      function dropFun(e) {
        let left = e.pageX - x - _this.aOffsetLeft + _this.getScrollDirection('left')
        let top = e.pageY - y - _this.aOffsetTop + _this.getScrollDirection('top')
        const maxTop = self.height - self.imgHeight
        const maxLeft = self.width - self.imgWidth

        if (left < 0) {
          left = 0
        }
        if (left > maxLeft) {
          left = maxLeft
        }
        if (top < 0) {
          top = 0
        }
        if (top > maxTop) {
          top = maxTop
        }
        self.imgTop = top
        self.imgLeft = left

        _this.dragimg.left = `${left}px`
        _this.dragimg.top = `${top}px`

        e.preventDefault() || e.stopPropagation() // 不取消，firefox中会触发网页跳转到查找setData中的内容
      }

      document.addEventListener(
        'dragover',
        (e) => {
          // 取消冒泡 ,不取消则不能触发 drop事件

          e.preventDefault() || e.stopPropagation()
        },
        false,
      )

      document.addEventListener(
        'dragend',
        (e) => {
          // 取消冒泡 ,不取消则不能触发 drop事件

          e.preventDefault() || e.stopPropagation()
          this.dragimg.ondrag = null
          document.removeEventListener('drop', dropFun)
        },
        false,
      )

      document.addEventListener('drop', dropFun, false)
    },
    setAxisY(t, h) {
      return (Number(this.activePage.height) - Number(t) - Number(h)) / 0.7
    },

    handleSubmit() {
      this.$refs.formRef.validateFields().then(() => {
        // 数据换算 后端计算时需要将成比例的宽高还原成像素，并且Y轴坐标是从左下角开始的
        const _fileInfo = JSON.parse(JSON.stringify(this.files))
        _fileInfo.forEach((item) => {
          item.pagination.forEach((paginate) => {
            paginate.imgTop
              = (Number(paginate.height)
                - Number(paginate.imgTop)
                - Number(paginate.imgHeight))
              / 0.7
            paginate.imgLeft = Number(paginate.imgLeft) / 0.7
            paginate.imgWidth = Number(paginate.imgWidth) / 0.7
            paginate.imgHeight = Number(paginate.imgHeight) / 0.7
          })
        })
        const data = {
          reportId: this.reportId,
          regulatoryId: this.regulatoryConfig.regulatoryId,
          fileInfos: _fileInfo,
        }
        const _msgKey = '_affix'
        window.$oAntdMessage.loading({ content: '正在添加防伪码...', key: _msgKey })
        window.$oAjax
          .post(`/rest/report/security-code-affix`, data, {
            headers: { 'content-type': 'application/json' },
          })
          .then((res) => {
            if (res.code === 21000) {
              window.$oAntdMessage.success({
                content: '防伪码添加成功！',
                key: _msgKey,
                duration: 2,
              })
              this.visible = false
              // 清理信息
              this.handleCancel()
              $emit(this, 'callback', true)
            }
            else {
              window.$oAntdMessage.error({
                content: res.msg,
                key: _msgKey,
                duration: 5,
              })
            }
          })
          .catch(() => {
            window.$oAntdMessage.error({
              content: '防伪码添加失败!',
              key: _msgKey,
              duration: 5,
            })
          })
      })
    },
    /**
     * 取消
     */
    handleCancel() {
      this.initActivePage()
      this.file = {}
      this.files = []
      this.dbFiles = []
      this.choiceFile.files = []
    },

    /**
     *  显示modal
     * @param config 行业管理系统配置信息
     * @param reportId 报告ID
     */
    show(config, reportId) {
      this.files = []
      this.regulatoryConfig = { ...config }
      this.reportId = reportId
      this.getDbFiles(reportId)
      this.visible = true
      window.$oNextTick(() => {
        this.aOffsetTop = this.$refs.aBox.offsetTop
        this.aOffsetLeft = this.$refs.aBox.offsetLeft
        this.initDrapFun()
      })
    },

    /**
     * 添加一个报告文件配置
     */
    addFile() {
      this.choiceFile.visible = true
    },

    /**
     * 删除一个报告文件配置
     */
    delFile(file) {
      const index = this.files.findIndex(it => file.id === it.id)
      this.files.splice(index, 1)
      this.choiceFile.files.push(file)
      if (file.id === this.file.id) {
        this.file = {}
        this.initActivePage()
      }
    },

    /**
     * 获取选中报告的报告文件信息
     *
     * 在这里进行文件目录初始化，首次进来时，列表默认加载第一个文件，将剩下的文件放在待选列表中
     *
     * @param reportId 报告ID
     */
    getDbFiles(reportId) {
      window.$oAjax({
        url: `/rest/report/security-code-affix/${reportId}`,
      })
        .then((res) => {
          if (res.code !== 20000) {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg))
            this.visible = false
            this.handleCancel()
            return
          }

          this.dbFiles = res.data || []
          const files = []
          this.dbFiles.forEach((it) => {
            it.pagination.forEach((item) => {
              // 数据换算
              if (item.point === 'vertical') {
                item.width = 417
                item.height = 590
              }
              else {
                item.width = 590
                item.height = 417
              }
              item.imgLeft = Number(item.imgLeft) * 0.7
              item.imgTop
                = item.height
                  - (Number(item.imgHeight) + Number(item.imgTop)) * 0.7
              item.imgWidth = Number(item.imgWidth) * 0.7
              item.imgHeight = Number(item.imgHeight) * 0.7
              item.hasQrCode = !!item.hasQrCode
              item.imgLeft = item.imgLeft ? item.imgLeft : 0
              item.imgTop = item.imgTop ? item.imgTop : 0
            })
            files.push(JSON.parse(JSON.stringify(it)))
          })
          this.choiceFile.files = files
        })
    },

    /**
     *  打开文件
     * @param file
     */
    openFile(file) {
      this.file = file
      this.initActivePage()
      this.pdfCompleted = false
      this.$refs.pdfContainer.innerHTML = ''
      const onePage = this.file.pagination.find(it => it.pageNumber === 1)
      this.openPage(onePage)
    },

    /**
     * 打开文件页
     * @param filePage 文件页码
     */
    openPage(filePage) {
      this.activePage = filePage
      if (this.activePage.point === 'vertical') {
        this.activePage.width = 417
        this.activePage.height = 590
      }
      else {
        this.activePage.width = 590
        this.activePage.height = 417
      }
      this.loadPdfFile(this.activePage.pageNumber)
      // if (!this.pdfCompleted) {
      // }
      // else {
      //   this.pdfViewer.toPage(this.activePage.pageNumber)
      // }
    },

    /**
     * 选中文件、页码的颜色切换
     * @param active
     */
    showColor(active) {
      if (active) {
        return 'primary'
      }
      return 'default'
    },

    /**
     *给当前页面添加防伪码
     */
    addQrCode() {
      if (this.activePage.pageNumber === -1) {
        window.$oAntdMessage.warning({
          content: '请先选择需要添加防伪码的页码!',
          duration: 5,
        })
        return
      }
      this.activePage.hasQrCode = true
      this.file.hasQrCode = true
    },

    /**
     * 移除当前页面的防伪码
     */
    removeQrCode() {
      this.resetActivePage()
      this.activePage.hasQrCode = false
      const _hasQrCode = this.file.pagination.find(it => it.hasQrCode)
      this.file.hasQrCode = !!_hasQrCode
    },
    /**
     * 重置防伪码位置信息
     */
    resetPosition() {
      this.resetActivePage()
    },
  },
}
</script>

<style lang="less" scoped>
.ant-modal-header {
  background-color: #1890ff !important;
}

.warpper {
  padding: 15px;
  display: flex;
  box-sizing: border-box;
  position: initial;
  height: 100%;
  overflow-y: auto;

  .left {
    flex: 1;
    width: 0;
  }

  .right {
    min-width: 420px;
  }
}

.qr-code-icon {
  float: right;
  width: 10px;
  margin-top: -5px;
  margin-right: -9px;
  border-top-right-radius: 6px;
}

.qr-code-position {
  height: 195px !important;
}

.active {
  background-color: #1890ff;
  border: #1890ff 1px solid;
  color: white;

  .qr-code-icon {
    transform: translateX(-1000px);
    filter: drop-shadow(1000px 0 0 white);
  }
}

.inactive {
  background-color: white;
  color: black;
}

.aBox {
  border: 1px solid #e2dfdf;
  opacity: 0.9;
  position: relative;
  //img{
  //  opacity: 1;
  //}
}

.imgblok {
  position: absolute;
  border: 1px solid #c4b5c4;
  cursor: move;
  background-color: #fff;

  img {
    width: 100%;
    height: 100%;
  }
}

.valid-code {
  position: absolute;
  text-align: center;
  padding: 0 2px;
  cursor: move;
  user-select: none;
  background-color: #eee;
  white-space: nowrap;
}

.ant-form-item-label {
  width: 80px;
}

.preview-pdf {
  position: absolute;
  top: 0;
  left: 0;
  /* 如果需要与.aBox内容完全重合，可能需要设置宽度和高度 */
  width: 100%;
  height: 100%;
  z-index: -1000;
}

.loading-parent {
  display: flex;
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */
  height: 100%;
  /* 如果需要整个父元素的高度来确定垂直居中，则需要设置高度 */
}

.loading-child {
  margin-top: 10px;
  /* 这将给子元素添加上边距，但不影响居中效果 */
}
</style>
