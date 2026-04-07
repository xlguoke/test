<template>
  <CommonModal ref="pop" modal-title="温湿度设备实时离线监控">
    <template #function>
      <a-button
        class="w-220"
        style="background-color: #06312c; color: white"
        @click="getOfflineTempDevicesData()"
      >
        刷新
      </a-button>
    </template>
    <template #table>
      <DataTable :datas="souceData" :loading="loading" :columns="columns" :pagination="true">
        <template #number="{ item }">
          {{ item.index }}
        </template>
      </DataTable>
    </template>
  </CommonModal>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from "vue"
import CommonModal from "../CommonModal.vue"
import { FilterDateType, getOfflineTempDevices } from "@/api/smartCockpit.test.api"
import { DataTableHead } from "@/components/smartCockpit/DataTable.vue"

onMounted(() => {
  getOfflineTempDevicesData()
})

const props = withDefaults(
  defineProps<{
    currentFilterDate: FilterDateType
  }>(),
  {
    currentFilterDate: FilterDateType.周
  }
)
const pop = ref()
// 从父组件同步，需要修改
const filterDateVal = ref(props.currentFilterDate)

// 监听父组件修改日期
watch(
  () => props.currentFilterDate,
  (val) => {
    console.log("watch", val)
    filterDateVal.value = val
  }
)

const loading = ref(false)
const souceData = ref([])
const columns = ref<DataTableHead[]>([
  { title: "序号", key: "number", align: "left", width: "2rem" },
  { title: "设备名称", key: "name" },
  { title: "状态", key: "active" }
])

// 初始化列表数据
async function getOfflineTempDevicesData() {
  try {
    loading.value = true
    const { data, totalNum } = await getOfflineTempDevices().finally(() => {
      loading.value = false
    })

    const datas = JSON.parse(data[0].data || "[]")
    souceData.value = (() => {
      let index = 1
      return datas.map((item: any) => {
        return {
          name: item.name,
          active: item.active ? "在线" : "离线",
          index: index++
        }
      })
    })()
  } catch (error) {
    console.log(error)
  }
}

function showModal() {
  getOfflineTempDevicesData()
  pop.value.showModal()
}

defineExpose({
  showModal
})
</script>
<style scoped></style>
