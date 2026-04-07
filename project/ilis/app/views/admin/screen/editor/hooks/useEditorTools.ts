import type { IWidget } from '~/interface/IWidget'
import { useScreenEditorStore } from '~/store/screenEditorStore'

export function useEditorTools() {
  const { renderWidgets } = toRefs(useScreenEditorStore())

  /** # 撤销、重做 */
  const { undo, redo } = useRefHistory(markRaw(renderWidgets), {
    deep: true,
  })

  /** # 移除组件 */
  const remove = (widget: IWidget) => {
    renderWidgets.value = renderWidgets.value.filter(
      w => w.name !== widget.name,
    )
  }

  return {
    undo,
    redo,
    remove,
  }
}
