<script lang="ts" setup>
import { ADMIN } from '@/stores/permissions'
import Login from '@/pages/components/Login.vue'

useHead({
  title: '后台登录',
})
</script>

<template>
  <Login :entry="ADMIN" />
</template>
