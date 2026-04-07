<template>
  <div>
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <div class="eqdetails">
      <p style="display: flex; justify-content: space-between">
        <span>设备名称：{{ eqDetils.name }}</span>
        <van-tag v-if="eqDetils.transferStatus === '10'" color="#6fae00">
          闲置
        </van-tag>
        <van-tag v-if="eqDetils.transferStatus === '20'" color="#154bd0">
          调拨中
        </van-tag>
        <van-tag v-if="eqDetils.transferStatus === '30'" type="warning">
          使用中
        </van-tag>
        <van-tag v-if="eqDetils.transferStatus === '40'" type="success">
          已安装
        </van-tag>
        <van-tag v-if="eqDetils.transferStatus === '50'" color="#ff99aa">
          已移交
        </van-tag>
      </p>
      <p>设备编号：{{ eqDetils.equipmentSn }}</p>
      <p>资产编号：{{ eqDetils.assetSn }}</p>
      <p>设备状态：{{ eqDetils.status }}</p>
      <p>规格型号：{{ eqDetils.standard }}</p>
      <p>量程：{{ eqDetils.eqRange }}</p>
      <p>精度：{{ eqDetils.accuracy }}</p>
      <p>下次校验时间：{{ eqDetils.nextCheckDate }}</p>
    </div>
    <van-form>
      <van-cell-group inset>
        <FormItemInput
          v-model:value="selProject.name"
          required
          label="工程项目"
          placeholder="工程项目"
          readonly
        />

        <FormItemInput
          v-model:value="turnUser"
          required
          label="移交人"
          placeholder="移交人"
        />

        <FormItemDate
          v-model:value="turnTime"
          required
          label="移交日期"
          placeholder="请选择日期"
        />

        <FormItemInput
          v-model:value="turnContact"
          type="number"
          label="联系方式"
          placeholder="请输入"
        />

        <FormItemInput
          v-model:value="turnRemark"
          label="备注"
          placeholder="请输入备注"
        />

        <van-field name="uploader" label="附件" input-align="right">
          <template #input>
            <van-uploader v-model="fileList" :after-read="afterRead" />
          </template>
        </van-field>
      </van-cell-group>

      <ActionBar>
        <van-button type="primary" @click="submitCallout">
          确定
        </van-button>
      </ActionBar>
    </van-form>

    <!-- 工程项目 -->
    <!-- <van-popup v-model:show="projectShow" round position="bottom">
        <van-cascader title="调入方" :field-names="{ text: 'name', value: 'id', children: 'children' }"
          :options="projectList" @close="projectShow = false" @finish="selProjectConfirm" />
      </van-popup> -->

    <!-- 人员 -->
    <!-- <van-popup v-model:show="installPersonShow" position="bottom">
        <van-picker title="安装人员" :columns="personList" @confirm="selInstallPersonConfirm" />
      </van-popup> -->
  </div>
</template>

<script>
import {
  showNotify,
} from 'vant'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    ActionBar,
    FormItemInput,
    FormItemDate,
    MobileTitleBar,
  },
  data() {
    return {
      turnUser: '',
      turnContact: '',
      installDescription: '',
      turnRemark: '',
      // projectShow: false,
      installPersonShow: false,
      selProject: {},
      formatDate,
      turnTime: formatDate(new Date(), 'YYYY-MM-DD'),
      callOutRemark: '',
      fileList: [],
      abnormal: '0',
      eqid: this.$route.params.id,
      eqDetils: {},
      projectList: [],
      personList: [],
      selInstallPerson: {},
    }
  },
  computed: {},
  created() {
    this.getdepDetails()
    // this.getProjectlist();
  },
  methods: {
    // selInstallPersonConfirm({ selectedOptions }) {
    //   this.selInstallPerson = selectedOptions[0];
    // },
    // selProjectConfirm(v) {
    //   this.projectShow = false;
    //   this.selProject = v.selectedOptions.pop();
    //   this.getInstallPerson();
    // },
    submitCallout() {
      this.submitCallIn()
    },
    // getInstallPerson() {
    //   let url = `rest/userRelation/list?objectId=${this.selProject.id}`
    //   mRequest.get(url, {}).then(res => {
    //     if (res.code === 20000) {
    //       this.personList = res.data
    //       if (res.data.length) {
    //         this.selInstallPerson = res.data[0]
    //       }
    //     }
    //   })
    // },
    getHistoryList() {},
    // openInstallPerson() {  //打开安装人员
    //   if (!this.selProject.id) {
    //     showNotify({ type: "warning", message: "请先选择工程项目" });
    //     return;
    //   }
    //   this.installPersonShow = true;
    // },
    getdepDetails() {
      mRequest
        .get(`rest/equipmentNewController/detail?id=${this.eqid}`, {})
        .then((res) => {
          if (res.code === 20000) {
            this.eqDetils = res.data
            this.selProject = {
              name: res.data.callInName,
              id: res.data.callInId,
            }
          }
        })
    },
    submitCallIn() {
      if (!this.turnTime || !this.selProject.id || !this.turnUser) {
        showNotify({ type: 'warning', message: '请检查必填项' })
        return
      }
      const fileids = this.fileList.map((item) => {
        return item.obj.id
      })
      const params = {
        eqIds: [this.eqid],
        attachmentIds: fileids,
        operateType: '50',
        projectName: this.selProject.name,
        projectId: this.selProject.id,
        turnTime: `${this.turnTime} 00:00:00`,
        turnContact: this.turnContact,
        turnRemark: this.turnRemark,
        turnUser: this.turnUser,
      }
      mRequest({
        method: 'POST',
        url: 'rest/eqTransfer/record',
        data: JSON.stringify(params),
        headers: {
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 20000) {
          showNotify({ type: 'success', message: '操作成功' })
          this.$router.go(-1)
        }
      })
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
    // getProjectlist() {
    //   mRequest.get('rest/eqTransfer/projectOrg/list', {}).then(res => {
    //     if (res.code === 20000) {
    //       if (res.data.length) {
    //         res.data.forEach(item => {
    //           if (item.type == 20) {
    //             this.projectList = [item];
    //           }
    //         })

    //       }

    //     }
    //   })
    // }
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
