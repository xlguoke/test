<template>
  <div class="flex h-full gap-60">
    <div class="flex w-2720 flex-col gap-60">
      <!-- 公司简介 -->
      <CompanyProfile class="flex-[1.3] h-0" :loading="loading" />

      <div class="flex flex-1 gap-60 h-0">
        <!-- 资质证书 -->
        <Certificate class="flex-1 w-0" :loading="loading" />

        <!-- 荣誉奖励 -->
        <Honor class="flex-1 w-0" :loading="loading" />
      </div>
    </div>

    <FrameBox class="flex-1">
      <CompanyVideoArea />
    </FrameBox>

    <div class="flex w-2720 gap-60 w-0">
      <div class="flex flex-1 flex-col gap-60 w-full">
        <!-- 发展历程 -->
        <DevelopmentHistory class="flex-[1.3] h-0" />

        <!-- 仪器设备 -->
        <Equipment class="flex-1 h-0" :loading="loading" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CompanyProfile from "./CompanyProfile.vue"
import Certificate from "./Certificate.vue"
import Honor from "./Honor.vue"
import DevelopmentHistory from "./DevelopmentHistory.vue"
import Equipment from "./Equipment.vue"
import CompanyVideoArea from "../overviewNew/CompanyVideoArea.vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import { CompanyInfoDto, getCompanyInfo } from "@/api/smartCockpit.company.api"
import { provide, ref } from "vue"

const loading = ref(false)

const companyData = ref<CompanyInfoDto[]>([])

useAutoRequestHooks({
  loading,
  api: getCompanyInfo,
  setData: (res) => {
    if (res.errCode === 0) {
      companyData.value = res.data
    }
  }
})

provide("companyData", companyData)
</script>
