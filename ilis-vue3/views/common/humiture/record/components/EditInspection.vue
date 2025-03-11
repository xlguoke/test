<template>
  <div>
    <a-modal
      v-model:open="open"
      title="修改"
      width="720px"
      :mask-closable="false"
      destroy-on-close
      :confirm-loading="submitLoading"
      centered
      @cancel="cancel"
    >
      <a-form
        :model="formState"
        class="mt-6"
        :label-col="{ span: 10 }"
        :wrapper-col="{ span: 14 }"
      >
        <a-row :gutter="16">
          <a-col span="12">
            <a-space class="mt-1">
              <div>功能室：</div>
              <div>{{ dataSource.laboratoryName }}</div>
            </a-space>
          </a-col>
          <a-col span="12">
            <a-space>
              <div>巡查时间：</div>
              <a-date-picker
                v-model:value="formState.recordDate"
                show-time
                placeholder="选择时间"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </a-space>
          </a-col>
        </a-row>
        <a-row :gutter="16" class="mt-4">
          <a-col span="12">
            <a-card>
              <p class="mb-2">
                温度
              </p>
              <a-form-item label="标准温度（℃）" class="mb-2">
                <span>{{ dataSource.minTem }} ~ {{ dataSource.maxTem }}</span>
              </a-form-item>
              <a-form-item label="巡查温度（℃）" class="mb-2">
                <a-input-number v-model:value="formState.tem" class="w-full" @change="onCheckTem" />
              </a-form-item>
              <a-form-item label="温度状态" class="mb-2">
                <span v-if="formState.tem >= dataSource.minTem && formState.tem <= dataSource.maxTem">正常</span>
                <span v-else class="text-red-500">超标</span>
              </a-form-item>
            </a-card>
          </a-col>
          <a-col span="12">
            <a-card>
              <p class="mb-2">
                湿度
              </p>
              <a-form-item label="标准湿度（%RH）" class="mb-2">
                <span>{{ dataSource.minHum }} ~ {{ dataSource.maxHum }}</span>
              </a-form-item>
              <a-form-item label="巡查湿度（%RH）" class="mb-2">
                <a-input-number v-model:value="formState.hum" class="w-full" @change="onCheckHum" />
              </a-form-item>
              <a-form-item label="湿度状态" class="mb-2">
                <span v-if="formState.hum >= dataSource.minHum && formState.hum <= dataSource.maxHum">正常</span>
                <span v-else class="text-red-500">超标</span>
              </a-form-item>
            </a-card>
          </a-col>
        </a-row>
      </a-form>

      <template #footer>
        <a-button @click="cancel">
          取消
        </a-button>
        <a-button type="primary" :loading="submitLoading" @click="onSubmit">
          确定
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { MStatus } from '../index.ts'
import { EditHumitureRecordEntity, editHumitureRecord } from '~/views/common/humiture/record/api/editHumitureRecord.ts'
import type { HumitureRecordDataItem } from '~/views/common/humiture/record/api/getHumitureRecordList.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  dataSource: {
    type: Object as PropType<HumitureRecordDataItem>,
    default: () => {},
  },
})

const emits = defineEmits(['update:open', 'onSave'])

const open = computed(() => props.open)

const dataSource = computed(() => props.dataSource)

const submitLoading = ref(false)

const formState = ref<EditHumitureRecordEntity>({})

watch(open, (val) => {
  if (!val) {
    cancel()
  }
  else {
    const editData = dataSource.value
    if (editData) {
      const formData = new EditHumitureRecordEntity()
      formData.hum = editData.hum
      formData.tem = editData.tem
      formData.humStatus = editData.humStatus
      formData.laboratoryId = editData.laboratoryId
      formData.type = editData.type
      formData.recordDate = editData.recordDate ? dayjs(editData.recordDate).format('YYYY-MM-DD HH:mm:ss') : undefined
      formData.temStatus = editData.temStatus

      formState.value = formData
    }
  }
})

async function onSubmit() {
  submitLoading.value = true
  await editHumitureRecord(dataSource.value.id, formState.value).finally(() => {
    submitLoading.value = false
  })

  message.success('保存成功')
  emits('onSave')
  cancel()
}

// 关闭弹窗
function cancel() {
  emits('update:open', false)
  formState.value = {}
}

function onCheckTem() {
  const { minTem, maxTem } = dataSource.value
  const { tem } = formState.value

  if (tem < minTem) {
    formState.value.temStatus = MStatus.过低
  }
  else if (tem > maxTem) {
    formState.value.temStatus = MStatus.超标
  }
  else {
    formState.value.temStatus = MStatus.正常
  }
}

function onCheckHum() {
  const { minHum, maxHum } = dataSource.value
  const { hum } = formState.value

  if (hum < minHum) {
    formState.value.humStatus = MStatus.过低
  }
  else if (hum > maxHum) {
    formState.value.humStatus = MStatus.超标
  }
  else {
    formState.value.humStatus = MStatus.正常
  }
}
</script>
