import type { Key } from 'ant-design-vue/es/vc-table/interface'
import type { ParamDiffer } from '../api'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import sseRequestProgress from '~/components/sseRequestProgress'
import { useIndustryStore } from '~/store/industryStore'
import { checkParamDiffApi, checkSnRuleApi, createConsignNoApi, syncTestParamSettingsApi } from '../api'
import ConfirmDepartment from '../components/ConfirmDepartment.vue'
import ConfirmTip from '../components/ConfirmTip.vue'
import { modalConfirm, modalError } from './modalUtil'

/**
 * ## 转换字段
 */
function policyMapper(array: any[]) {
  return array.map((item) => {
    return {
      testObjectId: item.testObjectId,
      testObjectName: item.objectName,
      testObjectCode: item.objectCode,
      buildSampleCode: item.buildSampleCodePresent,
      generateProcessObject: item.generateProcessObjectPresent,
    }
  })
}

/**
 * ## 完成委托：委托列表、委托详情
 * @param {Key[]} rowIds 已选委托id
 * @param {boolean} isLocalTest 是否为现场检测
 */
export function useCompleteConsign(rowIds: Ref<Key[]>, isLocalTest?: boolean) {
  const { term } = useIndustryStore()

  /** 【业务控制参数】系统编号自动更新编号掩码 */
  const SN_AUTO_MATCH_MASK = ref(false)

  async function init() {
    SN_AUTO_MATCH_MASK.value = await getBusinessParam('SN_AUTO_MATCH_MASK')
  }

  init()

  /**
   * ## 验证参数变化
   */
  function checkChangeParams(differs: ParamDiffer[]) {
    const msg: any = []
    const isChangeLocale = differs.some((d) => {
      return d.buildLocaleItemCode !== d.buildLocaleItemCodePresent
    })
    // 现场检测设置 - 委托详情复用该方法时执行，获取现场检测设置
    if (isChangeLocale) {
      const isLocale = differs.some((d) => {
        return d.buildLocaleItemCodePresent > 0
      })

      if ((!isLocalTest && isLocale) || (!isLocale && isLocalTest)) {
        // 委托详情界面，需要修改委托类型（是否勾选现场检测，重构委托详情时再调整）
        if (isLocalTest !== undefined && isLocale) {
          isLocalTest = true
        }
        const str = isLocale ? '现场试验' : '原材料检测'
        msg.push(h('div', `将更新委托为${str}`))
      }
    }
    const changeObj: any = {}
    for (let i = 0; i < differs.length; i++) {
      const item = differs[i]
      const sampleName = item.objectName + (item.objectCode ? `(${item.objectCode})` : '')
      if (item.buildSampleCode !== item.buildSampleCodePresent && (item.buildSampleCode === 0 || item.buildSampleCodePresent === 0)) {
        // 样品编号设置
        const k = item.buildSampleCodePresent > 0 ? `生成${term('样品编号')}` : `释放${term('样品编号')}`

        if (!changeObj[k])
          changeObj[k] = ''

        changeObj[k] += changeObj[k] ? `,${sampleName}` : sampleName
      }
      if (item.generateProcessObject !== item.generateProcessObjectPresent && (item.generateProcessObject === 0 || item.generateProcessObjectPresent === 0)) {
        // 流转样品设置
        const k = item.generateProcessObjectPresent > 0 ? '支持入库' : '无法入库'

        if (!changeObj[k])
          changeObj[k] = ''

        changeObj[k] += changeObj[k] ? `,${sampleName}` : sampleName
      }
    }
    for (const k in changeObj) {
      msg.push(h('div', `【${changeObj[k]}】将${k}`))
    }
    if (msg.length > 0) {
      return h('div', { style: { color: 'red' } }, [
        h('span', { style: { color: '#111' } }, `检测到当前系统设置发生变化，选择更新后：`),
        msg,
      ])
    }
    return false
  }

  /**
   * ## 同步试验参数
   */
  async function syncTestParamSettings(policies: any[]) {
    try {
      const { data } = await syncTestParamSettingsApi({ consignIds: rowIds.value.toString(), policies })
      if (data.code === 22000) {
        message.success(`${term('试验参数')}设置同步成功`)
        return true
      }
      else {
        modalError(`${term('试验参数')}设置同步失败，请联系管理员`)
      }
    }
    catch (err) {
      console.error(err)
    }
  }

  /**
   * ## 是否重新生成编号(编号规则变更)
   */
  async function regenerateSn(row: { consignId: string, consignCode: string }) {
    const isOk = await modalConfirm(`委托编码${row.consignCode}与预期的规则不一致，是否重新生成？`, '', {
      okText: '重新生成',
      cancelText: '不重新生成',
    })
    if (isOk) {
      try {
        const { data } = await createConsignNoApi({ consignId: row.consignId })
        if (data.success)
          return data.obj as string
        else
          return Promise.reject(data)
      }
      catch (err) {
        return Promise.reject(err)
      }
    }
  }

  /** ## 检查编号规则 */
  async function checkSnRule(row: { consignId: string, consignCode: string }) {
    try {
      const { data } = await checkSnRuleApi({
        consignId: row.consignId,
        consignCode: row.consignCode ? encodeURIComponent(row.consignCode) : '',
      })
      if (data.success) {
        if (data.obj === false && !SN_AUTO_MATCH_MASK.value) {
          return await regenerateSn(row)
        }
      }
      else {
        return Promise.reject(data)
      }
    }
    catch (err) {
      console.error(err)
      return Promise.reject(err)
    }
  }

  async function handleCallback(callback?: (d?: any) => Promise<any>) {
    if (callback)
      await callback({ isLocalTest })
  }

  /** ## 确认试验参数设置 */
  async function testParamSettingConfirm(callback?: (d?: any) => Promise<any>) {
    try {
      // #25572 在生成样品编号和样品流转对象前，如果元数据中样品参数设置与系统参数设置不一致时，让用户决定是否要生成样品编号和样品流转对象
      const { data } = await checkParamDiffApi({ consignIds: rowIds.value.toString() })
      const differs = data || []
      if (differs.length === 0) {
        await handleCallback(callback)
        return
      }

      const msgVNode = checkChangeParams(differs)

      if (!msgVNode) {
        await handleCallback(callback)
        return
      }

      const type: number = await AnyDialogHelper.showModel(ConfirmTip, {
        msgVNode,
      })
      if (type === 2) {
        const policies = policyMapper(differs)
        const isSuccess = await syncTestParamSettings(policies)
        if (isSuccess) {
          await handleCallback(callback)
        }
      }
      else if (type === 1) {
        await handleCallback(callback)
      }
    }
    catch (e) {
      console.error(e)
    }
  }

  /**
   * ## 完成委托
   *
   */
  function completeConsign(param?: { expressions?: string }) {
    return new Promise((resolve, reject) => {
      sseRequestProgress.show({
        api: 'consignController.do?doCompleteById',
        method: 'postForm',
        data: {
          id: rowIds.value.toString(),
          expressions: param?.expressions,
        },
        onComplete: async (res) => {
          // 确定检测部门
          if (res && res.length > 0) {
            await AnyDialogHelper.showModel(ConfirmDepartment, {
              consignIds: rowIds.value,
            })
          }
          else {
            message.success('操作成功')
          }
          resolve(res)
        },
        onError: (err) => {
          console.error(err)
          modalError(err.message || '操作失败，请联系管理员')
          reject(err)
        },
      })
    })
  }

  return {
    checkSnRule,
    testParamSettingConfirm,
    completeConsign,
  }
}
