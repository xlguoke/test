<script setup lang="ts">
import { Modal } from 'ant-design-vue'
import { DownOutlined } from '@ant-design/icons-vue'
import { storeToRefs } from 'pinia'
import permissions from '@/stores/permissions'
import EditPassword from '@/pages/components/EditPassword.vue'
import { EditModal as EditUserInfo } from '@/pages/admin/users/components'
import type { DataSource } from '@/types/users.d'

const { userInfo, isAdmin } = storeToRefs(permissions())
// 默认头像
const dfUrl = new URL('@/assets/images/df-avatar.svg', import.meta.url).href

// 修改用户信息
const editUserInfoRef = ref()
function editUserInfo() {
  editUserInfoRef.value.openModal('修改用户信息', userInfo.value.id)
}
// 修改用户信息成功回调
function editUserInfoCb(data: DataSource) {
  userInfo.value = data
}

// 修改密码
const editPasswordRef = ref()
function eidtPassword() {
  editPasswordRef.value.openModal()
}

// 退出登录
function logout() {
  Modal.confirm({
    title: '提示',
    content: '确定退出登录吗？',
    centered: true,
    onOk() {
      window.location.href = isAdmin.value ? '/admin/login' : '/login'
      permissions().$reset()
    },
  })
}
</script>

<template>
  <a-layout-header
    class="h-[70px]! leading-[70px]! pl-4! pr-4! bg-gradient-to-r! from-blue-700 to-sky-500 text-white! text-2xl"
  >
    <span>蜀工检测综合数字化管理平台</span>
    <div float-right>
      <a-space class="flex!" :size="16">
        <a-avatar :size="34" class="bg-white/40">
          <template #icon>
            <img :src="userInfo.avatar || dfUrl">
          </template>
        </a-avatar>
        <a-dropdown>
          <a text-white py-4 hover:text-white @click.prevent>
            {{ userInfo.username }}
            <DownOutlined />
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item>
                <a href="javascript:;" @click="editUserInfo">用户信息</a>
              </a-menu-item>
              <a-menu-item @click="eidtPassword">
                <a href="javascript:;">修改密码</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="logout">退出登录</a>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-space>
    </div>
  </a-layout-header>

  <EditUserInfo ref="editUserInfoRef" @save="editUserInfoCb" />
  <EditPassword ref="editPasswordRef" />
</template>
