<template>
  <div class="input-select">
    <a-dropdown :trigger="['click']" :visible="visible">
      <a-input
        v-model:value="keyword"
        autocomplete="off"
        :placeholder="_config.placeholder"
        @click.prevent
        @focus="focusFn"
        @blur="blurFn"
        @change="changeInput"
      />
      <template #overlay>
        <a-menu @click="menuClick">
          <a-menu-item v-for="opt in options" :key="opt[_config.value]">
            {{ opt[_config.label] }}
          </a-menu-item>
          <p v-if="options.length === 0">暂无可选项</p>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from "vue"
import { debounce } from "@/assets/js/common"
import axios from "axios"

const props = defineProps({
  value: {
    type: String,
    default: ""
  },
  change: Function,
  url: String,
  config: {
    type: Object,
    default: () => ({})
  }
})

// input事件为输入框改变事件， change为下拉选择事件
const emit = defineEmits(["update:value", "input", "change"])

const _config = reactive({
  method: "get",
  keyword: "name", // 搜索关键字属性
  size: 999, // 分页查询条数
  queryHttp: false, // 是否远程搜索
  label: "name", // 下拉选项绑定值
  value: "id", // 下拉选项绑定值
  placeholder: "请输入",
  ...props.config
})

// 设置默认值
watch(
  () => props.value,
  (val) => {
    keyword.value = val
  }
)

onMounted(() => {
  keyword.value = props.value
  if (props.url) {
    fetch()
  }
})

const visible = ref(false)
const options = ref([])
const originList = ref<any>([])
const fetch = () => {
  axios({
    url: props.url,
    method: _config.method,
    params: {
      curent: 1,
      size: _config.size,
      [_config.keyword as string]: keyword.value
    }
  }).then((res: any) => {
    let list = res.records || res || []
    options.value = list
    originList.value = [...list]
  })
}

// 修改输入框内容
const keyword = ref()
const changeInput = () => {
  const val = keyword.value
  emit("update:value", val)
  emit("input", val)
  debounce(() => {
    if (_config.queryHttp) {
      fetch()
    } else {
      initOpts(val)
    }
  }, 500)
}

// 初始化待选项
const initOpts = (val) => {
  if (val === "") {
    options.value = originList.value
    return
  }
  options.value = originList.value.filter((d: any) => d[_config.keyword].indexOf(val) !== -1)
}

// 获得光标
const focusFn = () => {
  const val = keyword.value
  initOpts(val)
  visible.value = true
}

// 失去光标
const blurFn = () => {
  debounce(() => {
    visible.value = false
  }, 300)
}

// 选择待选项
const menuClick = (e) => {
  visible.value = false
  const key = e.key
  const option = options.value.find((d) => d[_config.value] == key)
  const value = option ? option[_config.label] : ""
  keyword.value = value
  emit("update:value", value)
  emit("change", { value, option })
}
</script>

<style lang="less" scoped>
.input-select {
  display: inline-block;
  min-width: 180px;
  width: 100%;
}
</style>
