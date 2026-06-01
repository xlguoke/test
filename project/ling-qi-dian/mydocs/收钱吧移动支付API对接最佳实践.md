# 收钱吧移动支付 API 对接最佳实践（公众号支付）
**线上支付--微信公众号/支付宝生活号**
**收钱吧 | 2022年6月**

> 保密声明：
> - 本文件内容属于保密事项，不得向第三方透露。
> - 若收钱吧最终未被采纳，需在发送日起90天后删除本方案及附件。
> - 技术支持：techsupport@shouqianba.com

---

## 目录
- [一、方案整体介绍](#一方案整体介绍)
- [二、开发准备工作](#二开发准备工作)
- [三、开发对接及验收](#三开发对接及验收)
- [四、扩展能力（按需实现）](#四扩展能力按需实现)

---

## 一、方案整体介绍

### 1.1 用户支付流程（公众号场景）
1. 公众号菜单栏进入微商城
2. 创建订单并提交付款
3. 302重定向支付链接，唤起支付控件
4. 输入密码完成付款

### 1.2 系统对接结构
一次集成，支持微信公众号、支付宝生活号，两套场景对接逻辑一致。

### 1.3 对接实施流程
准备 → 开发联调 → 验收 → 上线

- **准备**：沟通业务场景、流程与需求；收钱吧提供文档、参数、环境并指派技术对接人。
- **开发联调**：商户按文档开发集成；收钱吧实时答疑、排查问题。
- **验收**：商户提供测试环境；收钱吧做功能、异常流程测试；出具验收报告。
- **上线**：验收通过后部署上线。

### 1.4 项目团队
- **项目总协调**：商务经理/助理，负责业务协调。
- **技术对接专员**：专人提供资源、解答、排查问题。
- **技术负责人**：
  - 金雪丹：+86 18601610151 / jinxuedan@shouqianba.com
  - 陈祺雷：+86 14782187015 / chenqilei@shouqianba.com

### 1.5 文档资源
- 线上接口文档：https://doc.shouqianba.com
- 示例代码：
  - Python：https://github.com/WoSai/shouqianba-webapi-pythondemo
  - Java：https://github.com/WoSai/shouqianba-webapi-javademo
  - C#：https://github.com/WoSai/Shouqianba-Mobile-Payment-API-CSharp-demo
  - PHP：https://github.com/WoSai/Shouqianba-mobile-payment-API-demo-PHP

---

## 二、开发准备工作

### 2.1 重要概念
- **开发者（vendor）**：对接主体，收钱吧提供 `vendor_sn`、`vendor_key`、`app_id`。
- **商户（merchant）**：入网收款主体，对应 `merchant_id`。
- **门店（store）**：线下门店，对应 `store_sn`。
- **激活码（code）**：门店唯一码，用于生成收款终端。
- **终端（terminal）**：收银设备，对应 `terminal_sn` + `terminal_key`，实际调用接口主体。

### 2.2 环境信息
- **生产环境地址**：`https://vsi-api.shouqianba.com`
- **测试激活码**：开发调试用；上线替换为正式激活码。
- **交易性质**：所有交易真实，测试后需退款。

### 2.3 报文头约定
- 协议：HTTPS
- 请求方法：POST
- 数据格式：application/json
- 编码：UTF-8
- **X-Forwarded-For**：上送顾客手机真实公网IP（监管要求）。

### 2.4 签名机制
- 签名格式：`Authorization: {sn} {MD5(body + key)}`
- **激活接口**：用 `vendor_sn` + `vendor_key` 签名。
- **其他业务接口**：用 `terminal_sn` + `terminal_key` 签名。
- 签名文档：https://doc.shouqianba.com/zh-cn/api/sign.html

### 2.5 基础接口（必做）
#### 2.5.1 激活接口
- 地址：https://doc.shouqianba.com/zh-cn/api/interface/activate.html
- 作用：生成 `terminal_sn`、`terminal_key`。
- 要点：
  - 一设备一激活，保存设备与终端参数映射。
  - 设备号建议：`品牌缩写+门店号+设备编号`。
  - 激活码有有效期/次数限制，新增设备需延期或解绑旧终端。

#### 2.5.2 签到接口
- 地址：https://doc.shouqianba.com/zh-cn/api/interface/checkin.html
- 作用：**每日签到更新终端密钥**（安全机制，不影响当前使用）。
- 要点：
  - 签到后密钥更新，后续接口用新密钥。
  - 集群部署需**同步密钥**，避免签名错误。
  - 签到失败：重试一次；仍失败则**重新激活**。

#### 2.5.3 常见报错：EJ26（签名错误）
- 原因：签名算法错误、密钥非最新、参数未同步。
- 排查：
  1. 签名格式：`Authorization: sn 空格 sign`。
  2. 签名算法：`MD5(请求体JSON字符串 + terminal_key)`。
  3. 密钥保存：激活/签到后**立即持久化新密钥**。
- 恢复：密钥丢失/异常 → **重新激活生成新终端**。

---

## 三、开发对接及验收

### 3.1 核心业务接口
| 接口 | 描述 | 地址 |
|---|---|---|
| 跳转支付 | 发起公众号支付 | https://doc.shouqianba.com/zh-cn/api/wap2.html |
| 查询 | 查支付/退款结果 | https://doc.shouqianba.com/zh-cn/api/interface/query.html |
| 退款 | 全额/部分退款 | https://doc.shouqianba.com/zh-cn/api/interface/refund.html |
| 回调 | 接收支付最终结果 | https://doc.shouqianba.com/zh-cn/api/interface/notify.html |

### 3.2 跳转支付接口（核心）
#### 3.2.1 关键参数
- `client_sn`：商户唯一订单号，对账关联。
- `subject`：交易简介（账单显示，防客诉）。
- `return_url`：支付后跳转页面。
- `notify_url`：支付结果回调地址。

#### 3.2.2 签名规则
1. 筛选参数（剔除 `sign`、`sign_type`、字节流）。
2. 按参数名 ASCII 升序排序。
3. 拼接：`k1=v1&k2=v2&...&key=密钥`。
4. MD5 转大写 → `sign`。

#### 3.2.3 调试方法
- 生成 URL 在微信/支付宝打开，直接跳 `return_url` 则 URL 错误。
- 复制跳转链接，解析错误参数：
  - `is_success=F`：失败
  - `error_message`：URL 编码错误信息
  - `standard_error_code`：收钱吧错误码

### 3.3 支付结果获取
#### 3.3.1 主动轮询规范（推荐）
- 订单有效期：4分钟
- 可查询时长：6分钟
- 轮询间隔：
  - 0-1分钟：3秒/次
  - 1-5分钟：10秒/次
  - 第6分钟：最后1次查询
- 最终未出结果 → 订单状态标记为**未知**，人工核对。

#### 3.3.2 回调处理
- 支付成功/失败时触发回调，重试4次（1s、5s、30s、600s）。
- 处理步骤：
  1. 验签（验证来源合法）。
  2. 验签通过 → 返回 `success`（停止重试）。
  3. 更新订单状态，**建议轮询兜底**。

### 3.4 交易结果判定（核心）
- **三层状态**：
  1. `result_code=200`：接口调用成功
  2. `biz_response.result_code`：业务结果
  3. `data.order_status`：**订单最终状态（关键）**

#### 3.4.1 支付状态规则
| order_status | 状态 | 处理 |
|---|---|---|
| PAID | 支付成功 | 完成订单 |
| PAY_CANCELED | 支付失败 | 重新发起 |
| CREATED | 支付中 | 继续轮询 |
| PAY_ERROR | 状态不明 | 人工核对 |

#### 3.4.2 退款状态规则
| order_status | status | 状态 | 处理 |
|---|---|---|---|
| REFUNDED | SUCCESS | 全额退款 | 完成 |
| PARTIAL_REFUNDED | SUCCESS | 部分退款 | 完成 |
| REFUND_ERROR | - | 状态不明 | 人工核对 |
| PAID | FAIL_CANCELED | 退款失败 | 重退 |

### 3.5 退款要点
- **退款限制**：支付宝90天、微信180天，超期不可原路退。
- **余额不足**：当日收款额度不足（手续费、结算延迟）。
- **伪退款失败**：顾客未到账（银行延迟0-3天），引导查微信/支付宝账单。
- **部分退款**：需等上一笔退款明确成功/失败后再发起。

### 3.6 验收与上线
1. **自测**：按收钱吧《测试用例》完成功能、异常测试。
2. **收钱吧验收**：远程联调，确认流程无误。
3. **部署**：
   - 开放 `vsi-api.shouqianba.com` 访问权限。
   - 使用**正式激活码**激活终端。

---

## 四、扩展能力（按需实现）

### 4.1 花呗分期
- 条件：申请直连商户。
- 费率：6期4.5%、12期7.5%。
- 传参（`extended.extend_params`）：
  ```json
  {
    "hb_fq_num": "12",
    "hb_fq_seller_percent": "100"
  }
  hb_fq_num：分期数（6/12）
hb_fq_seller_percent：100 = 商家承担，0 = 用户承担
### 4.2 分账
条件：直连商户。
传参：
json
{
  "profit_sharing": {
    "sharing_flag": "1",
    "model_id": "模板ID",
    "receiver": [
      {"id": "收款方ID", "ratio": "20.00%"}
    ]
  }
}
分账金额：订单金额 × (1-费率) × 分账比例
### 4.3 单品上送
场景：单品券、智慧门店。
传参：goods_details（≤20 个）：
json
{
  "goods_id": "691234567890",
  "goods_name": "商品名",
  "quantity": "2",
  "price": "12300"
}
goods_id 建议用国标 69 条码。
### 4.4 优惠信息处理（强烈建议）
#### 4.4.1 金额公式
商户优惠 = 商户红包 + 商户立减
商户实收 = 订单金额 - 商户优惠
平台优惠 = 平台红包 + 平台立减
#### 4.4.2 退款规则
退款按原订单金额提交（含优惠）。
例：100 元订单，优惠 20 元实收 80 元 → 全额退款提交 100 元。
#### 4.4.3 优惠类型
平台优惠：DISCOUNT_CHANNEL、HONGBAO_CHANNEL 等
商家优惠：DISCOUNT_WOSAI_MCH、HONGBAO_WOSAI_MCH 等