import type { InboundRecordEntity } from '../entity/InboundRecordEntity'
import type { ITableActionItem } from '~/interface/ITableActionItem'
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { deleteInboundRecord } from '../api'
import InboundRecordModal from '../components/InboundRecordModal.vue'

/**
 * # 入库记录组合式函数
 */
export function useInboundRecord() {
  const actionItems = computed<ITableActionItem<InboundRecordEntity>[]>(() => [
    {
      label: '详情',
      fn: (row: InboundRecordEntity) => handleEdit(row, 'detail'),
      permissions: ['ref_stock_in_detail'],
    },
    {
      label: '编辑',
      fn: (row: InboundRecordEntity) => handleEdit(row, 'edit'),
      permissions: ['ref_stock_in_edit'],
    },
    {
      label: '删除',
      danger: true,
      fn: (row: InboundRecordEntity) => handleDelete(row),
      permissions: ['ref_stock_in_delete'],
    },
  ])

  let handleReloadTable: (() => void) | undefined

  function setReloadTable(fn: () => void) {
    handleReloadTable = fn
  }

  function handleAdd() {
    AnyDialogHelper.showModel(InboundRecordModal, {
      mode: 'add',
    }).then(() => {
      handleReloadTable?.()
    })
  }

  function handleEdit(row: InboundRecordEntity, mode: 'add' | 'edit' | 'detail') {
    AnyDialogHelper.showModel(InboundRecordModal, {
      mode,
      id: row.id,
    }).then(() => {
      if (mode !== 'detail') {
        handleReloadTable?.()
      }
    })
  }

  function handleDelete(row: InboundRecordEntity) {
    Modal.confirm({
      title: '您正在删除入库记录！',
      content: '删除后无法恢复，且会重新计算库存余量，您确认要删除吗？',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        await deleteInboundRecord(row.id!)
        message.success('删除成功')
        handleReloadTable?.()
      },
    })
  }

  return {
    actionItems,
    handleAdd,
    handleEdit,
    handleDelete,
    setReloadTable,
  }
}
