<template>
  <div>
    <ht-modal
      v-model:open="visible"
      :title="modalTitle"
      :mask-closable="false"
      :centered="true"
      width="640px"
      :confirm-loading="confirmLoading"
      @ok="handleSubmit"
      @cancel="visible = false"
    >
      <div class="issuance">
        <a-form>
          <a-row>
            <a-col :span="24">
              <a-form-item
                label="开票金额"
                required
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <span>￥{{ formatMoney(dataSource.invoiceAmount, 2) }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item
                label="开票日期"
                required
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <a-date-picker
                  v-model:value="dataSource.invoiceDate"
                  style="width: 100%"
                  :disabled="registered"
                  placeholder="请选择"
                  :allow-clear="false"
                  value-format="YYYY-MM-DD"
                />
              </a-form-item>
            </a-col>

            <a-col :span="24">
              <a-form-item
                label="备注"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <a-input
                  v-model:value="dataSource.remark"
                  placeholder="请输入备注"
                  :disabled="registered"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item
                label="登记回款信息 "
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <a-switch v-model:checked="switchRemittance" />
              </a-form-item>
            </a-col>
            <a-col v-show="switchRemittance" :span="24">
              <a-form-item
                label="回款金额"
                required
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <a-input
                  v-model:value="dataSource.collection.collectionAmount"
                  placeholder="请输入回款金额"
                  :disabled="readonly"
                />
              </a-form-item>
            </a-col>
            <a-col v-show="switchRemittance" :span="24">
              <a-form-item
                label="回款日期"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <a-date-picker
                  v-model:value="dataSource.collection.collectionDate"
                  style="width: 100%"
                  placeholder="请选择"
                  :allow-clear="false"
                />
              </a-form-item>
            </a-col>
            <a-col v-show="switchRemittance" :span="24">
              <a-form-item
                label="回款说明"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
              >
                <a-input
                  v-model:value="dataSource.collection.remark"
                  placeholder="请输入回款说明"
                  :disabled="readonly"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <template #footer>
        <a-button @click="visible = false">
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
import { message } from 'ant-design-vue'
import { formatTime } from '~/providers/common/utils'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import { invoiceRegister } from '../../api'

export default {
  components: {},
  emits: ['update:value', 'on-success'],
  data() {
    return {
      visible: false,
      invoiceInfo: {},
      switchRemittance: false,
      dataSource: {
        collection: {
          collectionAmount: '',
          remark: '',
          collectionDate: '',
        },
        settlementId: '',
        invoiceAmount: 0,
      },
      confirmLoading: false,
      modalTitle: '结算登记',
      readonly: false,

      registered: false,
    }
  },
  watch: {},
  // props: ["value", "invoiceIds", "type", "rowData"],
  created() {},
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
    onCancel() {
      $emit(this, 'update:value', false)
      // window.$oNextTick(() => {
      //   this.confirmLoading = false;
      //   this.dataSource = {
      //     issuanceType: 1,
      //     fileLists: [],
      //   };
      // });
    },
    restFrom() {
      this.dataSource = {
        collection: {
          collectionAmount: '',
          remark: '',
          collectionDate: '',
        },
        settlementId: '',
        invoiceAmount: 0,
      }
      this.switchRemittance = false
    },
    getData(d) {
      this.restFrom()
      if (d) {
        this.dataSource.settlementId = d.id
        this.dataSource.invoiceAmount = d.settlementAmount
        if (d.registerDate) {
          this.registered = true
          this.dataSource.invoiceDate = d.registerDate
          this.switchRemittance = true
        }
        else {
          this.registered = false
        }
      }
    },

    async handleSubmit() {
      if (
        this.switchRemittance
        && (this.dataSource.collection.collectionAmount == ''
          || this.dataSource.collection.collectionAmount == null)
      ) {
        if (!this.dataSource.fptt) {
          message.warning('请输入回款金额')
          return
        }
      }
      if (!this.dataSource.invoiceDate) {
        message.warning('请输入开票日期')
        return
      }
      if (!this.switchRemittance) {
        this.dataSource.collection.collectionAmount = ''
        this.dataSource.collection.remark = ''
        this.dataSource.collection.collectionDate = ''
      }
      const formData = JSON.parse(JSON.stringify(this.dataSource))
      if (formData.collection.collectionDate) {
        formData.collection.collectionDate = formatTime(
          formData.collection.collectionDate,
          'YYYY-MM-DD',
        )
      }
      if (formData.invoiceDate) {
        formData.invoiceDate = formatTime(formData.invoiceDate, 'YYYY-MM-DD')
      }
      this.confirmLoading = true
      try {
        const res = await invoiceRegister(formData)
        this.confirmLoading = false
        if (res.code !== 20010) {
          message.success('操作成功')
          this.visible = false
          $emit(this, 'on-success')
        }
        else {
          message.error(res.message || res.msg)
        }
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
        this.confirmLoading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.issuance-filelist {
  &:hover {
    .anticon-delete {
      display: inline-block;
    }
  }

  .anticon-delete {
    display: none;
    color: red;
    vertical-align: middle;
    margin-left: 8px;
    cursor: pointer;
    font-size: 14px;
  }
}
</style>
