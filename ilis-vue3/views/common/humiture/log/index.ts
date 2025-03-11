import type { HumitureLogListParams } from '~/views/common/humiture/log/api.ts'
import { type IlisAdvancedQueryConfigItem, QueryConfigType } from '~/components/IlisAdvancedQuery/index.ts'

export { default as Main } from './Main.vue'

// 高级查询配置
export const AdvancedQueryConfigs: IlisAdvancedQueryConfigItem<HumitureLogListParams>[] = [
  { label: '操作人', name: 'operator' },
  {
    type: QueryConfigType.日期范围框,
    label: '控制时间',
    name: ['conStartDate', 'conEndDate'],
    props: {
      'value-format': EDateFormatType.YYYY_MM_DD,
    },
  },
]

export enum CommandWayType {
  定时 = 'TIMER',
  预约 = 'RES',
  立刻 = 'NOW',
}
