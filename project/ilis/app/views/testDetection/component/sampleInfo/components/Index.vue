<template>
  <a-spin :spinning="loading">
    <ht-drag class="py-2 overflow-hidden">
      <ht-drag-item :width="260">
        <SampleTree
          :unit-sample-id="testObject.testUnitTestSampleId"
          :disabled="disabled"
          @select="selectSample"
        />
      </ht-drag-item>
      <ht-drag-item>
        <!-- 样品信息 -->
        <SampleForm
          v-if="getModuleConfig('sampleInfo')?.selected"
          ref="sampleFormRef"
          :sample-info="sampleInfo"
          :param-ids="paramIds"
          :blind="blind"
          :disabled="disabled"
          @set-specification="specificationVisible = true"
        />
        <!-- 取样信息 -->
        <Sampling
          v-if="getModuleConfig('samplingInfo')?.selected"
          ref="samplingRef"
          :sampling-info="samplingInfo"
          :blind="blind"
          :disabled="disabled"
          class="mt-2"
        />
      </ht-drag-item>
      <ht-drag-item>
        <!-- 辅助信息 -->
        <OtherInfo
          v-if="getModuleConfig('sampleInfo')?.selected"
          ref="otherInfoRef"
          :blind="blind"
          :disabled="disabled"
          :datas="otherInfo"
          :is-init-sample="!isChangeSample"
        />
      </ht-drag-item>
    </ht-drag>

    <!-- 设置规格型号 -->
    <SpecificationModal
      ref="specificationModalRef"
      v-model:open="specificationVisible"
      :sample-id="sampleInfo.testUnitTestSampleId"
      :specifications="specificationConfig"
      :show-add-property="!disabled"
      :view="specificationView"
      :force-render="specificationView === VIEW_TYPE.ADD"
      @after-render="afterRenderSpecification"
      @add-property="addProperty"
      @ok="onSaveSpecification"
    />
  </a-spin>
</template>

<script setup lang='ts'>
import type { TestObjectData } from '..'
import type { LocalSpecifications } from './OtherInfo.vue'
import type { SampleTreeNode } from './SampleTree.vue'
import type { Specifications, SpecificationsInfo } from '~/views/consign/component/selectSpecification'
import { cloneDeep } from '@unovis/ts'
import dayjs from 'dayjs'
import { useIndustryStore } from '~/store/industryStore'
import { compatibilityOldMetaData } from '~/views/consign/component/selectSample/utils/oldMetaDataSpecification'
import { SpecificationModal, VIEW_TYPE } from '~/views/consign/component/selectSpecification'
import { mergeMetaSpecifications } from '~/views/consign/component/selectSpecification/modules/mergeSpecifications'
import { getConsignMetaDataAttribuite, getTaskTestObject, getTestOtherInfo } from '../api'
import OtherInfo from './OtherInfo.vue'
import SampleForm from './SampleForm.vue'
import SampleTree from './SampleTree.vue'
import Sampling from './Sampling.vue'

interface PropsType {
  /** 任务id */
  taskId: string
  /** 是否盲样 */
  blind?: boolean
  /** 是否禁用：详情模式 */
  disabled?: boolean
}

const props = defineProps<PropsType>()
const { taskId, blind, disabled } = toRefs(props)

const { getModuleConfig } = useIndustryStore()

const sampleFormRef = ref()
const samplingRef = ref()
const otherInfoRef = ref()
let editSampleId = ''

const loading = ref(false)
// 最初始的数据
const testObject: any = ref<TestObjectData>({})
// 编辑过后的初始数据
const formData: any = ref<TestObjectData>({})
/** 样品信息 */
const sampleInfo: any = computed(() => {
  const obj = formData.value
  return {
    testObjectCode: obj.testObjectCode,
    systemTestSampleId: obj.systemTestSampleId,
    testUnitTestSampleId: obj.testUnitTestSampleId || '',
    testSampleDisplayName: obj.testSampleDisplayName,
    standard: obj.standard,
    specification: obj.specification,
    testPart: obj.testPart,
    projectPartAndUse: obj.projectPartAndUse,
    description: obj.description,
    sampleNum: obj.sampleNum,
    delegatesNum: obj.delegatesNum,
    remark: obj.remark,
    sampleAmount: obj.sampleAmount,
  }
})
/** 是否切换了样品 */
const isChangeSample = computed(() => editSampleId !== sampleInfo.value.testUnitTestSampleId)
/** 参数id */
const paramIds = computed(() => {
  return testObject.value.testObjectParams?.map((d: any) => d.testParamId)
})
/** 取样信息 */
const samplingInfo = computed(() => {
  const obj = formData.value
  return {
    samplingPlace: obj.samplingPlace || '',
    samplingDate: obj.samplingDate || '',
    samplingCompany: obj.samplingCompany || '',
    samplingPerson: obj.samplingPerson || '',
    samplingPersonNumber: obj.samplingPersonNumber || '',
  }
})
/** 辅助信息 */
const otherInfo = ref<LocalSpecifications[]>([])
const specificationView = ref(disabled.value ? VIEW_TYPE.DETAIL : VIEW_TYPE.EDIT)
const specificationConfig = ref<Specifications[]>([])

async function initData() {
  try {
    loading.value = true
    await getTaskTestObjectData()
    await getOtherInfo()
  }
  finally {
    loading.value = false
  }
}

/** 获取检测对象 */
async function getTaskTestObjectData() {
  const { data } = await getTaskTestObject(taskId.value)
  const obj = data && data.length ? data[0] : {}
  obj.samplingDate = obj.samplingDate ? dayjs(obj.samplingDate).format('YYYY-MM-DD') : ''
  testObject.value = obj
  formData.value = cloneDeep(obj)
  editSampleId = obj.testUnitTestSampleId
}

/** 选择样品 */
async function selectSample(data: SampleTreeNode) {
  loading.value = true
  const sampleForm = sampleFormRef.value.saveData()
  if (editSampleId !== data.id) {
    // 切换样品时，保留已输入的值
    for (const k in sampleInfo.value) {
      formData.value[k] = sampleForm[k] || ''
    }
  }
  else {
    // 切换成原样品，恢复初始值
    for (const k in sampleInfo.value) {
      formData.value[k] = testObject.value[k] || ''
    }
  }

  formData.value.testUnitTestSampleId = data.id || ''
  formData.value.systemTestSampleId = data.attributes.systemId
  formData.value.description = data.attributes.description || sampleForm.description
  formData.value.testSampleDisplayName = data.attributes.displayName || data.text

  await getOtherInfo()
  loading.value = false
}

/** 获取辅助信息 */
async function getOtherInfo() {
  // 查看
  if (disabled.value) {
    otherInfo.value = formatOtherInfos(formData.value.testObjectOtherInfos || [])
  }
  // 编辑
  else {
    const { data } = await getTestOtherInfo({
      sampleId: sampleInfo.value.testUnitTestSampleId || '',
      testObjectId: formData.value.id,
    })
    const list = data.obj || []
    otherInfo.value = formatOtherInfos(list)
  }
  const newSpec = otherInfo.value.filter(d => d.isJoinSpecification)
  if (isChangeSample.value) {
    specificationView.value = VIEW_TYPE.ADD
    specificationConfig.value = newSpec
  }
  else {
    // 查看详情时，无需处理数据，直接展示元数据保存的值
    const metaSpec = await getMetaSpecification()
    if (disabled.value) {
      specificationConfig.value = metaSpec
    }
    else {
      specificationConfig.value = await mergeMetaSpecifications(newSpec, metaSpec)
    }
  }
}

function nameKey(d: Specifications) {
  return d.displayName + d.systemFieldName
}

/**
 * ## 编辑样品时，将接口返回的收样辅助信息转为本地使用数据，添加盲样标识并去重
 * ## 查看样品时，处理盲样信息并去重
 * @param newOtherInfos 接口返回的收样辅助信息
 */
function formatOtherInfos(newOtherInfos: LocalSpecifications[]) {
  const result: LocalSpecifications[] = []
  const localOtherInfo: LocalSpecifications[] = formData.value.testObjectOtherInfos || []

  for (let i = 0; i < newOtherInfos.length; i++) {
    const item = newOtherInfos[i]

    if (`${item.dataType}` === '2' && item.value) {
      item.value = dayjs(item.value).format('YYYY-MM-DD')
    }

    if (item.customized === undefined) {
      item.customized = false
    }

    if (!item.inputHistory) {
      item.inputHistory = []
    }

    if (item.listValue) {
      const arr = item.listValue.split(';').filter(d => !!d && !d.includes('@_@'))
      item.inputHistory = [...new Set(item.inputHistory.concat(arr))]
    }

    if (item.id) {
      item.attributeId = item.id
      delete item.id
    }

    // 开启了盲样：isShowTest=false、非规格型号的需要盲样
    item.isBlind = Boolean(props.blind && !item.isShowTest && !item.isJoinSpecification)

    // 编辑样品时，处理回显的默认值
    if (!disabled.value) {
      const locationItem = localOtherInfo.find(j => nameKey(j) === nameKey(item))
      if (locationItem) {
        if (`${locationItem.dataType}` === '2' && locationItem.value) {
          locationItem.value = dayjs(locationItem.value).format('YYYY-MM-DD')
        }
        item.value = locationItem.value || ''
      }
      // 未匹配上且未切换样品时将值清空
      else if (!isChangeSample.value) {
        item.value = ''
      }
    }

    // #31643 辅助信息 同名（显示名称）+ 同系统字段的，进行去重，只保留数据中心的字段，包括是否盲样的控制也取数据中心的字段
    const sameItemIndex = result.findIndex(j => nameKey(j) === nameKey(item))
    if (sameItemIndex !== -1) {
      const sameItem = result[sameItemIndex]
      if (!sameItem.customized) {
        continue
      }
      result.splice(sameItemIndex, 1)
    }

    result.push(item)
  }

  return result
}

/**
 * ## 获取委托元数据中保存的规格型号信息
 * @description 任务详情中的样品信息接口未返回元数据信息，需要单独通过接口获取
 */
async function getMetaSpecification() {
  const { data } = await getConsignMetaDataAttribuite<string>({
    consignId: testObject.value.consignInfoId,
    objectId: testObject.value.id,
    attributeName: 'specificationConfig',
  })
  // 历史数据，不存在 specificationConfig 属性，执行修复程序
  if (!data) {
    testObject.value.otherInfos = testObject.value.testObjectOtherInfos
    return compatibilityOldMetaData(testObject.value)
  }
  return data ? JSON.parse(data) : []
}

/** 规格型号 */
const specificationVisible = ref(false)
/** 保存规格型号回调 */
function onSaveSpecification(data: SpecificationsInfo) {
  if (disabled.value)
    return
  specificationView.value = VIEW_TYPE.EDIT
  formData.value.standard = data.standard
  formData.value.grade = data.grade
  formData.value.model = data.model
  formData.value.label = data.label
  formData.value.specification = data.specification
  specificationConfig.value = data.specifications
  // 将规格型号数据更新到辅助信息内
  for (let i = 0; i < otherInfo.value.length; i++) {
    const item = otherInfo.value[i]

    if (!item.isJoinSpecification)
      continue

    for (let j = 0; j < data.specifications.length; j++) {
      const editItem = data.specifications[j]
      if (item.displayName === editItem.displayName) {
        item.value = editItem.value
      }
    }
  }
}
/**
 * 切换样品时，初始化规格型号
 */
const specificationModalRef = ref()
function afterRenderSpecification(data: SpecificationsInfo) {
  if (specificationView.value !== VIEW_TYPE.ADD)
    return ''

  onSaveSpecification(data)
}

/** 添加属性回调 */
async function addProperty() {
  try {
    loading.value = true
    await getOtherInfo()
  }
  finally {
    loading.value = false
  }
}

/**
 * ## 提交数据
 */
function submit() {
  const sampleForm = sampleFormRef.value?.saveData() || {}
  const sampling = samplingRef.value?.saveData() || {}
  const otherInfo = otherInfoRef.value?.saveData() || []
  const form = { ...formData.value, ...sampleInfo.value, ...sampleForm, ...sampling }
  for (let i = 0; i < otherInfo.length; i++) {
    const item = otherInfo[i]
    if (item.systemFieldName === '试样数量') {
      item.value = sampleForm.sampleNum
    }
    else if (item.systemFieldName === '代表批量') {
      item.value = sampleForm.delegatesNum
    }
  }
  form.testObjectOtherInfos = otherInfo
  form.specificationConfig = JSON.stringify(specificationConfig.value)

  // eslint-disable-next-line no-console
  console.log(form)
  return form
}

onMounted(() => {
  initData()
})

defineExpose({
  submit,
})
</script>

<style>
.ant-spin-nested-loading,
.ant-spin-container{
  height: 100%;
}
</style>
