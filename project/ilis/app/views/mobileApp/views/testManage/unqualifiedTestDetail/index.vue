<template>
  <div class="equipmentDetail">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <van-collapse v-model="activeNames">
      <van-collapse-item title="不合格数据" name="0" icon="description">
        <div style="padding: 10px 16px; background: #fff">
          <div>{{ disqualificationParam }}</div>
          <div v-if="fileTree.length > 0" class="reportDetail-file">
            <div
              v-for="item in fileTree"
              :key="item.id"
              class="reportDetail-file-row"
            >
              <div
                class="reportDetail-file-icon"
                :style="`background: ${fileIconBgColor[item._fileType]}`"
                @click="handleFile(item)"
              >
                {{ item._fileType }}
              </div>
              <div class="reportDetail-file-info" @click="handleFile(item)">
                <div class="textOverflow2" style="font-size: 14px">
                  {{ item.name }}
                </div>
                <div style="font-size: 12px">
                  <span>{{ udrFileType[item.useType] }}</span>
                </div>
              </div>
              <div class="reportDetail-file-btn">
                <span v-if="udrPdfObj"></span>
                <van-loading
                  v-if="udrPdfObj[item.id] && udrPdfObj[item.id].loading"
                  type="spinner"
                  color="#1989fa"
                  size="24"
                />
                <van-button
                  v-if="
                    udrPdfObj[item.id]
                      && udrPdfObj[item.id].url
                      && !udrPdfObj[item.id].loading
                  "
                  size="small"
                  @click="convertUdr(item)"
                >
                  刷新UDR
                </van-button>
              </div>
            </div>
          </div>
          <div v-else>
            <van-empty description="无数据" />
          </div>
        </div>
      </van-collapse-item>
      <van-collapse-item
        title="检验结论"
        name="1"
        icon-prefix="iconfont"
        icon="useRecord"
      >
        <div v-if="conclusion" class="equipmentDetail-list">
          <div style="padding: 10px 16px; background: #fff">
            {{ conclusion }}
          </div>
        </div>
        <div v-else>
          <van-empty description="暂无数据" />
        </div>
      </van-collapse-item>
      <van-collapse-item
        title="更多信息"
        name="2"
        icon-prefix="iconfont"
        icon="more"
      >
        <div class="equipmentDetail-baseInfo">
          <van-field
            v-for="(item, index) in moreInfo"
            :key="index"
            v-model="equipmentData[item.field]"
            label-width="6em"
            readonly
            rows="1"
            autosize
            :label="item.name"
            type="textarea"
          />
        </div>
      </van-collapse-item>
    </van-collapse>

    <SelectUseRecord
      :id="id"
      v-model:value="selectUseRecordVisible"
      :list="useListBySelect"
    />

    <!-- 查看PDF -->
    <MobileCheckPDF ref="mobileCheckPDFRef" />
  </div>
</template>

<script>
import {
  showDialog,
  showImagePreview,
  showLoadingToast,
} from 'vant'
import MobileCheckPDF from '~/views/mobileApp/components/MobileCheckPDF.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { appConfig } from '~/views/mobileApp/provides/config/appConfig'
import { downloadFile } from '~/views/mobileApp/provides/utils/downloadFile'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import SelectUseRecord from '../components/selectUseRecord.vue'

export default {
  name: 'unqualifiedTestDetail',
  components: {
    SelectUseRecord,
    MobileTitleBar,
    MobileCheckPDF,
  },
  beforeRouteEnter(to, from, next) {
    if (from.name === 'unqualifiedTest') {
      const pageState = useAppPageStateStore().getPage(to.name)
      pageState.scrollTop = 0
      pageState.resetPage = true
    }
    next()
  },
  beforeRouteLeave(to, from, next) {
    if (from.name === 'unqualifiedTestDetail') {
      const pageState = useAppPageStateStore().getPage(from.name)
      pageState.scrollTop = document.documentElement.scrollTop || 0
    }
    next()
  },
  data() {
    return {
      formatDate,
      id: undefined,
      equipmentData: {},
      activeNames: ['0'],
      selectUseRecordVisible: false,
      moreInfo: [
        { name: '样品名称', field: 'sampleName' },
        { name: '工程部位/用途', field: 'projectPartAndUse' },
        { name: '样品编号', field: 'testObjectCode' },
        // { name: "任务编号wu", field: "managerName" },
        { name: '规格型号', field: 'sampleStandard' },
        { name: '委托单位', field: 'consignUnit' },
        { name: '工程项目', field: 'consignProject' },
        { name: '检测人员', field: 'testPerson' },
        { name: '检测时间', field: 'testDate' },
      ],
      // 检验结论
      conclusion: '',
      // 不合格检测参数及检测结果
      disqualificationParam: '',
      // 附件
      fileTree: [],
      udrFileType: {
        0: 'UDR录入模板',
        1: '报告文件',
        2: '记录文件',
        3: '附件',
        4: '首件报告',
        5: '历史报告文件',
      },
      udrPdfObj: {},
      folderObj: {},
      useListBySelect: [],
      pdfSrc: '',
      filename: '',
    }
  },
  computed: {
    fileIconBgColor() {
      return appConfig.fileIconBgColor
    },
  },
  async activated() {
    const pageState = useAppPageStateStore().getPage('unqualifiedTestDetail')
    const { scrollTop, resetPage } = pageState

    window.scrollTo(0, scrollTop || 0)

    if (resetPage === true || resetPage === undefined || resetPage === null) {
      this.resetPage()
      pageState.resetPage = false
    }
  },
  methods: {
    viewPDF() {
      this.$refs.mobileCheckPDFRef.open(this.pdfSrc, this.filename)
    },
    async resetPage() {
      const { taskId } = this.$route.params
      this.id = taskId
      this.udrPdfObj = {}
      this.activeNames = ['0']

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      await this.getDetailData().finally(() => {
        toast.close()
      })
    },
    handleFile(row) {
      if (
        row._fileType === 'JPG'
        || row._fileType === 'JPEG'
        || row._fileType === 'PNG'
      ) {
        showImagePreview([row.fileUrl])
      }
      else if (row._fileType === 'UDR') {
        this.getUdrPdf(row)
      }
      else if (row._fileType === 'PDF') {
        this.pdfSrc = row.fileUrl
        this.filename = row.name
        this.viewPDF()
      }
      else {
        downloadFile(row.fileUrl, row.name)
      }
    },
    async getDetailData() {
      const res = await mRequest.get(
        api.testManage.disqualificationDetail,
        {
          params: {
            taskId: this.id,
          },
        },
      )
      if (res.code === 20000) {
        if (res.data) {
          this.disqualificationParam = res.data.disqualificationParam
          this.conclusion = res.data.conclusion
          this.equipmentData = res.data
          this.reportId = res.data.reportId || ''
          if (res.data.fileTree && res.data.fileTree.length > 0) {
            this.fileTree = res.data.fileTree
              .filter(item => item.type === 'file' && item.useType !== '0')
              .map(item => ({
                ...item,
                _fileType: item.fileType
                  ? item.fileType.toLocaleUpperCase()
                  : this.getFileType(item.fileUrl),
              }))
          }
          else {
            this.fileTree = []
          }
        }
      }
    },
    // 获取附件的后缀名
    getFileType(name) {
      if (name) {
        const arr = name.split('.')
        const type = arr[arr.length - 1].toLocaleUpperCase()
        return type
      }
      else {
        return ''
      }
    },
    async convertUdr(row) {
      let fileType
      if (row.useType === '1') {
        fileType = 'report'
      }
      else if (row.useType === '2') {
        fileType = 'record'
      }
      else {
        return
      }

      this.udrPdfObj[row.id].loading = true
      this.$forceUpdate()

      const res = await mRequest.get(api.common.udrConvert, {
        params: {
          reportId: this.reportId,
          fileType,
        },
      })

      if (res) {
        if (res.code === 20000) {
          if (res.data) {
            this.udrPdfObj[row.id].url = res.data
            this.udrPdfObj[row.id].loading = false
            this.$forceUpdate()
            this.pdfSrc = res.data
            this.viewPDF()
          }
          else if (res.message) {
            setTimeout(() => {
              this.getUdrPdf(row, true)
            }, 2000)
          }
        }
        else if (res.code === 20010) {
          this.udrPdfObj[row.id].loading = false
          this.$forceUpdate()
          showDialog({ message: res.message || res.msg || '转换失败' })
        }
      }
    },
    async getUdrPdf(row, reconvert) {
      let fileType
      if (row.useType === '1') {
        fileType = 'report'
      }
      else if (row.useType === '2') {
        fileType = 'record'
      }
      else {
        return
      }

      if (this.udrPdfObj[row.id]) {
        if (reconvert !== true) {
          if (this.udrPdfObj[row.id].url) {
            this.pdfSrc = this.udrPdfObj[row.id].url
            this.viewPDF()
            return
          }
        }
        this.udrPdfObj[row.id].loading = true
      }
      else {
        this.udrPdfObj[row.id] = {
          loading: true,
        }
      }
      this.$forceUpdate()

      const res = await mRequest.get(api.common.udrPreview, {
        params: {
          reportId: this.reportId,
          fileType,
        },
      })
      if (res) {
        if (res.code === 20000) {
          if (res.data) {
            this.udrPdfObj[row.id].url = res.data
            this.udrPdfObj[row.id].loading = false
            this.$forceUpdate()
            this.pdfSrc = res.data
            this.viewPDF()
          }
          else if (res.message) {
            setTimeout(() => {
              this.getUdrPdf(row, reconvert)
            }, 2000)
          }
        }
        else if (res.code === 20010) {
          this.udrPdfObj[row.id].loading = false
          showDialog({ message: res.message || res.msg || '转换失败' })
          this.$forceUpdate()
        }
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
