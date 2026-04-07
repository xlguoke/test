<template>
  <ht-modal
    v-model:open="internalOpen"
    width="50%"
    title="配置列表"
    :after-close="onClosed"
    :confirm-loading="loading"
    @ok="handleConfirm"
  >
    <a-form
      ref="formRef"
      class="table-form"
      :model="dataSource"
      :rules="rules"
    >
      <div class="flex flex-col gap-3 w-full ">
        <div class="flex gap-3 w-full">
          <IlisTable
            class="flex-1 w-0"
            row-key="id"
            table-height="55vh"
            :loading="loading"
            :entity="CheckConfirmImportConfigEntity"
            :data-source="dataSource"
            :custom-row="getCustomRow()"
          >
            <template #headerCell="{ column, title }">
              <template v-if="['name'].includes(column.dataIndex as string)">
                <span class="required-title">{{ title }}</span>
              </template>
            </template>
            <template #bodyCell="{ record, column, index }">
              <template v-if="column.dataIndex === 'name'">
                <a-form-item :name="[index, column.dataIndex]">
                  <IlisInput
                    v-model="record.name"
                    field="name"
                    :entity="CheckConfirmImportConfigEntity"
                  ></IlisInput>
                </a-form-item>
              </template>
            </template>
          </IlisTable>
        </div>
      </div>
    </a-form>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IDialogProps } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { AnyValidatorHelper } from '~/anyThing/helper/AnyValidatorHelper'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getCheckConfirmImportConfigList, saveCheckConfirmImportConfigList } from '../api'
import { CheckConfirmImportConfigEntity } from '../CheckConfirmImportConfigEntity'

defineProps<IDialogProps<null>>()

const formRef = ref()

const internalOpen = ref(true)

const {
  loading,
  dataSource,
  getCustomRow,
} = useTableHooks<CheckConfirmImportConfigEntity>({
  api: getCheckConfirmImportConfigList,
  isPagination: false,
  responseDataTransform: (data) => {
    return {
      rows: data.map((i: any, index: number) => {
        return { ...i, id: index }
      }),
    }
  },
})

const rules = computed(() => {
  const rule = {} as Record<string, any>
  dataSource.value.forEach((_item, index) => {
    rule[index] = AnyValidatorHelper.getValidateRules(CheckConfirmImportConfigEntity)
  })
  return rule
})

/**
 * # 确认
 */
async function handleConfirm() {
  await formRef.value?.validate()
  loading.value = true
  await saveCheckConfirmImportConfigList(dataSource.value).finally(() => {
    loading.value = false
  })
  message.success('操作成功')
  internalOpen.value = false
}
</script>

<style lang="less" scoped>
:deep( .ant-form-item){
    margin-bottom: unset !important;
  }
.required-title{
  &::before{
    content: '*';
    color: red;
    display: inline-block;
    line-height: 1;
    margin-inline-end:4px;
  }
}
</style>
