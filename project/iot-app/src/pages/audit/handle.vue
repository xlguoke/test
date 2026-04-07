<template>
  <div pos-relative py-12 px16 pb-56>
    <div mb-12 flex-x>
      <i stripe></i>详情
    </div>
    <div v-if="dataSource" mb-24 card>
      <div class="mb-12 title">
        {{ dataSource.processName }}
      </div>
      <div>
        <div class="mb-12">
          <span label>发起时间：</span>
          <span>{{ dayjs(dataSource.processStartTime).format("YYYY-MM-DD HH:mm:ss") }}</span>
        </div>
        <div class="mb-12">
          <span label>发起人：</span>
          <span>{{ dataSource.processStartUserName }}</span>
        </div>
        <div class="mb-12">
          <span label>流程类型：</span>
          <span v-if="Number(dataSource.processTypeId) === AuditTypeEnum.温湿度巡查台账审批">温湿度巡查台账审核流程</span>
          <span v-if="Number(dataSource.processTypeId) === AuditTypeEnum.温湿度巡查异常处理">温湿度异常处置流程</span>
        </div>
        <div v-for="(pVal, pKey) in JSON.parse(dataSource.processSummary)" :key="pKey" class="mb-12 flex" mb-12>
          <span label>{{ pKey }}：</span>
          <span class="flex-1 break-all">{{ pVal }}</span>
        </div>
        <div v-if="Number(dataSource.processTypeId) === AuditTypeEnum.温湿度巡查异常处理" class="mb-12">
          <span label>异常记录：</span>
          <span
            class="text-#0066EC"
            @click="router.push({
              path: '/ledger-proc/detail',
              query: { id: dataSource.businessKey },
            })"
          >点击查阅</span>
        </div>
        <div v-if="Number(dataSource.processTypeId) === AuditTypeEnum.温湿度巡查台账审批" class="mb-12">
          <span label>台账内容：</span>
          <span
            class="unde text-#0066EC"
            @click="router.push({
              path: '/account-book/detail',
              query: { id: dataSource.businessKey },
            })"
          >点击查阅</span>
        </div>
      </div>
    </div>
    <div mb-12 flex-x>
      <i stripe></i>审批
    </div>

    <van-cell-group inset>
      <template v-for="item in formProperties">
        <van-field
          v-if="item.type && item.type.name === 'long'"
          :key="`long-${item.id}`"
          v-model="item.value"
          :label="item.name"
          placeholder="请输入"
          type="number"
          :disabled="!item.writable"
        />

        <van-field
          v-else-if="item.type && item.type.name === 'date'"
          :key="`date-${item.id}`"
          v-model="item.value"
          :label="item.name"
          :disabled="!item.writable"
          readonly
          placeholder="请选择"
          @click="onSelectDate(item.id)"
        />

        <van-field
          v-else-if="item.type && item.type.name === 'boolean'"
          :key="`boolean-${item.id}`"
          :label="item.name"
          :disabled="!item.writable"
        >
          <template #input>
            <van-radio-group v-model="item.value" direction="horizontal" shape="dot">
              <van-radio name="1">
                是
              </van-radio>
              <van-radio name="0">
                否
              </van-radio>
            </van-radio-group>
          </template>
        </van-field>

        <van-field
          v-else
          :key="item.id"
          v-model="item.value"
          :label="item.name"
          placeholder="请输入"
          :disabled="!item.writable"
        />
      </template>
      <van-field
        v-model="comment"
        rows="2"
        autosize
        type="textarea"
        label="审批意见"
        placeholder="请输入"
      />
      <van-field
        v-model="remark"
        rows="2"
        autosize
        type="textarea"
        label="备注"
        placeholder="请输入"
      />
    </van-cell-group>

    <div class="fixed-box grid grid-cols-2 gap-12">
      <van-button size="small" w-full @click="onAuditRefuse">
        不通过
      </van-button>
      <van-button type="primary" size="small" w-full @click="onAuditPass">
        通过
      </van-button>
    </div>

    <!-- 时间选择器 -->
    <van-calendar
      v-model:show="selectDateVisible"
      title="选择时间"
      :show-mark="false"
      :min-date="new Date('1998-01-01')"
      :default-date="currentDate"
      @confirm="getSelectDate"
    />
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import { auditPass, auditRefuse, getAuditDetail } from '.'
import { AuditTypeEnum } from '@/api/common'

const route = useRoute()

const router = useRouter()

const taskId = route.query.id as string

const dataSource = ref()

const comment = ref('')

const remark = ref('')

const selectDateVisible = ref(false)

const currentDate = ref()

const selectDateId = ref('')

const formProperties = computed(() => {
  if (dataSource.value) {
    return dataSource.value.formProperties
  }
  else {
    return []
  }
})

init()

function init() {
  showLoadingToast({
    duration: 0,
    forbidClick: true,
  })
  getAuditDetail(taskId).then((res) => {
    dataSource.value = res.data
  }).finally(closeToast)
}

function onSelectDate(id: string) {
  selectDateId.value = id
  const item = formProperties.value.find(i => i.id === id)
  if (item) {
    currentDate.value = new Date(item.value)
  }
  else {
    currentDate.value = new Date()
  }

  selectDateVisible.value = true
}

function getSelectDate(value) {
  const item = formProperties.value.find(i => i.id === selectDateId.value)
  if (item) {
    currentDate.value = new Date(item.value)
  }
  item.value = dayjs(value).format('YYYY-MM-DD')
  selectDateVisible.value = false
}

async function onAuditPass() {
  showLoadingToast({
    duration: 0,
    forbidClick: true,
  })
  await auditPass({
    'taskId': taskId,
    'formPropertyJson': JSON.stringify(getFormPropertyJson()),
    'auditRecord.comment': comment.value,
    'auditRecord.remark': remark.value,
  }).finally(closeToast)

  showSuccessToast('操作成功！')
  router.back()
}

async function onAuditRefuse() {
  showLoadingToast({
    duration: 0,
    forbidClick: true,
  })
  await auditRefuse({
    'taskId': taskId,
    'formPropertyJson': JSON.stringify(getFormPropertyJson()),
    'auditRecord.comment': comment.value,
    'auditRecord.remark': remark.value,
  }).finally(closeToast)

  showSuccessToast('操作成功！')
  router.back()
}

function getFormPropertyJson() {
  const obj = {}

  formProperties.value.forEach((item) => {
    obj[item.id] = item.value || ''
  })

  return obj
}
</script>

<route lang="json">
  {
    "name": "audit-handle",
    "meta": {
      "title": "审核",
      "keepAlive": true
    }
  }
</route>
