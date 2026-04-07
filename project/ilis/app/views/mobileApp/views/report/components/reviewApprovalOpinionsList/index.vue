<template>
  <div>
    <div class="reviewApprovalOpinionsList">
      <div v-if="list.length > 0">
        <div
          v-for="item in list"
          :key="item.id"
          class="reviewApprovalOpinionsList-box"
        >
          <div class="reviewApprovalOpinionsList-boxHeader">
            <van-row :gutter="15" type="flex" align="center">
              <van-col span="16">
                <div class="textOverflow" style="font-weight: bold">
                  {{ item.content }}
                </div>
              </van-col>
              <van-col v-if="!readonly" span="8" style="font-size: 12px">
                <span
                  v-if="item.status !== '1' && addPermission"
                  @click="editOpinion(item)"
                >编辑</span>
                <span
                  v-if="item.status === '1' && addPermission"
                  @click="repulse(item)"
                >打回修正</span>
                <span v-if="addPermission" class="red" @click="deleteRow(item)">删除</span>
              </van-col>
            </van-row>
          </div>
          <div class="reviewApprovalOpinionsList-boxBody">
            <div>
              <div>问题类型：</div>
              <div style="flex: 1" class="textOverflow">
                {{ item.type }}
              </div>
            </div>
            <div style="padding-top: 4px">
              <div>严重程度：</div>
              <div style="flex: 1" class="textOverflow">
                {{ item.severity }}
              </div>
            </div>
            <div style="padding-top: 4px">
              <div>提出人：</div>
              <div style="flex: 1" class="textOverflow">
                {{ item.createUserName }}
              </div>
            </div>
            <div style="padding-top: 4px">
              <div>修正情况：</div>
              <div
                v-if="item.status === '1'"
                style="flex: 1"
                class="textOverflow green"
              >
                已修正
              </div>
              <div v-else style="flex: 1" class="textOverflow red">
                未修正
              </div>
            </div>
            <div style="padding-top: 4px">
              <div>修正人：</div>
              <div style="flex: 1" class="textOverflow">
                {{ item.amendUserName }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <van-empty description="无数据" />
      </div>
      <div v-if="!readonly && addPermission" style="padding: 0 15px">
        <van-button icon="add-o" block plain type="primary" @click="addOpinion">
          新增
        </van-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { showConfirmDialog, showDialog, showLoadingToast, showNotify } from 'vant'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useReportStore } from '~/views/mobileApp/store/useReportStore'

export default {
  props: ['reportId', 'sourceModule', 'reportState', 'readonly'],
  data() {
    return {
      moreBtnVisible: false,
      addPermission: false,
    }
  },
  computed: {
    ...mapState(useReportStore, {
      list: 'approvalOpinions',
    }),
  },
  async created() {
    this.checkBtnPermission()
    // this.getReportQuestion();
  },
  methods: {
    // 获取报告复核审批意见
    async getReportQuestion() {
      const reportStore = useReportStore()
      reportStore.getOpinions({
        reportId: this.reportId,
        sourceModule: this.sourceModule,
      })
    },
    // 按钮权限
    checkBtnPermission() {
      if (String(this.sourceModule) === '2' && this.reportState === '15') {
        this.addPermission = true
      }
      else if (String(this.sourceModule) === '3' && this.reportState === '20') {
        this.addPermission = true
      }
      else {
        this.addPermission = false
      }
    },
    // 新增复核审批
    addOpinion() {
      this.$router.push({
        name: 'reviewApprovalOpinions',
        params: { id: this.reportId, sourceModule: this.sourceModule },
      })
    },
    editOpinion(data) {
      this.$router.push({
        name: 'reviewApprovalOpinions',
        params: { id: this.reportId, sourceModule: this.sourceModule },
        query: {
          editData: JSON.stringify(data),
        },
      })
    },
    // 更多
    openMoreBtn(row) {
      this.operationData = row
      this.moreBtnVisible = true
    },
    // 打回本次修正
    repulse(row) {
      showConfirmDialog({
        title: '提示',
        message: '确认打回本次修正吗？',
      })
        .then(async () => {
          const toast = showLoadingToast({
            duration: 0,
            forbidClick: true,
          })
          const res = await mRequest.put(
            `${api.report.repulseQuestion}`,
            {},
            {
              params: {
                id: row.id,
              },
            },
          ).finally(() => {
            toast.close()
          })

          if (res.code !== 20010) {
            showNotify({ type: 'success', message: '操作成功' })
            this.getReportQuestion()
          }
          else {
            showDialog({ message: res.msg || res.message || '操作失败' })
          }
        })
    },
    // 删除
    deleteRow(row) {
      showConfirmDialog({
        title: '提示',
        message: '确认删除该意见吗？',
      })
        .then(async () => {
          const toast = showLoadingToast({
            duration: 0,
            forbidClick: true,
          })
          const res = await mRequest.delete(
            `${api.report.addReportQuestion}/${row.id}`,
          ).finally(() => {
            toast.close()
          })
          if (res.code !== 20010) {
            showNotify({ type: 'success', message: '删除成功' })
            this.getReportQuestion()
          }
          else {
            showDialog({ message: res.msg || res.message || '操作失败' })
          }
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
