<script setup lang='ts'>
import { AppEntry, CommonNotice, DoneStatistics, UserCard } from './components'
import { NEWS, NOTICE, WAITDONE } from '@/types/index.d'

definePage({
  meta: {
    title: '首页',
  },
})
</script>

<template>
  <div class="portal-warp h-full px-6 pt-4 min-h-150">
    <a-row :gutter="16" class="h-full">
      <a-col
        :xxl="16"
        :xl="15"
        :span="14"
        class="h-full flex flex-col"
      >
        <UserCard />
        <!-- 应用入口 -->
        <AppEntry class="mt-4 flex-1 h-0" />
        <div class="mt-4 flex-1 flex h-0">
          <!-- 已完成统计 -->
          <DoneStatistics class="grow mr-4 w-0" />
          <!-- 我的待办 -->
          <CommonNotice
            title="我的待办"
            :type="WAITDONE"
            title-icon="icon-wait-done.svg"
            class="grow-2 w-0"
          />
        </div>
      </a-col>
      <a-col
        :xxl="8"
        :xl="9"
        :span="10"
        class="flex flex-col h-full"
      >
        <!-- 公告板 -->
        <CommonNotice
          title="公告板"
          :type="NOTICE"
          title-icon="icon-notice.svg"
          class="flex-1 h-0"
        />
        <!-- 消息提醒 -->
        <CommonNotice
          title="消息提醒"
          :type="NEWS"
          title-icon="icon-news.svg"
          class="mt-4 flex-1 h-0"
        />
      </a-col>
    </a-row>
  </div>
</template>
