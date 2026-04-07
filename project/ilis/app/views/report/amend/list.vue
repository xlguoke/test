<template>
  <div class="h-full flex flex-col gap-3">
    <IlisFormSearch
      :entity="ReportAmendEntity"
      :field-order="['applicationFrom', 'status', 'applicationDateRange', 'q']"
      @search="customSearch"
      @reset="handleReset"
    ></IlisFormSearch>
    <a-space>
      <a-button
        v-permission="'report::amend::add'"
        :icon="h(PlusOutlined)"
        type="primary"
        @click="handleEdit('add')"
      >
        新增
      </a-button>
      <!-- 自定义属性配置 -->
      <CustomAttribute
        :customize-type="CUSTOMMIZE_TYPE"
        @save="handleReloadTable()"
      />
      <!-- 列筛选 -->
      <IlisCustomColumns
        :type="CUSTOMMIZE_TYPE"
        @confirm="handleReloadTable"
      />
      <a-button :icon="h(ExportOutlined)" @click="handleExport('report/amend/application/export')">
        导出
      </a-button>
    </a-space>
    <div ref="tableBoxRef" class="flex-1 h-0">
      <IlisTable
        row-key="id"
        show-index
        :loading="loading"
        :data-source="dataSource"
        :entity="ReportAmendEntity"
        :table-height="tableHeight"
        :custom-row="getCustomRow()"
        :custom-columns="customColumns"
        :pagination="getPagination()"
        @change="handleSortChange"
      >
        <template #bodyCell="{ text, column, record }">
          <template v-if="column.dataIndex === 'applicationId'">
            <a
              v-if="record.applicationId"
              class="text-colorPrimary"
              @click.stop="applicationDetail(record as ReportAmendEntity)"
            >预委托平台 >></a>
            <span v-else>系统内创建</span>
          </template>
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="AUDIT_STATUS_DICT.getColorByKey(text)">
              {{ AUDIT_STATUS_DICT.getLabelByKey(text) }}
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <!-- 审核中，已通过 -->
            <a-button
              v-if="[AUDIT_STATUS.UNDER_REVIEW, AUDIT_STATUS.COMPLETED].includes(record.status)"
              v-permission="'report::amend::detail'"
              type="link"
              @click.stop="handleEdit('detail', record as ReportAmendEntity)"
            >
              详情
            </a-button>
            <!-- 填写中，未通过 -->
            <template v-if="[AUDIT_STATUS.IN_FILLING, AUDIT_STATUS.NOT_APPROVED].includes(record.status)">
              <a-button
                v-permission="'report::amend::edit'"
                type="link"
                @click.stop="handleEdit('edit', record as ReportAmendEntity)"
              >
                编辑
              </a-button>
              <a-button
                v-permission="'report::amend::submit'"
                type="link"
                @click.stop="handleSubmit(record.id)"
              >
                提交
              </a-button>
            </template>
            <!-- 审核中 -->
            <a-button
              v-if="[AUDIT_STATUS.UNDER_REVIEW].includes(record.status)"
              v-permission="'report::amend::recall'"
              type="link"
              danger
              @click.stop="handleRevoke(record as ReportAmendEntity)"
            >
              撤回
            </a-button>
            <a-button
              v-permission="'report::amend::print'"
              type="link"
              @click.stop="handlePrint(record as ReportAmendEntity)"
            >
              打印
            </a-button>
            <a-button
              type="link"
              @click.stop="handleLog(record as ReportAmendEntity)"
            >
              日志
            </a-button>
            <a-button
              v-if="[AUDIT_STATUS.IN_FILLING, AUDIT_STATUS.NOT_APPROVED].includes(record.status)"
              v-permission="'report::amend::delete'"
              type="link"
              danger
              @click.stop="handleDelete([record as ReportAmendEntity])"
            >
              删除
            </a-button>
          </template>
        </template>
      </IlisTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IProcessForm } from '~/components/commonProcess'
import { ExportOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { ProcessModal, ProcessType } from '~/components/commonProcess'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import ApplicationDetail from '~/views/report/business/components/Detail.vue'
import { deleteApi, pageListApi, revokeApi, submitApi } from './api'
import AddEditModal from './components/AddEditModal.vue'
import { AUDIT_STATUS, AUDIT_STATUS_DICT, CUSTOMMIZE_TYPE, ReportAmendEntity } from './ReportAmendEntity'

const {
  loading,
  dataSource,
  customColumns,
  tableBoxRef,
  tableHeight,
  getList,
  getPagination,
  getCustomRow,
  handleSearch,
  handleReset,
  handleExport,
  handleDelete,
  handleReloadTable,
  handleSortChange,
} = useTableHooks<ReportAmendEntity>({
  customType: CUSTOMMIZE_TYPE,
  api: pageListApi,
  delApi: deleteApi,
})

/** 搜索 */
function customSearch(params: Record<string, any>) {
  if (params.applicationDateRange && params.applicationDateRange.length) {
    params.applicationDateStart = params.applicationDateRange[0]
    params.applicationDateEnd = params.applicationDateRange[1]
  }
  else {
    params.applicationDateStart = params.applicationDateEnd = ''
  }
  delete params.applicationDateRange
  handleSearch(params)
}

/** 新增、编辑、详情 */
async function handleEdit(type: string, record?: ReportAmendEntity) {
  await AnyDialogHelper.showModel(AddEditModal, {
    type,
    record: record || {},
  })
  getList()
}

/** 提交申请 */
async function handleSubmit(id: string) {
  const propParam: IProcessForm = {
    processType: ProcessType.REPORT_AMEND,
    processId: id,
    submitAuditApi: submitApi,
    submitDataTransfer: (data) => {
      const params = {
        processForm: JSON.parse(data.formPropertyJson),
        presetAuditors: JSON.parse(data.presetAuditers),
        id,
      }
      return params
    },
  }
  await AnyDialogHelper.showModel(ProcessModal, propParam)
  message.success('提交成功')
  getList()
}

/** 撤回 */
async function handleRevoke(record: ReportAmendEntity) {
  Modal.confirm({
    title: '您正在撤回报告更正申请！',
    content: `您确定要撤回报告：${record.reportCode}的更正申请吗？`,
    okText: '确认',
    centered: true,
    type: 'warning',
    onOk: async () => {
      try {
        await revokeApi(record)
        message.success('撤回成功')
        getList()
      }
      catch (err) {
        console.error(err)
      }
    },
  })
}

/** 打印 */
async function handlePrint(record: ReportAmendEntity) {
  IlisPrintUdr.commonPrint([record.id], 'ReportAmendApplicationRecord')
}

/** 日志 */
async function handleLog(record: ReportAmendEntity) {
  await AnyDialogHelper.showModel(LogModalByApi, {
    id: record.id,
    logType: '42',
  })
}

/** 申请来源-申请详情 */
async function applicationDetail(data: ReportAmendEntity) {
  await AnyDialogHelper.showModel(ApplicationDetail, {
    data: {
      id: data.applicationId,
    },
    isAudit: true,
  })
}
</script>

  <style>

  </style>
