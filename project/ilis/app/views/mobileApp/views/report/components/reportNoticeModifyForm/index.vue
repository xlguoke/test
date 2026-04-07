<template>
  <div class="reportNoticeModify">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <FormItemInput
      v-model:value="reportCode"
      label-width="5.4em"
      rows="1"
      autosize
      readonly
      label="报告编号"
      type="textarea"
    />

    <FormItemInput
      v-model:value="noticeContent"
      label-width="5.4em"
      rows="1"
      autosize
      label="意见"
      type="textarea"
      placeholder="请输入意见"
    />

    <div class="reportNoticeModify-btns">
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
  </div>
</template>

<script>
import qs from 'qs'
import { showDialog, showNotify } from 'vant'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'

export default {
  components: {
    MobileTitleBar,
    FormItemInput,
  },
  beforeRouteLeave(to, from, next) {
    if (this.isSubmit === true) {
      if (this.isSetRoute === true) {
        next()
      }
      else {
        const toPageState = useAppPageStateStore().getPage(to.name)

        toPageState.resetPage = true
        const routerObj = { name: to.name, params: { ...to.params } }
        if (to.name === 'reportDetail') {
          toPageState.isSubmit = true
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
      noticeContent: '',
      type: 2,
      id: this.$route.params.id,
      reportState: this.$route.params.reportState,
      reportCode: this.$route.params.reportCode,
      consignId: this.$route.params.consignId,
      isSubmit: false,
      isSetRoute: false,
    }
  },
  created() {
    if (String(this.reportState) === '15') {
      this.type = 2
    }
    else if (String(this.reportState) === '20') {
      this.type = 3
    }
    else if (String(this.reportState) === '30') {
      this.type = 4
    }
  },
  methods: {
    async ok() {
      // if(!this.noticeContent){
      //   showNotify({type: 'warning', message: '请输入意见'})
      //   return;
      // }
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest.post(
        api.report.consignModifyNotice,
        qs.stringify({
          noticeContent: this.noticeContent,
          objectId: this.id,
          type: this.type,
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
    onCancel() {
      this.$router.go(-1)
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
