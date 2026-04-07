<template>
  <van-dialog
    title="提示"
    show-cancel-button
    :confirm-button-disabled="value !== 100"
  >
    <div p16 text-14>
      <div mb16>
        出于风险考虑，请将滑块移动到最右侧控制设备关闭
      </div>
      <div pos-relative>
        <div
          class="pointer-events-none pos-absolute bottom-0 left-0 right-0 top-0 z-1 flex-x justify-center"
          :class="[value === 100 ? 'text-white' : '']"
        >
          {{ value === 100 ? '验证通过' : '' }}
        </div>
        <van-slider v-model="value" bar-height="24px" active-color="#7ac13d">
        </van-slider>
      </div>
    </div>
  </van-dialog>
</template>

<script lang="ts" setup>
const value = ref(0)
</script>

<style scoped>
:deep(.van-slider) {
  border-radius: 4px !important;
}
:deep(.van-slider__button) {
  border-radius: 4px !important;
}
</style>
