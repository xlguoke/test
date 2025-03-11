<template>
  <IlisContainer app-id="common_eq_auth_detail">
    <a-flex vertical class="h-full">
      <BaseTitle>{{ title }}</BaseTitle>
      <div ref="tableBoxRef" class="flex-1">
        <a-table
          row-key="id"
          :columns="columns"
          :data-source="dataSource.detail"
          :pagination="false"
          :loading="loading"
          :scroll="{ y: tableHeight }"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'personStatus'">
              <span v-if="record.personStatus === '0'">在职</span>
              <span v-if="record.personStatus === '1'">离职</span>
            </template>
          </template>
        </a-table>
      </div>
    </a-flex>
  </IlisContainer>
</template>

<script setup lang='ts'>
import type { ColumnType } from 'ant-design-vue/es/table'
import { IlisContainer } from '~/components/ilisComponent'
import type { EqAuditAuthUserEntity } from '~/views/equipment/auth/api.ts'
import { getEqAuditAuthUser } from '~/views/equipment/auth/api.ts'
import { useTableHeight } from '~/hooks/useTableHeight'

const { tableHeight, tableBoxRef } = useTableHeight()

const urlParams = new URLSearchParams(location.search)

const businessKey = urlParams.get('businessKey')

const loading = ref(false)

const dataSource = ref<EqAuditAuthUserEntity>({
  name: '',
  equipmentSn: '',
  detail: [],
})

const title = computed(() => {
  if (dataSource.value.equipmentSn) {
    return `${dataSource.value.name}（${dataSource.value.equipmentSn}）的授权操作人员`
  }
  return `${dataSource.value.name}的授权操作人员`
})

const columns: ColumnType[] = [
  {
    title: '姓名',
    dataIndex: 'personName',
    width: 85,
  },
  {
    title: '身份证号',
    dataIndex: 'identityNumber',
    width: 120,
  },
  {
    title: '任职部门',
    dataIndex: 'department',
    width: 120,
  },
  {
    title: '人员状态',
    dataIndex: 'personStatus',
    width: 80,
  },
]

async function getList() {
  if (businessKey) {
    loading.value = true
    const res = await getEqAuditAuthUser(businessKey).finally(() => {
      loading.value = false
    })

    dataSource.value = res.data
  }
}

getList()
</script>
