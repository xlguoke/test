<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-tabs :active-key="activeKey" @change="changeTabs">
          <a-tab-pane v-if="isApplyPage" key="1" tab="维修申请" force-render>
            <ApplyPage ref="ApplyPage" />
          </a-tab-pane>
          <a-tab-pane v-if="isContactPage" key="2" tab="外联情况" force-render>
            <ContactPage ref="ContactPage" />
          </a-tab-pane>
          <a-tab-pane v-if="isRepairPage" key="3" tab="维修情况" force-render>
            <RepairPage ref="RepairPage" />
          </a-tab-pane>
          <a-tab-pane v-if="isTestPage" key="4" tab="修复检验情况" force-render>
            <TestPage ref="TestPage" />
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-spin>
  </div>
</template>

<script>
import qs from 'qs'
import { getQueryVariable } from '~/providers/common/utils'
import ApplyPage from '../../applyPage/index.vue'
// 维修申请 applyPage
// 外联情况 ContactPage
import ContactPage from '../../contactPage/index.vue'
// 维修情况 repairPage
import RepairPage from '../../repairPage/index.vue'
// 修复检验情况 testPage
import TestPage from '../../testPage/index.vue'

export default {
  components: {
    ApplyPage,
    ContactPage,
    RepairPage,
    TestPage,
  },
  props: ['callback'],
  emits: ['saveok'],
  data() {
    return {
      id: getQueryVariable('id'),
      spinning: false,
      activeKey: '1',
      TEqRepairId: '',
      equipmentId: '',
      status: '',
      isApplyPage: false,
      isContactPage: false,
      isRepairPage: false,
      isTestPage: false,
      ApplyPageData: null,
      ContactPageData: null,
      RepairPageData: null,
      TestPageData: null,
    }
  },
  created() {
    // ilis 跳转的详情页面
    if (getQueryVariable('detail')) {
      const id
        = getQueryVariable('businessKey') || '4028826372358837017236030137001f'
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
        this.isApplyPage = true
        this.isContactPage = true
        this.isRepairPage = true
        this.isTestPage = true
      }
      else {
        if (status === '40') {
          this.activeKey = '2'
          this.isApplyPage = true
          this.isContactPage = true
          this.isRepairPage = true
          this.isTestPage = false
        }
        else if (status === '50') {
          this.activeKey = '4'
          this.isApplyPage = true
          this.isContactPage = true
          this.isRepairPage = true
          this.isTestPage = true
        }
        else {
          this.isApplyPage = true
          this.isContactPage = false
          this.isRepairPage = false
          this.isTestPage = false
        }
      }
      if (recordId) {
        window.$oAjax({
          method: 'GET',
          url: window.$oApi.equipRepair.getById,
          params: { repairId: recordId },
        }).then((res) => {
          if (res.success && res.obj) {
            const dataAll = res.obj
            this.ApplyPageData = dataAll
            this.ApplyPageData.equipmentSn = dataAll.equipmentVo.equipmentSn
            this.ApplyPageData.standard = dataAll.equipmentVo.standard
            this.TEqRepairId = dataAll.id
            this.equipmentId = dataAll.equipmentId
            this.RepairPageData = dataAll.repairDetailVo
              ? dataAll.repairDetailVo
              : null
            this.TestPageData = dataAll.repairVerifyVo
              ? dataAll.repairVerifyVo
              : null
            this.ContactPageData = dataAll.repairContactVo
              ? dataAll.repairContactVo
              : null
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            this.ApplyPageData = null
            this.RepairPageData = null
            this.TestPageData = null
            this.ContactPageData = null
          }
          this.spinning = false
          this.showModalAll()
        })
      }
      else {
        this.spinning = false
        this.showModalAll()
      }
    },
    showModalAll() {
      // eslint-disable-next-line ts/no-this-alias, unused-imports/no-unused-vars
      const self = this
      let ApplyPageDetail = this.isDetail
      // 维修中40 ，维修完成50
      if (this.status === '40' || this.status === '50') {
        ApplyPageDetail = true
      }
      if (this.isContactPage) {
        window.$oNextTick(() => {
          this.$refs.ContactPage.showModal(this.ContactPageData, this.isDetail)
        })
        window.$oNextTick(() => {
          this.$refs.RepairPage.showModal(this.RepairPageData, this.isDetail)
        })
      }
      if (this.isTestPage) {
        window.$oNextTick(() => {
          this.$refs.TestPage.showModal(this.TestPageData, this.isDetail)
        })
      }
      window.$oNextTick(() => {
        this.$refs.ApplyPage.showModal(this.ApplyPageData, ApplyPageDetail)
      })
    },
    async handleOk() {
      this.ApplyPageData = this.$refs.ApplyPage
        ? await this.$refs.ApplyPage.handleOk()
        : this.ApplyPageData
      this.RepairPageData = this.$refs.RepairPage
        ? await this.$refs.RepairPage.handleOk()
        : this.RepairPageData
      this.TestPageData = this.$refs.TestPage
        ? await this.$refs.TestPage.handleOk()
        : this.TestPageData
      this.ContactPageData = this.$refs.ContactPage
        ? await this.$refs.ContactPage.handleOk()
        : this.ContactPageData

      if (!this.ApplyPageData) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先填写维修申请'))
        return
      }

      ['createDate', 'createName', 'sysCompanyCode', 'updateName', 'updateBy', 'updateDate'].forEach((key) => {
        delete this.ApplyPageData?.[key]
        delete this.RepairPageData?.[key]
        delete this.TestPageData?.[key]
        delete this.ContactPageData?.[key]
      })

      if (this.status === '40' || this.status === '50') {
        // 维修中40，維修完成50
        if (!this.ContactPageData) {
          window.$oAntdModal.warning(window.$oMsgTips.info('设备维修的外联情况不能为空!'))
          return
        }
        if (!this.RepairPageData) {
          window.$oAntdModal.warning(window.$oMsgTips.info('维修情况不能为空!'))
          return
        }
        if (this.status === '50') {
          if (!this.TestPageData) {
            window.$oAntdModal.warning(window.$oMsgTips.info('设备维修检验信息不能为空!'))
            return
          }
        }
        this.ContactPageData['TEqRepair.id'] = this.TEqRepairId
        this.ContactPageData.equipmentId = this.equipmentId
        this.spinning = true
        this.$emit('saveok', false)
        window.$oAjax({
          method: 'POST',
          url: window.$oApi.equipRepair.saveRepairContact,
          data: qs.stringify(this.ContactPageData),
        })
          .then(() => {
            this.RepairPageData['TEqRepair.id'] = this.TEqRepairId
            this.RepairPageData.equipmentId = this.equipmentId

            return window.$oAjax({
              method: 'POST',
              url: window.$oApi.equipRepair.saveRepairDetail,
              data: qs.stringify(this.RepairPageData),
            })
          })
          .then((res) => {
            if (this.status === '50') {
              this.TestPageData['TEqRepair.id'] = this.TEqRepairId
              this.TestPageData.equipmentId = this.equipmentId

              return window.$oAjax({
                method: 'POST',
                url: window.$oApi.equipRepair.saveRepairVerify,
                data: qs.stringify(this.TestPageData),
              })
            }
            else {
              return res
            }
          })
          .then((res) => {
            if (res.success) {
              this.$emit('saveok', true)
              this.handleCancel()
              this.callback()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
            this.spinning = false
          })
          .finally(() => {
            this.spinning = false
            this.$emit('saveok', true)
          })
      }
      else {
        this.spinning = true
        this.$emit('saveok', false)
        delete this.ApplyPageData.createDate

        window.$oAjax({
          method: 'POST',
          url: window.$oApi.equipRepair.saveRepair,
          data: qs.stringify(this.ApplyPageData),
        }).then((res) => {
          if (res.success) {
            this.$emit('saveok', true)
            this.handleCancel()
            this.callback()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.spinning = false
        }).finally(() => {
          this.$emit('saveok', true)
          this.spinning = false
        })
      }
    },
    handleCancel() {
      this.ApplyPageData = null
      this.RepairPageData = null
      this.TestPageData = null
      this.ContactPageData = null
      // eslint-disable-next-line ts/no-unused-expressions
      this.$refs.ApplyPage ? this.$refs.ApplyPage.handleCancel() : null
      // eslint-disable-next-line ts/no-unused-expressions
      this.$refs.RepairPage ? this.$refs.RepairPage.handleCancel() : null
      // eslint-disable-next-line ts/no-unused-expressions
      this.$refs.TestPage ? this.$refs.TestPage.handleCancel() : null
      // eslint-disable-next-line ts/no-unused-expressions
      this.$refs.ContactPage ? this.$refs.ContactPage.handleCancel() : null
      this.isApplyPage = false
      this.isContactPage = false
      this.isTestPage = false
      this.activeKey = '1'
    },
    getData() {},
  },
}
</script>

<style lang="less">
.addModalBox {
  .ant-modal-body {
    height: 450px;
    max-height: 450px;
    overflow-y: auto;
    padding: 0 15px;
  }
}
</style>
