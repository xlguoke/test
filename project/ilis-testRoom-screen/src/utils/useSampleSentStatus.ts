import { useEventSource } from "@vueuse/core"
import { onUnmounted, Ref } from "vue"
import { getUrlParam } from "./utils"
import { showFailToast } from "vant"

interface IStatus {
  status: "PENDING"
  taskId: "402882c1977df711019780b160867dec"
  taskStatus: "已送达"
}

export function useSampleSentStatus(source: Ref<any[]>) {
  const ids = source.value?.map((i) => i.id)
  if (!ids?.length) return
  const query = ids?.map((i) => `ids=${i}`)?.join("&")
  const unitCode = localStorage.getItem("unitCode") || getUrlParam("unitCode") || ""

  const eventSource = new EventSource(
    `/ilis2/api/intelligent/sampling/get-task-status?${query}&companyId=${unitCode}`
  )

  eventSource.addEventListener("progress", (event) => {
    const data: IStatus[] = JSON.parse(event.data || "[]")
    source.value.forEach((i) => {
      if (data.some((j) => j.taskId === i.id)) {
        i.status = data.find((j) => j.taskId === i.id)?.status
        i.samplingTaskStatus = data.find((j) => j.taskId === i.id)?.taskStatus
      }
    })
  })

  eventSource.onerror = (event) => {
    console.error("error", event)
  }

  onUnmounted(() => {
    eventSource.close()
  })

  return eventSource
}
