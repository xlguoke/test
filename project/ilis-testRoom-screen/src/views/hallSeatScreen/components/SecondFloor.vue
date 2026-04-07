<template>
  <div id="secondFloor"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, defineEmits } from "vue"
import { SecondFloor } from "./SecondFloor"
import { configItem } from "@/utils/3DScene/floor"

const emits = defineEmits(["on-click"])
const props = defineProps<{
  configList: configItem[]
}>()

let threejsInstance: SecondFloor

onMounted(() => {
  const dom = document.getElementById("secondFloor")
  if (dom) {
    threejsInstance = new SecondFloor({
      dom,
      configList: props.configList,
      onclick: (name) => {
        console.log(name)
        emits("on-click", name)
      }
    })
  }
})

onBeforeUnmount(() => {
  threejsInstance.removeEventListeners()
  threejsInstance._destroy()
})
</script>

<style lang="less" scoped>
#secondFloor {
  position: fixed;
  top: 0;
  left: 130px;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  transition: all 0.5s;

  &.close {
    transform: translateX(-360px);
  }
}
</style>
