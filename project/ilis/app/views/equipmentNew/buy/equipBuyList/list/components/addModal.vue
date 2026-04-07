<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-tabs :active-key="activeKey" @change="changeTabs">
          <a-tab-pane v-if="isBaseInfo" key="1" tab="基本信息" force-render>
            <BaseInfo ref="BaseInfo" />
          </a-tab-pane>
          <a-tab-pane v-if="isAcceptance" key="2" tab="验收情况" force-render>
            <Acceptance ref="Acceptance" :data-id="TEqBuyId" />
          </a-tab-pane>
          <a-tab-pane v-if="isBaseInfo" key="3" tab="供应商信息" force-render>
            <SupplierInfo ref="SupplierInfo" />
          </a-tab-pane>
          <a-tab-pane v-if="isRegister" key="4" tab="设备详细信息登记" force-render>
            <Register ref="Register" />
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-spin>
  </div>
</template>

<script>
import qs from 'qs'
import { getQueryVariable } from '~/providers/common/utils'
import Acceptance from '../../acceptance/index.vue'
import BaseInfo from '../../baseInfo/index.vue'
import Register from '../../register/index.vue'
import SupplierInfo from '../../supplierInfo/index.vue'

export default {
  components: {
    BaseInfo,
    Acceptance,
    SupplierInfo,
    Register,
  },
  props: ['callback'],
  data() {
    return {
      id: getQueryVariable('id'),
      activeKey: '1',
      TEqBuyId: '',
      spinning: false,
      status: '',
      isDetail: false,
      isBaseInfo: false,
      isAcceptance: false,
      isRegister: false,
      BaseInfoData: null,
      SupplierInfoData: null,
      RegisterData: null,
      AcceptanceData: {},
      timerBaseInfo: null,
      timerSupplierInfo: null,
      timerRegister: null,
      timerAcceptance: null,
    }
  },
  created() {
    // ilis 跳转的详情页面
    if (getQueryVariable('detail')) {
      const id
        = getQueryVariable('businessKey') || '4028826372409ea8017240e5e926000b'
      this.showModal(id, '', true)
    }
  },
  methods: {
    changeTabs(key) {
      this.activeKey = key
    },
    showModal(recordId, status, isDetail) {
      this.isDetail = isDetail
      this.status = status
      this.spinning = true
      if (isDetail) {
        this.isBaseInfo = true
        this.isAcceptance = true
        this.isRegister = true
      }
      else {
        if (status === '20' || status === '30') {
          this.activeKey = '4'
          // 20 register
          this.isBaseInfo = true
          this.isAcceptance = false
          this.isRegister = true
        }
        else if (status === '50' || status === '60') {
          // 50 acceptance
          this.activeKey = '2'
          this.isBaseInfo = true
          this.isAcceptance = true
          this.isRegister = false
        }
        else {
          this.isBaseInfo = true
          this.isAcceptance = false
          this.isRegister = false
        }
      }
      if (recordId) {
        window.$oAjax({
          method: 'GET',
          url: window.$oApi.equipBuyList.getBuyInfoAll,
          params: { buyId: recordId },
        }).then((res) => {
          if (res.success && res.obj) {
            const dataAll = res.obj
            this.BaseInfoData = dataAll
            this.TEqBuyId = dataAll.id
            this.SupplierInfoData = dataAll.teqSupplierSnapshot
              ? dataAll.teqSupplierSnapshot
              : null
            this.RegisterData = dataAll.teqSnapshot ? dataAll.teqSnapshot : null
            this.AcceptanceData = dataAll.buyAcceptance
              ? dataAll.buyAcceptance
              : null
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            this.BaseInfoData = null
            this.SupplierInfoData = null
            this.RegisterData = null
            this.AcceptanceData = null
          }
          this.spinning = false
          this.showModalAll()
        })
      }
      else {
        this.spinning = false
        this.showModalAll()
      }

      // 同步购置申请（选择购置申请中的设备可以多条） -- 待购置10
      //
      // 新购设备 （基本信息、供应商信息）--购置中20
      //
      // 待购置、购置中 编辑（设备详细信息登记） 点购置完成（提交购置信息申请）--待审批30 -- 购置审批中40 ---验收中50(购置审批通过)
      //
      // 编辑 填写验收情况 点击验收完成（提交购置验收信息审批） -- 待验收60 ---验收审批中70 ---已验收80
    },
    showModalAll() {
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      let BaseInfoDetail = this.isDetail
      if (this.status === '50' || this.status === '60') {
        BaseInfoDetail = true
      }
      if (this.$refs.BaseInfo) {
        this.$refs.BaseInfo.showModal(this.BaseInfoData, BaseInfoDetail)
      }
      else {
        this.timerBaseInfo = setInterval(() => {
          if (self.$refs.BaseInfo) {
            clearInterval(self.timerBaseInfo)
            self.timerBaseInfo = null
            self.$refs.BaseInfo.showModal(self.BaseInfoData, BaseInfoDetail)
          }
        }, 100)
      }
      if (this.$refs.SupplierInfo) {
        this.$refs.SupplierInfo.showModal(this.SupplierInfoData, BaseInfoDetail)
      }
      else {
        this.timerSupplierInfo = setInterval(() => {
          if (self.$refs.SupplierInfo) {
            clearInterval(self.timerSupplierInfo)
            self.timerSupplierInfo = null
            self.$refs.SupplierInfo.showModal(
              self.SupplierInfoData,
              BaseInfoDetail,
            )
          }
        }, 100)
      }
      if (this.isRegister) {
        if (this.$refs.Register) {
          this.$refs.Register.showModal(this.RegisterData, this.isDetail)
        }
        else {
          this.timerRegister = setInterval(() => {
            if (self.$refs.Register) {
              clearInterval(self.timerRegister)
              self.timerRegister = null
              self.$refs.Register.showModal(self.RegisterData, self.isDetail)
            }
          }, 100)
        }
      }
      if (this.isAcceptance) {
        if (this.$refs.Acceptance) {
          this.$refs.Acceptance.showModal(this.AcceptanceData, this.isDetail)
        }
        else {
          this.timerAcceptance = setInterval(() => {
            if (self.$refs.Acceptance) {
              clearInterval(self.timerAcceptance)
              self.timerAcceptance = null
              self.$refs.Acceptance.showModal(
                self.AcceptanceData,
                self.isDetail,
              )
            }
          }, 100)
        }
      }
    },
    handleOk() {
      return new Promise((resolve, reject) => {
        (async () => {
          try {
            this.BaseInfoData = this.$refs.BaseInfo
              ? await this.$refs.BaseInfo.handleOk()
              : this.BaseInfoData
            this.SupplierInfoData = this.$refs.SupplierInfo
              ? await this.$refs.SupplierInfo.handleOk()
              : this.SupplierInfoData
            this.RegisterData = this.$refs.Register
              ? await this.$refs.Register.handleOk()
              : this.RegisterData
            this.AcceptanceData = this.$refs.Acceptance
              ? await this.$refs.Acceptance.handleOk()
              : this.AcceptanceData

            if (!this.BaseInfoData) {
              throw new Error('请先填写基本信息')
            }
            if (!this.SupplierInfoData) {
              throw new Error('请填写供应商信息')
            }

            if (this.isAcceptance) {
              this.AcceptanceData['TEqBuy.id'] = this.TEqBuyId
              delete this.AcceptanceData.createDate
              const res = await window.$oAjax({
                method: 'POST',
                url: window.$oApi.equipBuyList.saveBuyAcceptance,
                data: qs.stringify(this.AcceptanceData),
              })

              if (res.success) {
                this.handleCancel()
                this.callback()
                resolve()
              }
              else {
                throw new Error(res.msg || res.message)
              }
            }
            else {
              delete this.BaseInfoData.createDate
              delete this.BaseInfoData.buyAcceptance
              delete this.SupplierInfoData.createDate

              const saveBuyRes = await window.$oAjax({
                method: 'POST',
                url: window.$oApi.equipBuyList.saveBuy,
                data: qs.stringify(this.BaseInfoData),
              })

              this.TEqBuyId = saveBuyRes.obj
              this.SupplierInfoData['TEqBuy.id'] = saveBuyRes.obj

              const saveSupplierRes = await window.$oAjax({
                method: 'POST',
                url: window.$oApi.equipBuyList.saveSupplierSnapshot,
                data: qs.stringify(this.SupplierInfoData),
              })

              if (!saveSupplierRes.success) {
                throw new Error(saveSupplierRes.msg || saveSupplierRes.message)
              }

              if (this.isRegister) {
                if (!this.RegisterData) {
                  throw new Error('设备详细信息不能为空！')
                }
                this.RegisterData['TEqBuy.id'] = this.TEqBuyId
                delete this.RegisterData.createDate

                const saveEquipmentRes = await window.$oAjax({
                  method: 'POST',
                  url: window.$oApi.equipBuyList.saveEquipmentSnapshot,
                  data: qs.stringify(this.RegisterData),
                })

                if (!saveEquipmentRes.success) {
                  throw new Error(saveEquipmentRes.msg || saveEquipmentRes.message)
                }
              }

              this.handleCancel()
              this.callback()
              resolve()
            }
          }
          catch (error) {
            window.$oAntdModal.warning(window.$oMsgTips.info(error.message))
            reject(error)
          }
        })()
      })
    },
    handleCancel() {
      this.BaseInfoData = null
      this.SupplierInfoData = null
      this.RegisterData = null
      this.AcceptanceData = null
      // eslint-disable-next-line ts/no-unused-expressions
      this.$refs.BaseInfo ? this.$refs.BaseInfo.handleCancel() : null
      // eslint-disable-next-line ts/no-unused-expressions
      this.$refs.SupplierInfo ? this.$refs.SupplierInfo.handleCancel() : null
      // eslint-disable-next-line ts/no-unused-expressions
      this.$refs.Register ? this.$refs.Register.handleCancel() : null
      // eslint-disable-next-line ts/no-unused-expressions
      this.$refs.Acceptance ? this.$refs.Acceptance.handleCancel() : null
      this.isBaseInfo = false
      this.isAcceptance = false
      this.isRegister = false
      this.timerBaseInfo = null
      this.timerSupplierInfo = null
      this.timerRegister = null
      this.timerAcceptance = null
      this.activeKey = '1'
    },
    getData() {},
  },
}
</script>

<style lang="less">
.addModalBox {
  .row-header {
    padding-left: 30px;
    line-height: 30px;
    margin-bottom: 10px;
    border-bottom: 1px dashed;
    color: var(--colorPrimary);
  }
  .ant-form-item {
    margin-bottom: 10px;
  }
  .ant-modal-body {
    height: 450px;
    max-height: 450px;
    overflow-y: auto;
    padding: 0 15px;
  }
  .ant-form-item-label {
    width: 80px;
  }
}
</style>
