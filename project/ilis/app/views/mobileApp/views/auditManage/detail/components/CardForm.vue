<template>
  <div style="padding: 8px 16px">
    <div v-for="(rows, index) in data" :key="index" class="audit-detail-card">
      <div
        v-for="(rowData, rowIndex) in rows"
        :key="rowIndex"
        class="audit-detail-card-item"
      >
        <div class="audit-detail-card-label">
          {{ rowData.label }}：
        </div>
        <div v-if="rowData.fileList" class="audit-detail-card-value">
          <div v-for="(fItem, fIndex) in rowData.fileList" :key="fIndex">
            <a href="javascript:;" @click="handleFile(fItem)">{{
              fItem.name
            }}</a>
          </div>
        </div>
        <div
          v-else-if="rowData.fileId && rowData.fileKey"
          class="audit-detail-card-value"
        >
          <a href="javascript:;" @click="onLoadFiles(rowData)">查看附件</a>
        </div>
        <div
          v-else
          class="audit-detail-card-value"
          v-html="rowData.value || ''"
        ></div>
      </div>
    </div>

    <!-- 查看PDF -->
    <MobileCheckPDF ref="mobileCheckPDFRef" />
  </div>
</template>

<script>
import { showImagePreview } from 'vant'
import MobileCheckPDF from '~/views/mobileApp/components/MobileCheckPDF.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { downloadFile } from '~/views/mobileApp/provides/utils/downloadFile'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    MobileCheckPDF,
  },
  props: ['data'],
  data() {
    return {}
  },
  methods: {
    // 加载附件
    async onLoadFiles(item) {
      const toastLoading = showLoadingToast({ duration: 0, forbidClick: true })
      const { code, data } = await mRequest
        .get(api.common.getQrCodeLink(item.fileKey), {
          params: {
            businessId: item.fileId,
          },
        })
        .finally(() => {
          toastLoading.close()
        })

      if (code !== 20000) {
        return
      }

      const qrUrl = new URL(data)
      const qrKey = qrUrl.searchParams.get('key')

      const { code: fileCode, data: fileData } = await mRequest.get(
        api.common.getAttachmentByKey(qrKey),
      )
      if (fileCode !== 20000) {
        return
      }

      item.fileList = fileData || []

      this.$forceUpdate()
    },
    viewPDF() {
      this.$refs.mobileCheckPDFRef.open(this.pdfSrc, this.filename)
    },
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
    handleFile(row) {
      const fileType = row.fileType || this.getFileType(row.name)

      if (['JPG', 'JPEG', 'PNG'].includes(fileType)) {
        showImagePreview([row.url])
      }
      else if (fileType === 'PDF') {
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
.audit-detail-card {
  background: #fff;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 8px;
  .audit-detail-card-item {
    margin-top: 4px;
    display: flex;
    font-size: 12px;

    &:first-child {
      margin-top: 0;
    }
  }

  .audit-detail-card-label {
    color: #666;
  }

  .audit-detail-card-value {
    color: #333;
    flex: 1;
    text-align: right;
    word-break: break-all;
  }
}
</style>
