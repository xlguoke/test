<template>
  <div class="flex flex-col h-full">
    <a-tabs v-model:active-key="queryForm.checkType" @change="onSearch">
      <a-tab-pane v-for="item in CheckTypeDict" :key="item.key" :tab="item.label"></a-tab-pane>
    </a-tabs>

    <a-space>
      <a-input v-model:value.trim="queryForm.q" class="w-[220px]" placeholder="请输入设备编号/设备名称" :maxlength="12" />

      <a-button type="primary" @click="onSearch()">
        查询
      </a-button>
      <a-button @click="onReset()">
        重置
      </a-button>
    </a-space>

    <a-space class="my-4">
      <a-button type="primary" @click="onAdd">
        新增检查
      </a-button>
      <CustomAttribute customize-type="special_equipment_check" @save="handleReloadTable" />
      <IlisCustomColumns type="special_equipment_check" @confirm="handleReloadTable()">
        列筛选
      </IlisCustomColumns>
      <!--      <a-button> -->
      <!--        打印 -->
      <!--      </a-button> -->
      <a-button :loading="exportLoading" @click="onExport">
        导出
      </a-button>
    </a-space>

    <div ref="tableBoxRef" class="flex-1 overflow-hidden">
      <IlisTable
        row-key="id"
        :loading="loading"
        :table-height="tableHeight"
        :data-source="dataSource"
        :entity="SpecialTypeCheckEntity"
        :custom-columns="customColumns"
        :pagination="getPagination()"
      >
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'requestTime'">
            {{ record.requestTime ? dayjs(record.requestTime).format("YYYY-MM-DD HH:mm:ss") : "" }}
          </template>
          <template v-if="column.dataIndex === 'Action'">
            <a-space>
              <a-button type="link" @click.stop="onEdit(record)">
                编辑
              </a-button>
              <a-button type="link" @click.stop="onCheckDetail(record)">
                详情
              </a-button>
              <a-button type="link" @click.stop="onDel(record)">
                删除
              </a-button>
              <a-button type="link" @click.stop="onCheckLog(record)">
                日志
              </a-button>
            </a-space>
          </template>
        </template>
      </IlisTable>
    </div>

    <!-- 查看日志 -->
    <CheckLogs ref="CheckLogsRef" />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import dayjs from 'dayjs'
import { Modal, message } from 'ant-design-vue'
import type { EqCheckDataItem, GetCheckListParams } from '../api'
import { delCheckDetail, exportCheck, getCheckList } from '../api'
import CreateForm from './CreateForm.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useTableHeight } from '~/hooks/useTableHeight'
import { IlisTable } from '~/components/ilisComponent'
import CheckLogs from '~/components/CheckLogs.vue'
import { LogType } from '~/enum/LogType.ts'
import { SpecialTypeCheckEntity } from '~/views/equipment/specialType/check/SpecialTypeCheckEntity.ts'
import { CustomAttribute } from '~/components/customAttribute'
import { CheckTypeDict } from '~/views/equipment/specialType/check'
import { CheckType } from '~/views/equipment/specialType/check/interface/CreateEqCheck.ts'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'

const { tableHeight, tableBoxRef } = useTableHeight()

const exportLoading = ref(false)

const selectedRow = ref<EqCheckDataItem>()

const queryForm = ref<GetCheckListParams>({
  checkType: CheckType.Day,
})

const CheckLogsRef = ref()

const {
  loading,
  customColumns,
  dataSource,
  getPagination,
  handleSearch,
  handleReloadTable,
} = useTableHooks<SpecialTypeCheckEntity>({
  api: getCheckList,
  customType: 'special_equipment_check',
  query: queryForm,
  responseDataTransform: (res) => {
    const rows = res.rows

    rows.forEach((i) => {
      i.customValues.forEach((j) => {
        i[j.customColumnId] = j.customColumnValue
      })
    })

    return {
      rows,
      total: res.count,
    }
  },
})

function onReset() {
  queryForm.value = {
    checkType: queryForm.value.checkType,
  }
  onSearch()
}

function onSearch() {
  selectedRow.value = undefined
  handleSearch()
}

function onAdd() {
  AnyDialogHelper.showModel(CreateForm, {
    checkType: queryForm.value.checkType,
  }).then(() => handleReloadTable())
}

function onEdit(record: EqCheckDataItem) {
  AnyDialogHelper.showModel(CreateForm, {
    isEdit: true,
    id: record.id,
    checkType: queryForm.value.checkType,
  }).then(() => handleReloadTable())
}

function onCheckDetail(record: EqCheckDataItem) {
  AnyDialogHelper.showModel(CreateForm, {
    isDetail: true,
    id: record.id,
    checkType: queryForm.value.checkType,
  }).then(() => handleReloadTable())
}

function onDel(record: EqCheckDataItem) {
  Modal.confirm({
    title: '提示',
    content: '确认删除吗？',
    onOk: async () => {
      await delCheckDetail(record.id)
      message.success('操作成功！')
      onSearch()
    },
  })
}

async function onExport() {
  exportLoading.value = true
  const res = await exportCheck(queryForm.value).finally(() => {
    exportLoading.value = false
  })

  if (res.code !== 20010) {
    await downloader.excute(res.data, '特种设备人员.xlsx')
    message.success('导出成功！')
  }
  else {
    Modal.warning({
      title: '提示',
      content: res.message,
    })
  }
}

function onCheckLog(record: EqCheckDataItem) {
  CheckLogsRef.value.open({
    objectType: LogType.特种设备检查,
    objectId: record.id,
    relationQry: true,
  })
}
</script>

<style scoped lang="less">
:deep(.ant-tabs-nav) {
  margin-bottom: 16px;
  margin-top: -16px;
}
</style>
