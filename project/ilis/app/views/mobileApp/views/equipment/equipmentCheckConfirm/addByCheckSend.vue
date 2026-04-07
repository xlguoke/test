<template>
  <div>
    <van-sticky>
      <MobileTitleBar
        class="left-title"
        title="设备送检登记"
        left-arrow
        @click-left="$router.go(-1)"
      >
        <template #right>
          <span @click.stop="openScreen()">筛选 </span>
        </template>
      </MobileTitleBar>
    </van-sticky>
    <van-list
      v-model:loading="loading"
      finished-text="没有更多了"
      :finished="finished"
      @load="onLoad()"
    >
      <div class="list">
        <div
          v-for="item in list"
          :key="item.id"
          is-link
          class="card"
          @click="
            $router.push({
              name: 'selectCheckSendDevice',
              query: { sendId: item.id },
            })
          "
        >
          <div class="title">
            <div class="name">
              送检批号：{{ item.batchNumber }}
            </div>
          </div>
          <div
            class="line"
            style="
              border-bottom: 1px solid #e5e5e5;
              color: #d7d7d7;
              padding-bottom: 8px;
              margin-bottom: 8px;
              justify-content: space-between;
            "
          ></div>
          <van-row gutter="20">
            <van-col span="24">
              <div class="line">
                <span class="label">检校单位：</span>
                <span>{{ item.unit }}</span>
              </div>
            </van-col>
            <van-col span="24">
              <div class="line">
                <span class="label">送检日期：</span>
                <span>{{ formatDate(item.sendTime, 'YYYY-MM-DD') }}</span>
              </div>
            </van-col>
          </van-row>
        </div>
      </div>
    </van-list>

    <SearchComponent
      v-model:value="searchVisible"
      :inital-data="moreCondition"
      @callback="getMoreSearch"
    />
  </div>
</template>

<script>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import SearchComponent from '~/views/mobileApp/views/equipmentCheckSend/component/Search.vue'

export default {
  components: {
    SearchComponent,
    MobileTitleBar,
  },
  data() {
    return {
      loading: false,
      finished: false,
      list: [],
      query: {
        page: 0,
        rows: 10,
      },
      formatDate,
      quickSearchVisible: false,
      selectEquipmentVisible: false,
      searchVisible: false,
      moreCondition: {},
    }
  },
  methods: {
    openScreen() {
      this.searchVisible = !this.searchVisible
    },
    openLog(item) {
      this.$refs.checkLogsRef.open(item.id, 286)
    },
    async onLoad() {
      this.query.page += 1
      this.loading = true
      const res = await mRequest.get('/rest/checkSendController.do?datagrid', {
        params: {
          ...this.query,
          ...this.moreCondition,
          status: 40,
        },
      })
      if (res.code === 20010) {
        showFailToast(res.message || '获取列表数据失败')
        return
      }

      if (res.rows && res.rows.length > 0) {
        this.list = [...this.list, ...res.rows]
      }

      if (res.rows && res.rows.length === 0) {
        this.finished = true
      }
      this.loading = false

      if (this.list.length >= res.total) {
        this.finished = true
      }
    },

    onSearch() {
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    getMoreSearch(data) {
      this.moreCondition = { ...data }
      this.onSearch()
    },
  },
}
</script>

<style lang="less" scoped>
.list {
  padding: 12px;
  .card {
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 12px;
    margin-bottom: 16px;
    background: #fff;

    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .name {
        flex: 1;
        font-weight: 700;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .status {
        font-size: 12px !important;
        color: #fff;
        border-radius: 4px;
        padding: 0px 8px;
        background-color: #555555;
      }
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
.tag {
  width: 18px;
  height: 18px;
  border-radius: 2px;
  background: #fe6550;
  color: #fff;
  padding: 0 2px;
  font-size: 14px;
  font-weight: normal;
}
</style>
