import type { StandardMaterialLedgerEntity } from './../standard-material-ledger/entity/StandardMaterialLedgerEntity'
import { getStandardMaterialLedgerList } from './../standard-material-ledger/api'

/**
 * 单位选项类型
 */
export interface UnitOption {
  value: string
  label: string
}

/**
 * 全局共享状态（单例模式）
 * 确保所有组件使用相同的数据
 */
const materialList = ref<StandardMaterialLedgerEntity[]>([])
const isMaterialListLoaded = ref(false)
const isLoading = ref(false)

const custodians = ['张三', '李四', '王五', '赵六', '钱七']
const custodianOptions = ref<{ value: string }[]>(custodians.map(item => ({ value: item })))

const unitList = ref<UnitOption[]>([
  { value: '1', label: '瓶' },
  { value: '2', label: '罐' },
  { value: '3', label: '箱' },
  { value: '4', label: 'kg' },
  { value: '5', label: 'g' },
  { value: '6', label: 'mL' },
])

/**
 * 公共数据Hooks
 * 用于管理标准物质、生产单位、规格型号、单位等公共数据
 */
export function useCommonData() {
  /**
   * 标准物质选项（用于下拉选择，包含完整信息）
   */
  const materialOptions = computed(() =>
    materialList.value.map(item => ({
      value: item.id,
      label: item.name,
      specification: item.specification,
      unitPrice: item.unitPrice,
      unit: item.unit,
      custodian: item.custodian,
    })),
  )

  /**
   * 标准物质名称选项（用于组合框）
   */
  const materialNameOptions = computed(() =>
    materialList.value.map(item => ({
      value: item.name,
      label: `${item.name}（${item.specification}）`,
    })),
  )

  /**
   * 生产单位列表
   */
  const manufacturerList = computed(() => {
    const manufacturers = new Set<string>()
    materialList.value.forEach(item => manufacturers.add(item.manufacturer || ''))
    return Array.from(manufacturers)
  })

  /**
   * 生产单位选项（用于下拉选择）
   */
  const manufacturerOptions = computed(() =>
    manufacturerList.value.map(item => ({
      value: item,
      label: item,
    })),
  )

  /**
   * 规格型号列表
   */
  const specificationList = computed(() => {
    const specifications = new Set<string>()
    materialList.value.forEach(item => specifications.add(item.specification || ''))
    return Array.from(specifications)
  })

  /**
   * 规格型号选项（用于下拉选择）
   */
  const specificationOptions = computed(() =>
    specificationList.value.map(item => ({
      value: item,
      label: item,
    })),
  )

  /**
   * 单位选项（用于下拉选择）
   */
  const unitOptions = computed(() => unitList.value)

  /**
   * 设置标准物质列表
   * @param list 标准物质数组
   */
  function setMaterialList(list: StandardMaterialLedgerEntity[]) {
    materialList.value = list
    isMaterialListLoaded.value = true
  }

  /**
   * 根据名称获取标准物质详情
   * @param name 标准物质名称
   * @returns 标准物质详情
   */
  function getMaterialByName(name: string): StandardMaterialLedgerEntity | undefined {
    return materialList.value.find(item => item.name === name)
  }

  /**
   * 根据ID获取标准物质详情
   * @param id 标准物质ID
   * @returns 标准物质详情
   */
  function getMaterialById(id: string): StandardMaterialLedgerEntity | undefined {
    return materialList.value.find(item => item.id === id)
  }

  function handleSearchMaterialName(value: string) {
    return materialNameOptions.value.filter(item => item.label.includes(value))
  }

  /**
   * 初始化数据 - 从API获取标准物质列表
   */
  async function initData() {
    if (isMaterialListLoaded.value || isLoading.value) {
      return
    }

    isLoading.value = true
    try {
      const res = await getStandardMaterialLedgerList({ pageNumber: 1, pageSize: 9999 })
      if (res.data?.content) {
        setMaterialList(res.data.content)
      }
    }
    catch (error) {
      console.error('加载标准物质列表失败:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    // 标准物质相关
    materialList,
    materialOptions,
    materialNameOptions,
    custodianOptions,

    // 生产单位相关
    manufacturerList,
    manufacturerOptions,

    // 规格型号相关
    specificationList,
    specificationOptions,

    // 单位相关
    unitList,
    unitOptions,

    // 加载状态
    isLoading,
    isMaterialListLoaded,

    // 方法
    setMaterialList,
    getMaterialByName,
    handleSearchMaterialName,
    getMaterialById,
    initData,
  }
}
