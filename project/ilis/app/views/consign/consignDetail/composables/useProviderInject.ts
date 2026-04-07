import type { NormalConsignProcessor } from '../modules/consign-processor/NormalConsignProcessor'
import type { SynthesisConsignProcessor } from '../modules/consign-processor/SynthesisConsignProcessor'
import type { EventEmitter } from '~/utils/EventEmitter.ts'

const CONSIGN_PROCESSOR_KEY = 'consignProcessor'

const CONSIGN_EVENT_EMITTER_KEY = 'consignEventEmitter'

const CONSING_DETAIL_LOADING_KEY = 'consignDetailLoading'

const CONSIGN_SAVE_KEY = 'consignSave'

/**
 * 委托控制器 依赖/注入
 */
export function useConsignProcessorProvider(consignProcessor: NormalConsignProcessor | SynthesisConsignProcessor) {
  provide(CONSIGN_PROCESSOR_KEY, consignProcessor)
}

export function useConsignProcessor() {
  const consignProcessor = inject(CONSIGN_PROCESSOR_KEY) as NormalConsignProcessor | SynthesisConsignProcessor

  return { consignProcessor }
}

/**
 * 事件订阅/发布器 依赖/注入
 */
export function useConsignEventEmitterProvider(eventEmitter: EventEmitter) {
  provide(CONSIGN_EVENT_EMITTER_KEY, eventEmitter)
}

export function useConsignEventEmitter() {
  const consignEventEmitter = inject(CONSIGN_EVENT_EMITTER_KEY) as EventEmitter

  return { consignEventEmitter }
}

/** 委托详情加载状态 依赖/注入 */
export function useConsignDetailLoadingProvider(loading: Ref<boolean>) {
  provide(CONSING_DETAIL_LOADING_KEY, loading)
}

export function useConsignDetailLoading() {
  const loading = inject(CONSING_DETAIL_LOADING_KEY) as Ref<boolean>

  return { loading }
}

/** 保存委托 依赖/注入 */
export function useConsignSaveProvider(saveConsign: () => Promise<void>) {
  provide(CONSIGN_SAVE_KEY, saveConsign)
}

export function useConsignSave() {
  const saveConsign = inject(CONSIGN_SAVE_KEY) as (isComplete?: boolean, unReloadPage?: boolean) => Promise<void>

  return { saveConsign }
}
