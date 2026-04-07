<template>
  <FrameBox>
    <template #title>
      <FrameTitle>公司简介</FrameTitle>
    </template>
    <div class="company-profile">
      {{ data }}
    </div>
  </FrameBox>
</template>

<script setup lang="ts">
import { CompanyInfoDto, CompanyInfoType } from "@/api/smartCockpit.company.api"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { computed, inject, Ref } from "vue"

const companyData = inject("companyData") as Ref<CompanyInfoDto[]>

const data = computed(() => {
  const item = companyData.value.find((i) => i.type === CompanyInfoType.简介)
  return item?.name || ""
})
</script>

<style scoped lang="less">
.company-profile {
  padding-top: 0.8rem;
  font-size: 0.32rem;
  line-height: 0.62rem;
  height: 100%;
  overflow-y: auto;
  white-space: pre-wrap;
}
</style>
