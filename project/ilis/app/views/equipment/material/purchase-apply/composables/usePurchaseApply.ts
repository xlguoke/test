import type { PurchaseApplyEntity } from '../entity/PurchaseApplyEntity'
import type { IProcessForm } from '~/components/commonProcess'
import type { ITableActionItem } from '~/interface/ITableActionItem'
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { ProcessModal, ProcessType } from '~/components/commonProcess'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import {
  deletePurchaseApply,
  revokePurchaseApply,
  submitPurchaseApply,
} from '../api'
import PurchaseApplyDetailModal from '../components/PurchaseApplyDetailModal.vue'
import PurchaseApplyModal from '../components/PurchaseApplyModal.vue'

/**
 * 待优化点：
 * 1.handler: (row: PurchaseApplyEntity)缺少类型义约束
 * 2.弹窗组件仍在使用路径：'~/components/ilisComponent/log/LogModal.vue'，组件清单未完全覆盖或更新
 */

export function usePurchaseApply() {
  const actionItems = computed<ITableActionItem<PurchaseApplyEntity>[]>(() => [
    {
      label: '详情',
      permissions: ['ref_purchase_apply_detail'],
      fn: (row: PurchaseApplyEntity) => handleDetail(row),
    },
    {
      label: '编辑',
      permissions: ['ref_purchase_apply_edit'],
      visible: (row: PurchaseApplyEntity) => row.status === 'WRITING' || row.status === 'REJECTED',
      fn: (row: PurchaseApplyEntity) => handleEdit(row),
    },
    {
      label: '提交',
      permissions: ['ref_purchase_apply_submit'],
      visible: (row: PurchaseApplyEntity) => row.status === 'WRITING' || row.status === 'REJECTED',
      fn: (row: PurchaseApplyEntity) => handleSubmit(row),
    },
    {
      label: '删除',
      permissions: ['ref_purchase_apply_delete'],
      danger: true,
      visible: (row: PurchaseApplyEntity) => row.status !== 'AUDITING',
      fn: (row: PurchaseApplyEntity) => handleDelete(row),
    },
    {
      label: '撤回',
      permissions: ['ref_purchase_apply_revoke'],
      visible: (row: PurchaseApplyEntity) => row.status === 'AUDITING',
      fn: (row: PurchaseApplyEntity) => handleRevoke(row),
    },
    {
      label: '打印',
      permissions: ['ref_purchase_apply_print'],
      fn: (row: PurchaseApplyEntity) => handlePrint(row),
    },
    {
      label: '日志',
      permissions: ['ref_purchase_apply_log'],
      fn: (row: PurchaseApplyEntity) => {
        AnyDialogHelper.showModel(LogModalByApi, {
          id: row.id,
          logType: '44',
        })
      },
    },
  ])

  let handleReloadTable: (() => void) | undefined

  function setReloadTable(fn: () => void) {
    handleReloadTable = fn
  }

  function handleEdit(row: PurchaseApplyEntity) {
    AnyDialogHelper.showModel(PurchaseApplyModal, { id: row.id, mode: 'edit' }).then(() => {
      handleReloadTable?.()
    })
  }

  function handleDetail(row: PurchaseApplyEntity) {
    AnyDialogHelper.showModel(PurchaseApplyDetailModal, { id: row.id })
  }

  async function handleSubmit(row: PurchaseApplyEntity) {
    await AnyDialogHelper.showModel(ProcessModal, {
      processType: ProcessType.PURCHASE_APPLY,
      processId: row.id,
      hideRemark: true,
      submitAuditApi: submitPurchaseApply,
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

  async function handleRevoke(row: PurchaseApplyEntity) {
    Modal.confirm({
      title: '确认撤回',
      content: '确定撤回该采购申请吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await revokePurchaseApply(row.id!)
        message.success('撤回成功')
        handleReloadTable?.()
      },
    })
  }

  async function handleDelete(row: PurchaseApplyEntity) {
    Modal.confirm({
      title: '确认删除',
      content: '确定删除该采购申请吗？',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        await deletePurchaseApply(row.id!)
        message.success('删除成功')
        handleReloadTable?.()
      },
    })
  }

  function handlePrint(row: PurchaseApplyEntity) {
    const UDRPrint = new IlisPrintUdr()
    UDRPrint.commonPrint([row.id], 'RefPurchaseApply')
  }

  return {
    actionItems,
    handleEdit,
    handleDetail,
    handleSubmit,
    handleRevoke,
    handlePrint,
    // handleLog,
    setReloadTable,
  }
}
