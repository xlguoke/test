<template>
  <div class="h-full py12 px16">
    <div class="h-full overflow-y-auto card">
      <van-skeleton v-if="!dataSource" :row="6" />
      <template v-else>
        <div class="text-16">
          {{ dataSource.title }}
        </div>
        <p class="text-[#5B7489]">
          发送时间：{{ dataSource.sendTime }}
        </p>
        <p>{{ dataSource.content }}</p>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getMessageDetail, type MessageDTO } from '.'

const route = useRoute()

const id = route.query.id as string

const dataSource = ref<MessageDTO>()

getMessageDetail(id).then((res) => {
  dataSource.value = res.data
})
</script>

<route lang="json">
  {
    "name": "message-detail",
    "meta": {
      "title": "消息详情"
    }
  }
</route>
