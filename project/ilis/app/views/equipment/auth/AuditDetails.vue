<template>
  <IlisContainer app-id="common_eq_auth_detail">
    <a-flex vertical class="h-full">
      <BaseTitle>{{ title }}</BaseTitle>
      <div ref="tableBoxRef" class="flex-1 h-0">
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
        <a-flex :gap="2" class="py-4">
          <span class="leading-7">附件：</span>
          <HtUploadFile
            :business-type="BUSINES_TYPE.EQ_IOT_AUTH"
            :business-id="businessKey"
            is-reandonly
          />
        </a-flex>
      </div>
    </a-flex>
  </IlisContainer>
</template>

<script setup lang='ts'>
import type { ColumnType } from 'ant-design-vue/es/table'
import type { EqAuditAuthUserEntity } from '~/views/equipment/auth/api.ts'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import { useTableHeight } from '~/hooks/useTableHeight'
import { getEqAuditAuthUser } from '~/views/equipment/auth/api.ts'

const { tableHeight, tableBoxRef } = useTableHeight()

const urlParams = new URLSearchParams(location.search)

const businessKey = urlParams.get('businessKey') as string

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
