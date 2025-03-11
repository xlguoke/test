import type { HumitureResListParams } from '~/views/common/humiture/res/api/getHumitureResList.ts'
import { type IlisAdvancedQueryConfigItem, QueryConfigType } from '~/components/IlisAdvancedQuery/index.ts'

export { default as Main } from './Main.vue'

// 高级查询配置
export const AdvancedQueryConfigs: IlisAdvancedQueryConfigItem<HumitureResListParams>[] = [
  { label: '任务编号', name: 'testTaskCode' },
  {
    type: QueryConfigType.日期范围框,
    label: '预约时间',
    name: ['resStartDate', 'resEndDate'],
    props: {
      'value-format': EDateFormatType.YYYY_MM_DD,
    },
  },
]

/** 控制类型 */
export enum CustomType {
  不处理 = 'SET',
  自动关闭设备 = 'CLOSE',
}

/** 预约状态 */
export enum ResStatus {
  已预约 = 'OPEN',
  已取消 = 'CLOSE',
}

/** 控制类型下拉 */
export const CustomTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '不处理', key: CustomType.不处理 },
  { label: '自动关闭设备', key: CustomType.自动关闭设备 },
])
