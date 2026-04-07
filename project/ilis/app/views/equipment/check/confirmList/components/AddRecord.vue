<!-- 添加过程记录弹窗 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    title="自定义检校信息"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <div class="flex flex-col gap-3 w-full ">
      <a-space>
        <a-button type="primary" @click="handleAddRecord">
          新增
        </a-button>
        <a-button danger @click="handleRemove">
          删除
        </a-button>
        <CustomAttribute
          :customize-type="param.checkItemId"
          @save="getCustomPropertieList(param?.details?.map(i => i.customValues || [] as ICustomProperties[]) || [[]])"
        />
      </a-space>
      <IlisTable
        ref="tableRef"
        row-key="id"
        class=" w-full"
        table-height="55vh"
        :entity="CustomRecordEntity"
        :data-source="dataSourceAll"
        :row-selection="getRowSelection()"
        :custom-row="getCustomRow()"
        :extra-columns="extraColumns"
        :scroll="{
          x: '1100px',
        }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="CustomRecordEntity.getFormFieldList().includes(column.dataIndex as string)">
            <IlisInput
              v-model="record[column.dataIndex as string]"
              :entity="CustomRecordEntity"
              :field="(column.dataIndex as string)"
            ></IlisInput>
          </template>
          <template v-if="customPropertiesArr[index]?.map(i => i.id)?.includes(column.dataIndex as string)">
            <IlisCustomPropertiesInput
              v-model="customPropertiesArr[index][customPropertiesArr[index]?.findIndex(i => i.id === column.dataIndex)].columnValue"
              :custom-option="customPropertiesArr[index]?.find(i => i.id === column.dataIndex)!"
              :placeholder="getPlaceHolder(customPropertiesArr[index]?.find(i => i.id === column.dataIndex)!)"
            ></IlisCustomPropertiesInput>
          </template>
        </template>
      </IlisTable>
      <a-form-item label="确认意见：" :label-col="{ span: 24 }">
        <a-textarea v-model:value="detailOpinion" placeholder="请输入确认意见" :rows="4" />
      </a-form-item>
    </div>
  </ht-modal>
</template>

<script setup lang="ts">
import type { ICustomProperties } from '../../checkSend/component/customRecord'
import type { CertConfirmEntity } from '../CertConfirmEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { ICustomColumns } from '~/hooks/useTableHooks'
import { cloneDeep } from '@unovis/ts'
import { message } from 'ant-design-vue'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { useCustomPropertiesHooks } from '~/hooks/useCustomPropertiesHooks'
import { useLocalTableHooks } from '~/hooks/useLocalTableHooks'
import { CustomRecordEntity } from '../CustomRecordEntity'

const props = defineProps<IDialogPropsParam<CertConfirmEntity, CertConfirmEntity>>()

const internalOpen = ref(true)

const initData = ref(props.param?.details || [])

const detailOpinion = ref(props.param?.detailOpinion)

const tableRef = ref()

const {
  dataSourceAll,
  selectedRowKeys,
  getRowSelection,
  getCustomRow,
} = useLocalTableHooks<CustomRecordEntity>({
  dataSource: initData,
})

const {
  customPropertiesArr,
  getPlaceHolder,
  getCustomPropertieList,
} = useCustomPropertiesHooks({
  customizeType: props.param?.checkItemId,
  initData: props.param?.details?.map(i => i.customValues || [] as ICustomProperties[]) || [[]],
  isMultipleType: true,
})

const extraColumns = ref<ICustomColumns[]>([])

watch(() => customPropertiesArr, () => {
  extraColumns.value = customPropertiesArr.value?.[0]?.map((i) => {
    return {
      title: i.columnName,
      dataIndex: i.id,
      width: 100,
    }
  })
}, { deep: true })

function handleAddRecord() {
  initData.value.push(CustomRecordEntity.fromJSON({ id: Date.now() }))
}

function handleRemove() {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要删除的数据')
    return
  }
  dataSourceAll.value = dataSourceAll.value.filter(item => !selectedRowKeys.value.includes(item.id))
}

/**
 * # 确认
 */
function handleConfirm() {
  const result = cloneDeep(props.param)
  result.details = dataSourceAll.value
  result.details.forEach((i, index) => {
    i.customValues = customPropertiesArr.value?.[index]?.map((j) => {
      return {
        ...j,
        columnId: j.id,
      } as unknown as ICustomProperties
    })
  })
  result.detailOpinion = detailOpinion.value
  props.onConfirm(result)
  internalOpen.value = false
}
</script>
