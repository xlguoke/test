import type { GlobalToken } from 'ant-design-vue/es/theme'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { Group } from '~/anyThing/decorator/Group'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { AnyBaseModel } from '~/anyThing/model/AnyBaseModel'

type IThemeSetting = Pick<
  GlobalToken,
  'colorPrimary'
  | 'fontSize'
  | 'borderRadius'
>

/** # 主题模式 */
export enum EThemeMode {
  /** # 亮色主题 */
  LIGHT = 'light',
  /** # 暗色主题 */
  DARK = 'dark',
}

/** # 主题模式字典 */
export const ThemeModeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '亮色', key: EThemeMode.LIGHT },
  { label: '暗色', key: EThemeMode.DARK },
])

/** # 布局模式 */
export enum ELayoutMode {
  /** # 普通布局 */
  NORMAL = 'normal',
  /** # 紧凑布局 */
  COMPACT = 'compact',
}

/** # 布局模式字典 */
export const LayoutModeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '普通', key: ELayoutMode.NORMAL },
  { label: '紧凑', key: ELayoutMode.COMPACT },
])

/** # 菜单布局模式 */
export enum EMenuLayoutMode {
  /** # 垂直菜单 */
  VERTICAL = 'vertical',
  /** # 双列菜单 */
  VERTICAL_DOUBLE = 'vertical_double',
  /** # 水平菜单 */
  HORIZONTAL = 'horizontal',
  /** # 混合菜单 */
  HORIZONTAL_VERTICAL = 'horizontal_vertical',
  /** # 混合双列菜单 */
  HORIZONTAL_VERTICAL_DOUBLE = 'horizontal_vertical_double',
}

/** # 菜单布局模式字典 */
export const MenuLayoutModeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '垂直菜单', key: EMenuLayoutMode.VERTICAL },
  { label: '水平菜单', key: EMenuLayoutMode.HORIZONTAL },
  { label: '混合菜单', key: EMenuLayoutMode.HORIZONTAL_VERTICAL },
  { label: '双列菜单', key: EMenuLayoutMode.VERTICAL_DOUBLE },
  { label: '混合双列菜单', key: EMenuLayoutMode.HORIZONTAL_VERTICAL_DOUBLE },
])

/** # 菜单显示模式枚举 */
export enum EMenuDisplayMode {
  /** # 内嵌 */
  INSET = 'inset',
  /** # 悬浮 */
  FLOAT = 'float',
}

/** # 菜单显示模式字典 */
export const MenuDisplayModeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '内嵌', key: EMenuDisplayMode.INSET },
  { label: '悬浮', key: EMenuDisplayMode.FLOAT },
])

/** # 主题设置实体 ⚙️ */
@Group([
  { name: '主题预设', fieldList: ['preset'] },
  { name: '主题模式', fieldList: ['mode'] },
  { name: '布局模式', fieldList: ['layoutMode', 'menuDisplayMode', 'menuLayoutMode'] },
  { name: '基础设置', fieldList: ['colorPrimary', 'fontSize', 'borderRadius'] },
])
export class ThemeSettingEntity extends AnyBaseModel implements IThemeSetting {
  // 自行渲染
  @FormField()
  @CustomField('主题预设')
  preset!: string

  @FormField({
    formType: EFormItemType.RADIO,
    attributes: { optionType: 'button' },
  })
  @CustomField('菜单布局', MenuLayoutModeDict)
  menuLayoutMode: EMenuLayoutMode = EMenuLayoutMode.HORIZONTAL_VERTICAL

  @FormField({
    formType: EFormItemType.RADIO,
    attributes: { optionType: 'button' },
  })
  @CustomField('菜单显示', MenuDisplayModeDict)
  menuDisplayMode: EMenuDisplayMode = EMenuDisplayMode.INSET

  @FormField({
    formType: EFormItemType.RADIO,
    attributes: { optionType: 'button' },
    disabled: import.meta.env.PROD,
  })
  @CustomField('主题模式', ThemeModeDict)
  mode: EThemeMode = EThemeMode.LIGHT

  @FormField({
    formType: EFormItemType.RADIO,
    attributes: { optionType: 'button' },
  })
  @CustomField('布局模式', LayoutModeDict)
  layoutMode: ELayoutMode = ELayoutMode.NORMAL

  @FormField({ formType: EFormItemType.COLOR_PICKER })
  @CustomField('主题色')
  colorPrimary: string = '#0066ec'

  @CustomField('成功色')
  colorSuccess: string = '#24B276'

  @CustomField('警告色')
  colorWarning: string = '#FF9A2E'

  @CustomField('错误色')
  colorError: string = '#ff6666'

  @CustomField('信息色')
  colorInfo: string = '#035acc'

  @CustomField('背景色')
  colorBgBase?: string

  @CustomField('文字色')
  colorTextBase?: string

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
    attributes: {
      min: 12,
      max: 24,
    },
  })
  @CustomField('字体大小')
  fontSize: number = 14

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
    attributes: {
      min: 0,
      max: 24,
    },
  })
  @CustomField('圆角半径')
  borderRadius: number = 4
}
