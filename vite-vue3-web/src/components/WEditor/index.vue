<template>
  <div id="editor—wrapper">
    <div id="toolbar-container">
      <!-- 工具栏 -->
    </div>
    <div id="editor-container">
      <!-- 编辑器 -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref, shallowRef, onMounted, watch } from "vue"
import minioPutObject, { getMinioFuleUrlPub } from "@/utils/minio.config"
const props = defineProps({
  value: {
    type: String,
    default: ""
  }
})
const emit = defineEmits(["update:value"])
const valueHtml = ref("")
const isDev = process.env.NODE_ENV === "development"

onMounted(() => {
  initEditor()
})

watch(
  () => props.value,
  (val) => {
    valueHtml.value = val
    editor.value && editor.value.setHtml(val)
  }
)

const editor = shallowRef()
const toolbar = shallowRef()
const initEditor = () => {
  const E = (window as any).wangEditor
  const toolbarConfig = {
    excludeKeys: ["insertImage", "insertVideo"],
    insertkeys: {
      index: 22,
      keys: ["uploadAttachment"]
    }
  }

  const editorConfig = {
    placeholder: "请输入内容",
    onChange(editor: any) {
      let html = editor.getHtml()
      if (html === "<p><br></p>") {
        html = ""
      }
      emit("update:value", html)
    },
    hoverbarKeys: {
      attachment: {
        menuKeys: ["downloadAttachment"]
      },
      image: {
        menuKeys: []
      }
    },
    MENU_CONF: {
      uploadImage: {
        fieldName: "file",
        server: "/upload",
        async customUpload(file: File, insert: any) {
          const { url } = await minioPutObject(file)
          const href = getMinioFuleUrlPub(url)
          console.log(`output->isDev`, isDev)
          console.log(`output->href`, href)
          insert(href)
        }
      },
      uploadVideo: {
        fieldName: "file",
        server: "/upload",
        async customUpload(file: File, insert: any) {
          const { url } = await minioPutObject(file)
          const href = getMinioFuleUrlPub(url)
          insert(href)
        }
      }
    }
  }

  editor.value = E.createEditor({
    selector: "#editor-container",
    html: valueHtml.value,
    config: editorConfig,
    mode: "default"
  })

  toolbar.value = E.createToolbar({
    editor: editor.value,
    selector: "#toolbar-container",
    config: toolbarConfig,
    mode: "default" // or 'simple'
  })
}

// 组件销毁时，也及时销毁编辑器，重要！
onBeforeUnmount(() => {
  if (!editor.value) return
  editor.value.destroy()
})
</script>

<style scoped lang="less">
#editor—wrapper {
  border: 1px solid #ccc;
  z-index: 100;
  /* 按需定义 */
}

#toolbar-container {
  border-bottom: 1px solid #ccc;
}

#editor-container {
  height: 500px;
}
</style>
