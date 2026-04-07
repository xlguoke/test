import { inject, ref, onMounted } from "vue"
import { message } from "ant-design-vue"
import { storeToRefs } from "pinia"
import { functionRoomStore } from "@/store/functionRoom"

export function useBaseInfo() {
  const { labInfo, unitName } = storeToRefs(functionRoomStore())
  const { initRoomData, getLabInfo } = functionRoomStore()
  const loading = ref(inject("loading") as boolean)

  // 进入页面
  onMounted(async () => {
    loading.value = true
    try {
      await initRoomData()
    } catch (err) {
      message.error((err as any).message || "系统异常，请稍后重试或联系技术支持人员")
    }
    loading.value = false
  })

  return {
    unitName,
    labInfo,
    getLabInfo
  }
}
