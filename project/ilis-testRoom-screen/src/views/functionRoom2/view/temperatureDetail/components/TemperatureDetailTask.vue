<template>
  <div>
    <CommonTitle>
      <template #icon>
        <img
          style="width: 100%; height: 100%"
          src="@/assets/images/functionRoom2/deviceIcon.png"
          alt=""
        />
      </template>
      定时设置
    </CommonTitle>
    <div class="deviceCard">
      <DeviceTempCard v-for="item in 6" :key="item"></DeviceTempCard>
    </div>
  </div>
</template>
<script lang="ts" setup>
import CommonTitle from "@/views/functionRoom2/components/CommonTitle.vue"
import DeviceTempCard from "./DeviceTempCard.vue"
</script>
<style lang="less" scoped>
.deviceCard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 0.3rem;
}
</style>
