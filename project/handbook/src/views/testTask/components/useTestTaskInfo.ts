import { onMounted, ref } from 'vue'
import type { AppTask, TaskParam } from 'custodian'
import { findTaskParams, getTask, task } from 'custodian'
import { request } from '@/axios'
import type { TestTaskDTO } from '@/providers/services/TestTaskService'
import { TestTaskService } from '@/providers/services/TestTaskService'

/**
 * 查看试验详情相关数据
 */
export function useTestTaskInfo(isOfflineData: boolean, testTaskId: string) {
  const appTaskDetail = task.Validator.taskDetail
    .omit({
      taskRecordSets: true,
      taskAppTemplates: true,
      taskJsonData: true,
      recordSetNameGroup: true,
      udrVBScripts: true,
      taskAttachment: true,
    })
    .transform(info => ({
      ...info,
      id: info.taskData.testTaskId,
      onsite: 0,
    }))

  type AppTaskDetail = Omit<AppTask, 'taskAppTemplates' | 'params'>

  onMounted(() => {
    initData()
  })

  const detailData = ref<AppTaskDetail>()

  const taskParams = ref<TaskParam[]>([])

  const testTaskData = ref<TestTaskDTO>()

  async function initData() {
    if (isOfflineData) {
      getOfflineDetailData()
    }
    else {
      getDetailData()
      getTestTaskData(testTaskId)
    }
  }

  async function getTestTaskData(taskId: string) {
    const testTaskService = new TestTaskService(taskId)

    const data = await testTaskService.getTaskDetail()

    testTaskData.value = data
  }

  async function getDetailData() {
    const loading = showLoadingToast({
      duration: 0,
      forbidClick: true,
    })

    const dataNames = 'taskInfo,taskParam'
    request({
      url: `/ilis2/rest/task/data?testTaskId=${testTaskId}&dataNames=${dataNames}`,
      method: 'get',
      schema: appTaskDetail,
    })
      .then((res) => {
        detailData.value = {
          ...res.taskData,
          id: res.id,
          onsite: res.onsite,
          status: 'edited',
        }
        taskParams.value = res.taskParams || []
      })
      .catch((err) => {
        return Promise.reject(err)
      }).finally(loading.close)
  }

  async function getOfflineDetailData() {
    const task = await getTask(testTaskId)
    const params = await findTaskParams(task.id)

    detailData.value = task
    taskParams.value = params

    if (task.testTaskId)
      getTestTaskData(task.testTaskId)
  }

  return {
    initData,
    detailData,
    taskParams,
    testTaskData,
  }
}
