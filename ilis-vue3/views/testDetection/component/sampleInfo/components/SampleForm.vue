<template>
  <a-collapse v-model:active-key="activeKey">
    <a-collapse-panel key="1" :header="sampleInfo.testObjectCode">
      <a-form
        :model="form"
        :label-col="{ span: 7 }"
        label-wrap
        :disabled="disabled"
      >
        <a-form-item label="样品名称">
          <a-input v-model:value="form.testSampleDisplayName" placeholder="请输入样品名称" />
        </a-form-item>
        <a-form-item label="规格型号">
          <a-input-group compact class="!flex" @click="emits('setSpecification')">
            <a-input v-model:value="form.standard" readonly placeholder="设置规格型号" />
            <a-button :disabled="false">
              <SettingOutlined />
            </a-button>
          </a-input-group>
        </a-form-item>
        <a-form-item label="检测部位">
          <a-input-group compact class="!flex" @click="showTestParts">
            <a-input
              v-model:value="form.testPart"
              icon="md-filing"
              readonly
              placeholder="请输入检测部位"
            />
            <a-button>
              <SettingOutlined />
            </a-button>
          </a-input-group>
        </a-form-item>
        <a-form-item label="工程部位/用途">
          <a-input v-model:value.trim="form.projectPartAndUse" placeholder="请输入工程部位/用途" />
        </a-form-item>
        <a-form-item label="样品描述">
          <a-auto-complete v-model:value.trim="form.description" :options="descriptionOptions" placeholder="请输入样品描述" />
        </a-form-item>
        <a-form-item label="样品数量">
          <a-input-number
            v-model:value="sampleNum"
            :min="0"
            placeholder="请输入样品数量"
            class="w-full"
          >
            <template #addonAfter>
              <a-select
                v-model:value="sampleNumUnit"
                :dropdown-match-select-width="false"
                placeholder="选择单位"
                allow-clear
                class="w-[90px]"
              >
                <a-select-option
                  v-for="item in units"
                  :key="item.typename"
                  :value="item.typename"
                >
                  {{ item.typename }}
                </a-select-option>
              </a-select>
            </template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="代表数量">
          <a-input-number
            v-model:value="delegatesNum"
            :min="0"
            placeholder="请输入代表数量"
            class="w-full"
          >
            <template #addonAfter>
              <a-select
                v-model:value="delegatesNumUnit"
                :dropdown-match-select-width="false"
                allow-clear
                placeholder="选择单位"
                class="w-[90px]"
              >
                <a-select-option
                  v-for="item in units"
                  :key="item.typename"
                  :value="item.typename"
                >
                  {{ item.typename }}
                </a-select-option>
              </a-select>
            </template>
          </a-input-number>
        </a-form-item>
        <a-form-item label="备注">
          <a-input v-model:value="form.remark" placeholder="请输入备注" />
        </a-form-item>
      </a-form>

      <ht-modal
        v-model:open="partVisible"
        title="设置检测部位"
        width="400px"
        @ok="savePart"
      >
        <a-form>
          <a-form-item
            v-for="(_item, i) in sampleInfo.sampleAmount"
            :key="i"
            :label="`检测部位${i + 1}`"
          >
            <a-input v-model:value="testParts[i]" placeholder="请输入检测部位" />
          </a-form-item>
        </a-form>
      </ht-modal>
    </a-collapse-panel>
  </a-collapse>
</template>

<script setup lang='ts'>
import { SettingOutlined } from '@ant-design/icons-vue'
import { getListByTypeGroupId } from '~/api/common'
import { getDescriptionOptions, getDiscriptionHistory } from '~/views/consign/component/selectSample/api'

interface UnitData {
  typecode: string
  orderNumber: string
  id: string
  typename: string
}

export interface SampleFormDTO {
  testObjectCode: string
  testUnitTestSampleId: string
  testSampleDisplayName: string
  standard: string
  testPart: string
  projectPartAndUse: string
  description: string
  sampleNum: string
  delegatesNum: string
  remark: string
  sampleAmount: number
}

interface DescriptionOptionItem {
  value: string
  label: string
  options: Array<{ value: string }>[]
}

const props = withDefaults(defineProps<{
  sampleInfo: SampleFormDTO
  paramIds: string[]
  disabled?: boolean
}>(), {
  paramIds: () => [],
})

const emits = defineEmits<{
  (e: 'setSpecification'): void
}>()

const { sampleInfo } = toRefs(props)

const activeKey = ref('1')
const form: any = ref({ ...sampleInfo.value })
const sampleNum = ref()
const sampleNumUnit = ref()
const delegatesNum = ref()
const delegatesNumUnit = ref()
const units = ref<UnitData[]>([])
const SAMPLE_DESCRIPTION_HISTORY_LOAD = ref(false)

// 样品描述下拉选项中包含该样品历史输入的样品描述
getBusinessParam('SAMPLE_DESCRIPTION_HISTORY_LOAD').then((val) => {
  SAMPLE_DESCRIPTION_HISTORY_LOAD.value = val
})

/**
 * 监听sampleInfo变化，初始化表单值
 */
watch(() => sampleInfo.value, async (obj) => {
  form.value = { ...obj }

  if (units.value.length === 0) {
    await getUnits()
  }
  const data1 = initNumUnit('sampleNum')
  const data2 = initNumUnit('delegatesNum')
  sampleNum.value = data1.num
  sampleNumUnit.value = data1.unit || undefined
  delegatesNum.value = data2.num
  delegatesNumUnit.value = data2.unit || undefined
  initDescriptionOptions(obj.testUnitTestSampleId, props.paramIds)
})

/** 处理样品数量代表数量 */
function initNumUnit(key: 'sampleNum' | 'delegatesNum') {
  const val = props.sampleInfo[key] || ''
  let num = `${Number.parseFloat(val)}`
  num = num === 'NaN' ? '' : num
  let unit = val.substring(num.toString().length)
  const isZero = unit.match(/^.?0+/)
  if (isZero) {
    num += isZero[0]
    unit = unit.substring(isZero[0].length)
  }
  checkRepeatUnit(unit)
  return { num, unit }
}

/**
 * 已保存的数据，单位添加到列表
 */
function checkRepeatUnit(unit: string) {
  if (!unit)
    return
  const isUnit = units.value.find(d => d.typename === unit)
  if (isUnit)
    return ''
  units.value.push({
    id: unit,
    typename: unit,
    typecode: unit,
    orderNumber: '99',
  })
}

/** 获取计量单位 */
async function getUnits() {
  const { data } = await getListByTypeGroupId('8a8ab0b246dc81120146dc8181c3006d')
  units.value = data.rows
}

/** 设置检测部位 */
const partVisible = ref(false)
const testParts = ref<string[]>([])
function showTestParts() {
  const vals = form.value.testPart.split(';')
  const group = props.sampleInfo.sampleAmount
  if (vals.length < group) {
    testParts.value = Array(group - vals.length).fill('')
  }
  testParts.value = vals
  partVisible.value = true
}
function savePart() {
  form.value.testPart = testParts.value.join(';')
  form.value.projectPartAndUse = form.value.testPart
  partVisible.value = false
}

/**
 * 样品描述下拉
 * 由系统配置和历史记录组成
 */
const descriptionOptions = ref<DescriptionOptionItem[]>([])
async function initDescriptionOptions(testUnitTestSampleId: string, paramIds: string[]) {
  if (!testUnitTestSampleId || paramIds.length === 0) {
    descriptionOptions.value = []
    return
  }

  const result = []

  const res = await getDescriptionOptions(testUnitTestSampleId)
  let sysData = res.data || []
  sysData = sysData.filter((d: any) => !!d.description)
  if (sysData.length > 0) {
    result.push({
      label: '系统字段',
      value: '',
      options: sysData.map((i: any) => ({ value: i.description })),
    })
  }

  if (SAMPLE_DESCRIPTION_HISTORY_LOAD.value) {
    const res2 = await getDiscriptionHistory({
      testUnitTestSampleId,
      paramIds: paramIds.join(','),
    })
    const list = res2.data.obj || []
    const historyData = list.filter((d: string) => !!d)
    if (historyData.length > 0) {
      result.push({
        label: '历史记录',
        value: '',
        options: historyData.map((i: string) => ({ value: i })),
      })
    }
  }

  descriptionOptions.value = result
}

function saveData() {
  const data = { ...form.value }
  data.sampleNum = (sampleNum.value || '') + (sampleNumUnit.value || '')
  data.delegatesNum = (delegatesNum.value || '') + (delegatesNumUnit.value || '')
  return data
}
defineExpose({
  saveData,
})
</script>

<style scoped>
.ant-form-item{
  margin-bottom: 12px;
}
:deep(.ant-form-item .ant-form-item-label >label){
  line-height: 14px;
}
</style>
