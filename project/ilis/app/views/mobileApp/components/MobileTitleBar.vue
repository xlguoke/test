<template>
  <van-nav-bar :border="false">
    <template #right>
      <div v-if="showUser" class="flex gap-2 items-center text-white" @click="toPage">
        <img class="w-4" :src="userIcon" />
        <span>{{ realName }}</span>
      </div>
      <slot v-else name="right"></slot>
    </template>
    <template #title>
      <slot name="title">
        {{ showTitle }}
      </slot>
    </template>
    <template v-if="$slots.left" #left>
      <slot name="left"></slot>
    </template>
  </van-nav-bar>
</template>

<script setup lang='ts'>
import { computed, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore'

const props = defineProps({
  title: {
    type: String,
  },
  showUser: {
    type: Boolean,
  },
  hideTitle: {
    type: Boolean,
  },
})

const userIcon = new URL(`~/views/mobileApp/assets/icon/user.svg`, import.meta.url).href

const route = useRoute()

const router = useRouter()

const { userInfo } = toRefs(useAppUserStore())

const realName = computed(() => userInfo.value.realName)

const showTitle = computed(() => {
  if (props.hideTitle) {
    return ''
  }
  return props.title || route.meta.title
})

function toPage() {
  router.push({ name: 'setting' })
}
</script>
