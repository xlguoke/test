import type { PurchaseAcceptanceEntity } from '../entity/PurchaseAcceptanceEntity'
import type { IProcessForm } from '~/components/commonProcess'
import type { ITableActionItem } from '~/interface/ITableActionItem'
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { ProcessModal, ProcessType } from '~/components/commonProcess'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import { deletePurchaseAcceptance, revokePurchaseAcceptance, submitPurchaseAcceptance } from '../api'

import PurchaseAcceptanceDetailModal from '../components/PurchaseAcceptanceDetailModal.vue'
import PurchaseAcceptanceModal from '../components/PurchaseAcceptanceModal.vue'
import { EPurchaseAcceptanceStatus } from '../entity/PurchaseAcceptanceEntity'

/**
 * 购置验收组合式函数
 */
export function usePurchaseAcceptance() {
  /** 表格操作项配置 */
  const actionItems = computed<ITableActionItem<PurchaseAcceptanceEntity>[]>(() => [
    {
      label: '详情',
      fn: (row: PurchaseAcceptanceEntity) => handleDetail(row),
      permissions: ['ref_purchase_accept_detail'],
    },
    {
      label: '编辑',
      visible: (row: PurchaseAcceptanceEntity) => row.status === EPurchaseAcceptanceStatus.Writing || row.status === EPurchaseAcceptanceStatus.Rejected,
      permissions: ['ref_purchase_accept_edit'],
      fn: (row: PurchaseAcceptanceEntity) => handleEdit(row),
    },
    {
      label: '提交',
      visible: (row: PurchaseAcceptanceEntity) => row.status === EPurchaseAcceptanceStatus.Writing || row.status === EPurchaseAcceptanceStatus.Rejected,
      permissions: ['ref_purchase_accept_submit'],
      fn: (row: PurchaseAcceptanceEntity) => handleSubmit(row),
    },
    {
      label: '撤回',
      permissions: ['ref_purchase_accept_revoke'],
      visible: (row: PurchaseAcceptanceEntity) => row.status === EPurchaseAcceptanceStatus.Auditing,
      fn: (row: PurchaseAcceptanceEntity) => handleRevoke(row),
    },
    {
      label: '打印',
      permissions: ['ref_purchase_accept_print'],
      fn: (row: PurchaseAcceptanceEntity) => handlePrint(row),
    },
    {
      label: '删除',
      danger: true,
      visible: (row: PurchaseAcceptanceEntity) => row.status === EPurchaseAcceptanceStatus.Writing || row.status === EPurchaseAcceptanceStatus.Rejected,
      permissions: ['ref_purchase_accept_delete'],
      fn: (row: PurchaseAcceptanceEntity) => handleDelete(row),
    },
    {
      label: '日志',
      permissions: ['ref_purchase_accept_log'],
      fn: (row: PurchaseAcceptanceEntity) => {
        AnyDialogHelper.showModel(LogModalByApi, {
          id: row.id,
          logType: '45',
        })
      },
    },
  ])

  /** 重新加载表格函数引用 */
  let handleReloadTable: (() => void) | undefined

  /**
   * 设置重新加载表格函数
   */
  function setReloadTable(fn: () => void) {
    handleReloadTable = fn
  }

  /**
   * 打开编辑弹窗
   */
  function handleEdit(row: PurchaseAcceptanceEntity) {
    AnyDialogHelper.showModel(PurchaseAcceptanceModal, { mode: 'edit', id: row.id, accepterId: row.accepterId }).then(() => {
      handleReloadTable?.()
    })
  }

  /**
   * 打开详情弹窗
   */
  function handleDetail(row: PurchaseAcceptanceEntity) {
    AnyDialogHelper.showModel(PurchaseAcceptanceDetailModal, { mode: 'detail', id: row.id })
  }

  /**
   * 提交验收
   */
  async function handleSubmit(row: PurchaseAcceptanceEntity) {
    await AnyDialogHelper.showModel(ProcessModal, {
      processType: ProcessType.PURCHASE_ACCEPTANCE,
      processId: row.id,
      hideRemark: true,
      submitAuditApi: submitPurchaseAcceptance,
      submitDataTransfer: (data: any) => {
        return {
          id: row.id,
          formPropertyJson: data.formPropertyJson,
          presetAuditers: data.presetAuditers,
        }
      },
    } as IProcessForm)
    message.success('提交成功')
    handleReloadTable?.()
  }

  /**
   * 打印购置登记表
   */
  function handlePrint(row: PurchaseAcceptanceEntity) {
    const UDRPrint = new IlisPrintUdr()
    UDRPrint.commonPrint([row.id], 'RefPurchaseAccept')
  }

  /**
   * 删除验收单
   */
  async function handleDelete(row: PurchaseAcceptanceEntity) {
    Modal.confirm({
      title: '确认删除',
      content: '确定删除该验收单吗？',
      okType: 'danger',
      onOk: async () => {
        await deletePurchaseAcceptance(row.id!)
        message.success('删除成功')
        handleReloadTable?.()
      },
    })
  }

  async function handleRevoke(row: PurchaseAcceptanceEntity) {
    Modal.confirm({
      title: '确认撤回',
      content: '确定撤回该验收单吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await revokePurchaseAcceptance(row.id!)
        message.success('撤回成功')
        handleReloadTable?.()
      },
    })
  }

  return {
    actionItems,
    handleEdit,
    handleDetail,
    handleSubmit,
    handlePrint,
    handleDelete,
    setReloadTable,
  }
}
