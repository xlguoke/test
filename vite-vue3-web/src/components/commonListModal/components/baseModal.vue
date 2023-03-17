<template>
  <a-modal
    v-model:visible="mvisible"
    :title="title"
    :mask-closable="false"
    :keyboard="false"
    :width="`${width ? width : '900px'}`"
    @ok="saveModal"
    @cancel="cancelModal"
  >
    <div style="min-height: 350px">
      <a-space style="margin-bottom: 10px">
        <template v-for="f in formList" :key="f.value">
          <a-select
            v-if="f.type == 'select'"
            v-model:value="form[f.value]"
            :placeholder="`请选择${f.label}`"
          >
            <a-select-option v-for="opt in f.options" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </a-select-option>
          </a-select>
          <a-input
            v-else
            v-model:value="form[f.value]"
            :placeholder="`请输入${f.label || '关键字'}查询`"
            @keypress.enter="queryDataList"
          />
        </template>
        <a-button type="primary" @click="queryDataList">查询</a-button>
      </a-space>
      <a-table
        :data-source="dataSource"
        :loading="loading"
        :columns="columns"
        :row-selection="rowSelection"
        :custom-row="customRow"
        :pagination="false"
        size="small"
        bordered
        :row-key="rowKey"
        :scroll="{ y: tableH }"
      />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef, watch } from "vue"
import { message } from "ant-design-vue"
import type { queryType, DataType, objType } from "./baseModal"
import type { TableColumnType } from "ant-design-vue"
const props = defineProps({
  visible: Boolean,
  // 弹窗标题
  title: {
    type: String,
    default: ""
  },
  // 已选列表，用于回显；数据必须包含 【props.rowKey】绑定属性 -> [{id:'',...},{id:'',...}...]
  selected: {
    type: Array,
    default: function (d: any) {
      return d || []
    }
  },
  rowKey: {
    type: String,
    default: "id"
  },
  // 禁用项
  disabledRows: {
    type: Array,
    default: function (d: any) {
      return d || []
    }
  },
  // 查询表单
  queryForm: {
    type: Array,
    required: true,
    default: function (d: any) {
      return d || []
    }
  },
  // 表格列
  queryColumns: {
    type: Array,
    required: true,
    default: function (d: TableColumnType) {
      return d || []
    }
  },
  width: {
    type: String,
    default: ""
  },
  // 选择类型
  type: {
    type: String,
    default: "checkbox"
  },
  // 表格数据
  datas: {
    type: Array,
    default: function (d: any) {
      return d || []
    }
  },
  autoClose: Boolean
})
const emit = defineEmits(["ok", "update:visible"])

const mvisible = ref<boolean>(props.visible)
const form = ref<objType>({})
const formList = ref<queryType[]>([])
const columns = ref<TableColumnType[]>([
  {
    title: "",
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
  tableH.value = (window.innerHeight || document.body.clientHeight) * 0.8 - 230
  formList.value = props.queryForm as queryType[]
  columns.value = [...columns.value, ...props.queryColumns] as TableColumnType[]
  props.datas.length > 0 && initDatas(props.datas)
})

watch(
  () => [props.datas, props.selected],
  (list) => {
    initDatas(list[0])
  }
)

watch(
  () => props.visible,
  (val) => (mvisible.value = val)
)

// 搜索
const queryDataList = () => {
  const queryDatas = ref<DataType[]>([...(props.datas as DataType[])])
  const f: any = form.value
  queryDatas.value = queryDatas.value.filter((d: DataType) => {
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
  initDatas(queryDatas.value)
}

// 加载数据
const loading = ref<boolean>(true)
const dataSource = shallowRef<DataType[]>([])
const initDatas = (list: any) => {
  dataSource.value = list
  loading.value = false
  if (props.selected?.length && list.length) {
    initSelectionRow(list)
  }
}

// 回显
const initSelectionRow = (list: any) => {
  const selectedRow = props.selected as string[]
  const ids = selectedRow.map((d: any) => d[props.rowKey])
  _selectedRowKeys.value = ids
  _selectedRows.value = list.filter((d: any) => {
    return ids.includes(d[props.rowKey])
  })
}

// const getDataList = (flag?: boolean) => {
//   axios({
//     url: "",
//     method: "get",
//     params: form.value,
//   }).then((res: any) => {
//     dataSource.value = res.records || [];
//   });
// };

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

<style lang="less" scoped></style>
