<template>
  <div class="equipmentOutgo">
    <div class="equipmentOutgo-detail">
      <div>
        <van-sticky>
          <MobileTitleBar v-if="!isEdit" left-arrow @click-left="$router.go(-1)" />
          <MobileTitleBar
            v-else
            title="编辑外出信息"
            left-arrow
            @click-left="$router.go(-1)"
          />
        </van-sticky>

        <van-collapse v-model="collapseActive">
          <van-collapse-item
            v-if="!isEdit"
            title="所选设备"
            name="1"
            class="background-gray"
          >
            <div
              v-for="(equipment, eIndex) in equipmentVoData"
              :key="eIndex"
              class="equipmentOutgo-info"
            >
              <div class="equipment-name">
                <div class="left">
                  <p class="name">
                    {{ equipment.name }}
                  </p>
                  {{ equipment.equipmentSn }}
                </div>
                <span class="equipmentOutgo-detail-tag">在库</span>
              </div>
              <!-- <p>{{ item.name }}：<span :class="`${redStatus(item.field)} ${redNextCheckDate(item.field)}`">{{ item[item.field] }}</span></p> -->
              <div v-for="(item, index) in equipmentVo" :key="index">
                {{ item.name }}：<span
                  :class="`${redStatus(
                    item.field,
                    equipment,
                  )} ${redNextCheckDate(item.field, equipment)}`"
                >{{ equipment[item.field] || '/' }}</span>
              </div>
            </div>
          </van-collapse-item>
          <van-collapse-item title="外出信息" name="2">
            <div class="equipmentOutgo-dispose" style="padding: 0">
              <van-form ref="form">
                <van-field label="借用人" clearable center placeholder="请选择">
                  <template #input>
                    <span v-if="person.name">{{ person.name }}</span>
                    <span v-else style="color: #ccc">请选择</span>
                  </template>
                  <template #button>
                    <van-button
                      size="small"
                      plain
                      hairline
                      type="primary"
                      native-type="button"
                      @click="openSelectPerson"
                    >
                      选择
                    </van-button>
                  </template>
                </van-field>
                <van-field
                  v-model="formData.beforeStatus"
                  label="外出前状态"
                  clearable
                  center
                  required
                  :rules="[{ required: true, message: '请选择外出前状态' }]"
                >
                  <template #input>
                    <select
                      v-model="formData.beforeStatus"
                      placeholder="请选择"
                    >
                      <option
                        v-for="(item, index) in statusData"
                        :key="index"
                        :value="item.typecode"
                      >
                        {{ item.typename }}
                      </option>
                    </select>
                  </template>
                </van-field>
                <van-field
                  v-model="formData.testTaskSn"
                  label="关联任务"
                  autosize
                  readonly
                  placeholder="请选择"
                  type="textarea"
                  rows="1"
                >
                  <template #button>
                    <van-button
                      v-if="!!formData.testTaskSn"
                      size="small"
                      plain
                      hairline
                      type="primary"
                      native-type="button"
                      class="mr-1"
                      @click="
                        () => {
                          project = []
                          formData.testTaskSn = ''
                          formData.projectName = ''
                          formData.qualificationType = ''
                          qualificationTypeDisplay = ''
                          qualification = []
                          taskList = []
                        }
                      "
                    >
                      清空
                    </van-button>
                    <van-button
                      size="small"
                      plain
                      hairline
                      type="primary"
                      native-type="button"
                      @click="openTestTask"
                    >
                      选择
                    </van-button>
                  </template>
                </van-field>
                <van-field
                  v-model="formData.projectName"
                  label="关联工程项目"
                  clearable
                  type="textarea"
                  rows="1"
                  autosize
                  placeholder="请选择或输入（多个用逗号分隔）"
                  :disabled="!!formData.testTaskSn"
                  :required="companyId === 'hxcd' || OUT_EQUIPMENT_LIMIT_SELECT"
                  :rules="[
                    {
                      required:
                        companyId === 'hxcd' || OUT_EQUIPMENT_LIMIT_SELECT,
                      message: '请选择或输入关联工程项目',
                    },
                  ]"
                  @blur="syncProjectData"
                >
                  <template #button>
                    <van-button
                      v-if="!formData.testTaskSn"
                      size="small"
                      plain
                      hairline
                      type="primary"
                      native-type="button"
                      @click="openProject"
                    >
                      选择
                    </van-button>
                  </template>
                </van-field>

                <FormItemInput
                  v-if="EQ_ENGINEERING_FIELD"
                  v-model:value="qualificationTypeDisplay"
                  label="资质类型"
                  clearable
                  placeholder="请选择资质类型"
                  :disabled="!!formData.testTaskSn"
                >
                  <template v-if="!formData.testTaskSn" #button>
                    <van-button
                      size="small"
                      plain
                      hairline
                      type="primary"
                      native-type="button"
                      @click="qualificationVsibile = true"
                    >
                      选择
                    </van-button>
                  </template>
                </FormItemInput>

                <FormItemDate
                  v-model:value="formData.egressTime"
                  label="外出时间"
                  placeholder="请选择"
                  required
                  :enable-time="true"
                  :rules="[{ required: true, message: '请选择外出时间' }]"
                />

                <FormItemDate
                  v-model:value="formData.expectReturnTime"
                  label="预还时间"
                  placeholder="请选择"
                  :required="EQUIPMENT_EGRESS_DATE"
                  :enable-time="true"
                  :rules="[
                    {
                      required: EQUIPMENT_EGRESS_DATE,
                      message: '请选择预还时间',
                    },
                  ]"
                />

                <FormItemInput
                  v-model:value="formData.remark"
                  label="备注"
                  rows="2"
                  autosize
                  :max-length="500"
                  type="textarea"
                  clearable
                  placeholder="请输入备注内容"
                />

                <van-field name="uploader" label="附件">
                  <template #input>
                    <AttachmentHandler
                      ref="attachmentHandler"
                      :business-id="isEdit ? record.id : undefined"
                      business-type="EQ_EGRESS"
                      :readonly="false"
                    />
                  </template>
                </van-field>
              </van-form>
            </div>
          </van-collapse-item>
        </van-collapse>
      </div>
    </div>

    <ActionBar>
      <van-button type="primary" @click="handleOk()">
        完成
      </van-button>
      <van-button
        @click="
          () => {
            equipmentStore.clearEqData()
            $router.go(-1)
          }
        "
      >
        取消
      </van-button>
    </ActionBar>

    <SelectPerson
      v-model:value="selectPersonVisible"
      @selected-ok="getPerson"
    />

    <SelectTask
      v-model:value="testTaskVsibile"
      :is-multiple="true"
      :init-selected="taskList"
      @selected-ok="getTask"
    />

    <SelectQua
      v-model:value="qualificationVsibile"
      :is-multiple="true"
      :init-selected="qualification"
      @selected-ok="getQualification"
    />

    <SelectProject
      v-model:value="projectVsibile"
      :is-multiple="true"
      :init-selected="project"
      @selected-ok="getProject"
    />
  </div>
</template>

<script>
import { mapState } from 'pinia'
import qs from 'qs'
import {
  showConfirmDialog,
  showDialog,
  showLoadingToast,
  showNotify,
} from 'vant'
import AttachmentHandler from '~/views/mobileApp/components/AttachmentHandler.vue'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import SelectPerson from '~/views/mobileApp/components/selectPerson.vue'
import SelectProject from '~/views/mobileApp/components/selectProject.vue'
import SelectQua from '~/views/mobileApp/components/selectQualification.vue'
import SelectTask from '~/views/mobileApp/components/selectTestTask.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useEquipmentStore } from '~/views/mobileApp/store/useEquipmentStore'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

export default {
  components: {
    ActionBar,
    FormItemInput,
    SelectQua,
    FormItemDate,
    SelectPerson,
    SelectTask,
    SelectProject,
    MobileTitleBar,
    AttachmentHandler,
  },
  data() {
    const equipmentStore = useEquipmentStore()

    return {
      equipmentStore,
      collapseActive: ['1', '2'],
      visible: false,
      formData: {
        testTaskSn: '',
        projectName: '',
      },
      statusData: [],
      person: {},
      equipmentIds: '',
      equipmentVoData: [],
      equipmentVo: [
        { name: '档案编号', field: 'archiveSn' },
        { name: '资产编号', field: 'assetSn' },
        { name: '设备状态', field: 'status' },
        { name: '规格型号', field: 'standard' },
        { name: '量程', field: 'eqRange' },
        { name: '精度', field: 'accuracy' },
        { name: '下次检校日期', field: 'nextCheckDate' },
        { name: '存放位置', field: 'storageSite' },
      ],
      id: `${this.$route.params.id}`,
      taskList: [],
      qualification: [],
      project: [],
      testTaskVsibile: false,
      projectVsibile: false,
      selectPersonVisible: false,
      qualificationVsibile: false,
      isEdit: !!sessionStorage.getItem('addWarehouseOutEditData'), // 是否是编辑
      record: sessionStorage.getItem('addWarehouseOutEditData') ? JSON.parse(sessionStorage.getItem('addWarehouseOutEditData')) : null, // 编辑回显
      /** 业务控制参数：控制预还时间是否必填 */
      EQUIPMENT_EGRESS_DATE: false,
      /** 业务控制参数：设备外出工程项目作为必填项 */
      OUT_EQUIPMENT_LIMIT_SELECT: false,
      /** 业务控制参数：控制表单属性-资质类型是否显示 */
      EQ_ENGINEERING_FIELD: false,
      qualificationTypeData: [],
      allQualificationData: [],
      qualificationTypeDisplay: '',
    }
  },
  computed: {
    ...mapState(useAppUserStore, {
      currentUser: 'userInfo',
      companyId: 'companyId',
    }),
    ...mapState(useEquipmentStore, ['eqDataList']),
  },
  async created() {
    try {
      await Promise.all([
        this.getqualificationTypeData(),
        this.getqualificationTypeDataAll(),
      ])
    }
    catch (error) {
      console.error(error)
    }

    this.person = {
      name: this.currentUser.realName,
      id: this.currentUser.id,
    }
    this.getStatus()
    if (this.isEdit) {
      // 编辑回显
      this.getEditData()
    }

    this.EQUIPMENT_EGRESS_DATE = await this.getBusinessParams(
      'EQUIPMENT_EGRESS_DATE',
    )
    this.OUT_EQUIPMENT_LIMIT_SELECT = await this.getBusinessParams(
      'OUT_EQUIPMENT_LIMIT_SELECT',
    )
    this.EQ_ENGINEERING_FIELD = await this.getBusinessParams('EQ_ENGINEERING_FIELD')
  },
  methods: {
    async getBusinessParams(key) {
      try {
        const res = await mRequest.get(
          'tSBusinessParamController.do?getBusinessParam',
          {
            params: {
              key,
            },
          },
        )
        return res.obj === 'Y'
      }
      catch (err) {
        console.error(err)
        return false
      }
    },
    // 根据资质id数组，转换为文本或id字符串
    getQualification(data) {
      if (!Array.isArray(data) && !data.length) {
        this.qualificationTypeDisplay = ''
        this.formData.qualificationType = ''
      }
      const uniqueData = Array.from(new Set(data))
      this.qualificationTypeDisplay = uniqueData.map((id) => {
        const qua = this.allQualificationData.find(item => item.id === id)
        return qua ? qua.name : id
      }).join(',')
      this.formData.qualificationType = uniqueData.join(',')
    },
    async getqualificationTypeData() {
      const res = await mRequest.get('common-body/qualification/pagination', {
        params: {
          size: 999,
        },
      })
      this.qualificationTypeData = res.rows || []
    },
    async getqualificationTypeDataAll() {
      const res = await mRequest.get(`common-body/qualification/pagination`, {
        params: {
          isDeleted: 1,
          size: 999,
        },
      })
      this.allQualificationData = res.rows || []
    },
    getEditData() {
      // 编辑回显
      this.formData = JSON.parse(JSON.stringify(this.record)) // 覆盖
      this.formData.projectName = this.record.projectNames
      this.person.name = this.record.borrowUser
      if (this.record.testTaskSn) {
        // 处理关联任务
        this.formData.testTaskSn = this.record.testTaskSn
        this.formData.projectName = this.record.projectNames
      }
      // 处理时间
      this.formData.egressTime = formatDate(
        this.record.egressTime,
        'YYYY-MM-DD HH:mm:ss',
      )
      this.formData.expectReturnTime = formatDate(
        this.record.expectReturnTime,
        'YYYY-MM-DD HH:mm:ss',
      )
      // 附件历史文件由AttachmentHandler组件自动处理

      if (this.record.qualificationType) {
        const quaIdArr = this.record.qualificationType.split(',')
        this.getQualification(quaIdArr)
      }
      else {
        this.getQualification([])
      }
    },
    // #31363 设备状态为正常与报废留用之外的其他状态，状态文字显示红色
    // 正常、已停用、报废留用、已报废、正在维修
    redStatus(field, equipment) {
      if (field !== 'status')
        return ''
      const status = equipment[field]
      if (!status)
        return
      return ['正常', '报废留用'].includes(status) ? '' : 'red-val'
    },
    // #31363 下次检校日期小于当前日期的显示红色
    redNextCheckDate(field, equipment) {
      if (field !== 'nextCheckDate')
        return ''
      const nextCheckDate = equipment[field]
      if (!nextCheckDate)
        return
      const checkDate = new Date(nextCheckDate.replace(/-/g, '/')).getTime()
      const nowDate = new Date(new Date().toLocaleDateString()).getTime()
      return checkDate - nowDate <= 0 ? 'red-val' : ''
    },
    // 选择检测任务
    openTestTask() {
      this.testTaskVsibile = true
    },
    // 选择工程项目
    openProject() {
      this.projectVsibile = true
    },
    openSelectPerson() {
      this.selectPersonVisible = true
    },
    getStatus() {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest({
        method: 'POST',
        url: `${api.eqEgressList.status}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          dictGroupId: '402882cd5f998a58015f9998ff71001b',
        }),
      }).then((res) => {
        if (res && res.success) {
          this.statusData = res.obj
          this.getData()
        }
      }).finally(() => {
        toast.close()
      })
    },
    getData() {
      if (`${this.id.length}` < 3) {
        this.equipmentVoData = this.eqDataList
        return
      }

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest({
        method: 'GET',
        url: `${api.eqEgressList.getDetailById}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        params: {
          id: this.id,
        },
      }).then((res) => {
        if (res.code && res.code === 20000) {
          this.equipmentVoData = [res.data]
        }
      }).finally(() => {
        toast.close()
      })
    },
    showModal() {
      this.visible = true
    },
    checkEgressTime(cb) {
      if (this.formData.expectReturnTime && !this.isEdit) {
        if (
          new Date(this.formData.egressTime).valueOf()
            >= new Date(this.formData.expectReturnTime).valueOf()
        ) {
          showDialog({ message: '预还时间必须大于外出时间' })
          return
        }
      }

      if (
        new Date(this.formData.egressTime).valueOf() <= new Date().valueOf()
      ) {
        showConfirmDialog({
          title: '请确认外出时间！',
          message: `外出时间（${this.formData.egressTime}）小于当前系统时间，请确认是否继续提交？`,
        }).then(() => {
          cb()
        })
      }
      else {
        cb()
      }
    },
    async handleOk() {
      const result = await this.$refs.form.validate()
      if (result) {
        return
      }

      if (this.companyId === 'hxcd' && !this.formData.projectName) {
        showDialog({ message: '请关联工程项目' })
        return
      }

      this.checkEgressTime(async () => {
        const data = { ...this.formData }
        // 获取附件组件的qrKey
        const qrKey = this.$refs.attachmentHandler.qrKey || ''
        data.qrKey = qrKey

        // data.equipmentId = this.equipmentVoData.id;
        // data.equipmentName = this.equipmentVoData.name;
        // data.assetSn = this.equipmentVoData.assetSn;

        data.borrowUser = this.person.name
        data.borrowUserId = this.person.id
        data.projectName = this.handleProjectName(
          (data.projectName || '').replaceAll('，', ','),
        )
        const ids = this.equipmentVoData.map(d => d.id)

        const toast = showLoadingToast({
          duration: 0,
          forbidClick: true,
        })

        // 编辑-接口调用
        if (this.isEdit) {
          const param = {
            id: data.id,
            testTaskSn: data.testTaskSn,
            qualificationType: data.qualificationType,
            qrKey: data.qrKey,
            beforeStatus: data.beforeStatus,
            borrowUser: data.borrowUser,
            borrowUserId: data.borrowUserId,
            egressTime: data.egressTime,
            expectReturnTime: data.expectReturnTime,
            projectName: data.projectName,
            remark: data.remark,
          }
          mRequest({
            method: 'PUT',
            url: `${api.eqEgressList.editApply}/${param.id}`,
            data: param,
            headers: {
              'Content-Type': 'application/json; charset=UTF-8',
            },
          }).then((res) => {
            if (res.code && res.code !== 20010) {
              showNotify({ type: 'primary', message: '操作成功' })

              const equipmentStore = useEquipmentStore()
              equipmentStore.clearEqData()

              const pageState = useAppPageStateStore().getPage('addWarehouseOut')
              pageState.updateBefore = true
              this.$router.go(-1)
            }
          }).finally(() => {
            toast.close()
          })
          return
        }

        const toast2 = showLoadingToast({
          duration: 0,
          forbidClick: true,
        })
        mRequest({
          method: 'POST',
          url: api.eqEgressList.batchAdd,
          data: { eqEgress: data, equipmentIds: ids },
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        }).then((res) => {
          if (res.code && res.code !== 20010) {
            showNotify({ type: 'primary', message: '操作成功' })
            const equipmentStore = useEquipmentStore()
            equipmentStore.clearEqData()

            const pageState = useAppPageStateStore().getPage('addWarehouseOut')
            pageState.updateBefore = true
            this.$router.go(-1)
          }
          else {
            let msg = ''
            if (res.error && Array.isArray(res.error)) {
              res.error.forEach((d) => {
                msg += `[${d.eqName}][${d.eqSn}]`
              })
              showDialog({
                message: `${msg}状态不是在库，请重新选择外出设备`,
              })
            }
            else {
              showDialog({ message: res.message || res.msg })
            }
          }
        }).finally(() => {
          toast2.close()
        })
      })
    },
    getPerson(data) {
      this.person = data.length > 0 ? data[0] : {}
    },
    getTask(data) {
      const pData = []

      data.forEach((item) => {
        pData.push({
          id: item.projectId,
          name: item.projectName,
        })
      })

      this.taskList = data
      this.project = pData
      this.formData.testTaskSn = data.map(i => i.testTaskCode).join(',')
      this.formData.projectName = this.handleProjectName(
        this.project.map(i => i.name).join(','),
      )
      this.qualification = data.map(i => ({ id: i.qualificationTypeId, name: i.name }))

      // 关联任务的资质
      const uniqueQualificationIds = Array.from(
        new Set(
          data.flatMap((task) => {
            const idStr = task.qualificationTypeId || ''
            return idStr.split(',').map(id => id.trim()).filter(id => id)
          }),
        ),
      )
      this.getQualification(uniqueQualificationIds)
    },
    getProject(data) {
      const pNameArr = []

      data.forEach((item) => {
        if (!this.project.find(i => i.id === item.id)) {
          this.project.push({
            id: item.id,
            name: item.name,
          })
        }

        if (!pNameArr.includes(item.name)) {
          pNameArr.push(item.name)
        }
      })

      this.formData.projectName = pNameArr.join(',')
    },
    handleProjectName(val) {
      if (val) {
        const arr = val.split(',')
        return Array.from(new Set(arr)).join(',')
      }
      return val
    },
    syncProjectData() {
      const pName = this.formData.projectName
      if (pName) {
        const pArr = pName.split(',')
        this.project = this.project.filter(p => pArr.includes(p.name))
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
