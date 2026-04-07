<template>
  <van-popup
    position="right"
    round
    :style="{ height: '100vh' }"
  >
    <div class="px12 bg-wrapper h-full w-[320px]">
      <div class=" py12 font-bold text-18 flex-x items-center">
        <span stripe></span>
        选择人员
      </div>
      <div class="py12 bg-wrapper">
        <van-search
          v-model="searchValue"
          placeholder="请输入搜索关键词"
          @search="onSearch"
          @clear="onClear"
        >
          <template #left-icon>
            <div flex-x items-center>
              <img src="@/assets/searchIcon.svg" w16 h16 alt="">
            </div>
          </template>
        </van-search>
      </div>
      <div style="height: calc(100% - 145px) ">
        <van-tree-select
          v-model:active-id="activeId"
          v-model:main-active-index="activeIndex"
          :items="treeData"
          height="100%"
          class=" rounded-8 card"
        />
      </div>
      <div class="fixed-box">
        <van-button
          type="primary"
          size="small"
          w-full
          @click="onSelect"
        >
          确定
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script lang="ts" setup>
import { getNowTopOrgUserTrees } from '@/api/common'
import { cloneDeep } from 'lodash-es'

const props = defineProps<{
  multiple?: boolean
}>()

const emit = defineEmits(['confirm'])
const searchValue = ref('')
const activeId = ref()
const activeIndex = ref(0)
const treeData = ref([])
const sourceData = ref([])
const nameData = ref([])
const type = computed(() => {
  return props.multiple ? 'checkbox' : 'radio'
})

watch(() => props.multiple, (val) => {
  if (val) {
    activeId.value = []
  }
  else {
    activeId.value = ''
  }
})

async function getData() {
  const data = await getNowTopOrgUserTrees() as any
  sourceData.value = formatData(data.obj)
  treeData.value = formatData(data.obj)
  nameData.value = getName(treeData.value)
}
getData()

function onClear(e) {
  onSearch(e.target.value)
}
function onSearch(value) {
  const source = cloneDeep(sourceData.value)
  if (!isEmpty(value)) {
    const res = source.filter(item => item.children.some(i => i.name.includes(value)))
    treeData.value = res.map((item) => {
      item.children = item.children.filter(i => i.name.includes(value))
      return item
    })
  }
  else {
    treeData.value = source
  }
  nameData.value = getName(treeData.value)
}

function isEmpty(obj) {
  return obj === null || obj === '' || obj === undefined || obj === 'NaN'
}

function formatData(data) {
  if (!Array.isArray(data)) {
    return
  }
  const arr = []
  for (let i = 0; i < data.length; i++) {
    let children = []
    if (data[i].children && data[i].children.length !== 0) {
      children = formatData(data[i].children)
    }
    arr.push({
      ...data[i],
      value: data[i].id,
      title: data[i].name,
      key: data[i].id,
      // disabled: data[i].type == "DEPART",
      text: data[i].name,
      children,
    })
  }
  return arr
}

function getName(data, dataP?: any) {
  if (!Array.isArray(data)) {
    return
  }
  let arr = []
  for (let i = 0; i < data.length; i++) {
    let arr2 = []
    if (data[i].children && data[i].children.length !== 0) {
      arr2 = getName(data[i].children, data[i])
      arr = arr.concat(arr2)
    }
    arr.push({
      id: data[i].id,
      name: data[i].name,
      account: data[i].account,
      pId: dataP && dataP.id ? dataP.id : '',
      pName: dataP && dataP.name ? dataP.name : '',
    })
  }
  return arr
}
function onSelect() {
  let activeArr = []
  if (type.value === 'radio') {
    activeArr.push(activeId.value)
  }
  else {
    activeArr = cloneDeep(activeId.value)
  }
  const data = []
  if (activeArr.length > 0) {
    activeArr.forEach((id) => {
      const obj = nameData.value?.find(item => item.id === id)
      if (obj) {
        data.push({ ...obj })
      }
    })
  }
  emit('confirm', data)
}
</script>

<style scoped>
:deep(.van-sidebar-item--select::before) {
  border-radius: 4px;
}
:deep(.van-sidebar-item) {
  background-color: transparent;
}
:deep(.van-tree-select__nav) {
  box-shadow: 0px 0px 4px 0px rgba(0, 102, 236, 0.2);
}
</style>
