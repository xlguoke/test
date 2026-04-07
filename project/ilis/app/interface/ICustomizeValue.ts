export interface ICustomizeValue {
  id: '46928081910b90a901910b9c4b4400ae'
  sysCompanyCode: 'A03'
  createName: '管理员'
  createBy: 'admin'
  createDate: '2024-08-01 09:44:38'
  updateName: '管理员'
  updateBy: 'admin'
  updateDate: '2024-08-01 09:44:43'
  unitCode: 'gfzx'
  isDelete: false
  columnId: '402882c190df08940190dfa6a54b0068'
  columnIndex: 0
  columnName: '设备新增类型'
  visible: true
  disabled: false
  columnType: 'select'
  columnValue: '新购设备'
}

/** 自定义属性 */
export interface ICustomizeAttribute {
  columnId?: string
  columnIndex?: number
  columnName?: string
  columnType?: string
  columnValue?: string
  createDate?: Date
  createName?: string
  disabled?: boolean
  isDelete?: boolean
  visible?: boolean
}

/** 委托自定义属性 */
export interface IConsignCustomizeAttribute extends ICustomizeAttribute {
  /** 是否盲样 */
  blind?: number
  /** 应用到预委托 */
  preVisible?: boolean | number
}
