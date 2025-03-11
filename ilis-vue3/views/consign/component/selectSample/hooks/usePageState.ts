import { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'

/** 页面只读控制 */
export function usePageState() {
  /** 是否只读 */
  const readonly = ref(MainController.isDetailPage)

  /** 是否通知修改委托 */
  const isNoticeModifyConsign = ref(MainController.isNoticeModifyConsign)

  /** 是否创建综合试验页面 */
  const isCreateTestPage = ref(MainController.isCreateTestPage)

  /** placeholder控制 */
  const placeholder = function (text: string) {
    return readonly.value ? '' : text
  }

  return {
    readonly,
    isNoticeModifyConsign,
    isCreateTestPage,
    placeholder,
  }
}
