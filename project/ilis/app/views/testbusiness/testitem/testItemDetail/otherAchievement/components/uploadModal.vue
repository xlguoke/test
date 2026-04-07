<template>
  <div>
    <ht-modal
      v-model:open="uploadVisible"
      :title="isAdd ? '上传成果' : '编辑成果'"
      :confirm-loading="confirmLoading"
      :loading="spinning"
      width="900px"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <div class="spin-content">
        <a-form
          ref="formRef"
          :model="data"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 14 }"
        >
          <a-form-item label="成果范围">
            <div class="flex">
              <span
                style="
                    flex: 1;
                    width: 0;
                    padding: 0 8px;
                    font-size: 12px;
                    margin-right: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    line-height: 28px;
                  "
              >
                {{ name || data.name || data.projectName }}
              </span>
              <a-button @click="() => (selectTreeVisible = true)">
                选择
              </a-button>
            </div>
          </a-form-item>
          <a-form-item label="成果类型" :rules="[{ required: true, message: '请选择成果类型！' }]" name="achievementType">
            <a-select v-model:value="data.achievementType" placeholder="请选择成果类型">
              <a-select-option
                v-for="(item, index) in typeData"
                :key="index"
                :value="item.value"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="成果文件" :rules="[{ required: true, message: '请上传成果文件！' }]" name="attachmentId">
            <a-button @click="upload">
              上传文件
            </a-button>
            <div
              v-for="(item, index) in fileLists"
              :key="index"
              style="margin-top: 4px"
            >
              <FileItem
                :key="data.id"
                :file-data="item"
                :achievement-id="data.id"
              />
            </div>
          </a-form-item>
          <!-- 编辑时，需要显示审核人流程回显，且支持编辑 -->
          <a-form-item
            v-if="businessId"
            name="presetAuditers"
            label="审核人员"
          >
            <ProcessPerson
              :key="key"
              v-model="data.presetAuditers"
              :process-type="ProcessType.OTHER_RESULT"
              :default-value="presetAuditers"
            />
          </a-form-item>
        </a-form>

        <!-- 仅新增时显示流程表单 -->
        <ProcessForm
          v-if="!businessId"
          ref="processFormRef"
          :key="key"
          hide-remark
          :process-type="ProcessType.OTHER_RESULT"
          :default-copyto="copyToUserList"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 14 }"
        />

        <CorrectDetail
          v-show="!isAdd"
          ref="CorrectDetail"
          :business-id="businessId"
          :change-spinning="
            (status) => {
              spinning = status
            }
          "
        />
      </div>
    </ht-modal>
    <ht-modal v-model:open="selectTreeVisible" title="选择成果范围">
      <TreeComponent :tree-select="treeSelect" />
    </ht-modal>
    <UploadComponent
      ref="UploadComponent"
      :max="1"
      :uploadcall="uploadcall"
      :file-lists="fileLists"
    >
      <template #description>
        <p class="mt-6 text-red-500">
          提示：若文件需要签字，请上传PDF格式的文件！
        </p>
      </template>
    </UploadComponent>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import { ProcessType } from '~/components/commonProcess'
import ProcessPerson from '~/components/commonProcess/ProcessPerson.vue'
import {
  addAchievement,
  updateAchievement,
} from '~/providers/api/achievement'
import { getQueryVariable } from '~/providers/common/utils'
import UploadComponent from '~/providers/components/uploadComponent.vue'
import TreeComponent from '../../testReport/components/tree.vue'
import CorrectDetail from './correctDetail.vue'
import FileItem from './FileItem.vue'

export default {
  components: {
    TreeComponent,
    UploadComponent,
    CorrectDetail,
    FileItem,
    ProcessPerson,
  },
  props: ['treeInfo', 'callback', 'node', 'isAdd'],
  data() {
    return {
      id: getQueryVariable('id'),
      ProcessType,
      selectTreeVisible: false,
      uploadVisible: false,
      confirmLoading: false,
      spinning: false,
      contractPartId: '',
      unitProjectId: '',
      name: '',
      data: {
        name: '',
        achievementType: undefined,
        presetAuditers: [],
        upload: '',
      },
      typeData: [
        { name: '综合检测大纲', value: '10011' },
        { name: '综合检测方案', value: '10010' },
        { name: '检测细则', value: '10086' },
        { name: '其它', value: '10000' },
      ],
      fileLists: [],
      businessId: '', // 成果id
      presetAuditers: [],
      copyToUserList: [], // 抄送人列表
      key: 1,
    }
  },
  methods: {
    showModal(data) {
      this.uploadVisible = true
      this.key++
      if (data) {
        this.spinning = true
        data.presetAuditers = []
        this.data = data
        this.contractPartId = data.contractPartId
        this.unitProjectId = data.unitProjectId
        this.fileLists = [
          {
            uid: data.attachmentId,
            name: data.achievementName,
            status: 'done',
            url: '',
          },
        ]
        this.businessId = data.id
        this.initPresetAuditer()
        nextTick(() => {
          this.$refs.CorrectDetail.getData(data.id)
        })
      }
      else {
        // 获取上传选择的抄送人
        window.$oAjax.get(`rest/synthesis/achievement/last/cc/users/${this.id}`).then((res) => {
          if (res.code === 20000 && res.data) {
            this.copyToUserList = res.data.map(d => ({
              id: d.id,
              account: d.userName,
              name: d.realName,
            }))
          }
        })
        this.businessId = ''
        this.presetAuditers = []
        this.contractPartId = this.treeInfo.contractPartId || null
        this.unitProjectId = this.treeInfo.unitProjectId || null
        this.fileLists = []
        this.data = {
          name: this.node.title,
          achievementType: undefined,
          presetAuditers: [],
        }
      }
    },
    // 审核退回编辑上传成果时，初始化审核节点人员信息
    initPresetAuditer() {
      window.$oAjax
        .get(window.$oApi.testItem.getPresetAuditer, {
          params: {
            processInstanceId: this.data.processInstanceId,
          },
        })
        .then((res) => {
          if (res.code && res.code === 20000) {
            this.presetAuditers = res.data
          }
        })
    },
    cancelModal() {
      this.data = {
        name: '',
        achievementType: undefined,
        upload: '',
        presetAuditers: [],
      }
      this.presetAuditers = []
      this.name = ''
      this.unitProjectId = ''
      this.contractPartId = ''
      this.$refs.CorrectDetail.data = []
      this.uploadVisible = false
      this.$refs.formRef.resetFields()
    },
    async handleSubmit() {
      await this.$refs.formRef.validate()
      try {
        this.confirmLoading = true
        const values = { ...this.data }

        const data = {
          otherAchievement: {
            ...values,
            unitProjectId: this.unitProjectId || null,
            contractPartId: this.contractPartId || null,
            projectId: this.id,
            attachmentId: this.fileLists[0].uid,
            achievementName: this.fileLists[0].name,
            projectName: this.name || this.data.name || this.data.projectName,
          },
        }

        if (this.businessId) {
          data.presetAuditers = JSON.stringify(values.presetAuditers)
          data.formPropertyJson = '{}'
        }
        else {
          const formData = await this.$refs.processFormRef.getProcessFormData()

          if (!formData.formPropertyJson) {
            formData.formPropertyJson = {}
          }

          if (formData.formPropertyJson.copyTo) {
            formData.formPropertyJson.copyTo = formData.copyToPersons.map(u => ({
              id: u.id,
              userName: u.account,
              realName: u.name,
            }))
          }
          else {
            formData.formPropertyJson.copyTo = []
          }
          data.presetAuditers = JSON.stringify(formData.presetAuditers)
          data.formPropertyJson = JSON.stringify(formData.formPropertyJson)
        }

        if (!data.otherAchievement.projectName) {
          this.confirmLoading = false
          message.warn('成果范围必选！')
          return
        }
        if (!this.isAdd) {
          data.otherAchievement.id = this.data.id
        }

        // 删除多余字段
        delete data.otherAchievement.name
        delete data.otherAchievement.presetAuditers

        if (this.isAdd) {
          const res = await addAchievement(data)
          this.callback(this.node.type, this.node.id)
          message.success(res.message)
        }
        else {
          const res = await updateAchievement(data)
          message.success(res.message)
          const type = data.contractPartId ? 'contract' : 'unit'
          this.callback(type, data.contractPartId || data.contractPartId)
        }
        this.name = ''
        this.unitProjectId = ''
        this.contractPartId = ''
        this.cancelModal()
        this.confirmLoading = false
        this.loading = false
      }
      catch (err) {
        this.confirmLoading = false
        console.error(err)
      }
    },
    treeSelect(data, info) {
      const type = info.node.dataRef.type
      const name = info.node.dataRef.name
      const selObj = info.node.dataRef
      this.unitProjectId = ''
      this.contractPartId = ''

      if (data.length === 0) {
        return
      }

      if (`${type}` === '-2') {
        this.name = name
      }
      else if (`${type}` === '-1') {
        this.contractPartId = selObj.oid
        this.name = name
      }
      else {
        this.unitProjectId = selObj.oid
        this.name = name
      }

      this.selectTreeVisible = false
    },
    upload() {
      this.$refs.UploadComponent.showModal()
    },
    uploadcall(res) {
      this.fileLists = res.map(item => ({
        uid: item.id || item.uid,
        name: item.attachmenttitle || item.name,
        status: 'done',
        url: item.realpath || item.url,
      }))
      this.data.attachmentId = res.map(item => item.id).join(',')
      this.$refs.formRef.validateFields('attachmentId')
    },
  },
}
</script>

<style scoped>
.ant-tag{
  line-height: 30px;
}
</style>
