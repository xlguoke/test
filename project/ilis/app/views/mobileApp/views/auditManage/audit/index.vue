<template>
  <div class="add-audit">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>
    <div style="padding-bottom: 50px">
      <van-field
        v-model="auditResult.name"
        center
        readonly
        label="审批结果"
        placeholder="请选择审批结果"
      >
        <template #button>
          <van-button size="small" plain type="primary" @click="resultVisible = true">
            选择
          </van-button>
        </template>
      </van-field>

      <template v-for="(item, i) in formLayout" :key="i">
        <van-field
          v-if="item.type.name === 'radio'"
          name="radio"
          :label="item.name"
          :disabled="!item.writable"
        >
          <template #input>
            <van-radio-group v-model="item.value" direction="horizontal">
              <van-radio :name="1">
                是
              </van-radio>
              <van-radio :name="0">
                否
              </van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
          v-else-if="item.type.name === 'date'"
          v-model="item.value"
          readonly
          clickable
          name="datetimePicker"
          :label="item.name"
          :required="item.required"
          :disabled="!item.writable"
          :placeholder="`点击选择${item.name}`"
        >
          <template #right-icon>
            <van-icon
              v-if="item.value"
              name="clear"
              @click="
                () => {
                  item.value = ''
                  formLayout[i] = item
                }
              "
            />
          </template>
          <template #button>
            <van-button v-if="item.writable" type="primary" size="small" plain @click="chooseDate(i)">
              选择
            </van-button>
          </template>
        </van-field>
        <van-field
          v-else-if="item.type.name === 'long'"
          v-model="item.value"
          :label="item.name"
          :required="item.required"
          type="number"
          :disabled="!item.writable"
          :placeholder="`请填写${item.name}`"
        />

        <van-field
          v-else-if="item.type.name === 'file'"
          :label="item.name"
        >
          <template #input>
            <AttachmentHandler
              :key="item.id"
              business-type="WORKFLOW_FORM_FILE"
              :readonly="!item.writable"
              accept="*"
              :fixed-qr-url="item.value"
            ></AttachmentHandler>
          </template>
        </van-field>

        <van-field
          v-else
          v-model="item.value"
          :label="item.name"
          :required="item.required"
          :disabled="!item.writable"
          :placeholder="`请填写${item.name}`"
        />
      </template>

      <van-field
        v-model="form.comment"
        label="审批意见"
        placeholder="请填写审批意见"
      />
      <van-field
        v-model="form.remark"
        label="备注"
        placeholder="请填写备注"
      />
      <van-cell title="审批记录">
        <van-steps direction="vertical" :active="auditers.length">
          <van-step v-for="item in auditers" :key="item.activitiNodeId">
            <p>{{ item.taskName }}</p>
            <p style="display: flex; align-items: center">
              <van-icon v-if="item.pass" name="checked" color="#52c41a" />
              <van-icon
                v-if="item.pass === false"
                name="clear"
                color="#cc3030"
              />
              <span style="margin-left: 5px">{{ item.comment }}</span>
            </p>
          </van-step>
        </van-steps>
      </van-cell>
    </div>

    <ActionBar>
      <van-button type="primary" block @click="save">
        确定
      </van-button>
      <van-button block @click="$router.go(-1)">
        取消
      </van-button>
    </ActionBar>

    <van-calendar
      v-model:show="showCalendar"
      color="#1989fa"
      @confirm="confirmDate"
    />

    <van-action-sheet
      v-model:show="resultVisible"
      title="审批结果"
      :actions="resultList"
      :round="false"
      @select="onResultSelect"
    />
  </div>
</template>

<script>
import qs from 'qs'
import {
  showLoadingToast,
  showNotify,
} from 'vant'
import AttachmentHandler from '~/views/mobileApp/components/AttachmentHandler.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'

// 详情页进入审批时，若审批不通过，返回到列表页
let isDetailPageEnter = false
export default {
  components: {
    ActionBar,
    MobileTitleBar,
    AttachmentHandler,
  },
  beforeRouteEnter(to, from, next) {
    if (from.name === 'auditDetail') {
      isDetailPageEnter = true
    }
    else {
      isDetailPageEnter = false
    }
    next()
  },
  beforeRouteLeave(to, from, next) {
    if (
      (to.name === 'auditManage' || to.name === 'auditDetail')
      && this.isSave
    ) {
      const pageState = useAppPageStateStore().getPage(to.name)
      pageState.scrollTop = 0
      pageState.resetPage = true
    }
    next()
  },
  data() {
    return {
      showCalendar: false,
      resultVisible: false,
      personVisible: false,
      loading: false,
      finished: true,
      activeKey: 0,
      auditResult: {},
      form: {},
      chooseType: '',
      searchPerson: '',
      resultList: [
        { name: '通过', code: 'auditPass', color: '#154bd0' },
        { name: '不通过', code: 'auditRefuse' },
      ],
      auditers: [],
      formLayout: [],
      isSave: false,
    }
  },
  created() {
    this.auditResult = this.resultList[0]
    const taskId = this.$route.query.id
    this.getData(taskId)
  },
  methods: {
    getData(taskId) {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      this.taskId = taskId
      mRequest
        .get(api.auditProcess.auditDetail, {
          params: {
            taskId,
          },
        })
        .then((res) => {
          if (res.code && res.code !== 20010) {
            this.formLayout = res.data.formProperties
            this.auditers = res.data.auditRecords
              ? JSON.parse(res.data.auditRecords)
              : []
            if (res.data.problemSeverityDictGroupId) {
              this.processInstanceId = res.data.processInstanceId
              this.businessType = res.data.processTypeId // 业务类型
              this.businessId = res.data.businessKey // 业务id
            }
            else {
              this.spinning = false
            }
          }
          else {
            showNotify({
              type: 'danger',
              message: res.message || '获取详情失败',
            })
          }
        })
        .finally(() => {
          toast.close()
        })
    },
    // 选择结果
    onResultSelect(row, index) {
      this.resultList = this.resultList.map(item => ({
        ...item,
        color: '',
      }))
      this.auditResult = row
      this.resultList[index].color = '#154bd0'
      this.resultVisible = false
    },
    // 选择日期
    chooseDate(ind) {
      this.eidtFormInd = ind
      this.showCalendar = true
    },
    // 确认选择日期
    confirmDate(date) {
      this.showCalendar = false
      const val = date ? formatDate(date, 'YYYY-MM-DD') : ''
      const item = this.formLayout[this.eidtFormInd]
      item.value = val
      this.formLayout[this.eidtFormInd] = item
    },
    // 保存
    async save() {
      if (!this.auditResult.name) {
        showNotify({ type: 'warning', message: '请选择审批结果' })
        return
      }
      const formVal = {}
      for (let i = 0; i < this.formLayout.length; i++) {
        const item = this.formLayout[i]
        if (item.required && !item.value) {
          showNotify({ type: 'warning', message: `${item.name}不能为空` })
          return
        }
        formVal[item.id] = item.value
      }
      const params = {
        'taskId': this.taskId,
        'formPropertyJson': JSON.stringify(formVal),
        'auditRecord.comment': this.form.comment || '',
        'auditRecord.remark': this.form.remark || '',
      }
      const url = api.auditProcess[this.auditResult.code]
      try {
        const toast = showLoadingToast({
          duration: 0,
          forbidClick: true,
        })
        const res = await mRequest.post(url, qs.stringify(params)).finally(() => {
          toast.close()
        })
        if (res.code === 20000) {
          showNotify({ type: 'success', message: '提交成功!' })
          this.isSave = true
          if (isDetailPageEnter && this.auditResult.code === 'auditRefuse') {
            this.$router.go(-2)
          }
          else {
            this.$router.go(-1)
          }
        }
        else {
          showNotify({ type: 'danger', message: res.message || '提交失败!' })
        }
      }
      catch (err) {
        showNotify({ type: 'danger', message: err.message || '提交失败!' })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.field-group {
  padding: 0 15px;
  line-height: 45px;
  background-color: #f5f5f5;
}
.dot-required::before {
  content: '*';
  color: red;
  display: inline-block;
  line-height: 30px;
}
.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 45px;
  background-color: #fff;
  border-top: 1px solid #f5f5f5;
  &:active {
    background-color: #f8fcff;
  }

  .van-icon {
    margin-right: 3px;
  }
}
:deep(.van-cell) {
  .van-cell__title {
    flex: initial;
    width: 6.2em;
  }
  .van-cell__value {
    text-align: left;
  }
}
</style>
