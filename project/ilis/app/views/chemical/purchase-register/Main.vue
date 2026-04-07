<template>
  <IlisContainer app-id="chemical_purchase_register">
    <div class="h-full flex flex-col gap-3">
      <!-- 搜索区域 -->
      <IlisFormSearch
        :entity="ChemicalPurchaseRegisterQueryEntity"
        @reset="handleReset"
        @search="handleSearch"
      />

      <!-- 操作按钮区域 -->
      <HtButtonGroup>
        <a-button v-permission="'purchase::register::add'" type="primary" @click="onAdd">
          新增采购登记
        </a-button>
        <a-button v-permission="'purchase::register::export'" @click="handleExport(`/rest/chemical/purchase/register/export/${CUSTOM_TYPE}`)">
          导出
        </a-button>
        <!-- 列筛选 -->
        <IlisCustomColumns
          :type="CUSTOM_TYPE"
          @confirm="handleReloadTable()"
        />
      </HtButtonGroup>

      <!-- 表格区域 -->
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          :loading="loading"
          :table-height="tableHeight"
          :data-source="dataSource"
          :entity="ChemicalPurchaseRegisterEntity"
          :custom-columns="customColumns"
          :pagination="getPagination()"
          show-index
          resizable
          @change="handleSortChange"
        >
          <template #bodyCell="{ record, column }">
            <template v-if="column.dataIndex === 'status'">
              <a-tag :color="purchaseApplyStatusDict.getColorByKey(record.status)">
                {{ purchaseApplyStatusDict.getLabelByKey(record.status) }}
              </a-tag>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button type="link" @click.stop="onViewDetail(record as ChemicalPurchaseRegisterEntity)">
                详情
              </a-button>
              <a-button v-permission="'purchase::register::add'" type="link" @click.stop="onEdit(record as ChemicalPurchaseRegisterEntity)">
                编辑
              </a-button>
              <a-button v-permission="'purchase::register::print'" type="link" @click.stop="onPrint(record as ChemicalPurchaseRegisterEntity)">
                打印
              </a-button>
            </template>
          </template>
          <template #expandedRowRender="{ record }">
            <RegisterDetailItems :register-id="record.id!" />
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import HtButtonGroup from '~/components/htButtonGroup'
import { purchaseApplyStatusDict } from '~/components/selectorViaMethodCall/entity/PurchaseApplySelectorEntity'
import { useTableHooks } from '~/hooks/useTableHooks'
import { IlisPrintUdr } from '~/utils/IlisPrintUdr'
import { getPurchaseRegisterPage } from './api'
import { ChemicalPurchaseRegisterEntity, ChemicalPurchaseRegisterQueryEntity } from './ChemicalPurchaseRegisterEntity'
import CreateForm from './components/CreateForm.vue'
import RegisterDetailItems from './components/RegisterDetailItems.vue'

const queryForm = ref({
  q: '',
  registerTimeStart: '',
  registerTimeEnd: '',
})

const CUSTOM_TYPE = 'chemical_purchase_register'

const printUdr = new IlisPrintUdr()

const {
  loading,
  customColumns,
  dataSource,
  tableHeight,
  tableBoxRef,
  getPagination,
  handleReset,
  handleSearch,
  handleExport,
  handleReloadTable,
  handleSortChange,
} = useTableHooks<ChemicalPurchaseRegisterEntity>({
  api: getPurchaseRegisterPage,
  customType: CUSTOM_TYPE,
  query: queryForm,
})

function onAdd() {
  AnyDialogHelper.showModel(CreateForm, {
    mode: 'create',
  }).then(() => handleReloadTable())
}

function onViewDetail(record: ChemicalPurchaseRegisterEntity) {
  AnyDialogHelper.showModel(CreateForm, {
    id: record.id,
    mode: 'detail',
  })
}

function onEdit(record: ChemicalPurchaseRegisterEntity) {
  AnyDialogHelper.showModel(CreateForm, {
    id: record.id,
    mode: 'edit',
  }).then(() => handleReloadTable())
}

function onPrint(record: ChemicalPurchaseRegisterEntity) {
  printUdr.commonPrint([record.id], 'ChemicalPurchaseRegister')
}
</script>
