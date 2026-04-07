<template>
  <a-modal
    v-model:visible="visible"
    :title="mtitle"
    :mask-closable="false"
    :keyboard="false"
    :confirm-loading="saveLoading"
    width="70%"
    @ok="saveModal"
  >
    <a-spin :spinning="spinning" tip="Loading...">
      <a-form
        ref="formRef"
        :model="form"
        :label-col="{ style: { width: '120px' } }"
        style="padding-right: 20px"
      >
        <a-row :gutter="10">
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="序号"
              name="sort"
              :rules="[{ required: true, message: '请输入序号' }]"
            >
              <a-input-number
                v-model:value="form.sort"
                style="width: 100%"
                :controls="false"
                placeholder="请输入序号"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="部/省级专家"
              name="expertLevel"
              :rules="[{ required: true, message: '请选择部/省级专家' }]"
            >
              <a-select
                v-model:value="form.expertLevel"
                placeholder="请选择部/省级专家"
                :disabled="disabled"
              >
                <a-select-option value="省级专家">省级专家</a-select-option>
                <a-select-option value="部级专家">部级专家</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="姓名"
              name="name"
              :rules="[{ required: true, message: '请输入专家姓名' }]"
            >
              <a-input
                v-model:value="form.name"
                placeholder="请输入专家姓名"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="身份证号"
              name="idCard"
              :rules="[{ required: true, message: '请输入身份证号' }]"
            >
              <a-input
                v-model:value="form.idCard"
                placeholder="请输入身份证号"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="所在省市"
              name="provinceArr"
              :rules="[{ required: true, message: '请选择所在省市' }]"
            >
              <a-cascader
                v-model:value="form.provinceArr"
                :options="cityData"
                placeholder="请选择所在省市"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="单位名称"
              name="orgName"
              :rules="[{ required: true, message: '请选择单位名称' }]"
            >
              <!-- <common-select
                v-if="!disabled"
                v-model:value="form.orgId"
                :url="orgList()"
                :config="{
                  placeholder: '请选择单位名称',
                  disabled
                }"
                @change="
                  ({ option }) => {
                    form.orgName = option ? option.name : ''
                  }
                "
              />
              <a-input v-else v-model:value="form.orgName" disabled /> -->

              <a-auto-complete
                v-model:value="form.orgName"
                :options="orgDataList"
                placeholder="请输入单位名称"
                @change="changeOrgInput"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="性别"
              name="sex"
              :rules="[{ required: true, message: '请选择性别' }]"
            >
              <a-radio-group v-model:value="form.sex" :disabled="disabled">
                <a-radio value="男">男</a-radio>
                <a-radio value="女">女</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="出生年月" name="birthday">
              <a-date-picker
                v-model:value="form.birthday"
                :disabled="disabled"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="学历" name="educational">
              <a-input
                v-model:value="form.educational"
                placeholder="请输入学历"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="职务"
              name="duty"
              :rules="[{ required: true, message: '请输入职务' }]"
            >
              <a-input v-model:value="form.duty" placeholder="请输入职务" :disabled="disabled" />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="是否担任过组长" name="leader">
              <a-radio-group v-model:value="form.leader" :disabled="disabled">
                <a-radio :value="true">是</a-radio>
                <a-radio :value="false">否</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="职称"
              name="professional"
              :rules="[{ required: true, message: '请输入职称' }]"
            >
              <a-input
                v-model:value="form.professional"
                placeholder="请输入职称"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="申报公路专业" name="highway">
              <DictCode
                v-if="!disabled"
                v-model:value="localForm.highwayVal"
                code="expert::major::highway"
                multiple
                placeholder="请选择申报公路专业"
                @change="
                  ({ option }) => {
                    form.highway = initMajor(option, 'expert::major::highway')
                  }
                "
              />
              <a-input v-else v-model:value="form.highwayDeclare" disabled />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="申报水运专业" name="water">
              <DictCode
                v-if="!disabled"
                v-model:value="localForm.waterVal"
                code="expert::major::water"
                multiple
                placeholder="请选择申报水运专业"
                :disabled="disabled"
                @change="
                  ({ option }) => {
                    form.water = initMajor(option, 'expert::major::water')
                  }
                "
              />
              <a-input v-else v-model:value="form.waterDeclare" disabled />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="电话" name="tel">
              <a-input v-model:value="form.tel" placeholder="请输入电话" :disabled="disabled" />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="手机"
              name="phone"
              :rules="[{ pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号' }]"
            >
              <a-input v-model:value="form.phone" placeholder="请输入手机" :disabled="disabled" />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="电子邮箱"
              name="email"
              :rules="[
                { pattern: /^[\w\.\-]+\@[\w]+\.[A-z]{2,4}/, message: '请输入正确的电子邮箱' }
              ]"
            >
              <a-input
                v-model:value="form.email"
                placeholder="请输入电子邮箱"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="通讯地址" name="address">
              <a-input
                v-model:value="form.address"
                placeholder="请输入通讯地址"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="邮编" name="postcode">
              <a-input
                v-model:value="form.postcode"
                placeholder="请输入邮编"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="检测证书编号" name="certNo">
              <a-input
                v-model:value="form.certNo"
                placeholder="请输入检测证书编号"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24">
            <a-form-item label="备注" name="remark">
              <a-textarea
                v-model:value="form.remark"
                placeholder="请输入备注"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue"
import dayjs from "dayjs"
import { message } from "ant-design-vue"
import { saveApi, detailApi } from "@/api/specialistDb.api"
import { orgListAllAPI } from "@/api/common.api"
import type { dataItemType } from "@/type/api/specialistDb.api"
import cityData from "@/assets/js/citydata.js"
import DictCode from "@/components/dictCode/index.vue"

const emit = defineEmits(["updateList"])

const visible = ref<boolean>(false)
const spinning = ref<boolean>(false)
const disabled = ref<boolean>(false)
const mtitle = ref<string>("新增")
const dataId = ref<string>("")
const openModal = (title: string, id: string, isEdit: boolean) => {
  mtitle.value = title
  dataId.value = id || ""
  visible.value = true
  disabled.value = !isEdit
  id && getDetailData()
}

defineExpose({
  openModal
})
const getDetailData = () => {
  spinning.value = true
  detailApi(dataId.value).then((res: any) => {
    spinning.value = false
    if (res.birthday) {
      res.birthday = dayjs(res.birthday)
    }
    if (res.province) {
      res.provinceArr = [res.province, res.city]
    }
    if (res.highway.length) {
      res.highway.forEach((d) => {
        d.id && delete d.id
      })
      localForm.value.highwayVal = res.highway.map((d) => d.code)
    }
    if (res.water.length) {
      res.water.forEach((d) => {
        d.id && delete d.id
      })
      localForm.value.waterVal = res.water.map((d) => d.code)
    }
    form.value = res
  })
}

const form = ref<dataItemType>({
  id: "",
  sort: null, //排序
  expertLevel: null, //专家级别
  name: "", //专家名称
  idCard: "", //专家身份证号
  province: "", //省（市）
  city: "", //市（区）
  orgId: "",
  orgName: "",
  sex: "男", //性别
  birthday: null, //生日
  educational: "", //学历
  duty: "", //职务
  professional: "", //职称
  leader: false, //是否担任过组长
  highway: [], //公路专业具体信息
  water: [], //水运专业具体信息
  tel: "", //电话
  phone: "", //手机
  email: "", //邮箱
  address: "", //地址
  postcode: "", //邮编
  certNo: "", //检测证书编号
  remark: "" //备注
})

const localForm = ref({
  highwayVal: [], //申请公路专业
  waterVal: [] //申请水运专业
})

// 申请专业选中数据处理
const initMajor = (opts, category) => {
  return opts.map((d) => {
    return {
      category,
      major: d.name,
      code: d.code
    }
  })
}

let orgDataList = ref([])
let orgInitial = ref([])
const getOrgListAll = () => {
  orgListAllAPI().then((res: any) => {
    orgInitial.value = res.map((it: any) => {
      return { value: it.name }
    })
    orgDataList.value = [...orgInitial.value]
  })
}
getOrgListAll()
const changeOrgInput = (v: string) => {
  if (v) {
    orgDataList.value = orgInitial.value.filter((it: any) => {
      return it.value.includes(v)
    })
  } else {
    orgDataList.value = [...orgInitial.value]
  }
}

// 保存
const formRef = ref()
const saveLoading = ref(false)
const saveModal = async () => {
  if (disabled.value) {
    visible.value = false
    return
  }
  await formRef.value?.validateFields()
  const params = { ...form.value }
  // 处理日期
  if (params.birthday) {
    params.birthday = dayjs(params.birthday).format("YYYY-MM-DD")
  }
  // 处理地区
  if (params.provinceArr) {
    params.city = params.provinceArr[1] || ""
    params.province = params.provinceArr[0]
  }
  delete params.provinceArr
  !params.id && delete params.id
  console.log(params)
  saveLoading.value = true
  saveApi(params)
    .then(() => {
      message.success("保存成功")
      emit("updateList")
      visible.value = false
    })
    .catch(() => {
      saveLoading.value = false
    })
}
</script>

<style lang="less" scoped></style>
