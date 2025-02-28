/**
 * 认证中间件
 */
require('dotenv').config();

/**
 * API密钥验证中间件
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
function apiKeyAuth(req, res, next) {
  // 从请求头或查询参数中获取API密钥
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const configApiKey = process.env.API_KEY;

  // 检查环境变量中是否配置了API密钥
  if (!configApiKey) {
    console.warn('警告: 未配置API密钥，禁用认证');
    return next();
  }

  // 验证API密钥
  if (!apiKey || apiKey !== configApiKey) {
    return res.status(401).json({
      success: false,
      message: 'API密钥无效或缺失'
    });
  }

  next();
}

module.exports = {
  apiKeyAuth
}; 