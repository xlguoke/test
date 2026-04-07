<template>
  <div>
    <a-spin tip="加载中..." :spinning="spinning">
      <div class="person_wrap">
        <a-row class="tle">授权负责人:</a-row>
        <a-row>
          <a-input
            v-model:value="authorizedPerson.name"
            style="width: 300px"
            :disabled="props.details"
            placeholder="请选择授权负责人"
            readonly
          />
          <a-button
            type="primary"
            style="margin-left: 10px"
            :disabled="props.details"
            @click="openSelPenson(1)"
          >
            添加
          </a-button>
        </a-row>
        <a-row class="tle" justify="space-between">
          <a-col>工作经历和业绩:</a-col>
          <!-- <a-col>
            <a-button
              type="primary"
              @click="saveExperience"
              size="small"
              :disabled="props.details || !authorizedPerson.name"
            >
              保存
            </a-button>
          </a-col> -->
        </a-row>
        <a-row>
          <a-textarea
            v-model:value="authorizedPerson.experience"
            :disabled="props.details || !authorizedPerson.name"
            :auto-size="{ minRows: 2, maxRows: 5 }"
            placeholder="请输入工作经历和业绩"
            @blur="saveExperience"
          />
        </a-row>
        <a-row class="action_row">
          <div class="lt">
            <!-- <a-space>
                            <a-input-search placeholder="请输入人员名称"  enter-button />
                        </a-space> -->
            <span>持证人员：</span>
          </div>
          <div class="rt">
            <a-space>
              <span style="color: red">*标红为已从母体撤销人员</span>
              <a-button v-if="!props.details" type="primary" size="small" @click="openSelPenson(2)">
                新增
              </a-button>
            </a-space>
          </div>
        </a-row>
        <a-table
          :data-source="personSource"
          :columns="personColumns"
          bordered
          size="small"
          row-key="id"
          :pagination="false"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.key === 'gender'">
              <span :style="record.effective == false ? 'color:red' : ''">
                {{ record.gender ? "男" : "女" }}
              </span>
            </template>

            <template v-else-if="column.key === 'entranceTime'">
              <span :style="record.effective == false ? 'color:red' : ''">
                {{ formatDate(record.entranceTime) }}
              </span>
            </template>

            <template v-else-if="column.key === 'handle'">
              <a-space>
                <a-button size="small" type="primary" @click="goDetail(record)">详情</a-button>
                <a-button
                  v-if="!props.details"
                  size="small"
                  type="primary"
                  danger
                  @click="removePersonFun(record)"
                >
                  移出
                </a-button>
              </a-space>
            </template>

            <template v-else>
              <span :style="record.effective == false ? 'color:red' : ''">{{ text }}</span>
            </template>
          </template>
        </a-table>

        <a-row class="action_row">
          <div class="lt">
            <!-- <a-space>
                            <a-input-search placeholder="请输入人员名称"  enter-button />
                        </a-space> -->
            <span>其他人员：</span>
          </div>
          <div class="rt">
            <a-space>
              <a-button v-if="!props.details" type="primary" size="small" @click="addOtherPerson">
                新增
              </a-button>
            </a-space>
          </div>
        </a-row>
        <a-table
          :data-source="otherPersonSource"
          :columns="otherPersonColumns"
          bordered
          size="small"
          row-key="id"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'handle'">
              <a-space v-if="!props.details">
                <a-button
                  v-if="record.isEdit"
                  size="small"
                  type="primary"
                  @click="saveOtherPerson(record)"
                >
                  保存
                </a-button>
                <a-button
                  v-if="!record.isEdit"
                  size="small"
                  type="primary"
                  @click="editOtherPerson(record)"
                >
                  编辑
                </a-button>
                <a-button size="small" type="primary" danger @click="removeOtherPerson(record)">
                  移出
                </a-button>
              </a-space>
            </template>
            <template v-if="column.key === 'name'">
              <a-input
                v-if="record.isEdit"
                v-model:value="record.name"
                style="width: 100%"
                placeholder="请输入"
              />
              <span v-else>{{ record.name }}</span>
            </template>

            <template v-if="column.key === 'gender'">
              <a-radio-group
                v-if="record.isEdit"
                v-model:value="record.gender"
                style="width: 100%"
                name="radioGroup"
              >
                <a-radio :value="true">男</a-radio>
                <a-radio :value="false">女</a-radio>
              </a-radio-group>
              <span v-else>{{ record.gender ? "男" : "女" }}</span>
            </template>

            <template v-if="column.key === 'birthday'">
              <a-date-picker
                v-if="record.isEdit"
                v-model:value="record.birthday"
                style="width: 100%"
              />
              <span v-else>{{ formatDate(record.birthday) }}</span>
            </template>

            <template v-if="column.key === 'education'">
              <a-input
                v-if="record.isEdit"
                v-model:value="record.education"
                style="width: 100%"
                placeholder="请输入"
              />
              <span v-else>{{ record.education }}</span>
            </template>

            <template v-if="column.key === 'entranceTime'">
              <a-date-picker
                v-if="record.isEdit"
                v-model:value="record.entranceTime"
                style="width: 100%"
              />
              <span v-else>{{ formatDate(record.entranceTime) }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
    <a-modal v-model:visible="addTimeVisible" title="填写备案时间" :z-index="1001">
      <p style="padding: 20px">
        <span>备案时间：</span>
        <a-date-picker
          v-model:value="selAddTimeValue"
          placeholder="请选择备案时间"
          style="width: 350px"
        />
      </p>
      <template #footer>
        <a-button type="primary" @click="handAddTimeOk">确定</a-button>
      </template>
    </a-modal>

    <a-modal v-model:visible="removeTimeVisible" title="填写移出时间" :z-index="1001">
      <p style="padding: 20px">
        <span>移出时间：</span>
        <a-date-picker
          v-model:value="selRemoveTimeValue"
          placeholder="请选择备案时间"
          style="width: 350px"
        />
      </p>
      <template #footer>
        <a-button type="primary" @click="handleRemoveTimeOk">确定</a-button>
      </template>
    </a-modal>
    <sel-pserson
      v-model:visible="selPersonVisible"
      :org-id="orgId"
      :type="addType == 1 ? 'radio' : 'checkbox'"
      @confirm="slePersonOk"
    />
  </div>
</template>

<script lang="ts" setup>
import { Ref } from "vue"
import { ref, toRefs, inject, onMounted, h } from "vue"
import { Modal, message } from "ant-design-vue"
import SelPserson from "@/components/commonListModal/personnel.vue"
import {
  addLaboratoryPaersonAPI,
  // getLaboratoryPersonAPI,
  getLabPersonAPI,
  removeLaboratoryPaersonAPI,
  getLaboratoryInfoAPI,
  addLabPrincipalPersonAPI,
  addLaboratoryOtherPaersonAPI
} from "@/api/laboratory.api"
import { formatDate } from "@/assets/js/common"
import dayjs, { Dayjs } from "dayjs"
const props = defineProps({
  editId: {
    type: String,
    required: true
  },
  details: {
    type: Boolean,
    default: false
  }
})
const laboratoryId: any = toRefs(props).editId //试验室编辑id

let isApply = inject<unknown>("isApply", false) as Ref //  是否申请变更或延期

let addType = ref(1) //1：添加授权负责人  2:添加持证人员

let authorizedPerson = ref<any>({}) //授权人员信息

//备案时间绑定
let selAddTimeValue = ref<Dayjs>(dayjs(new Date()))
//移除时间绑定
let selRemoveTimeValue = ref<Dayjs>(dayjs(new Date()))

let spinning = ref(false)
let addTimeVisible = ref(false)
let removeTimeVisible = ref(false)
let selPersonVisible = ref<boolean>(false)

//持证人员数据表格
let personSource: any = ref([])

//其他人员数据表格
let otherPersonSource: any = ref([])

//移除人员
let removePerson = ref()
let orgId = ref()

onMounted(async () => {
  if (laboratoryId.value) {
    let res = await getLaboratoryInfoAPI(laboratoryId.value) //获取当前工地试验室选择的机构，用于人员选择
    orgId.value = res.orgId

    getLaboratoryPerson()
  }
})

// 查看详情 - 跳转部平台
const goDetail = (row) => {
  window.open(
    `${import.meta.env.VITE_PART_API}/PCWeb/OrgQuery/PersonDetails?cardNo=${row.idNum}&personName=${
      row.name
    }`,
    "_blank"
  )
}

const addOtherPerson = () => {
  let editing = otherPersonSource.value.some((item) => {
    return item.isEdit === true
  })
  if (editing) {
    message.warning("有正在编辑中的数据，请保存后在添加")
    return
  }
  otherPersonSource.value.push({
    name: "",
    gender: true,
    birthday: dayjs(),
    education: "",
    entranceTime: dayjs(),
    isEdit: true
  })
}
const editOtherPerson = async (row) => {
  let editing = otherPersonSource.value.some((item) => {
    return item.isEdit === true
  })
  if (editing) {
    message.warning("有正在编辑中的数据，请保存后在编辑")
    return
  }
  row.birthday = dayjs(row.birthday)
  row.entranceTime = dayjs(row.entranceTime)
  row.isEdit = true
}

const saveOtherPerson = async (row) => {
  console.log(row)
  if (!row.name || !row.birthday || !row.education || !row.entranceTime) {
    message.warning("请检查填写项，填写完整后再进行保存")
    return
  }
  spinning.value = true
  let p = {
    name: row.name,
    gender: row.gender,
    birthday: dayjs(row.birthday).format("YYYY-MM-DD"),
    education: row.education,
    id: row.id || "",
    entranceTime: row.entranceTime.valueOf(),
    laboratoryId: laboratoryId.value
  }
  let res = await addLaboratoryOtherPaersonAPI(p)
  spinning.value = false
  if (res) {
    row.isEdit = false
    getLaboratoryPerson()
  }
}

const getLaboratoryPerson = async () => {
  spinning.value = true
  let res = await getLabPersonAPI(laboratoryId.value)
  otherPersonSource.value = res.offStaff

  personSource.value = res.staff
  if (res.principal) {
    //如果有授权负责人 则添加到持证人员列表显示
    authorizedPerson.value = res.principal
    personSource.value.unshift(res.principal)
  } else {
    authorizedPerson.value = {}
  }
  spinning.value = false
}

//选择添加时间回调,
const handAddTimeOk = async () => {
  if (addType.value == 1) {
    addAuthorizedPerson("")
  } else {
    addCertifiedPerson()
  }
}
//添加持证人员
const addCertifiedPerson = async () => {
  spinning.value = true
  console.log(selPersonList.value)
  //过滤已存在在人员
  let arrExist: any = []
  let ids = personSource.value.map((item) => {
    return item.personId
  })
  for (let i = selPersonList.value.length - 1; i >= 0; i--) {
    if (ids.join(",").includes(selPersonList.value[i].id)) {
      arrExist.push(selPersonList.value[i])
      selPersonList.value.splice(i, 1)
    }
  }

  //过滤后重新组装数据
  let list = selPersonList.value.map((item) => {
    return {
      laboratoryId: laboratoryId.value,
      personId: item.id,
      entranceTime: selAddTimeValue.value.valueOf(),
      name: item.name
    }
  })
  await addLaboratoryPaersonAPI(list)
  spinning.value = false
  addTimeVisible.value = false
  selPersonVisible.value = false
  selAddTimeValue.value = dayjs(new Date())
  getLaboratoryPerson()
  if (arrExist.length) {
    Modal.warning({
      title: "以下人员无法添加，已存在试验室！",
      content: h(
        "div",
        {},
        arrExist.map((item) => {
          return h("p", item.name + " - " + item.jobTitle)
        })
      )
    })
  } else {
    message.success("添加成功")
  }
}
//添加授权人员
const addAuthorizedPerson = async (obj) => {
  spinning.value = true
  let p: any = null
  if (obj) {
    p = obj
  } else {
    p = selPersonList.value.map((item) => {
      return {
        laboratoryId: laboratoryId.value,
        personId: item.id,
        entranceTime: selAddTimeValue.value.valueOf(),
        name: item.name
      }
    })[0]
  }
  let res = await addLabPrincipalPersonAPI(p)
  if (res) {
    spinning.value = false
    addTimeVisible.value = false
    selPersonVisible.value = false
    selAddTimeValue.value = dayjs(new Date())
    getLaboratoryPerson()
    message.success("添加成功")
  }
}

//保存工作经历
const saveExperience = () => {
  let p = authorizedPerson.value
  addAuthorizedPerson({
    laboratoryId: laboratoryId.value,
    personId: p.personId,
    entranceTime: p.entranceTime,
    name: p.name,
    experience: p.experience
  })
}
//移出其他人员
const removeOtherPerson = async (row) => {
  let editing = otherPersonSource.value.some((item) => {
    return item.isEdit === true
  })
  if (editing && row.id) {
    message.warning("有正在编辑中的数据，请保存后在移出")
    return
  }
  if (row.id) {
    spinning.value = true

    spinning.value = true
    await removeLaboratoryPaersonAPI({
      id: row.id,
      nature: row.nature,
      laboratoryId: laboratoryId.value
    })
    // let res = await removeLaboratoryOtherPaersonAPI(row.id)
    getLaboratoryPerson()
    spinning.value = false
  } else {
    otherPersonSource.value.pop()
  }
}

//选择移除时间回调
const handleRemoveTimeOk = async () => {
  spinning.value = true
  await removeLaboratoryPaersonAPI({
    id: removePerson.value.id,
    nature: removePerson.value.nature,
    leaveTime: selRemoveTimeValue.value.valueOf(),
    laboratoryId: laboratoryId.value
  })
  spinning.value = false
  removeTimeVisible.value = false
  selRemoveTimeValue.value = dayjs(new Date())
  getLaboratoryPerson()
}

//选择人员回调
const slePersonOk = (v) => {
  selPersonList.value = v
  addTimeVisible.value = true
}
//打开选择人员
const openSelPenson = (t) => {
  addType.value = t
  selPersonVisible.value = true
}
// 选择人员数据源
let selPersonList: any = ref([])

//是否可以点击下一步
const addLaboratoryPaersonOk = async () => {
  return Promise.resolve()
  // if (!personSource.value.length) {
  //     message.warning("请先添加人员信息")
  //     return Promise.reject('请先添加人员信息')
  // }
  // try {
  //     let p: any = [];
  //     personSource.value.forEach(item => {
  //         if (item.newly) {
  //             p.push({
  //                 laboratoryId: laboratoryId.value,
  //                 personId: item.id,
  //                 entranceTime: item.entranceTime,
  //                 name: item.name
  //             })
  //         }
  //     })
  //     return p.length ? await addLaboratoryPaersonAPI(p) : Promise.resolve()

  // } catch (error) {
  //     return Promise.reject(error)
  // }
}
//移除人员
const removePersonFun = (row: unknown) => {
  removeTimeVisible.value = true
  removePerson.value = row
  // personSource.value.forEach((item, i) => {
  //     if (item.id === row.id) {
  //         personSource.value.splice(i, 1)
  //     }
  // });
}

let personColumns = [
  {
    title: "姓名",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "性别",
    dataIndex: "gender",
    key: "gender"
  },
  // {
  //   title: "证件号",
  //   dataIndex: "idNum",
  //   key: "idNum"
  // },
  {
    title: "职称",
    dataIndex: "jobTitle",
    key: "jobTitle"
  },
  {
    title: "证书编号",
    dataIndex: "certNos",
    key: "certNos",
    width: 250
  },
  {
    title: "工作年限",
    dataIndex: "serviceYear",
    key: "serviceYear"
  },
  {
    title: "备案时间",
    dataIndex: "entranceTime",
    key: "entranceTime"
  },
  {
    title: "操作",
    key: "handle"
  }
]

let otherPersonColumns = [
  {
    title: "姓名",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "性别",
    dataIndex: "gender",
    key: "gender"
  },
  {
    title: "出生年月",
    dataIndex: "birthday",
    key: "birthday"
  },
  {
    title: "学历和专业",
    dataIndex: "education",
    key: "education"
  },
  {
    title: "备案时间",
    dataIndex: "entranceTime",
    key: "entranceTime"
  },
  {
    title: "操作",
    key: "handle"
  }
]
defineExpose({
  addLaboratoryPaersonOk
})
</script>
<style lang="less" scoped>
.action_row {
  row-gap: 0px;
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.person_wrap {
  .tle {
    margin: 10px 0;
  }
  .tle:first-child {
    margin: 0;
    margin-bottom: 10px;
  }
}
</style>
