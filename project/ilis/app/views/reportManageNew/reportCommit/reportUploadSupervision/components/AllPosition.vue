<template>
  <ht-modal
    v-model:open="visible"
    title="批量设置防伪码"
    :confirm-loading="confirmLoading"
    width="950px"
    :destroy-on-close="true"
    :draggable="false"
    :body-style="bodyStyle"
    fixed-height
    class="all-position-modal"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="flex h-full">
      <div
        class="all-position-left h-full"
        :style="{
          height: `${activePage.height + 2}px`,
        }"
      >
        <ComHeader>报告文件</ComHeader>
        <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="false"
          row-key="reportId"
          :custom-row="customRow"
          :scroll="{ y: 200 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'action'">
              <a-button
                v-if="tableData.length > 1"
                type="link"
                style="color: red"
                @click="handleC(record)"
              >
                移除
              </a-button>
            </template>
          </template>
        </a-table>
        <p style="text-align: right; margin-top: 8px">
          共{{ tableData.length }}条数据
        </p>

        <ComHeader style="margin-top: 16px">
          页码设置
        </ComHeader>
        <div class="all-position-box">
          <div class="all-position-box-left">
            页码设置：
          </div>
          <div class="all-position-box-right">
            <a-select v-model:value="selecttype" @change="onChangeModel">
              <a-select-option value="GDYMSZ">
                固定页码设置
              </a-select-option>
              <a-select-option value="MYJSZ">
                每页均设置
              </a-select-option>
              <a-select-option value="SWYSZ">
                首尾页设置
              </a-select-option>
              <a-select-option value="JSYSZ">
                仅首页设置
              </a-select-option>
              <a-select-option value="JWYSZ">
                仅尾页设置
              </a-select-option>
            </a-select>
          </div>
        </div>
        <div v-if="selecttype === 'GDYMSZ'" class="all-position-box">
          <div class="all-position-box-left"></div>
          <div class="all-position-box-right">
            <a-input
              v-model:value="pageConfig"
              type="text"
              placeholder="请输入"
              @blur="onPageConfig"
            />
            <div style="padding: 6px 0; opacity: 0.5">
              多页码时，使用 |
              隔开，例：1|2|3；连续页码时可用-链接，例：1-5|7-10
            </div>
            <div style="color: red">
              设置页码时，请不要超过所选文件中页码最小值：{{ minNumber }}页
            </div>
          </div>
        </div>

        <template v-if="pageList.length > 0">
          <ComHeader style="margin-top: 16px">
            页码切换
          </ComHeader>
          <!-- 切换页码 -->
          <ul class="flex">
            <li
              v-for="item in pageList"
              :key="item.pageNumber"
              class="itemNumber"
              :class="{
                active: activePage.pageNumber === item.pageNumber,
              }"
              @click="chooseItemPage(item)"
            >
              {{ item.pageNumberText }}
              <img
                v-if="
                  settingConfig[item.settingConfigKey]
                    && settingConfig[item.settingConfigKey].hasQrCode
                "
                :src="qrSvg"
                class="qr-code-icon"
              />
              <img
                v-else
                :src="qrSvg"
                class="qr-code-icon empty"
              />
            </li>
          </ul>
        </template>

        <template v-if="IsShowSetting">
          <ComHeader style="margin-top: 16px">
            防伪码设置
          </ComHeader>
          <div class="all-position-box">
            <div class="all-position-box-left">
              缩放倍数：
            </div>
            <div class="all-position-box-right">
              <a-input-number
                v-model:value="activePage.zoomRatio"
                type="number"
                :min="0.5"
                :step="0.1"
                :max="activePage.width"
                :precision="1"
                @change="(e) => changeZoomRatio(e)"
              />
            </div>
          </div>
          <div style="padding: 6px 0 6px 68px; opacity: 0.5">
            参考缩放原点为图片左上角；建议缩放不小于0.5，否则会影响扫码识别
          </div>
          <div class="all-position-box">
            <div class="all-position-box-left">
              横向坐标：
            </div>
            <div class="all-position-box-right">
              <a-input-number
                v-model:value="activePage.imgLeft"
                type="number"
                :min="0"
                :precision="0"
                @change="(e) => numberChange(e, 'imgLeft')"
              />
              <span style="margin-left: 80px">纵向坐标：</span>
              <a-input-number
                v-model:value="activePage.imgTop"
                type="number"
                :min="0"
                :precision="0"
                @change="(e) => numberChange(e, 'imgTop')"
              />
            </div>
          </div>
          <div style="padding: 6px 0 6px 68px; opacity: 0.5">
            参考坐标原点为纸张左上角
          </div>
        </template>
      </div>
      <div class="all-position-right h-full">
        <div
          ref="aBox"
          class="all-position-pdf"
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
            class="all-position-imgblok"
            :style="`left:${activePage.imgLeft}px;
                top:${activePage.imgTop}px;
                width:${activePage.imgWidth}px;
                height:${activePage.imgHeight}px;`"
          >
            <img :src="imgSrc" />
          </div>
        </div>
      </div>
    </div>
  </ht-modal>
</template>

<script>
import ComHeader from '~/providers/components/comHeader/index.vue'
import Pdf2image from '~/providers/libs/pdf2image'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import image from './image'

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 60,
    align: 'center',
  },
  {
    title: '报告编号',
    dataIndex: 'reportNumber',
    key: 'reportNumber',
  },
  {
    title: '报告文件',
    dataIndex: 'reportFileName',
    key: 'reportFileName',
  },
  {
    title: '操作',
    width: 80,
    align: 'center',
    scopedSlots: { customRender: 'action' },
  },
]
export default {
  components: {
    ComHeader,
  },
  emits: ['on-save'],
  data() {
    return {
      qrSvg: new URL('/assets/img/qr_icon.svg', import.meta.url).href,
      visible: false,
      columns,
      tableData: [],
      dragimg: null,
      qrSize: 80, // 二维码默认大小
      aOffsetTop: 0, //  A4纸的偏移
      aOffsetLeft: 0, //  A4纸的偏移
      reportId: '',
      customRow: (record) => {
        return {
          style: {
            // 背景颜色
            'background-color':
              this.reportId === record.reportId ? 'rgb(0, 180, 237,0.1)' : '',
          },
          onClick: () => {
            this.reportId = record.reportId
            this.getDbFiles()
          },
        }
      },
      selecttype: 'MYJSZ',
      pageConfig: '',
      minNumber: 0,
      pdfViewer: null,
      currentPdfFile: {},
      pdfCompleted: false,
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
        zoomRatio: 1,
        pageNumber: -1, //  当前页码
      },
      bodyStyle: {
        height: '639px',
        overflow: 'hidden',
        overflowY: 'hidden',
      },
      pageConfigNumber: [],
      imgSrc: image.qrCode,
      regulatoryConfig: {},
      confirmLoading: false,
      settingConfig: {},
    }
  },
  computed: {
    IsShowSetting() {
      const { selecttype, pageList, pdfCompleted } = this

      if (!pdfCompleted) {
        return false
      }

      if (selecttype === 'GDYMSZ') {
        return pageList.length > 0
      }

      return true
    },
    pageList() {
      const { allPageList, pageConfigNumber, selecttype, settingConfig } = this

      if (selecttype === 'GDYMSZ') {
        return allPageList
          .filter(i => pageConfigNumber.includes(i.pageNumber))
          .map(i => ({
            ...i,
            hasQrCode: settingConfig[i.settingConfigKey]
              ? settingConfig[i.settingConfigKey].hasQrCode
              : i.hasQrCode,
          }))
      }

      if (selecttype === 'SWYSZ') {
        return this.headTailPageList.map(i => ({
          ...i,
          hasQrCode: settingConfig[i.settingConfigKey]
            ? settingConfig[i.settingConfigKey].hasQrCode
            : i.hasQrCode,
        }))
      }

      return []
    },
    allPageList() {
      const { currentPdfFile } = this
      const pagination = currentPdfFile.pagination || []
      pagination.sort((a, b) => a.pageNumber - b.pageNumber)
      return pagination.map(i => ({
        ...i,
        pageNumberText: i.pageNumber,
      }))
    },
    headTailPageList() {
      const allPageList = this.allPageList

      if (allPageList.length === 0) {
        return []
      }

      const headPage = allPageList[0]
      const tailPage = allPageList[allPageList.length - 1]

      if (headPage === tailPage) {
        return [
          {
            ...headPage,
            pageNumberText: '首页',
          },
        ]
      }

      return [
        {
          ...headPage,
          pageNumberText: '首页',
        },
        {
          ...tailPage,
          pageNumberText: '尾页',
        },
      ]
    },
  },
  watch: {
    activePage: {
      handler() {
        const { activePage } = this

        if (activePage.imgTop === 0 && activePage.imgLeft === 0) {
          activePage.hasQrCode = false
        }
        else {
          activePage.hasQrCode = true
        }

        this.settingConfig[activePage.settingConfigKey] = { ...this.activePage }
        window.$oForceUpdate()
      },
      deep: true,
    },
  },
  methods: {
    // 页码设置
    onPageConfig() {
      const { pageConfig, minNumber } = this
      const pageNumber = []

      try {
        const groupArr = pageConfig.split('|')

        for (let i = 0; i < groupArr.length; i++) {
          const groupArrItem = groupArr[i]
          const pageArr = groupArrItem.split('-')
          pageArr.sort((a, b) => a - b)
          const startPage = Number(pageArr[0])
          const endPage = Number(pageArr[pageArr.length - 1])
          const len = endPage - startPage

          // 防止测试乱搞
          if (
            pageConfig.includes('.')
            // eslint-disable-next-line unicorn/prefer-number-properties
            || isNaN(startPage)
            // eslint-disable-next-line unicorn/prefer-number-properties
            || isNaN(endPage)
            || pageArr.length > 2
            || startPage <= 0
          ) {
            this.pageConfig = ''
            window.$oAntdModal.warning({ content: '请按照示例的格式输入' })
            this.pageConfigNumber = []
            return
          }

          if (endPage > minNumber) {
            this.pageConfig = ''
            window.$oAntdModal.warning({
              title: '页码设置超过最小值！',
              content: `您设置的页码${endPage}，已超过所选文件页码最小值${minNumber}，请重新设置！`,
            })
            this.pageConfigNumber = []
            return
          }

          if (startPage === endPage) {
            pageNumber.push(startPage)
          }
          else {
            for (let j = 0; j <= len; j++) {
              const num = startPage + j
              if (!pageNumber.includes(num)) {
                pageNumber.push(num)
              }
            }
          }
        }

        pageNumber.sort((a, b) => a - b)
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
        this.pageConfig = ''
        window.$oAntdModal.warning({ content: '请按照示例的格式输入' })
      }

      this.pageConfigNumber = pageNumber

      if (this.pageList.length > 0) {
        this.chooseItemPage(this.pageList[0])
      }
    },
    handleOk() {
      this.getSubmitData((formData) => {
        this.confirmLoading = true
        window.$oAjax
          .post('/rest/report/security-code-affix/batch', formData, {
            headers: { 'content-type': 'application/json' },
          })
          .then((res) => {
            this.confirmLoading = false
            if (res.code === 21000) {
              window.$oAntdMessage.success({ content: '操作完成！', duration: 2 })
              $emit(this, 'on-save')
              this.handleCancel()
            }
            else {
              window.$oAntdMessage.error({ content: res.msg, duration: 5 })
              window.$oAntdModal.warning({
                title: '提示',
                content: res.msg,
              })
            }
          })
          .catch(() => {
            this.confirmLoading = false
          })
      })
    },
    // 组装提交数据并验证
    getSubmitData(cb) {
      const {
        selecttype,
        pageList,
        activePage,
        tableData,
        regulatoryConfig,
        settingConfig,
      } = this
      const reportIds = tableData.map(i => i.reportId)

      const formData = {
        regulatoryId: regulatoryConfig.regulatoryId,
        page: null,
        reportIds,
        fileInfo: {
          hasQrCode: true,
          pagination: [],
        },
      }

      let title = '提示'
      let content = ''

      if (!this.pdfCompleted) {
        window.$oAntdModal.warning({
          title: '提示',
          content: '文件未加载完成',
        })
        return
      }

      // 固定页码设置
      if (selecttype === 'GDYMSZ') {
        if (!this.pageConfig) {
          window.$oAntdModal.warning({
            title: '提示',
            content: '请输入固定页码设置',
          })
          return
        }
        const pages = pageList.filter(
          i =>
            !settingConfig[i.settingConfigKey]
            || !settingConfig[i.settingConfigKey].hasQrCode,
        )
        if (pages.length > 0) {
          title = '存在未进行防伪码设置的页码！'
          content = `第${pages
            .map(i => i.pageNumber)
            .join('、')}页未进行防伪码设置，请确定是否继续？`
        }

        formData.fileInfo.pagination = this.getPageSetting()
      }

      // 每页均设置
      if (selecttype === 'MYJSZ') {
        if (!activePage.hasQrCode) {
          title = '存在未进行防伪码设置的页码！'
          content = `未进行防伪码设置，请确定是否继续？`
        }

        formData.page = 'full'
        formData.fileInfo.pagination.push(activePage)
      }

      // 首尾页设置
      if (selecttype === 'SWYSZ') {
        const pages = pageList.filter(
          i =>
            !settingConfig[i.settingConfigKey]
            || !settingConfig[i.settingConfigKey].hasQrCode,
        )
        if (pages.length > 0) {
          title = '存在未进行防伪码设置的页码！'
          content = `${pages
            .map(i => i.pageNumberText)
            .join('、')}未进行防伪码设置，请确定是否继续？`
        }

        formData.page = 'startAndEnd'
        formData.fileInfo.pagination.push(this.settingConfig['1'])
        formData.fileInfo.pagination.push(this.settingConfig['尾页'])
      }

      // 仅首页设置
      if (selecttype === 'JSYSZ') {
        if (!activePage.hasQrCode) {
          title = '存在未进行防伪码设置的页码！'
          content = `首页未进行防伪码设置，请确定是否继续？`
        }

        formData.page = 'start'
        formData.fileInfo.pagination.push(activePage)
      }

      // 仅尾页设置
      if (selecttype === 'JWYSZ') {
        if (!activePage.hasQrCode) {
          title = '存在未进行防伪码设置的页码！'
          content = `尾页未进行防伪码设置，请确定是否继续？`
        }

        formData.page = 'end'
        formData.fileInfo.pagination.push(activePage)
      }

      formData.fileInfo.pagination = formData.fileInfo.pagination.map(
        item => ({
          ...item,
          imgTop:
            (Number(item.height)
              - Number(item.imgTop)
              - Number(item.imgHeight))
            / 0.7,
          imgHeight: Number(item.imgHeight) / 0.7,
          imgWidth: Number(item.imgWidth) / 0.7,
          imgLeft: Number(item.imgLeft) / 0.7,
          hasQrCode: true,
        }),
      )

      if (content) {
        window.$oAntdConfirm({
          title,
          content,
          onOk() {
            cb(formData)
          },
        })
      }
      else {
        cb(formData)
      }
    },
    // 获取页码设置信息
    getPageSetting() {
      const { settingConfig, pageList } = this
      const result = []

      // eslint-disable-next-line array-callback-return
      pageList.map((i) => {
        const item = settingConfig[i.settingConfigKey]
        if (item) {
          result.push({
            ...item,
            hasQrCode: true,
          })
        }
        else {
          result.push({
            ...i,
            hasQrCode: true,
          })
        }
      })

      return result
    },
    handleCancel() {
      this.visible = false
      window.$oNextTick(() => {
        this.pageConfigNumber = []
        this.selecttype = 'MYJSZ'
        this.pageConfig = ''
        this.minNumber = 0
        this.pdfViewer = null
        this.currentPdfFile = {}
        this.settingConfig = {}
        this.pdfCompleted = false
        this.initActivePage()
      })
    },
    onChangeModel(val) {
      const { allPageList, pageList } = this

      if (val === 'JWYSZ') {
        this.chooseItemPage(allPageList[allPageList.length - 1])
      }
      else if (pageList.length > 0) {
        this.chooseItemPage(pageList[0])
      }
      else {
        this.chooseItemPage(allPageList[0])
      }
    },
    chooseItemPage(item) {
      if (item.pageNumber === this.activePage.pageNumber) {
        return
      }

      this.openPage(item)
    },
    showModel(tempData, regulatoryConfig) {
      this.regulatoryConfig = regulatoryConfig
      this.getList(tempData)
    },

    async getList(tempData) {
      this.visible = true
      const datas = tempData.filter((item, index) => {
        item.index = index + 1
        return item.fileNumber == 1
      })

      const sotrData = [...datas]
      // 注意这里的排序问题
      sotrData.sort((a, b) => a.pageNumber - b.pageNumber)

      this.tableData = datas || []
      this.minNumber = sotrData[0].pageNumber || 0
      this.pageNumber = this.tableData[0].pageNumber || 0
      this.reportId = this.tableData[0].reportId || ''

      this.getDbFiles()

      window.$oNextTick(() => {
        this.aOffsetTop = this.$refs.aBox.offsetTop
        this.aOffsetLeft = this.$refs.aBox.offsetLeft
        this.initDrapFun()
      })
    },
    // 删除
    handleC(row) {
      const reportId = row.reportId
      this.tableData = this.tableData.filter(i => i.reportId != reportId)
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
    // 拖拽逻辑处理
    dragHandle(x, y) {
      const self = this.activePage
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      function dropFun(e) {
        let left = e.pageX - x - _this.aOffsetLeft
        let top = e.pageY - y - _this.aOffsetTop
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
          _this.dragimg.ondrag = null
          document.removeEventListener('drop', dropFun)
        },
        false,
      )

      document.addEventListener('drop', dropFun, false)
    },
    getDbFiles() {
      window.$oAjax
        .get(`/rest/report/security-code-affix/${this.reportId}`)
        .then((res) => {
          if (res.success === false) {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg))
            return
          }

          const dbFiles = res.data
          dbFiles.forEach((it) => {
            it.pagination.sort((a, b) => a.pageNumber - b.pageNumber)

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
              item.imgWidth
                = (Number(item.imgWidth) / (item.zoomRatio || 1)) * 0.7
              item.imgHeight
                = (Number(item.imgHeight) / (item.zoomRatio || 1)) * 0.7
              item.hasQrCode = false
              item.imgLeft = 0
              item.imgTop = 0
              item.zoomRatio = 1
              item.settingConfigKey
                = item.pageNumber === it.pagination.length
                  ? '尾页'
                  : item.pageNumber
            })
          })

          if (!this.settingConfig['尾页']) {
            this.settingConfig['尾页'] = dbFiles[0].pagination.find(
              i => i.settingConfigKey == '尾页',
            )
          }

          if (!this.settingConfig['1']) {
            this.settingConfig['1'] = dbFiles[0].pagination.find(
              i => i.settingConfigKey == 1,
            )
          }

          if (dbFiles.length > 0) {
            this.currentPdfFile = dbFiles[0]
            this.openFile()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info('没有PDF文件'))
          }
        })
    },
    openFile() {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { currentPdfFile } = this

      this.initActivePage()
      this.pdfCompleted = false
      this.$refs.pdfContainer.innerHTML = ''
      // const onePage = currentPdfFile.pagination.find((it) => it.pageNumber === 1)
      // this.openPage(onePage)
      this.onChangeModel(this.selecttype)
    },
    openPage(file) {
      const { settingConfig, selecttype } = this

      if (
        selecttype === 'SWYSZ'
        && file.pageNumber == 1
        && file.settingConfigKey === '尾页'
      ) {
        const activePage = { ...settingConfig[file.pageNumber] }
        activePage.point = file.point
        activePage.pageNumber = file.pageNumber
        this.activePage = activePage
      }
      else if (
        selecttype === 'JWYSZ'
        && file.pageNumber == 1
        && file.settingConfigKey === '尾页'
      ) {
        const activePage = { ...settingConfig['尾页'] }
        activePage.point = file.point
        activePage.pageNumber = file.pageNumber
        this.activePage = activePage
      }
      else if (
        selecttype === 'JSYSZ'
        && file.pageNumber == 1
        && file.settingConfigKey === '尾页'
      ) {
        const activePage = { ...settingConfig['1'] }
        activePage.point = file.point
        activePage.pageNumber = file.pageNumber
        this.activePage = activePage
      }
      else if (file.settingConfigKey === '尾页' && settingConfig['尾页']) {
        const activePage = { ...settingConfig['尾页'] }
        activePage.point = file.point
        activePage.pageNumber = file.pageNumber
        this.activePage = activePage
      }
      else if (settingConfig[file.settingConfigKey]) {
        const activePage = { ...settingConfig[file.pageNumber] }
        activePage.point = file.point
        this.activePage = activePage
      }
      else {
        this.activePage = file
      }

      if (this.activePage.point === 'vertical') {
        this.activePage.width = 417
        this.activePage.height = 590
      }
      else {
        this.activePage.width = 590
        this.activePage.height = 417
      }

      this.loadPdfFile()
      // if (!this.pdfCompleted) {
      // }
      // else {
      //   this.pdfViewer.toPage(this.activePage.pageNumber)
      // }
    },
    loadPdfFile() {
      const { activePage, currentPdfFile } = this
      const pageNumber = activePage.pageNumber

      this.pdfViewer = new Pdf2image(
        currentPdfFile.filePath,
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
  },
}
</script>

<style lang="less" scoped>
.all-position-modal {
  .all-position-left {
    flex: 1;
    width: 0;
    overflow-y: auto;
    padding-right: 16px;
  }

  .all-position-right {
    width: 420px;
  }

  .all-position-box {
    margin-top: 8px;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
  }

  .all-position-box-left {
    width: 68px;
    text-align: right;
  }

  .all-position-box-right {
    flex: 1;

    & > .ant-select {
      width: 100%;
    }
  }

  .all-position-imgblok {
    position: absolute;
    border: 1px solid #c4b5c4;
    cursor: move;
    background-color: #fff;

    img {
      width: 100%;
      height: 100%;
    }
  }

  .loading-parent {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .loading-child {
    margin-top: 10px;
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

  .all-position-pdf {
    border: 1px solid #e2dfdf;
    opacity: 0.9;
    position: relative;
  }
}
.flex {
  display: flex;
  flex-wrap: wrap;
}
.qr-code-icon {
  width: 10px;
  border-top-right-radius: 6px;
  position: absolute;
  right: 1px;
  top: 1px;
  &.empty {
    filter: brightness(0.1);
    opacity: 0.4;
  }
}
.itemNumber {
  margin: 0 3px 6px 3px;
  text-align: center;
  line-height: 30px;
  border: 1px solid #ddd;
  cursor: pointer;
  border-radius: 1px;
  padding: 0 12px;
  position: relative;
  border-radius: 4px;
  &.active {
    background-color: #1890ff;
    color: #fff;

    .qr-code-icon {
      transform: translateX(-1000px);
      filter: drop-shadow(1000px 0 0 white);
    }
  }
}
</style>
