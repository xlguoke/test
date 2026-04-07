<template>
  <IlisContainer app-id="consign-form-layout" :body-style="{ padding: '12px 16px 0' }">
    <BaseSpinWrapper :spinning="loading">
      <div>
        <a-alert v-if="industry?.name" :message="`领域：${industry.name}`" show-icon class="!mb-1" />
        <a-alert show-icon>
          <template #message>
            <span v-if="editLayout">注：附件以下的内容将在委托页面“更多委托信息”中展示；此界面配置后，本单位所有账号的委托界面均会更新！</span>
            <span v-else>标注蓝色的项可设置默认值，委托表单与综合试验表单共用一套默认值</span>
          </template>
        </a-alert>
      </div>

      <a-tabs v-model:active-key="tabKey" class="flex-1 h-0" @change="changeTabs">
        <template #rightExtra>
          <a-button type="text" class="!flex items-center" @click="editLayout = !editLayout">
            <img :src="layoutIcon" class="w-3 h-3 mr-1">
            {{ editLayout ? '关闭布局调整' : '布局调整' }}
          </a-button>
        </template>
        <a-tab-pane :key="LAYOUT_FORM_TYPE.CONSIGN" tab="委托表单">
          <DragLayout ref="consignLayout" :edit-layout="editLayout" :layout-configs="consignLayoutConfigs" />
        </a-tab-pane>
        <a-tab-pane :key="LAYOUT_FORM_TYPE.SYNTHESIS_CONSIGN" tab="综合试验表单">
          <DragLayout ref="testLayout" :edit-layout="editLayout" :layout-configs="synthesisConsigLayoutConfigs" />
        </a-tab-pane>
      </a-tabs>

      <div class="py-2 border-t">
        <a-flex justify="center" :gap="12">
          <template v-if="editLayout">
            <a-button @click="editLayout = false">
              取消
            </a-button>
          </template>
          <template v-else>
            <a-button @click="handleClear">
              清空默认值
            </a-button>
          </template>
          <a-button @click="handleDefault">
            还原为默认布局
          </a-button>
          <a-button @click="handleRestore">
            还原为上一次保存的布局
          </a-button>
          <a-button type="primary" @click="saveLayoutConfig">
            保存
          </a-button>
        </a-flex>
      </div>
    </BaseSpinWrapper>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { useUrlSearchParams } from '@vueuse/core'
import { message } from 'ant-design-vue'
import { saveLayoutConfigApi } from '~/api/consign/consign-form-layout'
import { LAYOUT_FORM_TYPE } from '~/api/consign/consign-form-layout/types'
import { useIndustryStore } from '~/store/industryStore'
import DragLayout from './components/DragLayout.vue'
import { useLayoutConfig } from './composables/useLayoutConfig'

const { industry, setIndustryId } = useIndustryStore()
const tabKey = ref(LAYOUT_FORM_TYPE.CONSIGN)
const editLayout = ref(false)
const consignLayout = ref<InstanceType<typeof DragLayout>>()
const testLayout = ref<InstanceType<typeof DragLayout>>()

/** 获取领域id */
const params = useUrlSearchParams()
const industryId = params.industryId as string
if (params.industryId) {
  setIndustryId(industryId)
}

const {
  loading,
  consignLayoutConfigs,
  synthesisConsigLayoutConfigs,
  initLayoutConfig,
  initDefaultLayout,
} = useLayoutConfig(industryId, true)

const layoutIcon = new URL('~/assets/img/icon-layout.svg', import.meta.url).href

function changeTabs(key: any) {
  initLayoutConfig(key)
}

onMounted(() => {
  initLayoutConfig(tabKey.value)
})

/** 还原为上次保存的默认值 */
function handleRestore() {
  initLayoutConfig(tabKey.value, true)
}

/** 还原为默认布局 */
function handleDefault() {
  initDefaultLayout(tabKey.value)
}

/** 清空默认值 */
function handleClear() {
  if (tabKey.value === LAYOUT_FORM_TYPE.CONSIGN)
    consignLayout.value?.clearLayoutValue()
  if (tabKey.value === LAYOUT_FORM_TYPE.SYNTHESIS_CONSIGN)
    testLayout.value?.clearLayoutValue()
}

async function saveLayoutConfig() {
  const data1 = consignLayout.value?.layoutDatas() || []
  const data2 = testLayout.value?.layoutDatas() || []

  try {
    loading.value = true
    await saveLayoutConfigApi({
      module: LAYOUT_FORM_TYPE.CONSIGN,
      layout: data1,
    })
    if (data2 && data2.length) {
      await saveLayoutConfigApi({
        module: LAYOUT_FORM_TYPE.SYNTHESIS_CONSIGN,
        layout: data2,
      })
    }
    message.success('保存成功')
    editLayout.value = false
    initLayoutConfig(tabKey.value, true)
  }
  finally {
    loading.value = false
  }
}
</script>

<style scoped>
:deep(.ant-tabs-content){
  height: 100%;
}
.ant-tabs-content > div{
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
