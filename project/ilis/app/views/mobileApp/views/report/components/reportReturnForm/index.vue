<template>
  <div class="reportReturn">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <div>
      <div class="reportReturn-code">
        {{ reportCode }}
      </div>
      <van-field
        v-model="formData.targetStr"
        label-width="5.4em"
        rows="1"
        readonly
        autosize
        label="退回至"
        center
        required
        type="textarea"
        placeholder="请选择"
      >
        <template #button>
          <van-button
            size="small"
            plain
            hairline
            type="primary"
            @click="selectNode"
          >
            选择
          </van-button>
        </template>
      </van-field>
      <van-field
        v-model="formData.reason"
        label-width="5.4em"
        rows="1"
        autosize
        label="退回原因"
        required
        type="textarea"
        placeholder="请输入退回原因"
      />
    </div>

    <div class="reportReturn-btns">
      <van-row>
        <van-col span="12">
          <van-button block type="primary" square @click="ok">
            确定
          </van-button>
        </van-col>
        <van-col span="12">
          <van-button block square @click="onCancel">
            取消
          </van-button>
        </van-col>
      </van-row>
    </div>

    <van-action-sheet
      v-model:show="visible"
      :actions="nodes"
      :round="false"
      @select="onSelect"
    />
  </div>
</template>

<script>
import qs from 'qs'
import { showDialog, showLoadingToast, showNotify } from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'

export default {
  components: {
    MobileTitleBar,
  },
  beforeRouteLeave(to, from, next) {
    if (this.isSubmit === true) {
      if (this.isSetRoute === true) {
        next()
      }
      else {
        const pageState = useAppPageStateStore().getPage(to.name)
        pageState.resetPage = true

        const routerObj = { name: to.name, params: { ...to.params } }
        if (to.name === 'reportDetail') {
          pageState.isSubmit = true
          this.$router.go(-1)
          return
        }
        this.isSetRoute = true
        this.$router.replace(routerObj)
      }
    }
    else {
      next()
    }
  },
  data() {
    return {
      formData: {
        node: '',
        reason: '',
      },
      source: 'reportAudit',
      nodes: [],
      visible: false,
      id: this.$route.params.id,
      reportState: this.$route.params.reportState,
      reportType: this.$route.params.reportType,
      reportCode: this.$route.params.reportCode,
      isSubmit: false,
      isSetRoute: false,
    }
  },
  created() {
    let nodes = []
    if (this.reportState === '15') {
      this.source = 'reportAudit'

      nodes = [
        { name: '委托收样', value: 'consign' },
        { name: '试验检测', value: 'testTask' },
      ]
      if (this.reportType === 'synthesis') {
        nodes = [{ name: '报告编制', value: 'reportCompile' }]
      }
    }
    else if (this.reportState === '20') {
      this.source = 'reportApprove'

      nodes = [
        { name: '委托收样', value: 'consign' },
        { name: '试验检测', value: 'testTask' },
        { name: '报告审核', value: 'reportAudit' },
      ]
      if (this.reportType === 'synthesis') {
        nodes = [
          { name: '报告编制', value: 'reportCompile' },
          { name: '报告审核', value: 'reportAudit' },
        ]
      }
    }
    else if (this.reportState === '30') {
      this.source = 'reportPrint'

      nodes = [
        { name: '委托收样', value: 'consign' },
        { name: '试验检测', value: 'testTask' },
        { name: '报告审核', value: 'reportAudit' },
        { name: '报告批准', value: 'reportApprove' },
      ]
      if (this.reportType === 'synthesis') {
        nodes = [
          { name: '报告编制', value: 'reportCompile' },
          { name: '报告审核', value: 'reportAudit' },
          { name: '报告批准', value: 'reportApprove' },
        ]
      }
    }
    this.nodes = nodes
  },
  methods: {
    selectNode() {
      this.visible = true
    },
    onSelect(val) {
      this.formData.target = val.value
      this.formData.targetStr = val.name
      this.visible = false
    },
    onCancel() {
      this.$router.go(-1)
    },
    async ok() {
      if (!this.formData.targetStr) {
        showNotify({ type: 'warning', message: '请选择退回节点' })
        return
      }
      else if (!this.formData.reason) {
        showNotify({ type: 'warning', message: '请输入退回原因' })
        return
      }
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest.post(
        api.report.rollback,
        qs.stringify({
          ...this.formData,
          sourceObjId: this.id,
          source: this.source,
        }),
      ).finally(() => {
        toast.close()
      })

      if (res.success) {
        showNotify({ type: 'success', message: '操作成功' })
        this.isSubmit = true
        this.$router.go(-1)
      }
      else {
        showDialog({ message: res.msg || res.message || '操作失败' })
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
