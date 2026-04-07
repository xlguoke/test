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
      <a-form-item label="有害成分" name="hazardousIngredients" :rules="[{ required: true, message: '请选择有害成分！' }]">
        <a-select v-model:value="formState.hazardousIngredients" :options="chemicalHazardousIngredients" :placeholder="chemicalHazardousIngredients.length ? '请选择有害成分' : '请前往数据字典配置'"></a-select>
      </a-form-item>
      <a-form-item :label="`数量(${unit})`" name="quantity" :rules="[{ required: true, message: '请输入数量！' }]">
        <a-input-number v-model:value="formState.quantity" class="w-full" :min="0" :placeholder="`请输入数量(${unit})`"></a-input-number>
      </a-form-item>
      <a-form-item label="投放人" name="launchUserId" :rules="[{ required: true, message: '请选择投放人！' }]">
        <a-flex>
          <a-input v-model:value="formState.launchUserName" placeholder="请选择" readonly class="flex-1 mr-2" />
          <a-button @click="personVisible = true">
            选择
          </a-button>
        </a-flex>
      </a-form-item>
      <a-form-item label="投放日期" name="launchDate" :rules="[{ required: true, message: '请选择投放日期！' }]">
        <a-date-picker v-model:value="formState.launchDate" :value-format="EDateFormatType.YYYY_MM_DD" class="w-full" placeholder="请选择"></a-date-picker>
      </a-form-item>
      <IlisCustomPropertiesForm
        ref="customizeFormRef"
        :key="defaultCustomValues.length"
        customize-type="chemicalWasteMaterial"
        :default-value="defaultCustomValues"
        :label-col="{ style: 'width: 100px' }"
      >
      </IlisCustomPropertiesForm>
    </a-form>

    <template #footer>
      <a-button @click="cancel">
        取消
      </a-button>
      <a-button type="primary" :loading="submitLoading" @click="onSubmit">
        确定
      </a-button>
    </template>

    <PersonSelector v-model:show="personVisible" @confirm="selectPerson" />
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps.ts'
import type { IOption } from '~/interface/IOption.ts'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity.ts'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { getDictByCode } from '~/api/common.ts'
import PersonSelector from '~/components/PersonSelector.vue'
import {
  createChemicalWasteReg,
  CreateChemicalWasteRegEntity,
  getChemicalWasteReg,
  updateChemicalWasteReg,
} from '~/views/chemical/waste/reg/api.ts'

const props = defineProps<IDialogPropsParam<null, {
  id?: string
  recordId: string
  unit: string
}>>()

const personVisible = ref(false)

const customizeFormRef = ref()

const formRef = ref()

const recordId = computed(() => props.param.recordId)

const chemicalHazardousIngredients = ref<IOption[]>([])

const unit = computed(() => props.param.unit)

const id = computed(() => props.param.id)

const open = ref(true)

const formState = ref(new CreateChemicalWasteRegEntity())

const submitLoading = ref(false)

const defaultCustomValues = ref([])

const title = computed(() => {
  if (id.value) {
    return '废物编辑'
  }
  return '废物登记'
})

getDictByCode('chemicalHazardousIngredients').then((res) => {
  chemicalHazardousIngredients.value = res.data.map(item => ({
    label: item.typeName,
    value: item.typeCode,
  }))
})

if (id.value) {
  getDetail(id.value)
}

async function getDetail(_id: string) {
  const res = await getChemicalWasteReg(_id)
  const { hazardousIngredients, launchDate, launchUserName, launchUserId, quantity, customizeValues } = res.data
  formState.value = {
    id: res.data.id,
    hazardousIngredients,
    launchDate: launchDate ? dayjs(launchDate).format(EDateFormatType.YYYY_MM_DD) : '',
    launchUserName,
    launchUserId,
    quantity,
  }

  defaultCustomValues.value = customizeValues.map(i => ({
    columnId: i.columnId,
    columnName: i.columnName,
    columnValue: i.columnValue,
  }))
}

function selectPerson(rows: IUserSelectVoEntity[]) {
  const [row] = rows

  formState.value.launchUserId = row.id
  formState.value.launchUserName = row.name

  formRef.value.validate('launchUserId')
  personVisible.value = false
}

// 关闭弹窗
function cancel() {
  open.value = false
}

function onSubmit() {
  formRef.value.validateFields().then(async () => {
    const customValues = await customizeFormRef.value.getFormData()
    formState.value.customizeValueStr = JSON.stringify(customValues)

    submitLoading.value = true

    if (id.value) {
      await updateChemicalWasteReg(id.value, formState.value).finally(() => {
        submitLoading.value = false
      })
    }
    else {
      await createChemicalWasteReg(recordId.value, formState.value).finally(() => {
        submitLoading.value = false
      })
    }

    message.success('保存成功')
    props.onConfirm(null)
    cancel()
  })
}
</script>
