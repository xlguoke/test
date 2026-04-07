<template>
  <HtModal
    v-model:open="visible"
    :title="`编辑领域配置 - ${param.name}`"
    width="80%"
    :closable="false"
    :confirm-loading="loading"
    :after-close="onClosed"
    fixed-height
    @ok="handleOk"
  >
    <a-tabs v-model:active-key="tabkeKey" class="h-full">
      <a-tab-pane :key="BUSINESS_SCOPE.COMMON" tab="通用字段">
        <ConfigDetail
          ref="commonRef"
          :entity="CommonConfigEntity"
          :industry-data="param"
          :module="BUSINESS_SCOPE.COMMON"
        />
      </a-tab-pane>
      <a-tab-pane :key="BUSINESS_SCOPE.MODULE" tab="业务模块">
        <ConfigDetail
          ref="moduleRef"
          :entity="CommonConfigEntity"
          :industry-data="param"
          :module="BUSINESS_SCOPE.MODULE"
        />
      </a-tab-pane>
      <a-tab-pane :key="BUSINESS_SCOPE.TERMINOLOGY" tab="领域术语">
        <ConfigDetail
          ref="termRef"
          :entity="CommonConfigEntity"
          :industry-data="param"
          :module="BUSINESS_SCOPE.TERMINOLOGY"
        />
      </a-tab-pane>
      <a-tab-pane :key="BUSINESS_SCOPE.CONSIGN" tab="委托布局属性配置">
        <div class="flex flex-col gap-2 h-full">
          <a-alert type="warning" message="该配置会影响委托详情功能，请勿随意修改" />
          <ConfigDetail
            ref="consignRef"
            class="flex-1 h-0"
            :entity="LayoutConfigEntity"
            :industry-data="param"
            :module="BUSINESS_SCOPE.CONSIGN"
          />
        </div>
      </a-tab-pane>
    </a-tabs>
  </HtModal>
</template>

<script lang="ts" setup>
import type { IndustryListEntity } from '../IndustryConfigEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { useIndustryStore } from '~/store/industryStore.ts'
import { saveFieldConfigApi } from '../api'
import { BUSINESS_SCOPE } from '../enum'
import { CommonConfigEntity, LayoutConfigEntity } from '../IndustryConfigEntity'
import ConfigDetail from './ConfigDetail.vue'

const props = defineProps<IDialogPropsParam<null, IndustryListEntity>>()

const { clearIndustryCache } = useIndustryStore()

const loading = ref(false)

const visible = ref(true)

const tabkeKey = ref(BUSINESS_SCOPE.COMMON)

const commonRef = ref()
const consignRef = ref()
const moduleRef = ref()
const termRef = ref()

async function handleOk() {
  try {
    loading.value = true
    const commonData = commonRef.value?.saveData() || []
    const consignData = consignRef.value?.saveData() || []
    const moduleData = moduleRef.value?.saveData() || []
    const termData = termRef.value?.saveData() || []

    // 将委单自定义布局的配置数据合并到通用字段
    const consginObj: any = {}
    for (let i = 0; i < consignData.length; i++) {
      const d = consignData[i]
      consginObj[d.fieldCode] = d
    }
    for (let i = 0; i < commonData.length; i++) {
      const d = commonData[i]
      const config = consginObj[d.fieldCode]
      if (config) {
        d.formType = config.formType
        d.dataFrom = config.dataFrom
        d.defaulted = config.defaulted
        d.required = config.required
        d.config = consginObj[d.fieldCode].config
      }
    }

    await saveFieldConfigApi([...commonData, ...moduleData, ...termData])
    message.success('操作成功！')
    clearIndustryCache()
    props.onConfirm(null)
    visible.value = false
  }
  catch (e) {
    console.error(e)
    loading.value = false
  }
}
</script>

<style scoped>
:deep(.ant-tabs-content),
:deep(.ant-tabs-tabpane){
  height: 100%;
}
</style>
