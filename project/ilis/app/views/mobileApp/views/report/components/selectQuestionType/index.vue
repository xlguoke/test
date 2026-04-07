<template>
  <div>
    <van-popup
      position="bottom"
      :style="{ width: '100%', height: '45%' }"
      :show="value"
      duration="0.2"
      @click-overlay="onCancel"
    >
      <van-cascader
        v-model="cascaderValue"
        title="请选择问题内容"
        :options="treeData"
        @close="onCancel"
        @finish="onSelect"
      />
    </van-popup>
  </div>
</template>

<script>
import {
  showDialog,
} from 'vant'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { $emit } from '../../../utils/gogocodeTransfer'

export default {
  props: ['value', 'reportId'],
  emits: ['update:value', 'selected-ok'],
  data() {
    return {
      treeData: [],
      questionType: {},
      cascaderValue: '',
    }
  },
  watch: {
    value(val) {
      if (val) {
        this.getData()
      }
    },
  },
  methods: {
    async getData() {
      const res = await mRequest.get(api.report.questionType, {
        params: {
          page: 1,
          size: 10000,
          reportId: this.reportId,
        },
      })

      if (res.code === 20000) {
        this.treeData = this.buildTree(res.data.rows)
      }
    },
    onSelect({ selectedOptions }) {
      const row = selectedOptions[selectedOptions.length - 1]
      this.questionType = {
        id: row.id,
        text: row.text,
        severity: row.severity,
      }
      this.ok()
    },
    onCancel() {
      $emit(this, 'update:value', false)
    },
    ok() {
      if (!this.questionType.id) {
        showDialog({ message: '请选择问题类型' })
        return
      }
      $emit(this, 'selected-ok', this.questionType)
      this.onCancel()
    },
    buildTree(items) {
      // 存储所有节点的映射（id -> node），节点为原始对象的浅拷贝
      const nodeMap = new Map()
      // 存储每个父节点下的子节点 id 列表
      const childrenMap = new Map()

      // 第一遍遍历：初始化节点映射和父子关系
      items.forEach((item) => {
        // 拷贝节点，避免修改原对象
        nodeMap.set(item.id, {
          ...item,
          text: item.name,
          value: item.id,
        })

        // 记录子节点关系
        if (item.parentId) {
          if (!childrenMap.has(item.parentId)) {
            childrenMap.set(item.parentId, [])
          }
          childrenMap.get(item.parentId).push(item.id)
        }
      })

      /**
       * 递归构建节点及其子树
       * @param {string} id - 节点 id
       * @returns {object | null} 构建后的节点，若 id 无效则返回 null
       */
      function buildNode(id) {
        const node = nodeMap.get(id)
        if (!node)
          return null

        const childIds = childrenMap.get(id)
        // 如果有子节点，递归构建 children 数组，并挂载到节点上
        if (childIds && childIds.length > 0) {
          node.children = childIds
            .map(childId => buildNode(childId))
            .filter(child => child !== null) // 过滤掉无效子节点
        }
        // 没有子节点时，不添加 children 属性
        return node
      }

      const roots = []

      // 第二遍遍历：找出所有根节点（parentId 为空或父节点不存在）
      items.forEach((item) => {
        if (!item.parentId || !nodeMap.has(item.parentId)) {
          const rootNode = buildNode(item.id)
          if (rootNode)
            roots.push(rootNode)
        }
      })

      return roots
    },
  },
}
</script>
