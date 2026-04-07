<template>
  <div>
    <van-popup
      duration="0.2"
      position="right"
      :style="{ width: '100%', height: '100%' }"
      :show="value"
      class="selectParams"
    >
      <div class="selectParams-wrap">
        <MobileTitleBar
          left-arrow
          left-text="关闭"
          :title="title || '参数列表'"
          @click-left="onCancel"
        />

        <div class="selectParams-list">
          <div
            v-for="item in list"
            :key="item.id"
            class="selectParams-row"
            @click="onSelect(item)"
          >
            <div class="selectParams-content">
              {{ item.displayName }}
            </div>
            <div class="selectParams-radio">
              <van-icon
                name="success"
                size="24"
                :color="item.id === selected.id ? '#1989fa' : '#999'"
              />
            </div>
          </div>
        </div>

        <div style="height: 50px"></div>

        <div class="selectParams-btns">
          <van-row>
            <van-col span="12">
              <van-button block type="primary" square @click="onOk">
                确定
              </van-button>
            </van-col>
            <van-col span="12">
              <van-button block square @click="onCancel">
                取消
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
import { showDialog } from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { $emit } from '../../utils/gogocodeTransfer'

export default {
  components: {
    MobileTitleBar,
  },
  props: ['value', 'title', 'testTaskId', 'paramIds'],
  emits: ['selected-ok', 'update:value'],
  data() {
    return {
      list: [],
      loading: false,
      finished: false,
      selected: {},
    }
  },
  watch: {
    value(newVal) {
      if (newVal === true && this.testTaskId) {
        this.getData()
      }
    },
  },
  methods: {
    async getData() {
      const res = await mRequest.post(
        api.common.getTestTaskParams,
        qs.stringify({
          testTaskId: this.testTaskId,
          paramIds: this.paramIds,
        }),
      )

      this.list = res.obj
    },
    onOk() {
      if (!this.selected.id) {
        showDialog({ message: '请选择参数' })
        return
      }
      $emit(this, 'selected-ok', this.selected)
      this.onCancel()
    },
    onCancel() {
      $emit(this, 'update:value', false)
    },
    onSelect(row) {
      this.selected = row
    },
  },
}
</script>

<style lang="less" scoped>
.selectParams {
  .selectParams-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .selectParams-btns {
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

  .selectParams-list {
    flex: 1;
    overflow-y: auto;

    .selectParams-row {
      border-bottom: solid 1px #e2e2e2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      color: #666;

      .selectParams-content {
        padding-right: 10px;
      }

      .selectParams-radio {
        display: flex;
        align-items: center;
      }

      p {
        color: #888;
      }
    }
  }
}
</style>
