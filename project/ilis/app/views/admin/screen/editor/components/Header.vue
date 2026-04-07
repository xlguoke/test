<template>
  <div class=" w-full flex justify-between items-end p-3 mb-[10px] text-[#224059]">
    <div class="text-[30px] font-bold flex-1 overflow-hidden text-ellipsis whitespace-nowrap mr-3">
      {{ baseConfigFormState?.name }}
    </div>
    <div class="flex flex-col items-end">
      <div class="text-[24px] font-bold">
        {{ currentTime.slice(11, 16) }}
      </div>
      <div>
        <span class="mr-[12px]">{{ `${currentTime.slice(5, 7)}月${currentTime.slice(8, 10)}日` }}</span>
        <span>{{ getCurrentWeek() }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useScreenEditorStore } from '~/store/screenEditorStore'
import { EDateFormatType } from '~/utils/EDateFormatType'

const { baseConfigFormState } = toRefs(useScreenEditorStore())

const currentTime = ref(AnyDateTimeHelper.format(new Date(), EDateFormatType.YYYY_MM_DD_HH_MM_SS))

const timer = setInterval(() => {
  currentTime.value = AnyDateTimeHelper.format(new Date(), EDateFormatType.YYYY_MM_DD_HH_MM_SS)
}, 1000)

function getCurrentWeek() {
  const daysOfWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const today = new Date()
  const dayIndex = today.getDay()
  return daysOfWeek[dayIndex]
}

onUnmounted(() => {
  clearInterval(timer)
})
</script>
