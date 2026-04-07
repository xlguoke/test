import { defineStore } from 'pinia'
import {
  findTaskJsonRecordSets,
  findTaskParams,
  findTaskRecordSets,
  findTaskTemplates,
  getTask,
  getTaskHandwriting,
  getTaskTrace,
  updateTaskUploadStatus,
} from 'custodian'
import { getLogger } from '@ilis/cordova-plugin-log4c'
import type { UploadListDTO, UploadOfflineDataDTO } from '@/type/testTask'
import { request } from '@/axios'

const log = getLogger('uploadManage')

interface ObjKey {
  [key: string]: string
}
const uploadStatusText: ObjKey = {
  wait: '等待上传',
  processing: '上传中...',
}

export default defineStore('uploadManage', {
  state: () => {
    return {
      uploadDatas: [] as UploadListDTO[],
      uploadStatus: {
        wait: 'wait',
        processing: 'processing',
        fail: 'fail',
        pause: 'pause',
      },
      uploadFinishIds: [] as string[],
    }
  },
  actions: {
    // 添加上传数据
    addUploadDatas(list: UploadListDTO[]) {
      const { wait } = this.uploadStatus
      for (let i = 0; i < list.length; i++) {
        const d = list[i]
        this.uploadDatas.push({
          ...d,
          status: wait,
          statusText: uploadStatusText[wait],
        })
      }
      this.uploadTaskDatas()
    },
    // 更新上传状态
    updateUploadStatus(
      taskId: string,
      status: string,
      msg?: string,
    ): string | null {
      if (!taskId)
        return '缺少taskId'
      if (!status)
        return '缺少状态'

      for (let i = 0; i < this.uploadDatas.length; i++) {
        const item = this.uploadDatas[i]
        if (item.id === taskId) {
          item.status = status
          item.statusText = msg || uploadStatusText[status]
          break
        }
      }
      return null
    },
    // 执行上传
    uploadTaskDatas(task?: UploadListDTO) {
      if (task)
        return this.uploadFetch(task)

      const item = this.uploadDatas[0]
      const { processing } = this.uploadStatus
      if (!item || item.status === processing)
        return
      item.status = processing
      item.statusText = uploadStatusText[processing]
      this.uploadFetch(item)
    },

    // 上传数据
    async uploadFetch(task: UploadListDTO) {
      try {
        const taskInfo = await getTask(task.id)
        const resTemplates = await findTaskTemplates(task.id)
        const recordSets = await findTaskRecordSets(task.id)
        const jsonRecordSets = await findTaskJsonRecordSets(task.id)
        const params = await findTaskParams(task.id)
        const templates = resTemplates.map(item => ({
          udrId: item.udrId || '',
          appId: item.templateId || '',
          testItemId: item.testItemId || '',
        }))
        const recordValues = recordSets.map(item => ({
          name: item.name,
          value: item.xml,
          testItemId: templates[0].testItemId,
        }))
        const recordJsonValues = jsonRecordSets.map(item => ({
          value: item.value,
          groupKey: item.testItemId,
        }))
        const recordParams = params.map(item => ({
          testParamId: item.testParamId,
          testParamName: item.testParamDisplayName,
          standards: item.standards
            ? item.standards.map(d => ({
              baseStandardId: '',
              standardId: d.baseStandardId,
              standardName: d.baseStandardName,
              standardType: d.baseStandardUseType,
              publishCode: d.publishCode,
            }))
            : [],
        }))

        const modifyLogDetail = await getTaskTrace(taskInfo.id).catch(() => {})
        // 笔迹可能为空，此处需要catch
        const notes = await getTaskHandwriting(taskInfo.id).catch(() => {})

        const form: UploadOfflineDataDTO = {
          autoImport: false,
          handbookId: taskInfo.id,
          recordSn: taskInfo.recordCode,
          handbookSn: taskInfo.onsite ? taskInfo.testTaskCode : '', // pc离线数据管理列表的handbookSn字段表示离线创建任务的任务编号
          testTaskId: taskInfo.testTaskId || '',
          testSampleId: taskInfo.sampleId || '',
          testSampleDisplayName: taskInfo.sampleName || '',
          projectId: taskInfo.projectId || '',
          projectName: taskInfo.projectName || '',
          unitProjectId: taskInfo.unitProjectId,
          unitProjectName: taskInfo.unitProjectName,
          unitProjectType: '',
          modifyLogDetail: modifyLogDetail
            ? [{
                value: modifyLogDetail,
                groupKey: templates[0].testItemId,
              }]
            : null,
          notes: notes
            ? [{
                value: notes,
                groupKey: templates[0].testItemId,
              }]
            : null,
          templates,
          recordValues,
          recordJsonValues,
          recordParams,
        }
        await request({
          url: '/ilis2/rest/upload/offline/record',
          method: 'post',
          data: form,
        })

        // 上传成功
        await this.uploadFinish(task.id, 'uploaded')
      }
      catch (err) {
        log.error('上传离线数据：', err)
        await this.uploadFinish(task.id, 'uploadFailed')
        return Promise.reject(err)
      }
    },
    // 上传结束（成功或失败），将该数据移除上传列表，修改数据状态
    async uploadFinish(taskId: string, status?: 'uploaded' | 'uploadFailed') {
      await updateTaskUploadStatus(taskId, status)
      this.uploadDatas = this.uploadDatas.filter(d => d.id !== taskId)
      this.uploadFinishIds = [...this.uploadFinishIds, taskId]

      this.uploadTaskDatas()
    },
    clearUploadInfo() {
      this.uploadDatas = []
      this.uploadFinishIds = []
    },
  },
})
