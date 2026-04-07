<template>
  <div>
    <a-modal
      v-model:open="visible"
      title="选择人员"
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
    </a-modal>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'

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
      mAjax({
        url: mApi.common.getPersonsForChoose,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
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

      if (this.multiple === true) {
        data = this.checkedKeys
      }
      else {
        data = this.selectedKeys
      }

      if (data.length > 0) {
        nameArr = this.nameData
          // eslint-disable-next-line array-callback-return
          .filter((item) => {
            for (let i = 0; i < data.length; i++) {
              if (data[i] == item.value) {
                return item
              }
            }
          })
          .map(item => item.name)
      }

      this.callback(this.field, this.ids, nameArr, data)
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
        color: rgba(0, 0, 0, 0.65) !important;
      }
    }
  }
}
</style>
