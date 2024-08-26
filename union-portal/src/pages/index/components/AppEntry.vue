<script setup lang='ts'>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import Card from '@/components/Card.vue'
import useMyFetch from '@/composables/useMyFetch'
import type { DataSource } from '@/types/applications.d'

const { isFetching, data } = useMyFetch<DataSource[]>('/api/v1/login/user/application')

const appEntryList = ref<any[][]>([])
const morePage = computed(() => appEntryList.value.length > 1)

watchEffect(() => {
  const _data = data.value
  if (!_data)
    return
  const list = []
  let items = []
  for (let i = 0; i < _data.length; i++) {
    items.push(_data[i])
    if ((i + 1) % 10 === 0 || i === _data.length - 1) {
      list.push(items)
      items = []
    }
  }
  appEntryList.value = list
})

const dfUrl = new URL('@/assets/images/app-oa.svg', import.meta.url).href

// 跳转子系统
const loading = ref(false)
async function clickApplication(item: DataSource) {
  if (!item.url) {
    message.warning('该应用未配置跳转地址')
    return ''
  }
  // 获取子系统token
  loading.value = true
  const { data, error } = await useMyFetch(`/api/v1/applications/${item.id}/token`).text()
  loading.value = false
  if (error.value)
    return ''
  const isPar = !item.url.includes('?')
  const url = `${item.url}${isPar ? '?' : '&'}auth_token=${data.value}`
  window.open(url, '_blank')
}
</script>

<template>
  <Card title="应用入口" title-icon="icon-app-entry.svg" :loading="isFetching" hide-more>
    <div :class="morePage ? 'px-9' : ''" h-full overflow-hidden relative>
      <a-spin v-if="loading" class="custom-spin" :spinning="loading" />
      <a-carousel v-if="appEntryList.length" draggable arrows class="h-full">
        <template #prevArrow>
          <i class="i-arrow-right size-8!" />
        </template>
        <template #nextArrow>
          <i class="i-arrow-right size-8!" />
        </template>
        <div
          v-for="(page, i) in appEntryList"
          :key="i"
          :class="`${morePage ? 'pt-5' : 'pt-7 gap-y-2'} grid! grid-cols-5 gap-x-5`"
        >
          <div v-for="(item, j) in page" :key="j" text-center select-none>
            <div inline-block h-auto cursor-pointer @click="clickApplication(item)">
              <img :src="item.logo || item.logoUrl || dfUrl" size-18 mx-auto rounded>
              <p my-1 leading-4>
                {{ item.name }}
              </p>
            </div>
          </div>
        </div>
      </a-carousel>
      <div v-else class="h-full flex items-center justify-center">
        <a-empty />
      </div>
    </div>
  </Card>
</template>

<style scoped>
:deep(.slick-slider),
:deep(.slick-slider div) {
  height: 100%;
}
:deep(.ant-carousel .slick-dots-bottom) {
  bottom: 0;
}
:deep(.ant-carousel .slick-dots li) {
  width: 8px;
  height: 8px;
}
:deep(.ant-carousel .slick-dots li.slick-active) {
  width: 24px;
}
:deep(.ant-carousel .slick-dots li button) {
  height: 8px;
  border-radius: 10px;
  background-color: #a7cdff;
}
:deep(.ant-carousel .slick-dots li.slick-active button) {
  background-color: var(--primary-color);
}
:deep(.ant-carousel .slick-prev) {
  transform: rotate(180deg);
  inset-inline-start: -36px;
}
:deep(.ant-carousel .slick-next) {
  inset-inline-end: -36px;
}

.custom-spin {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.5);
}
</style>
