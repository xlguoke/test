import { URLHelper } from './URLHelper'

/**
 * 是否在安卓环境访问
 * 说明：
 * 拥有可调用设备能力的功能（扫码）；
 */
export const InAndroid = URLHelper.getUrlParam('inAndroid') === '1'

/**
 * 是否被其他系统嵌入访问
 * 说明：
 * 1.目前已知被ilis app和设备屏嵌入；
 * 2.没有导航栏和登录控制逻辑，由嵌入的系统控制登录授权；
 */
export const InEmbed = URLHelper.getUrlParam('inEmbed') === '1'

/**
 * # 是否可以进行操作
 * 1. 被嵌入且作为展示系统时，不能进行操作
 * 2. 被嵌入且作为操作系统、或者安卓访问，可以进行操作
 */
export const CanOperate = (InEmbed && URLHelper.getUrlParam('readOnly') !== '1') || InAndroid || (!InAndroid && !InEmbed)
