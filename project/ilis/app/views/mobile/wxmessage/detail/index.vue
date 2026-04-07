<template>
  <div class="page-wrap">
    <a-spin :spinning="spinning">
      <div class="warn-icon">
        <BellFilled />
      </div>
      <p class="wx-message-theme">
        {{ formData.title || '-' }}
      </p>
      <div class="msg-content">
        <a-row v-for="(d, i) in msgDatas" :key="i" style="margin-bottom: 6px">
          <a-col :span="6" class="wx-label">
            {{ d.name }}
          </a-col>
          <a-col :span="18">
            {{ d.data }}
          </a-col>
        </a-row>
        <div v-if="msgDatas.length === 0" class="no-data">
          <img :src="notDataImg" />
          未查到数据
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script>
import { BellFilled } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import mAjax from '~/providers-moblie/common/ajax'
import { getQueryVariable } from '~/providers-moblie/common/utils'
// 访问路由：http://localhost:8080/ilis2/rest/api/msg/detail?unitCode=udrcs&id=4028b2268ff1884b018ff1937660001b

export default {
  components: {
    BellFilled,
  },
  data() {
    return {
      msgId: getQueryVariable('id'),
      unitCode: getQueryVariable('unitCode'),
      spinning: false,
      formData: {},
      msgDatas: [],
      notDataImg: new URL('~/providers-moblie/assets/no-data.png', import.meta.url).href,
    }
  },
  created() {
    this.getDatas()
  },
  methods: {
    async getDatas() {
      // way候选项: sms, wechat, email, system, AIRDROP, DING_TALK
      this.spinning = true
      try {
        const res = await mAjax({
          method: 'GET',
          url: `/rest/api/msg/read/wechat/${this.msgId}`,
          headers: {
            'Unit-Code': this.unitCode,
          },
        })
        if (res.code !== 20000) {
          return message.error(`获取消息详情失败`)
        }
        if (res.data && res.data.msgJson) {
          this.formData = JSON.parse(res.data.msgJson)
          this.msgDatas = this.formData.content || []
        }
      }
      catch (err) {
        message.error(err.message || `获取消息详情失败`)
      }
      this.spinning = false
    },
  },
}
</script>

<style lang="less" scoped>
.page-wrap {
  padding: 16px;
  .warn-icon {
    margin: 15% auto 20px;
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background-color: #f09928;
    color: #fff;
    text-align: center;
    font-size: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .wx-message-theme {
    font-size: 16px;
    text-align: center;
  }
  .msg-content {
    margin-top: 30px;
    padding-top: 30px;
    border-top: 1px solid #f1f1f1;
  }
  .wx-label {
    text-align: right;
    padding-right: 12px;
    color: #aaa;
  }

  .no-data {
    color: #999;
    text-align: center;
    img {
      margin: 10% auto 8px;
      display: block;
      width: 40%;
    }
  }
}
</style>
