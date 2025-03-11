import { UseBase } from '~/views/consign/component/selectSample/modules/UseBase.ts'
import type { MetaDataEntity } from '~/views/consign/component/selectSample/modules/MainController.ts'

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

  constructor() {
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
