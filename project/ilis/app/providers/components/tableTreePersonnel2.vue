<template>
  <div>
    <ht-modal
      v-model:open="visible"
      :title="titles || '选择人员'"
      centered
      :force-render="true"
      :mask-closable="false"
      class="components-selectPersonnel"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <div layout="inline" class="searchBox">
            <a-input
              v-model:value="searchString"
              placeholder="请输入名称后回车/查询"
              @keyup.enter="doFilter"
            />
            <a-button @click="doFilter">
              查询
            </a-button>
          </div>
          <div class="content-table">
            <a-table
              v-if="treeData.length > 0"
              :default-expand-all-rows="defaultExpandAllRows"
              :columns="columns"
              :data-source="treeData"
              :expanded-row-keys="expandedRowKeys"
              :row-class-name="rowClassName"
              :pagination="false"
              :row-selection="rowSelection"
              bordered
              :custom-row="customRow"
              @expand="onExpand"
            />
          </div>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
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
      value: data[i].id,
      title: data[i].name,
      key: data[i].id,
      children,
    }
    if (children.length === 0) {
      delete obj.children
    }
    if (obj.type == 'DEPART') {
      obj.disabled = true
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
  {
    title: '账号',
    dataIndex: 'account',
    key: 'account',
    width: '40%',
  },
]

export default {
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
      visible: false,
      treeData: [],
      allData: [],
      nameData: [],
      idsPerson: '',
      titles: '',
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectPage === 'radio') {
              if (!record.children) {
                this.selectedRowKeys = [record.id]
                this.selectedRows = [record]
              }
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
                if (!record.children) {
                  this.selectedRowKeys.push(record.id)
                  this.selectedRows.push(record)
                }
              }
            }
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
        },
        getCheckboxProps: record => ({
          props: {
            disabled: !!record.disabled,
          },
        }),
      }
    },
  },
  created() {
    this.getPersonData()
  },
  methods: {
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
    // 搜索数据
    doFilter() {
      // 装筛选结果的数组
      const newData = []
      const filter = this.searchString
      if (this.allData.length == 0) {
        return false
      }
      this.spinning = true
      const dataRows = this.allData
      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i]
        if (row.name.includes(filter)) {
          newData.push(row)
          // eslint-disable-next-line ts/no-unused-expressions
          this.expandedRowKeys.includes(row.id)
            ? ''
            : this.expandedRowKeys.push(row.id)
        }
        else {
          if (row.children && row.children.length > 0) {
            let _flag = false
            const _row = {
              ...row,
              children: [],
            }
            for (let j = 0; j < row.children.length; j++) {
              if (row.children[j].name.includes(filter)) {
                _row.children.push(row.children[j])
                _flag = true
              }
            }
            if (_flag === true) {
              newData.push(_row)
              // eslint-disable-next-line ts/no-unused-expressions
              this.expandedRowKeys.includes(_row.id)
                ? ''
                : this.expandedRowKeys.push(_row.id)
            }
          }
        }
      }
      this.spinning = false
      this.treeData = newData
    },
    handleCancel() {
      this.searchString = ''
      this.treeData = this.allData
      this.visible = false
    },
    getPersonData() {
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.common.getPersonsForChoose,
        method: 'POST',
        timeout: 30 * 1000,
      }).then((res) => {
        this.spinning = false
        if (res && res.rows) {
          this.treeData = getTree(res.rows)
          this.allData = getTree(res.rows)
          this.nameData = getName(this.treeData)
        }
      })
    },
    showModal(type, idsPerson, acceptData, titles) {
      this.selectPage = type
      this.titles = titles || ''
      this.idsPerson = idsPerson
      this.selectedRows = acceptData || []
      this.selectedRowKeys = this.selectedRows.map(item => item.id)
      this.selectedRowKeys = this.selectedRowKeys.filter(item => item)
      if (this.selectedRowKeys.length > 0) {
        this.defaultExpandAllRows = true
      }
      this.visible = true
    },
    cancelModal() {
      this.selectedRowKeys = []
      this.rowSelection.selectedRowKeys = []
      this.visible = false
    },
    handleSubmit() {
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
      this.visible = false
    },
  },
}
</script>

<style lang="less">
.components-selectPersonnel {
  .searchBox {
    display: flex;
    margin-bottom: 10px;
  }
  .content-table {
    height: 300px;
    overflow-y: auto;
  }
}
</style>
