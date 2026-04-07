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
            {{ term('样品名称') }}
          </div>
          <input
            v-model="formData.testObjectName"
            :placeholder="term('请输入样品名称')"
          />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            样品编号
          </div>
          <input
            v-model="formData.testObjectCode"
            placeholder="请输入样品编号"
          />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            委托编号
          </div>
          <input v-model="formData.consignCode" placeholder="请输入委托编号" />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            任务编号
          </div>
          <input v-model="formData.testTaskCode" placeholder="请输入任务编号" />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            记录编号
          </div>
          <input v-model="formData.recordCode" placeholder="请输入记录编号" />
        </div>
        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            任务状态
          </div>
          <van-radio-group
            v-model="formData.status"
            direction="horizontal"
          >
            <van-radio name="">
              全部
            </van-radio>
            <van-radio name="20">
              试验检测中
            </van-radio>
            <van-radio name="30">
              复核确认中
            </van-radio>
            <van-radio name="40">
              已提交正式报告
            </van-radio>
          </van-radio-group>
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
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { useAppIndustryHooks } from '~/views/mobileApp/hooks/useAppIndustryHooks'
import { $emit } from '../../utils/gogocodeTransfer'

export default {
  components: {
    MobileTitleBar,
  },
  props: ['value', 'title'],
  emits: ['update:value', 'callback'],
  setup() {
    const { term } = useAppIndustryHooks()

    return { term }
  },
  data() {
    return {
      formData: {
        reportDate: '',
        testDate: '',
        sampleName: '',
        sampleStandard: '',
        testPerson: '',
        reportDateS: '',
        testDateS: '',
      },
    }
  },
  computed: {},
  watch: {},
  created() {},
  methods: {
    // 父页面调用方法 勿删
    showData(data) {
      this.formData = { ...data }
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
:deep(.van-radio--horizontal) {
  margin-top: 10px;
}
</style>
