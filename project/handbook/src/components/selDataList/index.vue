<script lang="ts" setup>
import { computed, ref, watch, watchEffect } from 'vue'
import RollingLoading from '@/components/rollingLoading/index.vue'
import router from '@/router'
import type { SelDataItemDTO } from '@/type/common'

const props = defineProps({
  // 选择类型
  type: {
    type: String,
    default: 'radio',
  },
  // 已选值
  selectedRows: {
    type: Array<SelDataItemDTO>,
    default: () => [],
  },
  // 待选列表
  dataList: {
    type: Array<SelDataItemDTO>,
    default: () => [],
    required: true,
  },
  placeholder: {
    type: String,
    default: '输入名称查询',
  },
  cancel: {
    type: Function,
  },
})

const emits = defineEmits(['load', 'search', 'confirm'])

// 单选：选中值
const selectedKey = ref()
// 多选：选中值
const selectedKeys = ref<string[]>([])
const selectedAll = ref(false)
// 多选：缓存已选数据（分页回显）
const selectedCache = ref<SelDataItemDTO[]>([])
// 已选数量
const selectedNum = computed(() => selectedKeys.value.length + selectedCache.value.length)
// 多选：是否半选
const indeterminate = computed(
  () =>
    selectedNum.value > 0
    && selectedNum.value < props.dataList.length,
)

// 初始化/selectedRows变化时：根据类型处理
watch(() => props.selectedRows, (newRows) => {
  if (props.type === 'radio') {
    selectedKey.value = newRows[0] ? newRows[0].id : ''
  }
  else if (props.type === 'checkbox' && newRows.length > 0) {
    selectedCache.value = newRows.map(d => ({
      ...d,
      standardId: d.id,
      standardName: d.name,
      publishCode: d.publishCode,
    }))
    selectedKeys.value = []
  }
}, { immediate: true, deep: true })

// 数据列表更新时：从缓存匹配当前页数据
watch(
  () => props.dataList,
  (newData) => {
    if (props.type === 'radio') {
      const isSel = newData.find(d => d.id === selectedKey.value)
      if (isSel)
        selectedKey.value = isSel.id
    }
    else if (props.type === 'checkbox') {
      if (newData.length === 0)
        return

      const dataIds = newData.map(d => d.id)

      const matched = selectedCache.value.filter(item => dataIds.includes(item.id))
      const unmatched = selectedCache.value.filter(item => !dataIds.includes(item.id))

      const newSelectedIds = [...new Set([...selectedKeys.value, ...matched.map(m => m.id)])]
      selectedKeys.value = newSelectedIds
      selectedCache.value = unmatched
    }
  },
  {
    deep: true,
  },
)

// 搜索
const keyword = ref('')
function onSearch() {
  emits('search', keyword.value)
}

// 确认选择
function confirmSel() {
  let rows: SelDataItemDTO[] = []
  if (props.type === 'radio') {
    if (!selectedKey.value)
      return showToast({ type: 'fail', message: '请选择一条数据', zIndex: 9999 })
    const item = props.dataList.find(item => item.id === selectedKey.value)
    if (item)
      rows.push(item)
  }
  else {
    if (selectedKeys.value.length === 0 && selectedCache.value.length === 0)
      return showToast({ type: 'fail', message: '请至少选择一条数据', zIndex: 9999 })

    const currentPageIds = props.dataList.map(d => d.id)
    const currentPageSelected = props.dataList.filter(d => selectedKeys.value.includes(d.id))
    const cachedSelected = selectedCache.value.filter(item => !currentPageIds.includes(item.id))

    rows = [...currentPageSelected, ...cachedSelected]
  }

  emits('confirm', rows)
  cancelSel()
}

// 取消选择
function cancelSel() {
  if (props.cancel)
    props.cancel()
  else
    router.back()

  keyword.value = ''
}

/** ------ 多选模式 ---------- */
// 全选
function changeSelectedAll() {
  if (selectedAll.value)
    selectedKeys.value = props.dataList.map(item => item.id)
  else selectedKeys.value = []
}

// 是否勾选全选按钮
function changeDataItem() {
  const isAll = selectedKeys.value.length === props.dataList.length
  selectedAll.value = props.dataList.length > 0 && isAll
}
watchEffect(() => {
  if (props.type === 'radio')
    return
  changeDataItem()
})
</script>

<template>
  <div class="data-list-wrap">
    <div class="data-list-search">
      <slot name="search">
        <van-search
          v-model.trim="keyword"
          show-action
          :placeholder="placeholder"
          left-icon="_"
          @search="onSearch"
        >
          <template #action>
            <van-button type="primary" style="height: 34px;vertical-align: middle;" @click="onSearch()">
              <i class="custom-search iconfont icon-sousuo" />
            </van-button>
          </template>
        </van-search>
      </slot>
      <div v-if="type === 'checkbox'" class="batch-handle">
        <van-checkbox
          v-model="selectedAll"
          shape="square"
          :disabled="props.dataList.length === 0"
          :indeterminate="indeterminate"
          @change="changeSelectedAll"
        >
          {{ selectedAll ? '取消全选' : '全选' }}
        </van-checkbox>
        <span class="sel-num">已选 <span style="color:#f00;">{{ selectedNum }}</span> 条</span>
      </div>
    </div>
    <div class="data-list-datas">
      <RollingLoading @load="emits('load')">
        <van-radio-group
          v-if="type === 'radio'"
          v-model="selectedKey"
          shape="dot"
          style="width: 100%"
        >
          <ul class="pd-lr" style="flex: 1">
            <li
              v-for="item in dataList"
              :key="item.id"
              class="my-list data-list-list"
            >
              <van-radio :name="item.id" class="data-list-checkbox">
                <slot name="dataItem" :item="item">
                  <span class="data-list-name">{{ item.name }}</span>
                </slot>
              </van-radio>
            </li>
          </ul>
        </van-radio-group>
        <van-checkbox-group
          v-else
          v-model="selectedKeys"
          shape="square"
          @change="changeDataItem"
        >
          <ul class="pd-lr" style="flex: 1; width: 100%">
            <li
              v-for="item in dataList"
              :key="item.id"
              class="my-list data-list-list"
            >
              <van-checkbox :name="item.id" class="data-list-checkbox">
                <slot name="dataItem" :item="item">
                  <span class="data-list-name">{{ item.name }}</span>
                </slot>
              </van-checkbox>
            </li>
          </ul>
        </van-checkbox-group>
      </RollingLoading>
    </div>
    <div v-show="dataList.length > 0" class="data-list-footer">
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
.data-list-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.data-list-tabs {
  background-color: #fff;
  .ant-tabs-nav-list {
    width: 100%;
    .ant-tabs-tab {
      flex: 1;
    }
  }
}
.data-list-search {
  padding: 1rem 2.5rem;
  background-color: #fff;
  .van-search {
    padding: 0;
  }
  .batch-handle {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    column-gap: 1.2rem;

    .sel-num{
      font-size: 1.2rem;
    }
  }
  :deep(.van-search__action) {
    padding-right: 0;
  }
}

.data-list-datas {
  padding-top: 1rem;
  padding-bottom: 1rem;
  flex: 1;
  height: 0;

  .data-list-list {
    display: flex;
    align-items: center;
    padding: 0;
    box-shadow: 0px 0px 10px 0px rgba(0, 102, 236, 0.1);
    border-radius: 3px;
    font-size: 1.4rem;

    .data-list-checkbox {
      padding: 1.6rem;
      flex: 1;
      display: flex;
      :deep(.ant-checkbox + span) {
        flex: 1;
        width: 0;
      }
      .data-list-name {
        display: block;
        white-space: initial;
      }
    }
  }
}

.data-list-footer {
  display: flex;
  padding: 1rem 2.5rem;
  background-color: #fff;
  box-shadow: 0 0 4px rgba(9, 9, 9, 0.1);
  button:last-child {
    margin-left: 2rem;
  }
}
</style>
