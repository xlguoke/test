<template>
  <ht-modal
    v-model:open="open"
    title="批量编辑"
    width="460px"
    :mask-closable="false"
    :after-close="onClosed"
    centered
    @cancel="cancel"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ style: 'width: 95px' }" :wrapper-col="{ style: 'flex: 1' }">
      <a-form-item name="checkDepartmentId" label="核查部门" :rules="[{ required: true, message: '请选择核查部门！' }]">
        <a-tree-select
          v-model:value="formState.checkDepartmentId"
          class="w-full"
          :tree-data="treeData"
          :field-names="{
            label: 'text',
            value: 'id',
          }"
          allow-clear
          placeholder="请选择"
          tree-node-filter-prop="text"
          @change="selectDepartment"
        />
      </a-form-item>
      <a-form-item name="checkUserId" label="核查人" :rules="[{ required: true, message: '请选择核查人！' }]">
        <a-input-group compact>
          <a-input v-model:value="formState.checkUser" readonly placeholder="请选择" style="width: calc(100% - 48px)" />
          <a-button @click="setUserSelectorVisible(true)">
            <UnorderedListOutlined style="font-size: 16px;" />
          </a-button>
        </a-input-group>
      </a-form-item>
      <a-form-item name="checkItemsStr" label="核查项目" :rules="[{ required: true, message: '请选择核查项目！' }]">
        <a-input-group compact>
          <a-input v-model:value="formState.checkItemsStr" readonly placeholder="请选择" style="width: calc(100% - 48px)" />
          <a-button @click="onSelectCheckItem">
            <UnorderedListOutlined style="font-size: 16px;" />
          </a-button>
        </a-input-group>
      </a-form-item>
      <a-form-item name="remark" label="备注">
        <a-textarea v-model:value="formState.remark" :rows="1" placeholder="请输入" />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="cancel">
        取消
      </a-button>
      <a-button type="primary" @click="onSubmit">
        确定
      </a-button>
    </template>
  </ht-modal>

  <PersonSelector v-model:show="userSelectorVisible" @confirm="selectPerson" />
</template>

<script setup lang='ts'>
import { UnorderedListOutlined } from '@ant-design/icons-vue'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps.ts'
import type { EquipmentFunCheckPlanEntity } from '~/views/equipment/funcationalInspect/plan/EquipmentFunCheckPlanEntity.ts'
import { getOrgComboTree } from '~/api/common.ts'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity.ts'
import PersonSelector from '~/components/PersonSelector.vue'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity.ts'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import CheckItemSelector from '~/views/equipment/funcationalInspect/plan/component/CheckItemSelector.vue'
import {
  EquipmentFunctionCheckItemDTOOnCreate,
  EquipmentFunctionCheckPlanDetailDTOOnCreate,
} from '~/views/equipment/funcationalInspect/plan/api.ts'
import type { ScreenTypeEntity } from '~/views/admin/screen/configuration'

const props = defineProps<IDialogPropsParam<null, EquipmentFunCheckPlanEntity>>()

const [userSelectorVisible, setUserSelectorVisible] = useStateHooks(false)

const open = ref(true)

const formRef = ref()

const treeData = ref<IDepartmentEntity[]>([])

const formState = ref(new EquipmentFunctionCheckPlanDetailDTOOnCreate())

getTreeData()

async function getTreeData() {
  const { data } = await getOrgComboTree()
  treeData.value = data
}

function onSubmit() {
  formRef.value.validateFields().then(async () => {
    props.onConfirm(unref(formState.value))
    cancel()
  })
}

async function onSelectCheckItem() {
  const rows: ScreenTypeEntity[] = await AnyDialogHelper.showModel(CheckItemSelector)
  const checkItems: EquipmentFunctionCheckItemDTOOnCreate[] = []

  rows.forEach((row) => {
    const cItem = new EquipmentFunctionCheckItemDTOOnCreate()
    cItem.dictId = row.id
    cItem.name = row.typename
    checkItems.push(cItem)
  })

  formState.value.checkItems = checkItems
  formState.value.checkItemsStr = checkItems.map(i => i.name).join(';')

  formRef.value.validate('checkItemsStr')
}

function selectDepartment(id, names) {
  if (id) {
    formState.value.checkDepartment = names[0]
  }
  else {
    formState.value.checkDepartment = ''
  }
}

function selectPerson(rows: IUserSelectVoEntity[]) {
  const [row] = rows

  formState.value.checkUserId = row.id
  formState.value.checkUser = row.name

  formRef.value.validate('checkUserId')

  setUserSelectorVisible(false)
}

// 关闭弹窗
function cancel() {
  open.value = false
}
</script>
