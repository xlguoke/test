import type { CustomMarkDTO } from '~/api/common'
import type { CustomMarkManagePage } from '~/components/ilisComponent'
import type { ICustomMark } from '~/interface/ICustomMark'
import type { IUseCustomMarkConfig } from '~/interface/IUseCustomMarkConfig'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { addCustomMark, cancelCustomMark, getCustomMarks } from '~/api/common'
import IlisCustomMarkModal from '~/components/ilisComponent/IlisCustomMarkModal.vue'

/** # 自定义标记Hooks */
export function useCustomMark(config: IUseCustomMarkConfig) {
  /** # 自定义标记列表（某个模块下的所有自定义标记） */
  const markListAll = ref<ICustomMark[]>([])

  /** # 可使用的自定义标记列表（根据范围过滤） */
  const canUseMarkList = computed(() => {
    return markListAll.value.filter(i => i.markRange?.includes(config.range))
  })

  /** # 按模块类型获取所有自定义标记 */
  async function getMarksByType(type: CustomMarkManagePage) {
    const { data } = await getCustomMarks(type)
    markListAll.value = data.obj
  }

  getMarksByType(config.module)

  /** # 创建自定义标记DTO列表 */
  function createDTOList(ids: string[], marks: ICustomMark[]) {
    return ids?.map((i) => {
      return marks?.map((j) => {
        return {
          objectId: i,
          markType: config.markType,
          markObjectColorTextId: j.id,
        }
      })
    }).flat()
  }

  /**
   * # 标记
   * @param ids 选中的对象id列表
   * @param checkedMarkIds 已选中的自定义标记id列表（仅在选中单个业务对象时回显）
   */
  async function handleMark(ids: string[], checkedMarkIds?: string[]) {
    if (!ids?.length) {
      message.warning('请选择要标记的数据')
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject()
    }
    const usedMarks = await AnyDialogHelper.showModel(IlisCustomMarkModal, {
      title: '标记',
      markList: canUseMarkList.value,
      ...(ids?.length === 1 ? { checkedMarkIds } : {}),
    }) as ICustomMark[]
    const form: CustomMarkDTO[] = createDTOList(ids, usedMarks)
    await addCustomMark(form)
    message.success('标记成功')
  }

  /**
   * # 取消标记
   * @param ids 选中的对象id列表
   */
  async function handleCancelMark(ids: string[]) {
    if (!ids?.length) {
      message.warning('请选择要标记的数据')
      return
    }
    const cancelMarks = await AnyDialogHelper.showModel(IlisCustomMarkModal, {
      title: '取消标记',
      markList: canUseMarkList.value,
    }) as ICustomMark[]
    const form: CustomMarkDTO[] = createDTOList(ids, cancelMarks)
    await cancelCustomMark(form)
    message.success('取消标记成功')
  }

  return {
    canUseMarkList,
    handleMark,
    handleCancelMark,
  }
}
