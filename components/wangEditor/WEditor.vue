<template>
  <div class="w-editor" style="border: 1px solid #ccc">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :default-config="toolbarConfig"
      :mode="mode"
    />
    <Editor
      v-model="valueHtml"
      :style="`height: ${height}px; overflow-y: hidden;`"
      :default-config="editorConfig"
      :mode="mode"
      @on-created="handleCreated"
      @on-change="handleChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor } from '@wangeditor/core'
import { message } from 'ant-design-vue'

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  height: {
    type: Number,
    default: 300,
  },
})
const emit = defineEmits(['update:value'])
const valueHtml = ref('')
const editorRef = shallowRef()
const mode = 'default'

watch(
  () => props.value,
  (val) => {
    valueHtml.value = val || ''
  },
)

const toolbarConfig = {
  excludeKeys: ['insertImage', 'insertVideo', 'group-video', 'fullScreen', 'headerSelect', 'bold', 'fontFamily', 'codeBlock', 'insertLink', 'todo', 'emotion'],
  insertkeys: {
    index: 22,
    keys: ['uploadAttachment'],
  },
}
const editorConfig = {
  placeholder: props.placeholder || '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      allowedFileTypes: ['image/jpg', 'image/jpeg', 'image/png', 'image/bmp', 'image/svg', 'image/webp'],
      async customUpload(file: File, insert: (url: string) => void) {
        const filetype = '.jpg, .jpeg, .png, .bmp, .svg, .webp'
        const _type = getFileType(file.name)
        if (!filetype.includes(_type)) {
          message.warning(`只支持上传${filetype}格式文件`)
          return
        }
        if (file.size > 5 * 1024 * 1024) {
          return message.warning('文件大小不能超过5M')
        }

        const url = await uploadFile(file)
        insert(url)
      },
    },
  },
}

/**
 * ## 上传文件
 * @param file 文件对象
 */
async function uploadFile(file: File) {
  const { data } = await ilisAxios.postForm('uploadController.do?upload', { file })
  if (data.success && data.obj.length) {
    return data.obj[0].realpath
  }
  return ''
}

function getFileType(name: string) {
  if (!name)
    return ''
  const n = name.lastIndexOf('.')
  return name.substr(n).toLowerCase()
}

function handleCreated(editor: IDomEditor) {
  editorRef.value = editor // 记录 editor 实例，重要！
}

/**
 * ## 设置 table 表格边框样式
 */
function addTableBorder(html: string) {
  if (!html)
    return ''
  const paraser = new DOMParser()
  const doc = paraser.parseFromString(html, 'text/html')
  const tables = doc.getElementsByTagName('table')
  for (let i = 0; i < tables.length; i++) {
    tables[i].style.borderTop = '1px solid #ccc'
    tables[i].style.borderLeft = '1px solid #ccc'
    tables[i].style.lineHeight = '2em'
    // 获取表格中的所有th元素
    const ths = tables[i].getElementsByTagName('th')
    // 遍历所有的th元素并添加边框样式
    for (let j = 0; j < ths.length; j++) {
      ths[j].style.borderBottom = '1px solid #ccc'
      ths[j].style.borderRight = '1px solid #ccc'
      ths[j].style.backgroundColor = '#eee'
    }
    // 获取表格中的所有td元素
    const cells = tables[i].getElementsByTagName('td')
    // 遍历所有的td元素并添加边框样式
    for (let j = 0; j < cells.length; j++) {
      cells[j].style.borderBottom = '1px solid #ccc'
      cells[j].style.borderRight = '1px solid #ccc'
    }
  }
  return new XMLSerializer().serializeToString(doc)
}

function handleChange(editor: IDomEditor) {
  let html = editor.getHtml()
  if (html === '<p><br></p>' || html === '<p></p>') {
    html = ''
  }
  html = addTableBorder(html)
  emit('update:value', html)
}

// 组件销毁时，也及时销毁编辑器，重要！
onBeforeUnmount(() => {
  if (!editorRef.value)
    return
  editorRef.value.destroy()
})
</script>

<style>
/* 项目中h标签样式被全局覆盖，此处重新设置 */
.w-editor h1,
.w-editor h2,
.w-editor h3,
.w-editor h4,
.w-editor h5{
  font-weight: bold;
}
.w-editor h1{
  margin: 0.67em 0 !important;
  font-size: 2rem;
}
.w-editor h2{
  margin: 1.5em 0 !important;
  font-size: 1.5rem;
}
.w-editor h3{
  margin: 1rem 0 !important;
  font-size: 1.17rem;
}
.w-editor h4{
  margin: 1.33em 0 !important;
  font-size: 0.83rem;
}
.w-editor h5{
  margin: 1.67em 0 !important;
  font-size: 0.67rem;
}
</style>
