<template>
  <div class="home">
    <BossHome v-if="isBoss" />
    <home v-else />
  </div>
</template>

<script setup lang='ts'>
import { computed, toRefs } from 'vue'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'
import BossHome from './bossHome.vue'
import home from './home.vue'

const { userInfo } = toRefs(useAppUserStore())

const isBoss = computed(() => (userInfo.value.roleCodes || '').split(',').includes('EQ_PROCESS_DATA'))
</script>
