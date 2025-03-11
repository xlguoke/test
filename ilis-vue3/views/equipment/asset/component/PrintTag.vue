<template>
  <HtModal
    v-model:open="visible"
    title="资产标签打印"
    width="300px"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <BaseTitle>标签尺寸</BaseTitle>
    <a-radio-group
      v-model:value="formState.size"
      :options="sizeOptions"
      class="flex flex-col gap-3 mb-3 pl-3"
    />
    <div v-if="props.param.length > 1">
      <BaseTitle>打印选项</BaseTitle>
      <a-radio-group
        v-model:value="formState.type"
        :options="typeOptions"
        class="flex flex-col gap-3 mb-3 pl-3"
      />
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import type { EquipmentAssetEntity } from '../EquipmentAssetEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { getDictByCode } from '~/api/common'
import { BaseTitle } from '~/components/UI'
import type { IOption } from '~/interface/IOption'

const props = defineProps<IDialogPropsParam<null, EquipmentAssetEntity[]>>()

const visible = ref(true)

const typeOptions = ref([
  {
    label: '单页打印',
    value: 'signle',
  },
  {
    label: '合并打印',
    value: 'merge',
  },
])

const sizeOptions = ref([] as IOption[])

const formState = ref({
  type: 'signle',
  size: '',
})

async function getSizeDict() {
  const { data } = await getDictByCode('equipment_label_format')
  sizeOptions.value = data.map((i) => {
    return {
      label: `${i.typeName} ${i.typeCode}`,
      value: i.typeCode,
    }
  })
  formState.value.size = sizeOptions.value[0].value
}
getSizeDict()

async function handleOk() {
  const ids = props.param.map(i => i.id)
  switch (formState.value.type) {
    case 'signle':
      IlisPrintUdr.commonPrint(ids, 'AssetsParam', { printTimes: formState.value.size })
      break
    case 'merge':
      IlisPrintUdr.commonPrint([ids.join(',')], 'AssetsParam', { printTimes: formState.value.size })
      break
  }
  visible.value = false
  props.onConfirm(null)
}
</script>
