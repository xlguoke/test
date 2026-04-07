import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { LedgerRecord } from '~/views/common/humiture/taskLedger'
import '~/main.ts'

interface PropParam {
  id: string
  testTaskCode: string
  testObjectCode: string
  sampleName: string
}

(async function () {
  async function showModal(data: PropParam) {
    await AnyDialogHelper.showModel(LedgerRecord, data)
  }

  window.vm_openTaskLedgerRecord = showModal
})()
