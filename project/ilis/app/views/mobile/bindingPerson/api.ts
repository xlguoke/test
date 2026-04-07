import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取人员信息
 */
export async function getPersonInfo(personId: string, unitCode: string) {
  return IlisApiHelper.get<any>(`rest/biddingPersonController/barcode/${personId}/detail/${unitCode}`)
}
