<template>
  <a-modal
    v-model:visible="mvisible"
    :title="title"
    :mask-closable="false"
    :keyboard="false"
    :width="width"
    @ok="saveModal"
    @cancel="cancelModal"
  >
    <a-spin :spinning="loading">
      <div style="min-height: 350px">
        <slot name="queryForm" :form="form" :search="queryDataList" :reset="resetFrom">
          <a-space>
            <template v-for="f in formList" :key="f.value">
              <a-select
                v-if="f.type == 'select'"
                v-model:value="form[f.value]"
                allow-clear
                :placeholder="`请选择${f.label}`"
              >
                <a-select-option v-for="opt in f.options" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </a-select-option>
              </a-select>
              <a-input
                v-else
                v-model:value="form[f.value]"
                allow-clear
                :placeholder="`请输入${f.label || '关键字'}查询`"
                @keypress.enter="queryDataList"
              />
            </template>
            <a-button type="primary" @click="queryDataList">查询</a-button>
            <a-button @click="resetFrom">重置</a-button>
          </a-space>
        </slot>
        <div style="padding-top: 5px">
          <a-table
            :data-source="dataSource"
            :columns="columns"
            :row-selection="rowSelection"
            :custom-row="customRow"
            :pagination="isPagination ? pagination : false"
            size="small"
            bordered
            :row-key="rowKey"
            :scroll="{ y: tableH }"
          />
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef, watch, PropType, reactive, inject } from "vue"
import { message } from "ant-design-vue"
import type { queryType, DataType } from "./baseModal"
import type { TableColumnType, PaginationProps } from "ant-design-vue"
import http from "@/utils/request"

const props = defineProps({
  visible: Boolean,
  // 弹窗标题
  title: {
    type: String,
    default: "数据列表"
  },
  // 已选列表，用于回显；数据必须包含 【props.rowKey】绑定属性 -> [{id:'',...},{id:'',...}...]
  selected: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  rowKey: {
    type: String,
    default: "id"
  },
  // 禁用项
  disabledRows: {
    type: Array as PropType<DataType[]>,
    default: () => []
  },
  // 查询表单
  queryForm: {
    type: Array as PropType<queryType[]>,
    default: () => []
  },
  // 表格列
  queryColumns: {
    type: Array as PropType<TableColumnType[]>,
    required: true,
    default: () => []
  },
  width: {
    type: String,
    default: "1000px"
  },
  // 选择类型
  type: {
    type: String,
    default: "checkbox"
  },
  // 表格数据
  datas: {
    type: Array as PropType<DataType[]>,
    default: () => []
  },
  // 是否分页：分页获取时，搜索调用接口，不分页时本地过滤
  isPagination: Boolean,
  // 分页请求时，获取数据的配置
  httpOption: {
    type: Object,
    default: () => ({})
  },
  autoClose: Boolean
})
const emit = defineEmits(["ok", "update:visible"])

const mvisible = ref<boolean>(props.visible)
const form = ref<any>({})
const formList = ref<queryType[]>([])
const columns = ref<TableColumnType[]>([
  {
    title: "序号",
    dataIndex: "index",
    key: "index",
    width: 50,
    align: "center",
    fixed: "left",
    customRender: ({ index }) => {
      return index + 1
    }
  }
])

const tableH = ref<number>(450)

// 初始化
onMounted(() => {
  if (!mvisible.value) return
  tableH.value = (window.innerHeight || document.body.clientHeight) * 0.8 - 260
  formList.value = props.queryForm
  columns.value = [...columns.value, ...props.queryColumns] as TableColumnType[]
  if (props.isPagination) {
    getPageDatas()
  } else {
    initDatas(props.datas)
  }
})

watch(
  () => props.visible,
  (val) => {
    mvisible.value = val
  }
)
watch(
  () => [props.datas, props.selected],
  (dataObj) => {
    if (props.isPagination) {
      getPageDatas()
    } else {
      initDatas(dataObj[0])
    }
  }
)

// 分页
const commonPagination = reactive(inject("commonPagination") as PaginationProps)
const pagination = reactive<PaginationProps>({
  ...commonPagination,
  onChange: (page: number, pageSize: number) => {
    pagination.current = page
    pagination.pageSize = pageSize
    _selectedRows.value = []
    _selectedRowKeys.value = []
    getPageDatas()
  }
})
// 分页查询数据
const getPageDatas = (flag?: boolean, addId?: string) => {
  const { url, method = "get", pageZero = false, pagesKey = {}, params = {} } = props.httpOption
  const page = (pagesKey && pagesKey.page) || "currPage"
  const pageSize = (pagesKey && pagesKey.pageSize) || "maxPage"
  flag && (pagination.current = 1)
  loading.value = true
  http({
    url,
    method,
    params: {
      ...form.value,
      [page]: pageZero ? (pagination.current as number) - 1 : pagination.current,
      [pageSize]: pagination.pageSize,
      ...params
    }
  })
    .then((res: any) => {
      if (!res.success) {
        message.error(res.error?.message)
        return
      }
      const list = res.result.items
      loading.value = false
      dataSource.value = list
      pagination.total = res.result.totalCount
      if ((props.selected?.length && list.length) || (flag && addId)) {
        initSelectionRow(list, addId)
      }
    })
    .catch(() => {
      loading.value = false
    })
}

defineExpose({
  getPageDatas
})

// 重置
const resetFrom = () => {
  form.value = {}
}

// 搜索：已选中数据不过滤
const queryDataList = () => {
  if (props.isPagination) {
    getPageDatas(true)
    return
  }
  loading.value = true
  let queryDatas = [...props.datas]
  const f = form.value
  queryDatas = queryDatas.filter((d: DataType) => {
    let valid = true
    if (_selectedRowKeys.value.length > 0 && _selectedRowKeys.value.includes(d[props.rowKey])) {
      return true
    }
    for (let k in f) {
      if (f[k] && d[k].indexOf(f[k]) === -1) {
        valid = false
        break
      }
    }
    return valid
  })
  initDatas(queryDatas)
}

// 加载数据
const loading = ref<boolean>(true)
const dataSource = shallowRef<DataType[]>([])
const initDatas = (list: DataType[]) => {
  dataSource.value = list
  loading.value = false
  if (props.selected?.length && list.length) {
    initSelectionRow(list)
  }
}

// 回显
const initSelectionRow = (list: DataType[], addId?: string) => {
  const selectedRow = props.selected
  let ids = selectedRow.map((d: any) => d[props.rowKey])
  if (addId) {
    // 弹窗内新增数据，并直接选中这条数据
    props.type === "radio" ? (ids = [addId]) : ids.push(addId)
  }
  _selectedRowKeys.value = ids
  _selectedRows.value = list.filter((d) => {
    return ids.includes(d[props.rowKey])
  })
}

// 行选择数据
const _selectedRowKeys = ref<string[]>([])
const _selectedRows = ref<DataType[]>([])
const rowSelection = {
  type: props.type,
  selectedRowKeys: _selectedRowKeys,
  onSelect: (record: DataType) => {
    triggerSelected(record)
  },
  onSelectAll: (selected: boolean, selectedRows: DataType[]) => {
    if (selected) {
      _selectedRows.value = selectedRows
      _selectedRowKeys.value = selectedRows.map((d) => d[props.rowKey])
    } else {
      _selectedRows.value = []
      _selectedRowKeys.value = []
    }
  },
  getCheckboxProps: (record: DataType) => ({
    disabled: isDisabled(record)
  })
}
// 点击行
const customRow = (record: DataType) => {
  return {
    onClick: () => {
      if (isDisabled(record)) return
      triggerSelected(record)
    }
  }
}

const isDisabled = (record: DataType) => {
  const keys = props.disabledRows || []
  if (keys.length == 0) return false
  return keys.findIndex((d: any) => d[props.rowKey] == record[props.rowKey]) !== -1
}

const triggerSelected = (record: DataType) => {
  if (props.type == "radio") {
    _selectedRowKeys.value = [record[props.rowKey]]
    _selectedRows.value = [record]
    return
  }
  const _id = record[props.rowKey]
  const ind = _selectedRowKeys.value.indexOf(_id)
  if (ind !== -1) {
    _selectedRowKeys.value.splice(ind, 1)
    _selectedRows.value.splice(ind, 1)
  } else {
    _selectedRowKeys.value.push(_id)
    _selectedRows.value.push(record)
  }
}

// 关闭弹窗
const cancelModal = () => {
  mvisible.value = false
  emit("update:visible", false)
}

// 保存选择
const saveModal = () => {
  if (_selectedRows.value.length == 0) {
    message.warning("请选择数据")
    return
  }
  emit("ok", _selectedRows.value)
  if (props.autoClose) {
    cancelModal()
  }
}
</script>

<style lang="less" scoped>
:deep(.ant-table-pagination.ant-pagination) {
  margin-bottom: 0;
}
</style>
