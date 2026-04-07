<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="选择人员"
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
          <a-tree
            v-model:value="checkedKeys"
            :checkable="multiple"
            :expanded-keys="expandedKeys"
            :auto-expand-parent="autoExpandParent"
            :selected-keys="selectedKeys"
            :tree-data="treeData"
            :multiple="multiple || true"
            :tree-default-expand-all="true"
            @expand="onExpand"
            @check="onCheck"
            @select="onSelect"
          />
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
    arr.push({
      ...data[i],
      value: data[i].id,
      title: data[i].name,
      key: data[i].id,
      children,
    })
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
      value: data[i].id,
      name: data[i].name,
    })
  }
  return arr
}

export default {
  props: ['callback', 'multiple'],
  data() {
    return {
      visible: false,
      expandedKeys: [],
      autoExpandParent: true,
      spinning: false,
      checkedKeys: [],
      selectedKeys: [],
      treeData: [],
      allData: [],
      searchString: '',
      field: '',
      nameData: [],
      data: [],
    }
  },
  created() {
    this.getPersonData()
  },
  methods: {
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
        if (dataRows[i].name.includes(filter)) {
          // 先匹配的是部门名字,如果部门匹配上了,直接全部门放到newData里面
          newData.push(dataRows[i])
        }
        else {
          // 如果部门没有匹配上,继续处理部门下的人员
          const persons = dataRows[i].children
          if (persons.length > 0) {
            for (let j = 0; j < persons.length; j++) {
              // 匹配人名
              if (persons[j].name.includes(filter)) {
                newData.push(persons[j])
              }
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
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      }).then((res) => {
        this.spinning = false
        if (res && res.rows) {
          this.treeData = getTree(res.rows)
          this.allData = getTree(res.rows)
          this.nameData = getName(this.treeData)
        }
      })
    },
    showModal() {
      this.visible = true
    },
    cancelModal() {
      this.expandedKeys = []
      this.autoExpandParent = true
      this.checkedKeys = []
      this.selectedKeys = []
      this.visible = false
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    onCheck(checkedKeys) {
      this.checkedKeys = checkedKeys
    },
    onSelect(selectedKeys, info) {
      const data = info.node.dataRef
      if (this.multiple === false && data.type == 'USER') {
        this.data = data
        this.selectedKeys = [data.id]
      }
    },
    handleSubmit() {
      if (this.multiple === true) {
        const data = this.nameData.filter(item =>
          this.checkedKeys.includes(item.value),
        )
        this.callback(data)
      }
      else {
        this.callback(this.data)
      }
      this.expandedKeys = []
      this.autoExpandParent = true
      this.checkedKeys = []
      this.selectedKeys = []
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
  .ant-modal-body {
    height: 300px;
    overflow-y: auto;

    .ant-tree > li {
      border-bottom: solid 1px #e2e2e2;

      & > .ant-tree-checkbox {
        display: none;
      }

      .ant-tree-title {
        color: #314659 !important;
      }

      &:first-child {
        border-top: solid 1px #e2e2e2;
      }
    }
  }
}
</style>
