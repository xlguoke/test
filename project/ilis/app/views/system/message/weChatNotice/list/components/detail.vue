<template>
  <div>
    <ht-modal
      title="详情"
      :open="visible"
      class="wechatNotice-detail-modal"
      @cancel="handleCancel"
    >
      <template #footer>
        <a-button @click="handleCancel">
          关闭
        </a-button>
      </template>
      <a-spin :spinning="loading">
        <div>
          <div
            style="
              font-size: 14px;
              font-weight: bold;
              border-bottom: solid 1px #e2e2e2;
              padding-bottom: 10px;
              margin-bottom: 10px;
            "
          >
            {{ title }}
          </div>
          <div>
            <table class="wechatNotice-table">
              <tr v-for="(item, index) in content" :key="index">
                <td class="wechatNotice-table-name">
                  {{ item.name }}
                </td>
                <td class="wechatNotice-table-value">
                  <a
                    v-if="item.name.includes('下载地址')"
                    :href="item.data"
                  >{{ item.data }}</a>
                  <span v-else> {{ item.data }} </span>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      title: '',
      content: [],
      id: '',
      loading: false,
    }
  },
  methods: {
    showModal(id) {
      this.id = id
      this.getData()
      this.visible = true
    },
    getData() {
      this.loading = true
      window.$oAjax
        .get(window.$oApi.weChatNotice.detail, {
          params: {
            msgId: this.id,
          },
        })
        .then((res) => {
          if (res.code && res.code === 20000) {
            const msgJson = JSON.parse(res.data.msgJson || '{}')
            this.title = msgJson.title || ''
            this.content = msgJson.content || []

            this.customContent(msgJson)
          }
          this.loading = false
        })
    },
    // 定制处理展示内容
    customContent(msgJson) {
      const { content, messageType, customAttribute } = msgJson

      if (messageType === 'BIDDING_PERSON_UPDATE') {
        const showVariable = this.getVariableByContent(customAttribute.modelMsgContent)
        if (!showVariable.includes('personName')) {
          showVariable.unshift('personName')
        }
        this.content = content.filter(i => showVariable.includes(i.key) && i.data)
      }
    },
    getVariableByContent(str) {
      const regex = /\[(.*?)\]/g
      const matches = []
      let match
      // eslint-disable-next-line no-cond-assign
      while ((match = regex.exec(str)) !== null) {
        matches.push(match[1])
      }
      return matches
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style>
.ant-modal .ant-modal-footer button:first-child {
  float: none !important;
}
.wechatNotice-table tr td {
  word-wrap: break-word;
  word-break: break-all;
}
</style>
