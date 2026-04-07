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
            查询项
          </div>
          <input
            v-model="formData.quickQryParam"
            placeholder="请输入检校单位或者登记人员"
          />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            送检日期
          </div>
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <input
              v-model.trim="formData.sendCheckDateBegin"
              style="width: 47%"
              readonly
              placeholder="请输入申请开始时间"
              @click="showStartTime = true"
            />
            -
            <input
              v-model.trim="formData.sendCheckDateEnd"
              style="width: 47%"
              readonly
              placeholder="请输入申请结束时间"
              @click="showEndTime = true"
            />
          </div>
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

    <!-- 检校时间选择 -->
    <MobileDateSelector
      v-model:open="showStartTime"
      title="选择开始时间"
      @select="(val) => { formData.sendCheckDateBegin = val }"
    />

    <!-- 检校时间选择 -->
    <MobileDateSelector
      v-model:open="showEndTime"
      title="选择结束时间"
      @select="(val) => { formData.sendCheckDateEnd = val }"
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
      showStartTime: false,
      showEndTime: false,
      formData: {},
    }
  },
  watch: {
    initalData(newVal) {
      this.formData = { ...newVal }
    },
  },
  created() {},
  methods: {
    clickLeft() {
      $emit(this, 'update:value', false)
    },

    selectStatus(val) {
      this.formData.status = val
      this.$forceUpdate()
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
}
</style>
