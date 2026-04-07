<template>
  <div>
    <van-popup
      duration="0.2"
      position="right"
      :style="{ width: '90%', height: '100%' }"
      :show="visible"
    >
      <div class="check-logs">
        <MobileTitleBar title="查看日志" />
        <div class="check-logs-list">
          <div
            v-for="item in list"
            :key="item.id"
            class="check-logs-item"
          >
            <div class="check-logs-row">
              <div class="check-logs-label">
                内容
              </div>
              <div class="check-logs-value">
                {{ item.content }}
              </div>
            </div>
            <div class="check-logs-row">
              <div class="check-logs-label">
                处理意见
              </div>
              <div class="check-logs-value">
                {{ item.opinion }}
              </div>
            </div>
            <div class="check-logs-row">
              <div class="check-logs-label">
                对象编号
              </div>
              <div class="check-logs-value">
                {{ item.objectSn }}
              </div>
            </div>
            <div class="check-logs-row">
              <div class="check-logs-label">
                处理人
              </div>
              <div class="check-logs-value">
                {{ item.createName }}
              </div>
            </div>
            <div class="check-logs-row">
              <div class="check-logs-label">
                时间
              </div>
              <div class="check-logs-value">
                {{ formatDate(item.createDate, "YYYY-MM-DD HH:mm:ss") }}
              </div>
            </div>
          </div>
          <van-empty v-if="list.length === 0" description="暂无数据" />
        </div>

        <div style="height: 50px"></div>

        <div class="check-logs-btns">
          <van-row>
            <van-col span="24">
              <van-button block square @click="onCancel">
                关闭
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
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      list: [],
      visible: false,
      formatDate,
    }
  },
  methods: {
    open(objectId, objectType) {
      this.getLogs(objectId, objectType)
      this.visible = true
    },
    async getLogs(objectId, objectType) {
      const toastLoading = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest.get(
        '/tSLogProcessController.do?getProcessLogList',
        {
          params: {
            objectId,
            objectType,
            relationQry: false,
          },
        },
      ).finally(() => {
        toastLoading.close()
      })

      this.list = res.rows
    },
    onCancel() {
      this.visible = false
      this.list = []
    },
  },
}
</script>

<style lang="less" scoped>
.check-logs {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.check-logs-btns {
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

.check-logs-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  .check-logs-item {
    border-radius: 4px;
    border: solid 1px #e2e2e2;
    padding: 8px;
    font-size: 14px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
  }

  .check-logs-row {
    margin: 4px 0;
    display: flex;
    justify-content: space-between;
  }

  .check-logs-label {
    width: 75px;
  }

  .check-logs-value {
    color: #666;
    flex: 1;
    text-align: right;
  }
}
</style>
