<template>
  <div class="samplesDelivery-detail-wrap">
    <van-sticky>
      <MobileTitleBar
        :title="detail.testSampleDisplayName"
        left-arrow
        @click-left="$router.go(-1)"
      >
      </MobileTitleBar>
    </van-sticky>
    <div class="samplesDelivery-detail-content">
      <div class="samplesDelivery-detail-title">
        <b>{{ detail.testSampleDisplayName }}</b>
        <p v-if="detail.testObjectCode">
          ({{ detail.testObjectCode }})
        </p>
      </div>
      <div class="samplesDelivery-form">
        <div class="samplesDelivery-form-item">
          <div class="samplesDelivery-form-label">
            试件编号：
          </div>
          <div class="samplesDelivery-form-value">
            {{ detail.periodCode }}
          </div>
        </div>
        <div class="samplesDelivery-form-item">
          <div class="samplesDelivery-form-label">
            检测参数：
          </div>
          <div class="samplesDelivery-form-value">
            {{ detail.testParamName }}
          </div>
        </div>
        <div class="samplesDelivery-form-item">
          <div class="samplesDelivery-form-label">
            龄 期(天)：
          </div>
          <div class="samplesDelivery-form-value">
            {{ detail.periodDays }}
          </div>
        </div>
        <div class="samplesDelivery-form-item">
          <div class="samplesDelivery-form-label">
            制件时间：
          </div>
          <div class="samplesDelivery-form-value">
            {{ formatDate(detail.formingDate, 'YYYY-MM-DD HH:mm:ss') }}
          </div>
        </div>
        <div class="samplesDelivery-form-item">
          <div class="samplesDelivery-form-label">
            龄期到期：
          </div>
          <div class="samplesDelivery-form-value">
            {{ formatDate(detail.planTestTime, 'YYYY-MM-DD HH:mm:ss') }}
          </div>
        </div>
        <div class="samplesDelivery-form-item">
          <div class="samplesDelivery-form-label">
            制 件 人：
          </div>
          <div class="samplesDelivery-form-value">
            {{ detail.producer }}
          </div>
        </div>
        <div class="samplesDelivery-form-item">
          <div class="samplesDelivery-form-label">
            制样情况：
          </div>
          <div class="samplesDelivery-form-value">
            {{ detail.description }}
          </div>
        </div>
      </div>
      <ul v-if="detail.storageVos" class="samplesDelivery-list">
        <li
          v-for="(item, index) in detail.storageVos"
          :key="index"
          class="samplesDelivery-item flex items-center"
        >
          <div class="samplesDelivery-item-tag">
            <span v-if="String(item.operationType) === '1'" class="green">入库</span>
            <span v-else-if="String(item.operationType) === '2'" class="yellow">出库</span>
          </div>
          <div class="samplesDelivery-item-content">
            <div class="samplesDelivery-item-info">
              {{ String(item.operationType) === '1' ? '入库' : '领样' }}人：{{
                item.operator
              }}
            </div>
            <div class="samplesDelivery-item-info">
              {{ String(item.operationType) === '1' ? '入库' : '出库' }}时间：{{
                formatDate(item.operationDate)
              }}
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      formatDate,
      detail: {
        testSampleDisplayName: '',
      },
      title: '',
      id: '',
      list: [],
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
          if (res.code === 20000) {
            const orderNumData = res.data ? res.data : {}
            if (orderNumData.storageVos && orderNumData.storageVos.length > 1) {
              const storageVos = [...orderNumData.storageVos].sort(
                this.compareObj('createDate'),
              )
              orderNumData.storageVos = storageVos
            }
            this.detail = orderNumData
          }
          else {
            showFailToast(res.message)
          }
        })
        .catch((_) => {
          toast && toast.close()
        })
    },
    // 对象排序
    compareObj(prop) {
      return function (obj1, obj2) {
        let val1 = obj1[prop]
        let val2 = obj2[prop]
        if (!Number.isNaN(Number(val1)) && !Number.isNaN(Number(val2))) {
          val1 = Number(val1)
          val2 = Number(val2)
        }
        if (val1 < val2) {
          return -1
        }
        else if (val1 > val2) {
          return 1
        }
        else {
          return 0
        }
      }
    },
  },
}
</script>

<style lang="less" scoped>
.samplesDelivery-detail-wrap {
  width: 100%;
  height: 100vh;
  background: #fff;
  .samplesDelivery-detail-content {
    width: 100%;
  }
  .samplesDelivery-detail-title {
    font-size: 16px;
    padding: 16px;
    box-sizing: border-box;

    .tag {
      font-size: 12px;
      color: #999999;
      margin-left: 10px;
    }
  }
  .title {
    margin-top: 10px;
    font-weight: 600;
  }
  .samplesDelivery-form {
    padding-top: 15px;
    margin-top: 2px;
    border-top: 1px solid #f2f2f2;
  }
  .samplesDelivery-form-item {
    display: flex;
    padding: 2px 20px;
    box-sizing: border-box;
    .samplesDelivery-form-label {
      width: 80px;
    }
    .samplesDelivery-form-value {
      width: calc(100% - 100px);
    }
    .samplesDelivery-form-label,
    .samplesDelivery-form-value {
      font-size: 14px;
      line-height: 24px;
    }
  }
  .samplesDelivery-list {
    width: 100%;
    margin-top: 10px;
    .samplesDelivery-item {
      border-top: 1px solid #f2f2f2;
      padding: 10px 0;
      box-sizing: border-box;
      .samplesDelivery-item-tag {
        font-weight: 700;
        font-style: normal;
        font-size: 16px;
        text-align: center;
        padding: 0 20px;
      }
      .green {
        color: #70b603;
      }
      .yellow {
        color: #f59a23;
      }
      .samplesDelivery-item-content {
        flex: 1;
        overflow: hidden;
      }
      .samplesDelivery-item-info {
        font-size: 14px;
        line-height: 24px;
      }
    }
  }
}
</style>
