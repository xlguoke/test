<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Col,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  FormItemRest,
  Input,
  Row,
} from 'ant-design-vue'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
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
})
const emits = defineEmits(['search'])

function initStatus() {
  return props.tabKey === 'online' ? ['10'] : []
}

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

function disabledStartDate(current: Dayjs) {
  if (!searchVal.value.allocDateEnd)
    return false
  return current && current > dayjs(searchVal.value.allocDateEnd)
}

function disabledEndDate(current: Dayjs) {
  if (!searchVal.value.allocDateStart)
    return false
  return current && current < dayjs(searchVal.value.allocDateStart)
}
</script>

<template>
  <div class="test-task-search pd-lr">
    <div class="search-or-more">
      <Input.Search
        v-model:value="searchVal.q"
        placeholder="请输入样品名称或任务编号"
        allow-clear
        @search="onQuickSearch"
      >
        <template #enterButton>
          <Button type="primary">
            <i class="iconfont icon-sousuo" />
          </Button>
        </template>
      </Input.Search>
      <div class="search-count" @click="openDrawer = true">
        <i class="iconfont icon-a-zu8911" />
        <span v-show="count > 0" class="count">{{ count }}</span>
      </div>
    </div>

    <Drawer
      v-model:open="openDrawer"
      title="全部筛选"
      width="340"
      class="drawer-search"
    >
      <Form
        layout="vertical"
        :model="searchVal"
        style="flex: 1"
        size="middle"
        @keypress.enter="onSearch"
      >
        <FormItem style="margin-bottom: 0">
          <template #label>
            <span class="form-label-icon" />
            创建时间
          </template>
          <Row>
            <Col :span="11">
              <DatePicker
                v-model:value="searchVal.allocDateStart"
                name="allocDateStart"
                style="width: 100%"
                allow-clear
                value-format="YYYY-MM-DD"
                placeholder="开始时间"
                :disabled-date="disabledStartDate"
              />
            </Col>
            <Col :span="2" style="text-align: center; line-height: 32px">
              ~
            </Col>
            <Col :span="11">
              <FormItemRest>
                <DatePicker
                  v-model:value="searchVal.allocDateEnd"
                  name="allocDateEnd"
                  style="width: 100%"
                  allow-clear
                  value-format="YYYY-MM-DD"
                  placeholder="结束时间"
                  :disabled-date="disabledEndDate"
                />
              </FormItemRest>
            </Col>
          </Row>
        </FormItem>
        <FormItem name="projectName">
          <template #label>
            <span class="form-label-icon" />
            工程项目
          </template>
          <Input
            v-model:value="searchVal.projectName"
            allow-clear
            placeholder="请输入工程项目"
          />
        </FormItem>
        <FormItem name="status">
          <template #label>
            <span class="form-label-icon" />
            状态
          </template>
          <CheckboxGroup v-model:value="searchVal.status">
            <template v-if="tabKey === 'online'">
              <Row>
                <Col :span="12">
                  <Checkbox value="10">
                    待处理
                  </Checkbox>
                </Col>
                <Col :span="12">
                  <Checkbox value="20">
                    已处理
                  </Checkbox>
                </Col>
              </Row>
            </template>
            <template v-else>
              <div style="width: 100%">
                <Row>
                  <Col :span="12">
                    <Checkbox value="pending">
                      待填写
                    </Checkbox>
                  </Col>
                  <Col :span="12">
                    <Checkbox value="edited">
                      待上传
                    </Checkbox>
                  </Col>
                </Row>
                <Row style="margin-top: 5px;">
                  <Col :span="12">
                    <Checkbox value="uploaded">
                      已上传
                    </Checkbox>
                  </Col>
                  <Col :span="12">
                    <Checkbox value="uploadFailed">
                      上传失败
                    </Checkbox>
                  </Col>
                </Row>
              </div>
            </template>
          </CheckboxGroup>
        </FormItem>
        <FormItem name="paramName">
          <template #label>
            <span class="form-label-icon" />
            试验参数
          </template>
          <Input
            v-model:value="searchVal.paramName"
            allow-clear
            placeholder="请输入试验参数"
          />
        </FormItem>
      </Form>
      <div class="drawer-footer">
        <Button block @click="resetFrom">
          重置
        </Button>
        <Button block type="primary" @click="onSearch">
          筛选
        </Button>
      </div>
    </Drawer>
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
.drawer-footer {
  display: flex;
  .ant-btn {
    flex: 1;
  }
  .ant-btn:last-child {
    flex: 2;
    margin-left: 2rem;
  }
}
</style>
