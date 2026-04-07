<template>
  <a-space direction="vertical" class=" w-full mb-3">
    <a-space v-if="!isReadonly">
      <a-button v-if="!EQUIPMENT_10" @click="handleUseParam">
        引用设备检校参数
      </a-button>
      <IlisCustomColumns
        type="EQ_CHECKED_ITEM"
        @confirm="getChosenCustomColumns()"
      ></IlisCustomColumns>
    </a-space>
    <IlisTable
      :data-source="checkItems"
      :entity="CertConfirmEntity"
      :custom-columns="customColumns"
      :field-list="(isReadonly as boolean) ? CertConfirmEntity.getTableFieldList()?.filter(i => !['operation'].includes(i)) : CertConfirmEntity.getTableFieldList()"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.dataIndex === 'isCorrect'">
          <div class="w-full flex gap-2">
            <IlisInput
              v-model="record.isCorrect"
              class="flex-1"
              style="width: 60px !important;"
              :entity="CertConfirmEntity"
              :disabled="isReadonly"
              field="isCorrect"
            ></IlisInput>
            <a-input
              v-model:value="record.correctValue"
              class="flex-1"
              :disabled="record.isCorrect !== '是' || isReadonly"
            ></a-input>
          </div>
        </template>
        <template v-if="column.dataIndex === 'checkItemName' && isOcrConfirm">
          <div v-if="!record.matched" style="color: rgb(255, 3, 3);">
            {{ record.checkItemName }}
          </div>
          <div v-else>
            {{ record.checkItemName }}
          </div>
        </template>
        <template v-if="CertConfirmEntity.getFormFieldList()?.filter(i => i !== 'isCorrect').includes(column.dataIndex as string) && !isReadonly">
          <IlisInput
            v-model="record[column.dataIndex as string]"
            :entity="CertConfirmEntity"
            :field="(column.dataIndex as string)"
          ></IlisInput>
        </template>
        <template v-if="column.dataIndex === 'operation' && !isReadonly">
          <a-button type="link" @click="handleAddRecord(record as CertConfirmEntity)">
            添加过程记录
          </a-button>
          <a-button type="link" danger @click="handleRemove(index)">
            移除
          </a-button>
        </template>
      </template>
    </IlisTable>
  </a-space>
</template>

<script lang="ts" setup>
import type { EquipmentCheckParamEntity } from '../../param/EquipmentCheckParamEntity'
import type { ICustomColumns } from '~/hooks/useTableHooks'
import type { DeviceEntity } from '~/views/equipment/DeviceEntity'
import { message } from 'ant-design-vue'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { getChosenColumns } from '~/api/common'
import ParamsEditSelector from '~/views/equipment/check/param/component/AddEdit.vue'
import { EquipmentCheckParamEqEntity } from '../../param/EquipmentCheckParamEqEntity'
import { CertConfirmEntity } from '../CertConfirmEntity'
import AddRecord from './AddRecord.vue'

const props = defineProps<{
  modelValue: CertConfirmEntity[]
  deviceInfo: DeviceEntity
  isOcrConfirm?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: CertConfirmEntity[]): void
}>()

const isReadonly = inject('isReadonly') as boolean

const EQUIPMENT_10 = inject('EQUIPMENT_10')

const checkItems = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  },
})

/**  # 自定义列配置（通过自定义列组件配置） */
const customColumns = ref<ICustomColumns[]>([])

/**
 * # 获取表格配置自定义列的已选列
 */
async function getChosenCustomColumns() {
  const { data } = await getChosenColumns('EQ_CHECKED_ITEM')
  customColumns.value = data?.map((item) => {
    return {
      title: item.columnName,
      dataIndex: item.columnKey,
    }
  }) || []
}
getChosenCustomColumns()

async function handleUseParam() {
  if (!props.deviceInfo?.id) {
    return message.warning('请选择设备')
  }
  let res = await AnyDialogHelper.showModel<EquipmentCheckParamEntity[]>(ParamsEditSelector, {
    data: EquipmentCheckParamEqEntity.fromJSON(props.deviceInfo),
    isBySel: true,
  })
  res.forEach((item) => {
    item.checkItemId = item.id
    item.checkItemName = item.name
    item.applyRegulations = item.checkConfirmReference
  })
  res = res.filter((item: EquipmentCheckParamEntity) => {
    return !checkItems.value.find(item2 => item2.checkItemId === item.checkItemId)
  })
  checkItems.value = [...checkItems.value, ...CertConfirmEntity.fromJsonArray(res)]
}

function handleRemove(index: number) {
  checkItems.value.splice(index, 1)
}

async function handleAddRecord(record: CertConfirmEntity) {
  const res = await AnyDialogHelper.showModel<CertConfirmEntity>(AddRecord, record)
  record = CertConfirmEntity.fromJSON(res)
}
</script>
