<template>
  <div>
    <van-sticky>
      <MobileTitleBar
        class="left-title"
        title="选择设备"
        left-arrow
        @click-left="$router.go(-1)"
      >
      </MobileTitleBar>
    </van-sticky>
    <div class="selectEquipment-list">
      <div
        v-for="item in list"
        :key="item.id"
        class="eq-box"
        @click="onSelect(item)"
      >
        <div class="selectEquipment-row">
          <div class="selectEquipment-content">
            <b
              @click.stop="
                $router.push({
                  name: 'equipmentDetail',
                  params: {
                    id: item.equipmentId,
                  },
                })
              "
            >{{ item.name }}</b>
            <p>设备编号：{{ item.equipmentSn }}</p>
            <p>规格型号：{{ item.standard }}</p>
          </div>
          <div class="selectEquipment-radio">
            <van-icon
              name="checked"
              size="28"
              :color="selected.id === item.id ? '#1989fa' : '#999'"
            />
          </div>
        </div>
      </div>
    </div>
    <div style="height: 100px"></div>
    <div class="footer">
      <van-button type="primary" style="flex: 1" @click="submit">
        确认
      </van-button>
      <van-button style="flex: 1" @click="$router.back()">
        取消
      </van-button>
    </div>
  </div>
</template>

<script>
import { showDialog } from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: { MobileTitleBar },
  data() {
    return {
      loading: false,
      finished: false,
      list: [],
      selected: {},
      query: {
        page: 0,
        rows: 10,
      },
      formatDate,
    }
  },

  created() {
    this.onLoad()
  },
  methods: {
    openScreen() {
      this.searchVisible = !this.searchVisible
    },
    openLog(item) {
      this.$refs.checkLogsRef.open(item.id, 286)
    },
    async onLoad() {
      this.loading = true
      const res = await mRequest
        .get('/rest/checkSendController.do?datagridSendDetail', {
          params: {
            sendId: this.$route.query.sendId,
          },
        })
        .finally(() => {
          this.loading = false
        })
      if (res.code === 20010) {
        showFailToast(res.message || '获取列表数据失败')
        return
      }
      this.list = res.rows
    },
    submit() {
      if (!this.selected.id) {
        showDialog({ message: '请选择设备！' })
        return
      }
      localStorage.setItem(
        'equipmentCheckConfirmEQ',
        JSON.stringify({
          id: this.selected.equipmentId,
          name: this.selected.name,
          equipmentSn: this.selected.equipmentSn,
          standard: this.selected.standard,
        }),
      )
      this.$router.push({
        name: 'equipmentCheckConfirmAdd',
        query: {
          byCheckSend: 1,
        },
      })
    },

    onSelect(row) {
      this.selected = row
    },
  },
}
</script>

<style lang="less" scoped>
.selectEquipment-list {
  flex: 1;
  overflow-y: auto;
  .eq-box {
    border: solid 1px #e2e2e2;
    margin: 10px;
  }

  .sub-eq {
    padding: 10px 0 10px 40px;
    border-top: 1px solid #e2e2e2;

    .selectEquipment-row {
      border-radius: 8px;
      border: solid 1px #e2e2e2;
    }
  }

  .selectEquipment-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 15px;
    color: #666;

    .selectEquipment-content {
      padding-right: 10px;
    }

    .selectEquipment-radio {
      display: flex;
      align-items: center;
    }

    p {
      color: #888;
      word-break: break-all;
    }
  }
}
.line {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}
.label {
  display: inline-block;
  color: #888;
  width: 70px !important;
  text-align: right;
  white-space: nowrap;
  margin-right: 20px;
  & + span {
    flex: 1;
    text-align: right;
  }
}
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background-color: #fff;
  display: flex;
  gap: 12px;
}
</style>
