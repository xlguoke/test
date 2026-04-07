<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import type { TaskListQuery } from '@/type/testTask'

const props = defineProps({
  defaultQuery: {
    type: Object as () => TaskListQuery,
    default: () => ({}),
  },
  tabKey: {
    type: String,
    default: '1',
  },
  inUdr: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['search'])

function initStatus() {
  return props.tabKey === 'online' ? ['10'] : []
}

const placeholder = computed(() => {
  return props.tabKey === 'online'
    ? '请输入样品名称、样品编号或任务编号'
    : '请输入样品名称或任务编号'
})

const showStartPicker = ref(false)
const showEndPicker = ref(false)

const count = ref(0)
const openDrawer = ref(false)
const searchVal: { [p: string]: any } = ref({
  q: '',
  allocDateStart: '',
  allocDateEnd: '',
  projectName: '',
  paramName: '',
  status: initStatus(),
})

watch(
  () => props.defaultQuery,
  (q) => {
    searchVal.value = { ...searchVal.value, ...q }
  },
)

watchEffect(() => {
  let n = 0
  for (const k in searchVal.value) {
    if (k === 'q')
      continue
    if (searchVal.value[k] && searchVal.value[k].length)
      n++
  }
  count.value = n
})

const maxDate = computed(() => {
  if (searchVal.value.allocDateEnd)
    return new Date(searchVal.value.allocDateEnd)

  return new Date()
})

const minDate = computed(() => {
  if (searchVal.value.allocDateStart)
    return new Date(searchVal.value.allocDateStart)

  return new Date(new Date().getFullYear() - 10, new Date().getMonth(), 1)
})

function onStartConfirm({ selectedValues }: { selectedValues: string[] }) {
  searchVal.value.allocDateStart = selectedValues.join('-')
  showStartPicker.value = false
}

function onEndConfirm({ selectedValues }: { selectedValues: string[] }) {
  searchVal.value.allocDateEnd = selectedValues.join('-')
  showEndPicker.value = false
}

function onQuickSearch() {
  emitSearch(searchVal.value)
}

function onSearch() {
  emitSearch(searchVal.value)
  openDrawer.value = false
}

function resetFrom() {
  searchVal.value = {
    q: searchVal.value.q,
    allocDateStart: '',
    allocDateEnd: '',
    projectName: '',
    paramName: '',
    status: initStatus(),
  }
  emitSearch(searchVal.value)
}

function emitSearch(query: TaskListQuery) {
  emits('search', query)
}
</script>

<template>
  <div class="test-task-search pd-lr">
    <div class="search-or-more">
      <van-search
        v-model.trim="searchVal.q" style="flex: 1;padding-left: unset;" show-action :placeholder="placeholder"
        left-icon="_" @search="onQuickSearch"
      >
        <template #action>
          <van-button type="primary" style="height: 34px;vertical-align: middle;" @click="onQuickSearch">
            <van-icon v-if="inUdr" name="search" />
            <i v-else class="custom-search iconfont icon-sousuo" />
          </van-button>
        </template>
      </van-search>
      <div class="search-count" @click="openDrawer = true">
        <van-icon v-if="inUdr" name="filter-o" style="font-size: 24px;color: #1989fa;" />
        <i v-else class="iconfont icon-a-zu8911" />
        <span v-show="count > 0" class="count">{{ count }}</span>
      </div>
    </div>
    <van-popup
      v-model:show="openDrawer" position="right" closeable close-icon-position="top-left"
      :style="{ width: '340px', height: '100%' }"
    >
      <div class="pop-title">
        全部筛选
      </div>
      <div class="pop-content">
        <van-form class="custom-form" label-align="top" @submit="onSearch">
          <van-field style="margin-bottom: unset;">
            <template #label>
              <span class="form-label-icon" />
              创建时间
            </template>
            <template #input>
              <van-row :gutter="[10, 5]" justify="start">
                <van-col :span="11">
                  <van-field
                    v-model="searchVal.allocDateStart" readonly placeholder="开始时间"
                    @click="showStartPicker = true"
                  />
                </van-col>
                <van-col :span="2">
                  ~
                </van-col>
                <van-col :span="11">
                  <van-field
                    v-model="searchVal.allocDateEnd" readonly placeholder="结束时间"
                    @click="showEndPicker = true"
                  />
                </van-col>
              </van-row>
            </template>
          </van-field>
          <van-field v-model="searchVal.projectName" name="projectName" placeholder="请输入工程项目">
            <template #label>
              <span class="form-label-icon" />
              工程项目
            </template>
          </van-field>
          <van-field v-model="searchVal.projectName" name="status" placeholder="请输入工程项目">
            <template #label>
              <span class="form-label-icon" />
              状态
            </template>
            <template #input>
              <van-checkbox-group v-model="searchVal.status" shape="square">
                <template v-if="tabKey === 'online'">
                  <van-row :gutter="[10, 5]" justify="start">
                    <van-col>
                      <van-checkbox name="10">
                        试验检测中
                      </van-checkbox>
                    </van-col>
                    <van-col>
                      <van-checkbox name="20">
                        已提交
                      </van-checkbox>
                    </van-col>
                  </van-row>
                </template>
                <template v-else>
                  <div style="width: 100%">
                    <van-row :gutter="[10, 5]" justify="start">
                      <van-col :span="12">
                        <van-checkbox name="pending">
                          待填写
                        </van-checkbox>
                      </van-col>
                      <van-col :span="12">
                        <van-checkbox name="edited">
                          待上传
                        </van-checkbox>
                      </van-col>
                      <van-col :span="12">
                        <van-checkbox name="uploaded">
                          已上传
                        </van-checkbox>
                      </van-col>
                      <van-col :span="12">
                        <van-checkbox name="uploadFailed">
                          上传失败
                        </van-checkbox>
                      </van-col>
                    </van-row>
                  </div>
                </template>
              </van-checkbox-group>
            </template>
          </van-field>
          <van-field v-model="searchVal.paramName" name="paramName" placeholder="请输入试验参数">
            <template #label>
              <span class="form-label-icon" />
              试验参数
            </template>
          </van-field>
        </van-form>
        <div class="drawer-footer">
          <van-button @click="resetFrom">
            重置
          </van-button>
          <van-button type="primary" @click="onSearch">
            筛选
          </van-button>
        </div>
      </div>
    </van-popup>
    <van-popup v-model:show="showStartPicker" position="bottom">
      <van-date-picker :max-date="maxDate" @confirm="onStartConfirm" @cancel="showStartPicker = false" />
    </van-popup>
    <van-popup v-model:show="showEndPicker" position="bottom">
      <van-date-picker :min-date="minDate" @confirm="onEndConfirm" @cancel="showEndPicker = false" />
    </van-popup>
  </div>
</template>

<style lang="less" scoped>
.test-task-search {
  padding-bottom: 1rem;
  background-color: #fff;
  .search-or-more {
    display: flex;
    align-items: center;

    .search-count {
      position: relative;
      .iconfont {
        margin-left: 1.6rem;
        font-size: 26px;
        color: var(--primary-color);
      }
      .count {
        position: absolute;
        top: -8px;
        right: -8px;
        padding: 0 2px;
        border-radius: 10px;
        color: #fff;
        background-color: var(--error-color);
        font-size: 12px;
        line-height: 16px;
        min-width: 16px;
        text-align: center;
      }
    }
  }
}
.form-label-icon {
  display: inline-block;
  width: 4px;
  height: 14px;
  margin-right: 1rem;
  background-color: var(--primary-color);
  border-radius: 0 4px 4px 0;
  vertical-align: middle;
  content: '';
}
.pop-title {
  font-size: 16px;
  font-weight: bold;
  line-height: 24px;
  padding: 16px 24px 16px 40px;
  border-bottom: 1px solid #ebebfc;
}
.pop-content {
  padding: 24px;
}
.drawer-footer {
  display: flex;
  .van-button {
    flex: 1;
  }
  .van-button:last-child {
    flex: 2;
    margin-left: 2rem;
  }
}
</style>
