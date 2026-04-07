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
            设备名称
          </div>
          <input
            v-model.trim="formData.equipmentName"
            placeholder="请输入设备名称"
          />
        </div>

        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            设备编号
          </div>
          <input
            v-model.trim="formData.equipmentCode"
            placeholder="请输入设备编号"
          />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            使用时间
          </div>
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <input
              v-model.trim="formData.startUseTime"
              style="width: 47%"
              readonly
              placeholder="请输入开始时间"
              @click="showStartTime = true"
            />
            -
            <input
              v-model.trim="formData.endUseTime"
              style="width: 47%"
              readonly
              placeholder="请输入结束时间"
              @click="showEndTime = true"
            />
          </div>
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            使用人员
          </div>
          <input
            v-model.trim="formData.userName"
            placeholder="请输入使用人员"
          />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            使用地点
          </div>
          <input
            v-model.trim="formData.usePlace"
            placeholder="请输入规格型号"
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

    <MobileDateSelector
      v-model:open="showStartTime"
      title="选择开始时间"
      @select="(val) => { formData.startUseTime = val }"
    />

    <MobileDateSelector
      v-model:open="showEndTime"
      title="选择结束时间"
      @select="(val) => { formData.endUseTime = val }"
    />
  </div>
</template>

<script>
import qs from 'qs'
import MobileDateSelector from '~/views/mobileApp/components/MobileSelector/MobileDateSelector.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
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
      statusData: [],
      formData: {},
    }
  },
  computed: {},
  watch: {
    initalData(newVal) {
      this.formData = { ...newVal }
    },
  },
  created() {
    this.getStatus()
  },
  methods: {
    clickLeft() {
      $emit(this, 'update:value', false)
    },
    async getStatus() {
      const res = await mRequest.post(
        api.common.getListByGroupId,
        qs.stringify({
          dictGroupId: '402882cd5f998a58015f9998ff71001b',
        }),
      )

      if (res && res.obj) {
        this.statusData = res.obj
      }
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
