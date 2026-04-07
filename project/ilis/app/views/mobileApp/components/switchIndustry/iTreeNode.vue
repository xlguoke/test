<template>
  <div
    class="tree-node"
    :class="{
      active: node.id === activeId,
    }"
  >
    <div
      class="tree-node-content"
      :style="{
        paddingLeft: children.length ? '0px' : '24px',
      }"
      @click="onSelect(node)"
    >
      <template v-if="children.length > 0">
        <template v-if="expand">
          <van-icon size="20" class-prefix="iconfont" name="minus-square" color="#999" @click.stop="onExpand" />
          <van-icon size="20" class-prefix="iconfont" name="folder-open-fill" color="#154bd0" @click.stop="onExpand" />
        </template>
        <template v-else>
          <van-icon size="20" class-prefix="iconfont" name="plus-square" color="#999" @click.stop="onExpand" />
          <van-icon size="20" class-prefix="iconfont" name="folder-fill" color="#154bd0" @click.stop="onExpand" />
        </template>
      </template>
      <van-checkbox
        v-else
        icon-size="18"
        :value="node.id === activeId"
        shape="square"
        style="margin-bottom: 2px;"
      ></van-checkbox>
      <div>{{ node.text }}</div>
    </div>

    <template v-if="expand">
      <ITreeNode
        v-for="cItem in children"
        :key="cItem.id"
        :active-id="activeId"
        :node="cItem"
        style="padding-left: 24px;"
        @on-select="getSelect"
      />
    </template>
  </div>
</template>

<script>
import { Popup } from 'vant'

export default {
  name: 'ITreeNode',
  components: {
    [Popup.name]: Popup,
  },
  props: ['node', 'activeId'],
  emits: ['onSelect'],
  data() {
    return {
      visible: false,
      keyword: '',
      treeData: [],
    }
  },
  computed: {
    children() {
      return this.node.children || []
    },
    expand() {
      return this.node.expand
    },
  },
  watch: {
    value(val) {
      this.visible = val

      if (val === true) {
        this.getBigcategory()
      }
    },
  },
  methods: {
    getSelect(node) {
      this.$emit('onSelect', node)
    },
    onSelect(node) {
      if (node && node.children && node.children.length) {
        this.onExpand()
        return
      }

      if (node && node.id === this.activeId) {
        this.$emit('onSelect', null)
        return
      }

      this.$emit('onSelect', node)
    },
    onExpand() {
      // eslint-disable-next-line vue/no-mutating-props
      this.node.expand = !this.node.expand
    },
  },
}
</script>

<style lang="less" scoped>
.tree-node {
  &.active {
    background-color: #e6f0ff;
  }
}

.tree-node-content {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}
</style>
