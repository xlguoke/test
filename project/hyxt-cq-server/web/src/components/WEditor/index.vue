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
import minioPutObject, { getMinioFuleUrlPub } from "@/config/minio.config"
const props = defineProps(["value"])
const emit = defineEmits(["update:value"])
const valueHtml = ref("")

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
    onChange(editor) {
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
        async customUpload(file, insert) {
          const { url } = await minioPutObject(file)
          const href = getMinioFuleUrlPub(url)
          console.log(`output->href`, href)
          insert(href)
        }
      },
      uploadVideo: {
        fieldName: "file",
        server: "/upload",
        async customUpload(file, insert) {
          const { url } = await minioPutObject(file)
          const href = getMinioFuleUrlPub(url)
          insert(href)
        }
      },
      fontSize: {
        fontSizeList: [
          { name: "小五", value: "12px" },
          { name: "五号", value: "14px" },
          { name: "小四", value: "16px" },
          { name: "四号", value: "18px" },
          { name: "小三", value: "20px" },
          { name: "三号", value: "21px" },
          { name: "小二", value: "24px" },
          { name: "二号", value: "29px" },
          { name: "小一", value: "32px" },
          { name: "一号", value: "34px" },
          { name: "小初", value: "48px" },
          { name: "初号", value: "56px" },
          "12px",
          "13px",
          "14px",
          "15px",
          "16px",
          "18px",
          "20px",
          "22px",
          "24px",
          "29px",
          "32px",
          "40px",
          "48px"
        ]
      },
      fontFamily: {
        fontFamilyList: [
          "黑体",
          "仿宋",
          "楷体",
          "标楷体",
          "华文仿宋",
          "华文楷体",
          "宋体",
          "微软雅黑",
          "Arial",
          "Tahoma",
          "Verdana",
          "Times New Roman",
          "Courier New",
          { name: "方正小标宋体", value: "FZXiaoBiaoSong-B05S" },
          { name: "方正黑体", value: "FZHei-B01S" },
          { name: "方正楷体", value: "FZKai-Z03S" },
          { name: "方正仿宋", value: "FZFangSong-Z02S" }
        ]
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
