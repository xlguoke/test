import { Modal } from 'ant-design-vue'
import canDragModal from './drag'

export default {
  name: 'HitekModal',
  mixins: [Modal],
  data() {
    return {
      _dragEvent: null,
    }
  },
  mounted() {
    // eslint-disable-next-line new-cap
    this._dragEvent = new canDragModal()
  },
  watch: {
    sVisible(newVal) {
      if (newVal === true) {
        this._dragEvent.init()
      }
      else {
        this._dragEvent.reset()
        this._dragEvent.destroyEvent()
      }
    },
  },
}
