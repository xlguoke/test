<template>
  <IlisContainer app-id="common_eq_auth">
    <BaseSpinWrapper>
      <IlisFormSearch
        :entity="AdvancedQueryEntity"
        @reset="handleReset"
        @search="onSearch"
      >
      </IlisFormSearch>

      <HtButtonGroup>
        <IlisCustomColumns
          type="equipmentAuth"
          @confirm="handleReloadTable()"
        ></IlisCustomColumns>
        <a-button :loading="clearOutUserLoading" @click="onClearOutUser">
          清除离职人员
        </a-button>
        <a-dropdown>
          <template #overlay>
            <a-menu @click="onPrint">
              <a-menu-item :key="1">
                打印（选中）
              </a-menu-item>
              <a-menu-item :key="2">
                打印全部
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>
            打印
          </a-button>
        </a-dropdown>
      </HtButtonGroup>

      <div ref="tableBoxRef" class="flex-1 h-0">
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
              <a-button type="link" size="small" @click="onAddAuthUser(record as EquipmentAuthEntity)">
                新增授权
              </a-button>
              <a-button type="link" size="small" @click="checkAuthRecord(record as EquipmentAuthEntity)">
                授权记录
              </a-button>
              <a-button type="link" size="small" @click="onCheckLog(record as EquipmentAuthEntity)">
                日志
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </BaseSpinWrapper>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { ProcessType } from '~/components/commonProcess'
import { preCheckProcess } from '~/components/commonProcess/api.ts'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import HtButtonGroup from '~/components/htButtonGroup'
import { useTableHooks } from '~/hooks/useTableHooks'
import { PrintUdrTempleteType } from '~/utils/IlisPrintUdr.ts'
import { clearOutUser, getAuthList, getAuthLog } from './api'
import AddAuthUser from './component/AddAuthUser.vue'
import CheckAuthRecord from './component/CheckAuthRecord.vue'
import CheckAuthUser from './component/CheckAuthUser.vue'
import { AdvancedQueryEntity, EquipmentAuthEntity, EquipmentAuthQuery } from './EquipmentAuthEntity'

const queryForm = ref(new EquipmentAuthQuery())

const clearOutUserLoading = ref(false)

const ilisPrintUdr = new IlisPrintUdr()

const {
  loading,
  dataSource,
  customColumns,
  tableBoxRef,
  tableHeight,
  getPagination,
  handleReset,
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
  payload: {
    onlyAuthEquipment: true,
  },
})

function onSearch(q: any) {
  selectedRowKeys.value = []
  selectedRows.value = []
  if (q.buyDate && q.buyDate[1]) {
    q.buyDateBegin = q.buyDate[0]
    q.buyDateEnd = q.buyDate[1]
  }
  else {
    q.buyDateBegin = null
    q.buyDateEnd = null
  }
  delete q.buyDate
  handleSearch(q)
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

async function onAddAuthUser(record: EquipmentAuthEntity) {
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

async function onCheckLog(record: EquipmentAuthEntity) {
  const res = await getAuthLog(record.id)
  AnyDialogHelper.showModel(LogModalByApi, {
    list: res.data,
  })
}

function checkAuthRecord(record: EquipmentAuthEntity) {
  AnyDialogHelper.showModel(CheckAuthRecord, record)
}

function onPrint({ key }: any) {
  if (key === 2) {
    onPrintAll()
    return
  }

  if (!selectedRowKeys.value.length) {
    message.warn('请先勾选需要打印的数据！')
    return
  }

  const emptyAuthUser = selectedRows.value.filter(i => !i.authUser)

  if (emptyAuthUser.length === selectedRows.value.length) {
    Modal.info({
      title: '提示',
      content: '勾选的设备均无授权操作人员，无法打印！',
    })
    return
  }

  if (emptyAuthUser.length > 0) {
    Modal.confirm({
      title: '提示',
      content: `以下设备无授权操作人员，无法打印：${emptyAuthUser.map(i => `${i.name}（${i.equipmentSn}）`).join('、')}，是否跳过这些设备，继续打印其他数据？`,
      okText: '跳过并继续打印',
      onOk: () => {
        ilisPrintUdr.commonPrint(selectedRows.value.filter(i => i.authUser).map(i => i.id), PrintUdrTempleteType.设备授权管理打印)
      },
    })
    return
  }

  ilisPrintUdr.commonPrint(selectedRowKeys.value as string[], PrintUdrTempleteType.设备授权管理打印)
}

function onPrintAll() {
  ilisPrintUdr.commonPrint([], PrintUdrTempleteType.设备授权管理打印)
}
</script>
