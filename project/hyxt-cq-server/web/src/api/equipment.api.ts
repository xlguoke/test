import axios from "@/config/http.config"
import { filesType } from "@/type/common/common"

interface eqParType {
  current: number | undefined
  size: number | undefined
  keyword?: string
  orgId?: string
}

interface equipmentsType {
  equipmentId: string // 机构备案设备表ID
  qualificationId: string // 标准资质ID
  testItemId: string // 标准检测项目ID(检测类型ID)
  bzEquipmentId: string // 标准仪器设备ID
  required: boolean // 是否必选
  major: string // 专业
  version: string // 版本
  qualification: string // 资质等级
  testItem: string // 检测项目
  bzEquipment: string // 标准设备
}

export interface dataItemType extends Omit<SaveEquipmentDTO, "standardEquipmentList"> {
  addDate?: string // 添加日期
  submitted?: string // 是否提交
  submitDate?: string // 提交日期
  auditPassed?: string // 是否已通过审核
  auditDate?: string // 审核日期
  testItemId?: string // 试验项目ID
  bzEquipmentSn?: string // 标准仪器设备编号
  imgUrl?: string // 图片
  uploadAttachment?: string // 是否已上传附件
  deleted?: string // 删除标记
  sourceFrom?: string // 数据来源(机构/工地试验室)
  laboratoryId?: string // 试验室ID
  location?: string // 安装位置, 定位信息
  bzEquipments: equipmentsType[] // 机构备案设备
}

export interface SaveEquipmentDTO {
  id?: string // 设备ID
  orgName?: string // 机构名称
  orgId: string // 机构ID
  sn: string // 设备编号
  name: string // 设备名称
  manufacturer: string // 生产厂家
  specification: string // 规格型号
  calibrationCycle: number | null // 检定校准周期(月)
  calibrationUnit: string // 检定校准单位
  lastCalibrationDate: string // 最近检定校准日期
  type?: string // 仪器分类
  buyDate?: string // 购置日期
  price?: string | number // 单价
  measuringRange?: string // 量程
  accuracy?: string // 精度
  calibrationExpireDate?: string // 检定校准到期日期
  factorySn?: string // 出厂编号
  useStatus?: string // 设备使用状态
  remark?: string // 备注
  manageWay?: string // 管理方式
  attachments: filesType[] // 附件
  standardEquipmentList: {
    bzEquipmentName: string // 标准仪器设备名称
    bzEquipmentId: string // 标准仪器设备ID
    required?: boolean // 是否必选
  }[]
}

//  获取分页列表
export function getPageList(params: eqParType) {
  return axios({
    url: "/equipment/pages",
    method: "get",
    params
  })
}

// 获取详情
export function getDetail(id: string) {
  return axios({
    url: "/equipment/" + id,
    method: "get"
  })
}

// 新增/编辑
export function save(data: SaveEquipmentDTO) {
  const method = data.id ? "put" : "post"
  return axios({
    url: "/equipment",
    method,
    data
  })
}

// 删除
export function deleteEquipment(ids: string[]) {
  return axios({
    url: "/equipment/delete",
    method: "post",
    data: ids
  })
}

// 获取标准设备
export function getStandardEquipments() {
  return axios({
    url: "/equipment/standard",
    method: "get"
  })
}

// 导入设备数据
export function importEquipment(orgId: string, data: FormData) {
  return axios({
    url: "/equipment/import?orgId=" + orgId,
    method: "post",
    data
  })
}
