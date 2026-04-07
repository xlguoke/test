<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="选择人员"
      cantered
      class="components-selectPersonnel"
      @ok="handleSubmit"
    >
      <a-tree
        v-model:value="checkedKeys"
        :checkable="multiple"
        :expanded-keys="expandedKeys"
        :auto-expand-parent="autoExpandParent"
        :selected-keys="selectedKeys"
        :tree-data="treeData"
        :multiple="multiple"
        :tree-default-expand-all="true"
        @expand="onExpand"
        @check="onCheck"
        @select="select"
      />
    </ht-modal>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'

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
      value: data[i].id,
      name: data[i].name,
    })
  }
  return arr
}

export default {
  props: ['callback'],
  data() {
    return {
      visible: false,
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      treeData: [],
      field: '',
      multiple: true,
      nameData: [],
      select: () => {},
    }
  },
  created() {
    this.getPersonData()
  },
  methods: {
    getPersonData() {
      window.$oRest({
        url: window.$oApi.common.getPersonsForChoose,
        method: 'POST',
      }).then((res) => {
        if (res && res.rows) {
          this.treeData = getTree(res.rows)
          this.nameData = getName(this.treeData)
        }
      })
    },
    showModal(field, ids, data, type) {
      if (type && type === 'radio') {
        this.multiple = false
        this.selectedKeys = data || []
        this.select = this.onSelect
      }
      else {
        this.multiple = true
        this.checkedKeys = data || []
        this.select = () => {}
      }

      this.field = field
      this.ids = ids
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
    onSelect(selectedKeys) {
      this.selectedKeys = selectedKeys
    },
    handleSubmit() {
      let nameArr = []
      let data = []
      let selectData = []

      if (this.multiple === true) {
        data = this.checkedKeys
      }
      else {
        data = this.selectedKeys
      }

      if (data.length == 0) {
        message.warn('请选择设置的人员')
        return
      }

      if (data.length > 0) {
        // eslint-disable-next-line array-callback-return
        selectData = this.nameData.filter((item) => {
          for (let i = 0; i < data.length; i++) {
            if (data[i] == item.value) {
              return item
            }
          }
        })

        nameArr = selectData.map(item => item.name)
      }

      this.callback(this.field, this.ids, nameArr, data, selectData)
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
  .ant-modal-body {
    height: 300px;
    overflow-y: auto;

    .ant-tree > li {
      & > .ant-tree-checkbox {
        display: none;
      }

      .ant-tree-title {
        color: #314659 !important;
      }
    }
  }
}
</style>
