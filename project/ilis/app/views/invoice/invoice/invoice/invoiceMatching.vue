<template>
  <div>
    <ht-modal
      v-model:open="_value"
      title="自动匹配发票明细"
      :mask-closable="false"
      :centered="true"
      width="640px"
      :confirm-loading="confirmLoading"
      @ok="handleSubmit"
      @cancel="onCancel"
    >
      <div class="invoiceManagement-matching">
        <div>
          <label><span style="color: red">*</span> 委托单位 : </label>
          <div class="invoiceManagement-text" :title="consignUnit.name">
            {{ consignUnit.name }}
          </div>
          <a-button @click="openConsignUnit">
            选择
          </a-button>
        </div>
        <div v-if="consignUnit.id">
          <label>工程项目 : </label>
          <div class="invoiceManagement-text" :title="projcet.name">
            {{ projcet.name }}
          </div>
          <a-button @click="openConsignProject">
            选择
          </a-button>
        </div>
      </div>
    </ht-modal>

    <SelConsignUnit ref="SelConsignUnit" :callback="getConsignUnit" />
    <SelProjcetByConsignUnit
      ref="SelProjcetByConsignUnit"
      :callback="getConsignProject"
      :consign-unit-id="consignUnit.id"
    />
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import SelConsignUnit from '~/providers/components/selConsignUnit.vue'
import SelProjcetByConsignUnit from '~/providers/components/selProjcetByConsignUnit.vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import { autoMatchingFee } from '../api'

export default {
  components: {
    SelProjcetByConsignUnit,
    SelConsignUnit,
  },
  props: ['value', 'invoicingAmount'],
  emits: ['update:value', 'on-success'],
  data() {
    return {
      consignUnit: {},
      projcet: {},
      confirmLoading: false,
    }
  },
  computed: {
    _value() {
      return this.value
    },
  },
  methods: {
    onCancel() {
      $emit(this, 'update:value', false)
      window.$oNextTick(() => {
        this.consignUnit = {}
        this.projcet = {}
      })
    },
    // 获取选择的工程项目
    getConsignProject(ids, rows) {
      if (rows && rows.length > 0) {
        this.projcet = rows[0]
      }
    },
    // 获取选择的委托单位
    getConsignUnit(ids, rows) {
      if (rows && rows.length > 0) {
        this.consignUnit = rows[0]
        this.projcet = {}
      }
    },
    // 选择委托单位
    openConsignUnit() {
      this.$refs.SelConsignUnit.showModal('radio', 'consignUnitIds', [
        { ...this.consignUnit },
      ])
    },
    // 选择工程项目
    openConsignProject() {
      this.$refs.SelProjcetByConsignUnit.showModal('radio', 'projectIds', [
        { ...this.projcet },
      ])
    },
    async handleSubmit() {
      if (!this.consignUnit.id) {
        message.warn('请选择委托单位')
        return
      }
      this.confirmLoading = true

      const formData = {
        consignUnitId: this.consignUnit.id,
        projectId: this.projcet.id,
        invoicingAmount: this.invoicingAmount,
      }
      try {
        const res = await autoMatchingFee(formData)
        this.confirmLoading = false
        if (res.code === 20000) {
          this.onCancel()
          $emit(this, 'on-success', res.data)
        }
        else {
          message.error(res.message || res.msg)
        }
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (e) {
        this.confirmLoading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.invoiceManagement-matching {
  & > div {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }

  label {
    margin-right: 8px;
    text-align: right;
  }

  .invoiceManagement-text {
    flex: 1;
    margin-right: 8px;
    height: 28px;
    border: solid 1px #ddd;
    border-radius: 4px;
    padding: 0 8px;
    line-height: 26px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
