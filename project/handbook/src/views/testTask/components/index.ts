import TestTaskSearch from './TestTaskSearch.vue'
import OnlineTask from './OnlineTask.vue'
import OfflineTask from './OfflineTask.vue'
import BaseInfo from './BaseInfo.vue'
import TestInfo from './TestInfo.vue'
import TestInfoStandard from './TestInfoStandard.vue'
import BaseInfoTemplate from './BaseInfoTemplate.vue'
import BaseInfoProject from './BaseInfoProject.vue'
import BaseInfoSample from './BaseInfoSample.vue'
import BaseInfoUnitProject from './BaseInfoUnitProject.vue'

export enum TestTaskReturnType {
  '试验检测中' = 'test',
  '复核确认中' = 'review',
  '报告审批中' = 'reportAudit',
}

export {
  TestTaskSearch,
  OnlineTask,
  OfflineTask,
  BaseInfo,
  TestInfo,
  TestInfoStandard,
  BaseInfoTemplate,
  BaseInfoProject,
  BaseInfoSample,
  BaseInfoUnitProject,
}
