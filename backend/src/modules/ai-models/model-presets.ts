export type LocalizedLabel = string | { zh: string; en: string };

export interface ModelPreset {
  value: string;
  hint?: string;
}

export interface PlatformPreset {
  id: string;
  label: LocalizedLabel;
  name: string;
  defaultBaseUrl: string;
  baseUrlPlaceholder: string;
  protocolType: string;
  supports: string[];
  models: Array<string | ModelPreset>;
}

export interface CapabilityPreset {
  id: string;
  label: string;
  description: string;
  providers: string[];
  providerModels?: Record<string, Array<string | ModelPreset>>;
}

export const PROTOCOL_TYPES = [
  {
    value: 'openai_compatible',
    label: { zh: 'OpenAI 兼容', en: 'OpenAI-compatible' },
    hint: {
      zh: '适用于 /v1/chat/completions 与 /v1/images/generations',
      en: 'For /v1/chat/completions and /v1/images/generations',
    },
  },
  {
    value: 'anthropic_messages',
    label: { zh: 'Anthropic Messages', en: 'Anthropic Messages' },
    hint: { zh: '适用于 Claude /messages 协议', en: 'For Claude /messages APIs' },
  },
  {
    value: 'gemini_generate_content',
    label: { zh: 'Gemini generateContent', en: 'Gemini generateContent' },
    hint: {
      zh: '适用于 Gemini 原生 generateContent 协议',
      en: 'For Gemini native generateContent APIs',
    },
  },
  {
    value: 'dashscope_compatible',
    label: { zh: 'DashScope 兼容', en: 'DashScope-compatible' },
    hint: { zh: '适用于阿里百炼兼容模式', en: 'For Alibaba DashScope compatible mode' },
  },
  {
    value: 'ark_compatible',
    label: { zh: '火山方舟兼容', en: 'Volcengine Ark-compatible' },
    hint: {
      zh: '适用于火山方舟 OpenAI 兼容协议',
      en: 'For Volcengine Ark OpenAI-compatible APIs',
    },
  },
  {
    value: 'qianfan_compatible',
    label: { zh: '百度千帆兼容', en: 'Qianfan-compatible' },
    hint: { zh: '适用于千帆 v2 兼容协议', en: 'For Qianfan v2 compatible APIs' },
  },
  {
    value: 'zhipu_compatible',
    label: { zh: '智谱兼容', en: 'Zhipu-compatible' },
    hint: { zh: '适用于智谱 GLM 兼容协议', en: 'For Zhipu GLM compatible APIs' },
  },
  {
    value: 'minimax_compatible',
    label: { zh: 'MiniMax 兼容', en: 'MiniMax-compatible' },
    hint: {
      zh: '适用于 MiniMax chat/completions 兼容协议',
      en: 'For MiniMax chat/completions-compatible APIs',
    },
  },
  {
    value: 'linkai_compatible',
    label: { zh: 'LinkAI 兼容', en: 'LinkAI-compatible' },
    hint: { zh: '适用于 LinkAI 统一网关', en: 'For the LinkAI gateway' },
  },
];

export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: 'deepseek',
    label: 'DeepSeek',
    name: 'DeepSeek',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    baseUrlPlaceholder: 'https://...../v1',
    protocolType: 'openai_compatible',
    supports: [],
    models: ['deepseek-v4-flash', 'deepseek-v4-pro', 'deepseek-chat', 'deepseek-reasoner'],
  },
  {
    id: 'yunwu',
    label: { zh: '云雾 image2.0', en: 'Yunwu image2.0' },
    name: '云雾 image2.0',
    defaultBaseUrl: 'https://yunwu.ai/v1',
    baseUrlPlaceholder: 'https://...../v1',
    protocolType: 'openai_compatible',
    supports: ['image'],
    models: [{ value: 'gpt-image-2', hint: 'image2.0' }],
  },
  {
    id: 'minimax',
    label: 'MiniMax',
    name: 'MiniMax',
    defaultBaseUrl: '',
    baseUrlPlaceholder: '',
    protocolType: 'minimax_compatible',
    supports: [],
    models: ['MiniMax-M3', 'MiniMax-M2.7', 'MiniMax-M2.7-highspeed'],
  },
  {
    id: 'claudeAPI',
    label: 'Claude',
    name: 'Claude',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    baseUrlPlaceholder: 'https://...../v1',
    protocolType: 'anthropic_messages',
    supports: [],
    models: ['claude-opus-4-8', 'claude-opus-4-7', 'claude-fable-5', 'claude-sonnet-4-6', 'claude-opus-4-6'],
  },
  {
    id: 'gemini',
    label: 'Gemini',
    name: 'Gemini',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com',
    baseUrlPlaceholder: 'https://.....',
    protocolType: 'gemini_generate_content',
    supports: [],
    models: ['gemini-3.5-flash', 'gemini-3.1-flash-lite-preview', 'gemini-3.1-pro-preview', 'gemini-3-flash-preview'],
  },
  {
    id: 'openai',
    label: 'OpenAI',
    name: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com/v1',
    baseUrlPlaceholder: 'https://...../v1',
    protocolType: 'openai_compatible',
    supports: [],
    models: ['gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini', 'gpt-5.4-nano', 'gpt-5', 'gpt-4.1', 'gpt-4o'],
  },
  {
    id: 'zhipu',
    label: { zh: '智谱AI', en: 'GLM' },
    name: '智谱AI',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    baseUrlPlaceholder: 'https://...../api/paas/v4',
    protocolType: 'zhipu_compatible',
    supports: [],
    models: ['glm-5.2', 'glm-5.1', 'glm-5-turbo', 'glm-5', 'glm-4.7'],
  },
  {
    id: 'dashscope',
    label: { zh: '通义千问', en: 'Qwen' },
    name: '通义千问',
    defaultBaseUrl: '',
    baseUrlPlaceholder: '',
    protocolType: 'dashscope_compatible',
    supports: [],
    models: ['qwen3.7-plus', 'qwen3.7-max', 'qwen3.6-plus'],
  },
  {
    id: 'doubao',
    label: { zh: '豆包', en: 'Doubao' },
    name: '豆包',
    defaultBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    baseUrlPlaceholder: 'https://...../api/v3',
    protocolType: 'ark_compatible',
    supports: [],
    models: ['doubao-seed-2-1-pro-260628', 'doubao-seed-2-1-turbo-260628', 'doubao-seed-2-0-pro-260215', 'doubao-seed-2-0-code-preview-260215'],
  },
  {
    id: 'moonshot',
    label: 'Kimi',
    name: 'Kimi',
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
    baseUrlPlaceholder: 'https://...../v1',
    protocolType: 'openai_compatible',
    supports: [],
    models: ['kimi-k2.7-code', 'kimi-k2.7-code-highspeed', 'kimi-k2.6', 'kimi-k2.5', 'kimi-k2'],
  },
  {
    id: 'qianfan',
    label: { zh: '百度千帆', en: 'ERNIE' },
    name: '百度千帆',
    defaultBaseUrl: 'https://qianfan.baidubce.com/v2',
    baseUrlPlaceholder: 'https://...../v2',
    protocolType: 'qianfan_compatible',
    supports: [],
    models: ['ernie-5.1', 'ernie-5.0', 'ernie-x1.1', 'ernie-4.5-turbo-128k', 'ernie-4.5-turbo-32k'],
  },
  {
    id: 'mimo',
    label: { zh: '小米 MiMo', en: 'MiMo' },
    name: '小米 MiMo',
    defaultBaseUrl: 'https://api.xiaomimimo.com/v1',
    baseUrlPlaceholder: 'https://...../v1',
    protocolType: 'openai_compatible',
    supports: [],
    models: ['mimo-v2.5-pro', 'mimo-v2.5'],
  },
  {
    id: 'linkai',
    label: 'LinkAI',
    name: 'LinkAI',
    defaultBaseUrl: 'https://api.link-ai.tech',
    baseUrlPlaceholder: '',
    protocolType: 'linkai_compatible',
    supports: [],
    models: [
      'deepseek-v4-flash', 'deepseek-v4-pro', 'MiniMax-M3', 'MiniMax-M2.7-highspeed', 'MiniMax-M2.7',
      'claude-opus-4-8', 'claude-opus-4-7', 'claude-fable-5', 'claude-sonnet-4-6', 'claude-opus-4-6',
      'gemini-3.5-flash', 'gemini-3.1-flash-lite-preview', 'gemini-3.1-pro-preview', 'gemini-3-flash-preview',
      'gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini', 'gpt-5.4-nano', 'gpt-5', 'gpt-4.1', 'gpt-4o',
      'glm-5.2', 'glm-5.1', 'glm-5-turbo', 'glm-5', 'glm-4.7',
      'qwen3.7-plus', 'qwen3.7-max', 'qwen3.6-plus',
      'doubao-seed-2-1-pro-260628', 'doubao-seed-2-1-turbo-260628', 'doubao-seed-2-0-code-preview-260215',
      'kimi-k2.7-code', 'kimi-k2.7-code-highspeed', 'kimi-k2.6', 'kimi-k2.5', 'kimi-k2',
      'ernie-5.1', 'ernie-5.0', 'ernie-x1.1', 'ernie-4.5-turbo-128k', 'ernie-4.5-turbo-32k',
      'mimo-v2.5-pro', 'mimo-v2.5',
    ],
  },
  {
    id: 'custom',
    label: { zh: '自定义', en: 'Custom' },
    name: '自定义',
    defaultBaseUrl: '',
    baseUrlPlaceholder: 'https://...../v1',
    protocolType: 'openai_compatible',
    supports: [],
    models: [],
  },
];

export const CAPABILITY_PRESETS: CapabilityPreset[] = [
  {
    id: 'chat',
    label: '主模型',
    description: '用于基础对话、选题评分和文章生成。',
    providers: ['deepseek', 'minimax', 'claudeAPI', 'gemini', 'openai', 'zhipu', 'dashscope', 'doubao', 'moonshot', 'qianfan', 'mimo', 'linkai', 'custom'],
  },
  {
    id: 'vision',
    label: '图像理解',
    description: '用于识别图片内容。',
    providers: ['openai', 'doubao', 'moonshot', 'dashscope', 'claudeAPI', 'gemini', 'qianfan', 'zhipu', 'minimax', 'mimo', 'linkai'],
    providerModels: {
      openai: ['gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini', 'gpt-5.4-nano', 'gpt-5', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4o'],
      doubao: ['doubao-seed-2-1-pro-260628', 'doubao-seed-2-1-turbo-260628', 'doubao-seed-2-0-pro-260215'],
      moonshot: ['kimi-k2.6'],
      dashscope: ['qwen3.7-plus', 'qwen3.6-plus'],
      claudeAPI: ['claude-opus-4-8', 'claude-opus-4-7', 'claude-sonnet-4-6', 'claude-opus-4-6'],
      gemini: ['gemini-3.5-flash', 'gemini-3.1-flash-lite-preview', 'gemini-3.1-pro-preview', 'gemini-3-flash-preview'],
      qianfan: ['ernie-4.5-turbo-vl'],
      zhipu: ['glm-5v-turbo'],
      minimax: ['MiniMax-Text-01'],
      mimo: ['mimo-v2.5-pro', 'mimo-v2.5'],
      linkai: ['gpt-4.1-mini', 'gpt-5.4-mini', 'qwen3.7-plus', 'doubao-seed-2-1-pro-260628', 'kimi-k2.6', 'claude-sonnet-4-6', 'gemini-3.1-flash-lite-preview'],
    },
  },
  {
    id: 'image',
    label: '图像生成',
    description: '用于文章配图、封面图和小红书卡图生成。',
    providers: ['openai', 'yunwu', 'gemini', 'doubao', 'dashscope', 'minimax', 'linkai'],
    providerModels: {
      openai: ['gpt-image-2', 'gpt-image-1'],
      yunwu: [{ value: 'gpt-image-2', hint: 'image2.0' }],
      gemini: [
        { value: 'gemini-3.1-flash-image-preview', hint: 'Nano Banana 2' },
        { value: 'gemini-3-pro-image-preview', hint: 'Nano Banana Pro' },
        { value: 'gemini-2.5-flash-image', hint: 'Nano Banana' },
      ],
      doubao: ['seedream-5.0-lite', 'seedream-4.5'],
      dashscope: ['qwen-image-2.0-pro', 'qwen-image-2.0'],
      minimax: ['image-01'],
      linkai: ['gpt-image-2', { value: 'gemini-3.1-flash-image-preview', hint: 'Nano Banana 2' }, { value: 'gemini-3-pro-image-preview', hint: 'Nano Banana Pro' }, 'seedream-5.0-lite'],
    },
  },
  {
    id: 'asr',
    label: '语音识别',
    description: '用于语音转文字。',
    providers: ['openai', 'dashscope', 'zhipu', 'linkai'],
    providerModels: {
      openai: [
        { value: 'gpt-4o-mini-transcribe', hint: '默认 · 速度快' },
        { value: 'gpt-4o-transcribe', hint: '更高准确率' },
        { value: 'whisper-1', hint: '经典 Whisper' },
      ],
      dashscope: [{ value: 'qwen3-asr-flash', hint: '覆盖普通话、方言与主流外语' }],
      zhipu: [{ value: 'glm-asr-2512', hint: '智谱语音识别' }],
      linkai: [{ value: 'whisper-1', hint: '网关固定使用' }],
    },
  },
  {
    id: 'tts',
    label: '语音合成',
    description: '用于文字转语音。',
    providers: ['openai', 'minimax', 'dashscope', 'mimo', 'linkai'],
    providerModels: {
      openai: ['tts-1', 'tts-1-hd', 'gpt-4o-mini-tts'],
      minimax: [
        { value: 'speech-2.8-hd', hint: '情绪渲染融合语气词,自然听感' },
        { value: 'speech-2.8-turbo', hint: '极致生成速度,更自然逼真' },
        { value: 'speech-2.6-hd', hint: '超低延时,归一化升级' },
        { value: 'speech-2.6-turbo', hint: '更快更便宜,适合语音聊天/数字人' },
      ],
      dashscope: [{ value: 'qwen3-tts-flash', hint: '覆盖普通话、方言与主流外语' }],
      mimo: [{ value: 'mimo-v2.5-tts', hint: '预置音色 · 支持唱歌模式' }],
      linkai: [
        { value: 'tts-1', hint: 'OpenAI · 多语种通用' },
        { value: 'doubao', hint: '字节豆包 · 中文音色丰富' },
        { value: 'baidu', hint: '百度 · 中文主播音色' },
      ],
    },
  },
  {
    id: 'embedding',
    label: '向量',
    description: '用于记忆与知识的向量化检索。',
    providers: ['openai', 'dashscope', 'doubao', 'zhipu', 'linkai'],
    providerModels: {
      openai: ['text-embedding-3-small', 'text-embedding-3-large'],
      dashscope: ['text-embedding-v4'],
      doubao: ['doubao-embedding-vision-251215'],
      zhipu: ['embedding-3'],
      linkai: ['text-embedding-3-small'],
    },
  },
  {
    id: 'search',
    label: '联网搜索',
    description: '用于实时网页检索能力。',
    providers: ['qianfan', 'zhipu', 'linkai'],
  },
];
