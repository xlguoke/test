<template>
  <ht-modal
    v-model:open="visible"
    title="复制委托"
    width="800px"
    :loading="loading"
    :after-close="onClosed"
    @cancel="visible = false"
    @ok="onOk"
  >
    <div class="min-h-[50vh]">
      <a-form ref="formRef" :model="form" :label-col="{ style: { width: '80px' } }">
        <a-form-item label="复制数量" name="copyAmount" :rules="[{ required: true, message: '请输入复制数量' }]">
          <a-input-number
            v-model:value="form.copyAmount"
            placeholder="请输入复制数量"
            class="w-40"
            :min="1"
            :precision="0"
            :controls="false"
          />
        </a-form-item>
        <a-form-item label="委托字段" name="checkedFields">
          <a-form-item-rest>
            <a-checkbox v-model:checked="checkedAll" class="my-2" @change="changeCheckedAll">
              全选
            </a-checkbox>
            <a-checkbox-group v-model:value="form.checkedFields" @change="changeChecked">
              <a-row>
                <a-col v-for="d in fields" :key="d.name" :span="8">
                  <a-checkbox :value="d.name">
                    {{ d.describe }}
                  </a-checkbox>
                </a-col>
              </a-row>
            </a-checkbox-group>
          </a-form-item-rest>
        </a-form-item>
      </a-form>
    </div>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { CopyFields } from '../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { copyFieldsApi, copyLayoutFieldsApi } from '../api'

export interface PropParam {
  consignIds: string[]
}

export interface CopyFieldForm {
  copyAmount: number
  checkedFields: string[]
}

const props = defineProps<IDialogPropsParam<CopyFieldForm, PropParam>>()
const visible = ref(true)
const loading = ref(false)
const formRef = ref()
const fields = ref<CopyFields[]>([])
const form = ref<CopyFieldForm>({
  copyAmount: 1,
  checkedFields: [],
})
const checkedAll = ref(false)

function changeCheckedAll() {
  form.value.checkedFields = checkedAll.value ? fields.value.map(d => d.name) : []
}
function changeChecked() {
  checkedAll.value = form.value.checkedFields.length === fields.value.length
}

/** 筛选出必填项 */
function isRequiredFlat(datas: any[]) {
  const obj: any = {}
  for (let i = 0; i < datas.length; i++) {
    for (let j = 0; j < datas[i].length; j++) {
      const item = datas[i][j]
      if (!item.label)
        continue
      const key = item.label.replace(/：/, '')
      if (item.required)
        obj[key] = true
    }
  }
  return obj
}

/** 获取自定义布局中的字段信息：返回必填项 */
async function getCustomFields() {
  // 1-正常委托  2-综合试验  3-两者都有
  const requiredObj: Record<1 | 2 | 3, Record<string, boolean>> = {
    1: {},
    2: {},
    3: {},
  }
  try {
    const { data } = await copyLayoutFieldsApi()
    const _consign = data[0]?.layout || []
    const _tes = data[1]?.layout || []
    requiredObj['1'] = isRequiredFlat(_consign)
    requiredObj['2'] = isRequiredFlat(_tes)
    requiredObj['3'] = Object.assign({}, requiredObj['1'], requiredObj['2'])
  }
  catch (err) {
    console.error(err)
  }
  return requiredObj
}

/** 过滤掉列表中的必填项  type: 1-正常委托  2-综合试验  3-两者都有 */
function filterRequired(list: CopyFields[], type: 1 | 2 | 3, requireds: any) {
  if (!list)
    list = []
  if (!type)
    type = 1
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    if (requireds[type][item.describe]) {
      list.splice(i, 1)
      i--
    }
  }
  return list
}

/** 获取待复制字段 */
async function getCopyFields() {
  loading.value = true
  try {
    const ids = props.param.consignIds.join(',')
    const requiredObj = await getCustomFields()
    const { data } = await copyFieldsApi(ids)
    const _type = data.attributes ? data.attributes.type : 1
    const list = data.obj || []

    fields.value = filterRequired(list, _type, requiredObj)
    form.value.checkedFields = fields.value.map(d => d.name)
    checkedAll.value = fields.value.length > 0
  }
  catch (err) {
    console.error(err)
  }
  loading.value = false
}

async function onOk() {
  try {
    await formRef.value.validate()
    props.onConfirm(form.value)
    visible.value = false
  }
  catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  getCopyFields()
})
</script>

<style>

</style>
