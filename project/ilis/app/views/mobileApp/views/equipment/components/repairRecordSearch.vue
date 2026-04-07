<template>
  <div>
    <van-popup
      duration="0.2"
      position="right"
      :style="{ width: '100%', height: '100%' }"
      :show="value"
      class="equipmentSearch"
    >
      <div class="equipmentSearch-wrap">
        <MobileTitleBar
          left-arrow
          :title="title || '数据筛选'"
          @click-left="clickLeft"
        />

        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            维修状态
          </div>
          <van-row class="equipmentSearch-status" :gutter="8">
            <van-col v-for="item in statusData" :key="item.id" span="8">
              <div
                class="equipmentSearch-statusBox"
                :class="`${item.value === formData.status ? 'active' : ''}`"
                @click="selectStatus(item.value)"
              >
                {{ item.typename }}
              </div>
            </van-col>
          </van-row>
        </div>

        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            查询内容
          </div>
          <input
            v-model.trim="formData.quickQryParam"
            placeholder="请输入设备编号、设备名称"
          />
        </div>

        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            维修费用
          </div>
          <div style="display: flex; align-items: center">
            <input
              v-model.trim="formData.totalFeeMin"
              placeholder="请输入维修费用"
              style="flex: 1"
              type="number"
              :min="0"
              @change="checkFeeVal('min')"
            />
            <span style="margin: 0 8px">~</span>
            <input
              v-model.trim="formData.totalFeeMax"
              placeholder="请输入维修费用"
              style="flex: 1"
              type="number"
              :min="0"
              @change="checkFeeVal('max')"
            />
          </div>
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            保修时间
          </div>
          <div style="display: flex; align-items: center">
            <input
              v-model.trim="formData.repairServiceEndTimeStart"
              readonly
              placeholder="请选择保修开始日期"
              style="flex: 1"
              @click="showRepairStartTime = true"
            />
            <span style="margin: 0 8px">~</span>
            <input
              v-model.trim="formData.repairServiceEndTimeEnd"
              readonly
              placeholder="请选择保修结束日期"
              style="flex: 1"
              @click="showRepairEndTime = true"
            />
          </div>
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            申请时间
          </div>
          <div style="display: flex; align-items: center">
            <input
              v-model.trim="formData.commonDateBegin"
              readonly
              placeholder="请选择申请开始日期"
              style="flex: 1"
              @click="showCommonDateBegin = true"
            />
            <span style="margin: 0 8px">~</span>
            <input
              v-model.trim="formData.commonDateEnd"
              readonly
              placeholder="请选择申请结束日期"
              style="flex: 1"
              @click="showCommonDateEnd = true"
            />
          </div>
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            申请人
          </div>
          <input
            v-model.trim="formData.userName"
            placeholder="请输入使用人员"
          />
        </div>

        <div style="height: 50px"></div>
        <div class="equipmentSearch-btns">
          <van-row>
            <van-col span="12">
              <van-button block square @click="onCancel">
                重置
              </van-button>
            </van-col>
            <van-col span="12">
              <van-button block type="primary" square @click="onOk">
                确定
              </van-button>
            </van-col>
          </van-row>
        </div>
      </div>
    </van-popup>

    <!-- 保修开始时间 -->
    <MobileDateSelector
      v-model:open="showRepairStartTime"
      title="选择开始时间"
      @select="(val) => { formData.repairServiceEndTimeStart = val }"
    />

    <!-- 保修结束时间 -->
    <MobileDateSelector
      v-model:open="showRepairEndTime"
      title="选择结束时间"
      @select="(val) => { formData.repairServiceEndTimeEnd = val }"
    />

    <!-- 申请开始时间 -->
    <MobileDateSelector
      v-model:open="showCommonDateBegin"
      title="选择开始时间"
      @select="(val) => { formData.commonDateBegin = val }"
    />

    <!-- 申请结束时间 -->
    <MobileDateSelector
      v-model:open="showCommonDateEnd"
      title="选择结束时间"
      @select="(val) => { formData.commonDateEnd = val }"
    />
  </div>
</template>

<script>
import MobileDateSelector from '~/views/mobileApp/components/MobileSelector/MobileDateSelector.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { $emit } from '../../utils/gogocodeTransfer'

export default {
  components: {
    MobileDateSelector,
    MobileTitleBar,
  },
  props: ['value', 'title', 'initalData'],
  emits: ['update:value', 'callback'],
  data() {
    return {
      showRepairStartTime: false,
      showRepairEndTime: false,
      showCommonDateBegin: false,
      showCommonDateEnd: false,
      formData: {},
      statusData: [
        { typename: '填写中', value: '10' },
        { typename: '填写完成', value: '20' },
        { typename: '审批中', value: '30' },
        { typename: '维修中', value: '40' },
        { typename: '维修完成', value: '50' },
        { typename: '验证审批中', value: '60' },
        { typename: '完成', value: '70' },
      ],
    }
  },
  computed: {},
  watch: {
    initalData(newVal) {
      this.formData = { ...newVal }
    },
  },
  methods: {
    isDefined(val) {
      return val !== null && val !== undefined && val !== ''
    },
    selectStatus(val) {
      this.formData.status = val
      this.$forceUpdate()
    },
    checkFeeVal(type) {
      const { totalFeeMin, totalFeeMax } = this.formData

      if (totalFeeMin && totalFeeMin < 0) {
        this.formData.totalFeeMin = undefined
        showToast('不能小于0')
      }

      if (totalFeeMax && totalFeeMax < 0) {
        this.formData.totalFeeMax = undefined
        showToast('不能小于0')
      }

      if (
        this.isDefined(this.formData.totalFeeMin)
        && this.isDefined(this.formData.totalFeeMax)
        && this.formData.totalFeeMin > this.formData.totalFeeMax
      ) {
        if (type === 'max') {
          this.formData.totalFeeMin = this.formData.totalFeeMax
        }
        else {
          this.formData.totalFeeMax = this.formData.totalFeeMin
        }
      }
    },
    formatter(type, val) {
      if (type === 'year') {
        return `${val}年`
      }
      else if (type === 'month') {
        return `${val}月`
      }
      else if (type === 'day') {
        return `${val}日`
      }
      return val
    },
    clickLeft() {
      $emit(this, 'update:value', false)
    },
    onOk() {
      $emit(this, 'callback', this.formData)
      $emit(this, 'update:value', false)
    },
    onCancel() {
      $emit(this, 'callback', {})
      $emit(this, 'update:value', false)
    },
  },
}
</script>

<style lang="less" scoped>
.equipmentSearch {
  .equipmentSearch-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .equipmentSearch-btns {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 46px;

    .van-button {
      height: 46px;
      line-height: 46px;
    }
  }

  .equipmentSearch-row {
    padding: 15px 15px 0 15px;

    input {
      margin-top: 8px;
      background: #e8f4ff;
      width: 100%;
      height: 32px;
      border: 0;
      border-radius: 3px;
      padding: 0 8px;
    }
  }

  .equipmentSearch-title {
    font-size: 16px;
    font-weight: bold;
  }

  .equipmentSearch-status {
    padding: 15px 15px 0 15px;

    .equipmentSearch-statusBox {
      background: #e8f4ff;
      border-radius: 3px;
      color: #333;
      padding: 5px 0;
      text-align: center;
      border: solid 2px transparent;
      margin-bottom: 8px;

      &.active {
        border: solid 2px rgb(204, 94, 77);
        background: rgb(253, 243, 242);
      }
    }
  }
}
</style>
