<template>
  <a-auto-complete
    v-model:value="inputValue"
    allow-clear
    style="font-size: 12px"
    :data-source="dataSource"
    :placeholder="placeholder"
    @search="onSearch"
    @select="onSelect"
  />
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  props: {
    value: String,
    apiUrl: String, // 接口地址
    qLocal: Boolean, // 本地搜索
    // 快捷查询参数
    qKey: {
      type: String,
      default: 'name',
    },
    // 返回数据中的字段名
    label: {
      type: String,
      default: 'name',
    },
    placeholder: {
      type: String,
      default: '请输入内容',
    },
  },
  emits: ['update:value', 'pressEnter'],
  data() {
    return {
      inputValue: this.value,
      dataSource: [], // 数据名称集合，组件渲染使用
      dataList: [], // 接口返回的完整数据
    }
  },
  watch: {
    value(val) {
      this.inputValue = val
    },
    inputValue(val) {
      $emit(this, 'update:value', val)
    },
    apiUrl() {
      this.dataSource = []
      this.dataList = []
      this.inputValue = ''
      this.loadData()
    },
  },
  methods: {
    async onSearch(text) {
      if (this.qLocal) {
        this.searchLocalData(text)
      }
      else {
        this.loadData(text)
      }
    },
    onSelect(val) {
      const item = this.dataList.find(d => d.name === val)
      const selItem = {}
      if (item) {
        selItem.id = item.id
        selItem.name = item.name
      }
      else {
        selItem.id = ''
        selItem.name = val
      }
      $emit(this, 'pressEnter', selItem)
    },
    // 本地查询
    searchLocalData(text) {
      const list = this.dataList.filter(
        d => d[this.label].includes(text),
      )
      this.dataList = list
      this.dataSource = list.map(d => d[this.label])
    },
    // 加载远程数据
    loadData(text) {
      const params = {
        page: 1,
        rows: 50,
      }
      if (this.qKey) {
        params[this.qKey] = text
      }

      window.$oAjax({
        url: this.apiUrl,
        method: 'get',
        params,
      }).then((res) => {
        if ((res && res.rows) || res.code === 20000) {
          const resData = res.rows || res.data
          const list = resData.map(d => d[this.label])
          if (text && !list.includes(text)) {
            list.unshift(text)
          }
          this.dataList = resData
          this.dataSource = list
        }
      })
    },
  },
}
</script>

<style>
.ant-select-auto-complete.ant-select .ant-select-selection__rendered {
  line-height: 28px;
}
.ant-select-auto-complete.ant-select .ant-input {
  height: 28px;
}
</style>
