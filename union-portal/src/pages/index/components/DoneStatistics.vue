<script setup lang='ts'>
import { VisBulletLegend, VisDonut, VisSingleContainer, VisTooltip } from '@unovis/vue'
import { BulletShape, Donut } from '@unovis/ts'
import Card from '@/components/Card.vue'
import useMyFetch from '@/composables/useMyFetch'

interface FetchData {
  id: string
  label: string
}

interface BulletLegendItemInterface {
  name: string | number
  color?: string
  inactive?: boolean
  hidden?: boolean
  pointer?: boolean
}

const { isFetching, data } = useMyFetch<FetchData[]>('/api/v1/todos/statistics')

const triggers = { [Donut.selectors.segment]: (d: any) => `${d.data.label}：${d.data.value}` }
const items: BulletLegendItemInterface[] = data.value
  ? data.value.map(d => ({ name: d.label, pointer: false, shape: BulletShape.Circle }))
  : []
</script>

<template>
  <Card title="已办统计" title-icon="icon-done-statistics.svg" :loading="isFetching" hide-more>
    <div class="h-full py-2 flex flex-col">
      <VisSingleContainer :data="data" class="flex-1 mb-3 h-0">
        <VisTooltip :triggers="triggers" />
        <VisDonut :value="(d:any) => d.value" />
      </VisSingleContainer>
      <VisBulletLegend :items="items" label-max-width="80px" />
    </div>
  </Card>
</template>

<style scoped>

</style>
