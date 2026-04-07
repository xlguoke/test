<!-- eslint-disable -->
<template>
  <div class="equipmentOutgo-dispose equipmentOutgo-detail">
    <div>
      <div>
        <div style="
            font-size: 14px;
            padding-bottom: 10px;
            margin-bottom: 10px;
            border-bottom: solid 1px #e2e2e2;
          ">
          {{ equipmentVoData.name }}
          <span v-if="status" class="equipmentOutgo-detail-tag">{{
            status
              ? egressStatusData.find((data) => data.value == equipmentVoData.egressStatus)?.name
              : ''
          }}</span>
          <p class="text-xs">
            {{ equipmentVoData.equipmentSn }}
          </p>
        </div>
      </div>
      <div>
        <a-form :model="formState" layout="horizontal">
          <a-form-item label="延期类型" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
            <a-radio-group v-model:value="formState.type" name="radioGroup">
              <a-radio value="0">项目延期</a-radio>
              <a-radio value="1">项目流转</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item v-if="formState.type === '1'" label="关联任务" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
            <a-flex gap="8">
              <a-textarea v-model:value="formState.testTaskSn" placeholder="请选择关联任务" disabled />
              <a-button v-if="!!formState.testTaskSn" @click="() => {
                formState.testTaskSn = ''
                formState.projectName = ''
              }">
                清空
              </a-button>
              <a-button @click="$refs.SelectTask.showDrawer()">
                选择
              </a-button>
            </a-flex>
          </a-form-item>
          <a-form-item v-if="formState.type === '1'" label="工程项目" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
            <a-flex gap="8">
              <a-textarea v-model:value="formState.projectName" placeholder="请选择工程项目或输入（多个用逗号分隔）"
                :disabled="!!formState.testTaskSn" :rows="1" />
              <a-button v-if="!formState.testTaskSn" @click="$refs.SelectProject.showDrawer()">
                选择
              </a-button>
            </a-flex>
          </a-form-item>
          <a-form-item label="延期前状态" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
            <a-select v-if="statusData && statusData.length > 0" v-model:value="formState.beforeStatus"
              placeholder="请选择" :options="statusOptions">
            </a-select>
            <a-select v-else placeholder="数据加载中..." loading disabled></a-select>
          </a-form-item>
          <a-form-item label="延期申请人" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
            <a-flex gap="8">
              <a-input v-model:value="person.name" placeholder="请选择延期申请人"></a-input>
              <a-button style="margin-top: 0" @click="
                () => {
                  $refs.SelectPerson.showDrawer()
                }
              ">
                选择
              </a-button>
            </a-flex>
          </a-form-item>
          <a-form-item label="延期归还日期" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
            <a-input v-model:value="formState.expectReturnTime" readonly placeholder="请选择"
              @click="expectReturnTimeOpen = true" />
          </a-form-item>
          <a-form-item label="备注" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
            <a-textarea v-model:value="formState.remark" placeholder="请输入"></a-textarea>
          </a-form-item>
        </a-form>
      </div>
      <div>
        <div class="pt-4">
          <a-button block type="primary" @click="handleOk()" :loading="confirmLoading">
            完成
          </a-button>
          <a-button class="mt-2" block @click="routeBack()">
            取消
          </a-button>
        </div>
      </div>
    </div>

    <SelectTask ref="SelectTask" :callback="getTask" />
    <SelectProject ref="SelectProject" :callback="getProject" />
    <SelectPerson ref="SelectPerson" :callback="getPerson" :get-data-cb="getPersonData" />
    <DateSelector v-model:open="expectReturnTimeOpen" enable-time
      @select="(val) => { formState.expectReturnTime = val }" />
  </div>
</template>

<!-- eslint-disable -->
<script>
import { message } from 'ant-design-vue'
import qs from 'qs'
import SelectTask from '../add/components/selectTask.vue'
import SelectProject from '../add/components/selectProject.vue'
import SelectPerson from '../dispose/components/selectPerson.vue'
import DateSelector from '~/providers-moblie/components/DateSelector.vue'
import mApi from '~/providers-moblie/common/api'
import mAjax from '~/providers-moblie/common/ajax'
import { usePermissionStore } from '~/store/permissionStore'

export default {
  components: {
    SelectPerson,
    SelectTask,
    SelectProject,
    DateSelector,
  },
  data () {
    return {
      visible: false,
      person: {},
      equipmentIds: '',
      equipmentVoData: [],
      equipmentVo: [
        { name: "档案编号", field: "archiveSn" },
        { name: "资产编号", field: "assetSn" },
        { name: "设备状态", field: "status" },
        { name: "规格型号", field: "standard" },
        { name: "量程", field: "eqRange" },
        { name: "精度", field: "accuracy" },
        { name: "下次检校日期", field: "nextCheckDate" },
      ],
      project: [],
      currentDate: new Date(),
      formState: {
        type: '0',
      },
      id: this.$route.params.id, // 设备idthis.$route.params.isLogin
      status: this.$route.params.status,
      isLogin: this.$route.params.isLogin,
      expectReturnTimeOpen: false,
      statusData: [], // 延期前状态
      eqEgressId: '',
      confirmLoading: false,
      egressStatusData: [
        { name: '全部', value: 0 },
        { name: '库存', value: 10 },
        { name: '外出待确认', value: 20 },
        { name: '外出被拒绝', value: 30 },
        { name: '外出', value: 40 },
        { name: '归还待确认', value: 50 },
        { name: '归还被拒绝', value: 60 },
        { name: '外出延期', value: 70 },
        { name: '延期待确认', value: 80 },
        { name: '延期被拒绝', value: 90 },
      ],
    };
  },
  computed: {
    statusOptions () {
      return this.statusData.map(item => ({
        label: item.typename,
        value: item.typecode
      }));
    }
  },
  created () {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (userInfo) {
      this.person = { id: userInfo.userId, name: userInfo.realName }
    }
    // 获取设备当前状态
    this.getStatus();
    // 获取设备外出记录ids
    this.getEqEgress();
  },
  methods: {
    async handleOk (e) {
      if (!this.formState.beforeStatus) {
        message.warning("请选择延期前状态");
        return;
      }

      if (!this.formState.projectName && this.formState.type == 1) {
        message.warning("请关联工程项目");
        return;
      }

      if (!this.person.name) {
        message.warning("请选择延期申请人");
        return;
      }

      if (!this.formState.expectReturnTime) {
        message.warning("请选择延期归还日期");
        return;
      }

      if (new Date(this.formState.expectReturnTime).valueOf() <= new Date().valueOf()) {
        message.warning("延期归还时间必须要大于当前时间");
        return;
      }

      this.confirmLoading = true;
      let data = { ...this.formState };
      let ids = [this.eqEgressId];

      mAjax({
        method: "PUT",
        url: `${mApi.eqEgressList.batchOperation}`,
        data: {
          operation: {
            equipmentStatus: this.formState.beforeStatus,
            operationType: 80,
            remark: this.formState.remark,
            type: this.formState.type,
            eqEgress: {
              expectReturnTime: data.expectReturnTime,
              projectName: this.formState.type == 1 ? this.handleProjectName((data.projectName || "").replaceAll("，", ',')) : null,
              testTaskSn: this.formState.type == 1 ? data.testTaskSn : null
            },
          },
          ids: ids
        },
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        }
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          message.success('操作成功');
          this.$router.push({
            name: 'detail',
          })
        } else {
          message.error(res.message || res.msg);
        }
      }).finally(() => {
        this.confirmLoading = false
      });
    },
    handleProjectName (val) {
      if (val) {
        const arr = val.split(',')
        return Array.from(new Set(arr)).join(',')
      }
      return val
    },
    // 获取设备外出记录id
    getEqEgress () {
      mAjax({
        method: "GET",
        url: `${mApi.eqEgressList.getEgressInfo}`,
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
        params: {
          id: this.id,
        },
      }).then((res) => {
        if (res.code && res.code === 20000) {
          this.eqEgressId = res.data.egressVo.id;
          this.status = res.data.egressVo.status;
        }
      });
    },
    // 获取设备状态[正常，维修等]
    getStatus () {
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
          this.getData()
        }
      })
    },
    // 获取设备信息
    getData () {
      mAjax({
        method: 'GET',
        url: `${mApi.eqEgressList.getDetailById}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        params: {
          id: this.id,
        },
      }).then((res) => {
        if (res.code && res.code === 20000) {
          this.equipmentVoData = res.data
        }
      })
    },
    // 获取选择的工程项目
    getProject (datas) {
      if (datas.length === 0) {
        this.formState.projectName = ''
        return
      }

      const pNameArr = this.formState.projectName ? this.formState.projectName.replace(/，/g, ',').split(',') : []
      datas.forEach((item) => {
        if (!pNameArr.includes(item.name)) {
          pNameArr.push(item.name)
        }
      })
      this.formState.projectName = pNameArr.join(',')
      this.$refs.SelectProject.selectedRows = []
    },
    getPerson (data) {
      this.person = data || {}
    },
    // 获取人员数据
    getPersonData (data) {
      const userId = localStorage.getItem('userId')
      const person = data.find(item => item.id == userId)
      if (person) {
        this.person = person
      }
    },
    // 获取选择的关联任务
    getTask (tasks) {
      if (tasks.length === 0) {
        this.formState.testTaskSn = ''
        this.formState.projectName = ''
        return
      }

      const testTaskSnArr = []
      const projectNameArr = []

      tasks.forEach((item) => {
        if (!testTaskSnArr.includes(item.testTaskCode)) {
          testTaskSnArr.push(item.testTaskCode)
        }
        if (!projectNameArr.includes(item.projectName)) {
          projectNameArr.push(item.projectName)
        }
      })
      this.formState.testTaskSn = testTaskSnArr.join(',')
      this.formState.projectName = projectNameArr.join(',')
      this.$refs.SelectTask.selectedRows = []
    },

    routeBack () {
      if (this.$route.params.isLogin == 1) {
        const url = top.location.href.split(top.location.hash)
        if (url.length) {
          top.location.replace(url[0])
        }
        else {
          this.$router.go(-1)
        }
      }
      else {
        this.$router.go(-1)
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import '../list/index.less';
</style>
