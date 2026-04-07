<template>
  <FrameBox>
    <template #title>
      <FrameTitle>仪器设备</FrameTitle>
    </template>

    <div class="pt-60 h-full equipment-wrap">
      <swiper
        class="h-full"
        :slides-per-view="6"
        :space-between="clacChartPx(24)"
        :pagination="{ clickable: true }"
        :autoplay="{
          delay: 5000,
          disableOnInteraction: false
        }"
        :modules="modules"
      >
        <swiper-slide v-for="(item, index) in data" :key="index">
          <div class="equipment-img" @click="onPreview(item)">
            <img :src="item.url" />
          </div>
          <p class="equipment-title">{{ item.name }}</p>
        </swiper-slide>
      </swiper>
    </div>

    <PreviewImage ref="previewImageRef" />
  </FrameBox>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue"
import { Pagination, Autoplay } from "swiper/modules"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { clacChartPx } from "@/utils/utils"
import "swiper/css"
import "swiper/css/pagination"
import { computed, inject, Ref, ref } from "vue"
import PreviewImage from "@/components/smartCockpit/PreviewImage.vue"
import { CompanyInfoDto, CompanyInfoType } from "@/api/smartCockpit.company.api"

const companyData = inject("companyData") as Ref<CompanyInfoDto[]>

const data = computed(() => {
  const list = companyData.value.filter((i) => i.type === CompanyInfoType.设备)

  return list.map((item) => ({
    name: item.name,
    url: item.fileUrl
  }))
})

const modules = ref([Pagination, Autoplay])

const previewImageRef = ref()

function onPreview(item) {
  previewImageRef.value.open({
    title: item.name,
    url: item.url
  })
}
</script>

<style scoped lang="less">
.equipment-wrap {
  .equipment-img {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #40e7d5;
    padding: 0.12rem;
    height: 4.3rem;

    img {
      max-width: 100%;
      max-height: 100%;
    }
  }

  .equipment-title {
    padding: 0.2rem 0.1rem 0 0.1rem;
    font-size: 0.28rem;
    line-height: 0.32rem;
    color: #fff;
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
