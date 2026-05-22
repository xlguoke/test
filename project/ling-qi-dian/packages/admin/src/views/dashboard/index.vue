<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">概览</h1>
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card>
          <Statistic title="今日订单" :value="128" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <Statistic title="今日营收" :value="2560" prefix="¥" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <Statistic title="新增会员" :value="12" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <Statistic title="总会员数" :value="1024" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { Statistic } from 'ant-design-vue'
</script>
