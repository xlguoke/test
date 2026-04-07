<template>
  <div style="border: 1px solid #ccc">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="weditor"
      :default-config="toolbarConfig"
      :mode="mode"
    />
    <Editor
      v-model="html"
      style="height: 300px; overflow-y: auto"
      :default-config="editorConfig"
      :mode="mode"
      @on-created="onCreated"
    />
  </div>
</template>

<script>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import '@wangeditor/editor/dist/css/style.css'

export default {
  components: { Editor, Toolbar },
  props: ['value'],
  emits: ['update:value'],
  data() {
    // eslint-disable-next-line ts/no-this-alias
    const that = this
    return {
      weditor: null,
      html: '',
      toolbarConfig: {
        excludeKeys: [
          'insertImage',
          'insertVideo',
          'uploadVideo',
          'group-video',
          'fullScreen',
        ], // 隐藏菜单
        insertkeys: {
          index: 22,
          keys: ['uploadAttachment'],
        },
      },
      editorConfig: {
        placeholder: '请输入内容',
        hoverbarKeys: {
          attachment: {
            menuKeys: ['downloadAttachment'],
          },
          image: {
            menuKeys: [],
          },
        },
        MENU_CONF: {
          uploadImage: {
            allowedFileTypes: [
              'image/jpg',
              'image/jpeg',
              'image/png',
              'image/bmp',
              'image/svg',
              'image/webp',
            ],
            async customUpload(file, insert) {
              const filetype = '.jpg, .jpeg, .png, .bmp, .svg, .webp'
              const _type = that.getFileType(file.name)
              if (!filetype.includes(_type)) {
                that.$Message.warning(`只支持上传${filetype}格式文件`)
                return
              }
              if (file.size > 2 * 1024 * 1024) {
                return that.$Message.warning('文件大小不能超过2M')
              }
              const reader = new FileReader()
              reader.readAsDataURL(file)
              reader.onload = function () {
                insert(reader.result)
              }
            },
          },
        },
      },
      mode: 'default', // or 'simple'
    }
  },
  watch: {
    value: {
      handler(val) {
        this.html = val
      },
      immediate: true,

    },
    html(val) {
      if (val === '<p><br></p>') {
        val = ''
      }
      $emit(this, 'update:value', val)
    },
  },
  beforeUnmount() {
    const editor = this.weditor
    if (editor == null)
      return
    editor.destroy() // 组件销毁时，及时销毁编辑器
  },
  methods: {
    onCreated(editor) {
      this.weditor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
    },
    getFileType(name) {
      if (!name)
        return ''
      const n = name.lastIndexOf('.')
      return name.substr(n).toLowerCase()
    },
  },
}
</script>
