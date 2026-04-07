<template>
  <div class="flex gap-1">
    <a-tooltip v-for="d in marks" :key="d.mark" placement="top">
      <template #title>
        {{ d.tip }}{{ d.isSign ? '已' : '未' }}签名
      </template>
      <span :class="`sign-status ${d.isSign ? 'finish' : ''}`">{{ d.mark }}</span>
    </a-tooltip>
  </div>
</template>

<script setup lang='ts'>
import { useIndustryStore } from '~/store/industryStore'

const props = defineProps<{
  status: string | null
}>()
const { getModuleConfig } = useIndustryStore()
const industryWitnessField = getModuleConfig('witnessInfo')

const marks = ref([
  { mark: '委', isSign: false, tip: '委托人' },
])

watch(() => props.status, (status) => {
  initSignStatusCeil(status)
}, {
  immediate: true,
})

function initSignStatusCeil(status?: string | null) {
  if (industryWitnessField?.selected) {
    marks.value.push({ mark: '建', isSign: false, tip: '建设单位见证人' })
    marks.value.push({ mark: '监', isSign: false, tip: '监理单位见证人' })
  }
  if (!status) {
    return
  }
  const arr = status ? status.split('') : []
  arr.forEach((v, i) => {
    marks.value[i].isSign = v === '0'
  })
}
</script>

<style scoped>
  .sign-status{
    display: inline-block;
    width: 18px;
    height: 18px;
    text-align: center;
    line-height: 18px;
    background-color: #999;
    color: #fff;
    font-size: 12px;
    border-radius: 4px;
    user-select: none;
  }
  .sign-status.finish{
    background-color: #0a500f;
  }
</style>
