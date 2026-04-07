<template>
  <div>
    <van-popup
      title="选择人员"
      position="right"
      :style="{ width: '90%', height: '100%' }"
      :show="value"
      class="sample-selectPerson"
      @click-overlay="onCancel"
    >
      <p style="text-align: center; padding: 10px; background: #154bd0; color: #fff">
        选择人员
      </p>
      <form action="/">
        <van-search
          v-model="searchValue"
          placeholder="请输入搜索关键词"
          @input="onSearch()"
          @search="onSearch()"
          @clear="onClear()"
        />
      </form>
      <div style="height: calc(100% - 145px)">
        <van-tree-select
          v-model:active-id="activeId"
          v-model:main-active-index="activeIndex"
          :items="treeData"
          height="100%"
        />
      </div>

      <van-button
        style="position: fixed; bottom: 0; left: 0; right: 0; width: 100%"
        type="primary"
        @click="onSelect"
      >
        确定
      </van-button>
    </van-popup>
  </div>
</template>

<script>
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  props: ['value', 'selType', 'url', 'params', 'method', 'formatRes'],
  emits: ['update:value', 'selectedOk'],
  data() {
    return {
      searchValue: '',
      activeId: '',
      activeIndex: 0,
      treeData: [],
      sourceData: [],
      nameData: [],
      type: 'radio',
    }
  },
  watch: {
    selType(val) {
      this.type = val
      if (val === 'checkbox') {
        this.activeId = []
      }
      else {
        this.activeId = ''
      }
    },
  },
  created() {
    this.type = this.selType || 'radio'
    if (this.selType === 'checkbox') {
      this.activeId = []
    }
    else {
      this.activeId = ''
    }
    this.getData()
  },
  methods: {
    onClear() {
      this.searchValue = ''
      this.onSearch()
    },
    onSearch() {
      const value = this.searchValue
      const source = JSON.parse(JSON.stringify(this.sourceData))
      let treeData
      if (!this.isEmpty(value)) {
        const s = source.filter(item => item.children.some(it => it.name.includes(value)))
        treeData = s.map((item) => {
          item.children = item.children.filter(it => it.name.includes(value))
          return item
        })
      }
      else {
        treeData = source
      }
      this.treeData = treeData
      this.nameData = this.getName(treeData)
    },

    isEmpty(obj) {
      return obj === null || obj === '' || obj === undefined || obj === 'NaN'
    },

    getData() {
      mRequest({
        url: api.sampleManageApp.queryPerson,
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.data) {
          this.sourceData = this.formatData(res.data)
          this.treeData = this.formatData(res.data)
          this.nameData = this.getName(this.treeData)
        }
      })
    },
    showData(res, type) {
      this.type = type === 'checkbox' ? type : 'radio'
      if (type === 'checkbox') {
        this.activeId = []
      }
      else {
        this.activeId = ''
      }
      this.treeData = this.formatData(res.rows)
      this.nameData = this.getName(this.treeData)
    },
    selectType(type) {
      this.type = type === 'checkbox' ? type : 'radio'
      if (type === 'checkbox') {
        this.activeId = []
      }
      else {
        this.activeId = ''
      }
    },
    formatData(data) {
      if (!Array.isArray(data)) {
        return
      }
      const arr = []
      for (let i = 0; i < data.length; i++) {
        let children = []
        if (data[i].children && data[i].children.length !== 0) {
          children = this.formatData(data[i].children)
        }
        arr.push({
          ...data[i],
          value: data[i].id,
          title: data[i].name,
          key: data[i].id,
          // disabled: data[i].type == "DEPART",
          text: data[i].name,
          children,
        })
      }
      return arr
    },
    getName(data, dataP) {
      if (!Array.isArray(data)) {
        return
      }
      let arr = []
      for (let i = 0; i < data.length; i++) {
        let arr2 = []
        if (data[i].children && data[i].children.length !== 0) {
          arr2 = this.getName(data[i].children, data[i])
          arr = arr.concat(arr2)
        }
        arr.push({
          id: data[i].id,
          name: data[i].name,
          account: data[i].account,
          pId: dataP && dataP.id ? dataP.id : '',
          pName: dataP && dataP.name ? dataP.name : '',
        })
      }
      return arr
    },
    onCancel() {
      this.$emit('update:value', false)
    },
    onSelect() {
      let activeArr = []
      if (this.type === 'radio') {
        activeArr.push(this.activeId)
      }
      else {
        activeArr = JSON.parse(JSON.stringify(this.activeId))
      }
      const data = []
      if (activeArr.length > 0) {
        // eslint-disable-next-line array-callback-return
        activeArr.map((id) => {
          const obj = this.nameData.find(item => item.id === id)
          if (obj) {
            data.push({ ...obj })
          }
        })
      }
      this.$emit('selectedOk', data)
      this.onCancel()
    },
    onClearSelectStatus() {
      if (this.selType === 'checkbox') {
        this.activeId = []
      }
      else {
        this.activeId = ''
      }
      this.activeIndex = 0
      this.searchValue = ''
      this.onSearch()
    },
  },
}
</script>

<style lang="less" scoped>
.sample-selectPerson {
  :deep(.van-sidebar-item--select)::before {
    background: #1989fa;
    height: 100%;
  }

  :deep(.van-tree-select__item--active) {
    color: #1989fa;
  }
}
</style>
