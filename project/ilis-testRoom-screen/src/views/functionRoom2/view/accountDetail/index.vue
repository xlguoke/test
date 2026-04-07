<template>
  <div class="account-detail">
    <van-cell-group v-if="userInfo" inset>
      <van-field v-model="userInfo.userName" label-align="right" center label="账号" readonly />
      <van-field v-model="userInfo.realName" label-align="right" center label="姓名" readonly />
      <van-field
        v-model="userInfo.mobilePhone"
        label-align="right"
        center
        label="手机号码"
        readonly
      />
      <van-field
        v-model="userInfo.officePhone"
        label-align="right"
        center
        label="办公电话"
        readonly
      />
      <van-field v-model="userInfo.email" label-align="right" center label="常用邮箱" readonly />
      <van-field v-model="userInfo.birthDay" label-align="right" center label="生日" readonly />
    </van-cell-group>
  </div>
</template>
<script lang="ts" setup>
import { userStore } from "@/store/user"
import { toRefs } from "vue"

const { userInfo } = toRefs(userStore())
</script>
