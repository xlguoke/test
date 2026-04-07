<template>
  <a-spin :spinning="loading" class="param-compare">
    <p style="color: #999">
      若在线试验任务中的检测参数在离线数据中不存在时，将导入失败；若离线数据中的检测参数在在线试验任务中不存在时，导入成功后，将在在线任务中自动添加该检测参数；离线试验数据导入成功后，将覆盖在线试验任务数据，被覆盖后，将无法恢复，请谨慎导入！
    </p>
    <p style="margin-top: 10px">
      检测参数：
    </p>
    <div v-if="params.length > 0">
      <ul class="params-list">
        <li
          v-for="d in params"
          :key="d.id"
          :class="`item item-${d.compareResult}`"
        >
          {{ d.testParamName }}
        </li>
      </ul>
      <ul class="params-list params-type">
        <li class="item item-20">
          在线任务没有，离线数据有
        </li>
        <li class="item item-30">
          在线任务有，离线数据没有
        </li>
        <li class="item item-10">
          两边都有
        </li>
      </ul>
    </div>
    <p v-else style="color: red; margin-top: 10px">
      {{ error }}
    </p>
  </a-spin>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

export default {
  props: ['id', 'taskId'],
  data() {
    return {
      loading: false,
      recordId: '',
      testTaskId: '',
      error: '',
      params: [],
    }
  },
  mounted() {
    this.recordId = getQueryVariable('recordId')
    this.testTaskId = getQueryVariable('testTaskId')
    if (!this.recordId) {
      this.recordId = this.id
      this.testTaskId = this.taskId
    }
    this.getData()
  },
  methods: {
    getData() {
      if (!this.recordId || !this.testTaskId) {
        console.error(
          `参数错误：recordId=${this.recordId} testTaskId=${this.testTaskId}`,
        )
        return
      }
      this.loading = true
      window.$oAjax({
        url: window.$oApi.offlineDataManage.paramsCompare,
        method: 'get',
        params: {
          recordId: this.recordId,
          testTaskId: this.testTaskId,
        },
      })
        .then((res) => {
          this.loading = false
          if (res.code === 20000) {
            const list = res.data.sort(
              (p, n) => p.compareResult - n.compareResult,
            )
            this.params = list
          }
          else {
            this.error = res.message || '获取任务参数信息异常'
          }
        })
        .catch((err) => {
          this.loading = false
          this.error = err.message || '获取任务参数信息异常'
        })
    },
  },
}
</script>

<style lang="less" scoped>
.param-compare {
  padding: 0 10px;
  height: 100%;
  min-height: 150px;
  overflow-y: auto;
}
.params-list {
  .item {
    margin-top: 5px;
    &::before {
      content: '';
      margin-right: 5px;
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 2px;
      vertical-align: middle;
    }
  }
  .item-10::before {
    background-color: #4b7902;
  }
  .item-20::before {
    background-color: #0066ec;
  }
  .item-30::before {
    background-color: #d9001b;
  }
}
.params-type {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
}
</style>
