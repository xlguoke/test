<template>
  <div class="account">
    <ul>
      <li>
        <a-row>
          <a-col span="4">
            <div class="account-left">
              <div v-if="weChatInfo.thirdType" class="account-img">
                <img :src="weChatInfo.headImgUrl" />
              </div>
              <div v-else class="account-wechat">
                <WechatOutlined />
              </div>
            </div>
            <div class="account-right">
              <div v-if="weChatInfo.thirdType" class="setting-title">
                微信
              </div>
              <div v-else class="setting-title">
                绑定微信
              </div>

              <div v-if="weChatInfo.thirdType" class="setting-info">
                <span style="color: #1890ff">已绑定账号：{{ weChatInfo.nickname }}</span>
              </div>
              <div v-else class="setting-info">
                当前尚未绑定微信账号
              </div>
            </div>
          </a-col>
          <a-col span="20" style="padding-top: 10px; text-align: left">
            <a
              v-if="weChatInfo.thirdType"
              href="javascript:;"
              style="color: gray"
              @click="cancelBind(weChatInfo.id, '微信')"
            >解除绑定</a>
            <a v-else href="javascript:;" @click="bindWechat">绑定</a>
          </a-col>
        </a-row>
      </li>
    </ul>

    <ht-modal
      :title="null"
      :open="visible"
      width="330px"
      :footer="null"
      :mask-closable="false"
      class="userBasicInfo-account-modal"
      :centered="true"
      @ok="cancelModal"
      @cancel="cancelModal"
    >
      <template #footer>
        <a-button @click="cancelModal">
          关闭
        </a-button>
      </template>
      <div id="bind_container"></div>
    </ht-modal>
  </div>
</template>

<script>
import { WechatOutlined } from '@ant-design/icons-vue'
import '~/providers/libs/wxLogin'

// 将需要调整的微信扫码样式转换成base64
const wechatCss
  = 'LmltcG93ZXJCb3ggLnRpdGxlIHtkaXNwbGF5OiBub25lO30gLmltcG93ZXJCb3ggLnFyY29kZSB7d2lkdGg6IDE4MHB4O21hcmdpbi10b3A6IDIwcHg7fQ=='

export default {
  components: {
    WechatOutlined,
  },
  data() {
    return {
      visible: false,
      data: [],
      weChatInfo: {},
    }
  },
  created() {
    window.wechatScreenOver = this.wechatScreenOver
    this.getData()
  },
  methods: {
    getData() {
      this.weChatInfo = {}
      window.$oAjax.get(window.$oApi.userBasicInfo.getBindData).then((res) => {
        if (res.code && res.code === 20000) {
          const data = res.data || []
          // eslint-disable-next-line array-callback-return
          data.map((item) => {
            if (item.thirdType === 'wechat') {
              this.weChatInfo = item
            }
          })
        }
      })
    },
    // 解除绑定
    cancelBind(id, title) {
      window.$oAntdConfirm({
        title: '取消绑定',
        content: `确认取消${title}绑定吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oAjax
            .get(window.$oApi.userBasicInfo.cancelBind, {
              params: { id },
            })
            .then((res) => {
              if (res.code && res.code === 20000) {
                window.$oAntdMessage.success(res.message || res.msg || '操作成功')
                this.getData()
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
            })
        },
      })
    },
    // 绑定微信
    bindWechat() {
      this.visible = true
      window.$oAjax({
        method: 'GET',
        url: window.$oApi.userBasicInfo.getBindWechatInfo,
      }).then((res) => {
        if (res.code && res.code === 20000) {
          const data = res.data
          let wxCallback = data.wxCallBackUrl
          const protocol = document.location.protocol
          if (protocol === 'https:') {
            wxCallback = wxCallback.replace('http:', 'https:')
          }
          // // 实例化微信登陆
          // eslint-disable-next-line unused-imports/no-unused-vars
          const obj = new WxLogin({
            self_redirect: true,
            id: 'bind_container',
            appid: data.appId,
            scope: data.scope,
            redirect_uri: wxCallback,
            state: data.state,
            style: '',
            href: `data:text/css;base64,${wechatCss}`,
          })
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info('网络异常，请稍后再试！'))
        }
      })
    },
    cancelModal() {
      document.getElementById('bind_container').innerHTML = ''
      this.visible = false
    },
    wechatScreenOver(code, state) {
      window.$oAjax({
        method: 'GET',
        url: window.$oApi.userBasicInfo.getBindResult,
        params: {
          code,
          state,
        },
      }).then(
        (res) => {
          if (res.code && res.code === 20000) {
            window.$oAntdMessage.success(res.message || res.msg || '绑定成功')
            this.getData()
            this.cancelModal()
          }
          else {
            window.$oAntdModal.warning(
              window.$oMsgTips.info(res.message || res.msg || '绑定失败'),
            )
            document.getElementById('bind_container').innerHTML = ''
            this.bindWechat()
          }
        },
        () => {
          window.$oAntdModal.warning(
            window.$oMsgTips.info(res.message || res.msg || '绑定失败'),
          )
          document.getElementById('bind_container').innerHTML = ''
          this.bindWechat()
        },
      )
    },
  },
}
</script>

<style lang="less" scoped>
.account {
  .account-wechat {
    width: 42px;
    height: 42px;
    background: #09ba07;
    border-radius: 5px;
    text-align: center;
    line-height: 42px;
    font-size: 26px;
    color: #fff;
  }

  .account-img {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    img {
      max-width: 42px;
      max-height: 42px;
    }
  }

  .account-left {
    float: left;
  }

  .setting-info {
    font-size: 12px;
  }

  .account-right {
    overflow: hidden;
    padding-left: 10px;
  }

  ul {
    padding-top: 15px;

    li {
      padding: 15px 0;
      border-bottom: solid 1px #e2e2e2;
    }
  }
}
</style>
