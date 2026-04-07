<template>
  <div class="audit-manage">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
      <van-tabs
        v-model:active="activeKey"
        color="#154bd0"
        title-active-color="#154bd0"
      >
        <van-tab title="待我审核" :name="10" :disabled="loading"></van-tab>
        <van-tab title="我已审批" :name="20" :disabled="loading"></van-tab>
        <van-tab title="我已发起" :name="30" :disabled="loading"></van-tab>
        <van-tab title="抄送我的" :name="40" :disabled="loading"></van-tab>
      </van-tabs>
      <van-search
        v-model.trim="query.quickQry"
        placeholder="请输入流程标题/摘要/发起人"
        @search="onSearch"
      />
    </van-sticky>

    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      class="p-4"
      @load="onLoad"
    >
      <ListCard
        v-for="item in list"
        :key="item.id"
        :rows="[
          { label: '流程类型', value: item.processTypeName },
          { label: '流程状态', value: item.taskName },
          { label: '发起人员', value: item.processStartUserName },
          { label: '发起时间', value: formatDate(item.processStartTime, 'YYYY-MM-DD') },
        ]"
        :title="item.processName"
      >
        <template #footer>
          <ListCardAction>
            <van-button
              v-if="activeKey === 30 && item.taskDefKey === 'submit_application'"
              size="small"
              type="primary"
              @click="submit(item)"
            >
              提交
            </van-button>
            <van-button
              v-if="activeKey === 30 && item.taskDefKey === 'submit_application'"
              size="small"
              type="danger"
              @click="deleteItem(item.processInstanceId)"
            >
              删除
            </van-button>
            <van-button
              v-if="activeKey === 10"
              size="small"
              type="primary"
              @click="goAudit(item)"
            >
              审批
            </van-button>
            <van-button
              size="small"
              @click="onSelect(item)"
            >
              详情
            </van-button>
          </ListCardAction>
        </template>
      </ListCard>
    </van-list>

    <ActionBar v-if="activeKey === 30">
      <van-button type="primary" block @click="addAudit">
        发起审批
      </van-button>
    </ActionBar>

    <van-dialog
      v-model:show="showDelete"
      title="确认删除？"
      show-cancel-button
      @confirm="confirmDelete"
      @cancel="showDelete = false"
    >
      <div class="p-4">
        <textarea
          v-model="deleteReason"
          class="del-textarea"
          rows="3"
          placeholder="请输入删除原因"
        ></textarea>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import {
  showLoadingToast,
  showNotify,
} from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import ListCardAction from '~/views/mobileApp/components/MobileUI/ListCardAction.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'

export default {
  name: 'auditManage',
  components: {
    ActionBar,
    ListCardAction,
    ListCard,
    MobileTitleBar,
  },
  beforeRouteEnter(to, from, next) {
    if (from.name === 'menuPage') {
      const pageState = useAppPageStateStore().getPage('auditManage')
      pageState.scrollTo = 0
      pageState.resetPage = true
    }
    next()
  },
  data() {
    return {
      formatDate,
      list: [],
      activeKey: 10,
      searchVisible: false,
      sortVisible: false,
      showDelete: false,
      query: {
        quickQry: '',
        page: 0,
        size: 10,
      },
      finished: false,
      loading: false,
      auditCount: '',
      clickMoreObj: {},
      sourceModule: 2,
      hasBackBtn: false,
      hasNoticeBtn: false,
      hasPassBtn: false,
      deleteReason: '',
      deleteId: '',
    }
  },
  watch: {
    activeKey() {
      this.onSearch()
    },
  },
  activated() {
    const pageState = useAppPageStateStore().getPage('auditManage')
    const { scrollTop, resetPage } = pageState

    window.scrollTo(0, scrollTop || 0)

    if (resetPage === true || resetPage === undefined || resetPage === null) {
      this.resetPage()
      pageState.resetPage = false
    }
  },
  methods: {
    resetPage() {
      window.scrollTo(0, 0)
      this.query = {
        quickQry: '',
        page: 0,
        size: 10,
      }

      this.searchVisible = false
      this.sortVisible = false
      this.count = ''

      if (this.activeKey === 0) {
        this.onSearch()
      }
      else {
        this.activeKey = 0
      }
    },
    onClick() {
      this.list = []
      this.query.page = 0
      this.onLoad()
    },
    onMoreBtn(val) {
      if (val && val.name && val.name === '退回') {
        this.$router.push({
          name: 'reportReturnForm',
          params: {
            id: this.clickMoreObj.id,
            reportState: this.clickMoreObj.reportState,
            reportType: this.clickMoreObj.reportType,
            reportCode: this.clickMoreObj.reportNumber,
          },
        })
      }
      else if (val && val.name && val.name === '通知修改委托') {
        this.$router.push({
          name: 'reportNoticeModifyForm',
          params: {
            id: this.clickMoreObj.id,
            reportState: this.clickMoreObj.reportState,
            reportCode: this.clickMoreObj.reportNumber,
          },
        })
      }
    },
    // 审批
    goAudit(item) {
      this.$router.push({
        name: 'audit',
        query: {
          id: item.id,
        },
      })
    },
    // 提交
    submit(item) {
      this.$router.push({
        name: 'addAudit',
        query: {
          id: item.processInstanceId,
        },
      })
    },
    deleteItem(id) {
      this.deleteReason = ''
      this.deleteId = id
      this.showDelete = true
    },
    confirmDelete() {
      if (!this.deleteReason) {
        showNotify({ type: 'warning', message: '请输入删除原因' })
        return
      }
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest({
        url: `${api.auditProcess.delete}/${this.deleteId}?deleteReason=${this.deleteReason}`,
        method: 'delete',
      })
        .then((res) => {
          if (res.code !== 20000) {
            showNotify({ type: 'danger', message: res.message || '删除失败' })
            return
          }
          showNotify({ type: 'success', message: '删除成功' })
          this.showDelete = false
          this.onSearch()
        })
        .catch((err) => {
          showNotify({ type: 'danger', message: err.message || '删除失败' })
        })
        .finally(() => {
          toast.close()
        })
    },
    // 选中事件
    onSelect(item) {
      this.$router.push({
        name: 'auditDetail',
        query: {
          businessKey: item.businessKey,
          processTypeId: item.processTypeId,
          processInstanceId: item.processInstanceId,
          id: item.id,
          tabType: this.activeKey,
        },
      })
    },
    // 发起审批
    addAudit() {
      this.$router.push({
        name: 'addAudit',
      })
    },
    onSearch() {
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    async onLoad() {
      this.query.page += 1
      this.loading = true
      const res = await mRequest.get(api.auditProcess.pageList, {
        params: {
          queryType: this.activeKey,
          ...this.query,
        },
      })
      if (res.code !== 20000) {
        showFailToast(res.message || '获取列表数据失败')
        return
      }
      // if (res.data.count === 0) {
      //   this.auditCount = ""
      // } else if (res.data.count > 99) {
      //   this.auditCount = "99+"
      // } else {
      //   this.auditCount = res.data.count
      // }

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
  },
}
</script>
