import type { IWidget } from '~/interface/IWidget'
import { WidgetCategory, WidgetList } from '~/views/admin/screen/editor/widgets/index'

export default {
  name: '留样室',
  key: WidgetList.SampleStorageRoom,
  category: WidgetCategory.FUNCTIONAL_ROOM,
  component: defineAsyncComponent(() => import('./Render.vue')),
} as IWidget
