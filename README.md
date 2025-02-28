# MCP MySQL 本地数据库服务

MCP MySQL服务是一个轻量级的个人使用服务程序，用于连接和操作本地MySQL数据库。此服务可作为Cursor的MCP服务使用，通过API接口使Cursor能够轻松地执行各种数据库操作。

## 特性

- 连接本地MySQL数据库
- 提供RESTful API进行数据库操作
- 支持参数化查询防止SQL注入
- 支持SSE (Server-Sent Events) 推送能力
- 支持作为Cursor MCP服务集成

## 快速开始

### 前置条件

- Node.js (v14+)
- MySQL服务器

### 安装

1. 克隆此仓库
2. 安装依赖
   ```
   npm install
   ```
3. 创建并配置`.env`文件
   ```
   # 服务器配置
   PORT=3000
   NODE_ENV=development

   # MySQL数据库配置
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=你的用户名
   DB_PASSWORD=你的密码
   DB_NAME=你的数据库名

   # API配置
   API_KEY=你的API密钥
   ```

### 运行

```
npm start
```

开发模式（自动重启）:
```
npm run dev
```

## API接口

### 获取所有数据库
```
GET /api/databases
```

### 获取数据库的所有表
```
GET /api/databases/:database/tables
```

### 获取表结构
```
GET /api/databases/:database/tables/:table/structure
```

### 执行查询
```
POST /api/query
Content-Type: application/json

{
  "sql": "SELECT * FROM users WHERE age > ?",
  "params": [18],
  "limit": 10,
  "offset": 0
}
```

### SSE连接
```
GET /api/sse?apiKey=your-api-key
```

## 在Cursor中使用

### SSE方式
```json
{
  "name": "MySQL数据库服务",
  "url": "http://localhost:3000/api/sse",
  "type": "sse"
}
```

### Command方式
```json
{
  "name": "MySQL数据库服务",
  "command": "node /path/to/mcp_server_mysql/src/app.js",
  "type": "command"
}
```

## 安全性考虑

- 此服务仅限本地使用，不建议暴露到公网
- 使用API密钥保护接口
- 默认只允许执行SELECT查询

## 许可证

MIT 