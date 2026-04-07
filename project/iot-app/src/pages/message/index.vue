<template>
  <div class=" h-full flex-y">
    <div class=" w-full flex items-center justify-between px-16 pb12 pt12">
      <van-button size="small" type="primary" plain @click="onReadAll">
        全部已读
      </van-button>
      <van-space>
        <van-button size="small" type="primary" plain @click="messageFilterRef.showFilter = true">
          筛选
        </van-button>
      </van-space>
    </div>
    <div class=" w-full flex-1 overflow-y-auto">
      <CustomList
        ref="listRef"
        px-16
        :api="getMessage"
        :query="query"
      >
        <template #default="{ data }">
          <div v-for="(item, index) in data" :key="index" class="relative mb-12 card" @click="onCheck(item)">
            <div class="flex items-center">
              <div
                v-if="item.beenRead === '0'"
                class="mr-4 inline-block h-[6px] w-[6px] rounded-full bg-[#FE6550]"
              ></div>
              <div class="mr-4 flex-1 text-[#5B7489]">
                {{ item.title }}
              </div>
              <div class="text-[#5B7489]">
                {{ item.sendTime }}
              </div>
            </div>
            <p class="textOverflow2 mb-0">
              {{ item.content }}
            </p>
          </div>
        </template>
      </CustomList>
    </div>
    <MessageFilter ref="messageFilterRef" @confirm="onConfirm" />
  </div>
</template>

<script lang="ts" setup>
import { getMessage, markRead, markReadAll, type MessageDTO } from '.'
import MessageFilter from '@/components/Message/MessageFilter.vue'

const router = useRouter()

const query = ref({
  messageType: 'humiture',
  beenRead: undefined,
  msgDateStart: undefined,
  msgDateEnd: undefined,
  orderBy: 'beenRead',
  order: 'desc',
})

const messageFilterRef = ref()

const listRef = ref()

async function onCheck(item: MessageDTO) {
  if (item.beenRead === '0') {
    await markRead(item.id)
    item.beenRead = '1'
  }
  router.push({ name: 'message-detail', query: { id: item.id } })
}

function onConfirm(data) {
  const { beenRead, msgDateStart, msgDateEnd } = data

  query.value.beenRead = beenRead
  query.value.msgDateStart = msgDateStart
  query.value.msgDateEnd = msgDateEnd

  listRef.value.onRefresh()
}

function onReadAll() {
  showConfirmDialog({
    title: '提示',
    message: '确认全部标记为已读吗？',
  }).then(async () => {
    showLoadingToast({
      duration: 0,
      forbidClick: true,
    })
    await markReadAll().finally(closeToast)
    showSuccessToast('操作成功！')
    listRef.value.onRefresh()
  })
}
</script>

<route lang="json">
  {
    "name": "message",
    "meta": {
      "title": "消息提醒",
      "keepAlive": true
    }
  }
</route>
