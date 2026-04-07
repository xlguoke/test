<template>
  <div>
    <a-modal
      v-model:visible="visible"
      width="1000px"
      :centered="true"
      title="配置菜单权限"
      :mask-closable="false"
      :after-close="afterClose"
      @ok="configAuthOk"
    >
      <a-spin :spinning="authSpinning">
        <a-row :gutter="20" style="min-height: 60vh">
          <a-col :span="10">
            <p style="margin-bottom: 10px">菜单列表：</p>
            <a-table
              :data-source="menuTree"
              :columns="menuColumns"
              size="small"
              :custom-row="customRow"
              :scroll="{ y: '60vh' }"
              :row-selection="rowSelectionForMenu"
              bordered
              :pagination="false"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'handle'">
                  <a-space>
                    <a-button
                      v-auth="'sys::user::auths'"
                      size="small"
                      type="primary"
                      @click.stop="getAuthList(record)"
                    >
                      权限
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-col>
          <a-col :span="14">
            <p v-show="handleMenu.id" style="margin-bottom: 10px">
              {{ handleMenu.name + "- 权限" }}：
            </p>
            <a-table
              v-show="handleMenu.id"
              :data-source="authData"
              :columns="authColumns"
              size="small"
              :scroll="{ y: '60vh' }"
              :default-expand-all-rows="true"
              :row-selection="rowSelectionForAuth"
              bordered
              :pagination="false"
              row-key="id"
            ></a-table>
          </a-col>
        </a-row>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {
  getRoleMenuAPI,
  getRoleMenuAuthAPI,
  getUserMenus,
  getUserMenuAuths,
  addUserMenus,
  addUserMenuAuths
} from "@/api/system.api"
import { message } from "ant-design-vue"
import { ref } from "vue"

interface MenuTree {
  children: MenuTree[] | null
  id: string
  name: string
  seq: number
  type: number
  pid: string
  path: string
  icon: string
  component: string
  disableClose: boolean
  description?: string
  checked: boolean
}

const visible = ref<boolean>(false)
const authSpinning = ref(false)
const menuTree = ref<MenuTree[]>([])
const authData: any = ref([])
const menuColumns = [
  {
    title: "菜单名称",
    dataIndex: "name",
    key: "key"
  },
  {
    title: "操作",
    key: "handle",
    width: 80
  }
]
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
  }
]

/** 当前操作的用户 */
const selectedUser: any = ref()
/** 当前操作的菜单：设置执行权限 */
const handleMenu: any = ref({})
/** 已选中的菜单 */
const selectedMenuKeys: any = ref([])
/** 已选中菜单下选中的权限 */
const selectedAuthKeys: any = ref([])
/** 角色菜单权限：禁用状态 */
let roleSelectedMenuKeys: string[] = []
/** 角色执行权限：禁用状态 */
let roleSelectedAuthKeys: string[] = []

//清空所有选择
const clearSelAll = () => {
  selectedUser.value = undefined
  handleMenu.value = {}
  selectedAuthKeys.value = []
  selectedMenuKeys.value = []
  roleSelectedMenuKeys = []
  roleSelectedAuthKeys = []
}

const customRow = (row) => {
  return {
    onClick: () => {
      if (row.checked) return
      const ind = selectedMenuKeys.value.indexOf(row.id)
      if (ind === -1) {
        selectedMenuKeys.value.push(row.id)
      } else {
        selectedMenuKeys.value.splice(ind, 1)
      }
    }
  }
}

/**
 * 左侧菜单选择配置
 */
let rowSelectionForMenu = {
  checkStrictly: true,
  selectedRowKeys: selectedMenuKeys,
  onChange: (keys) => {
    selectedMenuKeys.value = keys
  },
  getCheckboxProps: (record) => ({
    disabled: record.checked
  })
}

/**
 * 右侧权限选择配置
 */
let rowSelectionForAuth = {
  selectedRowKeys: selectedAuthKeys,
  onChange: (keys) => {
    selectedAuthKeys.value = keys
  },
  getCheckboxProps: (record) => ({
    disabled: record.checked
  })
}

//打开角色权限配置
function openModal(row) {
  clearSelAll()
  authData.value = []
  selectedUser.value = row
  visible.value = true
  initMenuTree(row)
}

/**
 * 初始化菜单树
 * @param user 用户信息
 */
async function initMenuTree(user) {
  try {
    authSpinning.value = true
    // 用户菜单权限
    let userMenus = []
    // 角色菜单权限
    const roleMenus = await getRoleMenuAPI(user.roleId)
    try {
      userMenus = await getUserMenus(user.id)
    } catch (err) {
      console.error("获取用户权限配置的菜单信息：", err)
    }
    // 角色菜单权限选中项
    roleSelectedMenuKeys = recursionMenu(roleMenus)
    // 获取合并后的菜单选中项
    const userMenuKeys = recursionMenu(userMenus)
    selectedMenuKeys.value = [...roleSelectedMenuKeys, ...userMenuKeys]

    // 合并角色菜单权限和用户菜单权限
    menuTree.value = mergeTrees(roleMenus, userMenus)

    authSpinning.value = false
  } catch (error) {
    authSpinning.value = false
    message.warning("菜单数据获取错误")
  }
}

/**
 * 合并角色权限和用户权限，并去重
 * @param roleAuths 角色权限
 * @param userAuths 用户权限
 */
function mergeTrees(roleAuths: MenuTree[], userAuths: MenuTree[]) {
  const authMap = new Map()

  // 合并节点
  const mergeNodes = (trees: MenuTree[], isUser?: boolean) => {
    trees.forEach((node) => {
      if (!authMap.has(node.id)) {
        authMap.set(node.id, node)
        if (node.children) {
          mergeNodes(node.children, isUser)
        }
      }
      if (isUser) {
        node.checked = false
      }
    })
  }
  mergeNodes(roleAuths)
  mergeNodes(userAuths, true)

  const mergedTrees = Array.from(authMap.values())
  mergedTrees.sort((p, n) => p.seq - n.seq)

  // 构建排序后的树结构
  const root = { id: "ROOT", children: [] }
  const nodeById = new Map()
  nodeById.set(root.id, root)

  mergedTrees.forEach((node) => {
    nodeById.set(node.id, node)
    node.children = undefined
  })

  mergedTrees.forEach((node) => {
    const pNode = nodeById.get(node.pid)
    if (pNode) {
      if (!pNode.children) pNode.children = []
      pNode.children.push(node)
    }
  })

  return root.children
}

//递归菜单树  回显选中的菜单
function recursionMenu(menus: MenuTree[]) {
  const keys: string[] = []
  function recursion(datas: MenuTree[]) {
    datas.forEach((item) => {
      if (item.checked) {
        keys.push(item.id)
      }
      if (item.children) {
        recursion(item.children)
      }
    })
  }
  recursion(menus)
  return keys
}

/**
 * 获取菜单对应的角色列表
 */
async function getAuthList(row) {
  // 切换之前，先保存当前菜单的权限信息
  await saveMenuAuth()

  //清空上次数据
  roleSelectedAuthKeys = []
  selectedAuthKeys.value = []
  authData.value = []
  handleMenu.value = row

  const roleAuth = await getRoleMenuAuthAPI(selectedUser.value.roleId, row.id)
  const userAuth = await getUserMenuAuths(selectedUser.value.id, row.id)

  const roleMap = new Map()
  const roleKeys: string[] = []
  const userKeys: string[] = []
  roleAuth.forEach((item) => {
    roleMap.set(item.id, item)
    if (item.checked) {
      roleKeys.push(item.id)
    }
  })
  userAuth.forEach((item) => {
    const roleItem = roleMap.has(item.id)
    if (item.checked) {
      userKeys.push(item.id)
    }
    if (!roleItem) {
      item.checked = false
      roleMap.set(item.id, item)
    }
  })

  authData.value = Array.from(roleMap.values())
  roleSelectedAuthKeys = roleKeys
  selectedAuthKeys.value = [...roleKeys, ...userKeys]
}

// 保存菜单权限
async function saveMenuAuth() {
  if (!handleMenu.value.id) return
  const authIds = selectedAuthKeys.value.filter((d) => !roleSelectedAuthKeys.includes(d))

  //如果选择有权限 才进行权限保存
  await addUserMenuAuths({
    userId: selectedUser.value.id,
    menuId: handleMenu.value.id,
    authIds
  })
}

// 保存数据
const configAuthOk = async () => {
  authSpinning.value = true
  const menuIds = selectedMenuKeys.value.filter((d) => !roleSelectedMenuKeys.includes(d))
  await addUserMenus({
    userId: selectedUser.value.id,
    menuIds
  })
  await saveMenuAuth()
  authSpinning.value = false
  message.success("操作成功")
}

//关闭弹窗重置
const afterClose = () => {
  handleMenu.value = {}
}

defineExpose({
  openModal
})
</script>

<style></style>
