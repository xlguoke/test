import type { ArchiveManageEntity } from '../entity/ArchiveManageEntity'
import type { ITableActionItem } from '~/interface/ITableActionItem'
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import RollBackModal from '~/components/ilisComponent/rollback/RollBackModal.vue'
import { getBusinessParam, revokeArchiveById } from '../api'
import ArchiveDataModal from '../components/ArchiveDataModal.vue'
import ArchiveDownloadModal from '../components/ArchiveDownloadModal.vue'
import ArchiveEditModal from '../components/ArchiveEditModal.vue'
import ArchiveSiteModal from '../components/ArchiveSiteModal.vue'
import { EArchiveStatus } from '../entity/EArchiveStatus'

/**
 * # 归档状态颜色映射 🎨
 */
const archiveStatusColorMap: Record<string, string> = {
  [EArchiveStatus.PENDING]: 'orange',
  [EArchiveStatus.ARCHIVED]: 'green',
  [EArchiveStatus.AUDITING]: 'blue',
  [EArchiveStatus.REJECTED]: 'red',
}

/**
 * # 归档管理业务逻辑 Hook ⚙️
 * @param handleReloadTable 刷新表格方法
 */
export function useArchiveManage(handleReloadTable?: () => void) {
  /**
   * # 获取归档状态颜色 🎨
   * @param status 归档状态
   */
  function getArchiveStatusColor(status?: EArchiveStatus): string {
    return archiveStatusColorMap[status || ''] || 'default'
  }

  /**
   * # 处理归档（批量）📦
   * @param selectedRows 选中的行数据
   */
  function handleArchive(selectedRows: ArchiveManageEntity[]) {
    if (selectedRows.length === 0) {
      message.warning('请至少选择一条记录')
      return
    }
    if (!selectedRows.every(row => row.archiveStatus === EArchiveStatus.PENDING || row.archiveStatus === EArchiveStatus.REJECTED)) {
      message.error('只能操作待归档或未通过记录')
      return
    }
    const reportIds = selectedRows.map(row => row.reportId).join(',')
    AnyDialogHelper.showModel(
      ArchiveEditModal,
      { reportIds, isBatch: true },
    ).then(() => {
      handleReloadTable?.()
    })
  }

  /**
   * # 处理编辑归档(功能暂未放出) 📝
   * @param record 行数据
   */
  function handleEditArchive(record: ArchiveManageEntity) {
    AnyDialogHelper.showModel(ArchiveEditModal, { editId: record.reportId, isEdit: true },
    ).then(() => {
      handleReloadTable?.()
    })
  }

  /**
   * # 处理归档地址配置 ⚙️
   */
  function handleArchiveSiteConfig() {
    AnyDialogHelper.showModel(
      ArchiveSiteModal,
      {},
    )
  }

  /**
   * # 处理归档资料配置 ⚙️
   */
  function handleArchiveDataConfig() {
    AnyDialogHelper.showModel(
      ArchiveDataModal,
      {},
    )
  }

  /**
   * # 处理退回 ↩️
   * @param selectedRows 选中的行数据
   */
  async function handleRollback(selectedRows: ArchiveManageEntity[]) {
    if (selectedRows.length === 0) {
      message.warning('请至少选择一条记录')
      return
    }

    // 检查报告类型是否一致
    const reportTypes = new Set(selectedRows.map(row => row.reportType))
    if (reportTypes.size > 1) {
      message.error('检测报告和综合报告不能混合退回')
      return
    }

    const reportIds = selectedRows.map(row => row.reportId).join(',')
    const reportType = selectedRows[0].reportType || ''

    // 获取系统配置
    const { data: configData } = await getBusinessParam('REPORT_MANAGE_39')
    const targetNode = configData === 'Y' ? 'reportApprove' : undefined

    AnyDialogHelper.showModel(RollBackModal, {
      source: 'reportPrint',
      sourceObjId: reportIds,
      targetNode,
      reportType,
    }).then(() => {
      handleReloadTable?.()
    })
  }

  /**
   * # 处理查看报告详情 👁️
   * @param record 行数据
   */
  function handleViewReport(record: ArchiveManageEntity) {
    const isSynthesis = record.reportType === 'synthesis' || record.reportType === 'synthesis_Temp'
    const url = `reportPrintController.do?goReportPrintDetail&reportId=${record.reportId}&consignIds=${record.consignId}&testTaskIds=${record.testTaskIds}&reportType=${record.reportType}&moduleName=reportArchiveList&isSynthesis=${isSynthesis}`
    window.open(url, '报告详情')
  }

  /**
   * # 处理查看日志 📝
   * @param record 行数据
   */
  function handleViewLog(record: ArchiveManageEntity) {
    AnyDialogHelper.showModel(LogModalByApi, {
      id: record.reportId,
      logType: '420',
      relationQry: true,
    })
  }

  /**
   * # 处理下载档案文件 ⬇️
   * @param selectedRows 选中的行数据
   * @param queryParams 查询参数
   */
  function handleDownload(selectedRows: ArchiveManageEntity[], queryParams: Record<string, any>) {
    AnyDialogHelper.showModel(ArchiveDownloadModal, {
      selectedRows,
      queryParams,
    })
  }

  async function handleRevoke(record: ArchiveManageEntity) {
    Modal.confirm({
      title: '确认撤回吗？',
      okText: '确认',
      onOk: async () => {
        await revokeArchiveById(record.reportId!)
        message.success('撤回成功')
        handleReloadTable?.()
      },
    })
  }

  function handleArchiveDetail(record: ArchiveManageEntity) {
    AnyDialogHelper.showModel(ArchiveEditModal, { isDetail: true, editId: record.reportId })
  }

  /**
   * # 获取操作列配置 ⚙️
   * @returns 操作列配置数组
   */
  function getActionItems(): ITableActionItem<ArchiveManageEntity>[] {
    return [
      {
        label: '归档',
        visible: row => [EArchiveStatus.PENDING, EArchiveStatus.REJECTED].includes(row.archiveStatus!),
        fn: row => handleArchive([row]),
        permissions: ['projectArchive::deposit'],
      },
      {
        label: '撤回',
        visible: row => row.archiveStatus === EArchiveStatus.AUDITING,
        fn: row => handleRevoke(row),
        permissions: ['projectArchive::revoke'],
      },
      {
        label: '详情',
        visible: row => row.archiveStatus === EArchiveStatus.ARCHIVED,
        fn: row => handleArchiveDetail(row),
        permissions: ['projectArchive::detail'],
      },
      {
        label: '日志',
        fn: row => handleViewLog(row),
        permissions: ['projectArchive::viewLog'],
      },
    ]
  }

  return {
    getArchiveStatusColor,
    handleArchive,
    handleEditArchive,
    handleArchiveSiteConfig,
    handleArchiveDataConfig,
    handleRollback,
    handleViewReport,
    handleViewLog,
    handleDownload,
    getActionItems,
  }
}
