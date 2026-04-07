<template>
  <div class=" h-full flex-y">
    <!-- <van-sticky> -->
    <VanNavBar
      v-if="InEmbed"
      title="试验预约"
      :fixed="true"
      clickable
      placeholder
      :left-arrow="true"
      @click-left="onBack"
    />
    <div v-else class="w-full px16 pt16">
      <div class="mt-16 text-18 font-bold ">
        海特智慧试验室温湿度控制系统
      </div>
      <p>
        今天又是美好的一天！
      </p>
    </div>
    <div class="w-full px16">
      <van-search
        v-show="!showCalendar"
        v-model="queryStr"
        class="flex-1 p-0"
        placeholder="请输入预约人员/样品名称/任务编号"
        @search="handleSearch"
      >
        <template #left-icon>
          <div flex-x items-center>
            <img src="@/assets/searchIcon.svg" w16 h16 alt="">
          </div>
        </template>
      </van-search>
      <div
        class="flex-x justify-end gap12"
        :class="{
          mt12: !showCalendar,
          mb12: showCalendar,
        }"
      >
        <van-button
          v-if="isNeedAuth === IsNeedAuth.YES && showCalendar"
          size="small"
          type="primary"
          plain
          btn
          @click="showFieldPicker = true"
        >
          <div flex-x items-center>
            <span>{{ laboratory || '功能室' }}</span>
            <van-icon
              v-if="laboratory "
              px4
              name="cross"
              @click.stop=" laboratory = ''; selectedLaboratory = []"
            />
          </div>
        </van-button>
        <van-button size="small" type="primary" plain btn @click="router.push('/appointment-management/add')">
          新增
        </van-button>
        <van-button size="small" type="primary" plain btn @click="showCalendar = !showCalendar">
          {{ showCalendar ? '列表视图' : '日历视图' }}
        </van-button>
        <van-button
          v-show="!showCalendar"
          type="primary"
          plain
          size="small"
          btn
          @click="filterRef.showFilter = true"
        >
          筛选
        </van-button>
      </div>
    </div>
    <!-- </van-sticky> -->
    <div class=" w-full flex-1 overflow-y-auto">
      <!-- 日历视图 -->
      <!-- <HashCalendar v-if="showCalendar" /> -->
      <FullCalendar v-if="showCalendar" :selected-laboratory="selectedLaboratory" />
      <!-- 列表视图 -->
      <div v-show="!showCalendar">
        <CustomList
          ref="listRef"
          p16
          :api="getHumitureResList"
          :query="query"
          total-key="total"
        >
          <template #default="{ data }">
            <PreTaskCard
              v-for="(item) in data"
              :key="item"
              mb12
              :data="item"
              @refresh="listRef.onRefresh"
            />
          </template>
        </CustomList>
      </div>
      <!-- 筛选弹窗 -->
      <PreTaskFilter
        ref="filterRef"
        :query="query"
        @confirm="handleSearch"
      ></PreTaskFilter>
    </div>
    <!-- 试验室选择器 -->
    <van-popup v-model:show="showFieldPicker" position="bottom" round>
      <van-picker
        :columns="columns"
        @confirm="onConfirmField"
        @cancel="showFieldPicker = false"
      />
    </van-popup>
  </div>
</template>

<script lang="ts" setup>
import { InEmbed } from '@/utils/referrer'
import { CreateType, getHumitureResList } from '../room'
import { getLaboratory } from '@/api'
import { usePermissionStore } from '@/stores'
import { IsNeedAuth } from '@/stores/modules/permissionStore'

// defineOptions({
//   // eslint-disable-next-line vue/component-definition-name-casing
//   name: 'appointment-management',
// })

const router = useRouter()

const showCalendar = ref(false)

const queryStr = ref('')

const filterRef = ref()

const listRef = ref()

const showFieldPicker = ref(false)

const selectedLaboratory = ref([])

const columns = ref([])

const laboratory = ref('')

const query = ref({
  type: CreateType.预约,
  quickQry: queryStr.value,
})

const { isNeedAuth } = usePermissionStore()
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
}
getLaboratoryList()

function onConfirmField({ selectedOptions }) {
  laboratory.value = selectedOptions[0]?.text
  selectedLaboratory.value = [selectedOptions[0]?.value]
  showFieldPicker.value = false
}

function handleSearch(obj?: Record<string, any>) {
  query.value.quickQry = queryStr.value
  if (obj) {
    query.value = {
      ...query.value,
      ...obj,
    }
  }
  nextTick(() => {
    listRef.value.onRefresh()
  })
}

function onBack() {
  if ((parent as any).back) {
    (parent as any).back()
    return
  }
  if (window.history.state.back)
    history.back()
  else
    router.replace('/')
}

onMounted(() => {
  nextTick(() => {
    showCalendar.value = true
  })
})
</script>

<style scoped>

</style>

<route lang="json">
  {
    "name": "appointment-management",
    "meta": {
      "title": "试验预约",
      "hiddenNavBar": true
    }
  }
</route>
