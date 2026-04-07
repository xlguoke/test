<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle>发展历程</FrameTitle>
    </template>
    <div class="overflow-x-auto h-full pt-52 px-18">
      <swiper
        class="h-full"
        :slides-per-view="data.length > 6 ? 6 : data.length"
        :autoplay="{
          delay: 5000,
          disableOnInteraction: false
        }"
        :modules="modules"
      >
        <swiper-slide v-for="item in data" :key="item.year">
          <div class="development-history-item">
            <div class="development-history-date">{{ item.year }}年</div>
            <div class="development-history-name">{{ item.theme }}</div>
            <div class="development-history-content">
              {{ item.remark }}
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </div>
  </FrameBox>
</template>

<script setup lang="ts">
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { Swiper, SwiperSlide } from "swiper/vue"
import { Autoplay } from "swiper/modules"
import { ref } from "vue"
import "swiper/css"
import "swiper/css/pagination"
import { CompanyHistoryDto, getCompanyHistory } from "@/api/smartCockpit.company.api"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"

const modules = ref([Autoplay])

const data = ref<CompanyHistoryDto[]>([])

const loading = ref(false)

useAutoRequestHooks({
  loading,
  api: getCompanyHistory,
  setData: (res) => {
    console.log(res)
    if (res.errCode === 0) {
      data.value = res.data
    }
  }
})
</script>

<style scoped lang="less">
.development-history-item {
  width: 100%;
  padding-right: 0.4rem;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
}

.development-history-date {
  color: #40e7d5;
  font-size: 0.64rem;
  font-weight: bold;
  line-height: 0.72rem;

  &::after {
    content: "";
    display: block;
    height: 0.04rem;
    background: #00a291;
    margin-top: 0.3rem;
    margin-bottom: 0.3rem;
    width: calc(100% + 0.4rem);
  }

  &::before {
    content: "";
    display: block;
    position: absolute;
    top: 0.92rem;
    left: 0;
    width: 0.24rem;
    height: 0.24rem;
    background: #40e7d5;
    border-radius: 50%;
  }
}

.development-history-name {
  color: #40e7d5;
  font-size: 0.44rem;
  line-height: 0.52rem;
  min-height: 1.04rem;
}

.development-history-content {
  font-size: 0.28rem;
  line-height: 0.44rem;
  color: #fff;
  flex: 1;
  height: 0;
  overflow-y: auto;
  margin-top: 0.1rem;
  padding-bottom: 0.32rem;
  white-space: pre-wrap;

  p {
    margin: 0;
    text-indent: 0.56rem;
  }
}

:deep(.swiper-pagination-bullet) {
  background: #00a291;
  width: 0.18rem;
  height: 0.18rem;

  &.swiper-pagination-bullet-active {
    background: #40e7d5;
    width: 0.52rem;
    border-radius: 0.1rem;
  }
}
</style>
