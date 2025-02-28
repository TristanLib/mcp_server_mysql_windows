/**
 * MCP MySQL服务主应用文件
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db.config');
const { apiKeyAuth } = require('./middleware/auth.middleware');
const databaseRoutes = require('./routes/database.routes');
const sseRoutes = require('./routes/sse.routes');
const { sendSystemEvent } = require('./services/sse.service');
const { startMcpServer } = require('./mcp.service');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 状态检查路由
app.get('/api/status', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    dbConnected
  });
});

// API路由 - 应用API密钥认证
app.use('/api', apiKeyAuth, databaseRoutes);

// SSE路由
app.use('/api', sseRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// 启动服务器
const server = app.listen(PORT, async () => {
  console.log(`MCP MySQL服务已启动，端口: ${PORT}`);
  
  // 测试数据库连接
  const dbConnected = await testConnection();
  if (dbConnected) {
    console.log('数据库连接成功');
    sendSystemEvent('server-start', { 
      message: '服务器启动成功',
      dbConnected: true
    });
    
    // 启动MCP服务
    try {
      await startMcpServer(app);
      console.log('MCP服务已启动');
    } catch (error) {
      console.error('MCP服务启动失败:', error);
    }
  } else {
    console.error('数据库连接失败');
    sendSystemEvent('server-start', { 
      message: '服务器启动，但数据库连接失败',
      dbConnected: false
    });
  }
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  sendSystemEvent('error', { message: '发生未捕获的异常', error: err.message });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  sendSystemEvent('error', { message: '发生未处理的Promise拒绝', error: reason });
});

// 为了便于测试
module.exports = app; 