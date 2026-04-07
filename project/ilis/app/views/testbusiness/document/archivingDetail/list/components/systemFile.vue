<template>
  <div class="testItem">
    <a-tabs :active-key="activeKey" @change="changeTabs">
      <a-tab-pane v-if="isOtherAchievement" tab="检测方案及成果" force-render>
        <OtherAchievement ref="OtherAchievement" />
      </a-tab-pane>
      <a-tab-pane v-if="isAppendix" tab="附录" force-render>
        <Appendix ref="Appendix" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
// 其他成果 OtherAchievement
import qs from 'qs'
import { getQueryVariable } from '~/providers/common/utils'
// 附录 Appendix
import Appendix from '~/views/testbusiness/testitem/testItemDetail/appendix/index.vue'

import OtherAchievement from '~/views/testbusiness/testitem/testItemDetail/otherAchievement/index.vue'

export default {
  components: {
    OtherAchievement,
    Appendix,
  },
  props: ['callback'],
  data() {
    return {
      id: getQueryVariable('id'),
      activeKey: '1',
      TEqRepairId: '',
      equipmentId: '',
      status: '',
      isOtherAchievement: false,
      isAppendix: false,
      OtherAchievementData: null,
      AppendixData: null,
      timerOtherAchievement: null,
      timerAppendix: null,
    }
  },
  created() {},
  methods: {
    changeTabs(key) {
      this.activeKey = key
    },
    showModal(recordId) {
      this.spinning = true
      this.isOtherAchievement = true
      this.isAppendix = true
      // recordId = "4028828372bfede60172c059e6200003";
      this.showModalAll(recordId)
    },
    showModalAll(recordId) {
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      // if (this.isAppendix) {
      if (this.$refs.Appendix) {
        this.$refs.Appendix.showModal(recordId)
      }
      else {
        this.timerAppendix = setInterval(() => {
          if (self.$refs.Appendix) {
            clearInterval(self.timerAppendix)
            self.timerAppendix = null
            self.$refs.Appendix.showModal(recordId)
          }
        }, 100)
      }
      // }

      if (this.$refs.OtherAchievement) {
        // this.OtherAchievementData
        this.$refs.OtherAchievement.showModal(recordId)
      }
      else {
        this.timerOtherAchievement = setInterval(() => {
          if (self.$refs.OtherAchievement) {
            clearInterval(self.timerOtherAchievement)
            self.timerOtherAchievement = null
            self.$refs.OtherAchievement.showModal(recordId)
          }
        }, 100)
      }
    },
    handleOk() {
      this.OtherAchievementData = this.$refs.OtherAchievement
        ? this.$refs.OtherAchievement.handleOk()
        : this.OtherAchievementData
      this.AppendixData = this.$refs.Appendix
        ? this.$refs.Appendix.handleOk()
        : this.AppendixData
      if (!this.OtherAchievementData) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先填写维修申请'))
        return
      }

      if (this.status === '40' || this.status === '50') {
        // 维修中40，維修完成50
        if (!this.AppendixData) {
          window.$oAntdModal.warning(window.$oMsgTips.info('设备维修的外联情况不能为空!'))
          return
        }

        this.AppendixData['TEqRepair.id'] = this.TEqRepairId
        this.AppendixData.equipmentId = this.equipmentId
        window.$oAjax({
          method: 'POST',
          url: window.$oApi.equipRepair.saveRepairContact,
          data: qs.stringify(this.AppendixData),
        })
          .then(() => {})
          .then(() => {})
          .then((res) => {
            if (res.success) {
              this.handleCancel()
              this.callback()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
          })
      }
      else {
        window.$oAjax({
          method: 'POST',
          url: window.$oApi.equipRepair.saveRepair,
          data: qs.stringify(this.OtherAchievementData),
        }).then((res) => {
          if (res.success) {
            this.handleCancel()
            this.callback()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
      }
    },
    handleCancel() {
      this.OtherAchievementData = null
      this.AppendixData = null
      // eslint-disable-next-line ts/no-unused-expressions
      this.$refs.OtherAchievement
        ? this.$refs.OtherAchievement.handleCancel()
        : null
      // eslint-disable-next-line ts/no-unused-expressions
      this.$refs.Appendix ? this.$refs.Appendix.handleCancel() : null
      this.isOtherAchievement = false
      this.isAppendix = false
      this.timerOtherAchievement = null
      this.timerAppendix = null
      this.activeKey = '1'
    },
    getData() {
      const obj = {
        Appendix: this.$refs.Appendix.selectedRows,
        OtherAchievement: this.$refs.OtherAchievement.selectedRows,
      }
      return [].concat(obj.Appendix).concat(obj.OtherAchievement)
    },
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
  /*.ant-form-item-label {*/
  /*width: 80px;*/
  /*}*/
}
.testItemDetail-left-tree.ant-tree {
  .ant-tree-node-content-wrapper {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 85%;
    word-break: break-all;
  }
}
</style>
