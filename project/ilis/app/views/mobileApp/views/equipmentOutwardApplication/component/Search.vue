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
            v-model="formData.quickQry"
            placeholder="请输入外出申请单号/工程项目名称/任务编号/申请人"
          />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            申请状态
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
            申请时间
          </div>
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <input
              v-model.trim="formData.createDateStartStr"
              style="width: 47%"
              readonly
              placeholder="请输入申请开始时间"
              @click="showStartTime = true"
            />
            -
            <input
              v-model.trim="formData.createDateEndStr"
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

    <!-- 申请开始时间 -->
    <MobileDateSelector
      v-model:open="showStartTime"
      title="选择开始时间"
      @select="(val) => { formData.createDateStartStr = val }"
    />

    <!-- 申请结束时间 -->
    <MobileDateSelector
      v-model:open="showEndTime"
      title="选择结束时间"
      @select="(val) => { formData.createDateEndStr = val }"
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
      formData: {
        status: undefined,
      },
      statusData: [
        { typename: '待提交', value: '12' },
        { typename: '审批中', value: '14' },
        { typename: '审批拒绝', value: '16' },
        { typename: '审批通过', value: '20' },
      ],
    }
  },
  watch: {
    initalData(newVal) {
      this.formData = { ...newVal }
    },
  },
  created() {},
  methods: {
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
    selectStatus(val) {
      this.formData.status = val
      this.$forceUpdate()
    },
    onOk() {
      const data = { ...this.formData }
      if (data.createDateStartStr) {
        data.createDateStartStr = `${data.createDateStartStr} 00:00:00`
      }
      if (data.createDateEndStr) {
        data.createDateEndStr = `${data.createDateEndStr} 23:59:59`
      }

      $emit(this, 'callback', data)
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
