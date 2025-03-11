<template>
  <van-uploader
    v-model="files"
    :max-size="maxSize"
    multiple
    :after-read="afterRead"
    @oversize="oversize"
    @delete="deleteFile"
  />
</template>

<script setup lang='ts'>
import { fileUploadNoLogin } from '../api'

const props = defineProps({
  fileList: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
})

const emits = defineEmits(['change'])

const maxSize = 50 * 1024 * 1024
const files = ref(props.fileList)

watch(() => props.fileList, (val) => {
  files.value = val
}, {
  immediate: true,
})

function oversize() {
  showNotify({ message: '附件大小不能超过50M', type: 'warning' })
}

async function afterRead(file: any) {
  if (Object.prototype.toString.call(file) === '[object Object]') {
    await uploadFile(file)
  }
  else {
    for (let i = 0; i < file.length; i++) {
      await uploadFile(file[i])
    }
  }
  emits('change', files.value.map(d => ({
    id: d.id,
    name: d.name,
    url: d.url,
  })))
}

async function uploadFile(file: any) {
  try {
    file.status = 'uploading'
    file.message = '上传中...'
    const formData = new FormData()
    formData.append('file', file.file)
    const { data } = await fileUploadNoLogin(formData)
    if (data.code === 21000) {
      file.status = 'success'
      file.message = '上传成功'
      file.url = data.data[0].realpath
      file.id = data.data[0].id
      file.name = file.file.name
    }
    else {
      file.status = 'fail'
      file.message = '上传失败'
    }
  }
  catch (err) {
    console.error(err)
    file.status = 'fail'
    file.message = '上传失败'
  }
}

function deleteFile(file: any) {
  files.value = files.value.filter(d => d.id !== file.id)
  emits('change', files.value)
}
</script>

<style>

</style>
