<template>
  <!-- 筛选界面 -->
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
          left-text="返回"
          :title="title || '数据筛选'"
          @click-left="clickLeft"
        />
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            外出状态
          </div>
          <input
            v-model="formData.egressStatus"
            placeholder="请选择外出状态"
            readonly
            @click.stop="selectStatus"
          />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            归还时间
          </div>
          <input
            v-model="formData.returnTime"
            placeholder="请选择归还时间"
            readonly
            @click.stop="
              selectData('returnTime', 'returnTimeBegin', 'returnTimeEnd')
            "
          />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            外出时间
          </div>
          <input
            v-model="formData.egressTime"
            placeholder="请选择外出时间"
            readonly
            @click.stop="
              selectData('egressTime', 'egressTimeBegin', 'egressTimeEnd')
            "
          />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            借用人
          </div>
          <input v-model="formData.borrowUser" placeholder="请选择借用人" />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            工程项目
          </div>
          <input
            v-model="formData.consignProject"
            placeholder="请选择工程项目"
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
    <van-action-sheet
      v-model:show="screenVisible"
      :actions="screenList"
      :round="false"
      @select="onSelectStatus"
    />
    <van-calendar
      v-model:show="timeShow"
      type="range"
      color="#1989fa"
      :min-date="minDate"
      :max-date="maxDate"
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
  emits: ['callback', 'update:value'],
  data() {
    return {
      formData: {
        egressStatus: '全部',
      },
      timeShow: false,
      defaultDate: [],
      timeObj: {},
      screenVisible: false,
      screenList: [
        { name: '全部', status: '', color: '#40a9ff' },
        { name: '外出中', status: '40,50,60,70,80,90' },
        { name: '已归还', status: '10' }, // todo
      ],
      minDate: new Date(new Date().Format('yyyy/01/01')).add('y', -5),
      maxDate: new Date(new Date().Format('yyyy/12/31')).add('y', 1),
    }
  },
  watch: {
    initalData: {
      handler(val) {
        this.handleInit(val)
      },
      deep: true,
      // immediate: true,
    },
  },
  created() {},
  methods: {
    handleInit(val) {
      this.formData = { ...val }
      this.screenList = this.screenList.map(item => ({
        ...item,
        color: '',
      }))
      if (this.formData.egressStatus === '10,40,50,60,70,80,90') {
        this.screenList[0].color = '#40a9ff'
        this.formData.egressStatus = '全部'
      }
      else if (this.formData.egressStatus === '10') {
        this.screenList[2].color = '#40a9ff'
        this.formData.egressStatus = '已归还'
      }
      else {
        this.screenList[1].color = '#40a9ff'
        this.formData.egressStatus = '外出中'
      }
    },
    onCancel() {
      this.formData = {
        egressStatus: '10,40,50,60,70,80,90',
      }
      this.screenList = this.screenList.map(item => ({
        ...item,
        color: item.name === '全部' ? '#40a9ff' : '',
      }))
      $emit(this, 'callback', this.formData)
      $emit(this, 'update:value', false)
    },
    onOk() {
      $emit(this, 'callback', this.formData)
      $emit(this, 'update:value', false)
    },
    onSelectStatus(row, index) {
      this.screenList = this.screenList.map(item => ({
        ...item,
        color: '',
      }))
      this.screenList[index].color = '#40a9ff'
      this.formData.egressStatus = row.name
      this.screenVisible = false
    },
    clickLeft() {
      $emit(this, 'update:value', false)
    },
    selectStatus() {
      this.screenVisible = true
    },
    selectData(str, start, end) {
      this.timeObj = {
        str,
        start,
        end,
      } // 当前处理的时间
      const startTime = compatibleDate(this.formData[start] || new Date())
      const endTime = compatibleDate(this.formData[end] || new Date())
      this.defaultDate = [startTime, endTime]
      this.timeShow = true
    },
    onConfirm(date) {
      const [start, end] = date
      if (this.timeObj) {
        this.formData[this.timeObj.start] = formatDate(start)
        this.formData[this.timeObj.end] = formatDate(end)
        this.formData[this.timeObj.str] = [
          this.formData[this.timeObj.start],
          this.formData[this.timeObj.end],
        ]
          .filter(i => i)
          .join('~')
      }
      this.timeShow = false
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
