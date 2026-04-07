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
          left-text="返回"
          :title="title || '数据筛选'"
          @click-left="clickLeft"
        />
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            到期时间
          </div>
          <input
            v-model="formData.dueDate"
            readonly
            placeholder="请选择到期时间"
            @click.stop="selectStatus"
          />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            是否已检测
          </div>
          <input
            v-model="formData.tested"
            readonly
            placeholder="请选择是否已检测"
            @click.stop="selectTested"
          />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            制样人
          </div>
          <input v-model="formData.producer" placeholder="请输入制样人" />
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
      @select="onSortSelect"
    />
    <van-action-sheet
      v-model:show="testedVisible"
      :actions="testedList"
      :round="false"
      @select="onTestedSelect"
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

function FormData() {
  return {
    producer: '',
    dueDate: '',
    tested: '全部',
    planTestDateStart: '',
    planTestDateEnd: '',
  }
}
export default {
  components: {
    MobileTitleBar,
  },
  props: ['value', 'title', 'initalData'],
  emits: ['update:value', 'callback'],
  data() {
    return {
      statusData: [],
      formData: new FormData(),
      currentDate: new Date(),
      timeObj: null,
      selectDateVisible: false,
      screenVisible: false,
      testedVisible: false,
      screenList: [
        { name: '不限' },
        { name: '今日到期', color: '#40a9ff' },
        { name: '三日内到期' },
      ],
      testedList: [
        { name: '全部', color: '#40a9ff' },
        { name: '已检测' },
        { name: '未检测' },
      ],
      timeShow: false,
      defaultDate: null,
      countSampleRoomSave: 0,
      minDate: new Date(new Date().Format('yyyy/01/01')).add('y', -5),
      maxDate: new Date(new Date().Format('yyyy/12/31')).add('y', 1),
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
    selectStatus() {
      this.screenVisible = true
    },
    selectTested() {
      this.testedVisible = true
    },
    // 选择排序
    onSortSelect(row, index) {
      this.screenList = this.screenList.map(item => ({
        ...item,
        color: '',
      }))
      this.screenList[index].color = '#40a9ff'
      this.formData.dueDate = row.name
      this.screenVisible = false
    },
    // 选择排序
    onTestedSelect(row, index) {
      this.testedList = this.testedList.map(item => ({
        ...item,
        color: '',
      }))
      this.testedList[index].color = '#40a9ff'
      this.formData.tested = row.name
      this.testedVisible = false
    },
    handleInit(val) {
      this.formData = { ...val }
      if (val.tested === 1 || val.tested === '已检测') {
        this.formData.tested = '已检测'
      }
      else if (val.tested === 0 || val.tested === '未检测') {
        this.formData.tested = '未检测'
      }
      else {
        this.formData.tested = '全部'
      }
      // const start = compatibleDate(val.dateStart);
      // const end = compatibleDate(val.dateEnd);
      // this.defaultDate = [start, end];
      // let arr = this.defaultDate.filter((i) => i).map((i) => formatDate(i));
      // this.formData.time = arr.join("~");
    },
    selectData(str, start, end) {
      this.timeObj = {
        str,
        start,
        end,
      }
      const startTime = compatibleDate(this.formData[start])
      const endTime = compatibleDate(this.formData[end])
      this.defaultDate = [startTime, endTime]
      this.timeShow = true
    },
    onConfirm(date) {
      const [start, end] = date
      this.timeShow = false
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
    },
    clickLeft() {
      $emit(this, 'update:value', false)
    },
    onOk() {
      $emit(this, 'callback', this.formData)
      $emit(this, 'update:value', false)
    },
    onCancel() {
      this.formData = new FormData()
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
