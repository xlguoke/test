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
        <van-row
          v-show="filter.includes('eqStatus')"
          class="equipmentSearch-status"
          :gutter="8"
        >
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

        <div v-show="filter.includes('eqName')" class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            设备名称
          </div>
          <input v-model.trim="formData.eqName" placeholder="请输入设备名称" />
        </div>

        <div
          v-show="filter.includes('equipmentSn')"
          class="equipmentSearch-row"
        >
          <div class="equipmentSearch-title">
            设备编号
          </div>
          <input
            v-model.trim="formData.equipmentSn"
            placeholder="请输入设备编号"
          />
        </div>

        <div v-show="filter.includes('eqStandard')" class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            规格型号
          </div>
          <input
            v-model.trim="formData.eqStandard"
            placeholder="请输入规格型号"
          />
        </div>

        <div v-show="filter.includes('checkDate')" class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            检校到期
          </div>
          <!-- <input v-model.trim="formData.eqStandard" placeholder="请选择" /> -->
          <div class="checkDate_box">
            <van-radio-group
              v-model="formData.checked"
              direction="horizontal"
              @change="selectCheckDate"
            >
              <van-radio name="1">
                是
              </van-radio>
              <van-radio name="2">
                否
              </van-radio>
              <van-radio name="3">
                全部
              </van-radio>
            </van-radio-group>
          </div>
        </div>

        <div
          v-show="filter.includes('quickQryParam')"
          class="equipmentSearch-row"
        >
          <div class="equipmentSearch-title">
            设备名称、编号、规格型号
          </div>
          <input v-model.trim="formData.quickQryParam" placeholder="请输入" />
        </div>

        <div v-show="filter.includes('eqDepartId')" class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            所属部门
          </div>
          <input
            v-model.trim="selDepData.text"
            placeholder="请选择部门"
            @click="selDepPopup = true"
          />
        </div>

        <div
          v-show="filter.includes('eqLaboratoryName')"
          class="equipmentSearch-row"
        >
          <div class="equipmentSearch-title">
            所属功能室
          </div>
          <input
            v-model.trim="selLabData.name"
            placeholder="请选择功能室"
            @click="selLabPopup = true"
          />
        </div>

        <div
          v-show="filter.includes('nextCheckDate')"
          class="equipmentSearch-row"
        >
          <div class="equipmentSearch-title">
            下次检校日期
          </div>
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <input
              v-model.trim="formData.nextCheckDateBegin"
              style="width: 47%"
              readonly
              placeholder="请输入开始时间"
              @click="showStartTime = true"
            />
            -
            <input
              v-model.trim="formData.nextCheckDateEnd"
              style="width: 47%"
              readonly
              placeholder="请输入结束时间"
              @click="showEndTime = true"
            />
          </div>
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

    <!-- 选择部门弹窗 -->
    <van-popup v-model:show="selDepPopup" position="bottom">
      <van-tree-select
        v-model:active-id="formData.departmentId"
        v-model:main-active-index="activeIndex"
        :items="depTree"
        @click-item="itemClick"
      />
    </van-popup>

    <!-- 选择功能室弹窗 -->
    <MobileLabSelector
      v-model:open="selLabPopup"
      :selected-rows="[selLabData]"
      @select="getLab"
    />

    <!-- 检校时间选择 -->
    <MobileDateSelector
      v-model:open="showStartTime"
      title="选择开始时间"
      @select="(val) => { formData.nextCheckDateBegin = val }"
    />

    <!-- 检校时间选择 -->
    <MobileDateSelector
      v-model:open="showEndTime"
      title="选择结束时间"
      @select="(val) => { formData.nextCheckDateEnd = val }"
    />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import MobileDateSelector from '~/views/mobileApp/components/MobileSelector/MobileDateSelector.vue'
import MobileLabSelector from '~/views/mobileApp/components/MobileSelector/MobileLabSelector.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { $emit } from '../../utils/gogocodeTransfer'

export default {
  components: {
    MobileTitleBar,
    MobileDateSelector,
    MobileLabSelector,
  },
  props: {
    value: Boolean,
    title: String,
    initalData: Object,
    filter: {
      type: Array,
      default() {
        return ['eqStatus', 'eqName', 'equipmentSn', 'eqStandard', 'checkDate']
      },
    },
  },
  emits: ['update:value', 'callback'],
  data() {
    return {
      statusData: [],
      activeIndex: 0,
      selDepPopup: false,
      selDepData: {},
      selLabPopup: false,
      selLabData: {},
      depTree: [],
      showStartTime: false,
      showEndTime: false,
      formData: {
        eqStatus: undefined,
        checked: undefined,
      },
      checked: '3',
    }
  },
  watch: {
    initalData: {
      deep: true,

      handler(newVal) {
        this.formData = {
          ...newVal,
          checked: newVal.checked || '3',
        }
      },

      immediate: true,
    },
  },
  created() {
    this.getStatus()
    this.getDepTree()
  },
  methods: {
    clickLeft() {
      $emit(this, 'update:value', false)
    },
    formatter(type, val) {
      if (type === 'year') {
        return `${val}年`
      }
      else if (type === 'month') {
        return `${val}月`
      }
      else if (type === 'day') {
        return `${val}日`
      }
      return val
    },
    selectCheckDate(val) {
      this.formData.checked = val
      if (val === '1') {
        // 已经到期
        delete this.formData.nextCheckDateBegin
        this.formData.nextCheckDateEnd = dayjs(new Date())
          .subtract(1, 'day')
          .format('YYYY-MM-DD')
      }
      else if (val === '2') {
        // 还未到期
        delete this.formData.nextCheckDateEnd
        this.formData.nextCheckDateBegin = dayjs(new Date()).format(
          'YYYY-MM-DD',
        )
      }
      else {
        delete this.formData.nextCheckDateEnd
        delete this.formData.nextCheckDateBegin
      }
    },
    getLab(data) {
      const [item] = data
      this.selLabData = item
      this.formData.eqLaboratoryName = item.name
    },
    itemClick(v) {
      this.selDepData = v
      this.formData.eqDepartId = v.id
    },

    getDepTree() {
      mRequest({
        method: 'POST',
        url: `orgController.do?getOrgComboTree`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.length) {
          this.depTree = res
        }
      })
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
      this.selLabData = {}
      this.selDepData = {}
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
  .checkDate_box {
    display: flex;
    align-items: center;
    background: #e8f4ff;
    width: 100%;
    height: 32px;
    border: 0;
    border-radius: 3px;
    padding: 0 8px;
    margin-top: 8px;
  }
}
</style>
