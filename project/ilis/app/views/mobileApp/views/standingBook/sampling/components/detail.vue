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
      <template v-if="true">
        <v-form-item class="title" label="出库方式：">
          <span> 领取样品 </span>
        </v-form-item>
        <v-form-item label="领样人：">
          <span>
            {{ checkEmptyText(detail.saveDate) }}
          </span>
        </v-form-item>
        <v-form-item label="经办人：">
          <span>
            {{ checkEmptyText(detail.saveDate) }}
          </span>
        </v-form-item>
        <v-form-item label="领样日期：">
          <span>
            {{ checkEmptyText(detail.saveDate) }}
          </span>
        </v-form-item>
        <v-form-item label="领样数量：">
          <span>
            {{ checkEmptyText(detail.saveDate) }}
          </span>
        </v-form-item>
      </template>
      <template v-if="true">
        <v-form-item class="title" label="出库方式：">
          <span> 分包样品 </span>
        </v-form-item>
        <v-form-item label="分包单位：">
          <span>
            {{ checkEmptyText(detail.saveDate) }}
          </span>
        </v-form-item>
        <v-form-item label="经办人：">
          <span>
            {{ checkEmptyText(detail.saveDate) }}
          </span>
        </v-form-item>
        <v-form-item label="分包日期：">
          <span>
            {{ checkEmptyText(detail.saveDate) }}
          </span>
        </v-form-item>
        <v-form-item label="分包数量：">
          <span>
            {{ checkEmptyText(detail.saveDate) }}
          </span>
        </v-form-item>
      </template>
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
  .title {
    margin-top: 10px;
    font-weight: 600;
  }
}
</style>
