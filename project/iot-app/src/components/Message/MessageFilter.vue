<template>
  <div>
    <!-- 筛选 -->
    <van-popup
      v-model:show="showFilter"
      round
      closeable
      position="bottom"
      h260
    >
      <div pos-relative h-full>
        <div p16 text-center split-boder text-white>
          筛选
        </div>
        <div pt16>
          <van-field
            label="状态："
            readonly
          >
            <template #input>
              <van-radio-group v-model="beenRead" direction="horizontal" shape="dot">
                <van-radio
                  v-for="item in ReadStatusDict"
                  :key="item.name"
                  :name="item.value"
                >
                  {{ item.name }}
                </van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field
            label="发送时间："
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
  </div>
</template>

<script lang="ts" setup>
import { ReadStatusDict } from '@/pages/message'

const emit = defineEmits(['confirm'])

const showFilter = ref(false)

const showCalendarPicker = ref(false)

const showCalendarEndPicker = ref(false)

const beenRead = ref()

// 时间选择器
const dateStr = ref('')
const dateEndStr = ref('')
const msgDateStart = ref('')
const msgDateEnd = ref('')

function onConfirm(start) {
  msgDateStart.value = useDateFormat(start, 'YYYY-MM-DD').value
  dateStr.value = `${useDateFormat(start, 'YYYY-MM-DD').value}`
  showCalendarPicker.value = false
}

function onConfirmEnd(end) {
  msgDateEnd.value = useDateFormat(end, 'YYYY-MM-DD').value
  dateEndStr.value = `${useDateFormat(end, 'YYYY-MM-DD').value}`
  showCalendarEndPicker.value = false
}

function submit() {
  emit('confirm', {
    msgDateStart: msgDateStart.value ? `${msgDateStart.value} 00:00:00` : undefined,
    msgDateEnd: msgDateEnd.value ? `${msgDateEnd.value} 23:59:59` : undefined,
    beenRead: beenRead.value,
  })
  showFilter.value = false
}

function reset() {
  dateStr.value = ''
  dateEndStr.value = ''
  msgDateStart.value = ''
  msgDateEnd.value = ''
  beenRead.value = undefined
  submit()
}

defineExpose({
  showFilter,
})
</script>
