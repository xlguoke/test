<script lang="ts" setup>
import { ref, watchEffect } from 'vue'
import type { PropType } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import NoData from '../noData/index.vue'

interface TreeData {
  children?: TreeData[] | undefined
  key: string | number
  title?: any
}
type Key = string | number
const props = defineProps({
  datas: {
    type: Array as PropType<any>,
    required: true,
    default: () => [],
  },
  // 是否父节点可选
  parentIsCheck: Boolean,
  fieldNames: {
    type: Object,
    default: () => ({
      title: 'name',
      key: 'id',
      children: 'children',
    }),
  },
  selectedKeys: {
    type: Array as PropType<Key[]>,
    default: () => [],
  },
  placeholder: {
    type: String,
    defalut: '请选择数据',
  },
})

const router = useRouter()
const route = useRoute()

const expandedKeys = ref<Key[]>([])
const selectedKeys = ref<Key[]>([])
const checkedKeys = ref<Key[]>([])
const treeData = ref<TreeData[]>([])

watchEffect(() => {
  const list: TreeData[] = []
  const { title, key, children } = props.fieldNames
  const keys = []
  ;(function _each(datas, newList) {
    for (let i = 0; i < datas.length; i++) {
      const d: any = datas[i]
      const item = {
        key: d[key],
        title: d[title],
        selectable: true,
        checkable: true,
        children: [],
      }
      if (d[children] && d[children].length > 0) {
        item.children = []
        if (!props.parentIsCheck) {
          // 当前节点不展示多选框
          item.checkable = false
          // 当前节点不可选择
          item.selectable = false
        }
        keys.push(item.key)
        _each(d[children], item.children)
      }
      newList.push(item)
    }
  })(props.datas, list)

  expandedKeys.value = keys
  treeData.value = list
})

watchEffect(() => {
  selectedKeys.value = props.selectedKeys
  checkedKeys.value = props.selectedKeys
})

// 确认选择
const selectedItem = ref()
function confirmSel() {
  const keys = selectedKeys.value
  if (keys.length === 0)
    return showToast({ type: 'fail', message: props.placeholder })
  ;(function _each(datas) {
    if (!datas || datas.length === 0)
      return
    for (let i = 0; i < datas.length; i++) {
      const d = datas[i]
      if (keys[0] === d.key) {
        selectedItem.value = {
          id: d.key,
          name: d.title,
        }
        return
      }
      else {
        d.children?.length && _each(d.children)
      }
    }
  })(treeData.value)
  cancelSel()
}

// 取消选择
function cancelSel() {
  router.back()
}

onBeforeRouteLeave((to) => {
  to.params[route.name as string] = selectedItem.value
})
</script>

<template>
  <div class="sel-tree-content">
    <div class="sel-tree-tree">
      <CustomTree
        v-model:selectedKeys="selectedKeys"
        :tree-data="treeData"
      />
      <NoData v-if="treeData?.length === 0" />
    </div>
    <div class="sel-tree-footer">
      <van-button block @click="cancelSel">
        取消
      </van-button>
      <van-button type="primary" block @click="confirmSel">
        确认
      </van-button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.sel-tree-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.sel-tree-tree {
  flex: 1;
  overflow-y: auto;
  .tree-icon {
    color: var(--primary-color);
    width: 24px;

    &.tree-icon-open {
      width: 26px;
    }
  }

  :deep(.ant-tree) {
    .ant-tree-switcher-noop {
      display: none;
    }
    .ant-tree-treenode {
      min-height: 32px;
      align-items: center;
    }
    .ant-tree-title {
      display: flex;
      align-items: center;
    }
    .ant-tree-checkbox {
      margin-block-start: 0;
    }
  }
}
.sel-tree-footer {
  padding: 1rem 2.5rem;
  display: flex;
  box-shadow: 0 0 4px rgba(9, 9, 9, 0.1);
  .van-button:last-child {
    margin-left: 2rem;
  }
}
</style>
