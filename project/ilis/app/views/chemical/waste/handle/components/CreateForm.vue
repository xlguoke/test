<template>
  <ht-modal
    v-model:open="open"
    :title="title"
    width="640px"
    :mask-closable="false"
    :confirm-loading="submitLoading"
    @cancel="cancel"
  >
    <a-form ref="formRef" :model="formState" class="pt-4 w-[98%]" :label-col="{ style: 'width: 100px' }" :wrapper-col="{ style: 'flex: 1' }">
      <a-form-item label="废物名称" name="name" :rules="[{ required: true, message: '请输入废物名称！' }]">
        <a-input v-model:value.trim="formState.name" placeholder="请输入" :disabled="isDetail" />
      </a-form-item>
      <a-form-item label="废物类型" name="type" :rules="[{ required: true, message: '请选择废物类型！' }]">
        <a-select v-model:value="formState.type" :options="wasteTypeList" placeholder="请输入" :disabled="isDetail" @change="onChangeType"></a-select>
      </a-form-item>
      <a-form-item label="关联废物" name="chemicalWasteMaterialIds">
        <a-table
          row-key="id"
          :columns="columns"
          :data-source="chemicalWasteMaterialList"
          :pagination="false"
          bordered
        >
          <template #bodyCell="{ record, column }">
            <template v-if="column.dataIndex === 'Action'">
              <a-button type="link" danger @click="onDelRelation(record)">
                删除
              </a-button>
            </template>
          </template>
        </a-table>
        <a-button v-if="!isDetail" block class="mt-2" @click="onAddMaterial">
          新增
        </a-button>
      </a-form-item>
      <a-form-item label="处理数量" name="quantity" :rules="[{ required: true, message: '请输入处理数量！' }]">
        <a-flex>
          <a-input-number v-model:value.trim="formState.quantity" :min="0" class="flex-1 mr-2" placeholder="请输入" :disabled="isDetail" />
          <div class="w-[100px]">
            <a-select v-model:value.trim="formState.unit" :options="unitOptions" placeholder="请选择" :disabled="isDetail"></a-select>
          </div>
        </a-flex>
      </a-form-item>
      <a-form-item label="处理部门" name="departId" :rules="[{ required: true, message: '请选择处理部门！' }]">
        <a-flex>
          <a-input v-model:value="formState.departName" class="flex-1 mr-2" readonly placeholder="请选择" :disabled="isDetail" />
          <a-button v-if="!isDetail" @click="showOrgSelector = true">
            选择
          </a-button>
        </a-flex>
      </a-form-item>
      <a-form-item label="处理日期" name="launchDate" :rules="[{ required: true, message: '请选择处理日期！' }]">
        <a-date-picker v-model:value="formState.launchDate" placeholder="请选择" :disabled="isDetail" class="w-full" :value-format="EDateFormatType.YYYY_MM_DD"></a-date-picker>
      </a-form-item>
      <a-form-item label="有害成分" name="hazardousIngredients">
        <a-select v-model:value="formState.hazardousIngredients" mode="multiple" :disabled="isDetail" :options="chemicalHazardousIngredients" placeholder="请选择有害成分"></a-select>
      </a-form-item>
      <IlisCustomPropertiesForm
        ref="customizeFormRef"
        :key="defaultCustomValues.length"
        customize-type="chemicalWasteMaterialHandle"
        :default-value="defaultCustomValues"
        :disabled="isDetail"
        :label-col="{ style: 'width: 100px' }"
      >
      </IlisCustomPropertiesForm>
      <a-form-item label="备注" name="remark">
        <a-textarea v-model:value.trim="formState.remark" :rows="4" placeholder="请输入" :disabled="isDetail" />
      </a-form-item>
      <a-form-item label="附件">
        <HtUploadFile
          v-if="uploadKey"
          :business-type="BUSINES_TYPE.CHEMICAL"
          force-init
          :business-id="uploadKey"
          :is-reandonly="isDetail"
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
        {{ isDetail ? "关闭" : "取消" }}
      </a-button>
      <a-button v-if="!isDetail" type="primary" :loading="submitLoading" @click="onSubmit">
        确定
      </a-button>
    </template>

    <!-- 部门选择器 -->
    <OrgSelector
      v-model:show="showOrgSelector"
      @confirm="handleOrg($event)"
    />
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps.ts'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity.ts'
import type { IOption } from '~/interface/IOption.ts'
import type { ChemicalWasteDTO } from '~/views/chemical/waste/reg/api.ts'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import { getDictByCode, getListByGroupId } from '~/api/common.ts'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import {
  createChemicalWasteHandle,
  CreateChemicalWasteHandleEntity,
  getChemicalWasteHandleDetail,
  updateChemicalWasteHandle,
} from '~/views/chemical/waste/handle/api.ts'
import RelationChemicalWaste from '~/views/chemical/waste/handle/components/RelationChemicalWaste.vue'
import { useWasteRegHooks } from '~/views/chemical/waste/reg/useWasteRegHooks.ts'

const props = defineProps<IDialogPropsParam<null, {
  id?: string
  isDetail?: boolean
}>>()

const { wasteTypeList } = useWasteRegHooks()

const unitOptions = ref<IOption[]>([])

const formRef = ref()

const customizeFormRef = ref()

const id = computed(() => props.param.id)

const isDetail = computed(() => props.param.isDetail)

const uploadKey = computed(() => id.value || generateGUID())

const open = ref(true)

const formState = ref(new CreateChemicalWasteHandleEntity())

const submitLoading = ref(false)

const defaultCustomValues = ref([])

const chemicalWasteMaterialList = ref<ChemicalWasteDTO[]>([])

const chemicalHazardousIngredients = ref<IOption[]>([])

const showOrgSelector = ref(false)

const columns = ref([
  { title: '序号', dataIndex: 'index', align: 'center', customRender: ({ index }) => (index + 1), width: 65 },
  { title: '功能室名称', dataIndex: 'laboratoryName' },
  { title: '总数量', dataIndex: 'totalValue', width: 85 },
  { title: '提交日期', dataIndex: 'submitDate', customRender: ({ text }) => text ? dayjs(text).format(EDateFormatType.YYYY_MM_DD_HH_MM_SS) : '', width: 150 },
])

if (!isDetail.value) {
  columns.value.push({ title: '操作', dataIndex: 'Action', width: 70 })
}

getDictByCode('chemicalHazardousIngredients').then((res) => {
  chemicalHazardousIngredients.value = res.data.map(item => ({
    label: item.typeName,
    value: item.typeCode,
  }))
})

getListByGroupId('chemical_measurement_unit_id').then((res) => {
  unitOptions.value = res.data.obj.map(item => ({
    label: item.typename,
    value: item.typename,
  }))
})

const title = computed(() => {
  if (isDetail.value) {
    return '详情'
  }

  if (id.value) {
    return '编辑申请'
  }

  return '新增申请'
})

if (id.value) {
  getDetail(id.value)
}

function onDelRelation(record: ChemicalWasteDTO) {
  chemicalWasteMaterialList.value = chemicalWasteMaterialList.value.filter(i => i.id !== record.id)
  formState.value.chemicalWasteMaterialIds = chemicalWasteMaterialList.value.map(i => i.id).join(',')
  setDefaultQuantity()
}

function onChangeType() {
  formState.value.chemicalWasteMaterialIds = ''
  chemicalWasteMaterialList.value = []
}

function onAddMaterial() {
  if (!formState.value.type) {
    Modal.info({
      title: '提示',
      content: '请先选择废物类型！',
    })
    return
  }

  AnyDialogHelper.showModel(RelationChemicalWaste, {
    checkItems: unref(chemicalWasteMaterialList.value),
    type: formState.value.type,
  }).then((res) => {
    chemicalWasteMaterialList.value = res as ChemicalWasteDTO[]
    formState.value.chemicalWasteMaterialIds = res.map(i => i.id).join(',')
    setDefaultQuantity()
  })
}

function setDefaultQuantity() {
  const units: string[] = []
  const hazardousIngredientsVal: string[] = []
  let sum = 0

  if (!chemicalWasteMaterialList.value.length) {
    return
  }

  chemicalWasteMaterialList.value.forEach((item) => {
    if (!units.includes(item.unit)) {
      units.push(item.unit)
    }

    item.registrationList.forEach((item2) => {
      sum += item2.quantity || 0

      if (item2.hazardousIngredients && !hazardousIngredientsVal.includes(item2.hazardousIngredients)) {
        hazardousIngredientsVal.push(item2.hazardousIngredients)
      }
    })
  })

  if (units.length === 1) {
    formState.value.quantity = sum
    formState.value.unit = units[0]
  }

  if (hazardousIngredientsVal.length) {
    formState.value.hazardousIngredients = hazardousIngredientsVal
  }
}

async function getDetail(reocrdId: string) {
  const res = await getChemicalWasteHandleDetail(reocrdId)
  const { id, customizeValues, launchDate, departName, departId, quantity, type, unit, name, remark, hazardousIngredients } = res.data
  formState.value = {
    id,
    chemicalWasteMaterialIds: (res.data.chemicalWasteMaterialList || []).map(i => i.id).join(','),
    departName,
    departId,
    launchDate: launchDate ? dayjs(launchDate).format(EDateFormatType.YYYY_MM_DD) : '',
    name,
    remark,
    quantity,
    type,
    unit,
    hazardousIngredients: hazardousIngredients ? hazardousIngredients.split(',') : [],
  }

  chemicalWasteMaterialList.value = res.data.chemicalWasteMaterialList || []

  defaultCustomValues.value = customizeValues.map(i => ({
    columnId: i.columnId,
    columnName: i.columnName,
    columnValue: i.columnValue,
  }))
}

function handleOrg(rows: IDepartmentEntity[]) {
  const [row] = rows

  formState.value.departId = row.id
  formState.value.departName = row.text

  formRef.value.validate('departId')
  showOrgSelector.value = false
}

// 关闭弹窗
function cancel() {
  open.value = false
}

function onSubmit() {
  formRef.value.validateFields().then(async () => {
    submitLoading.value = true

    const customValues = await customizeFormRef.value.getFormData()
    formState.value.customizeValueStr = JSON.stringify(customValues)

    const formData = {
      ...formState.value,
      hazardousIngredients: formState.value.hazardousIngredients.join(','),
    }

    if (id.value) {
      await updateChemicalWasteHandle(formData).finally(() => {
        submitLoading.value = false
      })
    }
    else {
      await createChemicalWasteHandle(formData).finally(() => {
        submitLoading.value = false
      })
    }

    message.success('保存成功')
    props.onConfirm(null)
    cancel()
  })
}
</script>
