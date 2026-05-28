# Tasks: 后台管理前端（vben-admin）

> 任务粒度：单个页面或单个组件级别，每个任务 ≤ 0.5 人日
> 依赖前提：Phase 0 主题引擎已完成
> **设计契约**：[api-contracts.md](../../../mydocs/api-contracts.md) §8 后台管理模块 + [member-system-design.md](../../../mydocs/member-system-design.md) §一（等级体系）
> **注意**：后台接口 Req/Res 结构、订单状态枚举、等级 Tag 颜色映射等一律以契约文档为准

---

## Task 4.1: 后台工程初始化

- [ ] **4.1.1** 配置 `packages/admin` 基于 vben-admin Vue3 框架
  - 安装依赖：vben-admin、ant-design-vue、echarts
  - 配置路径别名 @shared/
  - 配置主题色：primary color = #4ECDC4
- [ ] **4.1.2** 配置路由和菜单
  - 登录页路由
  - Dashboard 路由
  - 商品管理路由（列表/编辑）
  - 订单管理路由（列表/详情）
  - 会员管理路由（列表/详情）
  - 系统管理路由（账号）
- [ ] **4.1.3** 配置权限控制
  - super 角色：全部菜单
  - admin 角色：隐藏账号管理菜单
- [ ] **4.1.4** 验证：pnpm dev 启动成功，菜单渲染正确

## Task 4.2: 登录页

- [ ] **4.2.1** 创建 `packages/admin/src/views/login/index.vue`
  - 左侧品牌图（60% 宽度）
  - 右侧登录表单（40% 宽度）
- [ ] **4.2.2** 登录表单组件
  - 标题 "欢迎回来"
  - 账号输入框：placeholder、前缀图标、最大 50 字符
  - 密码输入框：placeholder、前缀图标、眼睛切换
  - "记住我" 复选框
  - 登录按钮：loading 状态、禁用二次点击
- [ ] **4.2.3** 登录逻辑
  - 调用 Mock API `admin-login`
  - 存储 JWT Token 到 localStorage
  - 登录失败显示错误信息
- [ ] **4.2.4** 表单校验
  - 账号非空
  - 密码非空
  - 密码长度 ≥6
- [ ] **4.2.5** 验证：登录成功跳转 Dashboard，Token 正确存储

## Task 4.3: Dashboard 首页

- [ ] **4.3.1** 创建 `packages/admin/src/views/dashboard/index.vue`
  - 引入 StatisticCard、LineChart、PieChart、OrderTable、QuickEntry 组件
- [ ] **4.3.2** 创建 `packages/admin/src/components/dashboard/StatisticCard.vue`
  - 4 列布局
  - 图标 + 数值 + 变化百分比
  - 今日订单数 / 营业额 / 新增会员 / 总会员
- [ ] **4.3.3** 创建 `packages/admin/src/components/dashboard/LineChart.vue`
  - ECharts 折线图
  - 近 7 日营业额趋势
  - X 轴日期，Y 轴金额
- [ ] **4.3.4** 创建 `packages/admin/src/components/dashboard/PieChart.vue`
  - ECharts 饼图
  - 会员等级分布
  - 7 个扇区，颜色对应等级
- [ ] **4.3.5** 创建 `packages/admin/src/components/dashboard/OrderTable.vue`
  - BasicTable，最近 10 条订单
  - 列：订单号、会员、商品、金额、状态、时间
- [ ] **4.3.6** 创建 `packages/admin/src/components/dashboard/QuickEntry.vue`
  - 4 个快捷入口按钮
  - 商品/订单/会员/社区管理
- [ ] **4.3.7** 创建 `packages/admin/src/composables/useDashboard.ts`
  - 调用 Mock API 获取统计数据
- [ ] **4.3.8** 验证：Dashboard 数据正常加载，图表渲染正确

## Task 4.4: 商品管理

- [ ] **4.4.1** 创建 `packages/admin/src/views/goods/list.vue`
  - 搜索表单 + 操作按钮 + 商品表格
- [ ] **4.4.2** 搜索表单
  - 商品名称、分类、状态
  - "查询" + "重置" 按钮
- [ ] **4.4.3** 商品表格
  - BasicTable
  - 列：勾选框、图片、名称、分类、价格、库存、状态、标签、操作
  - 库存 <10 红色高亮
  - 状态 Switch 开关
  - 分页排序
- [ ] **4.4.4** 创建 `packages/admin/src/views/goods/edit.vue`
  - 左侧表单（2/3）+ 右侧预览（1/3）
- [ ] **4.4.5** 商品表单
  - 名称、分类、描述、图片上传（最多 5 张）、标签、状态
- [ ] **4.4.6** SKU 管理
  - 动态表格：规格名称、价格、库存
  - 添加/删除行
  - 表单校验
- [ ] **4.4.7** 预览卡片
  - 实时预览商品效果
- [ ] **4.4.8** 创建 `packages/admin/src/composables/useGoods.ts`
  - 调用 Mock API `admin-goods-list`、`admin-goods-save`
- [ ] **4.4.9** 验证：商品增删改查正常，表格分页排序正常

## Task 4.5: 订单管理

- [ ] **4.5.1** 创建 `packages/admin/src/views/orders/list.vue`
  - 搜索表单 + 订单表格
- [ ] **4.5.2** 搜索表单
  - 订单号、状态、支付方式、时间范围、会员昵称
- [ ] **4.5.3** 订单表格
  - 列：订单号、会员、商品、金额、支付、状态、桌号、时间
  - 状态标签颜色：待取餐(橙)/制作中(蓝)/已完成(绿)/已取消(红)
  - 分页排序
- [ ] **4.5.4** 创建 `packages/admin/src/views/orders/detail.vue`
  - 订单信息卡片 + 状态时间轴 + 商品清单 + 金额明细 + 会员信息 + 操作区
- [ ] **4.5.5** 状态时间轴
  - 垂直时间轴，当前状态高亮
- [ ] **4.5.6** 操作按钮
  - 待取餐：开始制作 / 取消订单
  - 制作中：完成订单
- [ ] **4.5.7** 创建 `packages/admin/src/composables/useOrders.ts`
  - 调用 Mock API `admin-orders-list`、`admin-order-update`
- [ ] **4.5.8** 验证：订单列表筛选正常，详情页操作按钮按状态显示

## Task 4.6: 会员管理

- [ ] **4.6.1** 创建 `packages/admin/src/views/members/list.vue`
  - 搜索表单 + 会员表格
- [ ] **4.6.2** 搜索表单
  - 昵称、手机号、等级、注册时间
- [ ] **4.6.3** 会员表格
  - 列：头像、昵称、等级、累计充值、成长值、积分、余额、注册时间
  - 等级 Tag 颜色对应
  - 分页排序
- [ ] **4.6.4** 创建 `packages/admin/src/views/members/detail.vue`
  - 信息卡片 + 积分调整 + 余额调整 + 充值记录 + 最近订单 + 最近积分变动
- [ ] **4.6.5** 积分调整弹窗
  - 调整值（支持负数）
  - 调整原因
  - 当前/调整后积分实时计算
- [ ] **4.6.6** 余额调整弹窗
  - 调整金额（支持负数，单位：元）
  - 调整原因
  - 当前/调整后余额实时计算
  - 调用 `admin-balance-adjust` API
- [ ] **4.6.7** 充值记录列表
  - 最近 10 条充值记录
  - 列：订单号、充值金额、赠送积分、成长值、状态、时间
- [ ] **4.6.8** 创建 `packages/admin/src/composables/useMembers.ts`
  - 调用 Mock API `admin-members-list`、`admin-members-detail`、`admin-point-adjust`、`admin-balance-adjust`、`admin-recharge-logs`
- [ ] **4.6.9** 验证：会员列表筛选排序正常，积分/余额调整功能正常，充值记录显示正常

## Task 4.7: 系统管理

- [ ] **4.7.1** 创建 `packages/admin/src/views/system/users.vue`
  - 账号表格 + 新增弹窗
- [ ] **4.7.2** 账号表格
  - 列：用户名、昵称、角色、状态、创建时间、操作
  - 操作：编辑/重置密码/禁用启用
- [ ] **4.7.3** 新增账号弹窗
  - 用户名、密码、昵称、角色选择
- [ ] **4.7.4** 权限控制
  - admin 角色访问账号管理时显示 403
- [ ] **4.7.5** 个人设置
  - 修改密码、修改昵称、退出登录
- [ ] **4.7.6** 创建 `packages/admin/src/composables/useSystem.ts`
  - 调用 Mock API 管理账号
- [ ] **4.7.7** 验证：权限控制生效，admin 无法访问账号管理

## Task 4.8: 会员配置管理

- [ ] **4.8.1** 创建 `packages/admin/src/views/members/level-config.vue`
  - 等级权益表格 + 编辑弹窗
- [ ] **4.8.2** 等级权益表格
  - BasicTable
  - 列：等级名称、升级门槛、饮品折扣、工时费折扣、配件折扣、积分倍率、洗车次数、保养折扣、救援公里数、代步车天数、专属客服、生日券、操作
  - 等级名称和升级门槛只读
- [ ] **4.8.3** 等级权益编辑弹窗
  - 表单字段：饮品折扣、工时费折扣、配件折扣、积分倍率、洗车次数、保养折扣、救援公里数、代步车天数、专属客服、生日券
  - InputNumber 组件，步长和范围校验
  - 调用 `admin-member-levels-save` API
- [ ] **4.8.4** 创建 `packages/admin/src/views/members/recharge-config.vue`
  - 充值档位表格 + 编辑弹窗
- [ ] **4.8.5** 充值档位表格
  - BasicTable
  - 列：档位ID、充值金额、赠送积分、成长值、可达等级、启用状态、操作
  - 启用状态 Switch 开关
- [ ] **4.8.6** 充值档位编辑弹窗
  - 表单字段：充值金额、赠送积分、成长值、启用状态
  - 1:1:1 模型默认值联动
  - 调用 `admin-recharge-tiers-save` API
- [ ] **4.8.7** 创建 `packages/admin/src/composables/useMemberConfig.ts`
  - 调用 Mock API `admin-member-levels`、`admin-member-levels-save`、`admin-recharge-tiers`、`admin-recharge-tiers-save`
- [ ] **4.8.8** 验证：等级权益配置保存正常，充值档位配置保存正常

## Task 4.9: Mock API 配置

- [ ] **4.9.1** 创建 `packages/shared/src/mock/handlers/admin.ts`
  - `mockAdminLogin()`：返回 JWT Token
  - `mockGetAdminGoodsList()`：返回商品列表
  - `mockSaveAdminGoods()`：保存商品
  - `mockGetAdminOrdersList()`：返回订单列表
  - `mockUpdateAdminOrder()`：更新订单状态
  - `mockGetAdminMembersList()`：返回会员列表
  - `mockAdjustPoints()`：调整积分
  - `mockAdjustBalance()`：调整余额
  - `mockGetAdminRechargeLogs()`：返回会员充值记录
  - `mockGetAdminMemberLevels()`：返回等级权益配置
  - `mockSaveAdminMemberLevels()`：保存等级权益配置
  - `mockGetAdminRechargeTiers()`：返回充值档位配置
  - `mockSaveAdminRechargeTiers()`：保存充值档位配置
- [ ] **4.9.2** 验证：所有 Mock API 返回结构与 api-contracts.md 一致

---

> **依赖关系**：4.1 → 4.2 → 4.3 → 4.4~4.8（并行）→ 4.9（Mock 配置）
> **预计工期**：6-7 天
