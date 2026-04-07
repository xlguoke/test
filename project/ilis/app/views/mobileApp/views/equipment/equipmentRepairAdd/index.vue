<template>
  <div class="equipmentRepair">
    <van-sticky>
      <MobileTitleBar :title="title" left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <van-collapse v-model="activeNames">
      <van-collapse-item title="维修申请" name="0" icon="label-o">
        <div style="padding: 16px">
          <BaseInfo
            v-model:data="baseInfoFormData"
            :detail-data="dataSource"
            :readonly="isDetailPage || enableContactPage"
          />
        </div>
      </van-collapse-item>
      <van-collapse-item
        v-if="enableContactPage"
        title="外联情况"
        name="1"
        icon="records"
      >
        <div style="padding: 16px">
          <RepairContact
            v-model:data="repairContactFormData"
            :detail-data="dataSource"
            :readonly="isDetailPage"
          />
        </div>
      </van-collapse-item>
      <van-collapse-item
        v-if="enableRepairPage"
        title="维修情况"
        name="2"
        icon="records"
      >
        <div style="padding: 16px">
          <RepairDetail
            v-model:data="repairDetailFormData"
            :detail-data="dataSource"
            :readonly="isDetailPage"
          />
        </div>
      </van-collapse-item>
      <van-collapse-item
        v-if="enableTestPage"
        title="维修检验情况"
        name="3"
        icon="records"
      >
        <div style="padding: 16px">
          <RepairVerify
            v-model:data="repairVerifyFormData"
            :detail-data="dataSource"
            :readonly="isDetailPage"
          />
        </div>
      </van-collapse-item>
    </van-collapse>

    <ActionBar v-if="!isDetailPage">
      <van-button type="primary" @click="onSave">
        保存
      </van-button>
    </ActionBar>
  </div>
</template>

<script>
import qs from 'qs'
import {
  showDialog,
  showLoadingToast,
} from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import BaseInfo from './components/baseInfo.vue'
import RepairContact from './components/repairContact.vue'
import RepairDetail from './components/repairDetail.vue'
import RepairVerify from './components/repairVerify.vue'

export default {
  components: {
    ActionBar,
    BaseInfo,
    RepairContact,
    RepairDetail,
    RepairVerify,
    MobileTitleBar,
  },
  data() {
    return {
      activeNames: [],
      baseInfoFormData: {
        totalFee: 0,
      },
      repairContactFormData: {},
      repairDetailFormData: {},
      repairVerifyFormData: {},
      dataSource: {},
    }
  },
  computed: {
    enableContactPage() {
      if (this.isDetail) {
        return true
      }

      if (['40', '50', '60', '70'].includes(this.dataSource.status)) {
        return true
      }

      return false
    },
    enableRepairPage() {
      return this.enableContactPage
    },
    enableTestPage() {
      if (this.isDetail) {
        return true
      }

      if (['50', '60', '70'].includes(this.dataSource.status)) {
        return true
      }

      return false
    },
    id() {
      return this.$route.query.id || null
    },
    isAddPage() {
      return !this.id
    },
    isDetailPage() {
      return Number(this.$route.query.status) === 3
    },
    title() {
      if (this.isDetailPage) {
        return '查看详情'
      }
      if (this.id) {
        return '编辑维修申请'
      }
      return '新增维修申请'
    },
  },
  created() {
    if (!this.isAddPage) {
      this.getDetail()
    }
    else {
      this.activeNames = ['0']
    }
  },
  methods: {
    // 获取基本信息
    async getDetail() {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest
        .get('eqRepairController.do?getById', {
          params: {
            repairId: this.id,
          },
        })
        .finally(() => {
          toast.close()
        })

      if (res && res.code !== 20000) {
        const obj = res.obj

        if (obj.status === '40') {
          this.activeNames = ['1']
        }
        else if (obj.status === '50') {
          this.activeNames = ['3']
        }
        else {
          this.activeNames = ['0']
        }

        this.dataSource = obj
        this.setBaseInfoFormData(obj)
        this.setRepairContactFormData(obj)
        this.setRepairDetailFormData(obj)
        this.setRepairVerifyFormData(obj)
      }
    },
    setBaseInfoFormData(data) {
      const attachments = data.attachments || []

      this.baseInfoFormData = {
        id: data.id,
        name: data.name,
        repairSn: data.repairSn,
        repairServiceEndTime: data.repairServiceEndTime
          ? formatDate(data.repairServiceEndTime, 'YYYY-MM-DD')
          : undefined,
        totalFee: data.totalFee,
        phenomenon: data.phenomenon,
        reason: data.reason,
        disposeWay: data.disposeWay,
        remark: data.remark,
        attachmentIds: attachments.map(i => i.id).join(','),
        equipmentId: data.equipmentId,
        equipmentName: data.equipmentName,
      }
    },
    setRepairContactFormData(data) {
      const repairContactVo = data.repairContactVo || {}

      this.repairContactFormData = {
        'id': repairContactVo.id,
        'repairContacts': repairContactVo.repairContacts,
        'contactDetail': repairContactVo.contactDetail,
        'contactTime': repairContactVo.contactTime
          ? formatDate(repairContactVo.contactTime, 'YYYY-MM-DD')
          : undefined,
        'repairContactsId': repairContactVo.repairContactsId,
        'TEqRepair.id': data.id,
        'equipmentId': data.equipmentId,
      }
    },
    setRepairDetailFormData(data) {
      const repairDetailVo = data.repairDetailVo || {}
      const attachments = repairDetailVo.attachments || []

      this.repairDetailFormData = {
        'id': repairDetailVo.id,
        'repairMan': repairDetailVo.repairMan,
        'repairUnit': repairDetailVo.repairUnit,
        'materialFee': repairDetailVo.materialFee,
        'laborFee': repairDetailVo.laborFee,
        'otherFee': repairDetailVo.otherFee,
        'totalFee': repairDetailVo.totalFee,
        'attachmentIds': attachments.map(i => i.id).join(','),
        'repairManId': repairDetailVo.repairManId,
        'TEqRepair.id': data.id,
        'equipmentId': data.equipmentId,
      }
    },
    setRepairVerifyFormData(data) {
      const repairVerifyVo = data.repairVerifyVo || {}
      const attachments = repairVerifyVo.attachments || []

      this.repairVerifyFormData = {
        'id': repairVerifyVo.id,
        'personName': repairVerifyVo.personName,
        'content': repairVerifyVo.content,
        'verifyTime': repairVerifyVo.verifyTime
          ? formatDate(repairVerifyVo.verifyTime, 'YYYY-MM-DD')
          : undefined,
        'personId': repairVerifyVo.personId,
        'attachmentIds': attachments.map(i => i.id).join(','),
        'TEqRepair.id': data.id,
        'equipmentId': data.equipmentId,
      }
    },
    async onSave() {
      const {
        baseInfoFormData,
        repairContactFormData,
        repairDetailFormData,
        repairVerifyFormData,
      } = this

      if (!baseInfoFormData.equipmentId) {
        showDialog({ message: '请选择【维修申请】中的设备信息！' })
        return
      }

      // 维修中40，维修完成50
      if (this.dataSource.status === '40' || this.dataSource.status === '50') {
        if (!repairContactFormData.repairContacts) {
          showDialog({ message: '请选择【外联情况】中的联系人！' })
          return
        }

        if (!repairDetailFormData.repairMan) {
          showDialog({ message: '请选择【维修情况】中承修人！' })
          return
        }

        if (this.dataSource.status === '50' && !repairVerifyFormData.personId) {
          showDialog({ message: '请选择【修复检验情况】中检验人！' })
          return
        }

        const toast = showLoadingToast({
          duration: 0,
          message: '处理中...',
          forbidClick: true,
        })
        await mRequest
          .post(
            'eqRepairController.do?saveRepairContact',
            qs.stringify(repairContactFormData),
          )
          .catch(() => {
            toast.close()
          })
        await mRequest
          .post(
            'eqRepairController.do?saveRepairDetail',
            qs.stringify(repairDetailFormData),
          )
          .catch(() => {
            toast.close()
          })
        if (this.dataSource.status === '50') {
          await mRequest
            .post(
              'eqRepairController.do?saveRepairVerify',
              qs.stringify(repairVerifyFormData),
            )
            .catch(() => {
              toast.close()
            })
        }
        toast.close()

        showSuccessToast('操作成功！')
        this.$router.go(-1)
        return
      }

      // 新增/编辑
      const toast = showLoadingToast({
        duration: 0,
        message: '处理中...',
        forbidClick: true,
      })
      const res = await mRequest
        .post(
          'eqRepairController.do?saveRepair',
          qs.stringify(baseInfoFormData),
        )
        .finally(() => {
          toast.close()
        })

      if (res.success) {
        showSuccessToast('操作成功！')
        this.$router.go(-1)
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
