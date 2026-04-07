import { computed, inject, provide, reactive, ref, toRefs, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { getLogger } from '@ilis/cordova-plugin-log4c'
import { findTaskTemplates, getTask, normalizeHitekCenterUrl, task } from 'custodian'
import { UdrPageType, getUdrOfflineStartParams, getUdrOnlineStartParams, getUdrTemplateStartParams } from '../udr'
import { translateError } from '@/utils/translateError'
import type { TaskListDTO } from '@/type/testTask'
import { request } from '@/axios'
import { useUdrStore } from '@/views/udr/provider/useUdrStore'
import { type User, useUserStore } from '@/stores/users'
import { useCredentialStore } from '@/stores/credentials'

export function useTestTask() {
  const router = useRouter()
  const isOnlineList = ref(inject<boolean>('isOnlineList') || true)
  const marker = reactive(inject('offlineMarker') as { [k: string]: boolean })
  const selectedAll = ref(false)
  const selectedKeys = ref<string[]>([])
  const testTaskDatas = ref<TaskListDTO[]>([])
  const loading = ref(false)
  const dataLength = computed(() => testTaskDatas.value.length)
  const total = ref(0)
  const indeterminate = computed(
    () =>
      selectedKeys.value.length > 0
      && selectedKeys.value.length < testTaskDatas.value.length,
  )

  const hitekServer = ref('')

  const { currentTestTask, udrStartParams } = toRefs(useUdrStore())

  // rollingloading 组件使用
  provide('loading', loading)
  provide('total', total)
  provide('dataLength', dataLength)

  // 修改全选
  function changeSelectedAll() {
    if (selectedAll.value)
      selectedKeys.value = testTaskDatas.value.map(item => item.id)
    else
      selectedKeys.value = []
  }

  watchEffect(() => {
    setSelectedAll()
  })

  // 设置全选
  function setSelectedAll() {
    const len = testTaskDatas.value.length
    selectedAll.value = len > 0 && len === selectedKeys.value.length
  }

  // 详情
  function goDetail(taskId?: string, onsite?: number) {
    if (isOnlineList.value || onsite === 0) {
      router.push({
        path: '/testTaskDetail',
        query: { id: taskId, isOffline: isOnlineList.value ? '0' : '1' },
      })
    }
    else {
      router.push({
        path: '/testTaskRegister',
        query: { id: taskId },
      })
    }
  }

  function errMsg(err: any) {
    const d = translateError(err)
    showToast({ type: 'fail', message: d.reason?.message || d.message })
  }

  /**
   * 获取 hitekServer
   */
  async function getHitekServer() {
    try {
      const res = await request({
        url: '/ilis2/rest/hitek/server',
        method: 'get',
        schema: z.object({
          hitekApiServer: z.string(),
          hitekUdrServer: z.string(),
        }),
      })
      return res
    }
    catch (err) {
      const log = getLogger('testTask')
      log.error('获取 hitekServer 失败：', err)
      return {
        hitekApiServer: '',
        hitekUdrServer: '',
      }
    }
  }

  /**
   * 获取试验记录：传入dataNames对应属性，就查询对应数据，不传就不查，多个用半角逗号隔开
   * @param testTaskId 任务id
   * @param dataNames 字段名称
   * taskInfo - 任务基础数据
   * taskParam - 任务参数
   * taskAttachment - 任务附件
   * taskRecordSet - 任务数据集
   * jsonRecordSetGetter - json数据集
   * taskRecordSetName - 数据集名称
   * taskTemplate - 任务手簿模板
   * VBScriptGetter - 任务vb脚本
   */
  async function fetchTask(testTaskId: string, dataNames: string[]) {
    if (!hitekServer.value)
      hitekServer.value = (await getHitekServer()).hitekUdrServer

    const taskRes = await request({
      url: `/ilis2/rest/task/data`,
      method: 'get',
      params: {
        testTaskId,
        dataNames: dataNames.join(','),
      },
      schema: task.Validator.taskDetail,
    })

    const taskData = taskRes.taskData || {}
    return {
      ...taskData,
      ...taskRes,
      hitekServer: hitekServer.value,
    }
  }

  async function getOpenOfflineUdrParam(taskId: string) {
    try {
      const res = await findTaskTemplates(taskId)
      if (!res || res.length === 0) {
        return Promise.reject(
          new Error('当前任务未配置模板，请联系客服处理后再操作！'),
        )
      }

      const config: any = {}
      config.url = res[0].main.replace('file://', '')
      config.taskId = taskId
      config.testItemId = res[0].testItemId
      return config
    }
    catch (err) {
      return Promise.reject(err)
    }
  }

  async function openUdrOnline(testTaskId: string, readOnlyMode = false) {
    try {
      const fields = ['taskInfo', 'taskTemplate']
      const task = await fetchTask(testTaskId, fields)

      const inputTemplate = task.taskAppTemplates
        ? task.taskAppTemplates.find(it => it.templateType === '1')
        : undefined

      if (!inputTemplate)
        throw new Error('当前任务未配置录入模板')

      const template = inputTemplate.appTemplates.find(it => it.type === '2')
      if (!template)
        throw new Error('当前任务未配置正确的试验模板')

      const main = template.appTemplateFiles.find(
        (it: any) => it.fileName === 'main.json',
      )
      if (!main)
        throw new Error('当前试验模板未配置主文件')

      const { name, id } = useUserStore() as User
      const credentialStore = useCredentialStore()

      // 记录当前打开试验信息
      currentTestTask.value = {
        testTaskId: task.taskData.testTaskId,
        testTaskName: task.taskData.sampleName || '',
      }

      // 记录UDR启动参数
      udrStartParams.value = await getUdrOnlineStartParams({
        url: new URL(main.filePath, normalizeHitekCenterUrl(task.hitekServer)).href,
        taskId: task.testTaskId,
        token: credentialStore.token,
        unitCode: credentialStore.code,
        testItemId: inputTemplate.testItemId,
        testObjectId: task.testObjectId,
        readOnlyMode,
        title: !readOnlyMode ? '试验录入' : '试验记录',
        userName: name,
        userId: id,
      })

      router.push({
        name: 'Udr',
        params: {
          type: UdrPageType.在线UDR,
        },
      })
    }
    catch (err: any) {
      errMsg(err)
    }
  }

  async function openUdrOffline(testTaskId: string) {
    const params = await getOpenOfflineUdrParam(testTaskId)
    const udrParams = await getUdrOfflineStartParams(params)
    udrStartParams.value = udrParams

    const task = await getTask(testTaskId)
    // 记录当前打开离线试验信息
    currentTestTask.value = {
      testTaskId: task.id,
      testTaskName: task.sampleName || '',
    }

    router.push({
      name: 'Udr',
      params: {
        type: UdrPageType.离线UDR,
      },
    })
  }

  async function openUdrTemplate(params: {
    url: string
    title?: string
  }) {
    udrStartParams.value = await getUdrTemplateStartParams(params.url, params.title)

    router.push({
      name: 'Udr',
      params: {
        type: UdrPageType.模板UDR,
      },
    })
  }

  return {
    indeterminate,
    selectedAll,
    selectedKeys,
    testTaskDatas,
    marker,
    loading,
    total,
    errMsg,
    changeSelectedAll,
    goDetail,
    fetchTask,
    openUdrOnline,
    openUdrOffline,
    openUdrTemplate,
  }
}
