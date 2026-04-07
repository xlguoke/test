<template>
  <div class="reservationLab">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <InnerForm ref="innerFormRef"></InnerForm>

    <div class="reservationLab-btns">
      <van-row>
        <van-col span="12">
          <van-button block type="primary" square @click="submit">
            确定
          </van-button>
        </van-col>
        <van-col span="12">
          <van-button
            block
            square
            @click="
              () => {
                $router.go(-1)
              }
            "
          >
            取消
          </van-button>
        </van-col>
      </van-row>
    </div>
  </div>
</template>

<script>
import { showDialog, showLoadingToast, showNotify } from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import InnerForm from './InnerForm.vue'

export default {
  components: {
    MobileTitleBar,
    InnerForm,
  },
  beforeRouteLeave(to, from, next) {
    if (this.isSubmit === true && to.name === 'testTask') {
      const pageState = useAppPageStateStore().getPage(to.name)
      pageState.resetPage = true
    }
    next()
  },
  data() {
    return {
      isSubmit: false,
    }
  },
  methods: {
    // 保存操作
    async submit() {
      const data = await this.$refs.innerFormRef.getFormData()
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest({
        url: 'rest/humiture/res',
        headers: { 'Content-Type': ' application/json' },
        method: 'POST',
        data,
      }).finally(() => {
        toast.close()
      })

      if (res.code !== 20010) {
        showNotify({ type: 'success', message: '保存成功！' })
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
