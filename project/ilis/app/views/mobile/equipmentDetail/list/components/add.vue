<template>
  <div>
    <a-modal
      title="新增外出"
      :open="visible"
      :confirm-loading="confirmLoading"
      width="520px"
      wrap-class-name="equipmentOutgo-add-modal"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div>
        <a-form :model="formState">
          <a-form-item
            label="外出设备"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-row :gutter="15">
              <a-col v-if="eqData.name" :span="18" style="font-size: 12px">
                {{
                  eqData.name
                }}
              </a-col>
              <a-col v-else :span="18" style="font-size: 12px; color: #999">
                请选择外出设备
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-button @click="openModal('eqVisible')">
                  选择
                </a-button>
              </a-col>
            </a-row>
            <div v-if="eqData.name" style="font-size: 12px">
              设备编号：{{ eqData.equipmentSn }} 设备规格：{{ eqData.standard }}
            </div>
          </a-form-item>
          <a-form-item
            label="关联任务"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-row :gutter="15">
              <a-col v-if="taskData" :span="18" style="font-size: 12px">
                {{
                  taskData
                }}
              </a-col>
              <a-col v-else :span="18" style="font-size: 12px; color: #999">
                请选择关联任务
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-button @click="openModal('taskVisible')">
                  选择
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
            label="外出前状态"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-select v-model:value="formState.beforeStatus" placeholder="请选择">
              <a-select-option
                v-for="(item, index) in statusData"
                :key="index"
                :value="item.typecode"
              >
                {{ item.typename }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            label="借取人"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-row :gutter="15">
              <a-col v-if="person.name" :span="18" style="font-size: 12px">
                {{
                  person.name
                }}
              </a-col>
              <a-col v-else :span="18" style="font-size: 12px; color: #999">
                请选择借取人
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-button
                  @click="
                    () => {
                      $refs.SelectPersonnel.showModal()
                    }
                  "
                >
                  选择
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
            label="外出时间"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-date-picker
              v-model:value="formState.egressTime"
              style="width: 100%"
              show-time
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </a-form-item>
          <a-form-item
            label="预还时间"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-date-picker
              v-model:value="formState.expectReturnTime"
              style="width: 100%"
              show-time
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <a-modal
      title="选择外出设备"
      :open="eqVisible"
      width="80%"
      @cancel="cancelModal"
      @ok="getEq"
    >
      <iframe
        id="eqVisible"
        style="border: 0"
        width="100%"
        height="400px"
        :src="eqVisibleUrl"
      ></iframe>
    </a-modal>

    <a-modal
      title="选择关联任务"
      :open="taskVisible"
      width="80%"
      @cancel="cancelModal"
      @ok="getTask"
    >
      <iframe
        id="taskVisible"
        style="border: 0"
        width="100%"
        height="400px"
        :src="taskVisibleUrl"
      ></iframe>
    </a-modal>

    <SelectPersonnel
      ref="SelectPersonnel"
      :callback="getPerson"
      :multiple="false"
    />
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import qs from 'qs'
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'
import { formatTime } from '~/providers-moblie/common/utils'
import SelectPersonnel from '~/providers-moblie/components/selectPersonnel.vue'
import { rootUrl } from '~/providers-moblie/configs/rootUrl'

export default {
  components: {
    SelectPersonnel,
  },
  props: ['isAdd', 'callback'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      formLayout: 'horizontal',
      eqVisible: false,
      eqVisibleUrl: `${rootUrl}/equipmentNewController.do?goEquipmentList&onlySelect=1`,
      eqData: {},
      taskVisible: false,
      taskVisibleUrl: `${rootUrl}/reportCreateController.do?goRelationTaskChoosePage`,
      taskData: '',
      statusData: [],
      person: {},
      formState: {},
    }
  },
  created() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (userInfo) {
      this.person = { id: userInfo.userId, name: userInfo.realName }
    }
    this.getStatus()
  },
  methods: {
    getStatus() {
      mAjax({
        method: 'POST',
        url: `${mApi.eqEgressList.status}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          dictGroupId: '402882cd5f998a58015f9998ff71001b',
        }),
      }).then((res) => {
        if (res && res.success) {
          this.statusData = res.obj
        }
      })
    },
    showModal() {
      this.visible = true
    },
    handleOk() {
      const data = { ...this.formState }
      data.egressTime = data.egressTime
        ? formatTime(data.egressTime, 'YYYY-MM-DD HH:mm:ss')
        : ''
      data.expectReturnTime = data.expectReturnTime
        ? formatTime(data.expectReturnTime, 'YYYY-MM-DD HH:mm:ss')
        : ''
      data.equipmentId = this.eqData.id
      data.equipmentName = this.eqData.name
      data.assetSn = this.eqData.assetSn
      data.testTaskSn = this.taskData
      data.borrowUser = this.person.name
      data.borrowUserId = this.person.id

      this.confirmLoading = true
      mAjax({
        method: 'POST',
        url: mApi.eqEgressList.add,
        data: qs.stringify(data),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          message.success('操作成功')
          this.formState = {}
          this.eqData = {}
          this.taskData = ''
          this.person = {}
          this.visible = false
          this.callback()
        }
        else {
          message.error(res.message)
        }
        this.confirmLoading = false
      })
    },
    handleCancel() {
      this.visible = false
      this.formState = {}
    },
    openModal(field) {
      this[field] = true
    },
    cancelModal() {
      this.eqVisible = false
      this.taskVisible = false
    },
    // 获取外出设备
    getEq() {
      const data = document
        .getElementById('eqVisible')
        .contentWindow
        .$('#dataGrid')
        .datagrid('getSelections')
      this.eqVisible = false
      if (data.length > 0) {
        this.eqData = data[0]
      }
    },
    // 获取关联任务
    getTask() {
      const data = document
        .getElementById('taskVisible')
        .contentWindow
        .$('#dataGrid')
        .datagrid('getSelections')
      this.taskVisible = false
      if (data.length > 0) {
        this.taskData = data.map(item => item.testTaskCode).toString()
      }
    },
    getPerson(data) {
      this.person = data || {}
    },
  },
}
</script>

<style lang="less" scoped>
.equipmentOutgo-add-modal {
  .ant-modal-body {
    max-height: 450px;
    overflow-y: auto;
  }
}
</style>
