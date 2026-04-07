<template>
  <div class="reviewApprovalOpinions">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <div>
      <van-form ref="form">
        <van-field
          label-width="5.4em"
          disabled
          center
          rows="1"
          autosize
          label="修正情况"
          type="textarea"
        >
          <template #input>
            <span v-if="!isEdit" class="red">未修正</span>
            <span v-else>
              <span v-if="editData.status === '1'" class="green">已修正</span>
              <span v-else class="red">未修正</span>
            </span>
          </template>
        </van-field>
        <van-field
          label-width="5.4em"
          disabled
          center
          rows="1"
          :value="isEdit ? editData.amendUserName : ''"
          autosize
          label="修正人"
        />
        <van-field
          v-model="content"
          label-width="5.4em"
          center
          rows="1"
          autosize
          label="问题"
          required
          type="textarea"
          placeholder="请输入"
          :rules="[{ required: true, message: '请输入问题' }]"
        />
        <van-field
          v-model="questionType.text"
          label-width="5.4em"
          center
          readonly
          rows="1"
          autosize
          label="问题内容"
          required
          type="textarea"
          placeholder="请选择"
          :rules="[{ validator: validateType, message: '请选择问题内容' }]"
        >
          <template #button>
            <a href="javascript:;" @click="selectQuestionType">选择</a>
          </template>
        </van-field>
        <van-field
          v-model="questionType.severity"
          label-width="5.4em"
          readonly
          center
          rows="1"
          autosize
          label="严重程度"
          type="textarea"
          placeholder="请选择问题类型"
        />
      </van-form>
    </div>

    <ActionBar>
      <van-button type="primary" @click="ok">
        确定
      </van-button>
      <van-button @click="onCancel">
        取消
      </van-button>
    </ActionBar>

    <SelectQuestionType
      v-model:value="visible"
      :report-id="reportId"
      @selected-ok="getQuestionType"
    />
  </div>
</template>

<script>
import qs from 'qs'
import { showDialog, showNotify } from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useReportStore } from '~/views/mobileApp/store/useReportStore'
import SelectQuestionType from '../selectQuestionType/index.vue'

export default {
  components: {
    ActionBar,
    SelectQuestionType,
    MobileTitleBar,
  },
  beforeRouteLeave(to, from, next) {
    if (this.isSubmit === true) {
      if (this.isSetRoute === true) {
        next()
      }
      else {
        const toPageState = useAppPageStateStore().getPage(to.name)

        toPageState.resetPage = true
        const routerObj = { name: to.name, params: { ...to.params } }
        if (to.name === 'reportDetail') {
          toPageState.isSubmit = true
        }
        this.isSetRoute = true
        this.$router.replace(routerObj)
      }
    }
    else {
      next()
    }
  },
  data() {
    return {
      content: '',
      visible: false,
      reportId: this.$route.params.id,
      sourceModule: this.$route.params.sourceModule,
      questionType: {},
      editData: {},
      isEdit: false,
      isSubmit: false,
      isSetRoute: false,
    }
  },
  async created() {
    if (this.$route.query.editData) {
      this.isEdit = true
      this.editData = JSON.parse(this.$route.query.editData)
      this.questionType = {
        id: null,
        severity: this.editData.severity,
        text: this.editData.type,
      }
      this.content = this.editData.content
    }
  },
  methods: {
    validateType() {
      if (this.questionType.id !== undefined) {
        return true
      }
      else {
        return false
      }
    },
    // 选择问题类型
    selectQuestionType() {
      this.visible = true
    },
    getQuestionType(questionType) {
      this.questionType = questionType
    },
    onCancel() {
      this.$router.go(-1)
    },
    async ok() {
      const result = await this.$refs.form.validate()
      if (result) {
        return
      }

      let type = 'post'
      let data = {
        content: this.content,
        sourceType: 3,
        sourceModule: this.sourceModule,
        questionTypeId: this.questionType.id,
        reportId: this.reportId,
      }

      if (this.isEdit) {
        type = 'put'
        data = {
          id: this.editData.id,
          content: this.content,
        }

        if (this.questionType.id) {
          data.questionTypeId = this.questionType.id
        }
      }

      const loading = showLoadingToast({
        forbidClick: true,
        duration: 0,
      })
      const res = await mRequest[type](
        api.report.addReportQuestion,
        qs.stringify(data),
      ).finally(() => {
        loading.close()
      })

      if (res.code !== 20010) {
        showNotify({ type: 'success', message: '操作成功' })
        this.isSubmit = true

        const reportStore = useReportStore()
        reportStore.getOpinions({
          reportId: this.reportId,
          sourceModule: this.sourceModule,
        })
        this.$router.go(-1)
      }
      else {
        showDialog({ message: res.message || res.msg || '操作失败' })
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
