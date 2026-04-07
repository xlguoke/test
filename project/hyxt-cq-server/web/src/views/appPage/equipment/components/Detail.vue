<template>
  <a-modal
    v-model:visible="visible"
    title="设备详情"
    :mask-closable="false"
    :keyboard="false"
    cancel-text="关闭"
    width="1000px"
    @ok="handleOk"
  >
    <a-spin :spinning="spinning">
      <a-descriptions bordered size="small" :column="2">
        <a-descriptions-item label="设备编号">{{ form.sn }}</a-descriptions-item>
        <a-descriptions-item label="设备名称">{{ form.name }}</a-descriptions-item>
        <a-descriptions-item label="标准设备" :span="4">
          <template v-for="(d, i) in form.bzEquipments" :key="d.id">
            {{ i ? "、" : "" }}{{ d.bzEquipment }}
          </template>
        </a-descriptions-item>
        <a-descriptions-item label="生产厂家">{{ form.manufacturer }}</a-descriptions-item>
        <a-descriptions-item label="规格型号">{{ form.specification }}</a-descriptions-item>
        <a-descriptions-item label="精准度">{{ form.accuracy }}</a-descriptions-item>
        <a-descriptions-item label="量程或规格">{{ form.measuringRange }}</a-descriptions-item>
        <a-descriptions-item label="出厂编号">{{ form.factorySn }}</a-descriptions-item>
        <a-descriptions-item label="单价">{{ form.price }}</a-descriptions-item>
        <a-descriptions-item label="购置日期">
          {{ form.buyDate ? formatDate(form.buyDate) : "-" }}
        </a-descriptions-item>
        <a-descriptions-item label="检定校准周期(月)">
          {{ form.calibrationCycle }}
        </a-descriptions-item>
        <a-descriptions-item label="检定校准单位">{{ form.calibrationUnit }}</a-descriptions-item>
        <a-descriptions-item label="检定校准日期">
          {{ form.lastCalibrationDate ? formatDate(form.lastCalibrationDate) : "-" }}
        </a-descriptions-item>
        <a-descriptions-item label="到期日期">
          {{ form.calibrationExpireDate ? formatDate(form.calibrationExpireDate) : "-" }}
        </a-descriptions-item>
        <a-descriptions-item label="使用状态">{{ form.useStatus }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="3">{{ form.remark }}</a-descriptions-item>
        <a-descriptions-item label="附件" :span="3">
          <file-list :datas="form.attachments" />
        </a-descriptions-item>
      </a-descriptions>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue"
import { getDetail } from "@/api/equipment.api"
import { formatDate } from "@/assets/js/common"
import FileList from "@/components/fileList/index.vue"
import userStore from "@/stores/userInfo"
const { userInfo } = userStore()

const spinning = ref(false)
const visible = ref(false)
const openModal = (id: string) => {
  form.value = { bzEquipments: [], attachments: [] }
  visible.value = true
  getDatas(id)
}
defineExpose({
  openModal
})

const form = ref<any>({
  bzEquipments: [],
  attachments: []
})
const getDatas = (id: string) => {
  spinning.value = true
  getDetail(id)
    .then((res) => {
      spinning.value = false
      form.value = res
    })
    .catch(() => {
      spinning.value = false
    })
}

const handleOk = () => {
  visible.value = false
}
</script>

<style scoped lang="less">
:deep(.ant-descriptions-item-label) {
  width: 150px;
}
</style>
