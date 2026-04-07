<template>
  <div class="function-room-modal">
    <a-spin v-if="loading" class="function-room-loading" size="large" />
    <div class="function-room-wrap">
      <iframe
        v-if="visible && href"
        :key="iframeKey"
        :src="href"
        width="100%"
        height="100%"
        frameborder="0"
      ></iframe>
      <div v-else class="tip">请检查功能室配置!</div>
      <CloseCircleOutlined @click="close" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineExpose, defineProps, defineEmits } from "vue"
import { CloseCircleOutlined } from "@ant-design/icons-vue"
import { configItem } from "@/utils/3DScene/floor"

const visible = ref(false)
const loading = ref(false)
const href = ref("")
const props = defineProps<{
  configList: configItem[]
}>()
const iframeKey = ref<string>()

const emits = defineEmits(["on-change-visible"])

const open = (name) => {
  const item = props.configList.find((i) => i.name == name)
  console.log("item", item)

  if (item) {
    if (iframeKey.value == item.id) {
      return
    }

    iframeKey.value = item.id
    loading.value = true
    href.value = replaceIframeUrl(`${item.url}&screenNo=${item.sn}`)
    visible.value = true
    console.log("visible", href.value)

    emits("on-change-visible", true)
    setTimeout(() => {
      loading.value = false
    }, 1500)
  }
}

const replaceIframeUrl = (url) => {
  if (url.indexOf("index.html") !== -1) {
    return url.replace("index.html", `index.html?functionRoomCheckId=${iframeKey.value}`)
  }

  if (url.indexOf("/#/") !== -1) {
    return url.replace("/#/", `/index.html?functionRoomCheckId=${iframeKey.value}#/`)
  }

  return url
}

const close = () => {
  iframeKey.value = ""
  loading.value = false
  visible.value = false
  emits("on-change-visible", false)
}

defineExpose({
  open
})
</script>

<style scoped lang="less">
.function-room-modal {
  width: 515px;
  height: 100%;
  padding: 22px 26px 0;
  box-sizing: border-box;
  // border: solid 1px #3752ff;
  border: 1px solid #032c6c;
  background: #091137;
  padding-bottom: 70px;
}

.function-room-wrap {
  border: solid 1px #128cff;
  height: 100%;
  .tip {
    width: 100%;
    height: 100%;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }
  .anticon {
    cursor: pointer;
    font-size: 28px;
    color: #1179e1;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 20px;
  }
}

.function-room-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
