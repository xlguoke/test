<template>
  <FrameBox>
    <template #title>
      <FrameTitle>飞检实体工程</FrameTitle>
      <div class="w-full flex flex-col">
        <div class="flex items-center justify-end gap-14 mt-32">
          <a-select
            v-model:value="filterProjectVal"
            class="w-full customSelectClass"
            popup-class-name="commonPopupClass"
            show-search
            placeholder="请选择工程类别"
            option-filter-prop="label"
            :options="filterProjectOptions"
            @change="
              () => {
                getFjstgJccsData().then(getFjstgcLiebiaoData)
              }
            "
          />
          <a-select
            v-model:value="jccs"
            class="w-full customSelectClass"
            popup-class-name="commonPopupClass"
            show-search
            placeholder="请选择检测参数"
            :options="jccsOptions"
            @change="
              () => {
                getFjstgcLiebiaoData()
              }
            "
          />
        </div>
      </div>
    </template>
    <div class="flex h-full flex-col">
      <DataTable :columns="columns" :loading="loading" :datas="souceData">
        <template #hgl="{ item }">
          <ProcessBar :process="item.hgl" />
        </template>
        <template #number="{ item }">
          {{ item.index }}
        </template>
      </DataTable>
    </div>
  </FrameBox>
</template>
<script lang="ts" setup>
import { getFjstgcGclb, getFjstgcJccs, getFjstgcLiebiao } from "@/api/smartCockpit.test.api"
import { DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { onMounted, ref } from "vue"
import ProcessBar from "./ProcessBar.vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"

const loading = ref(false)

const jccs = ref() // 检测参数，下拉获取
const filterProjectVal = ref() // 工程类别，下拉获取
const filterProjectOptions = ref<any[]>([])
const jccsOptions = ref<any[]>([])

// 获取列表数据，默认为列表第一个值
async function getFjstgcLiebiaoData() {
  const param = {
    gcxm: filterProjectVal.value,
    jccs: jccs.value,
    order: "id",
    asc: "asc"
  }
  try {
    const { data } = await getFjstgcLiebiao(param)
    if (!data || !data.length) {
      return
    }
    souceData.value = data.map((item: any, index: number) => {
      return {
        ...item,
        hgl: item.hgl * 100,
        index: ++index
      }
    })
  } catch (error) {
    console.log(error)
  }
}
// 获取工程类别
async function getFjstgcGclbData() {
  try {
    const { data } = await getFjstgcGclb()
    if (!data || !data.length) {
      return
    }
    filterProjectOptions.value = data.map((item: any) => {
      return {
        label: item.gcxm,
        value: item.gcxm
      }
    })
    filterProjectVal.value = filterProjectOptions.value[0].value // 默认选中第一个
  } catch (error) {
    console.log(error)
  }
}

// 根据工程类别 => 检测参数
async function getFjstgJccsData() {
  try {
    const { data } = await getFjstgcJccs(filterProjectVal.value)
    if (!data || !data.length) {
      return
    }
    jccsOptions.value = data.map((item: any) => {
      return {
        label: item.jccs,
        value: item.jccs
      }
    })
    jccs.value = jccsOptions.value[0].value // 默认为第一个检查参数
  } catch (error) {
    console.log(error)
  }
}

const columns = ref<DataTableHead[]>([
  { title: "序号", key: "number", width: "1.5rem", align: "center" },
  { title: "项目名称", key: "xmmc" },
  { title: "标段", key: "bdmc" },
  { title: "检查季度", key: "jcjd" },
  { title: "检测数量", key: "jcsl" },
  { title: "合格率", key: "hgl" }
])
const souceData = ref([])

const getList = useAutoRequestHooks({
  api: getFjstgcLiebiaoData,
  immediate: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setData: () => {}
})

onMounted(async () => {
  await getFjstgcGclbData()
  await getFjstgJccsData()
  getList()
})
</script>
<style scoped></style>
