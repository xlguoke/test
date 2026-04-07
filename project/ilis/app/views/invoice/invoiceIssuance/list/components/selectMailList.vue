<!-- eslint-disable vue/attribute-hyphenation -->
<template>
  <div>
    <ht-modal
      v-model:open="_value"
      title="选择邮寄项目"
      :mask-closable="false"
      :centered="true"
      width="900px"
      @ok="handleSubmit"
      @cancel="onCancel"
    >
      <div style="max-height: 110px; overflow-y: auto">
        <table v-if="mailList.length > 0" class="mailTable">
          <tbody>
            <tr v-for="item in mailList" :key="item.id">
              <td class="mailTable-name">
                {{ item.infoSubject }}
              </td>
              <td class="mailTable-btn">
                <a href="javascript:;" @click="onSelectRecord(item)">使用该邮寄信息作为本次发票发放信息</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <MailList _selectPage="1" table-hight="350" @on-change="getMail" />
      <template #footer>
        <a-button @click="onCancel">
          取消
        </a-button>
        <a-button type="primary" @click="handleSubmit">
          确定
        </a-button>
        <div style="clear: both"></div>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import MailList from '~/views/postmanage/mailListConfig/list/index.vue'
import { getMailByConsign } from '../../api'

export default {
  components: {
    MailList,
  },
  props: ['value', 'invoiceIds', 'type', 'rowData'],
  emits: ['update:value', 'on-change'],
  data() {
    return {
      selectRow: null,
      mailList: [],
    }
  },
  computed: {
    _value() {
      return this.value
    },
  },
  watch: {
    value(val) {
      if (val === true) {
        this.getMailByConsignList()
      }
    },
  },
  methods: {
    // 根据发票获取发票明细中委托所选邮寄信息获取接口
    getMailByConsignList() {
      const list = []
      this.invoiceIds.map(async (invoiceId) => {
        const res = await getMailByConsign(invoiceId)
        // eslint-disable-next-line array-callback-return
        ;(res.data || []).map((item) => {
          !list.find(i => i.id === item.id) && list.push({ ...item })
        })
      })

      this.mailList = list
    },
    // 选择之前委托关联的邮寄地址
    onSelectRecord(row) {
      this.selectRow = [row]
      this.handleSubmit()
    },
    onCancel() {
      $emit(this, 'update:value', false)
    },
    getMail(rows) {
      this.selectRow = rows
    },
    handleSubmit() {
      if (!this.selectRow) {
        window.$oAntdMessage.warning('请选择邮寄信息')
        return
      }
      $emit(this, 'on-change', this.selectRow[0])
      this.onCancel()
    },
  },
}
</script>

<style lang="less" scoped>
.mailTable {
  border-left: solid 1px #e2e2e2;
  border-top: solid 1px #e2e2e2;
  margin-bottom: 10px;
  width: 100%;
  td {
    border-right: solid 1px #e2e2e2;
    border-bottom: solid 1px #e2e2e2;
    padding: 4px 6px;
  }

  .mailTable-name {
    width: 40%;
  }

  .mailTable-btn {
    width: 60%;
  }
}
</style>
