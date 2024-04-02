import { computed, inject, provide, reactive, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { translateError } from '@/utils/translateError'
import type { TaskListDTO } from '@/type/testTask'

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
    message.error(d.message)
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
  }
}
