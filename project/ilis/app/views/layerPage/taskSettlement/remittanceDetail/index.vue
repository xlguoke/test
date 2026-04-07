<template>
  <div class="settlementApply" style="padding: 10px">
    <a-table
      :columns="columns"
      :data-source="statementInfo.items"
      :loading="loading"
      bordered
      :pagination="false"
      row-key="id"
      :row-class-name="rowClassName"
      :locale="{
        emptyText: '未查询到数据',
      }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'options'">
          <a
            href="javascript:;"
            title="查看详情"
            class="text-blue-500"
            @click.stop="openDetails(record)"
          >
            查看详情
          </a>
        </template>
      </template>
    </a-table>
    <div></div>
    <div class="tip_box text-sm">
      <span>
        合同金额：￥{{ formatMoney(statementInfo.contractAmount, 2) }}
      </span>
      <span style="margin: 0 30px">
        已回款金额合计：￥{{ formatMoney(statementInfo.collectedAmount, 2) }}
      </span>
      <span>
        未回款金额总计：￥{{ formatMoney(statementInfo.uncollectedAmount, 2) }}
      </span>
    </div>

    <ContarctBillDet ref="ContarctBillDet" />
    <ContarctPross ref="ContarctPross" />
  </div>
</template>

<script>
import ajax from '~/providers/common/ajax'
import ContarctBillDet from '../components/contarctBill.vue'
import ContarctPross from '../components/contarctPross.vue'

export default {
  components: {
    ContarctBillDet,
    ContarctPross,
  },
  data() {
    return {
      statementInfo: {},
      contractId: localStorage.getItem('contractId'),
      loading: false,
      columns: [
        // { title: "结算状态", dataIndex: "status", scopedSlots: { customRender: "status" }, },
        { title: '结算单编号', dataIndex: 'settlementCode' },
        { title: '结算金额(元)', dataIndex: 'settlementAmount' },
        { title: '结算申请日期', dataIndex: 'settlementDate' },
        { title: '结算登记日期', dataIndex: 'settlementRegisterDate' },
        { title: '回款日期', dataIndex: 'collectionDate' },
        { title: '已回款金额', dataIndex: 'collectedAmount' },
        { title: '未回款金额', dataIndex: 'uncollectedAmount' },
        {
          title: '操作',
          dataIndex: 'options',
          scopedSlots: { customRender: 'options' },
        },
      ],
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getData()
  },
  methods: {
    // 金额格式化为千分位
    formatMoney(num, d) {
      let arr = []
      if (num) {
        arr = String(num).split('.')
      }
      else {
        return '0.00'
      }

      // eslint-disable-next-line regexp/no-unused-capturing-group
      const reg = /\d{1,3}(?=(\d{3})+$)/g
      if (arr.length == 2) {
        num = arr[0]
        const money = (`${num}`).replace(reg, '$&,')
        const dd = arr[1]
        return `${money}.${dd.length == 2 ? dd : `${dd}0`}`
      }
      else {
        const money = (`${num}`).replace(reg, '$&,')
        if (d) {
          if (money != '' && money != null && money != undefined) {
            return `${money}.00`
          }
          else {
            return money
          }
        }
        else {
          return money
        }
      }
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    async getData() {
      // 获取列表
      this.loading = true
      try {
        const res = await ajax.get(
          `/rest/fee/settlement/contract/collection/${this.contractId}`,
        )
        this.loading = false
        if (res.code === 20000) {
          this.statementInfo = res.data
        }
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
        this.loading = false
      }
    },

    // 查看发放发票详情
    openDetails(row) {
      if (row.settlementType == 'CONTRACT_BILL') {
        this.$refs.ContarctBillDet.getData(row.settlementId)
      }
      else {
        this.$refs.ContarctPross.getData(row.settlementId)
      }
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
