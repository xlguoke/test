<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="选择检测大类"
      centered
      :force-render="true"
      :mask-closable="false"
      width="400px"
      :z-index="9999"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content" style="height: 400px">
          <a-table
            :columns="treeColumns"
            :expanded-row-keys="defaultExpandedRowKeys"
            :data-source="treeData"
            :row-selection="rowSelection"
            :scroll="{ y: 360 }"
            :pagination="false"
            :custom-row="customRow"
            style="margin-top: 15px"
            @expand="onexpand"
          ></a-table>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
const treeColumns = [
  {
    title: '大类名称',
    dataIndex: 'name',
  },
]

function defaultExpandFun(data, selRow) {
  if (!Array.isArray(data)) {
    return
  }
  let arr = []
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    let arr2 = []
    if (item.children) {
      if (childSel(item.children, selRow)) {
        arr.push(item.id)
      }
      arr2 = defaultExpandFun(item.children, selRow)
      arr = arr.concat(arr2)
    }
  }
  return arr
}

function childSel(childArr, selRow) {
  if (!Array.isArray(childArr)) {
    return
  }
  let isSel = false
  for (let i = 0; i < childArr.length; i++) {
    if (selRow.includes(childArr[i].id)) {
      isSel = true
      break
    }
  }
  return isSel
}

export default {
  name: 'BigCategory',
  components: {},
  props: ['callback'],
  data() {
    return {
      treeColumns,
      treeData: [],
      visible: false,
      spinning: false,
      defaultExpandAllRows: false,
      selectedRowKeys: [],
      selectedRows: [], // 选中的行
      defaultExpandedRowKeys: [], // 默认展开的行
      selectPage: 'radio', // 默认单选
      customRow: (record) => {
        return {
          onClick: () => {
            this.rowSelect(record)
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        type: this.selectPage,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRows = selectedRows
          this.selectedRowKeys = selectedRowKeys
        },
        onSelect(record, selected) {
          if (selected) {
            self.checkSelected([record])
          }
        },
      }
    },
  },
  created() {
    // this.getTreeData();
  },
  methods: {
    rowSelect(record) {
      if (this.selectPage === 'radio') {
        this.selectedRowKeys = [record.id]
        this.selectedRows = [record]
        this.callback(this.selectedRows[0].id)
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
          this.checkSelected([record])
        }
      }
    },
    onexpand(expanded, record) {
      if (expanded) {
        // 设置展开窗Key
        this.defaultExpandedRowKeys.push(record.id)
      }
      else {
        if (this.defaultExpandedRowKeys.length) {
          this.defaultExpandedRowKeys = this.defaultExpandedRowKeys.filter(
            (v) => {
              return v != record.id
            },
          )
        }
      }
    },
    // 设置模板树
    // setFilterTree(tree, map) {
    //   if(!Array.isArray(tree)){
    //     return [];
    //   }
    //   let arr = [];
    //   for(let i=0;i<tree.length;i++) {
    //     if(map.includes(tree[i].id)) {
    //       let children = null;
    //       if(tree[i].children && tree[i].children.length > 0) {
    //         children = this.setFilterTree(tree[i].children, map);
    //       }
    //       let obj = { ...tree[i], children, itemVoList:[],documentId: this.documentId };
    //       (!children || children.length === 0) && (delete obj.children);
    //       arr.push(obj);
    //     } else {
    //       if(tree[i].children && tree[i].children.length > 0) {
    //         arr = arr.concat(this.setFilterTree(tree[i].children, map))
    //       }
    //     }
    //   }
    //   return arr;
    // },
    // // 设置引用模板树
    // setTreeData() {
    //   let treeData = this.setFilterTree(this.treeData,this.selectedRowKeys);
    //   return treeData;
    // },
    // 选中父级勾选下级
    checkSelected(data) {
      for (let i = 0; i < data.length; i++) {
        if (!this.selectedRowKeys.includes(data[i].id)) {
          this.selectedRows.push(data[i])
          this.selectedRowKeys.push(data[i].id)
        }
        if (data[i].children && Array.isArray(data[i].children)) {
          this.checkSelected(data[i].children)
        }
      }
    },
    showModal(selectPage, acceptData) {
      this.visible = true
      this.selectPage = selectPage
      this.selectedRows = acceptData || []
      const selectedRowKeys = this.selectedRows.map(item => item.id)
      this.selectedRowKeys = selectedRowKeys.filter(item => item)
      if (this.selectedRowKeys.length > 0) {
        this.defaultExpandAllRows = true
      }
      if (this.treeData.length > 0) {
        // eslint-disable-next-line ts/no-unused-expressions
        this.selectedRowKeys.length > 0
          ? (this.defaultExpandedRowKeys = defaultExpandFun(
              this.treeData,
              this.selectedRowKeys,
            ))
          : ''
      }
      else {
        this.getTreeData()
      }
    },
    renderTreeNodes(data, defaultChecke) {
      if (!Array.isArray(data)) {
        return
      }
      const arr = []
      for (let i = 0; i < data.length; i++) {
        let children = []
        if (data[i].children && data[i].children.length != 0) {
          children = this.renderTreeNodes(data[i].children, false)
        }
        if (i === 0 && defaultChecke && this.selectPage === 'radio') {
          if (this.selectedRowKeys.length === 0) {
            this.selectedRowKeys.push(data[i].id)
            this.selectedRows.push(data[i])
          }
          this.callback(this.selectedRows[0].id)
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
        arr.push(obj)
      }
      return arr
    },
    getTreeData() {
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.consignSampleStatistic.getTreeData,
        timeout: 30 * 1000,
      }).then((res) => {
        this.spinning = false
        if (res.length > 0) {
          this.treeData = this.renderTreeNodes(res, true)
          // eslint-disable-next-line ts/no-unused-expressions
          this.selectedRowKeys.length > 0
            ? (this.defaultExpandedRowKeys = defaultExpandFun(
                this.treeData,
                this.selectedRowKeys,
              ))
            : ''
        }
        else {
          this.treeData = []
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    handleCancel() {
      // this.treeData = [];
      this.selectedRows = []
      this.selectedRowKeys = []
      this.visible = false
    },
    handleOk() {
      this.callback(this.selectedRows)
      this.handleCancel()
    },
  },
}
</script>

<style scoped></style>
