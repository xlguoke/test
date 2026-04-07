<template>
  <a-modal
    v-model:visible="visible"
    :title="mtitle"
    :mask-closable="false"
    :keyboard="false"
    :ok-text="`${isAudit() && !disabled ? '提交审核' : '确定'}`"
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
              label="项目名称"
              name="projectName"
              :rules="[{ required: true, message: '请输入项目名称' }]"
            >
              <a-input
                v-model:value="form.projectName"
                placeholder="请输入项目名称"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>

          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="工程类型"
              name="projectType"
              :rules="[{ required: true, message: '请选择工程类型' }]"
            >
              <a-select
                v-model:value="form.projectType"
                placeholder="请输入工程类型"
                :disabled="disabled"
                @change="form.technicalLevel = ''"
              >
                <a-select-option value="WATERWAY">水运工程</a-select-option>
                <a-select-option value="LANDWAY">公路工程</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="技术等级"
              name="technicalLevel"
              :rules="[{ required: true, message: '请选择技术等级' }]"
            >
              <DictCode
                v-model:value="form.technicalLevel"
                :code="
                  form.projectType == 'WATERWAY' ? 'waterway_skill_level' : 'landway_skill_level'
                "
                placeholder="请选择技术等级"
                :disabled="disabled"
                @change="selSkillLevel"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="项目所在"
              name="provinceCity"
              :rules="[{ required: true, message: '请选择项目所在' }]"
            >
              <a-cascader
                v-model:value="form.provinceCity"
                :options="filterCqData(cityData)"
                placeholder="请选择"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="试验室名称"
              name="laboratoryName"
              :rules="[{ required: true, message: '请输入试验室名称' }]"
            >
              <a-input
                v-model:value="form.laboratoryName"
                placeholder="请输入试验室名称"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="起止时间"
              name="date"
              :rules="[{ required: true, message: '请输入起止时间' }]"
            >
              <a-range-picker v-model:value="form.date" :disabled="disabled" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="试验室类型"
              name="laboratoryCategory"
              :rules="[{ required: true, message: '请输入试验室类型' }]"
            >
              <a-select
                v-model:value="form.laboratoryCategory"
                placeholder="请输入试验室类型"
                :disabled="disabled"
              >
                <!-- <a-select-option value="母体试验室">母体试验室</a-select-option> -->
                <a-select-option value="中心试验室">中心试验室</a-select-option>
                <a-select-option value="工地试验室">工地试验室</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="授权负责人"
              name="laboratoryHead"
              :rules="[{ required: true, message: '请输入授权负责人' }]"
            >
              <a-input
                v-model:value="form.laboratoryHead"
                placeholder="请输入授权负责人"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="是否重点项目"
              name="important"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-radio-group v-model:value="form.important" :disabled="disabled">
                <a-radio :value="true">是</a-radio>
                <a-radio :value="false">否</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :sm="24">
            <a-form-item
              label="证明材料"
              name="attachments"
              :rules="[{ required: true, message: '上传证明材料' }]"
            >
              <UploadFile v-if="!disabled" v-model:value="form.attachments" />
              <FileList v-else :datas="form.attachments" />
            </a-form-item>
          </a-col>
          <a-col :sm="24">
            <a-form-item
              label="业绩关联人员"
              name="persons"
              :rules="[{ required: true, message: '请选择业绩关联人员' }]"
            >
              <p v-if="!disabled" style="line-height: 30px">
                请选择参与该工地试验室工作达到业绩生效时长条件的人员（重点项目
                <span class="error">≥6个月</span>
                ；非重点项目
                <span class="error">≥3个月</span>
                ）
              </p>
              <a-form-item-rest>
                <a-table
                  :data-source="form.persons"
                  :columns="columns"
                  :pagination="false"
                  size="small"
                  bordered
                >
                  <template #bodyCell="{ column, record, index }">
                    <template v-if="column.key == 'position'">
                      <a-input
                        v-model:value="record.position"
                        :disabled="disabled"
                        placeholder="请输入人员职务"
                      />
                    </template>
                    <template v-if="column.key == 'achievementDescription'">
                      <a-input
                        v-model:value="record.achievementDescription"
                        :disabled="disabled"
                        placeholder="请输入业绩描述"
                      />
                    </template>
                    <template v-if="column.key == 'sort'">
                      <a-input-number
                        v-model:value="record.sort"
                        style="width: 100%"
                        :controls="false"
                        :precision="0"
                        :disabled="disabled"
                        placeholder="请输入排序"
                      />
                    </template>
                    <template v-if="column.key == 'handle'">
                      <a-button type="link" danger @click="removeRow(index)">移除</a-button>
                    </template>
                  </template>
                </a-table>
              </a-form-item-rest>
              <div
                v-if="!disabled"
                class="blue"
                style="padding: 10px 0; display: inline-block; cursor: pointer"
                @click="choosePersonnel"
              >
                <plus-outlined />
                添加关联人员
              </div>
            </a-form-item>
          </a-col>
          <!-- 审核机构：市外，已发布，且在编辑状态才显示，详情状态存在审核机构id时显示 -->
          <a-col v-if="isAudit()" :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="审核机构"
              name="auditUnitId"
              :rules="[{ required: true, message: '请选择审核机构' }]"
            >
              <common-select
                v-model:value="form.auditUnitId"
                :url="admList()"
                placeholder="请选择审核机构"
                :disabled="disabled"
                :config="{
                  keyword: 'orgName'
                }"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>

    <PersonnelModal
      v-model:visible="visiblePersons"
      :selected="form.persons"
      :org-id="form.orgId"
      @confirm="getPersonnel"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref, watch, nextTick } from "vue"
import dayjs from "dayjs"
import { message } from "ant-design-vue"
import { PlusOutlined } from "@ant-design/icons-vue"
import UploadFile from "@/components/uploadFile/index.vue"
import PersonnelModal from "@/components/commonListModal/personnel.vue"
import FileList from "@/components/fileList/index.vue"
import DictCode from "@/components/dictCode/index.vue"
import CommonSelect from "@/components/commonSelect/index.vue"
import { saveApi, detailApi, forceEditApi } from "@/api/performance.api"
import { admList } from "@/api/commonSelect.api"
import type { dataItemType } from "@/type/api/performance.api"
import type { TableColumnType } from "ant-design-vue"
import cityData from "@/assets/js/citydata.js"
import userStore from "@/stores/userInfo"
const { userInfo } = userStore()

const emit = defineEmits(["updateList"])

const visible = ref<boolean>(false)
const spinning = ref<boolean>(false)
const disabled = ref<boolean>(false)
const _isForce = ref<boolean>(false)
const mtitle = ref<string>("业绩编辑")
const dataId = ref<string>("")
const openModal = (title: string, id: string, isEdit: boolean, isForce?: boolean) => {
  mtitle.value = title
  dataId.value = id || ""
  visible.value = true
  disabled.value = !isEdit
  _isForce.value = isForce || false
  if (!isEdit) {
    columns.pop()
  }
  id && getDetailData()
}

defineExpose({
  openModal
})

// 是否需要审核
const isAudit = (): boolean => {
  const _form = form.value
  return Boolean(
    !_isForce.value && // 非强制变更
      !_form.external && // 非市外
      _form.status && // 存在状态（非新增）
      _form.status != "WAIT_PUBLISH" && // 待发布状态
      (!disabled.value || (disabled.value && _form.auditUnitId)) // 编辑状态 或 存在审核机构的详情状态
  )
}

const selSkillLevel = ({ value, option }) => {
  form.value.technicalLevel = option.name
}

// 地区数据过滤
const filterCqData = (datas: any) => {
  return datas.filter((d: any) => d.label != "重庆市")
}

const getDetailData = () => {
  spinning.value = true
  detailApi(dataId.value).then((res: any) => {
    spinning.value = false
    if (!res) return
    res.date = [dayjs(res.startTime), dayjs(res.endTime)]
    res.provinceCity = [res.locatedProvince, res.locatedCity]
    res.persons.forEach((d: any) => {
      d.id = d.personId
    })
    form.value = res
  })
}

const form = ref<dataItemType>({
  id: "",
  technicalLevel: "",
  projectType: null,
  orgId: userInfo.type == "ORG" ? userInfo.orgId : "",
  orgName: userInfo.type == "ORG" ? userInfo.orgName : "",
  projectName: "",
  projectLevel: "",
  locatedProvince: "",
  locatedCity: "",
  external: true,
  laboratoryName: "",
  startTime: "",
  endTime: "",
  laboratoryCategory: null,
  laboratoryHead: "",
  important: false,
  persons: [],
  attachments: [],
  date: [],
  provinceCity: [],
  auditUnitId: "",
  status: ""
})

const columns = reactive<TableColumnType[]>([
  {
    dataIndex: "index",
    key: "index",
    width: 50,
    align: "center",
    customRender: ({ index }) => {
      return index + 1
    }
  },
  {
    title: "姓名",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "身份证号",
    dataIndex: "idCard",
    key: "idCard"
  },
  {
    title: "职务",
    dataIndex: "position",
    key: "position"
  },
  {
    title: "业绩描述",
    dataIndex: "achievementDescription",
    key: "achievementDescription"
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    customRender: ({ index }) => {
      return `<a-button type="link" danget @click="removeRow(${index})">移除</a-button>`
    }
  }
])

watch(
  () => form.value.attachments,
  () => {
    if (disabled.value) return
    nextTick(() => {
      formRef.value.validateFields(["attachments"])
    })
  }
)

// 选择业绩关联人员
const visiblePersons = ref<boolean>(false)
const choosePersonnel = () => {
  visiblePersons.value = true
}

const getPersonnel = (list: any) => {
  if (list.length == 0) return
  form.value.persons = list.map((d: any) => {
    const item = form.value.persons.find((p) => p.personId == d.id)
    return {
      personId: d.id,
      name: d.name,
      idCard: d.idNum,
      position: d.duties,
      achievementDescription: item ? item.achievementDescription : ""
    }
  })
  formRef.value.validateFields(["persons"])
  visiblePersons.value = false
}

// 移除业绩关联人员
const removeRow = (ind: number) => {
  form.value.persons.splice(ind, 1)
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
  if (params.external) {
    //如果是市外 直接把审核单位固定为规发中心id 审核
    params.auditUnitId = "1660538900868845569"
  }
  if (params.date && params.date.length) {
    params.startTime = dayjs(params.date[0]).valueOf()
    params.endTime = dayjs(params.date[1]).valueOf()
    delete params.date
  }
  if (params.provinceCity && params.provinceCity.length) {
    params.locatedCity = params.provinceCity[1] || ""
    params.locatedProvince = params.provinceCity[0] || ""
    delete params.provinceCity
  }
  if (!params.id) delete params.id
  if (!params.status) delete params.status
  params.persons.forEach((d) => delete d.id)
  saveLoading.value = true
  console.log(4444, params)
  try {
    if (_isForce.value) {
      await forceEditApi(params)
    } else {
      await saveApi(params)
    }
    message.success("保存成功")
    emit("updateList")
    visible.value = false
  } catch (err) {
    saveLoading.value = false
  }
}
</script>

<style lang="less" scoped></style>
