/**
 * SSE (Server-Sent Events) 服务
 */

// 存储所有已连接的SSE客户端
const clients = new Set();

/**
 * 添加新的SSE客户端
 * @param {Object} client - SSE客户端对象
 */
function addClient(client) {
  clients.add(client);
  console.log(`新的SSE客户端连接，当前连接数: ${clients.size}`);
  
  // 发送一个初始化消息
  sendEventToClient(client, 'connection', { message: '连接已建立' });
}

/**
 * 移除SSE客户端
 * @param {Object} client - SSE客户端对象
 */
function removeClient(client) {
  clients.delete(client);
  console.log(`SSE客户端断开连接，当前连接数: ${clients.size}`);
}

/**
 * 向特定客户端发送SSE事件
 * @param {Object} client - SSE客户端对象
 * @param {string} event - 事件名称
 * @param {Object} data - 事件数据
 */
function sendEventToClient(client, event, data) {
  if (!client.res || client.res.closed) {
    removeClient(client);
    return;
  }
  
  client.res.write(`event: ${event}\n`);
  client.res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * 向所有客户端广播SSE事件
 * @param {string} event - 事件名称
 * @param {Object} data - 事件数据
 */
function broadcastEvent(event, data) {
  clients.forEach(client => {
    try {
      sendEventToClient(client, event, data);
    } catch (error) {
      console.error(`向客户端发送事件失败:`, error);
      removeClient(client);
    }
  });
}

/**
 * 发送数据库变更事件
 * @param {string} database - 数据库名称
 * @param {string} table - 表名
 * @param {string} action - 动作类型 (select, insert, update, delete)
 * @param {Object} data - 相关数据
 */
function sendDatabaseEvent(database, table, action, data) {
  broadcastEvent('database-update', {
    timestamp: new Date().toISOString(),
    database,
    table,
    action,
    data
  });
}

/**
 * 发送系统事件
 * @param {string} type - 事件类型
 * @param {Object} data - 事件数据
 */
function sendSystemEvent(type, data) {
  broadcastEvent('system', {
    timestamp: new Date().toISOString(),
    type,
    ...data
  });
}

/**
 * 设置SSE请求的响应头和事件处理
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
function setupSSE(req, res) {
  // 设置SSE响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  // 创建一个客户端对象
  const client = { 
    id: Date.now(),
    res
  };
  
  // 添加客户端
  addClient(client);
  
  // 发送一个初始的保持连接活跃的消息
  sendEventToClient(client, 'ping', { time: new Date().toISOString() });
  
  // 发送Cursor MCP所需的事件
  sendCursorMCPEvents(client);
  
  // 设置保持活跃的间隔
  const pingInterval = setInterval(() => {
    sendEventToClient(client, 'ping', { time: new Date().toISOString() });
  }, 30000);
  
  // 当客户端断开连接时清理
  req.on('close', () => {
    clearInterval(pingInterval);
    removeClient(client);
  });
}

/**
 * 发送Cursor MCP所需的tools和resources事件
 * @param {Object} client - SSE客户端对象
 */
function sendCursorMCPEvents(client) {
  // 发送tools事件
  sendEventToClient(client, 'tools', [
    {
      name: "execute_query",
      description: "执行SQL查询",
      parameters: {
        type: "object",
        properties: {
          sql: {
            type: "string",
            description: "SQL查询语句"
          },
          params: {
            type: "array",
            items: {
              type: "string"
            },
            description: "查询参数"
          }
        },
        required: ["sql"]
      }
    },
    {
      name: "get_table_structure",
      description: "获取表结构",
      parameters: {
        type: "object",
        properties: {
          database: {
            type: "string",
            description: "数据库名称"
          },
          table: {
            type: "string",
            description: "表名称"
          }
        },
        required: ["database", "table"]
      }
    }
  ]);
  
  // 发送resources事件
  sendEventToClient(client, 'resources', [
    {
      type: "database",
      name: "mcp_system",
      description: "MCP系统数据库",
      tables: ["db_connections", "query_history", "settings"]
    }
  ]);
}

module.exports = {
  setupSSE,
  sendDatabaseEvent,
  sendSystemEvent,
  broadcastEvent
}; 