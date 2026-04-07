<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { z } from 'zod'
import useSelData from '../../../composables/useSelData'
import { request } from '@/axios'
import SelDataList from '@/components/selDataList/index.vue'
import type { SelDataItemDTO } from '@/type/common'
import { taskParamEquipmentRes } from '@/type/equipment-use-register'
import type { LaboratoryEntity } from '@/type/laboratory'
import { LaboratoryRes } from '@/type/laboratory'
import type { DepartmentEntity } from '@/type/department'
import { Department } from '@/type/department'

const props = defineProps({
  testObjectParamId: {
    type: String,
    default: '',
  },
})
const emits = defineEmits(['select'])

const query = ref({
  params: '',
  lab: '',
  depart: '',
  page: 1,
  limit: 30,
  paramId: props.testObjectParamId,
  searchAll: true,
  isSameProjectOutEquipment: false,
})

const labOptions = ref<LaboratoryEntity[]>([])

const departOptions = ref<DepartmentEntity[]>([])

const showLabVisible = ref(false)

const showDepartVisible = ref(false)

const labName = ref('')

const departName = ref('')

watch(() => props.testObjectParamId, (newVal) => {
  query.value.paramId = newVal
})

const {
  visible,
  selType,
  dataList,
  selectedRows,
  showModal,
  onCancel,
  getDatas,
} = useSelData({
  api: eqipmentListApi,
  query,
  resKey: 'data',
  totalKey: 'count',
})

onMounted(() => {
  selType.value = 'checkbox'
  getLabOptions()
  getDepartOptions()
})

/** 数据api */
async function eqipmentListApi(params: Record<string, any>) {
  try {
    return await request({
      url: '/ilis2/equipmentController.do?getPagingEquipments',
      method: 'get',
      params,
      schema: taskParamEquipmentRes,
    })
  }
  catch (err) {
    return []
  }
}

/** 分页查询 */
function loadData() {
  query.value.page += 1
  getDatas()
}

/** 搜索 */
function onSearch() {
  query.value.page = 1
  dataList.value = []
  getDatas()
}

/** 确认选择 */
function confirmSelected(rows: SelDataItemDTO[]) {
  emits('select', rows)
  onCancel()
}

async function getLabOptions() {
  const res = await request({
    url: '/ilis2/laboratoryController?dataGridPage',
    data: {
      page: 1,
      size: 999,
    },
    schema: LaboratoryRes,
  })

  labOptions.value = res.obj.rows
}

async function getDepartOptions() {
  const res = await request({
    url: '/ilis2/orgController.do?getOrgComboTree',
    data: {
      page: 1,
      size: 999,
    },
    schema: z.array(Department),
  })

  res.shift()
  transformDepartTree(res)
  departOptions.value = res
}

function transformDepartTree(data: DepartmentEntity[]) {
  data.forEach((item) => {
    item.value = item.id
    if (item.children && item.children.length) {
      transformDepartTree(item.children)
      item.children.unshift({
        id: `${item.id}-all`,
        value: `${item.id}-all`,
        text: item.text,
      })
    }
    else {
      delete item.children
    }
  })
}

function onSelectLab(row: LaboratoryEntity) {
  query.value.lab = row.id
  labName.value = row.name
  onSearch()
  showLabVisible.value = false
}

function onSelectDepart({ selectedOptions }: { selectedOptions: DepartmentEntity[], value: string }) {
  const item = selectedOptions[selectedOptions.length - 1]
  const parentItem = selectedOptions[selectedOptions.length - 2]

  if (item.id.includes('-all')) {
    query.value.depart = parentItem.id
    departName.value = parentItem.text
  }
  else {
    query.value.depart = item.id
    departName.value = item.text
  }

  onSearch()
  showDepartVisible.value = false
}

defineExpose({
  showModal,
})
</script>

<template>
  <van-popup v-model:show="visible" position="right" class="right-popup-wrap">
    <div class="popup-title">
      请选择设备
    </div>
    <SelDataList
      :type="selType"
      :selected-rows="selectedRows"
      :data-list="dataList"
      style="flex: 1;height: 0;"
      :cancel="onCancel"
      @confirm="confirmSelected"
      @load="loadData"
    >
      <template #search>
        <div class="search-bar">
          <div class="f-input">
            <input
              v-model="query.params"
              type="text"
              placeholder="请输入设备名称、设备编号查询"
              @keydown.enter="onSearch()"
            />
            <van-icon
              v-show="query.params"
              name="clear"
              @click.stop="() => {
                query.params = '';
                onSearch();
              }"
            />
          </div>
          <div class="f-input" @click="showDepartVisible = true">
            <div class="f-input-value" :style="{ color: departName ? '' : '#757575' }">
              {{ departName || '选择部门' }}
            </div>
            <van-icon
              v-show="departName"
              name="clear"
              @click.stop="() => {
                query.depart = '';
                departName = '';
                onSearch();
              }"
            />
          </div>
          <div class="f-input" @click="showLabVisible = true">
            <div class="f-input-value" :style="{ color: labName ? '' : '#757575' }">
              {{ labName || '选择功能室' }}
            </div>
            <van-icon
              v-show="labName"
              name="clear"
              @click.stop="() => {
                query.lab = '';
                labName = '';
                onSearch();
              }"
            />
          </div>
        </div>
      </template>
      <template #dataItem="{ item }">
        <div class="data-item">
          <div>
            {{ item.name }}
            <template v-if="item.equipmentSn">
              {{ `（${item.equipmentSn}）` }}
            </template>
          </div>
          <div>
            <label>所属部门：</label>
            <span>{{ item.departName }}</span>
          </div>
          <div>
            <label>所属功能室：</label>
            <span>{{ item.laboratoryName }}</span>
          </div>
        </div>
      </template>
    </SelDataList>
  </van-popup>

  <!-- 选择功能室 -->
  <van-action-sheet
    v-model:show="showLabVisible"
    :actions="labOptions"
    :round="false"
    cancel-text="取消"
    @select="onSelectLab"
  />

  <van-popup
    v-model:show="showDepartVisible"
    :round="false"
    destroy-on-close
    close-on-popstate
    position="bottom"
  >
    <van-cascader
      v-model="query.depart"
      title="请选择所在地区"
      :options="departOptions"
      @close="showDepartVisible = false"
      @finish="onSelectDepart"
    />
  </van-popup>
</template>

<style lang="less" scoped>
.right-popup-wrap{
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 70%;
  background-color: #f9f8f8;

  .popup-title{
    height: 45px;
    line-height: 45px;
    font-size: 18px;
    text-align: center;
    color:#fff;
    background: var(--van-primary-color);
  }
}

.data-item {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  color: #3D3D3D;

  label {
    color: #666666;
  }
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 1rem;

  .f-input,
  input {
    height: 3.2rem;
    border: solid 1px #e2e2e2;
    border-radius: 1px;
    flex: 1;
    padding: 0 8px;
    min-width: 0;
    font-size: 1.4rem;
  }

  input {
    border: 0;
    height: 3rem;
  }

  .f-input {
    display: flex;
    align-items: center;

    .f-input-value {
      flex: 1;
      min-width: 0;
      line-height: 2.8rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    i {
      font-size: 1.8rem;
      color: #999;
    }
  }
}
</style>
