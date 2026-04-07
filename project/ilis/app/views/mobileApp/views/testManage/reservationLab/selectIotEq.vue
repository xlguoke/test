<template>
  <div>
    <van-popup
      duration="0.2"
      position="right"
      :style="{ width: '90%', height: '100%' }"
      :show="value"
      class="selectTestTask"
    >
      <div class="selectTestTask-wrap">
        <MobileTitleBar :title="title || '选择调养箱'" />
        <div class="selectTestTask-list">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <div
              v-for="item in list"
              :key="item.to.id"
              class="selectTestTask-row"
              @click="onSelect(item)"
            >
              <div class="selectTestTask-content">
                <p style="color: #444">
                  {{ item.toName }}
                </p>
              </div>
              <div class="selectTestTask-radio">
                <van-icon
                  name="checked"
                  size="28"
                  :color="
                    selected.find((i) => i.to.id === item.to.id)
                      ? '#1989fa'
                      : '#999'
                  "
                />
              </div>
            </div>
          </van-list>
        </div>

        <div style="height: 50px"></div>

        <div class="selectTestTask-btns">
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
import { showDialog } from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { $emit } from '../../utils/gogocodeTransfer'

export default {
  components: {
    MobileTitleBar,
  },
  props: ['value', 'title', 'isMultiple', 'initSelected', 'iotEqId'],
  emits: ['selected-ok', 'update:value'],
  data() {
    return {
      list: [],
      loading: false,
      finished: false,
      selected: [],
    }
  },
  watch: {
    initSelected(val) {
      if (val) {
        this.selected = [...val]
      }
    },
  },
  methods: {
    async onLoad() {
      this.loading = true
      const res = await mRequest.get(`rest/eq/iots/env/${this.iotEqId}`)
      this.loading = false
      this.finished = true
      this.list = res.data.filter(i => i.type === '调养箱')
    },
    onSearch() {
      this.finished = false
      this.list = []
      this.onLoad()
    },
    onOk() {
      if (this.selected.length === 0) {
        showDialog({ message: '请选择数据' })
        return
      }
      $emit(this, 'selected-ok', this.selected)
      this.onCancel()
    },
    onCancel() {
      $emit(this, 'update:value', false)
    },
    onSelect(row) {
      if (this.isMultiple === true) {
        if (!this.selected.find(item => item.to.id === row.to.id)) {
          this.selected = [...this.selected, row]
        }
        else {
          this.selected = this.selected.filter(
            item => item.to.id !== row.to.id,
          )
        }
      }
      else {
        this.selected = [row]
      }
    },
  },
}
</script>

<style lang="less" scoped>
.selectTestTask {
  .selectTestTask-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .selectTestTask-btns {
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

  .selectTestTask-list {
    flex: 1;
    overflow-y: auto;

    .selectTestTask-row {
      border-bottom: solid 1px #e2e2e2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 15px;
      color: #666;

      .selectTestTask-content {
        padding-right: 10px;
      }

      .selectTestTask-radio {
        display: flex;
        align-items: center;
      }

      p {
        color: #888;
        word-break: break-all;
      }
    }
  }
}
</style>
