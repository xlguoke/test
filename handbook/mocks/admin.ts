import { HttpResponse, http } from 'msw'

const instances: { [code: string]: any } = {
  foo: {
    name: 'A valid instance',
    code: 'foo',
    server: {
      name: 'valid instance',
      addr: 'https://pro.ilis.cn',
    },
  },
  bar: {
    name: 'An invalid instance',
    code: 'bar',
    server: {
      name: 'invalid instance',
      addr: 'url',
    },
  },
}

export default [
  http.get(`*/api/instances/:code`, ({ params }) => {
    const { code } = params
    return typeof code === 'string' && code in instances
      ? HttpResponse.json(instances[code])
      : HttpResponse.json({
        message: 'Client Not Found',
      }, {
        status: 404,
      })
  }),
  http.get('*/api/instances', () => HttpResponse.json({ message: 'Not Found' }, { status: 404 })),
]
