<template>
  <a-layout class="min-h-screen">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="h-16 flex items-center justify-center text-white text-lg font-bold">
        机车俱乐部
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="inline"
      >
        <a-menu-item key="dashboard">
          <DashboardOutlined />
          <span>概览</span>
        </a-menu-item>
        <a-menu-item key="goods">
          <ShoppingOutlined />
          <span>商品管理</span>
        </a-menu-item>
        <a-menu-item key="orders">
          <FileTextOutlined />
          <span>订单管理</span>
        </a-menu-item>
        <a-menu-item key="members">
          <UserOutlined />
          <span>会员管理</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="bg-white px-6 flex items-center justify-between">
        <span class="text-lg font-medium">后台管理系统</span>
        <a-button type="link" @click="logout">退出登录</a-button>
      </a-layout-header>
      <a-layout-content class="m-4 p-4 bg-white rounded">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DashboardOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  UserOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()

const collapsed = ref(false)
const selectedKeys = ref<string[]>([route.name as string])

watch(() => route.name, (name) => {
  if (name) {
    selectedKeys.value = [name as string]
  }
})

const logout = () => {
  router.push('/login')
}
</script>
