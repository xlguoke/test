export class SubmitLedgerRecordEntity {
  formPropertyJson?: string
  id?: string
  presetAuditers?: string
}

/** 提交台账 */
export function submitLedgerRecord(data: SubmitLedgerRecordEntity) {
  return ilisAxios.post('rest/humiture/ledger?submit', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}
