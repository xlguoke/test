<template>
  <FrameBox>
    <template #title>
      <FrameTitle>工地试验室检查</FrameTitle>
      <div class="w-full flex flex-col">
        <div class="flex items-center justify-end gap-14 mt-32">
          <a-select
            v-model:value="selectedType"
            class="w-full customSelectClass"
            popup-class-name="commonPopupClass"
            placeholder="请选择检查类别"
            :options="selectTypeOptions"
            @change="init()"
          />
        </div>
      </div>
    </template>
    <div class="flex h-full flex-col">
      <DataTable :columns="columns" :loading="loading" :datas="souceData">
        <template #number="{ item }">
          {{ item.index }}
        </template>
      </DataTable>
    </div>
  </FrameBox>
</template>
<script lang="ts" setup>
import { getGdsysjcJclb, getGdsysjcList, getReportProjects } from "@/api/smartCockpit.test.api"
import { DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import { onMounted, ref, watch } from "vue"

const loading = ref(false)

const selectedType = ref("")

const selectTypeOptions = ref<any[]>([])

// 配置表格列
const columns = ref<DataTableHead[]>([
  { title: "序号", key: "number", align: "center", width: "1.5rem" },
  { title: "项目名称", key: "xmmc" },
  { title: "试验室", key: "sysmc" },
  { title: "检查季度", key: "jcjd" },
  { title: "得分", key: "df", width: "1.5rem" },
  { title: "排名", key: "mc", width: "1.5rem" }
])

async function getSelectTypeOptions() {
  const { data } = await getGdsysjcJclb()
  if (!data || !data.length) {
    return
  }
  selectTypeOptions.value = data.map((item: any) => {
    return {
      label: item.jcfl,
      value: item.jcfl
    }
  })
  selectedType.value = selectTypeOptions.value[0].value
}

// 获取列表数据
async function getGdsysjcListData() {
  try {
    const { data } = await getGdsysjcList(selectedType.value)
    if (!data || !data.length) {
      return
    }
    souceData.value = data.map((item: any, index: number) => {
      return {
        ...item,
        index: ++index
      }
    })
    console.log("souceData", souceData.value)
  } catch (error) {
    console.log(error)
  }
}
const souceData = ref([
  {
    serialNumber: 2,
    projectName: "成绵高速",
    lab: "LPL-1",
    inspectionQuarter: "2023-01",
    score: "97.3",
    ranking: 1
  }
])

const init = useAutoRequestHooks({
  api: getGdsysjcListData,
  immediate: false
})

onMounted(async () => {
  await getSelectTypeOptions()
  init()
})
</script>
<style></style>
