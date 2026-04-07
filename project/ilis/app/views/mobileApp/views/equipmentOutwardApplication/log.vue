<template>
  <div>
    <van-sticky>
      <MobileTitleBar
        class="left-title"
        title="日志"
        left-arrow
        @click-left="$router.go(-1)"
      ></MobileTitleBar>
    </van-sticky>
    <div class="card">
      <div class="line">
        <span class="label">关联任务：</span>
        <span>{{ detail.testTaskSn }}</span>
      </div>
      <div class="line">
        <span class="label">关联工程项目：</span>
        <span>{{
          detail.projects && detail.projects.map((i) => i.projectName).join(',')
        }}</span>
      </div>
      <div class="line">
        <span class="label">对象编号：</span>
        <span>{{ detail.egressApplySn }}</span>
      </div>
      <div class="line">
        <span class="label">借用人：</span>
        <span>{{ detail.borrowUser }}</span>
      </div>
      <div class="line">
        <span class="label">外出时间：</span>
        <span>{{ detail.egressTime }}</span>
      </div>
      <div class="device-list">
        <div
          v-for="item in computedDeviceList"
          :key="item.id"
          class="device-list-item"
        >
          <div
            class="l"
            @click.stop="
              $router.push({
                name: 'equipmentDetail',
                params: {
                  id: item.id,
                },
              })
            "
          >
            <div>
              <span class="label">设备名称：</span>
              <span>{{ item.name }}</span>
            </div>
            <div>
              <span class="label">设备编号：</span>
              <span>{{ item.equipmentSn }}</span>
            </div>
            <div>
              <span class="label">规格型号：</span>
              <span>{{ item.standard }}</span>
            </div>
          </div>
        </div>
        <div
          v-if="deviceList.length > 2"
          class="switch-btn"
          @click="isShowMore = !isShowMore"
        >
          <div v-if="!isShowMore">
            查看更多
            <van-icon name="arrow-down" />
          </div>
          <div v-else>
            收起
            <van-icon name="arrow-up" />
          </div>
        </div>
      </div>
    </div>
    <van-steps
      :active="log.length - 1"
      active-color="#0066ec"
      direction="vertical"
    >
      <van-step v-for="item in log" :key="item.id">
        <div class="card">
          <div class="line">
            <span>{{ item.createName }}</span>
            <span>{{ formatDate(item.createDate, 'YYYY-MM-DD HH:mm:ss') }}</span>
          </div>
          <div class="line">
            <span class="label">处理意见：</span>
            <span>{{ item.opinion }}</span>
          </div>
          <div class="line">
            <span class="label">内容：</span>
            <span>{{ item.content }}</span>
          </div>
        </div>
      </van-step>
    </van-steps>
  </div>
</template>

<script>
import { showDialog } from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      formatDate,
      detail: {},
      deviceList: [],
      log: [],
      isShowMore: false,
    }
  },
  computed: {
    id() {
      return this.$route.params.id
    },
    computedDeviceList() {
      if (this.isShowMore) {
        return this.deviceList
      }
      else {
        return this.deviceList.slice(0, 2)
      }
    },
  },
  created() {
    this.getDetail()
    this.getLog()
  },
  mounted() {},
  methods: {
    async getDetail() {
      const { data, code, msg, message } = await mRequest.get(
        `/rest/eq/egress/apply/detail/${this.id}`,
      )
      if (code === 20000) {
        this.detail = data
        this.deviceList = data.equipments || []
      }
      else {
        showDialog({ message: msg || message || '获取详情失败' })
      }
    },
    async getLog() {
      const { data, code } = await mRequest.get(`rest/synthesis/log`, {
        params: {
          id: this.id,
          objectType: 39,
          relationQry: false,
        },
      })
      if (code === 20000) {
        this.log = data
      }
    },
  },
}
</script>

<style lang="less" scoped>
.card {
  padding: 12px 16px;
  border-radius: 8px;
  margin: 16px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
  background-color: #fff;
  color: #151515;
  .line {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 8px;

    .label {
      display: inline-block;
      color: #888;
      width: 70px !important;
      white-space: nowrap;
      margin-right: 20px;

      & + span {
        flex: 1;
        text-align: right;
      }
    }
  }
}
.switch-btn {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 14px;
  color: #0066ec;
}
.device-list {
  background-color: #fff;
  .device-list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-radius: 9px;
    background: #ffffff;
    box-shadow: 0px 0px 10px 0px rgba(0, 102, 236, 0.06);
    margin-bottom: 8px;

    .l {
      flex: 1;
      > div {
        display: flex;
        justify-content: space-between;
        .label {
          color: #666;
          white-space: nowrap;
          & + span {
            flex: 1;
            text-align: right;
          }
        }
      }
    }

    .r {
      color: #fe6550;
      padding: 20px;
    }
  }
}
</style>
