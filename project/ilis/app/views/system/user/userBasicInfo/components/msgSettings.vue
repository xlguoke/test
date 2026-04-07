<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div class="msg-title">
          注：接收微信通知需先关注公众号并在公众号中绑定手机号码；接收短信通知需在基本设置中录入手机号码，且检测机构需开通短信通知功能。
        </div>
        <a-table
          :columns="columns"
          :data-source="data"
          bordered
          :row-class-name="rowClassName"
          row-key="id"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'wechat'">
              <a-switch
                checked-children="开"
                un-checked-children="关"
                :checked="text === 'wechat' ? true : false"
                @change="amend(record, 'wechat')"
              />
            </template>

            <template v-if="column.dataIndex === 'sms'">
              <a-switch
                checked-children="开"
                un-checked-children="关"
                :checked="text === 'sms' ? true : false"
                @change="amend(record, 'sms')"
              />
            </template>

            <template v-if="column.dataIndex === 'DING_TALK'">
              <a-switch
                checked-children="开"
                un-checked-children="关"
                :checked="text === 'DING_TALK' ? true : false"
                @change="amend(record, 'DING_TALK')"
              />
            </template>

            <template v-if="column.dataIndex === 'Action'">
              <a-button @click="onSetting(record)">
                设置
              </a-button>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>

    <Edit ref="EditRef" :edit-data="editData" @load="getData" />
  </div>
</template>

<script>
import Edit from './Edit.vue'

const columns = [
  {
    title: '消息标题',
    dataIndex: 'messageTitle',
    width: '30%',
  },
  {
    title: '消息内容',
    dataIndex: 'content',
    width: '19%',
  },
  {
    title: '接收微信通知',
    dataIndex: 'wechat',
    width: '15%',
    scopedSlots: { customRender: 'wechat' },
  },
  {
    title: '接收钉钉通知',
    dataIndex: 'DING_TALK',
    width: '15%',
    scopedSlots: { customRender: 'DING_TALK' },
  },
  //
  // {
  //   title: '接收短信通知',
  //   dataIndex: 'sms',
  //   width: '15%',
  //   scopedSlots: { customRender: 'sms' },
  // },
  {
    title: '操作',
    dataIndex: 'Action',
    width: '6%',
    scopedSlots: { customRender: 'Action' },
  },
]
export default {
  components: {
    Edit,
  },
  props: [],
  data() {
    return {
      data: [],
      msgList: [],
      userMsg: [],
      columns,
      spinning: false,
      editData: {},
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.page = 1
          this.size = size
          this.getData()
        },
      },
    }
  },
  watch: {},
  created() {
    this.getData()
  },
  methods: {
    onSetting(record) {
      this.editData = record
      this.$refs.EditRef.showModal(record)
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.userBasicInfo.msgList, {
          params: {
            page: -1,
            size: -1,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (
            res.code === 20000
            && res.data
            && res.data.rows
            && res.data.rows.length > 0
          ) {
            // this.data =
            this.msgList = res.data.rows.map(item => ({
              ...item,
              messageTypeId: '',
              wechat: '',
              DING_TALK: '',
              sms: '',
            }))
            return window.$oAjax.get(window.$oApi.userBasicInfo.userMsg)
          }
          else {
            this.data = []
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
          }
        })
        .then((res) => {
          if (
            res.code === 20000
            && res.data
            && res.data.rows
            && res.data.rows.length > 0
          ) {
            this.userMsg = res.data.rows
            this.data = this.msgList.map((item) => {
              const arr = this.userMsg.filter(
                item2 => item.id === item2.messageTypeId,
              )
              const wayObj = { wechat: '', sms: '', DING_TALK: '' }
              // eslint-disable-next-line array-callback-return
              arr.map((wayItem) => {
                if (wayItem.way === 'wechat') {
                  wayObj.wechat = wayItem.way
                }
                if (wayItem.way === 'sms') {
                  wayObj.sms = wayItem.way
                }
                if (wayItem.way === 'DING_TALK') {
                  wayObj.DING_TALK = wayItem.way
                }
              })
              return {
                ...item,
                messageTypeId: (arr.length > 0 && arr[0].messageTypeId) || '',
                wechat: wayObj.wechat || '',
                sms: wayObj.sms || '',
                DING_TALK: wayObj.DING_TALK || '',
              }
            })
          }
          else {
            this.data = this.msgList
          }
          this.spinning = false
        })
        .catch((err) => {
          this.spinning = false
          window.$oAntdModal.warning(window.$oMsgTips.info(err))
          // this.changeSpinning && this.changeSpinning(false);
        })
    },
    amend(record, type) {
      let url, method
      if (record[type]) {
        url = window.$oApi.userBasicInfo.msgSwitchOFF
        method = 'GET'
      }
      else {
        url = window.$oApi.userBasicInfo.msgSwitchON
        method = 'POST'
      }
      window.$oAjax({
        method,
        url,
        params: { messageTypeId: record.id, way: type },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          window.$oAntdMessage.success('操作成功')
          this.getData()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
  },
}
</script>

<style scoped>
.msg-title {
  margin: 10px 0;
  font-size: 12px;
}
</style>
