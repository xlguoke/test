<template>
  <a-select
    v-model:value="orgId"
    show-search
    label-in-value
    placeholder="输入机构关键字查询"
    :default-active-first-option="false"
    :filter-option="false"
    :not-found-content="fetching ? undefined : queryHint"
    :options="optionsData"
    :field-names="{ label: 'name', value: 'id' }"
    style="width: 100%"
    @search="searchReport"
    @change="changeReport"
  >
    <template v-if="fetching" #notFoundContent>
      <a-spin size="small" />
    </template>
  </a-select>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from "vue"
import { getOrgByPart } from "@/api/home.api"
import { debounce } from "@/assets/js/utils"
import { message } from "ant-design-vue"

const props = defineProps(["value"])
const emits = defineEmits(["input:value", "change"])
const orgId = ref()

watch(
  () => props.value,
  (val) => {
    orgId.value = val || null
  },
  {
    immediate: true
  }
)

onMounted(async () => {
  optionsData.value = await getOrgDatas("")
})

interface optType {
  label: string
  value: string
  city: string
  id: string
  option?: optType
}
const optionsData = ref<optType[]>([])
const searchReport = (val: string) => {
  fetch(val.trim(), (d: any[]) => (optionsData.value = d))
}
const changeReport = (opt: optType) => {
  emits("input:value", opt.id)
  emits("change", opt)
}

// 机构列表查询
const fetching = ref(false)
const queryHint = ref("暂无数据")
const fetch = async (val: string, callback: any) => {
  debounce(async () => {
    fetching.value = true
    const list = await getOrgByPart(val)
    if (list.length === 0) {
      queryHint.value = `检测到机构【${val}】未在部平台注册，不能在本平台注册账号`
    } else {
      queryHint.value = "暂无数据"
    }
    callback && callback(list)
    fetching.value = false
  }, 500)
}

// 获取机构列表
const getOrgDatas = async (val: string) => {
  const res = await getOrgByPart(val || "")
  if (!res) {
    message.error(res.message || "请求异常")
    return []
  }
  return res
}
</script>

<style lang="less" scoped></style>
