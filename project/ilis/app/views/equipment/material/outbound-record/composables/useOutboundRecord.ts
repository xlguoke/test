import type { OutboundRecordEntity } from '../entity/OutboundRecordEntity'
import type { ITableActionItem } from '~/interface/ITableActionItem'
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { deleteOutboundRecord } from '../api'
import OutboundRecordModal from '../components/OutboundRecordModal.vue'
import ReturnModal from '../components/ReturnModal.vue'

export function useOutboundRecord() {
  const actionItems = computed<ITableActionItem<OutboundRecordEntity>[]>(() => [
    {
      label: '详情',
      fn: (row: OutboundRecordEntity) => handleEdit(row, 'detail'),
      permissions: ['ref_stock_out_detail'],
    },
    {
      label: '返还',
      permissions: ['ref_stock_out_return'],
      fn: (row: OutboundRecordEntity) => handleReturn(row),
      visible(row: OutboundRecordEntity) {
        return row.outType === '领用出库'
      },
    },
    {
      label: '编辑',
      fn: (row: OutboundRecordEntity) => handleEdit(row, 'edit'),
      permissions: ['ref_stock_out_edit'],
    },
    {
      label: '删除',
      danger: true,
      permission: ['ref_stock_out_delete'],
      fn: (row: OutboundRecordEntity) => handleDelete(row),
    },
  ])

  let handleReloadTable: (() => void) | undefined

  function setReloadTable(fn: () => void) {
    handleReloadTable = fn
  }

  function handleEdit(row: OutboundRecordEntity, mode: 'add' | 'edit' | 'detail') {
    AnyDialogHelper.showModel(OutboundRecordModal, {
      mode,
      id: row.id,
    }).then(() => {
      if (mode !== 'detail') {
        handleReloadTable?.()
      }
    })
  }

  function handleReturn(row: OutboundRecordEntity) {
    AnyDialogHelper.showModel(ReturnModal, {
      record: row,
    }).then(() => {
      handleReloadTable?.()
    })
  }

  function handleDelete(row: OutboundRecordEntity) {
    Modal.confirm({
      title: '确认删除',
      content: '确定删除该出库记录吗？',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        await deleteOutboundRecord(row.id!)
        message.success('删除成功')
        handleReloadTable?.()
      },
    })
  }

  return {
    actionItems,
    handleEdit,
    handleReturn,
    handleDelete,
    setReloadTable,
  }
}
