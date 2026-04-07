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
      class="p-4"
      @load="onLoad()"
    >
      <ListCard
        v-for="item in list"
        :key="item.id"
        :rows="[
          { label: '送检数量', value: item.sendCount },
          { label: '取回数量', value: item.returnCount },
          { label: '登记时间', value: item.createDate ? dayjs(item.createDate).format('YYYY-MM-DD') : '' },
          { label: '登记人员', value: item.createName },
          { label: '检校单位', value: item.unit },
          { label: '送检日期', value: item.sendTime ? dayjs(item.sendTime).format('YYYY-MM-DD') : '' },
        ]"
      >
        <template #title>
          <div class="flex justify-between">
            <span>{{ item.batchNumber }}</span>
            <van-tag :color="statusMap[item.status] && statusMap[item.status].color">
              {{ statusMap[item.status] && statusMap[item.status].label }}
            </van-tag>
          </div>
        </template>
        <template #footer>
          <ListCardAction>
            <van-button size="small" @click.stop="openLog(item)">
              日志
            </van-button>
            <van-button
              v-if="['10', '30'].includes(item.status)"
              type="danger"
              size="small"
              @click.stop="handleDel(item)"
            >
              删除
            </van-button>
            <van-button
              v-if="['10', '30'].includes(item.status)"
              size="small"
              @click.stop="handleEdit(item)"
            >
              编辑
            </van-button>
            <van-button
              v-if="['10', '30'].includes(item.status)"
              type="primary"
              size="small"
              @click.stop="handleAudit(item)"
            >
              提交
            </van-button>
            <van-button
              v-if="['20', '40', '50'].includes(item.status)"
              plain
              size="small"
              @click.stop="handleDetail(item)"
            >
              查看
            </van-button>
          </ListCardAction>
        </template>
      </ListCard>
    </van-list>

    <SearchComponent
      v-model:value="searchVisible"
      :inital-data="moreCondition"
      @callback="getMoreSearch"
    />

    <ActionBar>
      <van-button
        type="primary" @click="
          $router.push({
            path: `/equipmentCheckSend/edit`,
          })
        "
      >
        新增
      </van-button>
    </ActionBar>

    <!-- 查看日志 -->
    <MCheckLogs ref="checkLogsRef" />

    <!-- 提交审核 -->
    <CommonAudit
      v-model:value="auditVisible"
      audit-type-id="210"
      @on-submit="onAuditSubmit"
    >
      <van-field
        v-model="submitFormData.remark"
        label="备注"
        placeholder="请输入"
        input-align="right"
        :rows="2"
        autosize
        type="textarea"
      />
    </CommonAudit>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import { showConfirmDialog, showDialog } from 'vant'
import MCheckLogs from '~/views/mobileApp/components/checkLogs.vue'
import CommonAudit from '~/views/mobileApp/components/commonAudit.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import ListCardAction from '~/views/mobileApp/components/MobileUI/ListCardAction.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import SearchComponent from './component/Search.vue'

export default {
  components: {
    ListCardAction,
    ListCard,
    SearchComponent,
    MCheckLogs,
    CommonAudit,
    MobileTitleBar,
    ActionBar,
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
      dayjs,
      quickSearchVisible: false,
      searchVisible: false,
      moreCondition: {},
      statusMap: {
        10: { label: '待送检', color: '#bfbfbf' },
        20: { label: '审批中', color: '#bfbfbf' },
        30: { label: '待送检', color: '#bfbfbf' },
        40: { label: '已送检', color: '#00a854' },
        50: { label: '已检校', color: '#00a854' },
      },
      auditVisible: false,
      submitFormData: {},
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
    handleEdit(item) {
      this.$router.push({
        path: `/equipmentCheckSend/edit`,
        query: {
          id: item.id,
          status: '2',
        },
      })
    },
    handleDetail(item) {
      this.$router.push({
        path: `/equipmentCheckSend/edit`,
        query: {
          id: item.id,
          status: '3',
        },
      })
    },
    handleDel(item) {
      showConfirmDialog({
        title: '确认要将选中的数据删除吗?',
        message: '删除后数据无法恢复',
      }).then(async () => {
        const toastLoading = showLoadingToast({
          forbidClick: true,
          duration: 0,
        })
        await mRequest
          .delete('/rest/checkSendController.do?del', {
            params: {
              id: item.id,
            },
          })
          .finally(() => {
            toastLoading.close()
          })

        showSuccessToast('删除成功')
        this.onSearch()
      })
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
    async handleAudit(row) {
      const { code, data } = await mRequest.get(`rest/auditProcessRelation/preSubmit/210/${row.id}`)
      if (code === 20000 && data && !data.haveProcess) {
        // 先预提交，若未配置流程直接审核通过
        showSuccessToast('提交成功！')
        this.onSearch()
      }
      else {
        this.submitFormData = {
          id: row.id,
          remark: '',
        }
        this.auditVisible = true
      }
    },
    async onAuditSubmit(processUserTaskList, formPropertyJson, copyToPersons) {
      const submitFormData = this.submitFormData

      const toastLoading = showLoadingToast({
        forbidClick: true,
        duration: 0,
      })
      const res = await mRequest
        .post(
          'checkSendController.do?submitPlanAudit',
          qs.stringify({
            id: this.submitFormData.id,
            presetAuditers: JSON.stringify(processUserTaskList),
            formPropertyJson: JSON.stringify({
              ...formPropertyJson,
              copyTo: copyToPersons.map(i => i.account).join(','),
            }),
            remark: submitFormData.remark,
            copyToPersons,
          }),
        )
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        showSuccessToast('提交成功！')
        this.onSearch()
        this.auditVisible = false
      }
      else {
        showDialog({ message: res.message })
      }
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
