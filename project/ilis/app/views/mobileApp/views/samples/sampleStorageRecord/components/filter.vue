<template>
  <div>
    <van-popup
      duration="0.2"
      position="right"
      :style="{ width: '80%', height: '100%' }"
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
            入库日期
          </div>
          <input
            v-model="formData.time"
            placeholder="请选择入库日期"
            readonly
            @click.stop="selectData"
          />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            存放位置
          </div>
          <input v-model="formData.saveSite" placeholder="请输入存放位置" />
        </div>

        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            入库操作人
          </div>
          <input v-model="formData.operator" placeholder="请输入入库操作人" />
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
    <van-calendar
      v-model:show="timeShow"
      type="range"
      color="#1989fa"
      switch-mode="year-month"
      :default-date="defaultDate"
      allow-same-day
      @confirm="onConfirm"
    />
  </div>
</template>

<script>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { compatibleDate, formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { $emit } from '../../../utils/gogocodeTransfer'

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
        time: '',
        dateStart: '',
        dateEnd: '',
        saveSite: '',
        operator: '',
      },
      currentDate: new Date(),
      selectDateVisible: false,
      timeShow: false,
      defaultDate: null,
      countSampleRoomSave: 0,
    }
  },
  computed: {},
  watch: {
    initalData: {
      handler(val) {
        this.handleInit(val)
      },
      deep: true,
    },
  },
  created() {
    this.handleInit(this.initalData)
  },
  methods: {
    handleInit(val) {
      this.formData = { ...val }
      const start = compatibleDate(val.dateStart)
      const end = compatibleDate(val.dateEnd)
      this.defaultDate = [start, end]
      const arr = this.defaultDate.filter(i => i).map(i => formatDate(i))
      this.formData.time = arr.join('~')
    },
    selectData() {
      this.timeShow = true
    },
    onConfirm(date) {
      const [start, end] = date
      this.timeShow = false
      this.formData.dateStart = formatDate(start)
      this.formData.dateEnd = formatDate(end)
      this.formData.time = [this.formData.dateStart, this.formData.dateEnd]
        .filter(i => i)
        .join('~')
    },
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
      this.formData = {
        time: '',
        dateStart: '',
        dateEnd: '',
        saveSite: '',
        operator: '',
      }
      $emit(this, 'callback', this.formData)
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
