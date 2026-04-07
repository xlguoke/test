<template>
  <a-modal
    v-model:visible="visible"
    :title="mtitle"
    :mask-closable="false"
    :keyboard="false"
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
              label="活动名称"
              name="name"
              :rules="[{ required: true, message: '请输入活动名称' }]"
            >
              <a-input
                v-model:value="form.name"
                placeholder="请输入活动名称"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="活动单位"
              name="org"
              :rules="[{ required: true, message: '请输入活动单位' }]"
            >
              <!-- <common-select
                v-model:value="form.org"
                :url="orgList()"
                :config="{
                  placeholder: '请输入活动单位',
                  disabled
                }"
                @change="
                  ({ option }) => {
                    form.org = option ? option.name : ''
                  }
                "
              /> -->
              <a-auto-complete
                v-model:value="form.org"
                :options="orgDataList"
                placeholder="请输入单位名称"
                @change="changeOrgInput"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="活动地址"
              name="address"
              :rules="[{ required: true, message: '请输入活动地址' }]"
            >
              <a-input
                v-model:value="form.address"
                placeholder="请输入活动地址"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="起止时间"
              name="date"
              :rules="[{ required: true, message: '请选择起止时间' }]"
            >
              <a-range-picker v-model:value="form.date" :disabled="disabled" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="活动状态" name="status">
              <a-select
                v-model:value="form.status"
                :disabled="disabled"
                placeholder="请选择活动状态"
              >
                <a-select-option value="UNCOMPLETED">待开始</a-select-option>
                <a-select-option value="COMPLETED">已结束</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :sm="24" :xxl="16">
            <a-form-item label="回避单位" name="avoidOrg">
              <common-select
                v-if="!disabled"
                v-model:value="localForm.avoidOrgIds"
                :url="orgList()"
                :config="{
                  placeholder: '请选择回避单位',
                  disabled,
                  multiple: true
                }"
                @change="
                  ({ option }) => {
                    form.avoidOrg = option.map((d) => {
                      return {
                        orgId: d.id,
                        orgName: d.name
                      }
                    })
                  }
                "
              />
              <template v-else>
                <span v-for="d in form.avoidOrg" :key="d.orgId" class="tag-item">
                  {{ d.orgName }}
                </span>
                <span v-if="form.avoidOrg && form.avoidOrg.length === 0">-</span>
              </template>
            </a-form-item>
          </a-col>
          <a-col :sm="24">
            <a-form-item
              label="专家抽取"
              name="experts"
              :rules="[{ required: true, message: '请抽取或添加专家' }]"
            >
              <a-form-item-rest>
                <a-space v-if="!disabled" style="margin-bottom: 10px; flex-wrap: wrap">
                  <span>
                    组长人数：
                    <a-input-number
                      v-model:value="form.leaderNumber"
                      :min="0"
                      :precision="0"
                      placeholder="请输入"
                      @change="
                        (val) => {
                          if (!val) form.leaderNumber = 0
                        }
                      "
                    />
                  </span>
                  <span>
                    组员人数：
                    <a-input-number
                      v-model:value="form.memberNumber"
                      :min="0"
                      :precision="0"
                      placeholder="请输入"
                      @change="
                        (val) => {
                          if (!val) form.memberNumber = 0
                        }
                      "
                    />
                  </span>
                  <DictCode
                    v-model:value="localForm.highwayVal"
                    style="width: 200px"
                    code="expert::major::highway"
                    multiple
                    placeholder="请选择申报公路专业"
                    @change="
                      ({ option }) => {
                        localForm.highway = initMajor(option, 'expert::major::highway')
                        form.majors = [...localForm.water, ...localForm.highway]
                      }
                    "
                  />
                  <DictCode
                    v-model:value="localForm.waterVal"
                    style="width: 200px"
                    code="expert::major::water"
                    multiple
                    placeholder="请选择申报水运专业"
                    @change="
                      ({ option }) => {
                        localForm.water = initMajor(option, 'expert::major::water')
                        form.majors = [...(localForm.water || []), ...(localForm.highway || [])]
                      }
                    "
                  />
                  <a-button type="primary" @click="getRecordDats">抽取</a-button>
                  <a-dropdown>
                    <template #overlay>
                      <a-menu @click="openSpecialist">
                        <a-menu-item key="1">组长</a-menu-item>
                        <a-menu-item key="2">组员</a-menu-item>
                      </a-menu>
                    </template>
                    <a-button type="primary">
                      添加
                      <DownOutlined />
                    </a-button>
                  </a-dropdown>
                </a-space>
              </a-form-item-rest>
              <a-table
                :data-source="form.experts"
                :columns="columns"
                bordered
                size="small"
                :pagination="false"
              >
                <template #bodyCell="{ column, record, index }">
                  <template v-if="column.key == 'participate'">
                    <a-select v-model:value="record.participate" :disabled="disabled">
                      <a-select-option :value="true">同意</a-select-option>
                      <a-select-option :value="false">不同意</a-select-option>
                    </a-select>
                  </template>
                  <template v-if="column.key == 'participateRemark'">
                    <a-input
                      v-model:value="record.participateRemark"
                      :disabled="disabled"
                      placeholder="请输入备注"
                    />
                  </template>
                  <template v-if="column.key == 'handle'">
                    <a-button type="link" danger size="small" @click="removeRow(index)">
                      移除
                    </a-button>
                  </template>
                </template>
              </a-table>
            </a-form-item>
          </a-col>
          <a-col :sm="24">
            <a-form-item label="活动备注" name="remark">
              <a-textarea
                v-model:value="form.remark"
                placeholder="请输入活动备注"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>

    <SpecialistModal
      v-model:visible="visiblePersons"
      :selected="form.experts"
      :params="{
        avoidOrg: form.avoidOrg,
        majors: form.majors,
        activityId: form.id
      }"
      @confirm="chooseSpecialist"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { reactive, ref, createVNode } from "vue"
import dayjs from "dayjs"
import { message, Modal } from "ant-design-vue"
import type { TableColumnType } from "ant-design-vue"
import { DownOutlined } from "@ant-design/icons-vue"
import { orgListAllAPI } from "@/api/common.api"
import SpecialistModal from "@/components/commonListModal/specialist.vue"
import CommonSelect from "@/components/commonSelect/index.vue"
import DictCode from "@/components/dictCode/index.vue"
import { orgList } from "@/api/commonSelect.api"
import { actSaveApi, actDetailApi, actExtractingApi, actCheck } from "@/api/specialistDb.api"
import type { actDataItemType, recordParType, expertsType } from "@/type/api/specialistDb.api"

const emit = defineEmits(["updateList"])

const visible = ref<boolean>(false)
const spinning = ref<boolean>(false)
const disabled = ref<boolean>(false)
const mtitle = ref<string>("编辑")
const dataId = ref<string>("")
const openModal = (title: string, id: string, isEdit: boolean) => {
  mtitle.value = title
  dataId.value = id || ""
  visible.value = true
  disabled.value = !isEdit
  if (!isEdit) {
    columns.pop()
  }
  id && getDetailData()
}

defineExpose({
  openModal
})

// 获取详情数据
const getDetailData = () => {
  spinning.value = true
  actDetailApi(dataId.value).then((res: any) => {
    spinning.value = false
    res.date = [dayjs(res.startTime), dayjs(res.endTime)]
    if (res.experts && res.experts.length) {
      res.experts = res.experts.map((d) => {
        return {
          expertId: d.expertId,
          leader: d.leader,
          name: d.expert.name,
          idCard: d.expert.idCard,
          duty: d.expert.duty,
          professional: d.expert.professional,
          tel: d.expert.tel,
          phone: d.expert.phone,
          participate: d.participate,
          participateRemark: d.participateRemark
        }
      })
    }
    if (res.avoidOrg.length > 0) {
      localForm.value.avoidOrgIds = res.avoidOrg.map((d) => d.orgId)
    }
    form.value = res
  })
}

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

const form = ref<actDataItemType>({
  id: "",
  org: "",
  name: "",
  address: "",
  startTime: null,
  endTime: null,
  status: "UNCOMPLETED",
  leaderNumber: 0,
  memberNumber: 0,
  scored: false,
  leaders: "",
  members: "",
  remark: "",
  avoidOrg: [],
  majors: [],
  experts: [],
  date: []
})

const localForm = ref({
  avoidOrgIds: [],
  waterVal: [],
  highwayVal: [],
  highway: [],
  water: []
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
    title: "角色",
    dataIndex: "leader",
    key: "leader",
    customRender: ({ text }) => {
      return text ? "组长" : "组员"
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
    dataIndex: "duty",
    key: "duty"
  },
  {
    title: "职称",
    dataIndex: "professional",
    key: "professional"
  },
  {
    title: "联系电话",
    dataIndex: "tel",
    key: "tel"
  },
  {
    title: "联系手机",
    dataIndex: "phone",
    key: "phone"
  },
  {
    title: "确认结果",
    dataIndex: "participate",
    key: "participate",
    width: 100
  },
  {
    title: "备注",
    dataIndex: "participateRemark",
    key: "participateRemark"
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle"
  }
])

// 打开专家列表弹窗
const visiblePersons = ref<boolean>(false)
const addType = ref("1")
const openSpecialist = (e) => {
  addType.value = e.key
  visiblePersons.value = true
}

// 移除专家
const removeRow = (ind) => {
  form.value.experts.splice(ind, 1)
}

// 抽取专家
const getRecordDats = async () => {
  await formRef.value?.validateFields(["date"])
  const { id, leaderNumber, memberNumber, avoidOrg, majors, date } = form.value
  if (leaderNumber + memberNumber <= 0) {
    return message.warning("请至少抽取一位专家（组长和组员人数不能都为0）")
  }
  const par: recordParType = {
    activityId: id,
    leaderNumber,
    memberNumber,
    avoidOrg: avoidOrg || [],
    majors: majors || []
  }
  if (date && date.length) {
    par.startTime = dayjs(date[0]).valueOf()
    par.endTime = dayjs(date[1]).valueOf()
  }
  actExtractingApi(par).then((res: any) => {
    if (!res || res.length == 0) {
      message.warning("未查到相关专家数据")
    }
    res.forEach((d) => {
      d.participate = true
      d.participateRemark = ""
    })
    form.value.experts = res
  })
}

// 手动选择专家
const chooseSpecialist = async (datas) => {
  const oldRows = [...form.value.experts]
  let list = (await checkSpecialist(datas)) as expertsType[]
  // 过滤数据
  for (let i = 0; i < list.length; i++) {
    list[i].leader = addType.value == "1"
    list[i].participate = true
    list[i].participateRemark = ""
  }
  list = [...oldRows, ...list].sort((p, n) => Number(n.leader) - Number(p.leader))
  form.value.experts = list
  visiblePersons.value = false
}

// 专家活动记录检查
const checkSpecialist = (list) => {
  return new Promise(async (resolve) => {
    const date = form.value.date || []
    const ids = list.map((d) => d.expertId).join(",")
    // 检查活动记录
    let res: any = await actCheck({
      expertIds: ids,
      startTime: dayjs(date[0]).valueOf() + "",
      endTime: dayjs(date[1]).valueOf() + "",
      activityId: form.value.id
    })
    if (!res.length) {
      return resolve(list)
    }
    let noCheck: any = []
    if (res && res.length > 0) {
      for (let j = 0; j < res.length; j++) {
        noCheck.push(createVNode("p", {}, `${res[j].name}(${res[j].idCard})`))
      }
    }
    Modal.confirm({
      title: "提示",
      content: createVNode("div", {}, [
        createVNode("span", {}, "以下专家的活动时间有冲突，"),
        ...noCheck,
        createVNode("span", {}, "确认是否继续添加该专家？")
      ]),
      icon: createVNode(ExclamationCircleOutlined),
      okText: "继续添加",
      onOk() {
        resolve(list)
      },
      onCancel() {
        const ids = res.map((d) => d.id)
        list = list.filter((d) => !ids.includes(d.expertId))
        resolve(list)
      }
    })
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
const saveModal = async () => {
  if (disabled.value) {
    visible.value = false
    return
  }
  // await formRef.value?.validateFields()
  const params = { ...form.value }
  if (params.date && params.date.length) {
    params.startTime = dayjs(params.date[0]).valueOf()
    params.endTime = dayjs(params.date[1]).valueOf()
  }
  delete params.date
  actSaveApi(params).then(() => {
    message.success("保存成功")
    emit("updateList")
    visible.value = false
  })
}
</script>

<style lang="less" scoped>
.tag-item {
  display: inline-block;
  margin-right: 5px;
  margin-bottom: 5px;
  padding: 3px 8px;
  border-radius: 4px;
  background-color: #f9f9f9;
  color: #555;
  border: 1px solid #ddd;
}
</style>
