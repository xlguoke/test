<script lang="ts" setup name="My">
import { Button, Modal } from 'ant-design-vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAssetsFile } from '@/utils/index'
import { useUserStore } from '@/stores/users'

const router = useRouter()
const userStore = useUserStore()

const toolList = ref([
  {
    title: '离线数据更新',
    icon: 'img-refresh',
    name: 'UpdateManage',
  },
  {
    title: '设置',
    icon: 'img-setting',
    name: 'SysSetting',
  },
  {
    title: '账号安全设置',
    icon: 'img-anquan',
    name: 'AccountSafe',
  },
])

function logout() {
  Modal.confirm({
    title: '提示',
    content: '确定要退出登录吗？',
    okText: '确定',
    cancelText: '取消',
    centered: true,
    onOk: async (close: Function) => {
      userStore.logout()
      close()
      await router.replace('/login')
    },
  })
}
</script>

<template>
  <div class="my-wrap">
    <div class="top-bg" />
    <div class="user-info">
      <div class="user-logo">
        <img :src="userStore.avatar || getAssetsFile('user.png')" alt="">
      </div>
      <h3 class="name1">
        {{ userStore.name }}
      </h3>
      <p class="name2">
        {{ userStore.username }}
      </p>
    </div>

    <ul class="tool-list pd">
      <li
        v-for="item in toolList"
        :key="item.name"
        :class="`item ${item.icon}`"
        @click="$router.push({ name: item.name })"
      >
        <span class="title">{{ item.title }}</span>
        <img
          class="img-right"
          src="@/assets/images/img-right.png"
        >
      </li>
    </ul>

    <div class="btns">
      <!-- <Button
        type="primary"
        block
        @click="$router.push({ path: '/my/accountManage' })"
      >
        切换账号
      </Button> -->
      <Button block @click="logout">
        退出登录
      </Button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.top-bg {
  margin: -50px -20px 0;
  height: 33.7rem;
  background: linear-gradient(0deg, #63ceff 0%, #0066ec 100%);
  border-radius: 50% / 50px;
}
.user-info {
  margin: -15rem 2.5rem 0;
  height: 19rem;
  text-align: center;
  background-color: #fff;
  border-radius: 2rem;
  border: 1px solid #fff;
  .user-logo {
    width: 12.4rem;
    height: 12.4rem;
    margin: -6.2rem auto 0;
    overflow: hidden;
    border: 1px solid #fff;
    border-radius: 50%;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .name1 {
    margin: 3rem 0 1.5rem;
    font-size: 18px;
    font-weight: 600;
  }
  .name2 {
    font-size: 14px;
  }
}

@media screen and (max-width: 480px) {
  .user-info .name1 {
    margin: 2.5rem 0 1.5rem;
    font-size: 16px;
  }
}
@media screen and (max-width: 414px) {
  .user-info .name1 {
    margin: 2rem 0 1rem;
    font-size: 16px;
  }
}

.tool-list {
  .item {
    margin-top: 2.4rem;
    padding: 0 2.4rem 0 9rem;
    display: flex;
    align-items: center;
    height: 7.5rem;
    border-radius: 1.6rem;
    background: no-repeat 2rem center/6rem 6rem #fff;
    transition: 0.2s;
  }
  .img-refresh {
    background-image: url('@/assets/images/img-refresh.png');
  }
  .img-setting {
    background-image: url('@/assets/images/img-setting.png');
  }
  .img-anquan {
    background-image: url('@/assets/images/img-anquan.png');
  }
  .title {
    flex: 1;
    font-size: 18px;
  }
  .img-right {
    width: 3.6rem;
    height: 3.6rem;
  }
}

@media screen and (max-width: 576px) {
  .tool-list .title {
    font-size: 16px;
  }

  .tool-list .item {
    padding-left: 10rem;
    height: 8.5rem;
    background-size: 7rem 7rem;
    .img-right {
      width: 4rem;
      height: 4rem;
    }
  }
}

@media screen and (max-width: 480px) {
  .tool-list .title {
    font-size: 14px;
  }
}

.btns {
  margin: 0 10%;
  .ant-btn {
    margin-top: 3rem;
  }
}
.main-horizontal {
  .btns{
    text-align: center;
    .ant-btn{
      width: 50%;
    }
  }
  // .btns {
  //   display: flex;
  //   margin: 0 2.5rem 5rem;
  //   .ant-btn {
  //     flex: 1;
  //     &:last-child {
  //       margin-left: 2rem;
  //     }
  //   }
  // }
}
</style>
