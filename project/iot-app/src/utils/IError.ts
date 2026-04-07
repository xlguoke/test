export interface IErrorEntity {
  message: string
}

export class IError extends Error {
  constructor(opts: IErrorEntity) {
    super(opts.message)

    showDialog({
      title: '提示',
      message: opts.message,
    })
  }
}
