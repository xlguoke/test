<template>
  <div class="settingNotice">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
      <div class="settingNotice-header">
        <div class="settingNotice-row">
          <div class="settingNotice-col1">
            消息标题
          </div>
          <div class="settingNotice-col2">
            微信通知
          </div>
          <div class="settingNotice-col2">
            短信通知
          </div>
        </div>
      </div>
    </van-sticky>

    <div class="settingNotice-body">
      <div v-for="item in list" :key="item.id" class="settingNotice-row">
        <div class="settingNotice-col1 textOverflow2">
          {{ item.messageTitle }}
        </div>
        <div class="settingNotice-col2">
          <van-switch
            v-model="setting[`${item.id}wechat`]"
            size="22px"
            @change="
              changeState(item.id, 'wechat', setting[`${item.id}wechat`])
            "
          />
        </div>
        <div class="settingNotice-col2">
          <van-switch
            v-model="setting[`${item.id}sms`]"
            size="22px"
            @change="changeState(item.id, 'sms', setting[`${item.id}sms`])"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import qs from 'qs'
import { showDialog } from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      list: [],
      setting: {},
      checked: false,
      query: {
        page: 0,
        size: 10,
      },
    }
  },
  created() {
    this.getSetting()
    this.getList()
  },
  methods: {
    async changeState(messageTypeId, way, state) {
      const params = {
        messageTypeId,
        way,
      }
      let res

      if (!state) {
        res = await mRequest.get(api.setting.msgOff, {
          params,
        })
      }
      else {
        res = await mRequest.post(
          api.setting.msgOn,
          qs.stringify(params),
        )
      }

      if (res.code === 20000) {
        this.getSetting()
        this.getList()
      }
      else {
        showDialog({ message: res.message || res.msg || '操作失败' })
      }
    },
    async getList() {
      const res = await mRequest.get(api.setting.setNoticeList, {
        params: {
          page: -1,
          size: -1,
        },
      })
      if (res.code === 20000) {
        this.list = res.data.rows
      }
    },
    async getSetting() {
      const res = await mRequest.get(api.setting.currentUserMsgSwitchList)
      if (res.code === 20000) {
        const setting = {}

        if (res.data.rows && res.data.rows.length > 0 && res.data.rows[0]) {
          res.data.rows.forEach((item) => {
            setting[`${item.messageTypeId}${item.way}`] = true
          })
          this.setting = setting
        }
        else {
          this.setting = {}
        }
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index');
</style>
