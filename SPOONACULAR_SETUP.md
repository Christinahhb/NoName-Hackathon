# Spoonacular API 集成指南

## 概述

本项目已成功集成Spoonacular API，为真实AI生成的食材提供对应的图片。当用户上传食谱时，系统会使用OpenAI GPT-4分析食材，然后自动为每个食材搜索并显示相应的Spoonacular图片。

## 功能特性

- 🖼️ **真实食材图片**: OpenAI GPT-4分析食材后自动获取Spoonacular图片
- 🔍 **智能搜索**: 基于食材名称进行精确匹配
- 📦 **批量处理**: 支持同时处理多个食材
- 🛡️ **错误处理**: 优雅处理API错误和网络问题
- ⚡ **性能优化**: 批量请求和速率限制

## 设置步骤

### 1. 获取Spoonacular API密钥

1. 访问 [Spoonacular Food API](https://spoonacular.com/food-api)
2. 注册免费账户
3. 获取API密钥（免费账户每天有150个请求限制）

### 2. 配置环境变量

创建 `.env.local` 文件并添加：

```env
# Spoonacular API Key (for ingredient images)
SPOONACULAR_API_KEY=your_spoonacular_api_key_here
```

### 3. 测试集成

运行测试脚本验证API连接：

```bash
npm run test:spoonacular
```

或者访问测试页面：`http://localhost:3000/test-spoonacular`

## 文件结构

```
lib/
├── spoonacular-service.ts    # Spoonacular API服务
└── ai-service.ts            # 集成了图片获取的AI服务

app/
├── api/spoonacular/
│   └── ingredients/
│       └── route.ts         # API路由（避免CORS）
└── test-spoonacular/
    └── page.tsx             # 测试页面

scripts/
└── test-spoonacular.js      # 命令行测试脚本
```

## 使用方法

### 在食谱上传页面

1. 访问 `/upload` 页面
2. 填写食谱信息
3. 输入食材（逗号分隔）
4. 点击"Upload & Analyze"
5. 系统会自动为每个食材获取图片

### 在代码中使用

```typescript
import { spoonacularService } from '@/lib/spoonacular-service'

// 搜索单个食材
const ingredients = await spoonacularService.searchIngredients('tomato', 5)

// 获取食材图片
const imageUrl = await spoonacularService.getIngredientImage('tomato')

// 批量获取图片
const imageMap = await spoonacularService.getIngredientImages(['tomato', 'onion', 'garlic'])
```

## API限制

- **免费账户**: 每天150个请求
- **付费账户**: 根据套餐不同，每天最多10,000个请求
- **速率限制**: 建议在请求之间添加200ms延迟

## 错误处理

系统包含完善的错误处理机制：

- API密钥缺失时显示警告
- 网络错误时优雅降级
- 图片获取失败时使用占位符
- 详细的错误日志记录

## 自定义配置

### 修改图片尺寸

在 `spoonacular-service.ts` 中修改图片URL：

```typescript
// 默认100x100像素
`https://spoonacular.com/cdn/ingredients_100x100/${image}`

// 可选的尺寸：250x250, 500x500
`https://spoonacular.com/cdn/ingredients_250x250/${image}`
```

### 调整批量处理

修改 `getIngredientImages` 方法中的批次大小：

```typescript
const batchSize = 3 // 每批处理3个食材
```

## 故障排除

### 常见问题

1. **API密钥错误**
   - 检查环境变量是否正确设置
   - 验证API密钥是否有效

2. **图片不显示**
   - 检查网络连接
   - 查看浏览器控制台错误
   - 验证食材名称是否正确

3. **请求限制**
   - 检查API使用量
   - 考虑升级到付费账户

### 调试技巧

1. 使用测试页面验证API连接
2. 查看浏览器开发者工具的网络请求
3. 检查服务器日志
4. 使用命令行测试脚本

## 更新日志

- **v1.0.0**: 初始集成，支持基本食材图片获取
- 支持批量处理
- 添加错误处理和降级机制
- 创建测试页面和脚本

## 贡献

欢迎提交Issue和Pull Request来改进这个集成！ 