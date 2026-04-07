<!-- 选择委托单位、工程项目、委托人 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="600px"
    title="费用调整"
    :loading="loading"
    :hide-confirm="param.disabled"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <a-form
      ref="formRef" :model="form"
      class="pt-4 h-[380px]"
      :disabled="param.disabled"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item label="计费方式" name="chargingType">
        <a-radio-group
          v-model:value="chargingType"
          :disabled="param.disabled"
          @change="reComputeTotalFee()"
        >
          <a-radio
            v-for="d in CHARGING_MODE_DICT"
            :key="d.value" :value="d.value"
            :disabled="contractList.length === 0 && d.value === '2'"
          >
            {{ d.label }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        v-if="chargingType === '2'" label="费用合同" name="contractId"
        :rules="[{ required: true, message: '请选择费用合同' }]"
      >
        <a-flex :gap="8">
          <a-select v-model:value="form.contractId" class="flex-1" placeholder="请选择费用合同" @change="changeContract">
            <a-select-option v-for="d in contractList" :key="d.id" :value="d.id">
              {{ d.name }}
            </a-select-option>
          </a-select>
        </a-flex>
      </a-form-item>
      <a-form-item v-if="SYSTEM_PARAM.MULTIPLE_PRICE_STANDARD" label="收费标准" name="chargeStandard">
        <span v-if="consignFeeProcessor.whetherFeeHide">*</span>
        <a-select v-else v-model:value="form.chargeStandard" placeholder="请选择收费标准" @change="feeStandardChange">
          <a-select-option v-for="d in consignFeeProcessor.feeStandards" :key="d.id" :value="d.id">
            {{ d.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="应收费用" name="priceBeforeDiscount">
        <span v-if="consignFeeProcessor.whetherFeeHide">*</span>
        <template v-else>
          ￥ {{ showValue(form.priceBeforeDiscount) }}
          <span class="text-gray-500">（原价：￥{{ showValue(form.originalPrice) }}）</span>
        </template>
      </a-form-item>
      <a-form-item label="折扣模式" name="additionalFeeInvolvedInDiscount">
        <span v-if="consignFeeProcessor.whetherFeeHide">*</span>
        <a-select v-else v-model:value="form.additionalFeeInvolvedInDiscount" placeholder="请选择折扣模式" @change="reComputeTotalFee()">
          <a-select-option v-for="d in FEE_DISCOUNT_MODE_DICT" :key="d.value" :value="d.value">
            {{ d.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="折扣率" name="discount">
        <span v-if="consignFeeProcessor.whetherFeeHide">*</span>
        <a-input-number v-else v-model:value="form.discount" class="!w-full" placeholder="请输入折扣率" :controls="false" :max="1" :min="0" @blur="changeDiscount" />
      </a-form-item>
      <a-form-item label="折后费用" name="priceAfterDiscoun t">
        <span v-if="consignFeeProcessor.whetherFeeHide">*</span>
        <span v-else>￥ {{ showValue(form.priceAfterDiscount) }}</span>
      </a-form-item>
      <a-form-item label="实收费用" name="ratedFee">
        <span v-if="consignFeeProcessor.whetherFeeHide">*</span>
        <a-input-number v-else v-model:value="form.ratedFee" class="!w-full" placeholder="请输入实收费用" :controls="false" :min="0" @blur="changeRateFee" />
        <p class="text-gray-500">
          实际执行折扣率: {{ showValue(form.performDiscount) }}
        </p>
      </a-form-item>
    </a-form>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IAppointmentContract, IFeeState } from '../../interface'
import type { ConsignFeeProcessor } from '../../modules/ConsignFeeProcessor'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { cloneDeep } from '@unovis/ts'
import { Modal } from 'ant-design-vue'
import { EFeeDiscountMode, specifiedTestParamsApi } from '~/api/consign/consign-management'
import { FEE_DISCOUNT_MODE_DICT } from '../../constants'

export interface FeeConfigPropType {
  disabled: boolean
  consignUnitId: string
  projectId: string
  testParamIds: string[]
  consignFeeProcessor: ConsignFeeProcessor
}

const props = defineProps<IDialogPropsParam<any, FeeConfigPropType>>()

const consignFeeProcessor = props.param.consignFeeProcessor

const SYSTEM_PARAM = consignFeeProcessor.systemParams

const CHARGING_MODE_DICT = [{
  label: '按单价',
  value: '1',
}, {
  label: '按合同价',
  value: '2',
}]

const internalOpen = ref(true)
const loading = ref(false)
const formRef = ref()
const contractList = ref<IAppointmentContract[]>([])
const form = ref<IFeeState['feeVo']>({})
let sampleDatas = cloneDeep(consignFeeProcessor.consignSampleData || [])
const chargingType = ref('1')

function initFee() {
  const { feeVo } = consignFeeProcessor.consignFeeData || {}
  form.value = { ...feeVo }
  if (feeVo.contractId)
    chargingType.value = '2'
  else
    chargingType.value = '1'

  if (!feeVo.additionalFeeInvolvedInDiscount)
    form.value.additionalFeeInvolvedInDiscount = EFeeDiscountMode.YES

  if (!feeVo.priceBeforeDiscount)
    form.value.performDiscount = 1
}

/** 加载合同数据 */
async function getContractData() {
  loading.value = true
  const res = await props.param.consignFeeProcessor.loadContractData({
    consignUnitId: props.param.consignUnitId,
    testParamIds: props.param.testParamIds,
    projectId: props.param.projectId,
  })
  contractList.value = res
  const selItem = res.find(d => d.id === form.value.contractId)
  if (!selItem) {
    form.value.contractId = res[0]?.id || ''
    form.value.contractName = res[0]?.name || ''
    form.value.contractNo = res[0]?.no || ''
  }
  loading.value = false
}

initFee()
getContractData()

function showValue(v?: number | string) {
  if (consignFeeProcessor.whetherFeeHide)
    return '*'
  if (!v)
    return '0.00'
  return Number.parseFloat(`${v}`).toFixed(2)
}

/** 修改折扣率 */
function changeDiscount(e: any) {
  let v = e.target.value
  if (!v)
    return
  if (v < 0 || v > 1)
    v = 1
  form.value.discount = Number.parseFloat(v)
  reComputeTotalFee()
}

/** 修改实收费用 */
function changeRateFee(e: any) {
  const v = e.target.value
  if (!v)
    return

  reComputeTotalFee(false)
}

/** 选择合同 */
async function changeContract(id: any) {
  const contract = contractList.value.find(item => item.id === id)
  if (!contract)
    return

  form.value.contractName = contract.name
  form.value.contractNo = contract.no

  reComputeTotalFee()
}

/** 切换收费标准 */
async function feeStandardChange(priceStandardId: any) {
  for (let i = 0; i < sampleDatas.length; i++) {
    const sample = sampleDatas[i]
    if (!sample.testParams)
      continue
    const param = {
      sampleId: sample.testUnitTestSampleId,
      paramIds: sample.testParams.map((paramItem) => {
        return paramItem.testParamId
      }).join(','),
      priceStandardId,
    }
    try {
      const { data } = await specifiedTestParamsApi(param)
      if (data && data.length) {
        for (let i = 0; i < data.length; i++) {
          const d = data[i]
          for (let j = 0; j < sample.testParams.length; j++) {
            const param = sample.testParams[j]
            if (param.testParamId !== d.id)
              continue
            param.priceStandardId = priceStandardId // 给每个参数重新设置标准id

            // 共享单价【注意此处价格属性区别】
            param.sharePrice = d.sharedPrice
            param.sharedPriceQualifier = d.sharedPriceQualifier

            if (d.sharedPrice || d.sharedPrice === 0) { // 如果参数是公用价格
              param.prices = d.prices
              param.price = d.sharedPrice
              param.priceType = 3
            }
            else if (d.prices && d.prices.length) { // 重新设置参数价格
              param.prices = d.prices
              param.price = d.prices[0].price
              param.priceType = d.prices[0].type
            }
            else {
              param.prices = []
              param.price = 0
              param.priceType = -1
            }
          }
        }
        reComputeTotalFee()
      }
      else {
        Modal.error({
          title: '提示',
          content: '请选择检测参数',
          centered: true,
          okText: '确定',
        })
      }
    }
    catch (err) {
      console.error('根据指定参数id和收费标准id获取收样参数：', err)
      return
    }
  }
}

/** 重新计算费用 */
async function reComputeTotalFee(clearRateFee = true) {
  const feeVo = { ...form.value }

  if (chargingType.value === '1') {
    feeVo.contractId = ''
    feeVo.contractName = ''
    feeVo.contractNo = ''
  }

  if (clearRateFee)
    feeVo.ratedFee = undefined

  loading.value = true
  const res = await consignFeeProcessor.computeTotalFee({
    sampleDatas,
    feeState: {
      ...consignFeeProcessor.consignFeeData,
      feeVo,
    },
  }).finally(() => {
    loading.value = false
  })
  if (!res)
    return

  form.value = {
    ...res.feeState.feeVo,
    contractId: form.value.contractId,
    contractName: form.value.contractName,
    contractNo: form.value.contractNo,
  }
  sampleDatas = res.sampleDatas
}

async function handleConfirm() {
  await formRef.value.validate()
  const feeVo = { ...form.value }

  if (chargingType.value === '1') {
    feeVo.contractId = ''
    feeVo.contractName = ''
    feeVo.contractNo = ''
  }
  props.onConfirm({
    feeState: {
      ...consignFeeProcessor.consignFeeData,
      oldFeeVo: { ...feeVo },
      feeVo,
    },
    samples: sampleDatas,
  })
  internalOpen.value = false
}
</script>
