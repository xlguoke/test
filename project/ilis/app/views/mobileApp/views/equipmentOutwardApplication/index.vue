<template>
  <div>
    <van-sticky>
      <MobileTitleBar
        class="left-title"
        title="设备外出申请"
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
      class="p-4"
      :finished="finished"
      @load="onLoad()"
    >
      <ListCard
        v-for="item in list"
        :key="item.id"
        :rows="[
          { label: '工程项目', value: item.projectName },
          { label: '任务编号', value: item.testTaskSn },
          { label: '设备', value: item.equipmentName },
          { label: '借用人', value: item.borrowUser },
          { label: '申请时间', value: item.createDate },
        ]"
      >
        <template #title>
          <div class="flex justify-between">
            <div>
              <span v-if="item.tag === 'recall' && item.applyStatus === '12'" class="tag">退</span>
              {{ item.egressApplySn }}
            </div>
            <van-tag :color="statusMap[item.applyStatus] && statusMap[item.applyStatus].color">
              {{ statusMap[item.applyStatus] && statusMap[item.applyStatus].label }}
            </van-tag>
          </div>
        </template>
        <template #footer>
          <ListCardAction>
            <van-button
              v-if="['12'].includes(item.applyStatus)"
              size="small" @click="handleSubmit(item)"
            >
              提交
            </van-button>
            <van-button size="small" @click="handleEdit(item)">
              编辑
            </van-button>
            <van-button
              size="small" @click.stop="
                $router.push({
                  path: `/equipmentOutwardApplication/log/${item.id}`,
                })
              "
            >
              日志
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

    <CommonAudit
      v-model:value="auditVisible"
      :audit-type-id="auditTypeId"
      :default-auditers="defaultAuditers"
      @on-submit="onAuditSubmit"
    >
    </CommonAudit>

    <ActionBar>
      <van-button
        type="primary" @click="
          $router.push({
            path: `/equipmentOutwardApplication/edit`,
          })
        "
      >
        新增
      </van-button>
    </ActionBar>
  </div>
</template>

<script>
import qs from 'qs'
import { ProcessType } from '~/components/commonProcess'
import { EqGoOutAuditType } from '~/views/equipment/eqGoOutAudit'
import CommonAudit from '~/views/mobileApp/components/commonAudit.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import ListCardAction from '~/views/mobileApp/components/MobileUI/ListCardAction.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import SearchComponent from './component/Search.vue'

export default {
  components: {
    ActionBar,
    ListCardAction,
    ListCard,
    SearchComponent,
    MobileTitleBar,
    CommonAudit,
  },
  data() {
    return {
      loading: false,
      finished: false,
      list: [],
      query: {
        page: 0,
        size: 10,
      },
      quickSearchVisible: false,
      searchVisible: false,
      auditVisible: false,
      auditTypeId: '310',
      moreCondition: {},
      targetId: '',
      defaultAuditers: {},
      statusMap: {
        12: { label: '待提交', color: '#0066ec' },
        14: { label: '审批中', color: '#f59a23' },
        16: { label: '审批拒绝', color: '#d9001b' },
        20: { label: '审批通过', color: '#70b603' },
      },
    }
  },
  methods: {
    openScreen() {
      this.searchVisible = !this.searchVisible
    },
    async onLoad() {
      this.query.page += 1
      this.loading = true
      const res = await mRequest.get('/rest/eq/egress/apply/list', {
        params: {
          ...this.query,
          ...this.moreCondition,
        },
      })
      if (res.code !== 20000) {
        showFailToast(res.message || '获取列表数据失败')
        return
      }
      if (res.data.rows && res.data.rows.length > 0) {
        this.list = [...this.list, ...res.data.rows]
      }

      if (res.data.rows && res.data.rows.length === 0) {
        this.finished = true
      }
      this.loading = false

      if (this.list.length >= res.data.count) {
        this.finished = true
      }
    },
    handleEdit(item) {
      this.$router.push({
        path: `/equipmentOutwardApplication/edit/${item.id}/2`,
      })
    },
    onSearch() {
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    handleSubmit(item) {
      if (item.type === EqGoOutAuditType.TRANSITION) {
        this.auditTypeId = ProcessType.EQ_EGRESS_TRANSITION_APPLY
        this.defaultAuditers = {
          borrow_user_audit: {
            presetUserId: item.transitionUserId,
            presetUsername: item.transitionUserName,
            presetUserRealName: item.transitionUser,
          },
        }
      }
      else {
        this.auditTypeId = ProcessType.EQ_EGRESS_APPLY
        this.defaultAuditers = {}
      }
      this.targetId = item.id
      this.auditVisible = true
    },
    getMoreSearch(data) {
      this.moreCondition = { ...data }
      this.onSearch()
    },
    async onAuditSubmit(processUserTaskList, formPropertyJson) {
      const api = 'rest/eq/egress/apply/submit/audit'

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest
        .post(
          api,
          qs.stringify({
            id: this.targetId,
            presetAuditors: JSON.stringify(processUserTaskList),
            formPropertyJson: JSON.stringify(formPropertyJson),
          }),
        )
        .finally(() => {
          toast.close()
        })

      if (res.code === 20000) {
        showSuccessToast('提交成功！')
        this.auditVisible = false
        this.onSearch()
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
  font-size: 12px;
  font-weight: normal;
}
</style>
