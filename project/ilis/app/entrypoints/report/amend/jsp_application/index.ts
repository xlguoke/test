import type { ReportInfo } from '~/views/report/amend/components/AddEdit.vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import AddEditModal from '~/views/report/amend/components/AddEditModal.vue'

interface ModalParam {
  type: 'add' | 'edit' | 'detail'
  reportInfo?: ReportInfo
  onComfirm?: () => void
}

(function () {
  window.reportAmendModal = {
    async showModal(param: ModalParam) {
      await AnyDialogHelper.showModel(AddEditModal, {
        ...param,
        hideSaveBtn: true,
      })
      if (param.onComfirm) {
        param.onComfirm()
      }
    },
  }
})()
