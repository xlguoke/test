<template>
  <div class="w-full h-full flex">
    <!-- 左侧树形结构 -->
    <div class="w-[280px] h-full border-r border-[var(--colorBorder)] flex flex-col">
      <div class="flex-1 overflow-auto">
        <Tree
          :tree-select="handleTreeSelect"
          :is-title="true"
        />
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="flex-1 w-0 flex flex-col h-full p-3 gap-3">
      <!-- 搜索区域 -->
      <IlisFormSearch
        :entity="ArchiveManageQueryEntity"
        @search="handleSearch"
        @reset="handleReset"
      />

      <!-- 操作按钮区域 -->
      <a-space>
        <a-button
          v-permission="'projectArchive::deposit'"
          type="primary"
          @click="handleArchive(selectedRows)"
        >
          归档
        </a-button>
        <a-button
          v-permission="'projectArchive::siteConfig'"
          @click="handleArchiveSiteConfig"
        >
          归档地址配置
        </a-button>
        <a-button
          v-permission="'projectArchive::dataConfig'"
          @click="handleArchiveDataConfig"
        >
          归档资料配置
        </a-button>
        <a-button
          v-permission="'projectArchive::rollback'"
          @click="handleRollback(selectedRows)"
        >
          退回
        </a-button>
        <a-button
          v-permission="'projectArchive::download'"
          @click="handleDownload(selectedRows, lastSearchParams)"
        >
          下载档案文件
        </a-button>
        <IlisCustomColumns
          :type="columnType"
          @confirm="handleReloadTable"
        />
        <a-button
          v-permission="'projectArchive::export'"
          @click="handleExport"
        >
          导出
        </a-button>
      </a-space>

      <!-- 表格区域 -->
      <div ref="tableBoxRef" class="flex-1 w-full">
        <IlisTable
          row-key="id"
          :entity="ArchiveManageEntity"
          :data-source="dataSource"
          :loading="loading"
          :custom-columns="customColumns"
          :show-index="true"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
          :custom-row="getCustomRow()"
          :height="tableHeight"
          :table-width="800"
          resizable
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record }">
            <!-- 归档状态列 -->
            <template v-if="column.dataIndex === 'archiveStatus'">
              <a-tag :color="getArchiveStatusColor(record.archiveStatus)">
                {{ ArchiveStatusDict.getLabelByKey(record.archiveStatus) }}
              </a-tag>
            </template>
            <!-- 报告编号列 -->
            <template v-else-if="column.dataIndex === 'reportSn'">
              <a-button type="link" @click="handleViewReport(record as ArchiveManageEntity)">
                {{ record.reportSn }}
              </a-button>
            </template>
            <template v-else-if="column.dataIndex === 'operation'">
              <IlisTableAction :options="actionItems" :row="record"></IlisTableAction>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useTableHooks } from '~/hooks/useTableHooks'
// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
import Tree from '../testReport/components/tree.vue'
import { exportArchive, getArchiveList } from './api'
import { useArchiveManage } from './composables/useArchiveManage'
import { ArchiveManageEntity } from './entity/ArchiveManageEntity'
import { ArchiveManageQueryEntity } from './entity/ArchiveManageQueryEntity'
import { ArchiveStatusDict, EArchiveStatus } from './entity/EArchiveStatus'

/** # 组件名称 ⚙️ */
defineOptions({
  name: 'ArchiveManage',
})

/** # 当前项目 ID 📝 */
const currentProjectId = ref('')

/** # 当前选中的工程工程划分节点 📝 */
const belongsId = ref('')

/** # 列筛选类型 📝 */
const columnType = 'project_test_archive_data'

// 从 URL 获取项目 ID
const urlParams = new URLSearchParams(window.location.search)
const projectId = urlParams.get('id')
if (projectId) {
  currentProjectId.value = projectId
}

const payload = computed(() => ({
  consignProjectId: currentProjectId.value,
  ...(belongsId.value !== currentProjectId.value ? { belongsId: belongsId.value } : {}),
}))

/**
 * # 使用表格 Hooks ⚙️
 */
const {
  loading,
  dataSource,
  lastSearchParams,
  selectedRows,
  customColumns,
  tableBoxRef,
  tableHeight,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  handleSortChange,
  handleReloadTable,
} = useTableHooks<ArchiveManageEntity>({
  api: getArchiveList,
  payload,
  sizeKey: 'rows',
  customType: columnType,
  responseDataTransform(res) {
    res.rows.forEach((row: ArchiveManageEntity) => {
      row.id = row.reportId!
      if (!row.archiveStatus) {
        row.archiveStatus = EArchiveStatus.PENDING
      }
    })
    return res
  },
})

/**
 * # 使用归档管理业务逻辑 ⚙️
 */
const {
  getArchiveStatusColor,
  handleArchive,
  handleArchiveSiteConfig,
  handleArchiveDataConfig,
  handleRollback,
  handleViewReport,
  handleDownload,
  getActionItems,
} = useArchiveManage(handleReloadTable)

/** # 操作列配置 📝 */
const actionItems = getActionItems()

/**
 * # 处理树节点选择 🌲
 * @param selectedKeys 选中的节点 keys
 * @param info 节点信息
 */
function handleTreeSelect(selectedKeys: string[], info: any) {
  if (selectedKeys.length > 0 && info?.node) {
    belongsId.value = info.node.id || ''
    handleReloadTable()
  }
}

/**
 * # 处理导出 📊
 */
async function handleExport() {
  const loading = message.loading('数据导出中，请稍后...', 0)

  try {
    const params = {
      ...lastSearchParams.value,
    }

    if (selectedRows.value.length > 0) {
      params.reportIds = selectedRows.value.map(row => row.reportId).join(',')
    }

    const { data } = await exportArchive(params)

    const blob = new Blob([data], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.download = '资料归档'
    link.href = URL.createObjectURL(blob)
    link.click()

    message.success('导出成功')
  }
  catch (error) {
    console.error('导出失败:', error)
    message.error('导出失败')
  }
  finally {
    loading()
  }
}
</script>
