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
        <div class="flex-1 min-h-0 overflow-y-auto">
          <div class="equipmentSearch-row">
            <div class="equipmentSearch-title">
              检查状态
            </div>
            <van-row class="equipmentSearch-status" :gutter="8">
              <van-checkbox-group
                v-model="formData.testStatus"
                direction="horizontal"
                shape="square"
              >
                <span
                  v-for="item in testStatusOption"
                  :key="item.id"
                  style="margin: 5px; display: inline-block; min-width: 140px"
                >
                  <van-checkbox :name="item.typename">{{
                    item.typename
                  }}</van-checkbox>
                </span>
              </van-checkbox-group>
              <!-- </van-col> -->
            </van-row>
          </div>

          <div class="equipmentSearch-row">
            <div class="equipmentSearch-title">
              整改状态
            </div>
            <van-row class="equipmentSearch-status" :gutter="8">
              <van-checkbox-group
                v-model="formData.reformStatus"
                direction="horizontal"
                shape="square"
              >
                <span
                  v-for="(item, index) in reformStatusOption"
                  :key="index"
                  style="margin: 5px; display: inline-block; min-width: 140px"
                >
                  <van-checkbox :name="item.typename">{{
                    item.typename
                  }}</van-checkbox>
                </span>
              </van-checkbox-group>
            </van-row>
          </div>

          <div class="equipmentSearch-row">
            <div class="equipmentSearch-title">
              检查编号
            </div>
            <input v-model.trim="formData.sn" placeholder="请输入检查编号" />
          </div>

          <div class="equipmentSearch-row">
            <div class="equipmentSearch-title">
              检查日期
            </div>
            <div class="flex gap-4 items-center">
              <input
                :value="formData.testDateStart"
                placeholder="请选择开始检查日期"
                @click="startDateVisible = true"
              />
              -
              <input
                :value="formData.testDateEnd"
                placeholder="请选择结束检查日期"
                @click="endDateVisible = true"
              />
            </div>
          </div>

          <div class="equipmentSearch-row">
            <div class="equipmentSearch-title">
              检查对象
            </div>
            <input v-model.trim="formData.testObject" placeholder="请输入" />
          </div>
          <div class="equipmentSearch-row">
            <div class="equipmentSearch-title">
              检查人
            </div>
            <input v-model.trim="formData.tester" placeholder="请输入检查人" />
          </div>

          <div class="equipmentSearch-row">
            <div class="equipmentSearch-title">
              快捷搜索
            </div>
            <van-cell center title="我创建的">
              <template #right-icon>
                <van-switch v-model="formData.iCreated" size="24" />
              </template>
            </van-cell>
            <van-cell center title="指派给我的">
              <template #right-icon>
                <van-switch v-model="formData.appointedMe" size="24" />
              </template>
            </van-cell>
          </div>
        </div>

        <div class="flex">
          <van-button block square @click="onCancel">
            重置
          </van-button>
          <van-button block type="primary" square @click="onOk">
            确定
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 开始检查日期 -->
    <MobileDateSelector
      v-model:open="startDateVisible"
      @select="(val) => { formData.testDateStart = val }"
    />

    <!-- 结束检查日期 -->
    <MobileDateSelector
      v-model:open="endDateVisible"
      @select="(val) => { formData.testDateEnd = val }"
    />
  </div>
</template>

<script>
import qs from 'qs'
import MobileDateSelector from '~/views/mobileApp/components/MobileSelector/MobileDateSelector.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
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
      startDateVisible: false,
      endDateVisible: false,
      statusData: [],
      formData: {
        testStatus: [],
        reformStatus: [],
        sn: '',
        testDateStart: '',
        testDateEnd: '',
        testObject: '',
        tester: '',
        iCreated: false,
        appointedMe: false,
      },
      testStatusOption: [],
      reformStatusOption: [],
    }
  },
  watch: {
    initalData(newVal) {
      this.formData = { ...newVal }
    },
  },
  mounted() {
    this.reformStatus()
    this.testStatus()
  },
  created() {
    this.getStatus()
  },
  methods: {
    clickLeft() {
      $emit(this, 'update:value', false)
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
    onOk() {
      $emit(this, 'callback', this.formData)
      $emit(this, 'update:value', false)
    },
    onCancel() {
      $emit(this, 'callback', {})
      $emit(this, 'update:value', false)
    },
    testStatus() {
      mRequest
        .get(
          `/systemController.do?typeGrid&typegroupid=inspection_test_status&field=id,typename,typecode,sourceFrom`,
        )
        .then((res) => {
          if (res.rows && res.rows.length) {
            this.testStatusOption = res.rows
          }
        })
    },
    reformStatus() {
      mRequest
        .get(
          `/systemController.do?typeGrid&typegroupid=inspection_reform_status&field=id,typename,typecode,sourceFrom`,
        )
        .then((res) => {
          if (res.rows && res.rows.length) {
            this.reformStatusOption = res.rows
          }
        })
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
