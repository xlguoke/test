<template>
  <van-action-sheet v-model:show="visible" title="账号授权提示">
    <div class="auth-confirm">
      <div class="auth-confirm-title">
        功能室屏申请获取您的账号信息
      </div>
      <div class="auth-confirm-user">
        <div class="auth-confirm-img">
          <img :src="data.iconUrl" />
        </div>
        <div class="auth-confirm-name">
          {{ data.realName }}
        </div>
        <van-icon class="auth-confirm-icon" name="success" />
      </div>
      <div class="auth-confirm-button">
        <van-button @click="onCancel">
          拒绝
        </van-button>
        <van-button type="primary" @click="onConfirm">
          授权登录
        </van-button>
      </div>
    </div>
  </van-action-sheet>
</template>

<script>
import { mapState } from 'pinia'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore'

export default {
  name: 'AuthConfirm',
  props: [],
  data() {
    return {
      visible: false,
      onOk: null,
    }
  },
  computed: {
    ...mapState(useAppUserStore, {
      data: 'userInfo',
    }),
  },
  methods: {
    open(onOk) {
      this.onOk = onOk
      this.visible = true
    },
    onConfirm() {
      if (this.onOk) {
        this.onOk()
      }
      this.onCancel()
    },
    onCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
.auth-confirm {
  padding: 16px;

  .auth-confirm-title {
    font-size: 14px;
  }

  .auth-confirm-user {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
    font-size: 14px;
    border: solid 1px #e2e2e2;
    padding: 8px 16px;
    border-radius: 8px;
  }

  .auth-confirm-name {
    flex: 1;
  }

  .auth-confirm-icon {
    font-size: 36px;
    color: #009688;
  }

  .auth-confirm-img {
    width: 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    overflow: hidden;

    img {
      max-width: 100%;
      max-height: 100%;
    }
  }

  .auth-confirm-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 16px;

    button {
      width: 120px;
      border-radius: 4px;
    }
  }
}
</style>
