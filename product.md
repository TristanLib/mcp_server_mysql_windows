# MCP MySQL 本地数据库服务

## 项目概述

MCP MySQL服务是一个轻量级的个人使用服务程序，旨在提供一个简单、高效的方式来连接和操作本地MySQL数据库。该服务将作为Cursor的MCP服务使用，通过API接口使Cursor能够轻松地执行各种数据库操作，无需直接使用SQL命令或专业数据库管理工具。

## 项目目标

1. 简化与本地MySQL数据库的交互过程
2. 提供直观的API接口进行数据库操作
3. 确保数据库操作的安全性和稳定性
4. 提供必要的日志记录和错误处理
5. 支持基本的数据库管理功能
6. 支持作为Cursor的MCP服务集成

## 技术选型

- **后端框架**: Node.js + Express.js
- **数据库**: MySQL
- **API类型**: RESTful API + SSE (Server-Sent Events)
- **认证方式**: 简单的API密钥认证
- **开发语言**: JavaScript / TypeScript
- **文档**: Swagger / OpenAPI
- **测试工具**: Jest, Postman

## 功能列表

### 核心功能

1. **数据库连接管理**
   - 连接本地MySQL数据库
   - 支持连接池管理
   - 提供连接状态检查API

2. **数据查询操作**
   - 执行SELECT查询并返回结果
   - 支持参数化查询以防止SQL注入
   - 支持复杂查询条件构建
   - 分页查询支持

3. **数据修改操作**
   - 执行INSERT操作添加记录
   - 执行UPDATE操作更新记录
   - 执行DELETE操作删除记录
   - 支持批量操作

4. **表结构操作**
   - 获取表结构信息
   - 创建新表
   - 修改表结构
   - 删除表

5. **事务支持**
   - 开始事务
   - 提交事务
   - 回滚事务

### Cursor集成功能

1. **MCP服务配置**
   - 支持作为Cursor MCP服务注册
   - 提供配置界面集成
   - 支持SSE (Server-Sent Events) 推送能力

2. **命令行集成**
   - 提供command方式添加到Cursor MCP服务
   - 支持通过Cursor命令行界面执行数据库操作

3. **实时数据更新**
   - 通过SSE提供数据库变更的实时通知
   - 支持订阅特定表或查询的变更

4. **性能监控**
   - 查询执行时间统计
   - 连接池状态监控
   - 慢查询日志

## 开发步骤

### 第一阶段：基础架构搭建

1. 初始化Node.js项目
2. 安装必要的依赖包
3. 设置Express服务器
4. 配置MySQL连接
5. 实现基本的中间件（日志、错误处理等）
6. 设计API路由结构

### 第二阶段：核心功能实现

1. 实现数据库连接管理
2. 开发基本的CRUD操作API
3. 实现参数化查询功能
4. 添加简单的认证机制
5. 实现事务支持

### 第三阶段：Cursor集成功能开发

1. 实现SSE推送机制
2. 开发Cursor MCP服务注册功能
3. 实现command方式集成
4. 开发实时数据更新通知功能

### 第四阶段：测试和优化

1. 编写单元测试
2. 进行集成测试
3. 性能测试和优化
4. 安全性测试和加固

### 第五阶段：文档和部署

1. 编写API文档
2. 创建使用说明
3. 配置Cursor集成文档
4. 创建简单启动脚本

## 项目结构

```
mcp_server_mysql/
├── src/
│   ├── config/           # 配置文件
│   ├── controllers/      # 控制器
│   ├── middleware/       # 中间件
│   ├── models/           # 数据模型
│   ├── routes/           # API路由
│   ├── services/         # 业务逻辑
│   ├── utils/            # 工具函数
│   ├── cursor/           # Cursor集成相关
│   └── app.js            # 应用入口
├── tests/                # 测试文件
├── docs/                 # 文档
├── .env                  # 环境变量
├── package.json          # 依赖管理
└── README.md             # 项目说明
```

## 使用方式

### 本地部署

1. 克隆代码仓库
2. 安装依赖：`npm install`
3. 配置环境变量或.env文件
4. 启动服务：`npm start`

### 在Cursor中配置

#### SSE方式
```json
{
  "name": "MySQL数据库服务",
  "url": "http://localhost:3000/api/sse",
  "type": "sse"
}
```

#### Command方式
```json
{
  "name": "MySQL数据库服务",
  "command": "node /path/to/mcp_server_mysql/src/app.js",
  "type": "command"
}
```

### API调用示例

```javascript
// 查询示例
fetch('http://localhost:3000/api/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key'
  },
  body: JSON.stringify({
    sql: 'SELECT * FROM users WHERE age > ?',
    params: [18],
    limit: 10,
    offset: 0
  })
})
.then(response => response.json())
.then(data => console.log(data));

// SSE连接示例
const eventSource = new EventSource('http://localhost:3000/api/sse?apiKey=your-api-key');
eventSource.addEventListener('database-update', (event) => {
  const data = JSON.parse(event.data);
  console.log('数据库更新:', data);
});
```

## 安全性考虑

1. 仅限本地访问，不暴露到公网
2. 使用参数化查询防止SQL注入
3. 实现简单的API密钥认证
4. 限制查询复杂度和资源使用

## Cursor集成注意事项

1. 确保服务启动时能自动注册到Cursor MCP服务列表
2. 提供用户友好的错误信息
3. 遵循Cursor MCP服务的交互规范
4. 支持通过Cursor界面查看和管理数据库连接状态 