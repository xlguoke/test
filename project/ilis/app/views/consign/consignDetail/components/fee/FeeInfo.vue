<template>
  <div
    v-if="consignSampleProcessor.consignSampleData.length"
    class="py-2 px-4 flex justify-between items-center h-[60px] shadow-[0_-2px_6px_rgba(0,0,0,0.05)]"
  >
    <div>
      <div>
        计费方式：
        <template v-if="consignFeeProcessor.whetherFeeHide">
          *
        </template>
        <template v-else>
          <span>{{ consignFeeProcessor.feeVo.contractId ? `按合同（${consignFeeProcessor.feeVo.contractName || ''}）` : '按单价' }}</span>
          <a-button v-if="constructParams.priceChanged" type="link" size="small" @click="handlePriceHistories">
            费用历史>>
          </a-button>
        </template>
      </div>
      <div v-if="consignProcessor.systemParams.APPOINTMENT_CONTRACT">
        约定关联检测合同：
        <template v-if="consignFeeProcessor.whetherFeeHide">
          *
        </template>
        <template v-else>
          <span>{{ appointContractText || '未选择' }}</span>
          <a-button
            v-if="!consignProcessor.pageStateService.readonly && !consignProcessor.isNoticeModifyConsign"
            type="link" size="small"
            @click="openAppointmentContract"
          >
            选择>>
          </a-button>
        </template>
      </div>
    </div>
    <a-flex :gap="40" align="center" class="text-center font-bold">
      <div>
        <p class="text-gray-500">
          合计
          <a-tooltip placement="top">
            <template #title>
              <div class="w-60 p-2 leading-6">
                <a-flex justify="space-between">
                  <span>计费方式</span>
                  <span>{{ consignFeeProcessor.feeVo.contractId ? '按合同价' : '按单价' }}</span>
                </a-flex>
                <a-flex justify="space-between">
                  费用明细 <span>单位：￥</span>
                </a-flex>
                <a-flex justify="space-between">
                  - 参数折前金额 <span>{{ showFeeValue(consignFeeProcessor.feeVo.priceOfParameter) }}</span>
                </a-flex>
                <template v-if="consignFeeProcessor.feeVo.contractDiscount">
                  <a-flex justify="space-between">
                    - 合同折扣率 <span>{{ showFeeValue(consignFeeProcessor.feeVo.contractDiscount) }}</span>
                  </a-flex>
                  <a-flex justify="space-between">
                    - 合同折后金额 <span>{{ showFeeValue(consignFeeProcessor.feeVo.priceAfterContractDiscount) }}</span>
                  </a-flex>
                </template>
                <a-flex justify="space-between">
                  - 附加费用 <span>{{ showFeeValue(consignFeeProcessor.feeVo.additionalFee) }}</span>
                </a-flex>
              </div>
            </template>
            <InfoCircleOutlined class="text-gray-900 cursor-pointer hover:text-gray-700" />
          </a-tooltip>
        </p>
        <p>{{ showFeeValue(consignFeeProcessor.feeVo.priceBeforeDiscount) }}元</p>
      </div>
      <div>
        <p class="text-gray-500">
          折扣模式
        </p>
        <p>
          <template v-if="consignFeeProcessor.whetherFeeHide">
            *
          </template>
          <template v-else>
            {{ consignFeeProcessor.feeVo.additionalFeeInvolvedInDiscount === 0 ? '附加费用不参与折扣计算' : '附加费用参与折扣计算' }}
          </template>
        </p>
      </div>
      <div>
        <p class="text-gray-500">
          折扣率
        </p>
        <p>{{ showFeeValue(consignFeeProcessor.feeVo.discount) }}</p>
      </div>
      <div>
        <p class="text-gray-500">
          折后费用
        </p>
        <p>{{ showFeeValue(consignFeeProcessor.feeVo.priceAfterDiscount) }}元</p>
      </div>
      <div>
        <p class="text-gray-500">
          合计实收
        </p>
        <p>{{ showFeeValue(consignFeeProcessor.feeVo.ratedFee) }}元</p>
      </div>
      <div>
        <a-button type="primary" size="large" :disabled="consignFeeProcessor.whetherFeeHide" @click="handleFeeConfig">
          费用调整
        </a-button>
      </div>
    </a-flex>
  </div>
</template>

<script setup lang='ts'>
import type { IAppointmentContract, IConsignSamples, IFeeState } from '../../interface'
import type { FeeConfigPropType } from './FeeInfoConfig.vue'
import { InfoCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import sseRequestProgress from '~/components/sseRequestProgress'
import { usePermissionStore } from '~/store/permissionStore'
import { useConsignDetailLoading, useConsignProcessor, useConsignSave } from '../../composables/useProviderInject'
import AppointmentContractSelector from './AppointmentContractSelector.vue'
import FeeInfoConfig from './FeeInfoConfig.vue'
import PriceHistory from './PriceHistory.vue'

const { consignProcessor } = useConsignProcessor()
const { loading } = useConsignDetailLoading()
const { saveConsign } = useConsignSave()

const { hasPermission } = usePermissionStore()

const consignFeeProcessor = consignProcessor.consignFeeProcessor
const consignSampleProcessor = consignProcessor.consignSampleProcessor
const constructParams = consignProcessor.consignConstructParams || {}

/** 复制报告时，会删除表单中的委托id，故使用地址中携带的委托id */
// const consignId = consignProcessor.pageStateService.consignId

const appointContractText = computed(() => {
  const { name, no } = consignProcessor.data.appointContract || { name: '', no: '' }
  return name ? `${name} （${no}）` : ''
})

/** ## 更新计费合同信息 */
function updateBillingContract(form: IFeeState['feeVo']) {
  if (form.contractId) {
    consignProcessor.setConsignData({
      billingContract: {
        id: form.contractId || '',
        name: form.contractName || '',
        no: form.contractNo || '',
      },
    })
  }
  else {
    consignProcessor.setConsignData({
      billingContract: {
        id: '',
        name: '',
        no: '',
      },
    })
  }
}

/** ## 费用调整 */
async function handleFeeConfig() {
  if (!consignProcessor.data.consignUnit.consignUnitId) {
    message.error('请先选择委托单位')
    return
  }

  const param = consignFeeProcessor.initContractQueryParam()
  const disabled = consignProcessor.pageStateService.readonly || consignSampleProcessor.isSampleRollback
  const {
    feeState: _feeState,
    samples,
  }: {
    feeState: IFeeState
    samples: IConsignSamples[]
  }
    = await AnyDialogHelper.showModel(FeeInfoConfig, {
      ...param,
      disabled,
      consignFeeProcessor,
    } as FeeConfigPropType)

  // 详情模式下和单样品退回状态下不进行重新计算
  if (disabled)
    return

  loading.value = true
  consignSampleProcessor.setConsignSampleData(samples)
  consignFeeProcessor.setConsignFeeData(_feeState)

  // 更新计费合同信息
  updateBillingContract(_feeState.feeVo)

  // 费用调整后，根据支付合同绑定约定关联合同
  await consignFeeProcessor.bindAppintContract(param)

  loading.value = false
}

/** 选择关联检测合同 */
async function openAppointmentContract() {
  const param = consignFeeProcessor.initContractQueryParam()
  const selRows: IAppointmentContract[] = await AnyDialogHelper.showSelector(AppointmentContractSelector, {
    customParams: {
      param,
      consignFeeProcessor,
    },
  })
  const contract = selRows[0] || { id: '', name: '', no: '' }
  consignProcessor.setConsignData({
    appointContract: contract,
  })
}

/**
 * 修改委托单位工程项目
 * @param isSave 是否保存委托
 */
async function changeConsignUnitProject(isSave?: boolean) {
  await consignFeeProcessor.getFeeStandard()

  if (!consignSampleProcessor.consignSampleData.length)
    return

  try {
    if (isSave)
      sseRequestProgress.showLoading('工程项目发生变化，委托保存中，请等待...')
    await consignFeeProcessor.commonSetPayContract()
    if (isSave)
      await saveConsign()
  }
  finally {
    sseRequestProgress.hideLoading()
  }
}

/** 费用显示 */
function showFeeValue(v?: number | string) {
  if (consignFeeProcessor.whetherFeeHide)
    return '*'
  if (!v && v !== 0)
    return '0.00'
  return Number.parseFloat(`${v}`).toFixed(2)
}

/** ## 查看费用历史 */
function handlePriceHistories() {
  AnyDialogHelper.showModel(PriceHistory, {
    priceObjId: constructParams.priceObjId,
  })
}

async function initFee() {
  try {
    loading.value = true

    const permission = hasPermission('seeThroughTheMist')
    // 是否*显示费用信息
    consignFeeProcessor.getWhetherFeeHide(permission)

    // 费用标准、计费方式
    await consignFeeProcessor.getFeeStandard()

    // 初始化费用信息
    if (consignSampleProcessor.consignSampleData.length > 0) {
      const res = await consignFeeProcessor.initFeeState()
      if (res && res.sampleDatas)
        consignSampleProcessor.setConsignSampleData(res.sampleDatas)
      if (res && res.isSaveConsign)
        await saveConsign()
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  initFee()
})

defineExpose({
  changeConsignUnitProject,
})
</script>

<style scoped>
p{
  margin-bottom: 0;
}
</style>
