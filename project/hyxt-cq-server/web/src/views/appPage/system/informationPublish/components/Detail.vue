<!--
 * @Author: lijing
 * @Date: 2023-08-08 11:33:46
 * @LastEditors: your name
 * @LastEditTime: 2023-09-19 20:49:50
 * @Description: 
 * @FilePath: \web\src\views\appPage\system\informationPublish\components\Detail.vue
-->
<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :keyboard="false"
    :confirm-loading="confirmLoading"
    width="70%"
    @ok="handleOk"
  >
    <a-form ref="refForm" :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="类别" name="type" :rules="[{ required: true, message: '请选择类别' }]">
        <a-select v-model:value="form.type" style="width: 50%" placeholder="请选择类别">
          <a-select-option v-for="news in newsType" :key="news.type" :value="news.type">
            {{ news.title }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item v-if="form.type == 'POLICY'" label="信息类型" name="customCategory">
        <a-radio-group v-model:value="form.customCategory" name="radioGroup">
          <a-radio value="MINISTERIAL_REGULATION">部委规章</a-radio>
          <a-radio value="LOCAL_REGULATION">地方规定</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="标题" name="title" :rules="[{ required: true, message: '请输入标题' }]">
        <a-input
          v-model:value="form.title"
          style="width: 50%"
          placeholder="请输入标题（最多输入100个字符）"
          :maxlength="100"
        />
      </a-form-item>
      <a-form-item label="内容" name="content" :rules="[{ required: true, message: '请输入内容' }]">
        <WEditor v-model:value="form.content" />
      </a-form-item>
      <a-form-item
        label="发布日期"
        name="publishDate"
        :rules="[{ required: true, message: '请选择发布日期' }]"
      >
        <a-date-picker v-model:value="form.publishDate" format="YYYY-MM-DD" style="width: 50%" />
      </a-form-item>
      <a-form-item label="审核日期" name="auditedTime">
        <a-date-picker v-model:value="form.auditedTime" format="YYYY-MM-DD" style="width: 50%" />
      </a-form-item>
      <a-form-item
        label="封面图片"
        name="pictureUrl"
        :rules="[{ required: form.isPicture, message: '请上传封面图片' }]"
      >
        <UploadFile
          v-model:value="pictureList"
          :config="{
            multiple: false,
            types: ['image']
          }"
        />
      </a-form-item>
      <a-form-item label="是否置顶" name="isTop">
        <a-checkbox v-model:checked="form.isTop">置顶</a-checkbox>
      </a-form-item>
      <a-form-item
        label="置顶截至日期"
        name="topExpirationDate"
        :rules="[{ required: form.isTop, message: '请输入内容' }]"
      >
        <a-date-picker
          v-model:value="form.topExpirationDate"
          style="width: 50%"
          format="YYYY-MM-DD"
          placeholder="请输入置顶截至日期"
        />
      </a-form-item>
      <a-form-item label="选项">
        <a-row :gutter="30">
          <a-col>
            <a-form-item name="isPicture">
              <a-checkbox v-model:checked="form.isPicture">是否为图片新闻</a-checkbox>
            </a-form-item>
          </a-col>
          <!-- <a-col>
            <a-form-item name="isInWebsite">
              <a-checkbox v-model:checked="form.isInWebsite">是否为站内新闻</a-checkbox>
            </a-form-item>
          </a-col>-->
        </a-row>
      </a-form-item>
      <a-form-item label="附件" name="attachments">
        <UploadFile v-model:value="fileList" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue"
import { FormInstance, message } from "ant-design-vue"
import dayjs from "dayjs"
import WEditor from "@/components/WEditor/index.vue"
import UploadFile from "@/components/uploadFile/index.vue"
import { getDetail, saveNews } from "@/api/information.api"
import type { fileType, dataItemType } from "@/type/api/information.api"

const props = defineProps(["newsType", "updateList"])
const title = ref("新增")
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

//  编辑时获取详情数据
const getDatas = () => {
  getDetail(editId.value, true).then((res: any) => {
    res.publishDate && (res.publishDate = dayjs(res.publishDate))
    res.auditedTime && (res.auditedTime = dayjs(res.auditedTime))
    res.topExpirationDate && (res.topExpirationDate = dayjs(res.topExpirationDate))
    form.value = res
    let url = res.pictureUrl
    fileList.value = res.attachments
    if (url) {
      let arr = url.split("/")
      let name = arr[arr.length - 1]
      pictureList.value = [{ url, name }]
    }
  })
}

const form = ref<dataItemType>({
  id: "",
  title: "",
  type: null,
  content: "",
  publishDate: "",
  auditedTime: "",
  pictureUrl: "",
  isTop: false,
  topExpirationDate: "",
  isPicture: false,
  isInWebsite: false,
  customCategory: "MINISTERIAL_REGULATION"
})

const pictureList = ref<fileType[]>([])
const fileList = ref<fileType[]>([])
watch(pictureList, (files) => {
  form.value.pictureUrl = files.length > 0 ? files[0].url : ""
  nextTick(() => {
    ;(refForm.value as FormInstance).validateFields(["pictureUrl"])
  })
})

watch(
  () => form.value.content,
  () => {
    nextTick(() => {
      ;(refForm.value as FormInstance).validateFields(["content"])
    })
  }
)

// 保存
const confirmLoading = ref<boolean>(false)
const refForm = ref()
const handleOk = async () => {
  const formObj = await refForm.value.validateFields()
  formObj.attachments = fileList.value.map((d) => {
    return {
      name: d.name,
      url: d.url,
      uploadTime: "",
      remark: ""
    }
  })
  if (formObj.publishDate) {
    formObj.publishDate = dayjs(formObj.publishDate).valueOf() + ""
  }
  if (formObj.auditedTime) {
    formObj.auditedTime = dayjs(formObj.auditedTime).valueOf() + ""
  }
  if (formObj.topExpirationDate) {
    formObj.topExpirationDate = dayjs(formObj.topExpirationDate).valueOf() + ""
  }
  if (editId.value) {
    formObj.id = editId.value
  }

  confirmLoading.value = true
  saveNews(formObj)
    .then(() => {
      message.success("保存成功")
      props.updateList()
      visible.value = false
    })
    .catch(() => {
      confirmLoading.value = false
    })
}
</script>

<style scoped lang="less"></style>
