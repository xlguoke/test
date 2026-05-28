# Tasks: H5 会员中心、权益、充值、积分、充值记录、用户资料

> 任务粒度：单个组件或单个页面级别，每个任务 ≤ 0.5 人日
> 依赖前提：Phase 0 主题引擎已完成
> **设计契约**：[member-system-design.md](../../../mydocs/member-system-design.md) §一~四 + [api-contracts.md](../../../mydocs/api-contracts.md) §5 会员模块
> **注意**：API 字段名、等级阈值、档位金额等精确值一律以契约文档为准，禁止自行编造

---

## Task 3.1: 会员中心页

- [ ] **3.1.1** 创建 `packages/app/src/pages/member/index.vue`
  - 页面容器：纵向滚动
  - 引入 UserHeader、AssetCard、ProgressCard、FunctionGrid 组件
- [ ] **3.1.2** 创建 `packages/app/src/components/member/UserHeader.vue`
  - 渐变背景（主题色 → 主题色深），高度 200px
  - 头像 80px 圆形，白色边框
  - 昵称：font-size-lg, font-weight-bold, color-text-inverse
  - 等级徽章：胶囊形，颜色对应等级
- [ ] **3.1.3** 创建 `packages/app/src/components/member/AssetCard.vue`
  - 白色卡片，margin-top: -40px
  - 3 列布局：积分（color-primary）、余额（color-secondary）、累计充值
  - 数值：font-size-2xl, font-weight-bold
- [ ] **3.1.4** 创建 `packages/app/src/components/member/ProgressCard.vue`
  - 白色卡片
  - 进度条：背景 var(--color-border)，填充渐变主题色
  - 提示："再充值 ¥XXX 即可升级为 XX 会员"
- [ ] **3.1.5** 创建 `packages/app/src/components/member/FunctionGrid.vue`
  - 白色卡片，3×3 网格
  - 图标 40px，圆角 radius-md，背景 var(--color-primary-light)
  - 入口：订单记录、积分明细、充值记录、会员权益、会员充值、用户资料
- [ ] **3.1.6** 创建 `packages/app/src/components/member/MemberCodeModal.vue`
  - 底部滑入动画
  - 二维码 200×200px
  - 二维码内容：`LQMEMBER:{member_id}:{timestamp}`
  - 5 分钟有效期，过期自动刷新
  - "每 5 分钟自动刷新" 提示
  - 点击遮罩或下滑关闭
  - 离线处理：网络异常显示 "网络异常，无法生成会员码"
  - 离线缓存码：显示上次缓存的会员码 + "离线码，可能已过期" 标注
- [ ] **3.1.7** 创建 `packages/app/src/composables/useMember.ts`
  - 调用 Mock API `member-info`
  - 返回：用户信息、等级、积分、余额、累计充值、成长值、升级进度
- [ ] **3.1.8** 验证：会员中心视觉与设计稿一致，数据正确

## Task 3.2: 会员权益页

- [ ] **3.2.1** 创建 `packages/app/src/pages/member/benefits.vue`
  - 引入 CurrentBenefits、BenefitsTable、UpgradePrompt 组件
- [ ] **3.2.2** 创建 `packages/app/src/components/member/CurrentBenefits.vue`
  - 白色卡片
  - 等级图标 48px + 等级名称 + "当前等级" 标签
  - 权益列表：饮品/工时费/配件折扣 + 机车特色权益
- [ ] **3.2.3** 创建 `packages/app/src/components/member/BenefitsTable.vue`
  - 白色卡片，横向滚动表格
  - 表头固定，当前等级列高亮
  - 7 个等级对比
- [ ] **3.2.4** 创建 `packages/app/src/components/member/UpgradePrompt.vue`
  - 底部固定
  - "再充值 ¥X 即可升级为 Y 会员"
  - "立即充值" 按钮
- [ ] **3.2.5** 创建 `packages/app/src/composables/useMemberBenefits.ts`
  - 调用 Mock API `member-benefits`
  - 返回：当前等级权益、全部等级配置
- [ ] **3.2.6** 验证：权益页数据正确，表格横向滚动正常

## Task 3.3: 会员充值页

- [ ] **3.3.1** 创建 `packages/app/src/pages/member/recharge.vue`
  - 引入 ActivityBanner、RechargeTiers、RechargeSubmitBar 组件
- [ ] **3.3.2** 创建 `packages/app/src/components/member/ActivityBanner.vue`（⏳ 二期实现）
  - 渐变红背景，圆角 radius-xl
  - "开业活动 限时 30 天"
  - 倒计时 DD:HH:MM:SS，每秒更新
  - 活动结束过渡：倒计时归零后横幅 fadeOut（300ms），档位列表切换为平时 4 档
  - **注意**：一期不渲染此组件，仅预留组件结构
- [ ] **3.3.3** 创建 `packages/app/src/components/member/RechargeTierCard.vue`
  - 档位卡片：未选中/选中/禁用三种状态
  - 内容：充值金额、赠送积分、成长值、可达等级
  - ¥2,980 档位："⭐ 推荐" 角标 + "成为青铜会员"
  - 点击动画：scale 0.98→1.0
- [ ] **3.3.4** 创建 `packages/app/src/components/member/RechargeSubmitBar.vue`
  - 固定底部，"实付 ¥XXX" + "立即充值" 按钮
  - 未选档位时禁用
- [ ] **3.3.5** 创建 `packages/app/src/composables/useRecharge.ts`
  - 调用 Mock API `member-recharge-tiers`
  - 返回：4 档充值档位（¥198/¥680/¥2,980/¥5,980）
  - 档位数据结构：RechargeTier（tier_id, amount, bonus_points, growth_value, reach_level）
  - 提交充值：调用 `member-recharge`
  - 活动结束检测：二期实现
- [ ] **3.3.6** 验证：充值页档位显示正确，¥2,980 档位特殊标记正常

## Task 3.4: 积分明细页

- [ ] **3.4.1** 创建 `packages/app/src/pages/member/point-logs.vue`
  - 引入 PointHeader、PointTabs、PointList 组件
- [ ] **3.4.2** 创建 `packages/app/src/components/member/PointHeader.vue`
  - 渐变背景，圆角 radius-xl
  - 当前积分：font-size-3xl, font-weight-bold
  - "100 积分=1 元" 提示
- [ ] **3.4.3** 创建 `packages/app/src/components/member/PointList.vue`
  - 流水项：图标 + 变动金额 + 原因 + 时间 + 余额
  - 收入：color-success，支出：color-error
  - 即将过期标红：30 天内显示 "即将过期"
- [ ] **3.4.4** 创建 `packages/app/src/composables/usePointLogs.ts`
  - 调用 Mock API `member-point-logs`
  - 支持类型筛选（全部/收入/支出）
  - 分页加载
- [ ] **3.4.5** 验证：积分明细列表正确，即将过期标红正常

## Task 3.5: 充值记录页

- [ ] **3.5.1** 创建 `packages/app/src/pages/member/recharge-logs.vue`
  - 引入 RechargeList 组件
- [ ] **3.5.2** 创建 `packages/app/src/components/member/RechargeList.vue`
  - 记录项：白色卡片
  - 充值金额 + 赠送积分 + 成长值 + 状态标签 + 时间
- [ ] **3.5.3** 创建 `packages/app/src/composables/useRechargeLogs.ts`
  - 调用 Mock API `member-recharge-logs`
  - 分页加载
- [ ] **3.5.4** 验证：充值记录列表正确

## Task 3.6: 用户资料页

- [ ] **3.6.1** 创建 `packages/app/src/pages/member/profile.vue`
  - 引入 AvatarEdit、NicknameEdit、PhoneBind 组件
- [ ] **3.6.2** 创建 `packages/app/src/components/member/AvatarEdit.vue`
  - 头像 80px 圆形，居中
  - 点击调起微信选择图片
  - 上传中显示 loading
- [ ] **3.6.3** 创建 `packages/app/src/components/member/NicknameEdit.vue`
  - 表单行："昵称" + 当前昵称 + 编辑图标
  - 点击弹出输入框，最大 20 字符
- [ ] **3.6.4** 创建 `packages/app/src/components/member/PhoneBind.vue`
  - 表单行："手机号" + 状态
  - 未绑定："去绑定" 按钮
  - 绑定弹窗：手机号输入 + 验证码 + 60 秒倒计时
- [ ] **3.6.5** 创建 `packages/app/src/composables/useProfile.ts`
  - 调用 Mock API 获取/更新用户资料
  - 手机号绑定逻辑
- [ ] **3.6.6** 验证：用户资料页编辑功能正常

## Task 3.7: Mock API 配置

- [ ] **3.7.1** 创建 `packages/shared/src/mock/handlers/member.ts`
  - `mockGetMemberInfo()`：返回会员信息
  - `mockGetMemberBenefits()`：返回权益配置
  - `mockGetRechargeTiers()`：返回充值档位
  - `mockCreateRecharge(tierId)`：创建充值订单
  - `mockGetPointLogs(type, page)`：返回积分流水
  - `mockGetRechargeLogs(page)`：返回充值记录
  - `mockUpdateProfile(data)`：更新用户资料
- [ ] **3.7.2** 验证：所有 Mock API 返回结构与 api-contracts.md 一致

---

> **依赖关系**：3.1 → 3.2~3.6（并行）→ 3.7（Mock 配置）
> **预计工期**：4-5 天
