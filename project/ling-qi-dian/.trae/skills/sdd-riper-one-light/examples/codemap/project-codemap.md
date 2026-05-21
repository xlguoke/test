# 🗺️ 推多奖 (tuiduo-mobile-vue) 代码地图

## 项目概览

**推多奖** 是一个基于 **Vue 3 + TypeScript** 的移动端 H5 应用，主要面向微信浏览器环境运行，是一个**贷款产品分销/推广平台**。用户（经纪人）可以推广贷款产品、管理团队、查看订单和佣金提现。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3.4 + TypeScript 5.2 |
| 构建 | Vite 5.3 |
| 路由 | vue-router 4 + **unplugin-vue-router**（基于文件系统的路由） |
| 状态管理 | Pinia 2 + pinia-plugin-persistedstate（持久化） |
| UI 库 | Vant 4（移动端） |
| CSS | UnoCSS 0.61 + Less |
| HTTP | @vueuse/core createFetch（封装为 useMyFetch） |
| 工具 | @vueuse/core, html2canvas, qrcode, sm-crypto（国密加密） |
| Mock | MSW (Mock Service Worker) |
| 测试 | Vitest + @vue/test-utils |
| 代码规范 | ESLint (@antfu/eslint-config) + Husky + lint-staged |

---

## 架构总览

```
src/
├── main.ts              # 应用入口：Pinia + Router + Head + Directive + Mock
├── App.vue              # 根组件：TabBar 布局 + KeepAlive 缓存
├── router.ts            # 路由守卫：微信环境检测 + 登录鉴权
│
├── api/                 # API 接口层（按业务域划分）
├── assets/              # 静态资源（图片、海报模板、样式）
├── components/          # 全局通用组件
├── composables/         # 组合式函数（业务逻辑复用）
├── directive/           # 自定义指令
├── mock/                # MSW Mock 数据
├── pages/               # 页面组件（文件系统路由）
├── stores/              # Pinia 状态仓库
├── types/               # TypeScript 类型定义
└── utils/               # 工具函数
```

---

## 📄 页面路由地图（文件系统路由）

路由由 `unplugin-vue-router` 自动生成，`pages/` 目录结构即路由结构：

### TabBar 主页面（5个）

| 路由路径 | 页面文件 | 组件名 | 功能 |
|----------|---------|--------|------|
| `/home` | `pages/home/index.vue` | `Home` | 首页：公告、推荐产品、分享入口 |
| `/product` | `pages/product/index.vue` | `Product` | 产品列表：区域/类型筛选 |
| `/team` | `pages/team/index.vue` | `MyTeam` | 我的团队：成员列表与统计 |
| `/order` | `pages/order/index.vue` | `Order` | 订单列表：筛选、统计、分享 |
| `/my` | `pages/my/index.vue` | `My` | 个人中心：佣金、设置入口 |

### 认证页面

| 路径 | 文件 | 功能 |
|------|------|------|
| `/login` | `pages/login.vue` | 登录（微信授权 + 手机号密码） |
| `/register` | `pages/register.vue` | 注册 |
| `/forget-password` | `pages/forget-password.vue` | 忘记密码 |
| `/reset-password` | `pages/reset-password.vue` | 重置密码 |
| `/user-agreement` | `pages/user-agreement.vue` | 用户协议 |

### 子页面 - Home

| 路径 | 文件 | 功能 |
|------|------|------|
| `/home/notice-detail` | `pages/home/notice-detail.vue` | 公告详情 |
| `/home/share-register` | `pages/home/share-register.vue` | 分享注册码 |

### 子页面 - Product

| 路径 | 文件 | 功能 |
|------|------|------|
| `/product/:id` | `pages/product/[id].vue` | 产品详情 |
| `/product/qr/:id` | `pages/product/qr/[id].vue` | 产品二维码海报 |

### 子页面 - Order

| 路径 | 文件 | 功能 |
|------|------|------|
| `/order/:id` | `pages/order/[id].vue` | 订单详情 |

### 子页面 - My

| 路径 | 文件 | 功能 |
|------|------|------|
| `/my/about` | `pages/my/about/index.vue` | 关于 |
| `/my/calculator` | `pages/my/calculator/index.vue` | 贷款计算器 |
| `/my/calculator/detail` | `pages/my/calculator/detail.vue` | 计算器详情 |
| `/my/income` | `pages/my/income/index.vue` | 佣金收入 |
| `/my/income/BrokerageList` | `pages/my/income/BrokerageList.vue` | 佣金明细 |
| `/my/income/WithdrawList` | `pages/my/income/WithdrawList.vue` | 提现记录 |
| `/my/service` | `pages/my/service/index.vue` | 客服 |
| `/my/setting` | `pages/my/setting/index.vue` | 设置 |
| `/my/setting/person-info` | `pages/my/setting/person-info.vue` | 个人信息 |
| `/my/setting/edit-mobile` | `pages/my/setting/edit-mobile.vue` | 修改手机号 |
| `/my/setting/edit-password` | `pages/my/setting/edit-password.vue` | 修改密码 |
| `/my/setting/valid-mobile/:pageName` | `pages/my/setting/valid-mobile/[pageName].vue` | 手机验证 |
| `/my/withdraw` | `pages/my/withdraw/index.vue` | 提现申请 |
| `/my/withdraw/real-name-auth` | `pages/my/withdraw/real-name-auth.vue` | 实名认证 |
| `/my/withdraw/service-charge` | `pages/my/withdraw/service-charge.vue` | 手续费说明 |
| `/my/withdraw/sign-valid` | `pages/my/withdraw/sign-valid.vue` | 签约验证 |

### 分享页面

| 路径 | 文件 | 功能 |
|------|------|------|
| `/share/apply-product` | `pages/share/apply-product.vue` | 申请产品分享页 |
| `/share/legion-commander` | `pages/share/legion-commander.vue` | 军团长分享页 |
| `/share/poster` | `pages/share/poster.vue` | 海报分享页 |
| `/share/user-register` | `pages/share/user-register.vue` | 用户注册分享页 |

### 其他

| 路径 | 文件 | 功能 |
|------|------|------|
| `/not-wxpage` | `pages/not-wxpage.vue` | 非微信浏览器提示页 |
| `/video` | `pages/video.vue` | 视频页 |

---

## 🔌 API 层

所有 API 基于 `composables/useMyFetch.ts` 封装（底层为 `@vueuse/core` 的 `createFetch`），统一处理：
- **请求拦截**：自动注入 `authorization` token 和 `tenant-id`
- **GET 参数**：自动序列化 `params` 到 URL
- **响应拦截**：`code === 0` 为成功，否则 reject
- **错误处理**：401 自动登出跳转，其他错误弹窗提示

### API 模块

| 模块 | 文件 | 核心接口 |
|------|------|---------|
| **登录认证** | `api/login.api.ts` | `loginApi`, `logoutApi`, `registerApi`, `getUserInfoApi`, `getWxAuthInfoApi`, `getWxOpenidApi`, `getSmsCodeApi`, `updateUserApi`, `updateMobileApi`, `updatePasswordApi`, `resetPasswordApi`, `uploadFileApi` |
| **公共** | `api/common.api.ts` | `getDictByType`, `getNoticeListApi`, `getNoticeDetailApi` |
| **产品** | `api/product.api.ts` | `pageListApi`, `detailsApi`, `shareLinkApi`, `submitBookedApi`, `areaTreeApi` |
| **订单** | `api/order.api.ts` | `pageListApi`, `detailsApi`, `orderSummaryApi` |
| **团队/佣金** | `api/team.api.ts` | `getTeamListApi`, `getBrokerageSummaryApi`, `withdrawApi`, `signContractApi`, `userSignApi`, `verifyRealNameApi`, `withdrawRecordApi`, `brokerageDetailApi`, `confirmReceiveApi`, `getWithdrawDetailApi`, `getLastWithdrawApi` |

---

## 🏪 状态管理（Pinia Stores）

| Store | 文件 | 状态 | 说明 |
|-------|------|------|------|
| **permissions** | `stores/permissions.ts` | `authorization`（token/过期时间）, `userInfo`, `loginPath` | 登录鉴权核心，持久化存储。提供 `isLogin()`, `getUserInfo()`, `logout()` |
| **commonData** | `stores/commonData.ts` | `productTypes` | 公共字典数据缓存，如车辆性质 |

---

## 🧩 组合式函数（Composables）

| Composable | 文件 | 功能 |
|------------|------|------|
| **useMyFetch** | `composables/useMyFetch.ts` | HTTP 请求封装，基于 `createFetch`，统一鉴权/错误处理 |
| **useDatas** | `composables/useDatas.ts` | 分页数据加载通用逻辑：`onLoad`（加载更多）、`onRefresh`（下拉刷新）、`onChange`（选择变更） |
| **useShareQr** | `composables/useShareQr.ts` | 生成分享注册二维码（含邀请码） |
| **useSmsCode** | `composables/useSmsCode.ts` | 短信验证码发送 + 60s 倒计时 |
| **useHtmlToImg** | `composables/useHtmlToImg.ts` | DOM 转图片（html2canvas），用于海报生成 |

---

## 🧱 全局组件

| 组件 | 文件 | 功能 |
|------|------|------|
| **DataList** | `components/DataList.vue` | 通用分页列表：下拉刷新 + 无限加载 + 多选 + 左滑 |
| **Footer** | `components/Footer.vue` | 页脚：公司名 + 备案号 |
| **Password** | `components/Password.vue` | 密码输入框（带显隐切换） |
| **DatePicker** | `components/DatePicker.vue` | 日期选择器 |
| **ContractAgreement** | `components/ContractAgreement.vue` | 合同协议 |
| **IconCopy** | `components/icons/IconCopy.vue` | 复制图标 |
| **IconMoney** | `components/icons/IconMoney.vue` | 金额图标 |
| **IconQr** | `components/icons/IconQr.vue` | 二维码图标 |

### 页面级组件（pages/components/）

| 组件 | 文件 | 功能 |
|------|------|------|
| **Product** | `pages/components/Product.vue` | 产品卡片（列表项） |
| **QuickEntry** | `pages/components/QuickEntry.vue` | 快捷入口（我的页面） |
| **UserIntro** | `pages/components/UserIntro.vue` | 用户信息展示 |
| **UserAggrement** | `pages/components/UserAggrement.vue` | 用户协议勾选 |
| **AddCard** | `pages/components/AddCard.vue` | 添加银行卡 |
| **SetPassword** | `pages/components/SetPassword.vue` | 设置密码 |
| **ValidMobile** | `pages/components/ValidMobile.vue` | 手机验证 |
| **MergeQrcodeImg** | `pages/components/MergeQrcodeImg.vue` | 合并二维码到海报 |
| **ShareImg1** | `pages/order/components/ShareImg1.vue` | 订单成交喜报分享图 |
| **WxShared** | `pages/order/WxShared.vue` | 微信分享弹窗 |

---

## 🛠️ 工具函数

| 工具 | 文件 | 功能 |
|------|------|------|
| **isWeChatBrowser** | `utils/index.ts` | 判断微信浏览器环境 |
| **copyDocument** | `utils/index.ts` | 复制文本到剪贴板 |
| **isWorkday** | `utils/index.ts` | 判断是否工作日（API + 本地降级） |
| **encrypt** | `utils/encrypt.ts` | SM2 国密加密（当前直接返回原文，加密逻辑已注释） |
| **compressImage** | `utils/compress.ts` | Canvas 图片压缩（瓦片绘制策略） |
| **mergeImageQr** | `utils/mergeImageQr.ts` | 合并背景图与二维码 |
| **waitUserConfirmPay** | `utils/waitUserConfirmPay.ts` | 微信 JSAPI 商家转账用户确认收款 |

---

## 📐 类型定义

| 类型文件 | 核心类型 |
|----------|---------|
| `types/common.d.ts` | `Area`, `PageParam`, `Pages<T>`, `DictData` |
| `types/login.d.ts` | `LoginParam`, `LoginResult`, `UserInfo`, `RegisterParam`, `UpdateUserParam`, `UpdateMobileParam`, `UpdatePasswordParam`, `ResetPasswordParam` |
| `types/order.ts` | `ORDER_STATUS`（枚举）, `ORDER_STATUS_DICT`, `OrderParam`, `OrderData` + 状态辅助函数 |
| `types/product.d.ts` | `ProductData`, `Booked` |
| `types/team.d.ts` | `TeamListParam`, `TeamData`, `BrokerageSummary`, `WithdrawParam`, `BrokerageRecord`, `WithdrawDetail`, `LastWithdraw`, `ConfirmReceiveParam` |

---

## 🔒 路由守卫逻辑

`router.ts` 中的守卫流程：

```
请求页面
  ├─ 非微信浏览器 && 非开发环境 → 重定向到 /not-wxpage
  ├─ 已登录 → 访问 /login 或 / → 重定向到 /home
  ├─ 未登录 && 非白名单 && 非分享页 → 退出登录 → 重定向到 /login
  └─ 白名单/分享页 → 放行
```

白名单：`/login`, `/register`, `/forget-password`, `/reset-password`, `/user-agreement`, `/not-wxpage`, `/video`，以及所有 `/share/*` 路径。

---

## 🔄 核心数据流

```
用户操作 → Page 组件 → Composable (useDatas/useMyFetch)
                              ↓
                         API 层 (api/*.api.ts)
                              ↓
                    useMyFetch (鉴权/错误处理)
                              ↓
                    后端 API (/app-api/*)
                              ↓
                    Pinia Store (状态持久化)
```

---

## 🎨 样式体系

- **UnoCSS**：原子化 CSS，主题色 `primary: #6b86fa`
- **Vant 4**：移动端 UI 组件库，自动按需导入
- **Less**：部分页面 scoped 样式
- **postcss-mobile-forever**：移动端适配
- **全局快捷方式**：`cell-item`, `svg-icon`, `text-md`, `text-primary`, `bg-primary`

---

## 🧪 Mock 系统

基于 MSW (Mock Service Worker)，按业务域划分：

| Mock 数据 | Mock 处理器 |
|-----------|------------|
| `mock/datas/login.ts` | `mock/handler/login.ts` |
| `mock/datas/common.ts` | `mock/handler/common.ts` |
| `mock/datas/product.ts` | `mock/handler/product.ts` |
| `mock/datas/order.ts` | `mock/handler/order.ts` |
| `mock/datas/team.ts` | `mock/handler/team.ts` |

当前 `OPEN_MOCK: false`，Mock 未启用。

---

## 📋 自定义指令

| 指令 | 文件 | 功能 |
|------|------|------|
| `v-permission` | `directive/permission.ts` | 权限控制：无权限时移除 DOM 元素 |

---

## 🔑 关键业务流程

1. **登录流程**：手机号+密码 → 微信授权获取 code → 携带 socialCode 登录 → token 持久化
2. **产品推广**：浏览产品 → 查看详情 → 提交贷款申请（Booked）→ 生成分享链接/二维码海报
3. **订单跟踪**：查看订单列表 → 按状态/日期/类型筛选 → 查看详情 → 成交喜报分享
4. **团队管理**：查看团队成员 → 按时间/类型筛选 → 搜索成员
5. **佣金提现**：查看佣金统计 → 实名认证 → 云账户签约 → 申请提现（银行卡/微信）→ 微信确认收款
