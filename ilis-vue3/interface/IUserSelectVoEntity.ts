export enum UserSelectVoType {
  DEPART = 'DEPART',
  USER = 'USER',
}

export interface IUserSelectVoEntity {
  id: '4028b2268a254249018a2564974b0010'
  name: '检测室'
  account: null
  type: UserSelectVoType
  taskCount: 0
  children: IUserSelectVoEntity[]
  checked: false
  pid: null
  departOrder: null
  testDepart: false
  /** 前端自定义属性，用于界面交互 */
  disabled: false
}
