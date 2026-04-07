<template>
  <a-form ref="formRef" :model="formData" :label-col="{ style: { width: '110px' } }">
    <template v-for="(v, k) in config" :key="k">
      <a-form-item
        :label="v.name"
        :name="k"
        :rules="[{ required: (v as ProcessorConfigInfo_2).required, message: `${v.name}为必填项` }]"
      >
        <DynamicConfigTable
          v-if="(v as ProcessorConfigInfo).properties"
          :config="(v as ProcessorConfigInfo)"
          :default-data="(defaultData[k] as ProcessorConfigInfo)?.properties"
          @change="(d: ProcessorConfigInfo_2[]) => changeDynamicConfig(k, v as ProcessorConfigInfo, d)"
        />
        <template v-else>
          <div v-if="(v as ProcessorConfigInfo_2).formType === 'upload'">
            <a-button type="link" @click="openUploadModal(k)">
              上传模板
            </a-button>

            <AttachmentList
              v-if="fileList[k] && fileList[k].length"
              list-type="picture-card"
              show-del
              :col="2"
              :datas="fileList[k]"
              @delete="() => {
                formData[k] = ''
                fileList[`${k}${fileNameKey}`] = []
              }"
            />
          </div>
          <a-input v-else v-model:value="formData[k]" :placeholder="`请输入${v.name}`" />
        </template>
      </a-form-item>
    </template>

    <IlisUpload
      v-model:show="showUpload"
      :accept="['.doc', '.docx', '.pdf']"
      :max="1"
      force
      @success="handleUploadSuccess"
    />
  </a-form>
</template>

<script setup lang='ts'>
import type { ProcessorConfig, ProcessorConfigInfo, ProcessorConfigInfo_2 } from '../interface'
import DynamicConfigTable from './DynamicConfigTable.vue'

const props = defineProps<{
  config: ProcessorConfig
  defaultData: ProcessorConfig
}>()

const fileNameKey = '_Title'
const formRef = ref()
const formData = ref<any>({})
const fileList = ref<Record<string, any>>({})
const showUpload = ref(false)

/** 编辑时初始化数据: 动态项以配置项为准 */
function initFormData() {
  for (const k in props.config) {
    const v = props.config[k]
    const formType = (v as ProcessorConfigInfo_2).formType
    if (formType === 'upload') {
      const url = (props.defaultData[k] || '') as unknown as string
      if (!url)
        continue
      let name = (props.defaultData[`${k}${fileNameKey}`] || '') as unknown as string
      if (!name) {
        name = url.substring(url.lastIndexOf('/') + 1)
      }
      formData.value[k] = url
      fileList.value[k] = [{
        name,
        url,
        id: k,
      }]
      continue
    }
    formData.value[k] = props.defaultData[k] || ''
  }
}

initFormData()

/** 上传模板 */
let uploadField = ''
function openUploadModal(field: string) {
  uploadField = field
  showUpload.value = true
}

/** 上传回调 */
function handleUploadSuccess(datas: any[]) {
  fileList.value[uploadField] = datas.map((d) => {
    return {
      name: d.attachmenttitle,
      id: d.id,
      url: d.realpath,
    }
  })
  formData.value[uploadField] = datas[0].realpath
}

/** 修改动态配置项 */
function changeDynamicConfig(field: string, configItem: ProcessorConfigInfo, datas: ProcessorConfigInfo_2[]) {
  formData.value[field] = { ...configItem, properties: {} as Record<string, ProcessorConfigInfo_2> }
  for (let i = 0; i < datas.length; i++) {
    const item = { ...datas[i] }

    if (item.formType === 'input')
      item.dictCode = ''
    else if (item.formType !== 'upload')
      item.formType = 'input'

    formData.value[field].properties[item.fieldCode!] = {
      ...item,
    }
  }
}

/** 保存 */
async function saveData() {
  try {
    await formRef.value.validate()
    const form = { ...formData.value }
    for (const k in fileList.value) {
      if (fileList.value[k] && fileList.value[k].length) {
        form[k] = fileList.value[k][0].url
        form[`${k}${fileNameKey}`] = fileList.value[k][0].name
      }
    }
    return form
  }
  catch (err) {
    console.error(err)
    return null
  }
}

defineExpose({
  saveData,
})
</script>

<style>

</style>
