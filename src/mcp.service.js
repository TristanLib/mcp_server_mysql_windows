/**
 * MCP服务实现 - 使用官方MCP SDK
 */
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const dbService = require('./services/db.service');

// 添加调试日志
console.error("初始化MCP服务...");

// 创建MCP服务器实例
const server = new McpServer({
  name: "mysql-database",
  version: "1.0.0",
  capabilities: {
    // 添加必要的能力声明
    tools: true,  // 支持工具调用
    streaming: false,  // 不支持流式响应
  }
});

console.error("已创建MCP服务器实例");

// 注册执行查询工具
server.tool(
  "execute_query",
  "执行SQL查询",
  {
    sql: z.string().min(1).describe("SQL查询语句"),
    params: z.array(z.any()).optional().describe("查询参数"),
    limit: z.number().optional().describe("限制返回的记录数"),
    offset: z.number().optional().describe("跳过的记录数")
  },
  async ({ sql, params = [], limit = 10, offset = 0 }) => {
    console.error(`执行查询: ${sql}`);
    try {
      const result = await dbService.executeSelect(sql, params, limit, offset);
      console.error("查询执行成功");
      return {
        content: [
          {
            type: "text",
            text: `查询结果: ${JSON.stringify(result, null, 2)}`
          }
        ]
      };
    } catch (error) {
      console.error(`查询执行失败: ${error.message}`);
      throw new Error(`执行查询失败: ${error.message}`);
    }
  }
);

console.error("已注册execute_query工具");

// 注册获取表结构工具
server.tool(
  "get_table_structure",
  "获取数据库表结构",
  {
    database: z.string().min(1).describe("数据库名称"),
    table: z.string().min(1).describe("表名称")
  },
  async ({ database, table }) => {
    console.error(`获取表结构: ${database}.${table}`);
    try {
      const structure = await dbService.getTableStructure(database, table);
      console.error("获取表结构成功");
      return {
        content: [
          {
            type: "text",
            text: `表 ${database}.${table} 结构:\n${JSON.stringify(structure, null, 2)}`
          }
        ]
      };
    } catch (error) {
      console.error(`获取表结构失败: ${error.message}`);
      throw new Error(`获取表结构失败: ${error.message}`);
    }
  }
);

console.error("已注册get_table_structure工具");

// 注册获取数据库列表工具
server.tool(
  "list_databases",
  "获取所有数据库列表",
  {},
  async () => {
    console.error("获取数据库列表");
    try {
      const databases = await dbService.getDatabases();
      console.error("获取数据库列表成功");
      return {
        content: [
          {
            type: "text",
            text: `数据库列表:\n${JSON.stringify(databases, null, 2)}`
          }
        ]
      };
    } catch (error) {
      console.error(`获取数据库列表失败: ${error.message}`);
      throw new Error(`获取数据库列表失败: ${error.message}`);
    }
  }
);

console.error("已注册list_databases工具");

// 注册获取表列表工具
server.tool(
  "list_tables",
  "获取指定数据库的所有表",
  {
    database: z.string().min(1).describe("数据库名称")
  },
  async ({ database }) => {
    console.error(`获取表列表: ${database}`);
    try {
      const tables = await dbService.getTables(database);
      console.error("获取表列表成功");
      return {
        content: [
          {
            type: "text",
            text: `数据库 ${database} 的表列表:\n${JSON.stringify(tables, null, 2)}`
          }
        ]
      };
    } catch (error) {
      console.error(`获取表列表失败: ${error.message}`);
      throw new Error(`获取表列表失败: ${error.message}`);
    }
  }
);

console.error("已注册list_tables工具");

// 创建传输适配器
let transport = null;

// 启动MCP服务
async function startMcpServer(app) {
  try {
    console.error("=== 创建MCP传输适配器... ===");
    
    // 创建stdio传输
    transport = new StdioServerTransport();
    console.error("初始化MCP传输适配器成功");
    
    // 连接服务器到传输适配器
    console.error("开始连接MCP服务器到传输适配器...");
    await server.connect(transport);
    console.error("MCP服务已启动并连接到传输");
    
    return transport;
  } catch (error) {
    console.error("MCP服务启动错误:", error);
    throw error;
  }
}

// 创建一个单独的函数用于直接启动MCP服务
async function startStandaloneMcp() {
  try {
    console.error("=== 启动独立MCP服务... ===");
    console.error("进程ID:", process.pid);
    console.error("Node.js版本:", process.version);
    console.error("平台:", process.platform);
    
    // 创建stdio传输
    const transport = new StdioServerTransport();
    console.error("初始化MCP传输适配器成功");
    
    // 连接服务器到传输适配器
    console.error("开始连接MCP服务器到传输适配器...");
    await server.connect(transport);
    console.error("MCP服务已启动并连接到传输");
    
    // 添加服务发现信息
    console.error("服务发现信息:");
    console.error(`- 名称: ${server.name}`);
    console.error(`- 版本: ${server.version}`);
    console.error(`- 工具数量: ${Object.keys(server.registry).length}`);
    
    // 保持进程运行
    process.on('SIGINT', () => {
      console.error("收到中断信号，正在关闭服务...");
      process.exit(0);
    });
    
    console.error("MCP服务已准备好接收请求");
    
    // 发送就绪信号到stderr
    console.error("MCP_READY");
    
    return transport;
  } catch (error) {
    console.error("MCP服务启动错误:", error);
    throw error;
  }
}

// 检查是否直接运行此文件
if (require.main === module) {
  console.error("直接运行MCP服务...");
  startStandaloneMcp().catch(error => {
    console.error("启动MCP服务失败:", error);
    // 不立即退出，保持控制台窗口让错误可见
    console.error("出现错误，按任意键退出...");
  });
}

module.exports = {
  startMcpServer,
  startStandaloneMcp
}; 