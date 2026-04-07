<!-- eslint-disable vue/require-v-for-key -->
<template>
  <span>
    <span
      v-for="file in variableFiles"
      class="file"
      @mouseenter="() => showDelete(file)"
      @mouseleave="() => hiddenDelete(file)"
    >
      <img
        v-if="imageFilter(file.url)"
        alt=""
        class="img"
        :src="file.url"
        :title="file.name"
        @click="handlePreview(file)"
      />
      <a v-else href="#" @click="downloadAccessory(file.attachmentId)">{{
        file.name
      }}</a>
      <a-button
        v-if="file.show"
        type="link"
        size="small"
        @click="() => deleteItem(file)"
      >删除</a-button>
    </span>

    <ht-modal :open="previewVisible" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </ht-modal>
  </span>
</template>

<script>
import { downloadAccessory } from '~/providers/common/utils.js'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

export default {
  name: 'FilePreview',
  props: {
    files: {
      required: true,
    },
    type: {
      type: Number,
      required: true,
    },
  },
  emits: ['delete'],
  data() {
    return {
      variableFiles: [],
      previewVisible: false,
      previewImage: '',
      show: false,
    }
  },
  watch: {
    files(value) {
      if (value) {
        this.variableFiles = value.filter(f => f.type === this.type)
      }
    },
  },
  created() {
    this.variableFiles = this.files
      ? this.files.filter(f => f.type === this.type)
      : null
  },
  methods: {
    downloadAccessory,
    imageFilter(url) {
      const suffix = url.substring(url.lastIndexOf('.') + 1, url.length)
      return (
        suffix === 'png'
        || suffix === 'jpeg'
        || suffix === 'bmp'
        || suffix === 'jpg'
        || suffix === 'image'
      )
    },
    handleCancel() {
      this.previewVisible = false
    },
    async handlePreview(file) {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj)
      }
      this.previewImage = file.url || file.preview
      this.previewVisible = true
    },

    showDelete(file) {
      file.show = true
    },
    hiddenDelete(file) {
      file.show = false
      delete file.show
    },
    deleteItem(file) {
      this.variableFiles = this.variableFiles.filter(f => f.id !== file.id)
      $emit(this, 'delete', this.variableFiles)
    },
  },
}
</script>

<style scoped>
.img {
  width: 20px;
  height: 32px;
}
.file {
  margin-right: 3px;
}
</style>
