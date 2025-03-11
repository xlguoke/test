import type { IProcessUserNode } from '~/components/commonProcess'

export interface IProcessFormExpose {
  getProcessFormData: () => {
    [key: string]: any
    presetAuditers: IProcessUserNode[]
    formPropertyJson: Record<string, any>
    remark: string
  }
}
