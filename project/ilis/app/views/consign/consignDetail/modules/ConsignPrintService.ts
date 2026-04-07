import { systemPrintTemplateApi } from '~/api/consign/consign-management'

/**
 * 委托打印服务
 */
export class ConsignPrintService {
  private udrPrint = new IlisPrintUdr()

  /**
   * 打印委托单
   */
  async printConsignOrder(consignId: string) {
    try {
      const { data } = await systemPrintTemplateApi('printConsign')
      this.udrPrint.commonPrint([consignId], data, { printTimes: 1 })
    }
    catch (err) {
      console.error('打印委托单失败', err)
    }
  }
}
