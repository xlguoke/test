<template>
  <div>
    <div style="padding-bottom: 10px">
      <a-button
        style="margin-right: 5px"
        :loading="updateLoading"
        @click="updateData"
      >
        保存
      </a-button>
    </div>
    <IlisTable
      row-key="id"
      :loading="loading"
      :data-source="dataSource"
      :entity="LaboratoryEntity"
      :row-selection="getRowSelection()"
      :selected-row-keys="selectedRowKeys"
      bordered
      :row-class-name="rowClassName"
    >
    </IlisTable>
  </div>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getQueryVariable } from '~/providers/common/utils'
import { getAllFunctionRoom, getFunctionRoomAuthorityByUserId, saveFunctionRoomAuthority } from '../../api'
import { LaboratoryEntity } from '../LaboratoryEntity'

interface LaboratoryItem {
  laboratory: {
    id: string | number
  }
}

const userId = ref(getQueryVariable('userId'))
const {
  loading,
  dataSource,
  selectedRowKeys,
  selectedRows,
  getRowSelection,
  handleReloadTable,
} = useTableHooks<LaboratoryEntity>({
  api: getAllFunctionRoom,
  payload: {
    size: 9999,
  },
  responseDataTransform: (res) => {
    return {
      rows: res.obj.rows,
      total: res.obj.count,
    }
  },

})
onMounted(() => {
  getRoomAuthorityByUserIdData() // 初始化获取权限数据
})

watch(() => dataSource.value, () => {
  getRoomAuthorityByUserIdData() // 分页重新获取权限数据
})

const updateLoading = ref(false)
function rowClassName(record: any, index: any) {
  let className = 'light-row'
  if (index % 2 === 1)
    className = 'dark-row'
  return className
}
async function updateData() {
  // 更新人员的权限信息
  updateLoading.value = true
  const stringKeys = selectedRowKeys.value.map(key => String(key))
  await saveFunctionRoomAuthority(userId.value, stringKeys).finally(() => {
    updateLoading.value = false
  })
  message.success('操作成功')
  handleReloadTable()
  getRoomAuthorityByUserIdData() // 更新重新获取权限数据
}
async function getRoomAuthorityByUserIdData() { // 获取当前人员的权限信息
  const { data } = await getFunctionRoomAuthorityByUserId(userId.value) as {
    data: LaboratoryItem[]
  }
  selectedRows.value = data?.map((item: any) => item.laboratory)
  selectedRowKeys.value = selectedRows.value?.map((item: any) => item.id) // selectedRowKeys与selectedRows相对顺序保持一致
}
</script>

<style lang="less">
@import './index.less';
</style>
