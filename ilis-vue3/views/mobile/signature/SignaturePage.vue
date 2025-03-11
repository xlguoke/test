<template>
  <div class="max-w-[640px] mx-auto">
    <div class="info">
      <div class="flex">
        <span>借用详情：</span>
        <span>{{ EquipmentRentTypeDict.getLabelByKey(detail?.rentType) }}</span>
      </div>
      <div>
        <span>设备编号：</span>
        <span>{{ detail?.equipmentSn }}</span>
      </div>
      <div>
        <span>设备名称：</span>
        <span>{{ detail?.equipmentName }}</span>
      </div>
      <div>
        <span>设备规格：</span>
        <span>{{ detail?.eqStandard }}</span>
      </div>
      <div>
        <span>借出部门(单位)：</span>
        <span>{{ detail?.outOrg }}</span>
      </div>
      <div>
        <span>借出联系人：</span>
        <span>{{ detail?.outOrgContacts }}</span>
      </div>
      <div>
        <span>借入部门(单位)：</span>
        <span>{{ detail?.inOrg }}</span>
      </div>
      <div>
        <span>借入联系人：</span>
        <span>{{ detail?.inOrgContacts }}</span>
      </div>
      <div>
        <span>设备单价：</span>
        <span>{{ detail?.equipmentPrice }}</span>
      </div>
      <div>
        <span>租赁开始日期：</span>
        <span>{{ AnyDateTimeHelper.format(detail?.rentStartTime || '', EDateFormatType.YYYY_MM_DD) }}</span>
      </div>
      <div>
        <span>租赁结束日期：</span>
        <span>{{ AnyDateTimeHelper.format(detail?.rentEndTime || '', EDateFormatType.YYYY_MM_DD) }}</span>
      </div>
      <div>
        <span>实际归还日期：</span>
        <span>{{ AnyDateTimeHelper.format(detail?.returnTime || '', EDateFormatType.YYYY_MM_DD) }}</span>
      </div>
      <div>
        <span>双方协议内容：</span>
        <span>{{ detail?.agreementContent }}</span>
      </div>
      <div>
        <span>备注：</span>
        <span>{{ detail?.remark }}</span>
      </div>
      <div>
        <span>附件材料：</span>
        <span>
          <div v-for="(item, index) in fileList" :key="index">
            <span>{{ item.name }}</span>
            <!-- <a :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.uid}`">{{ item.name }}</a> -->
          </div>
        </span>
      </div>
    </div>
    <div v-if="showSign">
      <div style="padding: 12px; font-size: 14px;">
        签名：
      </div>
      <SignatureVue
        @confirm="handleConfirm"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { closeToast, showDialog, showLoadingToast, showToast } from 'vant'
import { getEquipmentRentDetailWithouAuth } from './api'
import SignatureVue from '~/views/mobile/signature/index.vue'
import { EquipmentRentEntity, EquipmentRentSignStatus, EquipmentRentTypeDict } from '~/views/equipment/rent/EquipmentRentEntity'
import { SignType } from '~/components/IlisSignature'
import { submitEquipmentRentProcessBySign, submitEquipmentReturn } from '~/views/equipment/rent/api'

const urlParams = new URLSearchParams(location.search)
const id = urlParams.get('id')
const keyId = urlParams.get('keyId')
const unitCode = urlParams.get('unitCode')
const type = urlParams.get('type') as SignType

// const rootUrl = import.meta.env.VITE_ILIS_BASE

const detail = ref<EquipmentRentEntity>()

const fileList = ref([] as any[])

const showSign = ref(true)

async function getData() {
  if (!unitCode || !id || !keyId) {
    return showToast('链接地址参数错误！')
  }
  const { data } = await getEquipmentRentDetailWithouAuth(unitCode, id)
  detail.value = EquipmentRentEntity.fromJSON(data)
  if (type === SignType.BORROW && data.signerStatus === EquipmentRentSignStatus.RENT) {
    showDialog({
      message: '已签名，无需再次签名！',
    })
    showSign.value = false
  }
  if (type === SignType.RETURN && (data.signerStatus === EquipmentRentSignStatus.RETURN)) {
    showDialog({
      message: '已签名，无需再次签名！',
    })
    showSign.value = false
  }
  fileList.value = data.files.map((item: any) => ({
    uid: item.attachmentId,
    name: item.name,
    url: item.url,
  }))
}

getData()

async function handleConfirm(data: string) {
  if (type === SignType.RETURN) {
    showLoadingToast({
      message: '提交中...',
      forbidClick: true,
      duration: 0,
    })
    await submitEquipmentReturn(unitCode!, id!, keyId!, data).finally(() => {
      closeToast()
    })
    showToast('操作成功')
    showSign.value = false
  }
  else {
    showLoadingToast({
      message: '提交中...',
      forbidClick: true,
      duration: 0,
    })
    const { data: res } = await submitEquipmentRentProcessBySign(unitCode!, id!, keyId!, data).finally(() => {
      closeToast()
    })
    if (res.signerStatus && res.submitStatus) {
      showToast('签名成功，流程已自动提交')
    }
    else if (!res.signerStatus && res.signerMsg) {
      showDialog({
        message: `签名失败，${res.signerMsg}`,
      })
    }
    else if (res.signerStatus && !res.submitStatus) {
      showDialog({
        message: `签名成功，流程自动提交失败，请联系发起人再次提交。错误信息：${res.submitMsg}`,
      })
    }
    showSign.value = false
  }
}
</script>

<style lang="less" scoped>
.info{
  padding: 12px;
  &>div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f2f2f2;
    &>span:nth-child(1){
      font-size: 12px;
      color: #8c8c8c;
    }
    &>span:nth-child(2){
      font-size: 12px;
    }
  }
}
</style>
