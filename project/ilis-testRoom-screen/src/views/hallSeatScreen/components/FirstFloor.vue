<template>
  <div id="firstFloor"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, defineEmits, defineProps } from "vue"
import { FirstFloor } from "./FirstFloor"
import { configItem } from "@/utils/3DScene/floor"

const emits = defineEmits(["on-click"])
const props = defineProps<{
  configList: configItem[]
}>()

let threejsInstance: FirstFloor

onMounted(() => {
  const dom = document.getElementById("firstFloor")

  if (dom) {
    threejsInstance = new FirstFloor({
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
#firstFloor {
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
