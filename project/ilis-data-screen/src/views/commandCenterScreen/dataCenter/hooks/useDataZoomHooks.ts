import { ref } from "vue"

export function useDataZoomHooks() {
  const dataZoom = ref<any>([{ type: "inside", xAxisIndex: 0, filterMode: "none" }])

  function setDataZoom(end) {
    dataZoom.value[0].start = 0
    dataZoom.value[0].end = end
  }

  return {
    dataZoom,
    setDataZoom
  }
}
