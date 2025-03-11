<template>
  <HtModal
    v-model:open="visible"
    title="详情"
    width="500px"
    :confirm-loading="loading"
    :after-close="onClosed"
  >
    <template #footer>
      <a-button @click="visible = false">
        关闭
      </a-button>
    </template>
    <div class="pr-3">
      <IlisForm
        ref="ilisFormRef"
        :cols="1"
        :entity="SoftwareEntity"
        :init-data="initData"
        :label-col="{
          style: { width: '100px' },
        }"
        :field-list="fieldList"
        disabled
      >
        <template #supplierId="{ data }">
          <IlisInput
            v-model="data.supplierId"
            :options="supportOptions"
            :entity="SoftwareEntity"
            disabled
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
              is-reandonly
              :business-id="initData.id"
              @get-qr-code-key="initData.uploadQR = $event"
            />
          </a-form-item>
        </template>
      </IlisForm>
      <!-- 自定义属性部分 -->
      <IlisCustomPropertiesForm
        ref="customizeFormRef"
        disabled
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
import { SoftwareAuthStatus, SoftwareEntity } from '../SoftwareEntity'
import { getSoftwareDetail } from '../api'
import HtUploadFile from '~/components/htUploadFile/Index.vue'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisCustomPropertiesForm, IlisForm, IlisInput } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IOption } from '~/interface/IOption'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

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
  immediate: true,
})

async function init() {
  getSupplierList()
  if (props.param.id) {
    const { data } = await getSoftwareDetail(props.param)
    initData.value = SoftwareEntity.fromJSON(data)
  }
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
      supportOptions.value.push({
        label: initData.value.supplierName || '',
        value: initData.value.supplierId,
      })
    }
  }
}
</script>
