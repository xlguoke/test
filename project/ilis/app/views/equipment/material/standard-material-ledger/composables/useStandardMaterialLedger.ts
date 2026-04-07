import type { StandardMaterialLedgerEntity } from '../entity/StandardMaterialLedgerEntity'
import type { ITableActionItem } from '~/interface/ITableActionItem'
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { deleteStandardMaterialLedger } from '../api'
import StandardMaterialLedgerModal from '../components/StandardMaterialLedgerModal.vue'

/**
 * # 标准物质台账组合式函数
 */
export function useStandardMaterialLedger() {
  const actionItems = computed<ITableActionItem<StandardMaterialLedgerEntity>[]>(() => [
    {
      label: '编辑',
      fn: (row: StandardMaterialLedgerEntity) => handleEdit(row, 'edit'),
      permissions: ['ref_material_edit'],
      visible: true,
    },
    {
      label: '详情',
      fn: (row: StandardMaterialLedgerEntity) => handleEdit(row, 'detail'),
      permissions: ['ref_material_detail'],
      visible: true,
    },
    {
      label: '删除',
      danger: true,
      fn: (row: StandardMaterialLedgerEntity) => handleDelete(row),
      permissions: ['ref_material_delete'],
      visible: true,
    },
  ])

  let handleReloadTable: (() => void) | undefined

  function setReloadTable(fn: () => void) {
    handleReloadTable = fn
  }

  function handleEdit(row: StandardMaterialLedgerEntity, mode: 'add' | 'edit' | 'detail') {
    AnyDialogHelper.showModel(StandardMaterialLedgerModal, {
      mode,
      id: row.id,
    }).then(() => {
      if (mode !== 'detail') {
        handleReloadTable?.()
      }
    })
  }

  function handleDelete(row: StandardMaterialLedgerEntity) {
    Modal.confirm({
      title: '确认删除',
      content: '确定删除该标准物质台账吗？',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        await deleteStandardMaterialLedger(row.id!)
        message.success('删除成功')
        handleReloadTable?.()
      },
    })
  }

  return {
    actionItems,
    handleEdit,
    handleDelete,
    setReloadTable,
  }
}
