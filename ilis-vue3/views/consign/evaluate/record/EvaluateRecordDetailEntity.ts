import type { IsCautionItem } from '../model/EvaluateQuestionEntity'
import { EvaluateRecordEntity } from './EvaluateRecordEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'

interface IRecordProblem {
  modelProblemId: '4028b24292c159c80192c1aeddb8007f'
  modelProblemName: '2002'
  answer: '23003'
  caution: IsCautionItem
}

/**
 * # 评价记录详情
 */
export class EvaluateRecordDetailEntity extends EvaluateRecordEntity {
  recordProblemList: IRecordProblem[] = []

  @CustomField('处理日期')
  handleDate?: Date

  @CustomField('处理内容')
  handleRemark?: string

  @CustomField('处理人')
  handleUser?: string
}
