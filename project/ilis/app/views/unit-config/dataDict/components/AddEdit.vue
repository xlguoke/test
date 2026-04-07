<template>
  <HtModal
    v-model:open="visible"
    :title="param.record?.id ? '编辑' : '新增'"
    width="500px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <IlisForm
      ref="ilisFormRef"
      :cols="1"
      :entity="DictDetailEntity"
      :init-data="initData"
    >
      <template #form-before>
        <a-form-item label="字典分类">
          {{ param.dict.typegroupname }}
        </a-form-item>
      </template>
      <template #industryIds="{ data }">
        <IlisInput
          v-model="data.industryIds"
          :entity="DictDetailEntity"
          class="w-full"
          field="industryIds"
          :form-data="data"
          :options="industryDict"
          @change="v => {
            data.industryIds = v
          }"
        />
      </template>
    </IlisForm>
  </HtModal>
</template>

<script lang="ts" setup>
import type { SaveDict } from '../api.ts'
import type { DictListEntity } from '../DataDictEntity.ts'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { message } from 'ant-design-vue'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { useIndustryStore } from '~/store/industryStore'
import { editDictDataApi } from '../api.ts'

import { DictDetailEntity } from '../DataDictEntity.ts'

const props = defineProps<IDialogPropsParam<null, { record?: DictDetailEntity, dict: DictListEntity }>>()

const { industryList } = toRefs(useIndustryStore())

const industryDict = computed(() => industryList.value.map(d => ({
  label: d.name,
  value: d.id,
})))

const loading = ref(false)

const visible = ref(true)

const initData = ref(DictDetailEntity.fromJSON({}))

const ilisFormRef = ref<IlisFormExpose<DictDetailEntity>>()

// 编辑数据时，格式化数据：领域范围变更，无法回显
function formatInitData() {
  const row = props.param.record
  if (!row)
    return

  if (row.industryIds?.length) {
    const ids: string[] = []
    industryList.value.forEach((d) => {
      if (row.industryIds && row.industryIds.includes(d.id))
        ids.push(d.id)
    })
    initData.value.industryIds = ids
  }
  initData.value.typename = row.typename
  initData.value.typecode = row.typecode
  initData.value.orderNumber = row.orderNumber
}

watch(() => industryList.value, (list) => {
  if (list.length)
    formatInitData()
}, {
  immediate: true,
})

async function handleOk() {
  const formData = await ilisFormRef.value?.getFormData()
  loading.value = true
  if (!formData)
    return

  const param: SaveDict = {
    id: props.param.record?.id,
    typeGroupId: props.param.dict.id,
    typename: formData.typename || '',
    typecode: formData.typecode || '',
    orderNumber: formData.orderNumber || 0,
    industryDicts: formData.industryIds?.map(d => ({
      industryId: d,
    })) || [],
  }
  await editDictDataApi(param).finally(() => {
    loading.value = false
  })
  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}
</script>
