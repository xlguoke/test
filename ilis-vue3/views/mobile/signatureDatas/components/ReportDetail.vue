<template>
  <div>
    <van-popup v-model:show="visible" position="bottom">
      <div class="h-[80vh] flex flex-col">
        <van-nav-bar title="检测报告确认">
          <template #right>
            <van-icon name="cross" size="20" @click="visible = false" />
          </template>
        </van-nav-bar>
        <div class="flex-1 p-2 h-0 overflow-auto">
          <van-row class="text-xs border border-b-0">
            <template v-for="item in reportInfo" :key="item.columnKey">
              <van-col :span="8" class="text-center text-gray-600 border-b border-r">
                <p class="p-2 h-full flex items-center">
                  {{ item.columnName }}
                </p>
              </van-col>
              <van-col :span="16" class="border-b">
                <p class="p-2 h-full flex items-center">
                  {{ item.columnValue }}
                </p>
              </van-col>
            </template>
          </van-row>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang='ts'>
import { closeToast, showLoadingToast } from 'vant'
import type { ReportInfo } from '../api'
import { getReportInfo } from '../api'

const props = withDefaults(defineProps<{
  show: boolean
  reportId: string
}>(), {
  show: false,
  reportId: '',
})

const emits = defineEmits<{
  (e: 'update:show', val: boolean): void
}>()

const visible = ref(false)
watch(() => props.show, (val) => {
  if (!val)
    return
  visible.value = val
  getDetail()
})
watch(visible, (val) => {
  emits('update:show', val)
})

const reportInfo = ref<ReportInfo[]>([])
async function getDetail() {
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  try {
    const { data } = await getReportInfo(props.reportId)
    if (!data)
      return
    reportInfo.value = data
  }
  catch (err) {
    console.error(err)
  }
  closeToast()
}
</script>

<style>

</style>
