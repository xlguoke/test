<template>
  <div>
    <van-field
      v-for="(item, index) in showData"
      :key="index"
      v-model="item.value"
      input-align="right"
      readonly
      :label="item.label"
      type="textarea"
      autosize
      :rows="1"
    >
      <template v-if="(item.fileId && item.fileKey) || item.fileList" #input>
        <div>
          <p v-for="fileItem in item.fileList" :key="fileItem.attachmentId">
            <a href="javascript:;" @click="handleFile(fileItem)">{{
              fileItem.name
            }}</a>
          </p>
        </div>
      </template>
      <template v-else-if="item.imgUrl" #input>
        <img
          :src="item.imgUrl"
          style="max-width: 120px"
          @click="showImagePreview([item.imgUrl])"
        />
      </template>
    </van-field>

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
    return {
      pdfSrc: '',
      filename: '',
      showData: [],
      showImagePreview,
    }
  },
  watch: {
    data: {
      handler(data) {
        this.initData(data)
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // 对传入的数据做处理
    async initData(data) {
      const showData = []

      for (let i = 0; i < data.length; i++) {
        const item = { ...data[i] }

        if (item.fileId && item.fileKey) {
          item.fileList = await this.getFiles(item)
        }

        showData.push(item)
      }

      this.showData = showData
    },
    // 获取附件
    async getFiles(item) {
      const { code, data } = await mRequest.get(
        api.common.getQrCodeLink(item.fileKey),
        {
          params: {
            businessId: item.fileId,
          },
        },
      )

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

      return fileData || []
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
