<template>
  <AppProvider>
    <ht-modal
      v-model:open="open"
      title="材料检测驾驶舱-生产商稳定性排行-默认样品指标"
      width="460px"
      :mask-closable="false"
      destroy-on-close
      centered
    >
      <div>
        当前默认数据：
        <template v-if="defaultInfo">
          <div>样品：{{ defaultInfo.testSampleDisplayName || '无' }}</div>
          <div>指标：{{ defaultInfo.dashboardDefaultIndicator || '无' }}</div>
        </template>
        <div v-else>
          无
        </div>
      </div>
      <a-divider />
      <a-form
        ref="formRef"
        :model="formState"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 20 }"
      >
        <a-form-item label="大类" name="bigCategoryId" :rules="[{ required: true, message: '大类为必选项！' }]">
          <a-tree-select
            v-model:value="formState.bigCategoryId"
            :tree-data="treeData"
            placeholder="请选择"
            tree-node-filter-prop="label"
            :field-names="{
              label: 'bigCategoryName',
              value: 'bigCategoryId',
            }"
            @select="getSampleTree"
          />
        </a-form-item>
        <a-form-item label="默认样品" name="testSampleId" :rules="[{ required: true, message: '默认样品为必选项！' }]">
          <a-tree-select
            v-model:value="formState.testSampleId"
            :disabled="!formState.bigCategoryId"
            :tree-data="sampleTreeData"
            placeholder="请选择"
            tree-node-filter-prop="label"
            :field-names="{
              label: 'text',
              value: 'id',
            }"
            @select="getIndicatorList"
          />
        </a-form-item>
        <a-form-item label="默认指标" name="indicator" :rules="[{ required: true, message: '默认指标为必选项！' }]">
          <a-select
            v-model:value="formState.indicator"
            placeholder="请选择"
            :disabled="!formState.testSampleId"
            :options="indicatorList"
          />
        </a-form-item>
      </a-form>

      <template #footer>
        <a-button @click="open = false">
          关闭
        </a-button>
        <a-button type="primary" :loading="submitLoading" @click="onSubmit">
          确定
        </a-button>
      </template>
    </ht-modal>
  </AppProvider>
</template>

<script setup lang='ts'>
import type { IOption } from '~/interface/IOption.ts'
import type { SampleTreeNode } from '~/views/consign/component/selectSampleParam/modules/UseTestSample.ts'
import { sampleApi } from '~/views/consign/component/selectSampleParam/api.ts'
import { getDashboardList } from '~/views/system/bigCategory/testScreenBigCategoryRange/api.ts'
import {
  getDashboardDefault,
  getIndicator,
  saveDashboardDefault,
} from '~/views/system/bigCategory/testScreenManufacturerParam/api.ts'

const open = ref(false)

const formRef = ref()

const submitLoading = ref(false)

const treeData = ref<any[]>([])

const sampleTreeData = ref<SampleTreeNode[]>([])

const indicatorList = ref<IOption[]>([])

const defaultInfo = ref()

const formState = ref({
  bigCategoryId: undefined,
  testSampleId: undefined,
  indicator: undefined,
})

async function initBigCategoryTree() {
  const res = await getDashboardList()
  treeData.value = res.data.sort((a, b) => a.dashboardOrderNum - b.dashboardOrderNum)
}

async function getSampleTree(bigCategoryId: string) {
  formState.value.testSampleId = undefined
  formState.value.indicator = undefined

  const res = await sampleApi({
    bigCategoryId,
  })

  sampleTreeData.value = res.data
}

async function getIndicatorList(id: string) {
  formState.value.indicator = undefined

  const res = await getIndicator(id, 'ALL')
  indicatorList.value = res.data.map((i: string) => ({
    label: i,
    value: i,
  }))
}

watch(open, (val) => {
  initBigCategoryTree()

  formState.value = {
    bigCategoryId: undefined,
    testSampleId: undefined,
    indicator: undefined,
  }

  if (val) {
    getDashboardDefault().then((res) => {
      defaultInfo.value = res.data
    })
  }
})

function onSubmit() {
  formRef.value.validateFields().then(async () => {
    submitLoading.value = true
    await saveDashboardDefault(formState.value.testSampleId, formState.value.indicator).finally(() => {
      submitLoading.value = false
    })

    open.value = false
  })
}

window.$testScreenManufacturerParam = {
  open: () => {
    open.value = true
  },
}
</script>
