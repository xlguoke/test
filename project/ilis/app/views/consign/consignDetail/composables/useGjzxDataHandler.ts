import type { ConfigTreeOption, IndustryLayoutConfig } from '~/api/consign/consign-form-layout/types'
import { getUnitCode } from '~/utils/getUnitCode.ts'

/**
 * 国检中心数据处理
 */
export function useGjzxDataHandler() {
  const unitCode = getUnitCode()

  const enableGjzxDataHandler = unitCode.toLocaleLowerCase() === 'gjzx'

  const userInfo = getLocalUserInfo()

  const config = getConfig()

  let originOptions: ConfigTreeOption[] = []

  function getConfig() {
    // 控制配置
    const config: {
      [key: string]: Record<string, string[]>
    } = {
      '2020年道桥国检中心编号': {},
      '道桥国检中心编号': {},
      '交安国检中心编号': {},
      '模拟报告': {},
      '测试': {},
      '监督抽查': {},
      '能力验证': {},
      '模拟报告编号': {},
    }

    // 国检办公室特殊逻辑
    if (userInfo?.departName === '国检中心办公室' || userInfo?.departName === '国检中心委托接样管理部') {
      config['2020年道桥国检中心编号']['路材/桥成'] = ['（路材）字', '（桥成）字']
      config['道桥国检中心编号']['路材/桥成'] = ['（路材）字', '（桥成）字']
      config['交安国检中心编号']['交安/机电'] = ['CA01', 'CA02', 'CA03', 'CA04', 'CJ', 'CR']
    }

    config['2020年道桥国检中心编号']['工程类委托'] = ['（路检）字', '（桥检）字', '（隧检）字', '（综检）字', '(桥基）字', '（交安）字', '（水检）字']
    config['2020年道桥国检中心编号']['模拟报告'] = ['（模）字']
    config['2020年道桥国检中心编号']['测试'] = ['CS']
    config['2020年道桥国检中心编号']['监督抽查'] = ['监督抽查（暂不能使用）']

    config['道桥国检中心编号']['工程类委托'] = ['（路检）字', '（桥检）字', '（隧检）字', '（综检）字', '(桥基）字', '（交安）字', '（水检）字']
    config['道桥国检中心编号']['测试'] = ['CS']
    config['道桥国检中心编号']['监督抽查'] = ['监督抽查（暂不能使用）']
    config['道桥国检中心编号']['能力验证'] = ['NLYZ']

    config['交安国检中心编号']['工厂类委托检测'] = ['GJZ']
    config['交安国检中心编号']['工程类委托'] = ['YH', 'GJS', 'GA', 'GJ']
    config['交安国检中心编号']['模拟报告'] = ['MCA', 'MCJ', 'MGA', 'MGJ', 'MCAL']
    config['交安国检中心编号']['测试'] = ['CS']
    config['交安国检中心编号']['监督抽查'] = ['监督抽查（暂不能使用）']

    config['模拟报告']['模拟报告'] = ['（模）字', 'MCA', 'MCJ', 'MGA', 'MGJ', 'MCAL']
    config['模拟报告编号']['模拟报告'] = ['（模）字']

    config['测试']['测试'] = ['CS']

    config['监督抽查']['监督抽查'] = ['监督抽查（暂不能使用）']

    config['能力验证']['能力验证'] = ['NLYZ']

    return config
  }

  /**
   * 获取处理后的数据
   * checkTypeItem 检测类别项
   * checkTypeId 检测类别值
   * snTypeItem 编号类别项
   * snTypeId 编号类别值
   */
  function getGjzxHandleData(options: {
    checkTypeItem: IndustryLayoutConfig
    checkTypeId: string
    snTypeItem: IndustryLayoutConfig
    snTypeId: string
  }) {
    const { checkTypeItem, checkTypeId, snTypeItem, snTypeId } = options

    if (checkTypeItem && (!originOptions || !originOptions.length)) {
      originOptions = JSON.parse(JSON.stringify(checkTypeItem.options || []))
    }

    const snTypeOptions = snTypeItem.options || []

    const snTypeCheckedItem = snTypeOptions.find(item => item.value === snTypeId)

    // 按配置重新生成检测类型树
    let result: ConfigTreeOption[] = []
    const configItem = snTypeCheckedItem ? config[snTypeCheckedItem.label] : null

    if (configItem) {
      result = originOptions.filter((i: ConfigTreeOption) => {
        const cKey = configItem[i.label]
        if (cKey) {
          i.children = (i.children || []).filter((j: ConfigTreeOption) => cKey.includes(j.label))
          return true
        }
        return false
      })
    }
    else {
      result = JSON.parse(JSON.stringify(originOptions)) || []
    }

    // 获取checkTypeId的默认值
    let defaultId
    let defaultId2
    for (let i = 0; i < result.length; i++) {
      if (defaultId) {
        break
      }
      const resultItem = result[i]
      resultItem.children = resultItem.children || []

      for (let j = 0; j < resultItem.children.length; j++) {
        const item = resultItem.children[j]
        if (item.category === false) {
          if (!defaultId2) {
            defaultId2 = item.value
          }
        }
        if (checkTypeId === item.value) {
          defaultId = item.value
          break
        }
      }
    }

    return {
      checkTypeOptions: result,
      checkTypeId: defaultId || defaultId2 || '',
    }
  }

  return {
    enableGjzxDataHandler,
    getGjzxHandleData,
  }
}
