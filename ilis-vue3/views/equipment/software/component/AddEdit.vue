<template>
  <HtModal
    v-model:open="visible"
    :title="param.id ? '编辑软件' : '新增软件'"
    width="500px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <div class="pr-3">
      <IlisForm
        ref="ilisFormRef"
        :cols="1"
        :entity="SoftwareEntity"
        :init-data="initData"
        :mixin-rules="mixinRules"
        :label-col="{
          style: { width: '100px' },
        }"
        :field-list="fieldList"
      >
        <template #supplierId="{ data }">
          <IlisInput
            v-model="data.supplierId"
            :options="supportOptions"
            :entity="SoftwareEntity"
            field="supplierId"
          />
        </template>
        <template #duration="{ data }">
          <div class="flex gap-3">
            <IlisInput
              v-model="data.duration"
              :entity="SoftwareEntity"
              disabled
              field="duration"
            />
            <a-button disabled>
              天
            </a-button>
          </div>
        </template>
        <template #form-after>
          <a-form-item label="附件材料">
            <HtUploadFile
              business-type="SOFTWARE_MANAGEMENT"
              force-init
              :business-id="initData.id"
              @get-qr-code-key="initData.uploadQR = $event"
            />
          </a-form-item>
        </template>
      </IlisForm>
      <!-- 自定义属性部分 -->
      <IlisCustomPropertiesForm
        ref="customizeFormRef"
        customize-type="softwareManagement"
        :default-value="initData.customizeValues"
        :label-col="{
          style: { width: '100px' },
        }"
      >
      </IlisCustomPropertiesForm>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { SoftwareAuthStatus, SoftwareEntity } from '../SoftwareEntity'
import { editSoftware, saveSoftware } from '../api'
import HtUploadFile from '~/components/htUploadFile/Index.vue'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisCustomPropertiesForm, IlisForm, IlisInput } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IOption } from '~/interface/IOption'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import { EDateFormatType } from '~/utils/EDateFormatType'

const props = defineProps<IDialogPropsParam<null, SoftwareEntity>>()

const loading = ref(false)

const visible = ref(true)

const initData = ref<SoftwareEntity>(props.param)

const ilisFormRef = ref<IlisFormExpose<SoftwareEntity>>()

const customizeFormRef = ref()

const supportOptions = ref<IOption[]>([])

const fieldList = computed(() => {
  if (initData.value.type === 'long') {
    return SoftwareEntity.getFormFieldList().filter(item => !['duration', 'endDate'].includes(item))
  }
  return SoftwareEntity.getFormFieldList()
})

const mixinRules = ref<Record<string, Rule[]>>({
  endDate: [
    {
      validator: async (_rule: any, value: string) => {
        // 当天最后一刻
        const data = new Date(value).setHours(23, 59, 59, 999)
        if (initData.value.startDate && AnyDateTimeHelper.getTime(data) < new Date(initData.value.startDate).getTime())
        // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('不能小于授权开始日期')
        else
          return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
})

watch(() => initData.value, (val) => {
  if (val.type === 'long') {
    initData.value.authStatus = SoftwareAuthStatus.VALID
    return
  }
  if (!val.startDate || !val.endDate) {
    return
  }

  if (val.startDate > val.endDate || AnyDateTimeHelper.format(Date.now(), EDateFormatType.YYYY_MM_DD) > AnyDateTimeHelper.format(val.endDate, EDateFormatType.YYYY_MM_DD)) {
    initData.value.authStatus = SoftwareAuthStatus.EXPIRED
  }
  else {
    initData.value.authStatus = SoftwareAuthStatus.VALID
  }

  // 自动计算持续时间
  const startDate = new Date(val.startDate)
  const endDate = new Date(val.endDate)
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
  initData.value.duration = duration.toString()
}, {
  deep: true,
})

async function init() {
  getSupplierList()
}
init()

async function getSupplierList() {
  const { data } = await IlisApiHelper.get<any>('rest/supplierController/list', { type: 'software' })
  supportOptions.value = data?.map((item: any) => {
    return {
      label: item.name,
      value: item.id,
    }
  })
  if (initData.value.supplierId) {
    if (!supportOptions.value?.some((item) => {
      return item.value === initData.value?.supplierId
    })) {
      initData.value.supplierId = undefined
    }
  }
}

async function handleOk() {
  const formData = await ilisFormRef.value?.getFormData()
  const customizeValueStr = await customizeFormRef.value?.getFormData()
  formData!.customizeValueStr = JSON.stringify(customizeValueStr)
  loading.value = true
  if (props.param.id) {
    await editSoftware(formData!).finally(() => {
      loading.value = false
    })
  }
  else {
    await saveSoftware(formData!).finally(() => {
      loading.value = false
    })
  }
  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}
</script>
