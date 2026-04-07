<template>
  <div>
    <!-- 筛选 -->
    <van-popup
      v-model:show="showFilter"
      round
      closeable
      position="bottom"
      h250
    >
      <div pos-relative h-full>
        <div p16 text-center split-boder text-white>
          筛选
        </div>
        <div pt16>
          <van-field
            v-if="isNeedAuth === IsNeedAuth.YES"
            v-model="laboratory"
            readonly
            name="picker"
            label="试验室："
            placeholder="请选择"
            clearable
            is-link
            @click="showFieldPicker = true"
          />
          <van-field
            readonly
            name="picker"
            label="控制时间："
            placeholder="请选择"
            label-align="left"
          >
            <template #input>
              <div class="flex gap-8 items-center w-full">
                <input
                  class="date-input flex-1 w25"
                  type="text"
                  :value="dateStr"
                  readonly
                  placeholder="开始时间"
                  @click="showCalendarPicker = true"
                />
                <span text-white>-</span>
                <input
                  class="date-input flex-1 w25"
                  type="text"
                  :value="dateEndStr"
                  readonly
                  placeholder="结束时间"
                  @click="showCalendarEndPicker = true"
                />
              </div>
            </template>
          </van-field>
        </div>
        <div class="fixed-box-pop grid grid-cols-2 gap-12 ">
          <van-button size="small" @click="reset">
            重置
          </van-button>
          <van-button size="small" type="primary" @click="submit">
            确认
          </van-button>
        </div>
      </div>
    </van-popup>
    <!-- 时间选择器 -->
    <van-calendar
      v-model:show="showCalendarPicker"
      title="选择时间"
      :show-mark="false"
      :min-date="new Date('1998-01-01')"
      @confirm="onConfirm"
    />
    <van-calendar
      v-model:show="showCalendarEndPicker"
      title="选择时间"
      :show-mark="false"
      :min-date="new Date('1998-01-01')"
      @confirm="onConfirmEnd"
    />
    <!-- 试验室选择器 -->
    <van-popup v-model:show="showFieldPicker" position="bottom" round>
      <van-picker
        v-model="selectedLaboratory"
        :columns="columns"

        @confirm="onConfirmField"
        @cancel="showFieldPicker = false"
      />
    </van-popup>
  </div>
</template>

<script lang="ts" setup>
import { getLaboratory } from '@/api'
import { usePermissionStore } from '@/stores'
import { IsNeedAuth } from '@/stores/modules/permissionStore'

const props = defineProps({
  query: Object,
})

const emit = defineEmits(['confirm'])

const { isNeedAuth } = usePermissionStore()

const showFilter = ref(false)

const showCalendarPicker = ref(false)
const showCalendarEndPicker = ref(false)

// 试验室选择器
const laboratory = ref('')
const selectedLaboratory = ref([props.query?.['laboratory.id']])
const showFieldPicker = ref(false)
const columns = ref([])
async function getLaboratoryList() {
  if (isNeedAuth === IsNeedAuth.NO) {
    return
  }
  const { data } = await getLaboratory({ page: 1, size: 999 })
  columns.value = data?.rows.map((item) => {
    return {
      text: item.name,
      value: item.id,
    }
  })
  laboratory.value = data?.rows?.find(item => item.id === props.query?.['laboratory.id'])?.name || ''
}
getLaboratoryList()
function onConfirmField({ selectedOptions }) {
  laboratory.value = selectedOptions[0]?.text
  showFieldPicker.value = false
}

// 时间选择器
const dateStr = ref('')
const dateEndStr = ref('')
const resStartDate = ref('')
const resEndDate = ref('')

function onConfirm(start: any) {
  resStartDate.value = useDateFormat(start, 'YYYY-MM-DD').value
  dateStr.value = `${useDateFormat(start, 'YYYY-MM-DD').value}`
  showCalendarPicker.value = false
}

function onConfirmEnd(end: any) {
  resEndDate.value = useDateFormat(end, 'YYYY-MM-DD').value
  dateEndStr.value = `${useDateFormat(end, 'YYYY-MM-DD').value}`
  showCalendarEndPicker.value = false
}

function submit() {
  emit('confirm', {
    'laboratory.id': selectedLaboratory.value?.[0],
    'resStartDate': resStartDate.value ? `${resStartDate.value} 00:00:00` : undefined,
    'resEndDate': resEndDate.value ? `${resEndDate.value} 23:59:59` : undefined,
  })
  showFilter.value = false
}

function reset() {
  laboratory.value = ''
  selectedLaboratory.value = []
  dateStr.value = ''
  dateEndStr.value = ''
  resStartDate.value = ''
  resEndDate.value = ''
  submit()
}

defineExpose({
  showFilter,
})
</script>

<style scoped>
input::placeholder {
  color: #fff !important;
}
:deep(.van-field) {
  flex-wrap: nowrap;
}
</style>
