import type { IGroupConfig } from '../interface/IGroupConfig'
import type { AnyBaseModel } from '../model/AnyBaseModel'
import { AnyDecoratorHelper } from '../helper/AnyDecoratorHelper'

export const GROUP_PROPERTY_KEY = 'Group'

/**
 * # 字段分组配置类装饰器
 * @param config 字段配置
 */
export function Group<T extends AnyBaseModel>(config?: IGroupConfig<T>[]) {
  return function (target: new (...args: any[]) => T) {
    AnyDecoratorHelper.setClassConfig(target, GROUP_PROPERTY_KEY, config)
  }
}

/**
 * # 获取Group装饰器配置对象
 * @param target
 */
export function getGroupConfigObj(target: any) {
  return AnyDecoratorHelper.getClassConfig(target, GROUP_PROPERTY_KEY)
}
