import { useRouter } from "vue-router"
import request from "@/utils/request"
import {
  closeToast,
  showConfirmDialog,
  showFailToast,
  showLoadingToast,
  showSuccessToast
} from "vant"
import { authApiTransform } from "@/api/functionRoom2.api"
interface ISampleSendQuery {
  /** 操作人id */
  operatorId: string
  /** 任务id */
  taskId: string
  /** 任务编号 */
  taskCode: string
  /** 功能室id */
  labId: string
  /** 样品编号 */
  objectCode: string
  /** 样品名称 */
  objectName: string
}

export function useSampleSendComposable() {
  const router = useRouter()
  function handleSampleSend(query: ISampleSendQuery) {
    const queryStr = new URLSearchParams(query as Record<string, any>)
    const insetUrl = `${
      import.meta.env.VITE_INSERT_APP
    }#/sample-send?isNeedAuth=0&inEmbed=1&${queryStr}`
    router.push({ path: "/insetApp", query: { url: insetUrl } })
  }

  /** # 取消送样 */
  async function handleCancelSampleSend(ids: string[], payload: Record<string, any>) {
    await showConfirmDialog({
      title: "提示",
      message: "确定要取消吗？",
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    })
    showLoadingToast({})
    const res = await request
      .put(authApiTransform(`/api/intelligent/sampling/cancel/${ids.join(",")}`), payload)
      .finally(() => {
        closeToast()
      })
    if (res.code === 20010) {
      showFailToast(res.msg || res.message)
      return Promise.reject(res)
    } else {
      showSuccessToast("取消成功")
      return Promise.resolve(res)
    }
  }

  /** # 确认送样 */
  async function handleConfirmSampleSend(ids: string[], payload: Record<string, any>) {
    await showConfirmDialog({
      title: "提示",
      message: "确定要确认吗？",
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    })
    showLoadingToast({})
    const res = await request
      .put(authApiTransform(`/api/intelligent/sampling/deliver/${ids.join(",")}`), payload)
      .finally(() => {
        closeToast()
      })
    if (res.code === 20010) {
      showFailToast(res.msg || res.message)
      return Promise.reject(res)
    } else {
      showSuccessToast("送达确认成功")
      return Promise.resolve(res)
    }
  }

  return {
    handleSampleSend,
    handleCancelSampleSend,
    handleConfirmSampleSend
  }
}

export function getDictByCode(code: string) {
  return request.get("api/type/getTypesByGroupCode", {
    params: {
      groupCode: code
    }
  })
}
