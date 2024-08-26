<script setup lang="ts">
import { Footer, Header } from '@/layout'

definePage({
  meta: {
    title: 'layout',
  },
})
</script>

<template>
  <a-layout w-full h-screen overflow-hidden>
    <Header />
    <a-layout-content overflow-y-auto>
      <router-view />
    </a-layout-content>
    <Footer />
  </a-layout>
</template>
