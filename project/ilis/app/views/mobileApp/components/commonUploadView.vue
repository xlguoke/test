<template>
  <div v-if="fileList.length > 0" class="common-file">
    <div v-for="item in fileList" :key="item.id" class="common-file-row" @click="handleFile(item)">
      <div class="common-file-icon" :style="`background: ${fileIconBgColor[item._fileType]}`">
        {{ item._fileType }}
      </div>
      <div class="common-file-info">
        <div class="textOverflow name" style="font-size: 14px">
          {{ item.name }}
        </div>
        <div v-if="showDelete" style="padding:0 12px;height: 100%;" @click.stop="deleteFile(item)">
          <van-icon name="delete-o" color="red" size="20px" />
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <van-empty class="equipmentDetail-notData" :image="noDataIcon" description="暂无数据" />
  </div>

  <!-- 查看PDF -->
  <MobileCheckPDF ref="mobileCheckPDFRef" />
</template>

<script>
import { showImagePreview } from 'vant'
import MobileCheckPDF from '~/views/mobileApp/components/MobileCheckPDF.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { appConfig } from '~/views/mobileApp/provides/config/appConfig'
import { downloadFile } from '~/views/mobileApp/provides/utils/downloadFile'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  name: 'CommonUploadView',
  components: {
    MobileCheckPDF,
  },
  props: {
    type: { required: true, type: String },
    id: { required: true, type: String },
    showDelete: { type: Boolean, default: false },
  },
  data() {
    return {
      noDataIcon: new URL(`~/views/mobileApp/assets/notData.png`, import.meta.url).href,
      fileList: [],
    }
  },
  computed: {
    fileIconBgColor() {
      return appConfig.fileIconBgColor
    },
  },
  async created() {
    this.getFileList()
  },
  methods: {
    async getFileList() {
      const qrKey = await this.getQrKey(this.id, this.type)
      this.fileList = await this.getHistoryFile(qrKey)
    },
    async getQrKey(id, type) {
      const { code, data } = await mRequest.get(api.common.getQrCodeLink(type), {
        params: {
          businessId: id,
        },
      })
      if (code !== 20000) {
        return showFailToast(data.msg || data.message || '获取历史附件失败')
      }
      const qrUrl = new URL(data)
      const qrKey = qrUrl.searchParams.get('key')
      return qrKey
    },
    async getHistoryFile(qrKey) {
      const { code: fileCode, data: fileData } = await mRequest.get(api.common.getAttachmentByKey(qrKey))
      if (fileCode !== 20000) {
        return showFailToast(fileData.msg || fileData.message || '获取历史附件失败')
      }
      if (fileData.length) {
        fileData.forEach((item) => {
          item._fileType = this.getFileType(item.name)
        })
      }
      return fileData
    },
    async deleteFile(row) {
      showConfirmDialog({
        title: '提示',
        message: `确认删除附件: ${row.name}?`,
      })
        .then(async () => {
          // on confirm
          const { code } = await mRequest.delete(api.common.deleteAttachmentByKey(this.qrKey, row.attachmentId), {}, {
            methods: 'delete',
          })
          if (code === 20000) {
            showSuccessToast('删除成功')
            this.fileList = await this.getHistoryFile(this.qrKey)
          }
        })
        .catch(() => {
          // on cancel
        })
    },
    // 获取附件的后缀名
    getFileType(name) {
      if (name) {
        const arr = name.split('.')
        const type = arr[arr.length - 1].toLocaleUpperCase()
        return type
      }
      else {
        return 'other'
      }
    },
    viewPDF() {
      this.$refs.mobileCheckPDFRef.open(this.pdfSrc, this.filename)
    },
    handleFile(row) {
      if (
        row._fileType === 'JPG'
        || row._fileType === 'JPEG'
        || row._fileType === 'PNG'
      ) {
        showImagePreview([row.url])
      }
      else if (row._fileType === 'PDF') {
        this.pdfSrc = row.url
        this.filename = row.name
        this.viewPDF()
      }
      else {
        downloadFile(row.url, row.name)
      }
    },
  },
}
</script>

<style lang="less" scoped>
.common-file {
  margin: 8px 0;

  .common-file-row {
    padding: 8px 15px;
    background: #fff;
    border-top: 1px solid #ebedf0;
    display: flex;
    align-items: center;

    &:first-child {
      border-top: 0;
    }

    &::after {
      content: "";
      display: block;
      height: 1px;
      clear: both;
    }
  }

  .common-file-icon {
    float: left;
    width: 46px;
    height: 46px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    overflow: hidden;
    color: #fff;
    margin-right: 4px;
    font-size: 12px;
  }

  .common-file-info {
    overflow: hidden;
    padding-left: 8px;
    flex: 1;
    display: flex;
    align-items: center;

    .name {
      flex: 1;
      margin-right: 8px;
    }
  }
}

.equipmentDetail-notData {
  :deep(.van-empty__image) {
    width: 80px;
    height: auto;
  }
}

.textOverflow {
  word-break: break-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  flex: 1;
}
</style>
