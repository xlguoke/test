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
        <van-row class="equipmentSearch-status" :gutter="8">
          <van-col v-for="item in statusData" :key="item.id" span="8">
            <div
              class="equipmentSearch-statusBox"
              :class="`${item.value === formData.eqStatus ? 'active' : ''}`"
              @click="selectStatus(item.value)"
            >
              {{ item.typename }}
            </div>
          </van-col>
        </van-row>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            检校确认人
          </div>
          <input
            v-model="formData.confirmerName"
            placeholder="请输入检校确认人"
          />
        </div>

        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            检校日期
          </div>
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <input
              v-model.trim="formData.checkDateBegin"
              style="width: 47%"
              readonly
              placeholder="请选择开始日期"
              @click="showStartTime = true"
            />
            -
            <input
              v-model.trim="formData.checkDateEnd"
              style="width: 47%"
              readonly
              placeholder="请选择结束日期"
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
      @select="(val) => { formData.checkDateBegin = val }"
    />

    <!-- 检校时间选择 -->
    <MobileDateSelector
      v-model:open="showEndTime"
      title="选择结束时间"
      @select="(val) => { formData.checkDateEnd = val }"
    />
  </div>
</template>

<script>
import MobileDateSelector from '~/views/mobileApp/components/MobileSelector/MobileDateSelector.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { $emit } from '../../../utils/gogocodeTransfer'

export default {
  components: {
    MobileDateSelector,
    MobileTitleBar,
  },
  props: ['value', 'title', 'initalData'],
  emits: ['update:value', 'callback'],
  data() {
    return {
      formData: {
        eqStatus: undefined,
        confirmerName: '',
      },
      statusData: [
        { typename: '填写中', value: '10' },
        { typename: '审核中', value: '20' },
        { typename: '未通过', value: '30' },
        { typename: '已通过', value: '40' },
        { typename: '审核驳回', value: '50' },
      ],
      showStartTime: false,
      showEndTime: false,
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
      this.formData.eqStatus = val
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
    margin-bottom: 12px;
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
