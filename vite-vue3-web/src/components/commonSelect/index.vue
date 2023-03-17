<template>
  <a-select
    v-model:value="searchVal"
    show-search
    :mode="config.multiple ? 'multiple' : ''"
    :placeholder="_config.placeholder"
    :default-active-first-option="false"
    :filter-option="_config.httpSearch ? false : filterOption"
    :not-found-content="fetching ? undefined : queryHint"
    :options="optionsData"
    :style="'min-width: 200px;' + config.style"
    :disabled="_config.disabled"
    :field-names="{ label: _config.label, value: _config.value }"
    allow-clear
    @search="searchDatas"
    @change="changeDatas"
  >
    <template v-if="fetching" #notFoundContent>
      <a-spin size="small" />
    </template>
  </a-select>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue"
import { debounce } from "@/utils"
import request from "@/utils/request.js"
import { OptType } from "@/type/common"

interface configType {
  method?: string // 请求方式
  keyword?: string // 搜索关键字
  size?: number // 请求条数
  label: string // 下拉框选项绑定值
  value: string // 下拉框选项绑定值
  multiple?: boolean // 是否多选
  disabled?: boolean // 是否多选
  httpSearch?: boolean // 是否远程搜索
  placeholder?: string // 提示信息
  style?: string // 样式
}

const props = defineProps({
  value: {
    type: [String, Array],
    default: "" || []
  },
  url: {
    type: String,
    required: true,
    default: ""
  },
  config: {
    type: Object,
    default: function (d: configType) {
      return d || {}
    }
  }
})
const emit = defineEmits(["update:value", "change"])

const _config = reactive<configType>({
  method: "get",
  keyword: "name",
  size: 999, // 查询条数
  label: "name", // 用于绑定label的字段
  value: "id", // 用于绑定value的字段
  multiple: false, // 是否多选
  httpSearch: false, // 是否远程搜索
  disabled: false, // 是否禁用
  style: "",
  placeholder: "请选择",
  ...props.config
})
const searchVal = ref<any>()
const optionsData = ref<OptType[]>([])
const fetching = ref(false)

onMounted(() => {
  fetch("")
  searchVal.value = props.value || (_config.multiple ? [] : null)
})

// 设置默认值
watch(
  () => props.value,
  (val) => {
    searchVal.value = val || (_config.multiple ? [] : null)
  }
)

// 动态接口
watch(
  () => props.url,
  () => {
    fetch("")
  }
)
// 远程搜索
const searchDatas = (val: string) => {
  if (!_config.httpSearch) return
  debounce(() => {
    fetch(val)
  }, 500)
}
const changeDatas = (value: string, option: OptType | null) => {
  if (!option) {
    fetch("")
  }
  if (!_config.multiple && !option) {
    option = null
  }
  emit("update:value", value)
  emit("change", { value, option })
}

// 列表查询
const queryHint = ref("暂无数据")
const fetch = (val: string) => {
  fetching.value = true
  request({
    url: props.url,
    method: _config.method,
    params: {
      current: 1,
      size: _config.size,
      [_config.keyword as string]: val
    }
  }).then((res: any) => {
    let resList = res.records || res || []
    if (val && resList.length === 0) {
      queryHint.value = `未检测【${val}】`
    } else {
      queryHint.value = "暂无数据"
    }
    optionsData.value = resList
    fetching.value = false
  })
}

// 本地搜索
const filterOption = (input: string, option: any) => {
  return option[_config.label].indexOf(input) >= 0
}
</script>

<style></style>
