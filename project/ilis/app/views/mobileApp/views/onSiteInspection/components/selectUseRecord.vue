<template>
  <div>
    <van-popup
      duration="0.2"
      position="right"
      :style="{ width: '100%', height: '100%' }"
      :show="value"
      class="selectUseRecord"
    >
      <div class="selectUseRecord-wrap">
        <MobileTitleBar
          left-arrow
          left-text="关闭"
          :title="title || '选择使用记录'"
          @click-left="onCancel"
        />

        <div class="selectUseRecord-list">
          <div
            v-for="item in list"
            :key="item.id"
            class="selectUseRecord-row"
            @click="onSelect(item)"
          >
            <div class="selectUseRecord-content">
              <p>任务编号：{{ item.testTaskCode }}</p>
              <p>记录编号：{{ item.testRecordCode }}</p>
            </div>
            <div class="selectUseRecord-radio">
              <van-icon
                name="success"
                size="24"
                :color="item.id === selected.id ? '#1989fa' : '#999'"
              />
            </div>
          </div>
        </div>

        <div style="height: 50px"></div>

        <div class="selectUseRecord-btns">
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
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { $emit } from '../../utils/gogocodeTransfer'

export default {
  components: {
    MobileTitleBar,
  },
  props: ['value', 'title', 'list', 'id'],
  emits: ['update:value'],
  data() {
    return {
      selected: {},
    }
  },
  methods: {
    onOk() {
      this.$router.push({
        name: 'equipmentUseRecord',
        query: { id: this.id, useid: this.selected.id },
      })
      this.onCancel()
    },
    onCancel() {
      this.selected = {}
      $emit(this, 'update:value', false)
    },
    onSelect(item) {
      this.selected = item
    },
  },
}
</script>

<style lang="less" scoped>
.selectUseRecord {
  .selectUseRecord-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .selectUseRecord-btns {
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

  .selectUseRecord-list {
    flex: 1;
    overflow-y: auto;

    .selectUseRecord-row {
      border-bottom: solid 1px #e2e2e2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      color: #666;

      .selectUseRecord-content {
        padding-right: 10px;
      }

      .selectUseRecord-radio {
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
