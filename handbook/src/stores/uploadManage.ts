import { defineStore } from 'pinia'
import { Modal, message } from 'ant-design-vue'
import {
  findTaskParams,
  findTaskRecordSets,
  findTaskTemplates,
  getTask,
  updateTaskUploadStatus,
} from 'custodian'
import type { UploadListDTO, UploadOfflineDataDTO } from '@/type/testTask'
import { request } from '@/axios'
import { translateError } from '@/utils/translateError'

interface ObjKey {
  [key: string]: string
}
const uploadStatusText: ObjKey = {
  wait: '待上传',
  processing: '上传中',
  fail: '上传失败',
  pause: '暂停',
}

// 同时上传最大数量
const UPLOAD_COUNT = 5

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
      uploadLength: 0,
      uploadFinishIds: [] as string[],
    }
  },
  actions: {
    setUploadLen() {
      const { processing } = this.uploadStatus
      const len = this.uploadDatas.filter(
        item => item.status === processing,
      ).length
      this.uploadLength = len
      return len
    },
    // 添加上传数据
    addUploadDatas(list: UploadListDTO[]) {
      const { wait, processing } = this.uploadStatus
      const datas = this.uploadDatas
      // 当前在上传中的数量
      const processLen = datas.filter(d => d.status === processing).length
      const len = UPLOAD_COUNT - processLen
      for (let i = 0; i < list.length; i++) {
        const d = list[i]
        // 超过最大上传数时，状态为等待上传
        const status = i >= len ? wait : processing
        this.uploadDatas.push({
          ...d,
          status,
          statusText: uploadStatusText[status],
        })
        if (i < len)
          this.uploadTaskDatas(d)
      }

      this.setUploadLen()
    },
    // 删除上传数据
    removeUploadDatas(taskId: string) {
      let findIndex = this.uploadDatas.findIndex(item => item.id === taskId)
      const { processing } = this.uploadStatus
      const item = this.uploadDatas[findIndex]
      if (item.status === processing)
        return message.warning('当前数据正在上传，无法移除')

      Modal.confirm({
        title: '提示',
        content: '确定要移除该数据吗？',
        centered: true,
        onOk: () => {
          findIndex = this.uploadDatas.findIndex(item => item.id === taskId)
          if (findIndex === -1)
            return message.warning('当前数据已上传')
          this.uploadDatas.splice(findIndex, 1)
        },
      })
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
    // 开始上传
    startUpload(taskId: string) {
      const { wait, processing } = this.uploadStatus
      for (let i = 0; i < this.uploadDatas.length; i++) {
        const item = this.uploadDatas[i]
        if (item.id !== taskId)
          continue
        if (item.status === processing)
          break
        if (this.uploadLength < UPLOAD_COUNT) {
          item.status = processing
          item.statusText = uploadStatusText[processing]
          this.uploadTaskDatas(item)
        }
        else {
          item.status = wait
          item.statusText = uploadStatusText[wait]
        }
        break
      }
      this.setUploadLen()
    },
    // 暂停上传
    pauseUpload(taskId: string) {
      const { pause, processing } = this.uploadStatus
      for (let i = 0; i < this.uploadDatas.length; i++) {
        const item = this.uploadDatas[i]
        if (item.id === taskId) {
          if (item.status === processing)
            break
          item.status = pause
          item.statusText = uploadStatusText[pause]
          break
        }
      }
      this.setUploadLen()
    },
    // 执行上传
    uploadTaskDatas(task?: UploadListDTO) {
      if (task)
        return this.uploadFetch(task)

      const { processing } = this.uploadStatus
      const datas = this.uploadDatas.filter(item => item.status === processing)
      for (let i = 0; i < datas.length; i++) {
        const item = datas[i]
        this.uploadFetch(item)
      }
    },
    // 上传数据
    async uploadFetch(task: UploadListDTO) {
      try {
        const taskInfo = await getTask(task.id)
        const resTemplates = await findTaskTemplates(task.id)
        const recordSets = await findTaskRecordSets(task.id)
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
          templates,
          recordValues,
          recordParams,
        }

        await request({
          url: '/ilis2/rest/upload/offline/record',
          method: 'post',
          data: form,
        })

        // 上传成功
        await this.uploadFinish(task.id, 'uploaded')
        this.uploadDatas = this.uploadDatas.filter(d => d.id !== task.id)
      }
      catch (err) {
        console.error(err)
        const detail = translateError(err)
        await this.uploadFinish(task.id, 'uploadFailed')
        await this.updateUploadStatus(
          task.id,
          this.uploadStatus.fail,
          detail.message,
        )
      }
      // 开始上传下一个目标
      this.uploadNextData()
      this.setUploadLen()
    },
    // 上传成功，将该数据移除上传列表，修改数据状态
    async uploadFinish(taskId: string, status?: 'uploaded' | 'uploadFailed') {
      await updateTaskUploadStatus(taskId, status)
      this.uploadFinishIds = [...this.uploadFinishIds, taskId]
    },
    // 开始上传下一个目标
    uploadNextData() {
      const { wait, processing } = this.uploadStatus
      for (let i = 0; i < this.uploadDatas.length; i++) {
        const item = this.uploadDatas[i]
        if (item.status !== wait)
          continue
        item.status = processing
        item.statusText = uploadStatusText[processing]
        this.uploadFetch(item)
        break
      }
    },
    clearUploadInfo() {
      this.uploadDatas = []
      this.uploadLength = 0
    },
  },
  persist: {
    paths: ['uploadDatas', 'uploadLength'],
  },
})
