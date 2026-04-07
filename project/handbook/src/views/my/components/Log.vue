<script setup lang="ts">
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { readLog } from 'custodian'
import NoData from '@/components/noData/index.vue'

const items = ref<string[]>([])
const route = useRoute()

readLog(route.params.name as string).then((content) => {
  items.value = content.split('\n')
})
</script>

<template>
  <div class="show-title-bar">
    <TitleBar :title="`${route.params.name}`" />
    <div class="pd">
      <DynamicScroller v-if="items.length > 0" :items="items" :min-item-size="54">
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
      <NoData v-else />
    </div>
  </div>
</template>

<style scoped lang="less"></style>
