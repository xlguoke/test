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
        <van-row class="equipmentSearch-status" :gutter="8">
          <van-col v-for="item in statusData" :key="item.type" span="8">
            <div
              class="equipmentSearch-statusBox"
              :class="`${item.type === formData.transferStatus ? 'active' : ''}`"
              @click="selectStatus(item.type)"
            >
              {{ item.typename }}
            </div>
          </van-col>
        </van-row>

        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            设备位置
          </div>
          <input v-model.trim="formData.location" placeholder="请输入位置" />
        </div>

        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            所属部门
          </div>
          <input
            v-model.trim="selDepData.text"
            placeholder="请选择部门"
            @click="selDepPopup = true"
          />
        </div>

        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            调拨开始时间
          </div>
          <input
            v-model="formData.serveDateStart"
            placeholder="选择调拨周期"
            @click="dateStartPopup = true"
          />
        </div>

        <div class="equipmentSearch-row">
          <div class="equipmentSearch-title">
            调拨结束时间
          </div>
          <input
            v-model="formData.serveDateEnd"
            placeholder="选择调拨周期"
            @click="dateEndPopup = true"
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

    <!-- 选择日期弹窗 -->
    <MobileDateSelector
      v-model:open="dateStartPopup"
      title="选择开始时间"
      @select="(val) => { formData.serveDateStart = val }"
    />

    <!-- 选择日期弹窗 -->
    <MobileDateSelector
      v-model:open="dateEndPopup"
      title="选择结束时间"
      @select="(val) => { formData.serveDateEnd = val }"
    />

    <!-- 选择部门弹窗 -->
    <van-popup v-model:show="selDepPopup" position="bottom">
      <van-tree-select
        v-model:active-id="formData.eqDepartId"
        v-model:main-active-index="activeIndex"
        :items="depTree"
        @click-item="itemClick"
      />
    </van-popup>
  </div>
</template>

<script>
import MobileDateSelector from '~/views/mobileApp/components/MobileSelector/MobileDateSelector.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { $emit } from '../../utils/gogocodeTransfer'

export default {
  components: {
    MobileDateSelector,
    MobileTitleBar,
  },
  props: ['value', 'title', 'initalData'],
  emits: ['update:value', 'callback'],
  data() {
    return {
      activeId: 1,
      activeIndex: 0,
      selDepPopup: false,
      dateStartPopup: false,
      dateEndPopup: false,
      depTree: [],
      selDepData: {},
      statusData: [
        {
          typename: '闲置中',
          type: 10,
        },
        {
          typename: '调拨中',
          type: 20,
        },
        {
          typename: '使用中',
          type: 30,
        },
        {
          typename: '已安装',
          type: 40,
        },
        {
          typename: '已移交',
          type: 50,
        },
      ],
      formData: {
        transferStatus: undefined,
        eqDepartId: '',
      },
    }
  },
  watch: {
    initalData(newVal) {
      this.formData = { ...newVal }
    },
  },
  created() {
    this.getDepTree()
  },
  methods: {
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
    clickLeft() {
      $emit(this, 'update:value', false)
    },
    selectStatus(val) {
      this.formData.transferStatus = val
      this.$forceUpdate()
    },
    onOk() {
      $emit(this, 'callback', this.formData)
      $emit(this, 'update:value', false)
    },
    onCancel() {
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
