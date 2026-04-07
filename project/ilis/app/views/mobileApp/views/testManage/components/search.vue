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
              :class="`${item.typename === formData.eqStatus ? 'active' : ''}`"
              @click="selectStatus(item.typename)"
            >
              {{ item.typename }}
            </div>
          </van-col>
        </van-row>

        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            设备名称
          </div>
          <input v-model.trim="formData.eqName" placeholder="请输入设备名称" />
        </div>

        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            设备编号
          </div>
          <input
            v-model.trim="formData.equipmentSn"
            placeholder="请输入设备编号"
          />
        </div>

        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            规格型号
          </div>
          <input
            v-model.trim="formData.eqStandard"
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
  </div>
</template>

<script>
import qs from 'qs'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { $emit } from '../../utils/gogocodeTransfer'

export default {
  components: {
    MobileTitleBar,
  },
  props: ['value', 'title', 'initalData'],
  emits: ['update:value', 'callback'],
  data() {
    return {
      statusData: [],
      formData: {
        eqStatus: undefined,
      },
    }
  },
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
