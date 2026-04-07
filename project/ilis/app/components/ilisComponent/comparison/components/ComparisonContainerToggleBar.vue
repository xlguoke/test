<!-- 收起展开控件 -->
<template>
  <div
    class="w-[28px] h-[58px] flex justify-center items-center rounded-[15px] bg-[var(--colorBgElevated)] cursor-pointer shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)] transition-all hover:bg-colorPrimary hover:text-white"
    @click="value = !value"
  >
    <CaretLeftOutlined class="text-[16px] transition-transform" :class="{ 'rotate-180': value }" />
  </div>
</template>

<script lang="ts" setup>
import { CaretLeftOutlined } from '@ant-design/icons-vue'

const value = defineModel<boolean>()
</script>
