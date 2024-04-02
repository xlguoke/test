<script lang="ts" setup>
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Input,
  Radio,
  RadioGroup,
  message,
} from 'ant-design-vue'
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
})

const emits = defineEmits(['load', 'search', 'confirm'])

const selectedKey = ref()
const selectedKeys = ref<string[]>([])
const selectedAll = ref(false)
const indeterminate = computed(
  () =>
    selectedKeys.value.length > 0
    && selectedKeys.value.length < props.dataList.length,
)

// 初始化选中状态
watchEffect(() => {
  const rows = props.selectedRows
  if (props.type === 'radio')
    selectedKey.value = rows[0] ? rows[0].id : ''
  else if (props.type === 'checkbox')
    selectedKeys.value = rows.map(item => item.id)
})

// 数据列表更新时，已选中的数据还存在保留选中状态
watch(
  () => props.dataList,
  () => {
    if (props.type === 'radio') {
      const isSel = props.dataList.find(d => d.id === selectedKey.value)
      if (isSel)
        selectedKey.value = isSel.id
    }
    else {
      const selList: string[] = props.dataList
        .filter(d => selectedKeys.value.includes(d.id))
        .map(d => d.id)
      selectedKeys.value = selList
    }
  },
)

// 搜索
const keyword = ref('')
function onSearch() {
  emits('search', keyword.value)
}

// 确认选择
function confirmSel() {
  let rows = []
  if (props.type === 'radio') {
    if (!selectedKey.value)
      return message.warning('请选择一条数据')
    const item = props.dataList.find(item => item.id === selectedKey.value)
    rows.push(item)
  }
  else {
    if (selectedKeys.value.length === 0)
      return message.warning('请至少选择一条数据')
    rows = props.dataList.filter(d => selectedKeys.value.includes(d.id))
  }

  emits('confirm', rows)
  cancelSel()
}

// 取消选择
function cancelSel() {
  router.back()
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
      <Input.Search
        v-model:value.trim="keyword"
        allow-clear
        :placeholder="placeholder"
        @search="onSearch"
      >
        <template #enterButton>
          <Button type="primary">
            <i class="iconfont icon-sousuo" />
          </Button>
        </template>
      </Input.Search>
      <div v-if="type === 'checkbox'" class="batch-handle">
        <Checkbox
          v-model:checked="selectedAll"
          :indeterminate="indeterminate"
          :disabled="props.dataList.length === 0"
          @change="changeSelectedAll"
        >
          {{ selectedAll ? '取消全选' : '全选' }}
        </Checkbox>
      </div>
    </div>
    <div class="data-list-datas">
      <RollingLoading @load="emits('load')">
        <RadioGroup
          v-if="type === 'radio'"
          v-model:value="selectedKey"
          style="width: 100%"
        >
          <ul class="pd-lr" style="flex: 1">
            <li
              v-for="item in dataList"
              :key="item.id"
              class="data-list-list my-list"
            >
              <Radio :value="item.id" class="data-list-checkbox">
                <span class="data-list-name">{{ item.name }}</span>
              </Radio>
            </li>
          </ul>
        </RadioGroup>
        <CheckboxGroup
          v-else
          v-model:value="selectedKeys"
          style="width: 100%; overflow-x: hidden"
          @change="changeDataItem"
        >
          <ul class="pd-lr" style="flex: 1; width: 100%">
            <li
              v-for="item in dataList"
              :key="item.id"
              class="data-list-list my-list"
            >
              <Checkbox :value="item.id" class="data-list-checkbox">
                <span class="data-list-name">{{ item.name }}</span>
              </Checkbox>
            </li>
          </ul>
        </CheckboxGroup>
      </RollingLoading>
    </div>
    <div v-show="dataList.length > 0" class="data-list-footer">
      <Button block @click="cancelSel">
        取消
      </Button>
      <Button block type="primary" @click="confirmSel">
        确认
      </Button>
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
  .batch-handle {
    margin-top: 1rem;
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

    .data-list-checkbox {
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
