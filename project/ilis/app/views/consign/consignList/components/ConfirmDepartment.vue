<template>
  <ht-modal
    v-model:open="visible"
    title="确认检测部门"
    width="70%"
    fixed-height
    hide-confirm
    :loading="loading"
    :after-close="onClosed"
    @cancel="visible = false;onConfirm(null)"
  >
    <div class="flex flex-col h-full gap-2">
      <div>
        <a-button type="primary" @click="batchSetDepart">
          批量设置检测部门
        </a-button>
      </div>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          :entity="TestDepartmentEntity"
          :data-source="dataSource"
          :table-height="tableHeight"
          :pagination="false"
          :custom-row="getCustomRow()"
          :row-selection="getRowSelection()"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'department'">
              <a-input-group compact class="w-[140px] !flex" @click.stop="() => {}">
                <a-input :value="text" readonly>
                  <template #suffix>
                    <CloseOutlined v-if="text" class="text-gray-300 hover:text-gray-500 cursor-pointer" @click="delRow(record.id)" />
                  </template>
                </a-input>
                <a-button type="primary" @click="addEditRow([record] as TestDepartmentEntity[])">
                  选择
                </a-button>
              </a-input-group>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { CloseOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import VMCallOrgSelector from '~/components/selectorViaMethodCall/VMCallOrgSelector.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { objectDestributeApi, updateObjectDestributeApi } from '../api'
import { TestDepartmentEntity } from '../ConsignListEntity'

export interface PropParam {
  consignIds: string[]
}

const props = defineProps<IDialogPropsParam<null, PropParam>>()
const visible = ref(true)

const {
  loading,
  dataSource,
  selectedRows,
  tableBoxRef,
  tableHeight,
  getList,
  getCustomRow,
  getRowSelection,
} = useTableHooks<TestDepartmentEntity>({
  api: objectDestributeApi,
  query: ref({
    consignIds: props.param.consignIds.toString(),
  }),
  isPagination: false,
  responseDataTransform(res) {
    return {
      rows: res,
      total: res.length,
    }
  },
})

async function delRow(id: string) {
  try {
    loading.value = true
    await updateObjectDestributeApi([{
      objectId: id,
    }])
    getList()
    message.success('删除成功')
  }
  finally {
    loading.value = false
  }
}

async function addEditRow(rows: TestDepartmentEntity[]) {
  const res = await AnyDialogHelper.showSelector(VMCallOrgSelector, {
    initData: {
      showAll: true,
      defaultAll: false,
    } as any,
    checkedRows: rows.map(d => ({
      id: d.departmentId,
      text: d.department,
    })),
  })
  try {
    loading.value = true
    const params = rows.map(d => ({
      objectId: d.id,
      departmentId: res[0].id,
      department: res[0].text,
    }))
    await updateObjectDestributeApi(params)
    getList()
    message.success('修改成功')
  }
  finally {
    loading.value = false
  }
}

function batchSetDepart() {
  if (selectedRows.value.length === 0) {
    message.warning('请先选择数据')
    return
  }
  addEditRow(selectedRows.value)
}
</script>

<style>

</style>
