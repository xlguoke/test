<template>
  <van-popup
    v-model:value="showSendCode"
    show-cancel-button
    close-on-popstate
    :close-on-click-overlay="false"
  >
    <div class="send-code-box">
      <div class="content">
        <h3 class="title">
          输入验证码
        </h3>
        <p class="hint">
          短信验证码已发送至您手机，请注意查收
        </p>
        <van-field v-model="authCode" placeholder="请输入验证码" />
        <span
          v-if="!isFirst && downTime === TIME"
          class="ready-getcode"
          @click="readySendCode"
        >重新获取</span>
        <p v-else class="hint">
          {{ downTime }}s 后重发
        </p>
      </div>
      <div class="footer">
        <div class="f-btn" @click="showSendCode = false">
          取消
        </div>
        <div class="f-btn f-btn-primary" @click="popupOk">
          确定
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script>
import { showNotify } from 'vant'
import SignerObj from '~/views/mobileApp/libs/electronicSignature'
import { $emit } from '../../../utils/gogocodeTransfer'

export default {
  props: {
    value: Boolean,
  },
  emits: ['update:value'],
  data() {
    return {
      TIME: 60,
      authCode: '',
      showSendCode: this.value,
      downTime: this.TIME,
      isFirst: true,
      timer: null,
    }
  },
  watch: {
    value(val) {
      this.showSendCode = val
      if (val) {
        this.executeDownTime()
      }
      else {
        this.timer && clearInterval(this.timer)
      }
    },
    showSendCode(val) {
      $emit(this, 'update:value', val)
    },
  },
  methods: {
    // 执行倒计时
    executeDownTime() {
      this.downTime = this.TIME
      this.isFirst = false
      // showDialog({
      //     title: '提示',
      //     message: '短信验证码已发送至您手机，请注意查收'
      // })

      this.timer && clearInterval(this.timer)
      this.downTime--
      this.timer = setInterval(() => {
        this.downTime--
        if (this.downTime < 0) {
          this.downTime = this.TIME
          clearInterval(this.timer)
        }
      }, 1000)
    },
    async readySendCode() {
      await SignerObj.sendCode()
      this.executeDownTime()
    },
    popupOk() {
      if (!this.authCode) {
        showNotify({ type: 'warning', message: '请输入短信验证码' })
        return
      }
      SignerObj.authCode = this.authCode
      this.showSendCode = false
      SignerObj.submitSignature()
    },
  },
}
</script>

<style lang="less" scoped>
.van-popup:not(.van-action-sheet) {
  width: 80%;
  border-radius: 10px;
  .send-code-box {
    .content {
      padding: 20px;

      .hint {
        margin: 5px 0;
        font-size: 2.75vw;
        color: #999;
      }

      .van-field {
        border: 1px solid #ebedf0;
        border-radius: 4px;
      }

      .van-cell::after {
        left: 999;
      }
    }

    .ready-getcode {
      display: inline-block;
      margin-top: 5px;
      color: #1989fa;
      font-size: 2.75vw;
    }

    .footer {
      display: flex;
      line-height: 12vw;
      border-top: 1px solid #f8f8f8;
      text-align: center;

      .f-btn {
        flex: 1;
        height: 100%;
        font-size: 4.267vw;

        &:active {
          background-color: #f5f5f5;
        }
      }

      .f-btn-primary {
        border-left: 1px solid #f8f8f8;
        color: #1989fa;
      }
    }
  }
}
</style>
