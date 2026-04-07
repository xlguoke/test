import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { AnyDictionaryHelper } from '~/utils/AnyDictionaryHelper'
import { EDateFormatType } from '~/utils/EDateFormatType'

/** 状态 */
export enum BOOK_STATUS {
  /** 开启 */
  OPEN = 'OPEN',
  /** 关闭 */
  CLOSE = 'CLOSE',
}

export const BOOK_STATUS_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    label: '开启',
    key: BOOK_STATUS.OPEN,
  },
  {
    label: '关闭',
    key: BOOK_STATUS.CLOSE,
  },
])

/** 列表 */
export class BookListEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入功能室名称、调养箱名称查询',
  })
  @SearchField({
    width: '220px',
  })
  @CustomField('模糊查询')
  quickQry?: string

  @TableField()
  @CustomField('功能室')
  labName?: string

  @TableField()
  @CustomField('调养箱名称')
  name?: string

  // @TableField()
  // @CustomField('调养箱编号')
  // sn?: string

  // @FormField({
  //   formType: EFormItemType.SELECT,
  // })
  // @SearchField()
  // @TableField()
  // @CustomField('调养箱状态', BOOK_STATUS_DICT)
  // status?: string

  @TableField({
    isAlways: true,
    width: 100,
  })
  @CustomField('操作')
  action?: string
}

/** 详情 */
export class BookDetailEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
    showTime: true,
  })
  @SearchField({
    width: '320px',
  })
  @CustomField('采集时间')
  timestamp?: string[]

  @TableField()
  @CustomField('标准温度（℃）')
  normTem?: string

  @TableField()
  @CustomField('当前温度（℃）')
  temperature?: string

  @TableField()
  @CustomField('标准湿度（%rh）')
  normHum?: string

  @TableField()
  @CustomField('当前湿度（%rh）')
  humidity?: string

  @TableField()
  @CustomField('状态')
  status?: string

  @TableField()
  @CustomField('采集时间')
  time?: string
}
