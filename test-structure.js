const http = require('http');

// 配置
const API_KEY = '123456';
const HOST = 'localhost';
const PORT = 3000;
const TIMEOUT = 10000; // 10秒超时

// 测试函数
async function testTableStructure() {
  console.log('开始测试表结构API...');
  
  try {
    console.log('发送请求前...');
    // 测试表结构API
    await makeRequest(`/api/databases/${encodeURIComponent('qas-master')}/tables/${encodeURIComponent('sys_user')}/structure`);
    
    console.log('\nAPI测试完成');
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

// 发送HTTP请求
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    console.log(`准备发送请求: ${method} ${path}`);
    
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: TIMEOUT
    };
    
    console.log('请求选项:', JSON.stringify(options));
    
    const req = http.request(options, (res) => {
      console.log('收到响应头:', res.statusCode, res.headers);
      
      let responseData = '';
      
      res.on('data', (chunk) => {
        console.log('接收数据块:', chunk.length, '字节');
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('响应结束');
        console.log(`\n===== ${path} =====`);
        console.log(`状态码: ${res.statusCode}`);
        try {
          const parsedData = JSON.parse(responseData);
          console.log('响应数据:', JSON.stringify(parsedData, null, 2));
        } catch (e) {
          console.log('响应数据长度:', responseData.length);
          console.log('响应数据前500个字符:', responseData.substring(0, 500));
          console.log('解析JSON失败:', e.message);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error(`请求错误 (${path}): ${error.message}`);
      reject(error);
    });
    
    req.on('timeout', () => {
      console.error(`请求超时 (${path})`);
      req.destroy();
      reject(new Error('请求超时'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    console.log('发送请求...');
    req.end();
    console.log('请求已发送');
  });
}

// 执行测试
console.log('开始执行测试...');
testTableStructure().then(() => {
  console.log('测试执行完成');
}).catch(err => {
  console.error('测试执行失败:', err);
}); 