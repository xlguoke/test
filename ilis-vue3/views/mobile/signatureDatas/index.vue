<!-- 路由地址：ilis2/rest/s-v/c?u=gfzx&p=52596675bc767 -->
<template>
  <div class="h-screen flex flex-col">
    <van-nav-bar :title="title" />

    <ValidPhone
      v-if="isValidPhone"
      :phone="encodePhone"
      @success="validSuccess"
    />

    <template v-else>
      <van-tabs v-model:active="activeTab" class="custom-shadow">
        <van-tab name="1" title="待签字"></van-tab>
        <van-tab name="2" title="已签字"></van-tab>
      </van-tabs>
      <div class="p-4 mb-[52px] flex-1 h-0 overflow-auto">
        <!-- 委托方签字列表 -->
        <ConsignDatas
          v-if="signSource === SIGNATURE_SOURCE.CONSIGN"
          ref="datasRef"
          :status="activeTab"
          :encode-phone="encodePhone"
        />
        <!-- 报告领取签字列表 -->
        <ReportDatas
          v-else-if="signSource === SIGNATURE_SOURCE.REPORT"
          ref="datasRef"
          :status="activeTab"
          :encode-phone="encodePhone"
        />
      </div>
      <div class="fixed bottom-0 left-0 px-4 py-2 w-full z-10 text-right custom-shadow bg-white">
        <van-button type="primary" size="small" class="min-w-16" @click="openSignature">
          {{ activeTab === '1' ? '签字' : '重新签字' }}
        </van-button>
      </div>
    </template>
  </div>
</template>

<script setup lang='ts'>
import ConsignDatas from './components/ConsignDatas.vue'
import ReportDatas from './components/ReportDatas.vue'
import ValidPhone from './components/ValidPhone.vue'
import { SIGNATURE_SOURCE, SIGNATURE_SOURCE_DICT } from '~/components/onlineSignature'

const activeTab = ref('1')
const title = ref('在线签字')
const signSource = ref<SIGNATURE_SOURCE>()
const unitCode = ref('')
const encodePhone = ref('')

/**
 * 初始化页面参数
 * 路由结构 ilis2/rest/s-v/{c}?u=gfzx&p=52596675bc767
 * c: 签字来源 c-委托 r-报告
 * u：单位编码
 * p：加密后的手机号
 */
const urlPathname = location.pathname.split('s-v/')[1]?.split('/') || []
const urlParam = new URLSearchParams(location.search)
const source = urlPathname[0]
unitCode.value = urlParam.get('u') || ''
encodePhone.value = urlParam.get('p') || ''

sessionStorage.setItem('unitCode', unitCode.value)
if (source) {
  for (const key in SIGNATURE_SOURCE) {
    const v = (SIGNATURE_SOURCE as any)[key]
    if (source === v) {
      signSource.value = v
      break
    }
  }
  title.value = SIGNATURE_SOURCE_DICT.getLabelByKey(source)
}

// 验证手机号
const isValidPhone = ref(true)
function validSuccess() {
  isValidPhone.value = false
}

// 打开签字弹窗
const datasRef = ref()
function openSignature() {
  datasRef.value.openSignature()
}
</script>

<style scoped>
.custom-shadow{
  box-shadow: 0 0 4px 0 rgba(0,0,0,.1);
}
</style>
