<template>
  <ht-modal
    v-model:open="open"
    title="新增"
    width="460px"
    :mask-closable="false"
    destroy-on-close
    :confirm-loading="submitLoading"
    centered
    :after-close="onClosed"
  >
    <a-form
      ref="formRef"
      :model="formState"
      class="pt-4"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
    >
      <a-form-item label="大类" name="bigCategoryIds" :rules="[{ required: true, message: '大类为必填项！' }]">
        <a-tree-select
          v-model:value="formState.bigCategoryIds"
          :tree-data="treeData"
          tree-checkable
          allow-clear
          placeholder="请选择"
          tree-node-filter-prop="label"
          tree-check-strictly
          show-checked-strategy="SHOW_ALL"
          :field-names="{
            label: 'name',
            value: 'id',
          }"
        />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="onCancel">
        取消
      </a-button>
      <a-button
        type="primary"
        :loading="submitLoading"
        @click="onSubmit"
      >
        确定
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps.ts'
import type { BigCategoryTreeEntity } from '~/components/bigCategoryTree/api.ts'
import { getBigCategory } from '~/components/bigCategoryTree/api.ts'
import { saveDashboardSelect } from '~/views/system/bigCategory/testScreenBigCategoryRange/api.ts'

const props = defineProps<IDialogPropsParam<null, any>>()

const treeData = ref<BigCategoryTreeEntity[]>([])

const dashboardOrderNum = computed(() => props.param.dashboardOrderNum)

const open = ref(true)

const formRef = ref()

const submitLoading = ref(false)

const formState = ref({
  bigCategoryIds: [],
})

initBigCategoryTree()

async function initBigCategoryTree() {
  const res = await getBigCategory()
  treeData.value = formatBigCategoryTree(res.data)
}

function formatBigCategoryTree(data: BigCategoryTreeEntity[]) {
  return data.map((item: any) => {
    if (item.children && item.children.length > 0) {
      item.checkable = false
      item.children = formatBigCategoryTree(item.children)
    }
    return item
  })
}

function onSubmit() {
  formRef.value.validateFields().then(async () => {
    submitLoading.value = true
    await saveDashboardSelect(formState.value.bigCategoryIds.map((item, index) => ({
      bigCategoryId: item.value,
      dashboardOrderNum: dashboardOrderNum.value + (index + 1),
    }))).finally(() => {
      submitLoading.value = false
    })

    props.onConfirm(null)
    onCancel()
  })
}

// 关闭弹窗
function onCancel() {
  open.value = false
}
</script>
