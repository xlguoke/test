<template>
  <HtModal
    v-model:open="internalOpen"
    :title="props.param.isEdit ? '编辑过程信息' : '新增过程信息'"
    width="600px"
    :confirm-loading="submitting"
    :loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <IlisForm
      ref="formRef"
      class="!pr-8"
      :cols="1"
      :entity="ParamProcessEntity"
      :init-data="formData"
    >
      <!-- 自定义下拉列表字段 -->
      <template #listValue>
        <a-form-item-rest>
          <div
            v-for="(item, index) in listValueArray"
            :key="index"
            class="flex gap-2 mb-2 items-center"
          >
            <a-input
              v-model:value="item.desc"
              placeholder="请输入描述"
              class="flex-1"
            />
            <a-input
              v-model:value="item.value"
              placeholder="请输入值"
              class="flex-1"
            />
            <a-space>
              <PlusCircleOutlined
                class="text-[var(--colorPrimary)] cursor-pointer text-lg hover:opacity-80"
                @click="addListValueItem(index)"
              />
              <MinusCircleOutlined
                v-if="listValueArray.length > 1"
                class="text-[var(--colorError)] cursor-pointer text-lg hover:opacity-80"
                @click="removeListValueItem(index)"
              />
            </a-space>
          </div>
        </a-form-item-rest>
      </template>
    </IlisForm>
  </HtModal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { ICreateParamProcessRequest, IListValueItem, ITestParamDTO, IUpdateParamProcessRequest } from '~/api/unit-config/test-param/types'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { getParamProcessDetailApi, saveParamProcessApi, updateParamProcessApi } from '~/api/unit-config/test-param'
import { ParamProcessEntity } from '../entity/ParamProcessEntity'

/**
 * # 弹窗参数接口
 */
interface IParam {
  isEdit: boolean
  id?: string
  rows?: ITestParamDTO[]
}

/**
 * # 弹窗返回值类型
 */
type TResult = boolean

const props = defineProps<IDialogPropsParam<TResult, IParam>>()

/** 弹窗显示状态 */
const internalOpen = ref(true)

/** 表单引用 */
const formRef = ref<IlisFormExpose<ParamProcessEntity>>()

/** 数据加载状态（获取详情时） */
const loading = ref(false)

/** 提交状态（保存时） */
const submitting = ref(false)

/** 下拉列表数据数组 */
const listValueArray = ref<IListValueItem[]>([{ value: '', desc: '' }])

/** 表单数据 */
const formData = ref<ParamProcessEntity>(new ParamProcessEntity())

/** 是否已初始化 */
const initialized = ref(false)

onMounted(async () => {
  if (props.param.isEdit && props.param.id) {
    await loadDetail()
  }
  else {
    initFormData()
  }
  initialized.value = true
})

/**
 * # 加载详情数据
 */
async function loadDetail() {
  if (!props.param.id)
    return

  loading.value = true
  try {
    const { data } = await getParamProcessDetailApi(props.param.id)
    if (data) {
      formData.value = Object.assign(new ParamProcessEntity(), data)
      initListValueArray(data.listValue)
    }
  }
  catch (error) {
    message.error('获取详情失败')
    console.error(error)
  }
  finally {
    loading.value = false
  }
}

/**
 * # 初始化表单数据（新增时）
 */
function initFormData() {
  const row = props.param.rows?.[0]
  if (row) {
    formData.value = Object.assign(new ParamProcessEntity(), {
      testItemId: row.testItemId,
      testParamId: row.id,
      testParamSystemId: row.systemId,
    })
  }
  else {
    formData.value = new ParamProcessEntity()
  }
}

/**
 * # 初始化下拉列表数组
 * @param listValue JSON字符串
 */
function initListValueArray(listValue?: IListValueItem[]) {
  try {
    listValueArray.value = listValue || [{ value: '', desc: '' }]
  }
  catch {
    listValueArray.value = [{ value: '', desc: '' }]
  }
}

/**
 * # 添加下拉列表项
 * @param index 当前索引
 */
function addListValueItem(index: number) {
  listValueArray.value.splice(index + 1, 0, { value: '', desc: '' })
}

/**
 * # 删除下拉列表项
 * @param index 索引
 */
function removeListValueItem(index: number) {
  if (listValueArray.value.length > 1) {
    listValueArray.value.splice(index, 1)
  }
}

/**
 * # 处理确认
 */
async function handleOk() {
  if (!initialized.value)
    return

  const data = await formRef.value?.getFormData()
  if (!data)
    return

  submitting.value = true
  try {
    const filteredList = listValueArray.value.filter(
      item => item.value || item.desc,
    )

    if (props.param.isEdit && props.param.id) {
      // 编辑时：单条数据更新
      const submitData: IUpdateParamProcessRequest = {
        testItemId: data.testItemId!,
        testParamId: data.testParamId!,
        testParamSystemId: data.testParamSystemId!,
        name: data.name!,
        dataType: data.dataType!,
        listValue: filteredList,
        defaultValue: data.defaultValue,
        orderNo: data.orderNo,
        memo: data.memo,
      }
      await updateParamProcessApi(props.param.id, submitData)
      message.success('修改成功')
    }
    else {
      // 新增时：批量操作
      if (!props.param.rows || props.param.rows.length === 0) {
        message.error('请先选择参数')
        return
      }

      const submitData: ICreateParamProcessRequest = {
        testParamsId: props.param.rows.map(row => row.id),
        name: data.name!,
        dataType: data.dataType!,
        listValue: filteredList,
        defaultValue: data.defaultValue,
        orderNo: data.orderNo,
        memo: data.memo,
      }
      await saveParamProcessApi(submitData)
      message.success('新增成功')
    }

    props.onConfirm(true)
    internalOpen.value = false
  }
  catch (error) {
    message.error(props.param.isEdit ? '修改失败' : '新增失败')
    console.error(error)
  }
  finally {
    submitting.value = false
  }
}
</script>
