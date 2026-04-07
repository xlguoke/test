<template>
  <a-dropdown>
    <template #overlay>
      <a-menu>
        <a-menu-item :icon="h(UserOutlined)" @click="handleClickAccountInfo">
          账号信息
        </a-menu-item>
        <a-menu-item :icon="h(FormOutlined)" @click="changePassword">
          修改密码
        </a-menu-item>
        <a-menu-divider />
        <a-menu-item :icon="h(QuestionCircleOutlined)" @click="handleClickHelp?.()">
          帮助系统
        </a-menu-item>
        <a-menu-divider />
        <a-menu-item :icon="h(LogoutOutlined)" @click="handleClickLogout">
          退出登录
        </a-menu-item>
      </a-menu>
    </template>
    <div class="flex items-center text-white gap-1">
      <a-avatar :src="userDetail?.iconUrl" style="background-color: var(--colorPrimary);" class="shadow-md">
      </a-avatar>
      {{ userName }}
    </div>
  </a-dropdown>
</template>

<script lang="ts" setup>
import type { IUserInfo } from '../types/IUserInfo'
import { FormOutlined, LogoutOutlined, QuestionCircleOutlined, UserOutlined } from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import EditPassword from '~/components/changePassword/EditPassword.vue'
import { useMenuStore } from '~/store/menuStore'
import { getCurrentUserApi } from '../api'

const handleClickHelp = inject('handleClickHelp') as () => void

const userInfo = localStorage.getItem('userInfo')
const userName = userInfo ? JSON.parse(userInfo)?.realName : ''
const menuStore = useMenuStore()

const userDetail = ref<IUserInfo>()

function handleClickAccountInfo() {
  openIlisTab(
    '账号信息',
    'userController.do?goUserBasicInfoPage',
  )
}

async function getCurrentUser() {
  const { data } = await getCurrentUserApi()
  if (data?.obj) {
    userDetail.value = data.obj
  }
}
getCurrentUser()

function handleClickLogout() {
  Modal.confirm({
    title: '确认退出登录吗？',
    onOk: async () => {
      await menuStore.resetStore()
      window.location.href = 'loginController.do?logout'
    },
  })
}

async function changePassword() {
  await AnyDialogHelper.showModel(EditPassword, {
    title: '修改密码',
  })
}
</script>
