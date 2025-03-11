<template>
  <AppProvider>
    <a-card
      class="h-full flex flex-col"
      :body-style="{ flex: 1, height: 0, padding: '16px' }"
    >
      <a-row :gutter="32" class="h-full">
        <a-col span="12">
          <SettingTable
            :data-source="standardList"
            :type="STANDARD_TYPE.STANDARD"
            :enable-clause-code="enableClauseCode"
            @on-select-standard="onSelectStandard"
          />
        </a-col>
        <a-col span="12">
          <SettingTable
            :data-source="basisList"
            :selected-standard-key="selectedStandardKey"
            :type="STANDARD_TYPE.BASIS"
            :enable-clause-code="enableClauseCode"
            @on-use2-other="onUse2Other"
          />
        </a-col>
      </a-row>
    </a-card>

    <UseToOtherStandard
      ref="useToOtherStandardRef"
      :data-source="use2DataSource"
    />
  </AppProvider>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import type { PropType } from 'vue'
import SettingTable from './SettingTable.vue'
import UseToOtherStandard from './UseToOtherStandard.vue'
import type { DataSource } from '~/views/unit-config/standard/api.ts'
import { STANDARD_TYPE } from '~/types/standard.ts'
import { getSampleParamStandard, saveSampleParamStandard } from '~/views/unit-config/standard/api.ts'
import type {
  SampleParamStandardItem,
  SaveSampleParamStandardEntity,
} from '~/views/unit-config/standard/interface/SampleParamStandard.ts'

const props = defineProps({
  sampleId: {
    type: String,
    default: '',
  },
  paramIds: {
    type: Array as PropType<string[]>,
    default: () => ([]),
  },
  enableClauseCode: {
    type: Boolean,
    default: false,
  },
})

const enableClauseCode = computed(() => props.enableClauseCode)

window.onSave = onSave

const pathParams = new URLSearchParams(location.search)

const useToOtherStandardRef = ref()

const standardList = ref<Array<{
  basis: SampleParamStandardItem[]
  standard: SampleParamStandardItem
}>>([])

const selectedStandardKey = ref<string>()

const loading = ref()

const sampleId = computed(() => {
  if (props.sampleId) {
    return props.sampleId
  }

  return pathParams.get('sampleId') || ''
})

const paramIds = computed(() => {
  if (props.paramIds && props.paramIds.length > 0) {
    return props.paramIds
  }

  const ids = pathParams.get('paramIds') || ''
  return ids.split(',')
})

const basisList = computed(() => {
  if (selectedStandardKey.value) {
    const item = standardList.value.find(i => i.uniqueKey === selectedStandardKey.value)
    if (item) {
      if (!item.children) {
        item.children = []
      }

      return item.children
    }
  }

  return []
})

const use2DataSource = computed(() => {
  return standardList.value.filter(i => i.uniqueKey !== selectedStandardKey.value)
})

// 初始化
init()

async function init() {
  loading.value = message.loading('加载中...', 0)
  const res = await getSampleParamStandard({
    sampleId: sampleId.value,
    paramIds: paramIds.value,
  }).finally(() => {
    loading.value()
    loading.value = null
  })

  const criteria = res.data.criteria

  standardList.value = criteria.map(i => ({
    ...i.standard.standard,
    selected: i.standard.selected,
    children: i.basis.map(j => ({
      ...j.standard,
      selected: j.selected,
    })),
  }))
}

function onSelectStandard(ids: string[]) {
  selectedStandardKey.value = ids[0]
}

async function onUse2Other(record: DataSource) {
  if (use2DataSource.value.length === 0) {
    message.warn('暂无其他评定标准数据，请添加后再操作！')
    return
  }

  const r: string[] | false = await useToOtherStandardRef.value.open()

  if (r === false) {
    return
  }

  standardList.value.forEach((item) => {
    if (r.includes(item.uniqueKey)) {
      if (!item.children) {
        item.children = []
      }

      const sameBasis = item.children.find(i => i.uniqueKey === record.uniqueKey)
      if (!sameBasis) {
        item.children.push({ ...record })
      }
    }
  })

  message.success('操作成功！')
}

async function onSave(cb) {
  if (loading.value) {
    return
  }

  const formData: SaveSampleParamStandardEntity = {
    sampleId: sampleId.value,
    paramIds: paramIds.value,
    criteria: standardList.value.map(i => ({
      standardId: i.id,
      selected: i.selected,
      clauseCode: i.clauseCode,
      basis: i.children.map(j => ({
        standardId: j.id,
        selected: j.selected,
        clauseCode: j.clauseCode,
      })),
    })),
  }

  loading.value = message.loading('保存中...', 0)
  await saveSampleParamStandard(formData).finally(() => {
    loading.value()
    loading.value = null
  })

  if (cb) {
    cb()
  }
}

defineExpose({
  onSave,
})
</script>
