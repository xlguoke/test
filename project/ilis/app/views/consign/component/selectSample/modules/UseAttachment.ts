import type { MetaDataEntity } from '~/views/consign/component/selectSample/modules/services/MetaDataBuilder.ts'
import type { IConsginPageParam } from '~/views/consign/consignDetail/interface'
import { UseBase } from '~/views/consign/component/selectSample/modules/UseBase.ts'

export class AttachmentEntity {
  /** 附件二维码key */
  attachmentQrKey = ''
  /** 附件二维码地址 */
  attachmentQrUrl = ''
}

/**
 * 附件
 */
export class UseAttachment extends UseBase<AttachmentEntity> {
  // 主码地址中的id，用户获取附件
  get qrCodeId() {
    const params = new URLSearchParams(this.data.attachmentQrUrl)
    return params.get('id')
  }

  /** 委托详情表单数据 */
  get consignDetail() {
    return this.consginPageParam.consignDetail
  }

  /** 业务变量、页面状态 */
  get consignPageState() {
    return this.consginPageParam.pageState
  }

  constructor(private consginPageParam: IConsginPageParam) {
    super(new AttachmentEntity())
  }

  /** 回显元数据 */
  setData(metaData: MetaDataEntity) {
    const data = new AttachmentEntity()

    data.attachmentQrUrl = metaData.attachmentQrUrl
    data.attachmentQrKey = metaData.attachmentQrKey

    this.data = data
  }
}
