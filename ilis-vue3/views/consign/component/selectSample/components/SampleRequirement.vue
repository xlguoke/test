<template>
  <div class="h-[192px]">
    <a-row v-if="requirements" class="h-full" :gutter="8">
      <a-col :span="images.length ? 16 : 24" class="h-full overflow-y-auto">
        <div v-html="requirements.text"></div>
      </a-col>
      <a-col v-if="images.length" span="8">
        <a-carousel arrows :autoplay="images.length > 1">
          <template #prevArrow>
            <div v-if="images.length > 1" class="custom-slick-arrow" style="left: 12px; z-index: 1">
              <LeftCircleFilled />
            </div>
          </template>
          <template #nextArrow>
            <div v-if="images.length > 1" class="custom-slick-arrow" style="right: 12px">
              <RightCircleFilled />
            </div>
          </template>
          <div
            v-for="item in requirements.images"
            :key="item"
            class="r-image h-[192px] flex items-center justify-center"
            @click="checkRequirementImage(item)"
            v-html="item"
          ></div>
        </a-carousel>
      </a-col>
    </a-row>
    <a-empty v-else description="请选择样品及参数" class="pt-8" />
  </div>
</template>

<script setup lang='ts'>
import { LeftCircleFilled, RightCircleFilled } from '@ant-design/icons-vue'
import { useSampleRequirement } from '../hooks/useSampleRequirement.ts'

const props = defineProps({
  sampleId: {
    type: String,
    required: true,
    default: null,
  },
  testItemIds: {
    type: String,
    required: true,
    default: null,
  },
})

const { requirements, images, initRequirements, checkRequirementImage } = useSampleRequirement()

watch(() => props.sampleId, () => {
  init()
}, { immediate: true })

watch(() => props.testItemIds, () => {
  init()
}, { immediate: true })

function init() {
  if (props.sampleId !== null && props.testItemIds !== null) {
    initRequirements(props.sampleId, props.testItemIds)
  }
}
</script>

<style lang="less" scoped>
:deep(.r-image) {
  display: flex!important;

  img {
    width: auto!important;
    height: auto!important;
    max-height: 100%;
    max-width: 100%;
  }
}

:deep(.slick-arrow.custom-slick-arrow) {
  width: 32px;
  height: 32px;
  font-size: 32px;
  color: #fff;
  transition: ease all 0.3s;
  opacity: 0.2;
  z-index: 1;
}
:deep(.slick-arrow.custom-slick-arrow:before) {
  display: none;
}
:deep(.slick-arrow.custom-slick-arrow:hover) {
  color: #fff;
  opacity: 0.8;
}
</style>
