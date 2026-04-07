<template>
  <div class="equipmentOutgo">
    <div class="equipmentOutgo-detail">
      <div>
        <van-sticky>
          <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
        </van-sticky>

        <van-collapse v-model="collapseActive">
          <!-- <van-collapse-item title="所选设备" name="1" class="background-gray">
              <div class="equipmentOutgo-info" v-for="equipment in equipmentVoData">
                <div class="equipment-name">
                  <div class="left">
                    <p class="name">{{ equipment.name }}</p>
                    {{ equipment.equipmentSn }}
                  </div>
                </div>
                <div v-for="(item, index) in equipmentVo" :key="index">
                  {{ item.name }}：<span
                    :class="`${redStatus(item.field, equipment)} ${redNextCheckDate(item.field, equipment)}`">{{
                      equipment[item.field] || '/' }}</span>
                </div>
              </div>
            </van-collapse-item> -->
          <van-collapse-item title="延期信息" name="2" disabled>
            <div class="equipmentOutgo-dispose" style="padding: 0">
              <van-form ref="form">
                <van-field label="延期类型" clearable center required>
                  <template #input>
                    <van-radio-group
                      v-model="formData.type"
                      direction="horizontal"
                    >
                      <van-radio :name="0">
                        项目延期
                      </van-radio>
                      <van-radio :name="1">
                        项目流转
                      </van-radio>
                    </van-radio-group>
                  </template>
                </van-field>
                <van-field
                  v-if="formData.type === 1"
                  v-model="formData.testTaskSn"
                  label="关联任务"
                  placeholder="请选择"
                  autosize
                  readonly
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
                      @click="
                        () => {
                          project = []
                          formData.testTaskSn = ''
                          formData.projectName = ''
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
                  v-if="formData.type === 1"
                  v-model="formData.projectName"
                  label="关联工程项目"
                  clearable
                  type="textarea"
                  rows="1"
                  autosize
                  placeholder="请选择或输入（多个用逗号分隔）"
                  required
                  :disabled="!!formData.testTaskSn"
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

                <van-field
                  v-model="formData.beforeStatus"
                  label="延期前状态"
                  clearable
                  center
                  required
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
                  label="延期申请人"
                  clearable
                  center
                  placeholder="请选择"
                  required
                >
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

                <FormItemDate
                  v-model:value="formData.expectReturnTime"
                  readonly
                  label="延期归还日期"
                  placeholder="请选择"
                  required
                  input-align="left"
                  :enable-time="true"
                />

                <van-field
                  v-model="formData.remark"
                  label="备注"
                  rows="2"
                  autosize
                  type="textarea"
                  clearable
                  placeholder="请输入"
                >
                </van-field>
                <!-- <van-field name="uploader" label="附件">
                    <template #input>
                      <van-uploader v-model="fileList" :after-read="afterRead" />
                    </template>
                  </van-field> -->
              </van-form>
            </div>
          </van-collapse-item>
        </van-collapse>
      </div>
    </div>

    <div class="equipmentOutgo-btns">
      <van-button block type="primary" @click="handleOk()">
        完成
      </van-button>
      <van-button
        block
        @click="
          () => {
            $router.go(-1)
          }
        "
      >
        取消
      </van-button>
    </div>

    <SelectPerson
      v-model:value="selectPersonVisible"
      @selected-ok="getPerson"
    />

    <SelectTask
      v-model:value="testTaskVsibile"
      :is-multiple="true"
      @selected-ok="getTask"
    />

    <SelectProject
      v-model:value="projectVsibile"
      :is-multiple="false"
      :init-selected="project"
      @selected-ok="getProject"
    />
  </div>
</template>

<script>
import { mapState } from 'pinia'
import qs from 'qs'
import {
  showDialog,
  showLoadingToast,
  showNotify,
} from 'vant'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import SelectPerson from '~/views/mobileApp/components/selectPerson.vue'
import SelectProject from '~/views/mobileApp/components/selectProject.vue'
import SelectTask from '~/views/mobileApp/components/selectTestTask.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useEquipmentStore } from '~/views/mobileApp/store/useEquipmentStore'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

export default {
  components: {
    FormItemDate,
    SelectPerson,
    SelectTask,
    SelectProject,
    MobileTitleBar,
  },
  data() {
    const equipmentStore = useEquipmentStore()

    return {
      equipmentStore,
      collapseActive: ['1', '2'],
      fileList: [],
      visible: false,
      formData: {
        type: 0,
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
      ],
      id: `${this.$route.params.id}`,
      project: [],
      selectDateType: 0,
      testTaskVsibile: false,
      projectVsibile: false,
      selectPersonVisible: false,
    }
  },
  computed: {
    ...mapState(useAppUserStore, {
      currentUser: 'userInfo',
      companyId: 'companyId',
    }),
    ...mapState(useEquipmentStore, ['eqDataList']),
  },
  created() {
    this.person = {
      name: this.currentUser.realName,
      id: this.currentUser.id,
    }
    this.getStatus()
    this.getEqEgress()
  },
  methods: {
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
    afterRead(file) {
      file.status = 'uploading'
      file.message = '上传中...'
      const formData = new FormData()
      formData.append('file', file.file)
      mRequest
        .post(api.common.upload, formData)
        .then((res) => {
          file.status = 'done'
          file.message = '上传成功'
          if (res.obj && res.obj[0]) {
            file.obj = res.obj[0]
          }
        })
        .catch((_) => {
          file.status = 'failed'
          file.message = '上传失败'
        })
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
    getEqEgress() {
      mRequest({
        method: 'GET',
        url: `${api.eqEgressList.getEgressInfo}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        params: {
          id: this.id,
        },
      }).then((res) => {
        if (res.code && res.code === 20000) {
          this.eqEgressId = res.data.egressVo.id
        }
      })
    },
    async handleOk() {
      const result = await this.$refs.form.validate()
      if (result) {
        return
      }

      if (!this.formData.projectName && this.formData.type === 1) {
        showDialog({ message: '请关联工程项目' })
        return
      }

      if (!this.person.name) {
        showDialog({ message: '请选择延期申请人' })
        return
      }

      if (!this.formData.expectReturnTime) {
        showDialog({ message: '请选择延期归还日期' })
        return
      }

      if (!this.formData.beforeStatus) {
        showDialog({ message: '请选择延期前状态' })
        return
      }

      if (
        new Date(this.formData.expectReturnTime).valueOf()
          <= new Date().valueOf()
      ) {
        showDialog({ message: '延期归还时间必须要大于当前时间' })
        return
      }

      const data = { ...this.formData }

      const idsArr = []
      this.fileList.forEach((item) => {
        if (item.status === 'done') {
          idsArr.push(item.obj.id)
        }
      })
      data.attachmentIds = idsArr.join(',')

      // data.equipmentId = this.equipmentVoData.id;
      // data.equipmentName = this.equipmentVoData.name;
      // data.assetSn = this.equipmentVoData.assetSn;

      data.borrowUser = this.person.name
      data.borrowUserId = this.person.id

      const ids = [this.eqEgressId]

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest({
        method: 'put',
        url: api.eqEgressList.batchOperation,
        data: {
          operation: {
            equipmentStatus: this.formData.beforeStatus,
            operationType: 80,
            remark: this.formData.remark,
            type: this.formData.type,
            eqEgress: {
              expectReturnTime: data.expectReturnTime,
              projectName:
                this.formData.type === 1
                  ? this.handleProjectName(
                      (data.projectName || '').replaceAll('，', ','),
                    )
                  : null,
              testTaskSn: this.formData.type === 1 ? data.testTaskSn : null,
            },
          },
          ids,
        },
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          showNotify({ type: 'primary', message: '操作成功' })
          const equipmentStore = useEquipmentStore()
          equipmentStore.clearEqData()

          const pageState = useAppPageStateStore().getPage('postponeEq')
          pageState.updateBefore = true
          this.$router.go(-1)
        }
        else {
          showDialog({ message: res.message || res.msg })
        }
      }).finally(() => {
        toast.close()
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

      this.project = pData
      this.formData.testTaskSn = data.map(i => i.testTaskCode).join(',')
      this.formData.projectName = this.handleProjectName(
        this.project.map(i => i.name).join(','),
      )
    },
    getProject(data) {
      const pNameArr = this.formData.projectName
        ? this.formData.projectName.replaceAll('，', ',').split(',')
        : []

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
