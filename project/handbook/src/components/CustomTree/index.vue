<script lang="ts" setup>
import type { PropType } from 'vue'
import { ref, watch } from 'vue'
import CustomTreeItem from './CustomTreeItem.vue'

const props = defineProps({
  selectedKeys: {
    type: Array,
    default: () => [],
  },
  treeData: {
    type: Array as PropType<any>,
    default: () => [{ id: '48269f1cf5aa5e3a835d4d43966f0d30', pid: null, name: '钢筋锈蚀电位', displayName: '钢筋锈蚀电位', systemId: 'bc87addf-289f-4cac-9298-43efee5408ec', bigCategoryId: '8367a9917ddffcad9971f3979377a080', sampleRequirement: null }, { id: '64c1984ef19b229da2926112b7bd250b', checkable: false, pid: null, name: '结构混凝土', displayName: '结构混凝土', systemId: 'e6198d1b-81cf-4b09-885b-a9f56f058e70', bigCategoryId: '9037559d978dd770cba229d9c57de4cf', sampleRequirement: null, children: [{ id: 'f7774407adf0eb64ddb69d09822d317c', pid: '64c1984ef19b229da2926112b7bd250b', name: '钢筋锈蚀电位', displayName: '结构混凝土', systemId: 'bc87addf-289f-4cac-9298-43efee5408ec', bigCategoryId: '9037559d978dd770cba229d9c57de4cf', sampleRequirement: null }] }],
  },
  isMultiple: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:selectedKeys'])

// 使用 ref 存储内部状态
const selectedKeysInner = ref<string[]>([])

// 标记是否由 props 同步触发的更新
let isSyncingFromProps = false

// 初始化/回显时同步 props
watch(() => props.selectedKeys, (newVal) => {
  const newArr = newVal as string[]
  const oldArr = selectedKeysInner.value
  if (newArr.length !== oldArr.length || !newArr.every((v, i) => v === oldArr[i])) {
    isSyncingFromProps = true
    selectedKeysInner.value = [...newArr]
  }
}, { immediate: true, deep: true })

// 监听内部变化，通知父组件
watch(selectedKeysInner, (newVal) => {
  if (!isSyncingFromProps)
    emits('update:selectedKeys', newVal)

  isSyncingFromProps = false
}, { deep: true })

function onCheck(checkedKeys: any) {
  if (!props.isMultiple && checkedKeys.length > 1)
    checkedKeys.splice(0, checkedKeys.length - 1)
}
</script>

<template>
  <van-checkbox-group
    v-model="selectedKeysInner"
    shape="square"
    @change="onCheck"
  >
    <CustomTreeItem v-for="item in treeData" :key="item.id" :item="item" />
  </van-checkbox-group>
</template>

<style lang="less" scoped></style>
