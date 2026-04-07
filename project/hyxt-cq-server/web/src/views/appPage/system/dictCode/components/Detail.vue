<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :keyboard="false"
    :confirm-loading="confirmLoading"
    width="900px"
    @ok="handleOk"
  >
    <a-spin :spinning="spinning">
      <div style="min-height: 400px">
        <a-form ref="refForm" :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
          <a-form-item
            label="字典名称"
            name="name"
            :rules="[{ required: true, message: '请输入字典名称' }]"
          >
            <a-input v-model:value="form.name" style="width: 50%" placeholder="请输入字典名称" />
          </a-form-item>
          <a-form-item
            label="字典编码"
            name="code"
            :rules="[{ required: true, message: '请输入字典编码' }]"
          >
            <a-input v-model:value="form.code" style="width: 50%" placeholder="请输入字典编码" />
          </a-form-item>
          <a-form-item label="字典内容" :rules="[{ required: true }]">
            <a-space v-for="(item, i) in form.dict" :key="i">
              <a-form-item
                label="名称"
                :name="['dict', i, 'name']"
                :rules="[{ required: true, message: '请输入名称' }]"
              >
                <a-input v-model:value="item.name" style="width: 240px" placeholder="请输入名称" />
              </a-form-item>
              <a-form-item
                label="编码"
                :name="['dict', i, 'code']"
                :rules="[{ required: true, message: '请输入编码' }]"
              >
                <a-input v-model:value="item.code" style="width: 240px" placeholder="请输入编码" />
              </a-form-item>
              <MinusCircleOutlined v-if="form.dict && form.dict.length > 1" @click="delRow(i)" />
            </a-space>
          </a-form-item>
          <div style="padding-left: 130px; margin-top: -24px">
            <a-button type="link" @click="addRow">
              <plus-outlined />
              添加
            </a-button>
          </div>
        </a-form>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { FormInstance, message } from "ant-design-vue"
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons-vue"
import { getDetail, save, listType } from "@/api/dictCode.api"

const props = defineProps(["updateList"])
const title = ref("新增字典")
const spinning = ref(false)
const visible = ref(false)
const editId = ref("")
const openModal = (id: string) => {
  title.value = id ? "编辑字典" : "新增字典"
  editId.value = id || ""
  visible.value = true
  id && getDatas()
}

defineExpose({
  openModal
})

//  编辑时获取详情数据
const getDatas = () => {
  spinning.value = true
  getDetail(editId.value).then((res: any) => {
    spinning.value = false
    if (!res) return
    form.value = res
  })
}

const form = ref<listType>({
  id: "",
  name: "",
  code: "",
  dict: [
    {
      id: "",
      name: "",
      code: ""
    }
  ]
})

// 保存
const confirmLoading = ref<boolean>(false)
const refForm = ref<FormInstance>()
const handleOk = async () => {
  await (refForm.value as FormInstance).validateFields()
  confirmLoading.value = true
  save(form.value)
    .then((res) => {
      message.success("保存成功")
      props.updateList()
      visible.value = false
    })
    .catch(() => {
      confirmLoading.value = false
    })
}

// 添加行
const addRow = () => {
  form.value.dict?.push({
    id: "",
    name: "",
    code: ""
  })
}
// 删除行
const delRow = (ind: number) => {
  form.value.dict?.splice(ind, 1)
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
