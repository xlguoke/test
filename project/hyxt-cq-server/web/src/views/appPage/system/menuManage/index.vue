<template>
  <div class="menu_Manage">
    <a-spin tip="Loading..." :spinning="spinning">
      <a-row class="action_row">
        <a-space>
          <a-button type="primary" @click="addMenu">菜单录入</a-button>
          <a-button plain @click="editMenu">菜单编辑</a-button>
          <a-button type="primary" danger @click="deleteMenu">删除菜单</a-button>
        </a-space>
      </a-row>
      <a-table
        :data-source="treeData"
        :columns="columns"
        size="small"
        :default-expand-all-rows="true"
        :row-selection="rowSelection"
        bordered
        :pagination="false"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'disableClose'">
            <a-switch v-model:checked="record.disableClose" :disabled="true" size="small" />
          </template>
          <template v-else-if="column.dataIndex === 'handle'">
            <a-button size="small" type="primary" @click="openAuthMode(record)">权限配置</a-button>
          </template>
          <template v-else-if="column.dataIndex === 'icon'">
            <i :class="`iconfont ${record.icon}`"></i>
            <!-- <span style="margin-right:10px;}">{{ record.icon }}</span> -->
          </template>
        </template>
      </a-table>
      <a-modal
        v-model:visible="menuVisible"
        :title="menuFrom.id ? '编辑菜单' : '新增菜单'"
        :mask-closable="false"
        @ok="editMenuOk"
      >
        <a-form
          ref="menuFormRef"
          :model="menuFrom"
          name="basic"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }"
          autocomplete="off"
        >
          <a-form-item
            label="菜单名称"
            name="name"
            :rules="[{ required: true, message: '请输入菜单名称!' }]"
          >
            <a-input v-model:value="menuFrom.name" placeholder="请输入菜单名称" />
          </a-form-item>
          <a-form-item
            label="序号"
            name="seq"
            :rules="[{ required: true, message: '请输入序号!' }]"
          >
            <a-input v-model:value="menuFrom.seq" type="number" placeholder="请输入序号" />
          </a-form-item>
          <a-form-item
            label="菜单类型"
            name="type"
            :rules="[{ required: true, message: '请选择菜单类型' }]"
          >
            <a-select v-model:value="menuFrom.type" default-value="1" @change="switchType">
              <a-select-option :value="1">层级菜单</a-select-option>
              <a-select-option :value="2">跳转菜单</a-select-option>
              <a-select-option :value="3">隐藏菜单</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            label="父级菜单"
            name="type"
            :rules="[{ required: true, message: '请选择父级菜单！' }]"
          >
            <a-tree-select
              v-model:value="menuFrom.pid"
              style="width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :tree-data="treeData"
              :tree-line="true"
              :show-arrow="true"
              :field-names="{ label: 'name', value: 'id', children: 'children', key: 'id' }"
              placeholder="请选择父级节点"
            ></a-tree-select>
          </a-form-item>
          <a-form-item
            v-if="menuFrom.type === 2 || menuFrom.type === 3"
            label="跳转路径"
            name="path"
            :rules="[{ required: true, message: '请输入跳转路径' }]"
          >
            <a-input v-model:value="menuFrom.path" placeholder="请输入跳转路径" />
          </a-form-item>
          <a-form-item
            v-if="menuFrom.type === 2 || menuFrom.type === 3"
            label="组件路径"
            name="component"
            :rules="[{ required: true, message: '请输入组件路径，@/ 代表 src 目录' }]"
          >
            <a-input v-model:value="menuFrom.component" placeholder="请输入组件路径" />
          </a-form-item>

          <a-form-item label="系统图标" name="icon">
            <a-input v-model:value="menuFrom.icon" placeholder="请输入图标class" />
          </a-form-item>
          <a-form-item
            v-if="menuFrom.type === 2 || menuFrom.type === 3"
            name="disableClose"
            label="允许关闭"
          >
            <a-switch v-model:checked="menuFrom.disableClose" />
          </a-form-item>
          <a-form-item label="备注说明" name="description">
            <a-textarea
              v-model:value="menuFrom.description"
              placeholder="请输入备注说明"
              :rows="4"
            />
          </a-form-item>
        </a-form>
      </a-modal>

      <a-drawer
        v-model:visible="authVisible"
        class="custom-class"
        style="color: red"
        title="权限配置"
        placement="right"
        width="600px"
        :mask-closable="false"
      >
        <a-spin tip="Loading..." :spinning="authSpinning">
          <a-row class="action_row">
            <a-space>
              <a-button type="primary" plain @click="addAuth">新增权限</a-button>
            </a-space>
          </a-row>
          <a-table
            :data-source="authData"
            :columns="authColumns"
            size="small"
            :default-expand-all-rows="true"
            :row-selection="rowSelection"
            bordered
            :pagination="false"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'code'">
                <a title="点击复制" @click="copyCode(record.code)">{{ record.code }}</a>
              </template>
              <template v-if="column.dataIndex === 'handle'">
                <a-space>
                  <a-button size="small" type="primary" @click="editAuth(record)">编辑</a-button>
                  <a-popconfirm
                    title="确定删除?"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="delAuth(record)"
                  >
                    <a-button size="small" danger type="primary">删除</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-spin>
      </a-drawer>

      <a-modal
        v-model:visible="authEditVisible"
        :title="authFrom.id ? '编辑权限' : '新增权限'"
        @ok="handleOkForAuth"
      >
        <a-form
          ref="authFormRef"
          :model="authFrom"
          name="basic"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }"
          autocomplete="off"
        >
          <a-form-item
            label="权限名称"
            name="name"
            :rules="[{ required: true, message: '请输入权限名称!' }]"
          >
            <a-input v-model:value="authFrom.name" placeholder="请输入菜单名称" />
          </a-form-item>
          <a-form-item
            label="权限编码"
            name="code"
            :rules="[{ required: true, message: '请输入权限编码!' }]"
          >
            <a-input v-model:value="authFrom.code" placeholder="请输入权限编码" />
          </a-form-item>
          <a-form-item label="权限说明" name="description">
            <a-textarea
              v-model:value="authFrom.description"
              placeholder="请输入备注说明"
              :rows="4"
            />
          </a-form-item>
        </a-form>
      </a-modal>
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import useClipboard from "vue-clipboard3"
import { ref, onMounted, createVNode, toRaw, nextTick } from "vue"
import {
  addMenuAPI,
  updateMenuAPI,
  deleteMenuAPI,
  getMenuAPI,
  addAuthAPI,
  updateAuthAPI,
  deleteAuthAPI,
  getAuthAPI
} from "@/api/system.api"
import type { MenuEditParms, AuthEditParms } from "@/type/api/system.api"

import { message, Modal } from "ant-design-vue"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"

let spinning = ref(false)

/*******************菜单区块start*********************** */
const menuFormRef = ref()
let menuVisible = ref(false)
const treeData = ref([])
let menuFrom = ref<MenuEditParms>({
  name: "",
  seq: 0,
  path: "",
  icon: "",
  disableClose: true,
  description: "",
  pid: "ROOT",
  type: 1,
  component: ""
})

let selectedRowKeys = ref<string[]>([])
let selectedRows = ref([])

let rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys: string[], rows: any) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
    console.log("selectedRowKeys: ", keys)
    console.log("selectedRows: ", rows)
  }
}
const getMenuTree = () => {
  spinning.value = true
  getMenuAPI()
    .then((res) => {
      spinning.value = false
      treeData.value = matterTree(res)
    })
    .catch(() => {
      spinning.value = false
    })
}
const matterTree = (data: any) => {
  //递归菜单树进行值转转换
  for (let i = 0; i < data.length; i++) {
    data[i].disabled = data[i].type === 1 ? false : true
    if (data[i].children && data[i].children.length > 0) {
      // children若不为空数组，则继续 递归调用 本方法
      matterTree(data[i].children)
    }
  }
  return data
}

//菜单编辑表单数据重置
const editMenuFromReset = async () => {
  await nextTick()
  menuFrom.value = {
    //数据重置
    name: "",
    seq: 0,
    path: "",
    icon: "",
    disableClose: true,
    description: "",
    pid: "ROOT",
    type: 1,
    component: ""
  }
  menuFormRef.value.resetFields() //重置表单验证
}
const editMenuOk = async () => {
  try {
    await menuFormRef.value.validateFields()
  } catch {
    console.error("检验失败")
    return
  }
  if (menuFrom.value.type == 1) {
    //如果是层级菜单  需要抹除掉 path  component等字段
    menuFrom.value.pid = "ROOT"
    menuFrom.value.path = ""
    menuFrom.value.component = ""
  }
  try {
    let res = menuFrom.value.id
      ? await updateMenuAPI(menuFrom.value)
      : await addMenuAPI(menuFrom.value) //执行新增 还是编辑
    menuVisible.value = false
    selectedRowKeys.value = []
    selectedRows.value = []
    getMenuTree()
    editMenuFromReset() //重置表单
  } catch (error) {
    console.error("操作失败！")
  }
}

const addMenu = () => {
  menuVisible.value = true
  editMenuFromReset()
}
const deleteMenu = () => {
  if (selectedRowKeys.value.length != 1) {
    message.warning("请选择一条进行删除")
    return
  } else {
    Modal.confirm({
      icon: createVNode(ExclamationCircleOutlined),
      content: "确认删除选择菜单吗?",
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        deleteMenuAPI(selectedRowKeys.value[0]).then((res) => {
          if (res) {
            getMenuTree()
          }
        })
      },
      onCancel() {
        console.log("Cancel")
      }
    })
  }
}
const editMenu = () => {
  if (selectedRows.value.length != 1) {
    message.warning("请选择一条进行编辑")
    return
  } else {
    menuVisible.value = true
    menuFrom.value = JSON.parse(JSON.stringify(toRaw(selectedRows.value[0])))
  }
}

const switchType = (v: number) => {
  console.log(v)
}

const columns = [
  {
    title: "菜单名称",
    dataIndex: "name",
    key: "key",
    width: 300,
    ellipsis: true
  },
  {
    title: "排序",
    dataIndex: "seq",
    key: "key",
    width: 60
  },

  {
    title: "跳转路径",
    dataIndex: "path",
    key: "key",
    ellipsis: true
  },
  {
    title: "组件路径",
    dataIndex: "component",
    key: "key",
    width: 200,
    ellipsis: true
  },
  {
    title: "图标",
    dataIndex: "icon",
    key: "key",
    ellipsis: true,
    width: 50,
    align: "center"
  },
  {
    title: "禁止关闭",
    dataIndex: "disableClose",
    key: "key",
    width: 70,
    align: "center"
  },
  {
    title: "说明",
    dataIndex: "description",
    key: "description"
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "key"
  }
]

/*******************菜单区块end*********************** */

/*******************权限配置区块start*********************** */

let authVisible = ref(false)
let authEditVisible = ref(false)
let authSpinning = ref(false)
let configMenu: any = {} //需要配置权限的菜单

let authFormRef = ref()
const authData = ref([])
const authFrom = ref<AuthEditParms>({
  name: "",
  code: "",
  menuId: "",
  description: "",
  id: ""
})

const authColumns = [
  {
    title: "权限名称",
    dataIndex: "name",
    key: "key"
  },
  {
    title: "权限编码",
    dataIndex: "code",
    key: "key"
  },
  {
    title: "权限描述",
    dataIndex: "description",
    key: "key"
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "key",
    width: 120
  }
]
const openAuthMode = (item: any) => {
  configMenu = item
  getAuthList()
  authVisible.value = true
}

const getAuthList = () => {
  authSpinning.value = true
  getAuthAPI(configMenu.id)
    .then((res) => {
      authSpinning.value = false
      authData.value = res
    })
    .catch(() => {
      authSpinning.value = false
    })
}
const addAuth = () => {
  authEditVisible.value = true
  editAuthFromReset()
}
const editAuth = (item: any) => {
  authEditVisible.value = true
  authFrom.value = JSON.parse(JSON.stringify(toRaw(item)))
}
const delAuth = (item: any) => {
  authSpinning.value = true
  deleteAuthAPI(item.id)
    .then(() => {
      getAuthList()
      authSpinning.value = false
    })
    .catch((err) => {
      authSpinning.value = false
    })
}
const editAuthFromReset = async () => {
  await nextTick()
  authFormRef.value.resetFields()
  authFrom.value = {
    name: "",
    code: "",
    menuId: "",
    description: "",
    id: ""
  }
}
const handleOkForAuth = async () => {
  try {
    await authFormRef.value.validateFields()
  } catch (error) {
    console.error("表单验证失败")
    return
  }
  authFrom.value.menuId = configMenu.id
  authSpinning.value = true
  try {
    authFrom.value.id ? await updateAuthAPI(authFrom.value) : await addAuthAPI(authFrom.value)
    getAuthList()
    authSpinning.value = false
    authEditVisible.value = false
    editAuthFromReset()
  } catch (error) {
    console.error("操作失败")
  }
}
/*******************权限配置区块end*********************** */
onMounted(() => {
  //vue组件挂载完成后回调
  getMenuTree()
})

// 点击编码复制
const { toClipboard } = useClipboard()
const copyCode = async (code: string) => {
  try {
    await toClipboard(code)
    message.success("复制成功")
  } catch (err) {
    console.log("复制失败：", err)
  }
}
</script>

<style lang="less" scoped>
.action_row {
  margin-bottom: 10px;
}
</style>
