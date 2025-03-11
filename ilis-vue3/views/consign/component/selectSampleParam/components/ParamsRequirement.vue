<template>
  <div class="h-[150px] border p-2">
    <a-row v-if="requirements" class="h-full">
      <a-col :span="images.length ? 16 : 24" class="h-full overflow-y-auto">
        <slot name="testQuantity"></slot>
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
            v-for="item in images"
            :key="item"
            class="r-image h-[132px] flex items-center justify-center"
            @click="checkRequirementImage(item)"
            v-html="item"
          ></div>
        </a-carousel>
      </a-col>
    </a-row>
    <a-empty v-else description="请选择样品以查看收样要求" class="mt-2" />
  </div>
</template>

<script setup lang='ts'>
import { LeftCircleFilled, RightCircleFilled } from '@ant-design/icons-vue'
import { useSampleRequirement } from '~/views/consign/component/selectSample/hooks/useSampleRequirement.ts'

const props = defineProps({
  sampleId: {
    type: String,
    default: '',
  },
  testItemIds: {
    type: String,
    default: '',
  },
})

const { requirements, images, initRequirements, checkRequirementImage } = useSampleRequirement()

watch(() => props.sampleId, () => {
  initRequirements(props.sampleId)
}, { immediate: true })

watch(() => props.testItemIds, () => {
  // initRequirements(props.sampleId, props.testItemIds)
})
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
