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
            检测日期
          </div>
          <input
            v-model="formData.testDateS"
            placeholder="请选择检测日期"
            readonly
            @click.stop="selectData('testDate')"
          />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            报告日期
          </div>
          <input
            v-model="formData.reportDateS"
            placeholder="请选择报告日期"
            readonly
            @click.stop="selectData('reportDate')"
          />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            样品名称
          </div>
          <input v-model="formData.sampleName" placeholder="请输入样品名称" />
        </div>

        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            规格型号
          </div>
          <input
            v-model="formData.sampleStandard"
            placeholder="请输入规格型号"
          />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            检测人员
          </div>
          <input v-model="formData.testPerson" placeholder="请输入检测人员" />
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
import { $emit } from '../../utils/gogocodeTransfer'

export default {
  components: {
    MobileTitleBar,
  },
  props: ['value', 'title'],
  emits: ['update:value', 'callback'],
  data() {
    return {
      statusData: [],
      formData: {
        reportDate: '',
        testDate: '',
        sampleName: '',
        sampleStandard: '',
        testPerson: '',
        reportDateS: '',
        testDateS: '',
      },
      currentDate: new Date(),
      selectDateVisible: false,
      screenVisible: false,
      // screenList: [{ name: "所有功能室", loading: true }],
      timeShow: false,
      defaultDate: null,
      countSampleRoomSave: 0,
      minDate: new Date(new Date().Format('yyyy/01/01')).add('y', -5),
      maxDate: new Date(new Date().Format('yyyy/12/31')).add('y', 1),
      dataType: '',
    }
  },
  computed: {},
  watch: {},
  created() {},
  methods: {
    // 父页面调用方法 勿删
    showData(data) {
      this.formData = { ...data }
      if (this.formData.testDate) {
        this.formData.testDateS = this.formData.testDate
          .split(',')
          .join('~')
      }
      if (this.formData.reportDate) {
        this.formData.reportDateS = this.formData.reportDate
          .split(',')
          .join('~')
      }
    },
    selectData(dataType) {
      if (this.formData[dataType]) {
        const val = this.formData[dataType].split(',')
        const start = compatibleDate(val[0])
        const end = compatibleDate(val[1])
        this.defaultDate = [start, end]
      }
      else {
        this.defaultDate = [new Date(), new Date()]
      }
      this.dataType = dataType
      this.timeShow = true
    },
    onConfirm(date) {
      const [start, end] = date
      this.timeShow = false
      const dateStart = formatDate(start)
      const dateEnd = formatDate(end)
      this.formData[`${this.dataType}S`] = [dateStart, dateEnd]
        .filter(i => i)
        .join('~')
      this.formData[this.dataType] = [dateStart, dateEnd]
        .filter(i => i)
        .join(',')
    },
    clickLeft() {
      $emit(this, 'update:value', false)
    },
    onOk() {
      const obj = { ...this.formData }
      delete obj.testDateS
      delete obj.reportDateS
      $emit(this, 'callback', obj)
      $emit(this, 'update:value', false)
    },
    onCancel() {
      this.formData = {
        reportDate: '',
        testDate: '',
        sampleName: '',
        sampleStandard: '',
        testPerson: '',
        reportDateS: '',
        testDateS: '',
      }
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
