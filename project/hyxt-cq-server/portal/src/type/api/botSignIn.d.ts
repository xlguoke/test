export interface EnrollmentConstructorType {
  name: String
  city?: String //所在城市
  province?: String // 省
  district?: String // 行政区
  contact: String // 联系人
  phone: String // 联系电话
  unifiedSocialCreditCode: String //统一社会信用代码
  address?: String // 联系地址
  verificationCode: String // 验证码
  authorizeCommitmentImages: String // 授权书图片URI
  businessLicenceImages: String // 营业执照图片URI
  project: Object<ProjcetType> // 项目信息
  unitAddress?: string[]
}

export interface ProjcetType {
  projectType: String
  name: String | undefined // 工程项目名称
  id?: String | undefined // 工程项目id
  district: String | Undefined // 行政区域
  type: String | Undefined // 建设性质
  state?: String | Undefined // 状态：前期|在建|交工|竣工
  startedDate?: String // 开工日期
  handedOverDate?: String // 交工日期
  completedDate?: String // 竣工日期
  technicalRank?: String | Undefined // 技术等级
  executiveRank?: String // 行政等级
  approvedDuration?: String // 批准工期
  length?: String // 长度
  scale?: String // 规模
  inspectionInstitutions?: Array<{
    name: string // 检测机构
    contractSection: string // 合同段
    segmentName: string // 标段
    contractValue: string // 合同价
  }>
  supervisorId?: String | undefined // 监管单位ID
  supervisor?: String // 监管单位名称
  budget?: String // 预算
  estimatedCost?: String // 概算
  finalCost?: String // 决算
}
