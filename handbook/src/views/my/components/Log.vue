<script setup lang="ts">
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { readLog } from 'custodian'

const items = ref<string[]>([])
const route = useRoute()

readLog(route.params.name as string).then((content) => {
  items.value = content.split('\n')
})
</script>

<template>
  <DynamicScroller
    :items="items"
    :min-item-size="54"
  >
    <template #default="{ item, index, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :data-index="index"
      >
        {{ item }}
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>

<style scoped lang="less">

</style>
