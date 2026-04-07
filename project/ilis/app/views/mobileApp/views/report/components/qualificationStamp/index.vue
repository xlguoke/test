<template>
  <div class="reportNoticeModify">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <div>
      <van-checkbox-group v-model="selectedIds">
        <van-checkbox
          v-for="d in datas"
          :key="d.sealId"
          shape="square"
          :name="d.sealId"
        >
          <van-tag v-if="d.qualificationId" color="#f59a23">
            资质
          </van-tag>
          <van-tag v-else color="#97c21c">
            其他
          </van-tag>
          {{ d.sealName }}
        </van-checkbox>
      </van-checkbox-group>
    </div>

    <div class="reportNoticeModify-btns">
      <van-row>
        <van-col span="12">
          <van-button block square @click="onCancel">
            取消
          </van-button>
        </van-col>
        <van-col span="12">
          <van-button block type="primary" square @click="ok">
            确定
          </van-button>
        </van-col>
      </van-row>
    </div>
  </div>
</template>

<script>
import {
  showDialog,
  showLoadingToast,
  showNotify,
} from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
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
      datas: [],
      reportId: this.$route.params.reportId,
      isSubmit: false,
      isSetRoute: false,
      selectedIds: [],
    }
  },
  async created() {
    await this.getDatas()
    await this.getSelectedData()
  },
  methods: {
    getDatas() {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest
        .get('/rest/report/seals', {
          params: {
            reportIds: this.reportId,
          },
        })
        .then((res) => {
          if (res.code !== 20010) {
            this.datas = res.data
          }
          else {
            showNotify({ type: 'danger', warning: res.msg || '获取数据失败' })
          }
        })
        .finally(() => {
          toast.close()
        })
    },
    getSelectedData() {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest
        .get('/rest/common-body/report/seal/batch', {
          params: {
            reportIds: this.reportId,
          },
        })
        .then((res) => {
          this.selectedIds = res.data.map(d => d.sealId)
        })
        .finally(() => {
          toast.close()
        })
    },
    ok() {
      if (this.selectedIds.length === 0) {
        showDialog({
          title: '提示',
          message: '请选择报告印章',
        })
        return
      }

      const checkHasZZ = this.datas.some(
        i => this.selectedIds.includes(i.sealId) && i.qualificationId,
      )
      if (!checkHasZZ) {
        showDialog({
          title: '提示',
          message: '至少选择一个资质印章',
        })
        return
      }

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest
        .post(
          'rest/common-body/report/seal/batch-save',
          JSON.stringify(
            this.datas
              .filter(i => this.selectedIds.includes(i.sealId))
              .map(j => ({
                reportId: this.reportId,
                qualificationId: j.qualificationId,
                qualificationName: j.qualificationName,
                sealId: j.sealId,
                sealName: j.sealName,
              })),
          ),
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        .then((res) => {
          if (res.code !== 20010) {
            showNotify({ type: 'success', message: '操作成功' })
            this.isSubmit = true
            this.$router.go(-1)
          }
          else {
            showDialog({ message: res.msg || res.message || '操作失败' })
          }
        })
        .catch((err) => {
          showNotify({
            type: 'danger',
            message: (err && err.msg) || '保存异常',
          })
        })
        .finally(() => {
          toast.close()
        })
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
