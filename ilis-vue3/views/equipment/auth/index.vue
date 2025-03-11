<template>
  <IlisContainer app-id="common_eq_auth">
    <div class=" h-full flex flex-col">
      <a-space>
        <a-input
          v-model:value.trim="queryForm.quickQryParam"
          class="w-[320px]"
          placeholder="请输入设备名称、编号、规格型号后回车即可查询"
          @press-enter="onSearch()"
        />

        <a-button type="primary" @click="onSearch()">
          查询
        </a-button>
        <a-button @click="onReset()">
          重置
        </a-button>
        <a-button @click="ilisAdvancedQuery.open()">
          高级查询
        </a-button>
      </a-space>

      <!-- 高级查询 -->
      <AdvancedQuery :entity="ilisAdvancedQuery" />

      <a-space class="my-4">
        <IlisCustomColumns
          type="equipmentAuth"
          @confirm="handleReloadTable()"
        ></IlisCustomColumns>
        <a-button :loading="clearOutUserLoading" @click="onClearOutUser">
          清除离职人员
        </a-button>
      </a-space>
      <div ref="tableBoxRef" class="flex-1">
        <IlisTable
          row-key="id"
          :loading="loading"
          :data-source="dataSource"
          :entity="EquipmentAuthEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
          :custom-columns="customColumns"
        >
          <template #headerCell="{ column }">
            <template v-if="column.dataIndex === 'authUser'">
              授权操作人员
              <a-tooltip title="红色标记为含离职人员">
                <QuestionCircleOutlined class="ml-1 text-sm text-blue-500 " />
              </a-tooltip>
            </template>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'authUser'">
              <span
                class="text-blue-500 underline cursor-pointer"
                :class="{
                  'text-red-500': record.outUserCount > 0,
                }"
                @click="AnyDialogHelper.showModel(CheckAuthUser, EquipmentAuthEntity.fromJSON(record)).then(() => handleReloadTable())"
              >{{ record.authUser }}</span>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button type="link" size="small" @click="onAddAuthUser(record)">
                新增授权
              </a-button>
              <a-button type="link" size="small" @click="checkAuthRecord(record)">
                授权记录
              </a-button>
              <a-button type="link" size="small" @click="onCheckLog(record)">
                日志
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { AdvancedQueryConfigs, EquipmentAuthEntity, EquipmentAuthQuery } from './EquipmentAuthEntity'
import { clearOutUser, getAuthList, getAuthLog } from './api'
import AddAuthUser from './component/AddAuthUser.vue'
import CheckAuthUser from './component/CheckAuthUser.vue'
import CheckAuthRecord from './component/CheckAuthRecord.vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { IlisContainer, IlisCustomColumns, IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import { preCheckProcess } from '~/components/commonProcess/api.ts'
import { ProcessType } from '~/components/commonProcess'
import { IlisAdvancedQuery } from '~/components/IlisAdvancedQuery'
import AdvancedQuery from '~/components/IlisAdvancedQuery/AdvancedQuery.vue'

const queryForm = ref(new EquipmentAuthQuery())

const ilisAdvancedQuery = reactive(new IlisAdvancedQuery<EquipmentAuthQuery>({
  configs: AdvancedQueryConfigs,
  queryParams: queryForm.value,
  onQuery: () => {
    onSearch()
  },
})) as IlisAdvancedQuery<EquipmentAuthQuery>

const clearOutUserLoading = ref(false)

const {
  loading,
  dataSource,
  customColumns,
  tableBoxRef,
  tableHeight,
  getPagination,
  handleSearch,
  handleReloadTable,
  selectedRowKeys,
  selectedRows,
  getRowSelection,
  getList,
} = useTableHooks<EquipmentAuthEntity>({
  api: getAuthList,
  customType: 'equipmentAuth',
  query: queryForm,
})

function onSearch() {
  selectedRowKeys.value = []
  selectedRows.value = []
  handleSearch()
}

function onReset() {
  queryForm.value = new EquipmentAuthQuery()
  ilisAdvancedQuery.queryParams = queryForm.value
  ilisAdvancedQuery.updateQueryTags()
  onSearch()
}

function onClearOutUser() {
  if (!selectedRowKeys.value.length) {
    message.warn('请勾选要操作的数据！')
    return
  }

  Modal.confirm({
    title: '提示',
    content: '确认进行清除离职人员操作？',
    onOk: async () => {
      clearOutUserLoading.value = true
      await clearOutUser(selectedRowKeys.value.join(',')).finally(() => {
        clearOutUserLoading.value = false
      })
      message.success('操作成功！')
      await getList()
    },
  })
}

async function onAddAuthUser(record) {
  // 是否走流程
  const AUTH_EQUIPMENT_PROCESS = await getBusinessParam('AUTH_EQUIPMENT_PROCESS')

  if (AUTH_EQUIPMENT_PROCESS) {
    const { data: { haveProcess } } = await preCheckProcess(ProcessType.EQ_USER_AUTH)

    if (!haveProcess) {
      Modal.warning({
        title: '提示',
        content: '未配置审批流程，无法新增授权人员！',
      })
      return
    }
  }

  AnyDialogHelper.showModel(AddAuthUser, { record: EquipmentAuthEntity.fromJSON(record), isAdd: true }).then(() => handleReloadTable())
}

async function onCheckLog(record) {
  const res = await getAuthLog(record.id)
  AnyDialogHelper.showModel(LogModalByApi, {
    list: res.data,
  })
}

function checkAuthRecord(record: EquipmentAuthEntity) {
  AnyDialogHelper.showModel(CheckAuthRecord, record)
}
</script>
