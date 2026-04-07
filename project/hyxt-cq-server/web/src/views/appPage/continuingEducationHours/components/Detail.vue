<template>
  <a-modal
    v-model:visible="visible"
    :title="title + '继续教育学时'"
    :mask-closable="false"
    :keyboard="false"
    :confirm-loading="confirmLoading"
    width="700px"
    @ok="handleOk"
  >
    <a-spin :spinning="spinning">
      <div style="min-height: 350px; margin-right: 20px">
        <a-form
          ref="refForm"
          :model="form"
          :label-col="{ style: { width: '110px' } }"
          :wrapper-col="{ span: 20 }"
        >
          <a-row>
            <a-col :span="10">
              <a-form-item
                label="姓名"
                name="orgPersonName"
                :rules="[{ required: true, message: '请输入姓名' }]"
              >
                <a-input v-model:value="form.orgPersonName" placeholder="请输入姓名" />
              </a-form-item>
            </a-col>
            <a-col :span="11">
              <a-form-item
                label="证件号码"
                name="idNum"
                :rules="[{ required: true, message: '请输入证件号码' }]"
              >
                <a-input v-model:value="form.idNum" placeholder="请输入证件号码" />
              </a-form-item>
            </a-col>
            <a-col :span="3" style="text-align: right">
              <a-button type="primary" @click="openPersonModal">选择</a-button>
            </a-col>
            <a-col :span="24">
              <a-form-item
                label="培训项目"
                name="trainItem"
                :rules="[{ required: true, message: '请输入培训项目' }]"
              >
                <a-input v-model:value="form.trainItem" placeholder="请输入培训项目" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item
                label="培训地点"
                name="trainLocation"
                :rules="[{ required: true, message: '请输入培训地点' }]"
              >
                <a-input v-model:value="form.trainLocation" placeholder="请输入培训地点" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="年度"
                name="annual"
                :rules="[{ required: true, message: '请选择年度' }]"
              >
                <a-date-picker
                  v-model:value="form.annual"
                  picker="year"
                  style="width: 100%"
                  value-format="YYYY"
                  placeholder="请选择年度"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="培训时间"
                name="trainTime"
                :rules="[{ required: true, message: '请选择培训时间' }]"
              >
                <!-- <a-date-picker
                  v-model:value="form.trainTime"
                  style="width: 100%"
                  placeholder="请选择培训时间"
                /> -->
                <a-range-picker v-model:value="dateRangeValue" @change="setDateRange" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="学时"
                name="hours"
                :rules="[{ required: true, message: '请输入学时' }]"
              >
                <a-input v-model:value="form.hours" placeholder="请输入学时" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="备注">
                <a-textarea v-model:value="form.remark" placeholder="请输入备注" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-spin>
    <Personnel
      v-model:visible="personVisible"
      :selected="personDatas"
      :is-pagination="true"
      type="radio"
      @confirm="choosePerson"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { FormInstance, message, Modal } from "ant-design-vue"
import {
  addApi,
  editApi,
  detailApi,
  DataItemType,
  checkidentityInformationApi
} from "@/api/continuingEducationHours.api"
import Personnel from "@/components/commonListModal/personnel.vue"
import dayjs, { Dayjs } from "dayjs"

const emit = defineEmits(["updateList"])
const title = ref("")
const spinning = ref(false)
const visible = ref(false)
const editId = ref("")
const openModal = (id: string) => {
  title.value = id ? "编辑" : "新增"
  editId.value = id || ""
  visible.value = true
  id && getDatas()
}

defineExpose({
  openModal
})

//时间范围绑定
let dateRangeValue = ref<[Dayjs | null, Dayjs | null]>()

//选择时间回调
const setDateRange = (v) => {
  if (v) {
    form.value.trainTime = v[0].valueOf()
    form.value.trainTimeEnd = v[1].valueOf()
  } else {
    form.value.trainTime = ""
    form.value.trainTimeEnd = ""
  }
}

//  编辑时获取详情数据
const getDatas = () => {
  spinning.value = true
  detailApi(editId.value).then((res: any) => {
    spinning.value = false
    if (!res) return
    dateRangeValue.value = [dayjs(res.trainTime), dayjs(res.trainTimeEnd)]
    personDatas.value = [{ id: res.orgPersonId }]
    form.value = res
  })
}

const form = ref<DataItemType>({
  id: "",
  idNum: "",
  trainItem: "",
  trainLocation: "",
  trainTime: "",
  trainTimeEnd: "",
  annual: "",
  hours: "",
  remark: "",
  orgPersonName: "",
  orgPersonId: "",
  orgId: ""
})

// 保存
const confirmLoading = ref<boolean>(false)
const refForm = ref<FormInstance>()
const handleOk = async () => {
  try {
    await (refForm.value as FormInstance).validateFields()
    await verifyIdentity()
    confirmLoading.value = true
    const params = { ...form.value }
    params.trainTime = dayjs(params.trainTime).valueOf()
    if (params.id) {
      await editApi(params)
    } else {
      await addApi(params)
    }
    message.success("保存成功")
    emit("updateList")
    visible.value = false
  } catch (err) {
    console.log(err)
    confirmLoading.value = false
  }
}

const verifyIdentity = async () => {
  return new Promise(async (resolve) => {
    let res = await checkidentityInformationApi({
      idNum: form.value.idNum,
      name: form.value.orgPersonName
    })
    if (!res) {
      //false是在系统不存在，需要二次提示
      Modal.confirm({
        title: "提示?",
        content: "该身份证号码在本系统不存在，是否继续！",
        onOk() {
          resolve(true)
        }
      })
    } else if (res) {
      //存在直接保存
      resolve(true)
    }
  })
}

const personVisible = ref(false)
const personDatas = ref<any[]>([])
const openPersonModal = () => {
  personVisible.value = true
}
const choosePerson = (list: any) => {
  personDatas.value = list
  form.value.orgPersonName = list[0].name
  // form.value.orgPersonId = list[0].id
  form.value.idNum = list[0].idNum
  // form.value.orgId = list[0].registerOrgId
  personVisible.value = false
}
</script>

<style scoped lang="less">
.ant-space {
  :deep(.ant-space-item) {
    margin-left: 10px;
  }
  .anticon {
    margin-bottom: 24px;
  }
  .anticon-minus {
    color: @error_color;
  }
  .anticon-plus {
    color: @theme_color;
  }
}
</style>
