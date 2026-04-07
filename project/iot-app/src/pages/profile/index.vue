<template>
  <div class="p16">
    <div class="mt-16 text-18 font-bold ">
      海特智慧试验室温湿度控制系统
    </div>
    <p>
      今天又是美好的一天！
    </p>

    <div
      class="mx-auto
    mt-32 w108 h108
    flex items-center justify-center
    rounded-full
    bg-[#fff]/20
    "
    >
      <van-uploader :max-count="1" :after-read="afterRead">
        <img
          :key="avatorKey"
          :src="userInfo.iconUrl || defaultAvatar"
          class="h-[96px] w-[96px] overflow-hidden rounded-full bg-primary"
        />
      </van-uploader>
    </div>
    <p class="pt-8 text-center">
      {{ userInfo.realName }}
    </p>
    <p class="text-center">
      <!-- {{ userInfo.departName }} -->
    </p>

    <van-cell title="修改密码" is-link class="mt-32" to="/profile/password">
      <template #icon>
        <img src="../../assets/profile-password.svg" class="mr-8 w-[22px]" />
      </template>
    </van-cell>
    <van-cell title="关于" is-link to="/profile/about-us">
      <template #icon>
        <img src="../../assets/profile-about.svg" class="mr-8 w-[22px]" />
      </template>
    </van-cell>

    <van-button block class="mt-48 border-0 bg-[#5B7489] text-white" @click="onLoginout">
      退出
    </van-button>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores'
import defaultAvatar from '../../assets/images/default-avatar1.svg'
import { clearToken } from '@/utils/auth'
import { logout, updateUserInfo } from '@/api/user'
import { uploadFile } from '@/api/common'
import dayjs from 'dayjs'

const { userInfo } = toRefs(useUserStore())

const { initUserInfo } = useUserStore()

const avatorKey = ref(0)

async function onLoginout() {
  showConfirmDialog({
    title: '提示',
    message: '确认退出登录吗？',
  }).then(async () => {
    showLoadingToast({
      forbidClick: true,
      duration: 0,
    })
    clearToken()
    await logout()
    window.location.reload()
  }).catch(() => { })
}

async function afterRead(file) {
  showLoadingToast('头像上传中...')
  const { success, obj } = await uploadFile(file.file).catch((err) => {
    showFailToast('头像上传失败')
    return err
  })
  if (success) {
    showLoadingToast('更新用户信息...')
    const { success: success2 } = await updateUserInfo({
      id: userInfo.value.id,
      userName: userInfo.value.userName,
      realName: userInfo.value.realName,
      mobilePhone: userInfo.value.mobilePhone,
      officePhone: userInfo.value.officePhone,
      email: userInfo.value.email,
      birthDay: dayjs(userInfo.value.birthDay).format('YYYY-MM-DD'),
      iconUrl: obj?.[0]?.realpath,
    }).catch((err) => {
      showFailToast('更新用户信息失败')
      return err
    })
    if (success2) {
      showSuccessToast('头像上传成功')
      initUserInfo()
    }
  }
  closeToast()
}
</script>

<style lang="less" scoped>
.van-cell {
  margin-bottom: 8px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 100%);
  border: 1px solid #ffffff;
  border-radius: 8px;

  &::after {
    display: none;
  }
}
</style>

<route lang="json">
{
  "name": "profile",
  "meta": {
    "title": "我的",
    "hiddenNavBar": true
  }
}
</route>
