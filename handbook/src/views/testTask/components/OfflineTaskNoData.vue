<script setup lang="ts">
import { inject } from 'vue'
import { RouterLink } from 'vue-router'
import { useTestTask } from './useTestTask'
import NoData from '@/components/noData/index.vue'

const { goDetail } = useTestTask()
const changeActiveKey = inject('changeActiveKey') as Function
</script>

<template>
  <div class="offline-no-data">
    <NoData describe="暂无离线任务！" />

    <div style="width: 80%;max-width: 450px; margin: 0 auto">
      <p>如需在无网环境下填写试验数据，需要满足以下条件</p>
      <p>
        1.试验相关基础数据已下载到本地
        <RouterLink to="/my/updateManage">
          去设置>
        </RouterLink>
      </p>
      <p>2.创建离线任务</p>
      <p class="create">
        方式一：如之前已创建任务，可将在线任务直接设为离线任务
        <a href="#" @click="changeActiveKey('1')">去设置></a>
      </p>
      <p class="create">
        方式二：如果之前没有创建任务，你可以在本页面直接创建
        <a href="#" @click="goDetail('')">立即创建></a>
      </p>
    </div>
  </div>
</template>

<style lang="less" scoped>
.offline-no-data {
  font-size: 14px;
  img {
    display: block;
    margin: 0 auto;
    width: 60%;
    max-width: 300px;
  }
  p {
    max-width: 400px;
    margin: 1.5rem auto 0;
    a {
      color: var(--primary-color);
    }
  }
  .create {
    margin: 1rem auto 0;
    font-size: 12px;
    line-height: 16px;
  }
}
.main-horizontal .offline-no-data {
  .no-data {
    margin-top: 3%;
  }
}
</style>
