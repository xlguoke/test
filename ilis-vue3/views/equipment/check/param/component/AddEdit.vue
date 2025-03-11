<template>
  <HtModal
    v-model:open="visible"
    title="检校项目/参数"
    width="80vw"
    :confirm-loading="loading"
    :after-close="onClosed"
  >
    <template #footer>
      <a-button @click="onConfirm(null);visible = false">
        关闭
      </a-button>
    </template>
    <div class="pr-3">
      <BaseTitle>设备基础信息</BaseTitle>
      <a-row class=" p-3 bg-[#e5f3ff] rounded  gap-y-3 mb-3">
        <a-col :span="12">
          设备名称：<BaseText>{{ param.data.name }}</BaseText>
        </a-col>
        <a-col :span="12">
          设备编号：<BaseText>{{ param.data.equipmentSn }}</BaseText>
        </a-col>
        <a-col :span="12">
          规格型号：<BaseText>{{ param.data.standard }}</BaseText>
        </a-col>
        <a-col :span="12">
          设备类型：<BaseText>{{ param.data.type }}</BaseText>
        </a-col>
        <a-col :span="12">
          所属部门：<BaseText>{{ param.data.departName }}</BaseText>
        </a-col>
        <a-col :span="12">
          所属功能室：<BaseText>{{ param.data.laboratoryName }}</BaseText>
        </a-col>
      </a-row>
      <BaseTitle>检校项目/参数</BaseTitle>
      <a-space direction="vertical">
        <IlisFormSearch
          :entity="EquipmentCheckParamEntity"
          @reset="handleReset"
          @search="handleSearch"
        >
        </IlisFormSearch>
        <a-space v-if="!param.isDetail">
          <a-button
            :icon="h(PlusOutlined)"
            @click="AnyDialogHelper.showModel(AddEditParam, {
              data: EquipmentCheckParamEntity.fromJSON({}),
              equipmentId: param.data.id,
            }).then(() => handleReloadTable())"
          >
            添加
          </a-button>
          <a-button
            :icon="h(DeleteOutlined)"
            @click="handleDelete(selectedRows)"
          >
            删除
          </a-button>
        </a-space>
        <IlisTable
          row-key="id"
          show-index
          :entity="EquipmentCheckParamEntity"
          :data-source="dataSource"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
          :custom-row="getCustomRow"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <a-button
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(AddEditParam, {
                  data: EquipmentCheckParamEntity.fromJSON(record),
                  equipmentId: param.data.id,
                }).then(() => handleReloadTable())"
              >
                编辑
              </a-button>
              <a-button
                type="link"
                size="small"
                danger
                @click="handleDelete([record] as EquipmentCheckParamEntity[])"
              >
                删除
              </a-button>
            </template>
          </template>
        </IlisTable>
      </a-space>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { EquipmentCheckParamEntity } from '../EquipmentCheckParamEntity'
import { deleteParam, getParamPage } from '../api'
import type { EquipmentCheckParamEqEntity } from '../EquipmentCheckParamEqEntity'
import AddEditParam from './AddEditParam.vue'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { BaseTitle } from '~/components/UI'
import { useTableHooks } from '~/hooks/useTableHooks'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'

interface IDialogProps {
  data: EquipmentCheckParamEqEntity
  isDetail?: boolean
}

const props = defineProps<IDialogPropsParam<null, IDialogProps>>()

const visible = ref(true)

const {
  loading,
  dataSource,
  selectedRows,
  getCustomRow,
  getPagination,
  getRowSelection,
  handleDelete,
  handleSearch,
  handleReset,
  handleReloadTable,
} = useTableHooks<EquipmentCheckParamEntity>({
  api: getParamPage,
  delApi: deleteParam,
  sizeKey: 'rows',
  payload: {
    objId: props.param?.data?.id,
    type: '1',
  },
})

async function init() {

}
init()
</script>
