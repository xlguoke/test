<template>
  <div class="components-selectPersonnel">
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div layout="inline" class="searchBox">
          <a-input-search
            v-model:value="searchString"
            class="searchBox_input"
            placeholder="请输入名称后回车/查询"
            @search="doFilter"
          />
          <a-checkbox
            v-show="!hideAll"
            class="searchBox_checkbox"
            :checked="checked"
            @change="onChange"
          >
            显示所有部门
          </a-checkbox>
        </div>
        <div class="content-table">
          <a-table
            v-if="treeData.length > 0"
            :default-expand-all-rows="defaultExpandAllRows"
            :columns="columns"
            :data-source="treeData"
            :expanded-row-keys="expandedRowKeys"
            :row-class-name="rowClassName"
            :scroll="{ y: yTable }"
            :pagination="false"
            :row-selection="rowSelection"
            bordered
            :custom-row="customRow"
            @expand="onExpand"
          />
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'
// 整理数据
function getTree(data) {
  if (!Array.isArray(data)) {
    return
  }
  const arr = []
  for (let i = 0; i < data.length; i++) {
    let children = []
    if (data[i].children && data[i].children.length != 0) {
      children = getTree(data[i].children)
    }
    const obj = {
      ...data[i],
      name: data[i].name,
      value: data[i].id,
      title: data[i].name,
      key: data[i].id,
      children,
    }
    if (children.length === 0) {
      delete obj.children
    }
    if (obj.type == 'DEPART') {
      // obj.disabled = true;
    }
    arr.push(obj)
  }
  return arr
}

function getName(data) {
  if (!Array.isArray(data)) {
    return
  }
  let arr = []
  for (let i = 0; i < data.length; i++) {
    let arr2 = []
    if (data[i].children && data[i].children.length != 0) {
      arr2 = getName(data[i].children)
      arr = arr.concat(arr2)
    }
    arr.push({
      id: data[i].id,
      name: data[i].name,
    })
  }
  return arr
}
const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
]

export default {
  components: {},
  props: ['callback'],
  data() {
    return {
      columns,
      selectPage: 'radio',
      selectedRowKeys: [],
      selectedRows: [],
      defaultExpandAllRows: false,
      expandedRowKeys: [],
      searchString: '',
      spinning: false,
      treeData: [],
      allData: [],
      nameData: [],
      idsPerson: '',
      checked: false,
      hideAll: false,
      yTable: 360,
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectPage === 'radio') {
              // if(!record.children){
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
              // }
            }
            else {
              if (this.selectedRowKeys.includes(record.id)) {
                const arr = this.selectedRowKeys
                arr.splice(
                  arr.findIndex(item => item === record.id),
                  1,
                )
                this.selectedRows = this.selectedRows.filter(
                  item => item.id !== record.id,
                )
              }
              else {
                // if(!record.children){
                this.selectedRowKeys.push(record.id)
                this.selectedRows.push(record)
                // }
              }
            }
            window.selectedRows = this.selectedRows
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        type: this.selectPage,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
          window.selectedRows = this.selectedRows
        },
        getCheckboxProps: () => ({
          // props: {
          //   disabled: record.disabled ? true : false
          // }
        }),
      }
    },
  },
  created() {
    this.checked = getQueryVariable('isAll') == 1 || false
    this.hideAll = getQueryVariable('hideAll') == 1 || false
    if (this.checked && this.hideAll) {
      this.defaultExpandAllRows = true
    }
    // ilis 跳转的详情页面
    if (getQueryVariable('moduleName')) {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const id
        = getQueryVariable('businessKey') || '4028826372409ea8017240e5e926000b'
      this.showModal('radio', '', [])
    }
    window.getSelectedRows = this.getSelectedRows
  },
  mounted() {
    window.$oNextTick(() => {
      // let herderH = $(".ant-spin-container .spin-content")[0].offsetHeight;
      // let content = $(".searchBox")[0].offsetHeight;
      // this.yTable = herderH - content - 10-15;
    })
  },
  methods: {
    getSelectedRows() {
      return this.selectedRows
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    onExpand(expanded, record) {
      if (this.expandedRowKeys.includes(record.id)) {
        const arr = this.expandedRowKeys
        arr.splice(
          arr.findIndex(item => item === record.id),
          1,
        )
      }
      else {
        this.expandedRowKeys.push(record.id)
      }
    },
    dfs(node) {
      if (node.name.includes(this.searchString)) {
        return true
      }
      else {
        const children = node.children
        if (children && children.length > 0) {
          for (const child of children) {
            if (this.dfs(child)) {
              return true
            }
          }
        }
      }
      return false
    },
    search(nodes) {
      const generated = []
      for (const node of nodes) {
        if (this.dfs(node)) {
          const _node = { ...node }
          const leafs = node.children
          if (leafs && leafs.length > 0) {
            _node.children = this.search(leafs)
          }
          generated.push(_node)
        }
      }
      return generated
    },
    // 搜索数据
    doFilter() {
      // 装筛选结果的数组
      if (this.allData.length === 0) {
        return false
      }
      this.selectedRowKeys = []
      this.selectedRows = []
      this.treeData = this.search(this.allData)
    },
    showModal(type, idsPerson, acceptData) {
      this.getPersonData()
      this.selectPage = type || 'radio'
      this.idsPerson = idsPerson || ''
      this.selectedRows = acceptData || []
      this.selectedRowKeys = this.selectedRows.map(item => item.id)
      this.selectedRowKeys = this.selectedRowKeys.filter(item => item)
      if (this.selectedRowKeys.length > 0) {
        this.defaultExpandAllRows = true
      }
    },
    getPersonData() {
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.taskAllocationDepartment.getTree,
        method: 'GET',
        timeout: 30 * 1000,
        params: {
          all: this.checked,
        },
      }).then((res) => {
        this.spinning = false
        if (res.code === 20000 && res.data && res.data.length > 0) {
          this.treeData = getTree(res.data)
          this.allData = getTree(res.data)
          this.nameData = getName(this.treeData)
        }
      })
    },
    handleOk() {
      // 查找匹配的
      // 查找存在的人员id
      let resData = this.selectedRowKeys.map((ids) => {
        return this.nameData.filter(item => ids === item.id)[0].id
      })
      // 去除undfined
      resData = resData.filter(item => item)

      const allArr = this.selectedRows.filter(item => resData.includes(item.id))

      this.callback(this.idsPerson, allArr)
      this.selectedRowKeys = []
      this.rowSelection.selectedRowKeys = []
    },
    handleCancel() {
      this.selectedRowKeys = []
      this.rowSelection.selectedRowKeys = []
    },
    onChange(e) {
      this.checked = e.target.checked

      this.getPersonData()
    },
  },
}
</script>

<style lang="less" scoped>
.components-selectPersonnel {
  .searchBox {
    display: flex;
    margin-bottom: 10px;
    &_input {
      width: calc(100% - 150px);
    }
    &_checkbox {
      width: 150px;
      margin-left: 20px;
      line-height: 28px;
    }
  }
  .content-table {
    overflow-y: auto;
  }
}
</style>
