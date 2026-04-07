import type { Key } from 'ant-design-vue/es/vc-table/interface'
import type { IGoDetailConfig } from '../../consignDetail/interface'
import type { CopyFieldForm } from '../components/CopyConsignField.vue'
import type { ConsignListEntity } from '../ConsignListEntity'
import type { SignatureData } from '~/components/onlineSignature'
import type { ContractSelectorEntity } from '~/components/selectorViaMethodCall'
import { Checkbox, InputNumber, message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { SIGN_TYPE, SIGNATURE_SOURCE } from '~/components/onlineSignature'
import { ContractSelector } from '~/components/selectorViaMethodCall'
import sseRequestProgress from '~/components/sseRequestProgress'
import { useIndustryStore } from '~/store/industryStore'
import { openIlisTab } from '~/utils/openIlisTab'
import openHitekUdrTool from '~/utils/UDR'
import {
  batchCancelledApi,
  batchCopyConsignApi,
  changeContractApi,
  checkPermissionApi,
  deleteConsignApi,
  deleteConsignConfirmApi,
  recoverConsignApi,
  updateRemarkApi,
  withdrawConsignApi,
} from '../api'
import ConfirmTip from '../components/ConfirmTip.vue'
import CopyConsignField from '../components/CopyConsignField.vue'
import { CONSIGN_STATUS } from '../dict'
import { modalConfirm, modalError, opinionModal } from './modalUtil'
import { useCompleteConsign } from './useCompleteConsign'

/** 复制委托 */
interface CopyParam {
  /** 复制份数 */
  copyAmount: number
  /** 复制字段，逗号拼接 */
  checkedFields?: string[]
}

export function useHandler(rowIds: Ref<Key[]>, rows: Ref<ConsignListEntity[]>, getList: () => void) {
  const handleLoading = ref(false)
  /** 当前日期 */
  const nowDate = dayjs().format('YYYY-MM-DD')
  /** 委托详情路由 */
  const consignDetailRoute = 'consignController.do?goEdit'
  /** 控制参数：复制委托时是否选择字段信息 */
  let copyConsignChooseFields = false

  const { industryId, term } = useIndustryStore()
  /** 完成委托hooks */
  const { testParamSettingConfirm, checkSnRule, completeConsign } = useCompleteConsign(rowIds)

  onMounted(async () => {
    copyConsignChooseFields = await getBusinessParam('CONSIGN_WITH_COPY_OBJECT')
  })

  /**
   * 完成委托回调：原逻辑仅在委托列表批量完委托时执行该回调，委托详情执行另外的回调
   */
  async function completeCallback() {
    let flagNum = 0

    // 批量完成已有委托编号的委托时，检查编号规则
    for (let i = 0; i < rows.value.length; i++) {
      try {
        const row = rows.value[i]
        await checkSnRule({
          consignId: row.id,
          consignCode: row.consignCode || '',
        })
        flagNum++
      }
      catch (err) {
        console.error(err)
        break
      }
    }

    if (rows.value.length === flagNum) {
      try {
        await completeConsign()
      }
      finally {
        getList()
      }
    }
  }

  /** 验证已选委托状态 */
  function checkConsign() {
    /** 存在已完成的委托 */
    let isFinishConsign = false
    /** 全部为已完成的委托 */
    let revocationConsign = true
    /** 存在作废委托 */
    let hasDeprecate = false
    /** 全部为作废委托 */
    let allDeprecate = true
    /** 委托日期不一致 */
    let consignDateDiff = false

    for (let i = 0; i < rows.value.length; i++) {
      const r = rows.value[i]
      if (r.consignStatus === CONSIGN_STATUS.CANCEL) {
        hasDeprecate = true
      }
      else {
        allDeprecate = false
      }

      if (r.consignStatus === CONSIGN_STATUS.FINISH) {
        isFinishConsign = true
      }
      else {
        revocationConsign = false
      }

      // 委托日期
      const consignDate_ = dayjs(r.consignDate).format('YYYY-MM-DD')
      if (consignDate_ !== nowDate) {
        consignDateDiff = true
      }
    }
    return {
      /** 存在已完成的委托 */
      isFinishConsign,
      /** 全部为已完成的委托 */
      revocationConsign,
      /** 存在作废委托 */
      hasDeprecate,
      /** 全部为作废委托 */
      allDeprecate,
      /** 委托日期不一致 */
      consignDateDiff,
    }
  }

  /** 新增委托 */
  function handleAdd() {
    openIlisTab('新增委托', 'consignController.do?goEdit', true)
  }

  /** 跳转委托详情 */
  async function commonGoDetail(config: IGoDetailConfig) {
    const code = config.consignCode || ''
    const status = config.status || ''
    delete config.consignCode

    const params = new URLSearchParams(config as any)
    const url = `${consignDetailRoute}&${params}`
    let title = ''
    const join = code ? ' ' : ''
    if (config.detail) {
      title = `查看委托详情${join}${code}`
      openIlisTab(title, url, true)
      return
    }

    if (status === CONSIGN_STATUS.SAMPLE_RETURN) {
      title = `修改${term('样品')}信息${join}${code}`
    }
    else {
      title = `修改委托${join}${code}`
    }

    try {
      handleLoading.value = true
      const { data } = await checkPermissionApi(config.id)
      if (data.success) {
        openIlisTab(title, url, true)
      }
      else {
        modalError(data.msg || '打开委托详情失败，请联系管理员')
      }
    }
    catch (err) {
      console.error(err)
    }
    handleLoading.value = false
  }

  /** 查看详情 */
  function handleDetail(row: ConsignListEntity) {
    commonGoDetail({
      industryId,
      id: row.id,
      consignCode: row.consignCode,
      status: row.consignStatus,
      presetNumber: '1',
      detail: 'detailPage',
    })
  }

  /** 编辑 */
  function handleEdit(row: ConsignListEntity) {
    commonGoDetail({
      industryId,
      id: row.id,
      consignCode: row.consignCode,
      status: row.consignStatus,
      presetNumber: '1',
    })
  }

  /** 兼容jsp页面跳转详情 */
  function goDetail(id: string, consignCode: string, isDetail: boolean, _isCompleteTip: boolean, status: string, _needPrint?: string, checkBindElectronLabel?: '1') {
    const config: IGoDetailConfig = {
      industryId,
      id,
      status,
      consignCode,
      presetNumber: '1',
      detail: isDetail ? 'detailPage' : undefined,
      checkBindElectronLabel,
    }
    commonGoDetail(config)
  }

  /** 完成委托 */
  async function handleComplete() {
    if (rowIds.value.length === 0) {
      return message.warn('请选择要完成的委托！')
    }
    const { isFinishConsign, consignDateDiff } = checkConsign()

    if (isFinishConsign) {
      return message.warn('当前所选委托中，包含已完成委托，请重新选择！')
    }
    if (consignDateDiff) {
      const isOk = await modalConfirm('当前所选委托中,包含委托日期与当前日期不一致的委托，是否继续？', '日期冲突提醒')
      if (isOk) {
        handleLoading.value = true
        await testParamSettingConfirm(completeCallback)
        handleLoading.value = false
      }
      return
    }

    const isOk = await modalConfirm('确认完成委托？')
    if (isOk) {
      handleLoading.value = true
      await testParamSettingConfirm(completeCallback)
      handleLoading.value = false
    }
  }

  /** 复制委托： 保存 */
  async function copyConsignSave(param: CopyParam, referred?: boolean) {
    const saveData = {
      ids: rowIds.value.toString(),
      copyAmount: param.copyAmount,
      checkedFields: param.checkedFields ? param.checkedFields.join(',') : undefined,
      referred,
    }
    try {
      handleLoading.value = true
      await batchCopyConsignApi(saveData)
      message.success('复制成功')
      getList()
    }
    catch (err) {
      if ((err as Error).message.includes('所选委托中包含外来样品信息，请确认复制委托后对外来样品的处理方式')) {
        const okType: number = await AnyDialogHelper.showModel(ConfirmTip, {
          msgVNode: h('div', {}, [
            h('p', { style: { fontWeight: 'bold' } }, '所选委托中包含外来样品信息，请确认复制委托后对外来样品的处理方式：'),
            h('div', '引用：引用原委托的外来样品，此操作仅允许修改外来样品的掺量信息'),
            h('div', '新建：将为新委托创建与原委托同等数量的外来样品，此操作可修改所有外来样品信息'),
          ]),
          btnName: ['取消', '引用', '新建'],
        })

        if (okType !== 0)
          copyConsignSave(param, okType === 1)
      }
    }
    handleLoading.value = false
  }

  /** 复制委托：设置复制委托的字段 */
  async function copyConsignFieldHandle() {
    const param: CopyFieldForm = await AnyDialogHelper.showModel(CopyConsignField, {
      consignIds: rowIds.value,
    })
    copyConsignSave(param)
  }

  /** 复制委托：设置复制份数 */
  function copyConsignNumHandle() {
    let copyAmount = 1
    Modal.confirm({
      title: '确认复制委托？',
      content: h('div', { style: { padding: '20px 0' } }, [
        h('p', { style: { marginBottom: '4px' } }, [
          h('span', { style: { color: 'red', marginRight: '4px' } }, '*'),
          '复制份数：',
        ]),
        h(InputNumber, {
          controls: false,
          placeholder: '请输入复制份数',
          style: { width: '100%' },
          defaultValue: copyAmount,
          onChange: (e: any) => {
            copyAmount = e || 1
          },
        }),
      ]),
      okText: '确定',
      cancelText: '取消',
      centered: true,
      async onOk() {
        if (!copyAmount) {
          message.warn('请输入复制份数')
          return Promise.reject(new Error('请输入复制份数'))
        }
        copyConsignSave({
          copyAmount,
        })
      },
    })
  }

  /** 复制委托 */
  async function handleCopy() {
    if (rowIds.value.length === 0) {
      return message.warn('请选择要复制的委托！')
    }
    if (rows.value.find(d => d.taskSource === '2')) {
      const isOk = await modalConfirm('你正在复制的是综合检测任务，完成委托时检测人员将默认为当前登录人员，是否继续？')
      if (!isOk)
        return

      if (copyConsignChooseFields) {
        copyConsignFieldHandle()
        return
      }

      copyConsignNumHandle()
      return
    }

    if (copyConsignChooseFields) {
      copyConsignFieldHandle()
      return
    }

    copyConsignNumHandle()
  }

  /** 作废/恢复委托 api */
  async function cancelledOrRecover(type: number) {
    if (rowIds.value.length === 0) {
      return message.warn(`请选择要作废/恢复的委托！`)
    }

    try {
      const title = type === 1 ? '恢复委托' : '作废委托'

      // 作废预委托数据，提供释放编号功能
      const vNode: VNode[] = []
      let releaseSn = false
      if (type === 2) {
        vNode.push(h(Checkbox, {
          style: { marginTop: '8px' },
          onChange: (e: any) => {
            releaseSn = e.target.checked
          },
        }, '释放所有编号'))
      }
      const comment = await opinionModal(title, vNode)
      if (!comment)
        return

      const param = {
        ids: rowIds.value.toString(),
        comment,
        releaseSn,
      }
      if (type === 1) {
      // 恢复委托
        await recoverConsignApi(param)
      }
      else if (type === 2) {
      // 作废委托
        await batchCancelledApi(param)
      }
      message.success('操作成功')
      getList()
    }
    catch (err) {
      console.error(err)
    }
  }

  /** 作废/恢复委托 */
  function handleVoid() {
    const { hasDeprecate, allDeprecate } = checkConsign()
    if (allDeprecate) {
      // 状态为已删除，执行恢复操作
      cancelledOrRecover(1)
    }
    else if (!hasDeprecate) {
      // 状态为未删除，执行作废操作
      cancelledOrRecover(2)
    }
    else {
      message.warn('请选择均作废或均未作废的委托！')
    }
  }

  /** 撤回委托 */
  async function handleWithdraw() {
    if (rowIds.value.length === 0) {
      return message.warn(`请选择要撤回的委托！`)
    }

    const { revocationConsign } = checkConsign()
    if (!revocationConsign) {
      return message.warn('请选择状态为已完成的委托！')
    }
    const comment = await opinionModal('确认撤回委托？')

    if (!comment)
      return

    try {
      handleLoading.value = true
      await withdrawConsignApi({
        ids: rowIds.value.toString(),
        reason: comment,
      })
      message.success('撤回成功')
      getList()
    }
    catch (err) {
      console.error(err)
    }
    handleLoading.value = false
  }

  /** 删除委托确认 */
  async function deleteConsignConfirm(): Promise<boolean> {
    try {
      handleLoading.value = true
      const { data } = await deleteConsignConfirmApi({
        ids: rowIds.value.toString(),
      })

      handleLoading.value = false
      if (!data.danger)
        return true

      if (data.presetConsigns) {
        const content = h('ul', [
          '以下委托属于预委托，只允许作废，不允许直接删除：',
          data.presetConsigns.map(d => h('li', d)),
        ])
        modalError(content)
        return false
      }

      if (data.backConsigns) {
        const content = h('ul', [
          '以下委托状态不允许直接删除，请撤销委托后再进行删除操作：',
          data.backConsigns.map(d => h('li', d)),
        ])
        modalError(content)
        return false
      }

      let content: any = null
      if (data.subcontracts) {
        content = h('ul', [
          '当前委托已经分配过分包任务',
          h('li', '删除委托将会同时删除已经分配的分包任务'),
        ])
      }
      else {
        const tasks = data.tasks ? data.tasks.map(d => h('li', d)) : []
        if (data.reports)
          tasks.push(h('li', '以及以下检测报告：'), ...data.reports.map(d => h('li', d)))

        content = h('ul', {}, [
          '当前委托已经分配过检测任务',
          h('li', '删除委托将会同时删除以下检测任务：'),
          ...tasks,
        ])
      }
      return await modalConfirm(content, '委托删除确认？')
    }
    catch (err) {
      console.error(err)
      handleLoading.value = false
      return false
    }
  }

  /** 删除委托 */
  async function handleDelete() {
    if (rowIds.value.length === 0) {
      return message.warn(`请选择要删除的委托！`)
    }

    const isOk = await modalConfirm('删除后的委托，将无法恢复。请谨慎操作，是否继续？', '确认删除委托？')
    if (!isOk)
      return
    try {
      const ok = await deleteConsignConfirm()
      if (!ok)
        return

      handleLoading.value = true
      await deleteConsignApi({
        ids: rowIds.value.toString(),
      })
      message.success('删除成功')
      getList()
    }
    catch (err) {
      console.error(err)
    }
    handleLoading.value = false
  }

  /** 导出 */
  function handleExport(key: string, query: Record<string, any>) {
    const { industryId } = useIndustryStore()
    // 批量导出委托单
    if (key === 'consignBill') {
      if (rows.value.length === 0)
        return message.warn('请选择需要导出委托单的委托！')
      const { revocationConsign } = checkConsign()
      if (!revocationConsign)
        return message.warn('请选择状态为已完成的委托！')
      sseRequestProgress.show({
        api: 'rest/consign/batch-download-order',
        method: 'post',
        data: rowIds.value,
        onComplete(res) {
          if (res) {
            window.open(res, '_blank')
          }
          else {
            modalError('导出失败：未获取到导出资源')
          }
        },
      })
    }
    // 导出委托/样品台帐
    else {
      const isObject = key === 'sampleLedger'
      const q: Record<string, any> = { ...query, isObject }
      const queryStr = new URLSearchParams(q)
      window.open(`/ilis2/rest/consign/ledger?${queryStr}&industryId=${industryId}`, '_blank')
    }
  }

  /** 变更合同 */
  async function handleChangeContract() {
    if (rowIds.value.length === 0) {
      message.warn('请选择要变更合同的委托！')
      return
    }
    try {
      const rows: ContractSelectorEntity[] = await AnyDialogHelper.showSelector(ContractSelector, {
        payload: {
          feeType: 1,
          status: 1,
        },
      })
      handleLoading.value = true
      await changeContractApi({
        contractId: rows[0].id,
        consignInfoIds: rowIds.value as string[],
      })
      message.success('修改成功')
    }
    catch (err) {
      console.error(err)
    }
    handleLoading.value = false
  }

  const onlineSginatureRef = ref()
  /** 委托方签字 */
  function handleSign() {
    if (rowIds.value.length === 0) {
      return message.warn('请选择要签字的委托！')
    }
    const { revocationConsign } = checkConsign()
    if (!revocationConsign) {
      message.warn('请选择状态为已完成的委托！')
      return
    }

    onlineSginatureRef.value.openModal({
      title: '委托方签字',
      dataId: rowIds.value.toString(),
      source: SIGNATURE_SOURCE.CONSIGN,
    })
  }
  /** 委托方签字回调 */
  async function handleSignCallback(data: SignatureData) {
    if (data.signType !== SIGN_TYPE.HAND_WRITE)
      return
    const user = data.users[0]
    const datas = []
    const identityArr = user.identity.split(',')
    for (let i = 0; i < rows.value.length; i++) {
      const row = rows.value[i]
      for (let j = 0; j < identityArr.length; j++) {
        const item = identityArr[j]
        datas.push({
          consignId: row.id,
          consignUnitId: row.consignUnitId,
          consignProjectId: row.consignProjectId,
          identity: item, // 签字类型（CONSIGN-委托人,SUPERVISING-监理单位见证人,BUILD-建设单位见证人）
        })
      }
    }
    const key = await setServerCacheData({
      datas,
      signUser: user.name, // 签字人姓名
      signPhone: user.phone, // 签字人电话
    })
    openHitekUdrTool(`${location.origin}/ilis2/consignController.do?goSignPage&cacheId=${key}`, 'max')
  }

  /** 更新备注 */
  async function handleSaveRemark(row: ConsignListEntity, remark: string) {
    if (remark === row.remark)
      return

    try {
      handleLoading.value = true
      await updateRemarkApi({ id: row.id, remark })
      row.remark = remark
      message.success('更新成功')
    }
    catch (err) {
      console.error(err)
    }
    handleLoading.value = false
  }

  /** 重新生成委托单 */
  async function handleCreateConsignBill() {
    if (rowIds.value.length === 0) {
      return message.warn('请选择要重新生成委托单的委托！')
    }

    const { revocationConsign } = checkConsign()
    if (!revocationConsign) {
      return message.warn('请选择状态为已完成的委托！')
    }

    sseRequestProgress.show({
      api: 'rest/consign/regenerate-order',
      method: 'post',
      data: rowIds.value,
      onComplete(res) {
        if (!res) {
          message.success('委托单正在重新生成，如果本次选择的委托单较多，可能需要的时间会显得稍长，请耐心等待。', 5)
        }
        else {
          modalError('重新生成失败，请联系管理员进行处理')
        }
      },
    })
  }

  return {
    handleLoading,
    onlineSginatureRef,
    goDetail,
    goConsignDetail: commonGoDetail,
    handleAdd,
    handleDetail,
    handleEdit,
    handleComplete,
    handleCopy,
    handleVoid,
    handleWithdraw,
    handleDelete,
    handleExport,
    handleChangeContract,
    handleSign,
    handleSignCallback,
    handleSaveRemark,
    handleCreateConsignBill,
  }
}
