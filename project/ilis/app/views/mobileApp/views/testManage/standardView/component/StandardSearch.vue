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
            是否系统规程
          </div>
          <van-radio-group
            v-model="formData.sourceType"
            direction="horizontal"
          >
            <van-radio name="1">
              系统规程
            </van-radio>
            <van-radio name="2">
              用户规程
            </van-radio>
            <van-radio :name="undefined">
              全部
            </van-radio>
          </van-radio-group>
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            是否为本单位规程
          </div>
          <van-radio-group
            v-model="formData.whetherThisUnit"
            direction="horizontal"
          >
            <van-radio name="1">
              是
            </van-radio>
            <van-radio name="0">
              否
            </van-radio>
            <van-radio :name="undefined">
              全部
            </van-radio>
          </van-radio-group>
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            是否上传文件
          </div>
          <van-radio-group
            v-model="formData.isUploadFile"
            direction="horizontal"
          >
            <van-radio name="1">
              是
            </van-radio>
            <van-radio name="0">
              否
            </van-radio>
            <van-radio :name="undefined">
              全部
            </van-radio>
          </van-radio-group>
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
  </div>
</template>

<script>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { $emit } from '../../../utils/gogocodeTransfer'

export default {
  components: {
    MobileTitleBar,
  },
  props: ['value', 'title', 'initalData'],
  emits: ['update:value', 'callback'],
  data() {
    return {
      formData: {
        sourceType: undefined,
        whetherThisUnit: undefined,
        isUploadFile: undefined,
      },
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
