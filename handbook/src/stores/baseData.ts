import { defineStore } from 'pinia'
import type { DataVersionDTO, DataVersionStatusDTO } from '@/type/common'

const dataVersions: DataVersionDTO[] = [
  {
    title: '模板',
    type: 'template',
  },
  {
    title: '样品',
    type: 'testSample',
  },
  {
    title: '检测参数',
    type: 'testParam',
  },
  {
    title: '样品参数关系',
    type: 'testSampleParam',
  },
  {
    title: '工程项目',
    type: 'project',
  },
  {
    title: '数据集',
    type: 'recordSet',
  },
  {
    title: '规程',
    type: 'standard',
  },
  {
    title: '合同段',
    type: 'synthesisContract',
  },
  {
    title: '单位工程',
    type: 'synthesisUnitProject',
  },
]

export default defineStore('baseData', {
  state: () => {
    return {
      dataVersions: dataVersions as DataVersionDTO[],
      dataVersionStatus: [] as DataVersionStatusDTO[],
      isCheckUpdate: false,
      // 更新进度
      updateProcess: 0,
      // 待更新数据总数
      updateTotal: 0,
      timer: null as any,
    }
  },
  actions: {
    setDataVersionStatus(type: string, status: string, msg: string) {
      const ind = this.dataVersionStatus.findIndex(d => d.type === type)
      if (ind === -1) {
        this.dataVersionStatus.push({ type, status, msg })
      }
      else {
        const item = this.dataVersionStatus[ind]
        if ((item.status === 'fail' || item.status === 'processing') && status === 'wait')
          return
        item.status = status
        item.msg = msg
        this.dataVersionStatus[ind] = item
      }
    },

  },
  persist: {
    paths: ['dataVersions', 'autoUpdateNetwrok', 'autoUpdateTime'],
  },
})
