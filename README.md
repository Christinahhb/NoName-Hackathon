# NoName-Hackathon
NoName Hackathon

## 环境配置

### 必需的API密钥

1. **OpenAI API Key** - 用于AI食谱生成
   - 获取地址: https://platform.openai.com/api-keys
   - 环境变量: `NEXT_PUBLIC_OPENAI_API_KEY` 或 `OPENAI_API_KEY`

2. **Spoonacular API Key** - 用于食材图片
   - 获取地址: https://spoonacular.com/food-api
   - 环境变量: `SPOONACULAR_API_KEY`

### 环境变量示例

创建 `.env.local` 文件并添加以下配置：

```env
# OpenAI API Key (for AI recipe generation)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
# or
OPENAI_API_KEY=your_openai_api_key_here

# Spoonacular API Key (for ingredient images)
SPOONACULAR_API_KEY=your_spoonacular_api_key_here
```

## 功能特性

- 🤖 真实AI驱动的食谱生成（基于OpenAI GPT-4）
- 🖼️ 基于Spoonacular的真实食材图片
- 📱 响应式设计
- 🌙 深色模式支持
- 🔐 用户认证
- 📤 食谱上传和管理
