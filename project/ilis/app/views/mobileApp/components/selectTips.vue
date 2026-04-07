<template>
  <div>
    <van-popup
      duration="0.2"
      position="right"
      :style="{ width: '100%', height: '100%' }"
      :show="value"
      class="selectTestTask"
    >
      <div class="selectTestTask-wrap">
        <MobileTitleBar
          left-arrow
          left-text="关闭"
          :title="title"
          @click-left="onCancel"
        />
        <van-search
          v-model.trim="query.quickQryParam"
          style="border-bottom: solid 1px #e2e2e2"
          :placeholder="`请输入${title}`"
          @search="onSearch"
        ></van-search>

        <div class="selectTestTask-list">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            :finished-text="finishedText"
            @load="onLoad"
          >
            <div
              v-for="(item, index) in list"
              :key="index"
              class="selectTestTask-row"
              @click="onSelect(item)"
            >
              <div class="selectTestTask-content">
                {{ item }}
              </div>
              <div class="selectTestTask-radio">
                <van-icon
                  name="checked"
                  size="28"
                  :color="selected.find((i) => i === item) ? '#1989fa' : '#999'"
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
import qs from 'qs'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    MobileTitleBar,
  },
  props: ['value', 'title', 'inputValue', 'isMultiple', 'columns'],
  emits: ['selectedOk', 'update:value'],
  data() {
    return {
      list: [],
      loading: false,
      finished: false,
      query: {
        quickQryParam: '',
        page: 0,
        rows: 10,
      },
      selected: [],
      finishedText: '没有更多了',
    }
  },
  watch: {
    inputValue() {
      this.selected = this.isMultiple ? this.inputValue : [this.inputValue]
    },
  },
  mounted() {
    this.selected = this.isMultiple ? this.inputValue : [this.inputValue]
  },
  methods: {
    async onLoad() {
      this.query.page += 1

      this.loading = true

      if (this.columns) {
        this.list = this.columns
        this.loading = false
        this.finished = true
        this.finishedText = !this.list.length ? '数据为空哦！' : '没有更多了'
        return
      }

      const res = await mRequest.post(
        api.common.getTaskWithUnitAndProject,
        qs.stringify(this.query),
      )
      if (res.rows && res.rows.length > 0) {
        this.list = [...this.list, ...res.rows]
      }

      if (res.rows && res.rows.length === 0) {
        this.finished = true
      }
      this.loading = false

      if (this.list.length >= res.totalCount) {
        this.finished = true
      }
    },
    onSearch() {
      if (this.columns) {
        this.filter()
        return
      }
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    filter() {
      const quickQryParam = this.query.quickQryParam
      if (quickQryParam) {
        this.list = this.columns.filter((i) => {
          return (
            i.toLocaleLowerCase().includes(quickQryParam.toLocaleLowerCase())
          )
        })
      }
      else {
        this.list = this.columns
      }
    },
    onOk() {
      if (this.selected.length === 0) {
        this.onCancel()
        return
      }
      this.$emit('selectedOk', this.selected)
      this.onCancel()
    },
    onCancel() {
      this.$emit('update:value', false)
    },
    onSelect(row) {
      if (this.isMultiple === true) {
        if (!this.selected.find(item => item.id === row.id)) {
          this.selected = [...this.selected, row]
        }
        else {
          this.selected = this.selected.filter(item => item.id !== row.id)
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
