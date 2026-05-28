# Spec: H5 会员中心、权益、充值、积分、充值记录、用户资料

## Goal
实现机车俱乐部 H5 会员体系全链路：会员中心页 → 会员权益页 → 会员充值页 → 积分明细页 → 充值记录页 → 用户资料页。严格遵循设计稿 `h5_member_fresh_2.jpg` 的视觉风格。所有颜色/字号/间距/圆角均引用主题变量，禁止硬编码。

## Done Contract
- 完成标准：会员中心完整呈现，充值流程可用，积分/充值记录可查，用户资料可编辑
- 证明方式：浏览器端完成：进入会员中心 → 查看权益 → 选择充值档位 → 模拟支付 → 查看积分变动 → 查看充值记录 → 编辑用户资料
- 未完成标准：会员等级显示错误、充值档位缺失、硬编码样式

## Scope
- **In**: 会员中心页、会员权益页、会员充值页、积分明细页、充值记录页、用户资料页
- **Out**: 商品、购物车、订单（在各自独立 spec 中）

## Facts / Constraints
- **产品基准**：`full-feature-list.md` v3.0 §6~§11（H5-MEMBER-001~008 / H5-BENEFIT-001~004 / H5-RECHARGE-001~004 / H5-POINT-001~003 / H5-RECHARGE-LOG-001 / H5-BALANCE-001~003）
- 设计稿主色：青绿色 #4ECDC4
- 会员中心风格（h5_member_fresh_2.jpg）：顶部渐变背景、用户头像、等级徽章、资产卡片、功能入口网格
- 会员等级：7 级（普通用户/青铜/白银/黄金/铂金/钻石/至尊），仅累计充值升级
- 充值档位：平时 4 档（¥198/¥680/¥2,980/¥5,980），1:1:1 模型（充值金额:赠送积分:成长值），无赠送余额
- 开业活动：二期上线（¥680 送 1000 积分和成长值，直达青铜）
- 积分规则：100 积分=1 元，单次抵扣上限 30%，12 个月有效期
- 积分推送通知：二期上线，一期仅页面内标签提示
- 数据：基于 Mock API（member-info、member-benefits、member-recharge-tiers 等）
- **设计契约文件**（字段定义、业务规则的唯一来源，禁止猜测）：
  - 业务规则 → [member-system-design.md](../../../mydocs/member-system-design.md) §一（等级体系）、§二（充值规则）、§三（积分规则）、§四（分品类折扣）
  - 接口字段 → [api-contracts.md](../../../mydocs/api-contracts.md) §5 会员模块（member-info / member-benefits / member-recharge-tiers / member-recharge / member-point-logs / member-recharge-logs / member-point-calculate / member-balance-logs）

---

## 板块详细规范

### 1. 会员中心页（pages/member/index.vue）

#### 1.1 顶部用户信息区
- **背景**：渐变背景（主题色 #4ECDC4 → #3DBDB5），高度 200px，圆角 radius-xl（底部）
- **用户头像**：80px 圆形，白色边框 3px，居中偏上
- **昵称**：font-size-lg, font-weight-bold, color-text-inverse
- **等级徽章**：
  - 普通用户：灰色 #9CA3AF
  - 青铜：棕色 #B87333
  - 白银：银色 #C0C0C0
  - 黄金：金色 #FFD700
  - 铂金：白色 #E5E7EB（带铂金光泽）
  - 钻石：蓝色 #3B82F6
  - 至尊：紫色 #8B5CF6
  - 徽章样式：胶囊形，padding: var(--spacing-xs) var(--spacing-md)，font-size-xs, font-weight-medium

#### 1.2 资产卡片
- **容器**：白色卡片（card 工具类），margin-top: -40px（与顶部重叠）
- **布局**：3 列等分，text-align: center
- **积分**：
  - 数值：font-size-2xl, font-weight-bold, color-primary
  - 标签："积分"（font-size-sm, color-text-secondary）
- **余额**：
  - 数值：font-size-2xl, font-weight-bold, color-secondary
  - 标签："余额"（font-size-sm, color-text-secondary）
- **累计充值**：
  - 数值：font-size-2xl, font-weight-bold, color-text-primary
  - 标签："累计充值"（font-size-sm, color-text-secondary）

#### 1.3 升级进度条
- **容器**：白色卡片（card 工具类）
- **标题**："升级进度"（font-size-md, font-weight-medium, color-text-primary）
- **进度条**：
  - 背景：var(--color-border)，高度 8px，圆角 radius-full
  - 填充：渐变（主题色 → 主题色深），高度 8px，圆角 radius-full
  - 当前进度百分比显示（font-size-sm, color-text-secondary）
- **提示文字**："再充值 ¥XXX 即可升级为 XX 会员"（font-size-sm, color-primary）

#### 1.4 功能入口网格
- **容器**：白色卡片（card 工具类）
- **布局**：3×3 网格，gap: var(--spacing-md)
- **入口项**：
  - 图标：40px，圆角 radius-md，背景 var(--color-primary-light)，图标颜色 var(--color-primary)
  - 文字：font-size-sm, color-text-primary
  - 点击：opacity 0.7，100ms
- **入口列表**：
  1. 订单记录（跳转订单列表）
  2. 积分明细（跳转积分明细页）
  3. 充值记录（跳转充值记录页）
  4. 会员权益（跳转权益页）
  5. 会员充值（跳转充值页）
  6. 用户资料（跳转资料页）
  7. 我的收藏（二期）
  8. 地址管理（二期）
  9. 客服中心（二期）

#### 1.5 会员码弹窗
- **触发**：点击头像或"会员码"入口
- **动画**：底部滑入（translateY 100%→0，300ms ease-out）
- **内容**：
  - 标题："会员码"（font-size-lg, font-weight-bold）
  - 二维码：200×200px，居中
  - 二维码内容：`LQMEMBER:{member_id}:{timestamp}`
  - 有效期：5 分钟，过期后自动刷新
  - 提示："每 5 分钟自动刷新"（font-size-xs, color-text-tertiary）
  - 关闭按钮：底部"关闭"（全宽按钮）
- **关闭**：点击遮罩或下滑关闭
- **离线处理**：
  - 网络异常时显示 "网络异常，无法生成会员码"（font-size-sm, color-error）
  - 支持离线展示上次缓存的会员码（标注 "离线码，可能已过期"，font-size-xs, color-warning）

---

### 2. 会员权益页（pages/member/benefits.vue）

#### 2.1 当前等级权益卡片
- **容器**：白色卡片（card 工具类）
- **头部**：
  - 等级图标：48px，颜色对应等级
  - 等级名称：font-size-xl, font-weight-bold
  - "当前等级" 标签：背景 var(--color-primary-light)，文字 var(--color-primary)，font-size-xs
- **权益列表**：
  - 饮品折扣：XX%（font-size-lg, font-weight-bold, color-secondary）
  - 工时费折扣：XX%
  - 配件折扣：XX%
  - 机车特色权益：文字描述（font-size-sm, color-text-secondary）

#### 2.2 等级对比表
- **容器**：白色卡片（card 工具类）
- **标题**："等级权益对比"（font-size-md, font-weight-medium）
- **表格**：横向滚动
  - 表头：等级名称（7 列）
  - 当前等级列高亮：背景 var(--color-primary-light)
  - 表头固定（sticky top）
  - 行：饮品折扣 / 工时费折扣 / 配件折扣 / 升级门槛
  - 数据：font-size-sm

#### 2.3 升级提示
- **容器**：底部固定，白色背景，上边框 var(--color-border-light)
- **内容**："再充值 ¥X 即可升级为 Y 会员"
- **按钮**："立即充值"（主题色胶囊按钮）

---

### 3. 会员充值页（pages/member/recharge.vue）

#### 3.1 活动横幅（⏳ 二期上线）
- **注意**：开业活动移至二期，一期不显示此横幅
- **容器**：渐变红背景（#FF6B6B → #EF4444），圆角 radius-xl
- **内容**：
  - "开业活动 限时 30 天"（font-size-lg, font-weight-bold, color-text-inverse）
  - 倒计时：DD:HH:MM:SS（font-size-md, color-text-inverse）
  - 倒计时每秒更新

#### 3.2 充值档位卡片
- **容器**：纵向排列，gap: var(--spacing-md)
- **档位卡片**：
  - 未选中：白色背景，边框 1px solid var(--color-border)，圆角 radius-xl
  - 选中：边框 2px solid var(--color-primary)，背景 var(--color-primary-light)
  - 禁用：灰色背景，不可点击
  - 点击动画：scale 0.98→1.0（100ms）
- **档位内容**：
  - 充值金额：font-size-2xl, font-weight-bold, color-text-primary
  - 赠送积分："+XXX 积分"（font-size-sm, color-primary）
  - 成长值："+XXX 成长值"（font-size-sm, color-text-secondary）
  - 可达等级："充值后可达 XX 会员"（font-size-xs, color-text-secondary），仅 reach_level 不为 null 时显示
- **档位数据结构**（对齐 api-contracts.md）：
  ```typescript
  interface RechargeTier {
    tier_id: number
    amount: number          // 充值金额（分）
    bonus_points: number    // 赠送积分（= 充值金额元，1:1:1模型）
    growth_value: number    // 成长值（= 充值金额元，1:1:1模型）
    reach_level: number | null  // 单次可达等级
  }
  ```

#### 3.3 ¥2,980 档位特殊标记
- **角标**："⭐ 推荐"，背景 var(--color-warning)，文字 color-text-inverse，font-size-xs
- **说明**："成为青铜会员"（font-size-sm, color-primary）

#### 3.4 底部支付栏
- **位置**：fixed bottom，高度 56px + safe-area-bottom
- **背景**：白色，上边框 var(--color-border-light)
- **左侧**："实付 ¥XXX"（font-size-lg, font-weight-bold, color-secondary）
- **右侧**："立即充值" 按钮
  - 未选档位时禁用（背景 var(--color-border)）
  - 胶囊形，背景 var(--color-primary)，文字 color-text-inverse
  - 点击：调用 member-recharge Mock API，跳转支付页

#### 3.5 充值结果页
- **成功**：
  - "充值成功"（font-size-xl, font-weight-bold, color-success）
  - 充值金额、获得积分、获得成长值、当前等级
  - "返回会员中心" 按钮
- **失败**：
  - "支付失败，请重试"（font-size-xl, color-error）
  - "重新支付" 按钮（保留选中档位）

#### 3.6 活动结束过渡（⏳ 二期上线）
- **注意**：开业活动移至二期，一期无需此过渡逻辑
- **活动倒计时归零后**：
  - 活动横幅 fadeOut（300ms），隐藏
  - 档位列表重新渲染为平时 4 档（移除活动额外积分和活动角标）
  - 过渡动画：档位列表 opacity 0→1（300ms）
- **已参与活动的用户**：充值记录中保留 "开业活动" 橙色角标标记

---

### 4. 积分明细页（pages/member/point-logs.vue）

#### 4.1 顶部卡片
- **容器**：渐变背景（主题色 → 主题色深），圆角 radius-xl
- **当前积分**：font-size-3xl, font-weight-bold, color-text-inverse
- **提示**："100 积分=1 元"（font-size-sm, color-text-inverse，带半透明背景）

#### 4.2 积分流水列表
- **布局**：纵向排列
- **流水项**：
  - 左侧：图标（收入绿↑/支出红↓）
  - 中间：
    - 变动金额：font-size-md, font-weight-medium（收入 color-success，支出 color-error）
    - 原因：font-size-sm, color-text-secondary
    - 时间：font-size-xs, color-text-tertiary
  - 右侧：
    - 余额：font-size-sm, color-text-secondary
- **即将过期标红**：30 天内过期积分显示 "即将过期" 红色标签（font-size-xs, color-error）

#### 4.3 类型筛选
- **Tab 栏**：全部/收入/支出
- 选中：color-primary + 底部主题色下划线

#### 4.4 加载状态
- 下拉刷新 + 上滑加载更多
- 空状态："暂无积分记录"

---

### 5. 充值记录页（pages/member/recharge-logs.vue）

#### 5.1 充值记录列表
- **布局**：纵向排列
- **记录项**：白色卡片（card 工具类）
  - 充值金额：font-size-lg, font-weight-bold, color-text-primary
  - 赠送明细："+XXX 积分"（font-size-sm, color-primary）+ "+XXX 成长值"（font-size-sm, color-text-secondary）
  - 状态标签："成功"（背景 #E0F7F5，文字 #10B981）/ "失败"（背景 #FFE0E0，文字 #EF4444）
  - 时间：font-size-xs, color-text-tertiary

#### 5.2 加载状态
- 下拉刷新 + 上滑加载更多
- 空状态："暂无充值记录"

---

### 6. 用户资料页（pages/member/profile.vue）

#### 6.1 头像更换
- **布局**：居中，头像 80px 圆形
- **点击**：调起微信选择图片（`wx.chooseImage`）
- **上传**：调用 Mock API 更新头像
- **加载**：上传中显示 loading

#### 6.2 昵称编辑
- **布局**：表单行，左侧"昵称"，右侧当前昵称 + 编辑图标
- **点击**：弹出输入框（`uni.showModal` 或自定义弹窗）
- **输入**：最大 20 字符
- **保存**：调用 Mock API 更新

#### 6.3 手机号绑定
- **布局**：表单行，左侧"手机号"，右侧状态
- **已绑定**：显示手机号（中间 4 位 * 号隐藏）
- **未绑定**：显示 "去绑定" 按钮（主题色）

#### 6.4 绑定弹窗
- **输入框**：手机号输入，最大 11 位
- **验证码**：6 位数字输入 + "获取验证码" 按钮
- **倒计时**：60 秒倒计时，期间按钮禁用
- **确认**："绑定" 按钮，校验手机号和验证码

---

## ADDED Requirements

### Requirement: 会员等级显示
The system SHALL display member level with correct color badge and progress bar.

#### Scenario: 查看会员等级
- **GIVEN** 用户进入会员中心
- **WHEN** 页面加载完成
- **THEN** 显示正确的等级徽章颜色和升级进度

### Requirement: 充值档位选择
The system SHALL allow users to select recharge tier and display correct bonus info.

#### Scenario: 选择充值档位
- **GIVEN** 用户点击 ¥2,980 档位
- **WHEN** 档位选中
- **THEN** 显示 "成为青铜会员" 和 "+2,980 积分 +2,980 成长值"

### Requirement: 积分过期提醒
The system SHALL highlight points that will expire within 30 days.

#### Scenario: 查看积分明细
- **GIVEN** 用户有 30 天内过期积分
- **WHEN** 进入积分明细页
- **THEN** 对应记录显示 "即将过期" 红色标签

### Requirement: 积分推送通知（⏳ 二期上线）
The system SHALL push notification when user earns points.

#### Scenario: 消费获得积分
- **GIVEN** 用户消费后获得积分
- **WHEN** 积分到账
- **THEN** 推送模板消息通知用户（二期实现）
- **注意**：一期仅通过页面内标签提示积分变动

## MODIFIED Requirements
无

## REMOVED Requirements
无

## Change Log
- 2026-05-23: 初始版本，基于设计稿 h5_member_fresh_2.jpg 和会员体系设计文档制定
- 2026-05-24: v2 更新 - 充值档位调整为4档（¥198/¥680/¥2,980/¥5,980），1:1:1模型，移除赠送余额，开业活动移至二期，资产卡片"累计消费"改为"累计充值"，积分推送通知移至二期
