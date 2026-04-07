<template>
  <van-tabs v-model:active="activeTab" shrink swipeable scrollspy>
    <template v-for="(d, i) in tabs" :key="d.key">
      <van-tab :title="d.title">
        <component
          :is="d.component"
          v-if="activeTab === i"
          :ref="(el) => setRefMap(el, d)"
          :data="d"
        ></component>
      </van-tab>
    </template>
  </van-tabs>
</template>

<script setup lang="ts">
import { TabDTO, useCustomTabs } from "../composables/useCustomTabs"

interface PropsDTO {
  staticTabs: TabDTO[]
}

const props = defineProps<PropsDTO>()
const { activeTab, tabs, setRefMap } = useCustomTabs(props.staticTabs)
</script>

<style lang="less">
@import "../style/tab.less";
</style>
