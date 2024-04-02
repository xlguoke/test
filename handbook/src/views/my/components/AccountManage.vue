<script setup lang="ts" name="AccountManage">
// import { getAssetsFile } from '@/utils/index'
// import type { UserInfoDTO } from '@/type/login'

// import uploadManage from '@/stores/uploadManage'

// const defaultUrl = getAssetsFile('user.png')
//
// async function switchAccount(_item: UserInfoDTO) {
//   // if (item.loginKey === userInfo().userInfo.loginKey)
//   //   return
//   // try {
//   //   message.success('切换账户成功')
//   //   uploadManage().clearUploadInfo()
//   //   location.href = '/'
//   // }
//   // catch (err: any) {
//   //   message.error(err.message || '切换账户异常')
//   // }
// }
</script>

<template>
  <div class="show-title-bar account-manage">
    <TitleBar />
    <div class="pd">
      <ul class="account-data-list">
        <!-- <li -->
        <!--  v-for="item in userInfo().userList" -->
        <!--  :key="item.id" -->
        <!--  class="my-list account-data-item" -->
        <!--  @click="switchAccount(item)" -->
        <!-- &gt; -->
        <!--  <div class="account-logo"> -->
        <!--    <img :src="`${item.iconUrl || defaultUrl}`"> -->
        <!--  </div> -->
        <!--  <span class="account-dataname">{{ item.userName }}</span> -->
        <!--  <i -->
        <!--    v-if="item.loginKey === userInfo().userInfo.loginKey" -->
        <!--    class="is-checked iconfont icon-ok" -->
        <!--  /> -->
        <!-- </li> -->
      </ul>
    </div>
  </div>
</template>

<style lang="less" scoped>
.account-data-item {
  display: flex;
  align-items: center;
  &:active {
    background-color: #fcfcfc;
  }
  .account-logo {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .account-dataname {
    margin-left: 1.5rem;
    flex: 1;
  }
  .is-checked {
    color: var(--primary-color);
    font-size: 2rem;
  }
}

@media screen and (max-width: 480px) {
  .account-data-item {
    font-size: 12px;
  }
}
</style>
