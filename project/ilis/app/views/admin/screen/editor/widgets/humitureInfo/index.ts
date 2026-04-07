import type { IWidget } from '~/interface/IWidget'
import { WidgetCategory, WidgetList } from '~/views/admin/screen/editor/widgets/index'

export default {
  name: '温湿度信息',
  key: WidgetList.HumitureInfo,
  category: WidgetCategory.COMMON,
  component: defineAsyncComponent(() => import('./Render.vue')),
  thumbnailComponent: defineAsyncComponent(() => import('./Thumbnail.vue')),
} as IWidget
