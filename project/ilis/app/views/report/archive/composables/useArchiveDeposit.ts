import type { BatchSubmit } from '~/api/report/archive/type'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { batchSubmit } from '~/api/report/archive'
import { ProcessType } from '~/components/commonProcess'
import ProcessModal from '~/components/commonProcess/ProcessModal.vue'

export function useArchiveDeposit() {
  /** # 提交审核信息 */
  async function handleSubmitAudit(archiveList: any[], selectedMaterialIds: string[], callback: (res: any) => void) {
    await AnyDialogHelper.showModel(ProcessModal, {
      processType: ProcessType.REPORT_ARCHIVE,
      submitAuditApi: batchSubmit,
      submitDataTransfer: (data: any) => {
        return {
          archiveListStr: JSON.stringify(archiveList),
          archiveMaterialIds: JSON.stringify(selectedMaterialIds),
          presetAuditors: data.presetAuditers ? data.presetAuditers : '',
          formPropertyJson: data.formPropertyJson ? data.formPropertyJson : '',
          remark: data.remark,
        }
      },
    } as BatchSubmit)
    callback({ success: true })
  }

  return {
    handleSubmitAudit,
  }
}
