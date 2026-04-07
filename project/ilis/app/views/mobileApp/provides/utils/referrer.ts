import { URLHelper } from './URLHelper'

/**
 * 是否在安卓环境访问
 * 说明：
 * 1.目前通过Hbuilder打包，可调用其提供的安卓接口；
 */
export const InAndroid = URLHelper.getUrlParam('inAndroid') === '1' || URLHelper.getUrlParam('isIlisApp') === '1'

/**
 * 是否在微信小程序环境访问
 * 说明：
 * 1.可调用微信小程序对web-view开发的相关接口；
 * 2.根据该参数控制微信小程序下的样式（同上微信网页环境）；
 */
export const InMiniProgram = URLHelper.getUrlParam('inMiniProgram') === '1'

/**
 * 是否在微信网页环境访问
 * 说明：
 * 1.根据该参数控制微信小程序下的样式；
 * 注：
 * 1.小程序环境下的网页访问会被认为是微信网页环境；
 */
const ua = navigator.userAgent.toLowerCase()
export const InWeChatWeb = ua.includes('micromessenger') && !InMiniProgram
