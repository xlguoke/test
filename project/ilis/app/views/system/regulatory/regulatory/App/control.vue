<template>
  <ht-modal
    v-model:open="visible"
    title="添加限制条件"
    ok-text="确定"
    cancel-text="取消"
    :destroy-on-close="true"
    @ok="handleOk"
  >
    <a-transfer
      class="tree-transfer"
      :data-source="dataSource"
      :target-keys="targetKeys"
      :render="(item) => item.title"
      :show-select-all="false"
      @change="onChange"
    >
      <template
        #children="{
          props: { direction, selectedKeys },
          on: { itemSelect },
        }"
      >
        <a-tree
          v-if="direction === 'left'"
          block-node
          checkable
          check-strictly
          default-expand-all
          :checked-keys="[...selectedKeys, ...targetKeys]"
          :tree-data="treeData"
          @check="
            (_, props) => {
              onChecked(_, props, [...selectedKeys, ...targetKeys], itemSelect)
            }
          "
          @select="
            (_, props) => {
              onChecked(_, props, [...selectedKeys, ...targetKeys], itemSelect)
            }
          "
        />
      </template>
    </a-transfer>
  </ht-modal>
</template>

<script>
const treeData = [
  { key: '0-0', title: '0-0' },
  {
    key: '0-1',
    title: '0-1',
    children: [
      { key: '0-1-0', title: '0-1-0' },
      { key: '0-1-1', title: '0-1-1' },
    ],
  },
  { key: '0-2', title: '0-3' },
]

const transferDataSource = []

function flatten(list = []) {
  list.forEach((item) => {
    transferDataSource.push(item)
    flatten(item.children)
  })
}

flatten(JSON.parse(JSON.stringify(treeData)))

function isChecked(selectedKeys, eventKey) {
  return selectedKeys.includes(eventKey)
}

function handleTreeData(data, targetKeys = []) {
  data.forEach((item) => {
    item.disabled = targetKeys.includes(item.key)
    if (item.children) {
      handleTreeData(item.children, targetKeys)
    }
  })
  return data
}

export default {
  name: 'Control',
  data() {
    return {
      visible: false,
      targetKeys: [],
      dataSource: transferDataSource,
    }
  },
  computed: {
    treeData() {
      return handleTreeData(treeData, this.targetKeys)
    },
  },
  methods: {
    handleOk() {},
    show() {
      this.visible = true
    },
    onChange(targetKeys) {
      this.targetKeys = targetKeys
    },
    onChecked(_, e, checkedKeys, itemSelect) {
      const { eventKey } = e.node
      itemSelect(eventKey, !isChecked(checkedKeys, eventKey))
    },
  },
}
</script>

<style scoped></style>
