<template>
  <ht-modal
    v-model:open="open"
    :title="title"
    width="640px"
    :mask-closable="false"
    :confirm-loading="submitLoading"
    @cancel="cancel"
  >
    <a-form ref="formRef" :model="formState" class="pt-4" :label-col="{ style: 'width: 100px' }" :wrapper-col="{ style: 'flex: 1' }">
      <a-form-item label="功能室" name="laboratoryId" :rules="[{ required: true, message: '请选择功能室！' }]">
        <a-select v-model:value="formState.laboratoryId" :options="laboratoryOptions" placeholder="请输入"></a-select>
      </a-form-item>
      <a-form-item label="废物类型" name="type" :rules="[{ required: true, message: '请选择废物类型！' }]">
        <a-select v-model:value="formState.type" :options="wasteTypeList" placeholder="请输入"></a-select>
      </a-form-item>
      <a-form-item label="液体废物" name="fluid">
        <a-radio-group v-model:value="formState.fluid">
          <a-radio :value="true">
            是
          </a-radio>
          <a-radio :value="false">
            否
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item v-if="formState.fluid" label="PH值">
        <a-input-number v-model:value.trim="formState.phValue" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="计量单位" name="unit" :rules="[{ required: true, message: '请选择计量单位！' }]">
        <a-select v-model:value="formState.unit" :options="unitOptions" placeholder="请输入"></a-select>
      </a-form-item>
      <a-form-item label="附件">
        <HtUploadFile
          v-if="uploadKey"
          :business-type="BUSINES_TYPE.CHEMICAL"
          force-init
          :business-id="uploadKey"
          @get-qr-code-key="formState.uploadQR = $event"
        >
          <template #footer="{ handleCancel: closeFn }">
            <a-space>
              <a-button
                type="primary"
                @click="closeFn"
              >
                确定
              </a-button>
              <a-button @click="closeFn">
                取消
              </a-button>
            </a-space>
          </template>
        </HtUploadFile>
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="cancel">
        取消
      </a-button>
      <a-button type="primary" :loading="submitLoading" @click="onSubmit">
        确定
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps.ts'
import type { IOption } from '~/interface/IOption.ts'
import { message } from 'ant-design-vue'
import { getListByGroupId } from '~/api/common.ts'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import { useLaboratoryOptionsHook } from '~/hooks/options/useLaboratoryOptionsHook.ts'
import {
  createChemicalWaste,
  CreateChemicalWasteEntity,
  getChemicalWasteDetail,
  updateChemicalWaste,
} from '~/views/chemical/waste/reg/api.ts'
import { useWasteRegHooks } from '~/views/chemical/waste/reg/useWasteRegHooks.ts'

const props = defineProps<IDialogPropsParam<null, {
  id?: string
}>>()

const { laboratoryOptions } = useLaboratoryOptionsHook({ isAuth: 1 })

const { wasteTypeList } = useWasteRegHooks()

const unitOptions = ref<IOption[]>([])

const formRef = ref()

const id = computed(() => props.param.id)

const uploadKey = computed(() => id.value || generateGUID())

const open = ref(true)

const formState = ref(new CreateChemicalWasteEntity())

const submitLoading = ref(false)

getListByGroupId('chemical_measurement_unit_id').then((res) => {
  unitOptions.value = res.data.obj.map(item => ({
    label: item.typename,
    value: item.typename,
  }))
})

const title = computed(() => {
  if (id.value) {
    return '编辑记录'
  }

  return '新增记录'
})

if (id.value) {
  getDetail(id.value)
}

async function getDetail(reocrdId: string) {
  const res = await getChemicalWasteDetail(reocrdId)
  const { id, fluid, laboratoryId, phValue, type, unit, registrationList } = res.data
  formState.value = {
    id,
    fluid,
    laboratoryId,
    phValue,
    type,
    unit,
    registrationList,
  }
}

// 关闭弹窗
function cancel() {
  open.value = false
}

function onSubmit() {
  formRef.value.validateFields().then(async () => {
    if (!formState.value.fluid) {
      formState.value.phValue = null
    }

    submitLoading.value = true
    if (id.value) {
      await updateChemicalWaste(formState.value).finally(() => {
        submitLoading.value = false
      })
    }
    else {
      await createChemicalWaste(formState.value).finally(() => {
        submitLoading.value = false
      })
    }

    message.success('保存成功')
    props.onConfirm(null)
    cancel()
  })
}
</script>
