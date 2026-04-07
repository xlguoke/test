<script setup lang="ts">
import { computed, watch } from 'vue'
import BaseModal from '../../components/BaseModal.vue'
import { dfColumns, useDataAcquisition } from './modules/useDataAcquisition'
import DataTable from './components/DataTable.vue'
import { udrCore } from '@/views/udr/provider/UdrCore'
import { useUdrStore } from '@/views/udr/provider/useUdrStore'
import { request } from '@/axios'
import SelectedDatePicker from '@/components/SelectedDatePicker.vue'
import { formatDate } from '@/utils'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:show'])

const { getTestTaskId } = useUdrStore()

const show = computed({
  get() {
    return props.show
  },
  set(val) {
    emits('update:show', val)
  },
})

watch(show, (val) => {
  if (val) {
    initJCshijian()
    getTestTypeData()
  }
})

const {
  columns,
  selColumns,
  typeDatas,
  datas,
  selectedDatas,
  search,
  pages,
  totalPage,
  active,
  showPicker,
  selDateVal,
  customProperties,
  initPageData,
  initSelColumns,
  flatJsonData,
  formatSearch,
  selStartDate,
  changeDatePicker,
  saveData,
} = useDataAcquisition()

function initJCshijian() {
  // 采集日期默认显示当天
  const now = formatDate(new Date(), 0)
  search.value.jcshijianStart = now
  search.value.jcshijianEnd = now
}

function closeModal() {
  emits('update:show', false)
}

// 切换采集项目
async function changeTab() {
  columns.value = []
  datas.value = []
  await getCustomFields()
  await getColumns()
  resetSearch(true)
}

// 获取任务可用的采集项目
async function getTestTypeData() {
  const taskId = getTestTaskId()

  if (!taskId)
    return

  showLoadingToast({ duration: 0, forbidClick: true })
  try {
    const res: any = await request(`/ilis2/api/dataGather/getTestType?taskId=${taskId}`)

    if (!res.obj || res.obj === 0)
      throw new Error('当前任务未配置采集项目，请联系客服处理后再操作！')
    active.value = res.obj[0]?.testTypeCode
    typeDatas.value = res.obj
    await initPageData()
    await getCustomFields()
    await getColumns()
    await getData()
  }
  catch (err: any) {
    showDialog({ message: err.message || '获取采集项目失败' })
  }
  closeToast()
}

// 获取列
async function getColumns() {
  try {
    const res: any = await request(
      `/ilis2/api/testField/select-fields?testCode=${active.value}`,
    )
    if (res && res.length) {
      columns.value = res
    }
    else {
      if (['13', '14', '15', '16', '20', '21'].includes(active.value)) {
        columns.value = [
          ...dfColumns,
          {
            displayName: '牌号',
            filedCode: '',
          },
          {
            displayName: '公称直径',
            filedCode: '',
          },
        ]
      }
      else {
        columns.value = [
          ...dfColumns,
          {
            displayName: '龄期',
            filedCode: 'lqi',
          },
        ]
      }
    }
    initSelColumns()
  }
  catch (err: any) {
    closeToast()
    showDialog({ message: err.message || '获取列失败' })
  }
}

// 获取采集数据
async function getData() {
  const taskId = getTestTaskId()
  const params: any = formatSearch()

  const str = new URLSearchParams({ ...params, testTaskId: taskId })
  try {
    showLoadingToast({ duration: 0, forbidClick: true })
    const res: any = await request(`/ilis2/api/dataGather/dataGrid?${str}`)
    const list = flatJsonData(res.obj.rows)
    const selIds = selectedDatas.value.map((d: any) => d.id)
    datas.value = list.filter(d => !selIds.includes(d.id))
    totalPage.value = Math.ceil(res.obj.total / pages.value.size)
    closeToast()
  }
  catch (err: any) {
    closeToast()
    showDialog({ message: err.message || '获取采集项目失败' })
  }
}

// 获取自定义属性：已选数据中添加自定义属性列，支持编辑
async function getCustomFields() {
  if (customProperties[active.value])
    return
  const item = typeDatas.value.find(d => d.testTypeCode === active.value)
  if (!item)
    return
  try {
    const res: any = await request(
      `/ilis2/api/common/custom-properties?customizeType=${item.testTypeId}`,
    )
    customProperties[item.testTypeCode] = res.data || []
  }
  catch (err: any) {
    console.error(`获取${item.testType}自定义属性失败：`, err)
  }
}

// 搜索
function onSearch() {
  pages.value.page = 1
  getData()
}

/**
 * 重置
 * @param {boolean} flag 是否默认检测日期为当前日期
 */
function resetSearch(flag?: boolean) {
  search.value = {
    yangpbh: '',
    sbbianhao: '',
    sbmingcheng: '',
    jcshijianStart: '',
    jcshijianEnd: '',
  }
  pages.value.page = 1
  if (flag)
    initJCshijian()
  getData()
}

// 采集
async function onAcquisition() {
  const taskId = getTestTaskId()
  const { listData, columnList } = saveData()

  try {
    showLoadingToast({ duration: 0, forbidClick: true })
    // 保存自定义属性
    await request('/ilis2/api/dataGather/custom-values', {
      method: 'post',
      data: columnList,
    })
    // 保存采集用途
    await request('/ilis2/api/dataGather/reportDate.do', {
      method: 'post',
      data: {
        listData,
        taskId,
      },
    })

    // 保存成功，执行启动脚本回调方法
    // udrCore.$udr.invokeUdrScript('$global.web_saveDataAcquisitionCallback()')
    udrCore.$udr.invokeUdrScript('MacData_FromRs_Java()')
    closeModal()
    closeToast()
  }
  catch (err: any) {
    showToast({
      type: 'fail',
      message: err.message || '保存失败',
    })
  }
}

// 添加到已选数据
function onAdd(ind: number) {
  const item = datas.value[ind]
  selectedDatas.value.push(item)
  datas.value.splice(ind, 1)
}
// 删除
function onRemove(ind: number) {
  showConfirmDialog({
    title: '删除',
    message: '确定删除吗？',
  }).then(() => {
    const item = selectedDatas.value[ind]
    datas.value.push(item)
    selectedDatas.value.splice(ind, 1)
  }).catch(() => {})
}
// 上移
function onMoveUp(ind: number) {
  const item = selectedDatas.value[ind]
  selectedDatas.value.splice(ind, 1)
  selectedDatas.value.splice(ind - 1, 0, item)
}
// 下移
function onMoveDown(ind: number) {
  const item = selectedDatas.value[ind]
  selectedDatas.value.splice(ind, 1)
  selectedDatas.value.splice(ind + 1, 0, item)
}

function onClose() {
  show.value = false
}
</script>

<template>
  <BaseModal v-model:show="show" title="数据采集" @close="onClose">
    <div class="data-acquisition">
      <div class="tab-wrap">
        <van-tabs v-model:active="active" @change="changeTab">
          <template v-for="item in typeDatas" :key="item.testTypeCode">
            <van-tab :name="item.testTypeCode" :title="item.testType" />
          </template>
        </van-tabs>
      </div>
      <div class="content">
        <div class="custom-card" style="padding-bottom: 1rem">
          <div style="margin: 0 -2rem">
            <van-field
              v-model="search.yangpbh"
              clearable
              label="样品编号"
              placeholder="请输入样品编号"
              @keypress.enter="onSearch"
            />
            <van-field
              v-model="search.sbbianhao"
              clearable
              label="设备编号"
              placeholder="请输入设备编号"
              @keypress.enter="onSearch"
            />
            <van-field
              v-model="search.sbmingcheng"
              clearable
              label="设备名称"
              placeholder="请输入设备名称"
              @keypress.enter="onSearch"
            />
            <van-field
              label="检测日期"
              style="padding: 0 16px; line-height: 44px"
            >
              <template #input>
                <div style="display: flex; align-items: center; width: 100%">
                  <van-field
                    v-model="search.jcshijianStart"
                    readonly
                    placeholder="请选择开始日期"
                    class="field-input"
                    @click="selStartDate('jcshijianStart')"
                  >
                    <template #right-icon>
                      <van-icon
                        v-if="!!search.jcshijianStart"
                        name="clear"
                        color="#ccc"
                        @click.stop="search.jcshijianStart = ''"
                      />
                    </template>
                  </van-field>
                  <span style="margin: 0 2rem">~</span>
                  <van-field
                    v-model="search.jcshijianEnd"
                    readonly
                    placeholder="请选择结束日期"
                    class="field-input"
                    @click="selStartDate('jcshijianEnd')"
                  >
                    <template #right-icon>
                      <van-icon
                        v-if="!!search.jcshijianEnd"
                        name="clear"
                        color="#ccc"
                        @click.stop="search.jcshijianEnd = ''"
                      />
                    </template>
                  </van-field>
                </div>
              </template>
            </van-field>
          </div>

          <div class="button-group">
            <van-button type="primary" @click="onSearch">
              查询
            </van-button>
            <van-button @click="resetSearch(false)">
              重置
            </van-button>
            <van-button @click="onAcquisition">
              采集
            </van-button>
          </div>
        </div>

        <!-- 采集数据 -->
        <div class="custom-card">
          <DataTable :columns="columns" :datas="datas">
            <template #handle="{ index }">
              <span class="handle-btn" @click="onAdd(index)">采集</span>
            </template>
          </DataTable>
          <div style="display: flex; justify-content: flex-end">
            <van-pagination
              v-if="datas.length"
              v-model="pages.page"
              :page-count="totalPage"
              mode="simple"
              style="width: 50%; max-width: 320px; min-width: 160px"
              @change="getData"
            />
          </div>
        </div>

        <!-- 已选数据 -->
        <div class="custom-card">
          <h4 class="page-title-min">
            已选数据
          </h4>
          <DataTable :columns="selColumns" :datas="selectedDatas">
            <template #handle="{ index }">
              <span v-if="index > 0" class="handle-btn" @click="onMoveUp(index)">
                上移
              </span>
              <span
                v-if="index < selectedDatas.length - 1"
                class="handle-btn"
                @click="onMoveDown(index)"
              >
                下移
              </span>
              <span class="handle-btn danger" @click="onRemove(index)">删除</span>
            </template>
          </DataTable>
        </div>
      </div>
      <SelectedDatePicker
        v-model:show="showPicker"
        :default-value="selDateVal"
        @change="changeDatePicker"
      />
    </div>
  </BaseModal>
</template>

<style lang="less" scoped>
@import './app.less';
</style>
