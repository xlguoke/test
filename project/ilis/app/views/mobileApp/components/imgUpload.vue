<template>
  <div>
    <van-uploader
      v-model="accessories"
      class="imgUploadder"
      :after-read="afterRead"
      :before-delete="deleteFile"
      image-fit="contain"
      capture="camera"
      preview-size="60px"
      :show-upload="!readonly"
      :deletable="!readonly"
    />
  </div>
</template>

<script>
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  props: ['foreignKey', 'foreignTable', 'accessoryType', 'readonly'],
  data() {
    return {
      accessories: [],
    }
  },
  watch: {
    foreignKey() {
      this.loadFile()
    },
    foreignTable() {
      this.loadFile()
    },
    accessoryType() {
      this.loadFile()
    },
  },
  created() {
    this.loadFile()
  },
  methods: {
    // 获取已选择的文件
    async afterRead(file) {
      file.status = 'uploading'
      file.message = '上传中...'

      const formData = new FormData()
      formData.append('foreignKey', this.foreignKey)
      formData.append('foreignTable', this.foreignTable)
      formData.append('accessoryType', this.accessoryType)
      formData.append('file', file.file)
      await mRequest.post(api.common.upload, formData)
      file.status = 'done'
      file.message = '上传成功'

      this.loadFile()
    },
    // 加载文件
    async loadFile() {
      const res = await mRequest.get(api.common.getFile, {
        params: {
          foreignKey: this.foreignKey,
          foreignTable: this.foreignTable,
          accessoryType: this.accessoryType,
        },
      })
      this.accessories = res.result.map(item => ({
        ...item,
        url: `/ilis2${item.url}`,
      }))
    },
    // 删除文件
    deleteFile(file) {
      showConfirmDialog({
        title: '提示',
        message: '确认删除吗',
      })
        .then(async () => {
          await mRequest.delete(api.common.deleteFile, {
            params: {
              id: file.id,
            },
          })
          await this.loadFile()
        })
        .catch(() => {})
    },
  },
}
</script>

<style lang="less" scoped>
.imgUploadder {
  :deep(.van-uploader__upload) {
    background: #ccc;
  }

  :deep(.van-icon-photograph) {
    color: #fff;
  }

  :deep(.van-image) {
    border: solid 3px #cccccc;
  }
}
</style>
