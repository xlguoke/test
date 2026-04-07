<template>
  <div>
    <van-popup
      duration="0.2"
      position="right"
      :style="{ width: '100%', height: '100%' }"
      :show="value"
      class="selectParams"
    >
      <div class="selectParams-wrap">
        <MobileTitleBar
          left-arrow
          left-text="关闭"
          title="选择人员"
          @click-left="onCancel"
        />

        <div class="selectParams-list">
          <div
            v-for="item in list"
            :key="item.id"
            class="selectParams-row"
            @click="onSelect(item)"
          >
            <div class="selectParams-content">
              {{ item.name }}
              <span v-if="item.typeName" style="color: #999; font-size: 12px">({{ item.typeName }})</span>
            </div>
            <div class="selectParams-radio">
              <van-icon
                name="success"
                size="24"
                :color="selectedIdList.includes(item.id) ? '#1989fa' : '#999'"
              />
            </div>
          </div>
        </div>

        <div style="height: 50px"></div>

        <div class="selectParams-btns">
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
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { $emit } from '../../../utils/gogocodeTransfer'

export default {
  components: {
    MobileTitleBar,
  },
  props: ['value', 'testTaskId', 'equipmentIds'],
  emits: ['selected-ok', 'update:value'],
  data() {
    return {
      list: [],
      loading: false,
      finished: false,
      selectedList: [],
      selectedIdList: [],
    }
  },
  watch: {
    value(newVal) {
      if (newVal === true && this.testTaskId) {
        this.getData()
      }

      if (newVal === false) {
        this.onCancel()
      }
    },
  },
  methods: {
    async onCheckEqAuth(cb) {
      const res = await mRequest.get('rest/eq/auth/sys/user', {
        params: {
          ids: this.equipmentIds,
        },
      })

      const data = res.data
      const auth = data.auth
      const authUserList = data.authUserList || []

      cb(auth, authUserList)
    },
    async getData() {
      const typeEnum = {
        0: '试验检测人',
        1: '数据复核人',
        2: '报告编辑人',
        3: '报告审核人',
        4: '报告批准人',
        5: '任务记录人',
        6: '任务协助人',
        7: '项目负责人',
      }

      this.onCheckEqAuth(async (auth, authUserList) => {
        if (auth && !authUserList.length) {
          this.list = []
          return
        }

        const res = await mRequest.get(
          `/rest/task/person/by-task/${this.testTaskId}`,
        )
        if (res.code !== 20010) {
          const list = res.data
            .map(i => ({
              ...i,
              typeName: typeEnum[i.type],
            }))
            .filter(i => i.type === '0')

          if (auth === true) {
            this.list = list.filter(i => authUserList.includes(i.userId))
          }
          else {
            this.list = list
          }
        }
      })
    },
    onOk() {
      $emit(this, 'selected-ok', this.selectedList)
      this.onCancel()
    },
    onCancel() {
      $emit(this, 'update:value', false)
      this.selectedIdList = []
      this.selectedList = []
      this.list = []
    },
    onSelect(row) {
      if (!this.selectedIdList.includes(row.id)) {
        this.selectedIdList.push(row.id)
        this.selectedList.push(row)
      }
      else {
        this.selectedIdList = this.selectedIdList.filter(i => i !== row.id)
        this.selectedList = this.selectedList.filter(i => i.id !== row.id)
      }
    },
  },
}
</script>

<style lang="less" scoped>
.selectParams {
  .selectParams-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .selectParams-btns {
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

  .selectParams-list {
    flex: 1;
    overflow-y: auto;

    .selectParams-row {
      border-bottom: solid 1px #e2e2e2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      color: #666;

      .selectParams-content {
        padding-right: 10px;
      }

      .selectParams-radio {
        display: flex;
        align-items: center;
      }

      p {
        color: #888;
      }
    }
  }
}
</style>
