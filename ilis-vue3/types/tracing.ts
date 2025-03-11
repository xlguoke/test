declare global {
  interface Window {
    captureException: (err: Error | unknown, metadata?: Metadata) => string
    IlisGpyPhotoFolder: string
    GetDrives: (...q: any) => void // 获取电脑驱动盘符，指定文件存放位置
    Cam_ControlInit: (...q: any) => void
    Cam_CombinePDF: (...q: any) => void
    Cam_GetDevResolution: (...q: any) => void
    Cam_SetFileType: (...q: any) => void
    Cam_Photo: (...q: any) => void
    Cam_AddImgFileToPDF: (...q: any) => void
    Cam_Open: (...q: any) => void
    Cam_SetColorMode: (...q: any) => void
    Cam_SetCutMode: (...q: any) => void
    SetCustomArea: (...q: any) => void
    Cam_RotateLeft: (...q: any) => void
    Cam_RotateRight: (...q: any) => void
    Cam_ZoomIn: (...q: any) => void
    Cam_ZoomOut: (...q: any) => void
    Cam_TrueSize: (...q: any) => void
    Cam_BestSize: (...q: any) => void
    DeleteFile: (...q: any) => void
    isSocketConnect: boolean
    openFlagA: number
    isOpenMainCamera: boolean
    MainCanvas: HTMLCanvasElement
    MainContext: CanvasRenderingContext2D
    pMainShowStartX: number
    pMainShowStartY: number
    isMouseDown: false
    pALastX: number
    pALastY: number
    pACurrentX: number
    pACurrentY: number
    MainCamCutMode: number
    releaseSocketPro: () => void
    CloseConnect: () => void
    toSleep: () => void
    WebSocketConnect: (q?: any) => void
    GPY_DEVCOUNT: number
    [key: string]: any
  }
}

export interface Metadata {
  username?: string
  user?: string
  company?: string
}

export interface Envelope {
  name: string | undefined
  message: string | undefined
  stack: string | undefined
  metadata?: Metadata
}
