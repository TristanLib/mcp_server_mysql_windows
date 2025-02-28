/**
 * MySQL MCP服务独立启动脚本
 */
require('dotenv').config();
const { startStandaloneMcp } = require('./src/mcp.service');

// 直接调用启动函数，不要只是require模块
console.error('MySQL MCP服务启动脚本开始执行...');

// 添加未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  // 不要立即退出，让控制台保持打开以查看错误
  // 在实际环境中可能需要适当的等待时间后退出
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

// 延迟启动，确保所有调试输出可见
setTimeout(() => {
  startStandaloneMcp().catch(error => {
    console.error("启动MCP服务失败:", error);
    // 不立即退出，保持控制台窗口
    console.error("按任意键退出...");
  });
}, 500);

// 保持进程运行，不要轻易退出
console.error('MySQL MCP服务脚本已加载，准备启动服务...'); 