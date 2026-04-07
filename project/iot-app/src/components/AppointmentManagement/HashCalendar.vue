<template>
  <div px16>
    <vue-hash-calendar
      ref="calendarRef"
      show-arrow
      class="card"
      format="YY-MM-DD"
      :scroll-change-date="false"
      @change="onChange"
    >
      <template #action>
        <div class="w-full flex-x justify-center gap12 bg-white p12">
          <van-icon name="arrow-left" class="text-primary" @click="calendarRef.lastMonth()" />
          <div @click="calendarRef.today()">
            {{ date }}
          </div>
          <van-icon name="arrow" class="text-primary" @click="calendarRef.nextMonth()" />
        </div>
      </template>
      <template #week="scope">
        <div text-12>
          {{ `周${scope?.week}` }}
        </div>
      </template>
      <template #day="scope">
        <div class="text-12">
          {{ scope?.date?.day }}
        </div>
      </template>
      <template #arrow>
        <div class="w-full flex-x justify-center">
          <div class="h4 w24 translate-y-[-6px] rounded-2 bg-#A8B4C4">
          </div>
        </div>
      </template>
    </vue-hash-calendar>
  </div>
</template>

<script lang="ts" setup>
const calendarRef = ref()

const date = ref(new Date())

function onChange(val) {
  date.value = val
}
</script>
