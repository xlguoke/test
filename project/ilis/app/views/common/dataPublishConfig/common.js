export const PROVIDERS = {
  CONSIGN: 'ConsignProvider',
  SAMPLE: 'SampleProvider',
  FEE: 'FeeProvider',
  TASK: 'TaskProvider',
  REPORT: 'ReportProvider',
}

export default {
  methods: {
    async getRawParams(isOperation) {
      return window.$oAjax.get('/rest/publish-config/operation-properties', {
        params: { isOperation },
      })
    },
    update(id, explains, value, type) {
      return window.$oAjax({
        url: `/rest/publish-config/property/${type}`,
        method: 'PUT',
        data: {
          id,
          explains,
          value,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })
    },
  },
}
