import type { IWidget } from '~/interface/IWidget'
import { WidgetCategory, WidgetList } from '~/views/admin/screen/editor/widgets/index'

export default {
  name: '试验任务',
  key: WidgetList.Task,
  category: WidgetCategory.FUNCTIONAL_ROOM,
  component: defineAsyncComponent(() => import('./Render.vue')),
} as IWidget
