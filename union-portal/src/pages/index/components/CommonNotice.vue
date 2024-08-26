<script setup lang='ts'>
import { ref } from 'vue'
import { useDateFormat } from '@vueuse/core'
import ViewMore from './ViewMore.vue'
import NoticeDetail from './NoticeDetail.vue'
import Card from '@/components/Card.vue'
import type { Category, Notice } from '@/types/index.d'
import { WAITDONE } from '@/types/index.d'
import { useTableHooks } from '@/composables/useTableHooks'

const props = defineProps<{
  title?: string
  type: Category
  titleIcon?: string
}>()

const query = ref({
  category: props.type,
})
const { loading, dataSource } = useTableHooks<Notice>({
  api: '/api/v1/todos',
  query,
  eqQuery: ['category'],
  filterData: (datas) => {
    datas.forEach((item) => {
      if (item.auditMeta && item.auditMeta.createdAt) {
        const { value } = useDateFormat(item.auditMeta.createdAt, 'YYYY-MM-DD HH:mm:ss')
        item.createdAt = value
      }
    })
    return datas
  },
})

const viewMoreRef = ref<any>()
function showMore() {
  viewMoreRef.value.showModal()
}

const noticeDetailRef = ref()
function showDetail(id: string) {
  noticeDetailRef.value.showModal(id)
}
</script>

<template>
  <Card :title="title" :title-icon="titleIcon" :loading="loading" @more="showMore">
    <template v-for="d in dataSource" :key="d.id">
      <div
        class="data-item mx-[-8px]"
        flex
        py-1
        px-2
        hover:cursor-pointer
        hover:bg-gray-1
        rounded
        @click="showDetail(d.id)"
      >
        <!-- 我的待办 -->
        <div v-if="type === WAITDONE" flex-1 w-0>
          <p whitespace-nowrap overflow-hidden text-ellipsis :title="d.title">
            {{ d.title }}
          </p>
          <p text-gray-400 leading-4 flex items-center>
            <span inline-block class="w-1/3">{{ d.application }}</span>
            <span inline-block mx-2 class="w-1/3">发起人：{{ d.username }}</span>
            <span>发起时间：
              <span v-if="d.auditMeta?.createdAt">
                {{ useDateFormat(d.auditMeta?.createdAt, 'YYYY-MM-DD HH:mm:ss') }}
              </span>
              <span v-else>--</span>
            </span>
          </p>
        </div>
        <!-- 公告、消息 -->
        <template v-else>
          <span flex-1 whitespace-nowrap overflow-hidden text-ellipsis :title="d.title">
            {{ d.title }}
          </span>
          <span ml-2 text-gray-400>2024-00-00 00:00:00</span>
        </template>
      </div>
    </template>
    <div v-if="dataSource.length === 0" class="h-full flex items-center justify-center">
      <a-empty />
    </div>
    <ViewMore ref="viewMoreRef" :title="title" :type="type" />
    <NoticeDetail ref="noticeDetailRef" />
  </Card>
</template>

<style scoped>
.data-item::before {
  content: '';
  margin-right: 8px;
  margin-top: 8px;
  display: block;
  width: 8px;
  height: 8px;
  background-color: #fe6550;
  border-radius: 8px;
}
</style>
