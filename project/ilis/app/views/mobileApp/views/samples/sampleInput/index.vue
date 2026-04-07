<template>
  <div class="sampleInput-wrap">
    <van-sticky>
      <MobileTitleBar title="录入编码" left-arrow @click-left="$router.go(-1)">
      </MobileTitleBar>
    </van-sticky>
    <div class="sampleInput-content flex items-center justify-center">
      <textarea
        v-model="labelId"
        class="textarea"
        placeholder="请输入标签编码"
      ></textarea>
      <div class="scan-box" @click.stop="onSubmit">
        <div class="scan-wrap">
          完成<br />添加
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useSampleStore } from '~/views/mobileApp/store/useSampleStore'

export default {
  components: {
    MobileTitleBar,
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === 'samples' && this.isSubmit === true) {
      const pageState = useAppPageStateStore().getPage(to.name)
      pageState.resetPage = true
    }
    next()
  },
  data() {
    return {
      labelId: '',
    }
  },
  computed: {
    ...mapState(useSampleStore, ['sampleStorageInfo']),
  },
  methods: {
    // 扫码
    onSubmit() {
      if (!this.labelId) {
        showToast('请输入标签编码')
        return
      }
      const sampleStorageInfo = this.sampleStorageInfo
      if (sampleStorageInfo && sampleStorageInfo.sampleStorageList) {
        const sampleStorageList = sampleStorageInfo.sampleStorageList
        const has = sampleStorageList.some((i) => {
          return i.labelId === this.labelId
        })
        if (has) {
          showDialog({ message: '当前列表中已经添加过该二维码' })
          return
        }
      }
      this.getProcessObjectByLabelId(this.labelId)
    },
    getProcessObjectByLabelId(result) {
      const toast = showLoadingToast({
        duration: 0,
        message: '提交中...',
        forbidClick: true,
      })
      // alert(result);
      mRequest
        .get(api.samples.getProcessObjectByLabelId, {
          params: { labelId: result },
        })
        .then((res) => {
          toast && toast.close()
          if (res.success) {
            if (res.obj && res.obj.length) {
              if (res.obj[0].error === '0') {
                this.$router.go(-1)
                this.$router.replace({
                  name: 'sampleStorage',
                  query: { labelId: this.labelId },
                })
              }
              else {
                showDialog({ message: res.obj[0].error })
              }
            }
            else {
              showDialog({
                message: res.mes || res.message || '未查询到该标签编码',
              })
            }
          }
          else {
            showDialog({
              message: res.mes || res.message || '未查询到该标签编码',
            })
          }
        })
        .catch((_) => {
          toast && toast.close()
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
