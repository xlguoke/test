import type { IndustryCustomField, IndustryLayoutConfig, OldLayoutConfig } from '~/api/consign/consign-form-layout/types'
import type { IConsignCustomAttribute } from '~/api/consign/consign-management/types'
import type { IndustryConfig } from '~/views/unit-config/industryConfig'
import { EFormItemDynamicType } from '~/anyThing/enum/EFormItemType'
import { getDictByCode } from '~/api/common'
import { commonOptionsApi, getLayoutConfigApi, getOldLayoutConfigApi, saveLayoutConfigApi } from '~/api/consign/consign-form-layout'
import { LAYOUT_FORM_TYPE, OLD_LAYOUT_MAP } from '~/api/consign/consign-form-layout/types'
import { consignConstructParamsApi } from '~/api/consign/consign-management'
import { FORM_TYPE } from '~/components/customAttribute'
import { BUSINESS_SCOPE, FIELD_SOURCE, OPTIONS_DATA_SOURCE } from '~/views/unit-config/industryConfig'
import { industryFieldConfigApi } from '~/views/unit-config/industryConfig/api'

interface InitLayoutConfig {
  customAttributes?: IConsignCustomAttribute[]
}

/**
 * 布局配置
 * @param industryId 领域id
 * @param isLayout 是否为布局配置 - 布局配置时，若无需设置默认值，则不加载选项数据，避免不必要的请求
 */
export function useLayoutConfig(industryId: string, isLayout?: boolean) {
  const loading = ref(false)
  /** 【系统参数】创建委托时，是否选择工程划分 */
  const SHOW_UNIT_PROJECT = ref(false)
  /** 表单类型 */
  const layoutFormType = ref<LAYOUT_FORM_TYPE>(LAYOUT_FORM_TYPE.CONSIGN)
  /** 以前保存在redis的委托布局配置，当没有最新的布局配置时，从redis获取以前的布局配置 */
  const redisLayoutConfigs = ref<OldLayoutConfig[]>([])
  /** 委托布局配置 */
  const consignLayoutConfigs = ref<IndustryLayoutConfig[]>([])
  /** 综合试验布局配置 */
  const synthesisConsigLayoutConfigs = ref<IndustryLayoutConfig[]>([])
  /** 当前表单的旧版布局配置 */
  const activeRedisLayout = computed<OldLayoutConfig | undefined>(() => redisLayoutConfigs.value.find(d => d.key === OLD_LAYOUT_MAP[layoutFormType.value]))

  const layoutConfigs = computed(() => layoutFormType.value === LAYOUT_FORM_TYPE.SYNTHESIS_CONSIGN ? synthesisConsigLayoutConfigs.value : consignLayoutConfigs.value)

  const isDetail = useUrlSearchParams().detail === 'detailPage'

  /** 是否自动保存布局配置 */
  const isAutoSaveConfig = ref(false)

  async function getSystemParam() {
    SHOW_UNIT_PROJECT.value = await getBusinessParam('SHOW_UNIT_PROJECT')
  }

  getSystemParam()

  /** 获取领域字段配置 */
  async function getIndustryFieldConfig(): Promise<IndustryCustomField[]> {
    try {
      const { data } = await industryFieldConfigApi({ industryId, module: BUSINESS_SCOPE.CONSIGN })
      const confgData: IndustryCustomField[] = []
      for (let i = 0; i < data.length; i++) {
        const d = data[i]
        if (!d.selected)
          continue
        const options = await initOptions(d)
        confgData.push({
          ...d,
          disabledRequired: d.required || false,
          options,
        })
      }
      return confgData
    }
    catch (err) {
      console.error(err)
      return []
    }
  }

  /** 获取旧版布局配置 */
  async function getOldLayoutConfig(): Promise<OldLayoutConfig | undefined> {
    try {
      if (activeRedisLayout.value)
        return activeRedisLayout.value
      const { data } = await getOldLayoutConfigApi()
      redisLayoutConfigs.value = data
      return data.find(d => d.key === OLD_LAYOUT_MAP[layoutFormType.value])
    }
    catch (err) {
      console.error(err)
    }
  }

  /** 获取待选数据：适用组件 —— 树形数据、字典数据、下拉选择、单选、多选、选择器 */
  async function initOptions(item: IndustryConfig) {
    if (!item.config)
      return

    if (isLayout && !item.defaulted)
      return

    const { dict, statics } = item.config

    if (item.dataFrom === OPTIONS_DATA_SOURCE.STATIC)
      return statics

    if (item.dataFrom === OPTIONS_DATA_SOURCE.DICT) {
      const { data } = await getDictByCode(dict)
      return data.map(d => ({ label: d.typeName, value: d.typeCode }))
    }
    if (item.dataFrom === OPTIONS_DATA_SOURCE.API) {
      let { url, label = 'label', value = 'value' } = item.config.url || {}
      if (isDetail && item.fieldCode === 'snTypeId')
        url = 'tSnCategoryController.do?getAllSnCategory'

      const { data } = await commonOptionsApi(url)
      let newData: any = data
      if ('success' in data && 'msg' in data && 'obj' in data) {
        newData = data.obj || []
      }
      // 树形数据：只支持单选模式
      if (item.formType === EFormItemDynamicType.TREE_SELECT) {
        const trees: any[] = []
        ;(function _each(list: any[], trees: any[]) {
          for (let i = 0; i < list.length; i++) {
            const item = list[i]
            const newItem: any = {
              ...item,
              label: item[label],
              value: item[value],
              children: [],
            }
            // 子级默认为children，若接口子级不是children，与后端沟通调整或添加判断逻辑处理，或在配置中添加children属性映射
            if (item.children && item.children.length) {
              _each(item.children, newItem.children)
            }
            else {
              delete newItem.children
            }
            trees.push(newItem)
          }
        })(newData, trees)
        return trees
      }
      else {
        return newData.map((d: any) => ({ ...d, label: d[label], value: d[value], key: d[value] }))
      }
    }
  }

  /**
   * ## 获取布局配置
   * @param industryConfig 领域字段配置
   * @description 旧版布局没有保存字段属性，需要根据领域字段配置的字段名称匹配字段属性，未匹配上字段丢弃
   */
  async function getLayoutConfig(industryConfig: IndustryConfig[]): Promise<IndustryLayoutConfig[]> {
    try {
      const { data } = await getLayoutConfigApi(layoutFormType.value)

      if (data && data.layout && data.layout.length)
        return data.layout

      const oldConfig = await getOldLayoutConfig()

      if (!oldConfig)
        return []
      const fieldCodeObj: Record<string, IndustryConfig> = {}
      industryConfig.forEach((d) => {
        const key = d.fieldDisplayName || d.fieldCode
        fieldCodeObj[key] = d
      })

      // 将旧版布局配置转换成新版本，通过label匹配新版的字段配置
      const configs: IndustryLayoutConfig[] = []
      for (let i = 0; i < oldConfig.layout.length; i++) {
        const layouts = oldConfig.layout[i]

        for (let j = 0; j < layouts.length; j++) {
          const item = layouts[j]
          if (!item.label)
            continue
          const label = item.label.replace(/\s*[：:]\s*/g, '').trim()
          const _conf = fieldCodeObj[label]
          if (!_conf)
            continue
          configs.push({
            ..._conf,
            required: item.required ? true : _conf.required, // 领域配置中设置的必填不允许修改
            isShow: true,
            i: _conf.fieldCode,
            x: item.x * 3, // 新版栅格为12列布局，旧版为4列布局
            y: i,
            w: item.w * 3,
            h: item.h,
          })
        }
      }
      // 旧版隐藏字段
      if (oldConfig.hideField.length && configs.length) {
        let y = configs[configs.length - 1].y
        for (let i = 0; i < oldConfig.hideField.length; i++) {
          const label = oldConfig.hideField[i].replace(/\s*[：:]\s*/g, '').trim()
          const _conf = fieldCodeObj[label]
          if (!_conf)
            continue

          if (i % 2 === 0)
            y++

          configs.push({
            ..._conf,
            required: false,
            isShow: false,
            i: _conf.fieldCode,
            x: i % 2 === 0 ? 0 : 6, // 新版栅格为12列布局，旧版为4列布局
            y,
            w: 6,
            h: 1,
          })
        }
      }

      // 获取旧版布局，说明还未在新版中维护布局信息，在初始化流程执行完成后保存到新版的配置中
      isAutoSaveConfig.value = true

      return configs
    }
    catch (err) {
      console.error(err)
      return []
    }
  }

  /**
   * 获取委托自定义属性配置
   * @description 传入自定义属性配置时，优先使用传入数据
   */
  async function getConsignCustomizeAttribute(configDatas?: IConsignCustomAttribute[]) {
    let customAttributes = configDatas || []
    if (!customAttributes.length) {
      const { data } = await consignConstructParamsApi({ main: true })
      customAttributes = data.consignCustomAttributes || []
    }
    return customAttributes.map((d) => {
      const columnType = d.type === 'textArea' ? EFormItemDynamicType.TEXTAREA : d.type
      const options = d.candidates ? d.candidates.map((s: string) => ({ label: s, value: s })) : undefined
      let defaultValue: any = d.defaultValue || ''
      if (columnType === FORM_TYPE.SELECT_MULTIPLE) {
        defaultValue = `${defaultValue}`.split(',')
      }
      return {
        id: d.id,
        isBlind: d.isBlind === '1',
        defaultValue,
        value: d.attributeValue,
        scope: BUSINESS_SCOPE.CONSIGN,
        fieldName: d.attributeName,
        fieldCode: d.id,
        fieldDisplayName: d.attributeName,
        formType: columnType as EFormItemDynamicType,
        dataFrom: OPTIONS_DATA_SOURCE.STATIC,
        target: FIELD_SOURCE.CONSIGN,
        options,
        defaulted: false,
        required: false,
        selected: false,
      } as IndustryCustomField
    })
  }

  /**
   * 初始化布局配置信息
   * @param type 委托布局类别
   * @param force 是否强制刷新
   * @param config 其他自定义配置
   * @param config.customAttributes 自定义属性 - 查看委托详情时，自定义属性需要从委托详情中获取
   */
  async function initLayoutConfig(type: LAYOUT_FORM_TYPE, force?: boolean, config?: InitLayoutConfig) {
    layoutFormType.value = type
    loading.value = true
    isAutoSaveConfig.value = false

    if (!force) {
      if (type === LAYOUT_FORM_TYPE.CONSIGN) {
        if (consignLayoutConfigs.value.length) {
          loading.value = false
          return
        }
      }
      else if (type === LAYOUT_FORM_TYPE.SYNTHESIS_CONSIGN) {
        if (synthesisConsigLayoutConfigs.value.length) {
          loading.value = false
          return
        }
      }
    }
    else {
      if (type === LAYOUT_FORM_TYPE.CONSIGN)
        synthesisConsigLayoutConfigs.value = []
      else
        consignLayoutConfigs.value = []
    }

    const industryConfig = await getIndustryFieldConfig()
    const customAttrubute = await getConsignCustomizeAttribute(config?.customAttributes)
    // 将领域字段与自定义字段合并
    const mergeIndustryConfig: IndustryCustomField[] = industryConfig.concat(customAttrubute)
    const layoutConfig = await getLayoutConfig(mergeIndustryConfig)
    const configs: IndustryLayoutConfig[] = []

    // 无布局配置，使用默认布局
    if (layoutConfig.length === 0) {
      initDefaultLayoutData(industryConfig, customAttrubute, type)
      loading.value = false
      return
    }

    // 转为json格式，方便查找
    const configObj: { [key: string]: IndustryCustomField } = {}
    for (let i = 0; i < mergeIndustryConfig.length; i++) {
      const d = mergeIndustryConfig[i]
      configObj[d.fieldCode] = d
    }

    // 更新布局数据，将已删除字段从布局配置移除
    for (let j = layoutConfig.length - 1; j >= 0; j--) {
      const c = layoutConfig[j]
      const d = configObj[c.i]
      if (!d) {
        layoutConfig.splice(j, 1)
        continue
      }
      configs.unshift({
        ...c,
        ...d,
        required: d.required ? true : c.required,
        i: d.fieldCode,
        fieldName: d.fieldDisplayName || d.fieldName,
      })
      delete configObj[c.i]
    }

    // 将新增字段添加到布局配置中，默认两列排在布局最后
    const len = layoutConfig.length
    let y = len ? layoutConfig[len - 1].y + 1 : 0
    let ind = 0
    for (const k in configObj) {
      const d = configObj[k]
      ind++
      if (ind % 2 === 0) {
        y++
      }
      configs.push({
        x: ind % 2 === 0 ? 6 : 0,
        y,
        w: 6,
        h: 1,
        ...d,
        isShow: true,
        i: d.fieldCode,
        value: '',
        fieldName: d.fieldDisplayName || d.fieldName,
      })
    }
    setConfigs(type, configs)
    loading.value = false
  }

  async function setConfigs(type: LAYOUT_FORM_TYPE, configs: IndustryLayoutConfig[]) {
    // 创建综合试验，工程划分必选，不受控制参数影响
    if (type === LAYOUT_FORM_TYPE.CONSIGN) {
      for (let i = 0; i < configs.length; i++) {
        const c = configs[i]
        if (c.i === 'unitProject') {
          if (SHOW_UNIT_PROJECT.value) {
            c.isShow = true
            delete c.disabled
            delete c.disabledMsg
          }
          else {
            c.isShow = false
            c.disabled = true
            c.disabledMsg = '【系统参数】创建委托时，不允许选择工程划分'
          }
          break
        }
      }
    }

    if (type === LAYOUT_FORM_TYPE.SYNTHESIS_CONSIGN)
      synthesisConsigLayoutConfigs.value = configs
    else if (type === LAYOUT_FORM_TYPE.CONSIGN)
      consignLayoutConfigs.value = configs

    if (isAutoSaveConfig.value) {
      try {
        await saveLayoutConfigApi({
          module: type,
          layout: configs,
        })
        isAutoSaveConfig.value = false
      }
      catch (err) {
        console.error('自动更新布局配置失败', err)
      }
    }
  }

  /** 还原为默认布局 */
  async function initDefaultLayout(type: LAYOUT_FORM_TYPE) {
    const industryConfig = await getIndustryFieldConfig()
    const customAttrubute = await getConsignCustomizeAttribute()
    initDefaultLayoutData(industryConfig, customAttrubute, type)
  }

  function initDefaultLayoutData(industryConfig: IndustryCustomField[], customAttrubute: IndustryCustomField[], type: LAYOUT_FORM_TYPE) {
    const configs: IndustryLayoutConfig[] = []

    if (type === LAYOUT_FORM_TYPE.CONSIGN)
      synthesisConsigLayoutConfigs.value = []
    else
      consignLayoutConfigs.value = []

    // 按sort排序
    industryConfig.sort((a, b) => (a.sort || 0) - (b.sort || 0))

    // 自定义属性默认放在附件前面，附件之后的默认会隐藏
    const fileIndex = industryConfig.findIndex(item => item.fieldCode === 'attachmentQrKey')

    industryConfig.splice(fileIndex, 0, ...customAttrubute)

    for (let i = 0; i < industryConfig.length; i++) {
      const d = industryConfig[i]
      const config = {
        x: i % 2 === 0 ? 0 : 6,
        y: Math.floor((i + 1) / 2),
        w: 6,
        h: 1,
        ...d,
        isShow: true,
        i: d.fieldCode,
        value: d.defaultValue,
        fieldName: d.fieldDisplayName || d.fieldName,
      }

      // 附件单独一行
      if (d.fieldCode === 'attachmentQrKey') {
        config.x = 0
        config.y++
        config.w = 12
      }

      configs.push(config)
    }
    setConfigs(type, configs)
  }

  return {
    loading,
    layoutConfigs,
    consignLayoutConfigs,
    synthesisConsigLayoutConfigs,
    initLayoutConfig,
    initDefaultLayout,
  }
}
