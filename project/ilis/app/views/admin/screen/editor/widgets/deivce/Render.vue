<template>
  <div
    class="w-full h-[40px] pl-3 leading-[38px] text-[#224059] font-bold text-xs"
    :style="`background: url(${block1}) 0 0/100% 100% no-repeat;`"
  >
    {{ widgetName }}
  </div>
</template>

<script lang="ts" setup>
defineProps({
  widgetName: {
    type: String,
    default: '设备管理',
  },
})

const block1 = new URL('~/views/admin/screen/editor/assets/image/block-custom.png', import.meta.url).href
</script>
