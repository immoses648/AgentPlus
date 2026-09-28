// src/components/ServiceDialog.tsx
import type en from "../en/serviceDialog";

const zh: typeof en = {
  hintResponses: "OpenAI Responses 接口（/v1/responses），Codex 只支持这种",
  blockedGateway: "{agent} 只支持 Google Gemini 协议，本地网关不能转换成它",
  blockedProto: "{agent} 只支持 {api} 接口；打开「使用本地网关」可以转换后接入",
  addGroupTo: "给「{station}」添加分组",
  editGroup: "编辑分组「{name}」",
  protocol: "协议",
  protoMissing: "{vendor} 没有 {api} 接口；需要的 Agent 可以用本地网关转换",
  tplProtocols: "这个模板支持 {list}；只支持其他协议的 Agent 会自动用对应地址。",
  groupHint: "同一中转站的不同协议、不同密钥各建一个分组。",
  keyStorage: "以明文保存在 ~/.agentplus/store.json。应用直连配置时也会按 Agent 的格式写入；备份可能保留旧密钥。",
  commonModels: "常用模型",
  commonModelsHint: "（添加到 ZCode / MiMo 时作为初始模型列表）",
  noModels: "还没有模型，可以拉取或手动添加，之后也能在各 Agent 的「模型列表」里改。",
  syncTo: "同步到这个分组已接入的 Agent",
  syncHint: "（地址、协议或密钥有改动时才需要）",
  addTo: "添加到",
  gatewayOn: "保存时立即开启网关并创建转发。勾选的 Agent 的新网关地址会保留在待写入改动中，直到你点击「应用」。网关自动转换协议，上游 API 密钥保留在供应商库中。",
  gatewayOff: "检查待写入改动并点击「应用」后，勾选的 Agent 才会直接连接上面的地址。",
  needsApi: "· 需 {api}",
  convertsTo: "· 转 {api}",
  usesAltUrl: "· 用 {api} 地址",
  noneRequired: "都不勾也可以，只保存到供应商库，之后随时添加。",
  footNote: "保存会立即更新供应商库。Agent 改动保留为待写入，检查并点击「应用」后才会写入。",
};

export default zh;
