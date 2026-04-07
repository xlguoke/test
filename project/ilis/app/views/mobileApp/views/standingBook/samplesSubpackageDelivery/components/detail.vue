<template>
  <div class="samplesDelivery-detail-wrap">
    <van-sticky>
      <MobileTitleBar title="样品出入库详情" left-arrow @click-left="$router.go(-1)">
      </MobileTitleBar>
    </van-sticky>
    <div class="samplesDelivery-detail-content">
      <div class="samplesDelivery-detail-title">
        普通硅酸盐水泥(P.O 42.5) <span class="tag">未出库</span>
      </div>
      <v-form-item label="入库日期：">
        <span>
          {{ checkEmptyText(detail.saveDate) }}
        </span>
      </v-form-item>
      <v-form-item label="试样数量：">
        <span>
          {{ checkEmptyText(detail.saveDate) }}
        </span>
      </v-form-item>
      <v-form-item label="存放地点：">
        <span>
          {{ checkEmptyText(detail.saveDate) }}
        </span>
      </v-form-item>
      <v-form-item label="入库操作人：">
        <span>
          {{ checkEmptyText(detail.saveDate) }}
        </span>
      </v-form-item>
    </div>
  </div>
</template>

<script>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { checkEmptyText } from '~/views/mobileApp/provides/utils/checkEmptyText'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      checkEmptyText,
      detail: {
        saveDate: '',
      },
      id: '',
    }
  },
  computed: {},
  mounted() {
    const query = this.$route.query
    this.id = query.id ? query.id : ''
    this.getPeriodDetail()
  },
  methods: {
    getPeriodDetail() {
      const toast = showLoadingToast({
        duration: 0,
        message: '加载中...',
        forbidClick: true,
      })
      mRequest
        .get(api.samples.getPeriodDetail, {
          params: {
            id: this.id,
            page: this.currentPage,
            rows: this.pageSize,
          },
        })
        .then((res) => {
          toast && toast.close()
          if (res.code !== 20000) {
            showFailToast(res.message)
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
.samplesDelivery-detail-wrap {
  width: 100%;
  height: 100%;
  background: #fff;
  .samplesDelivery-detail-content {
    width: 100%;
  }
  .samplesDelivery-detail-title {
    font-size: 16px;
    font-weight: 600;
    line-height: 48px;
    padding: 0 20px;
    box-sizing: border-box;
    background: #f2f2f2;
    .tag {
      font-size: 12px;
      color: #999999;
      margin-left: 10px;
    }
  }
  :deep(.form-label) {
    width: 100px;
  }
}
</style>
