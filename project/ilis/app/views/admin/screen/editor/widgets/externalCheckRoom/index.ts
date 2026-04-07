import type { IWidget } from '~/interface/IWidget'
import { WidgetCategory, WidgetList } from '~/views/admin/screen/editor/widgets/index'

export default {
  name: '外检室',
  key: WidgetList.ExternalCheckRoom,
  category: WidgetCategory.FUNCTIONAL_ROOM,
  component: defineAsyncComponent(() => import('./Render.vue')),
} as IWidget
