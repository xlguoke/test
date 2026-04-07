<template>
  <a-modal
    v-model:visible="visible"
    title="检测机构信息变更"
    :mask-closable="false"
    :keyboard="false"
    :confirm-loading="saveLoading"
    cancel-text="关闭"
    width="800px"
  >
    <template #footer>
      <a-button v-if="!disabled" @click="visible = false">关闭</a-button>
      <a-button type="primary" @click="handleOk">确定</a-button>
    </template>
    <a-spin :spinning="spinning">
      <a-form
        ref="formRef"
        :model="form"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
        :rules="rules"
      >
        <a-form-item label="机构名称" name="orgName">
          <div class="flex-row">
            <a-input
              v-model:value="form.orgName"
              readonly
              :disabled="disabled"
              placeholder="请选择检测机构"
              @click="openSelectedOrg"
            />
            <a-button v-if="!disabled" type="primary" @click="openSelectedOrg">选择</a-button>
          </div>
        </a-form-item>
        <a-form-item label="变更内容" name="amendContent">
          <div class="form-item-border">
            <DictCode
              v-model:value="form.amendContent"
              code="pending::amend::org-content"
              type="checkbox"
              row-key="name"
              :disabled="disabled"
            />
          </div>
        </a-form-item>
        <a-form-item label="附件资料">
          <UploadFile
            v-if="!disabled"
            v-model:value="form.attachments"
            :config="{
              types: ['pdf', 'image', 'word', 'excel'],
              btnName: '上传附件'
            }"
          />
          <FileList v-else :datas="form.attachments" />
        </a-form-item>
        <a-form-item label="流程人员" name="people">
          <ul class="process_personnel">
            <template v-for="(user, i) in form.people" :key="user.orgPersonId">
              <li v-if="i > 0" class="process-arrow"></li>
              <li
                :class="`process_personnel_item ${user.completed ? 'completed' : ''}`"
                @click="openProcessPersonnel(user, i)"
              >
                <p class="type">{{ nodeTypeLabel(user.type) }}：</p>
                <p class="name">{{ user.orgPersonName }}</p>
                <p
                  v-if="!disabled"
                  class="close-icon hover-icon"
                  @click.stop="form.people.splice(i, 1)"
                >
                  <close-outlined />
                </p>
              </li>
            </template>
            <li
              v-if="!disabled"
              class="process_personnel_plus hover-icon"
              @click="openProcessPersonnel()"
            >
              <plus-outlined />
            </li>
          </ul>
        </a-form-item>
      </a-form>
    </a-spin>

    <SelectedOrg ref="selectedOrgRef" @confirm="getSelectedOrg" />
    <ProcessPersonnel ref="processPersonnelRef" @confirm="getProcessPersonnel" />
  </a-modal>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue"
import { CloseOutlined, PlusOutlined } from "@ant-design/icons-vue"
import UploadFile from "@/components/uploadFile/index.vue"
import FileList from "@/components/fileList/index.vue"
import DictCode from "@/components/dictCode/index.vue"
import SelectedOrg from "./SelectedOrg.vue"
import ProcessPersonnel from "./ProcessPersonnel.vue"
import { ProcessPeople, SaveParam } from "@/type/api/orgAmend.api"
import { message } from "ant-design-vue"
import { NODE_TYPE, NODE_TYPE_DICT } from ".."
import { addApi, detailApi, updateApi } from "@/api/orgAmend.api"
import userStores from "@/stores/userInfo"

const { userInfo } = userStores()

const emits = defineEmits(["confirm"])

const spinning = ref(false)
const visible = ref(false)
const disabled = ref(false)
const rules = {
  orgName: [{ required: true, message: "请选择检测机构", trigger: "change" }],
  amendContent: [{ required: true, message: "请选择变更内容", trigger: "change" }],
  people: [{ required: true, message: "请选择流程人员", trigger: "change" }]
}

// 流程节点类型
function nodeTypeLabel(val: NODE_TYPE) {
  return NODE_TYPE_DICT.find((d) => d.value === val)?.label || ""
}

const formRef = ref()
const form = ref<SaveParam>({
  orgId: "",
  orgName: "",
  amendContent: [],
  people: [],
  attachments: []
})

const openModal = (id: string, isDisabled: boolean) => {
  form.value = {
    orgId: "",
    orgName: "",
    amendContent: [],
    people: [],
    attachments: []
  }
  disabled.value = isDisabled || false
  visible.value = true
  nextTick(() => {
    formRef.value.resetFields()
    id && getDatas(id)
  })
}

// 获取详情
const getDatas = (id: string) => {
  spinning.value = true
  detailApi(id)
    .then((res) => {
      if (!disabled.value) {
        res.people = res.people.filter((d) => d.type !== NODE_TYPE.EXECUTION)
      }
      form.value = res
      spinning.value = false
    })
    .catch(() => {
      spinning.value = false
    })
}

/**
 * 选择检测机构
 */
const selectedOrgRef = ref()
function openSelectedOrg() {
  selectedOrgRef.value.openModal(form.value.orgId)
}
function getSelectedOrg(data) {
  form.value.orgId = data.id
  form.value.orgName = data.name
}

/**
 * 选择流程人员
 */
const processPersonnelRef = ref()
const editUserIndex = ref(-1)
function openProcessPersonnel(user?: ProcessPeople, ind?: number) {
  if (disabled.value) return
  const selUsers = form.value.people.map((item) => item.orgPersonId)
  if (!!user && ind !== undefined) {
    editUserIndex.value = ind
  }
  processPersonnelRef.value.openModal(userInfo.orgId, selUsers, user)
}
function getProcessPersonnel(data: ProcessPeople) {
  if (editUserIndex.value === -1) {
    form.value.people.push(data)
  } else {
    form.value.people.splice(editUserIndex.value, 1, data)
  }
  formRef.value.validateFields(["people"])
  editUserIndex.value = -1
}

/**
 * 保存
 */
const saveLoading = ref(false)
const handleOk = async () => {
  if (disabled.value) {
    visible.value = false
    return
  }

  await formRef.value.validateFields()
  const data = { ...form.value }

  try {
    saveLoading.value = true
    if (data.id) {
      await updateApi(data)
    } else {
      await addApi(data)
    }
    message.success("保存成功")
    visible.value = false
    emits("confirm")
  } finally {
    saveLoading.value = false
  }
}

defineExpose({
  openModal
})
</script>

<style scoped lang="less">
.process_personnel {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 8px;
  row-gap: 8px;
}
.process-arrow {
  display: flex;
  align-items: center;
  &::before {
    content: "";
    display: block;
    width: 30px;
    height: 6px;
    background-color: #ccc;
  }
  &::after {
    content: "";
    display: block;
    border-left: 10px solid #ccc;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-right: transparent;
  }
}
.process_personnel_item {
  display: inline-flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 2px;
  cursor: pointer;
  &.completed {
    border-color: #0ac77c;
  }
  &.completed .type {
    background-color: #91f194;
  }
  .type {
    background-color: #ddd;
    padding: 4px 8px;
  }
  .name {
    padding: 4px 8px;
  }
  .close-icon {
    padding: 4px 8px;
    height: 100%;
    border-left: 1px solid #ddd;
  }
}
.process_personnel_plus {
  display: inline-flex;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 2px;
  cursor: pointer;
}

.flex-row {
  display: flex;
  align-items: center;
  column-gap: 8px;
}

.form-item-border {
  padding: 4px 8px;
  border-radius: 2px;
  border: 1px solid #ddd;
  :deep(.ant-checkbox-wrapper) {
    margin-left: 0;
    width: 33%;
  }
}
.hover-icon {
  transition: 0.2s;
  &:hover {
    background-color: #eee;
  }
}
</style>
