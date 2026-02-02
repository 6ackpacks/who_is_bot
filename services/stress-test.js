/**
 * Comprehensive Stress Testing Script
 *
 * Tests:
 * 1. Database connection pool under load
 * 2. Mixed operations simulating real user behavior
 * 3. Long-term stability test
 * 4. Error recovery capabilities
 *
 * Requirements:
 * - Server must be running on http://localhost:80
 * - Database must be accessible
 */

const http = require('http');
const https = require('https');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:80',
  totalUsers: 20,
  testDuration: 60000, // 1 minute in milliseconds
  shortTestDuration: 30000, // 30 seconds
  requestsPerSecond: 20,
  connectionPoolSize: 10, // Current DB pool size
};

// Test statistics
const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  errors: [],
  responseTimes: [],
  requestsByType: {
    login: { success: 0, failed: 0, times: [] },
    contentList: { success: 0, failed: 0, times: [] },
    judgment: { success: 0, failed: 0, times: [] },
    comment: { success: 0, failed: 0, times: [] },
  },
  connectionErrors: 0,
  timeoutErrors: 0,
  startTime: null,
  endTime: null,
  memoryUsage: [],
};

// Test users data
const testUsers = Array.from({ length: CONFIG.totalUsers }, (_, i) => ({
  nickname: `TestUser${i + 1}`,
  avatar: `https://example.com/avatar${i + 1}.jpg`,
  token: null,
  userId: null, // Will be set after login
}));

// Utility: Make HTTP request
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const protocol = options.protocol === 'https:' ? https : http;

    const req = protocol.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData,
            responseTime,
            headers: res.headers,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data,
            responseTime,
            headers: res.headers,
          });
        }
      });
    });

    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      reject({
        error: error.message,
        responseTime,
        type: 'connection_error',
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      reject({
        error: 'Request timeout',
        responseTime,
        type: 'timeout_error',
      });
    });

    req.setTimeout(10000); // 10 second timeout

    if (postData) {
      req.write(JSON.stringify(postData));
    }

    req.end();
  });
}

// Test 1: User Login
async function testLogin(user) {
  const url = new URL(`${CONFIG.baseUrl}/auth/mock-login`);

  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const postData = {
    nickname: user.nickname,
    avatar: user.avatar,
  };

  try {
    const response = await makeRequest(options, postData);
    stats.requestsByType.login.times.push(response.responseTime);

    if (response.statusCode === 200 || response.statusCode === 201) {
      stats.requestsByType.login.success++;
      stats.successfulRequests++;

      // Extract token and userId
      if (response.data && response.data.data) {
        if (response.data.data.token) {
          user.token = response.data.data.token;
        }
        if (response.data.data.user && response.data.data.user.id) {
          user.userId = response.data.data.user.id;
        }
      }

      return { success: true, response };
    } else {
      stats.requestsByType.login.failed++;
      stats.failedRequests++;
      stats.errors.push({
        type: 'login',
        statusCode: response.statusCode,
        message: response.data,
      });
      return { success: false, response };
    }
  } catch (error) {
    stats.requestsByType.login.failed++;
    stats.failedRequests++;

    if (error.type === 'connection_error') {
      stats.connectionErrors++;
    } else if (error.type === 'timeout_error') {
      stats.timeoutErrors++;
    }

    stats.errors.push({
      type: 'login',
      error: error.error,
      errorType: error.type,
    });

    return { success: false, error };
  } finally {
    stats.totalRequests++;
  }
}

// Test 2: Get Content List
async function testGetContentList(user) {
  const url = new URL(`${CONFIG.baseUrl}/content/feed?limit=10`);

  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname + url.search,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await makeRequest(options);
    stats.requestsByType.contentList.times.push(response.responseTime);

    if (response.statusCode === 200) {
      stats.requestsByType.contentList.success++;
      stats.successfulRequests++;
      return { success: true, response };
    } else {
      stats.requestsByType.contentList.failed++;
      stats.failedRequests++;
      stats.errors.push({
        type: 'contentList',
        statusCode: response.statusCode,
        message: response.data,
      });
      return { success: false, response };
    }
  } catch (error) {
    stats.requestsByType.contentList.failed++;
    stats.failedRequests++;

    if (error.type === 'connection_error') {
      stats.connectionErrors++;
    } else if (error.type === 'timeout_error') {
      stats.timeoutErrors++;
    }

    stats.errors.push({
      type: 'contentList',
      error: error.error,
      errorType: error.type,
    });

    return { success: false, error };
  } finally {
    stats.totalRequests++;
  }
}

// Test 3: Submit Judgment
async function testSubmitJudgment(user, contentId = 'test_content_1') {
  if (!user.token) {
    return { success: false, error: 'No token available' };
  }

  const url = new URL(`${CONFIG.baseUrl}/judgment/submit`);

  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`,
    },
  };

  const postData = {
    contentId: contentId,
    isBot: Math.random() > 0.5,
  };

  try {
    const response = await makeRequest(options, postData);
    stats.requestsByType.judgment.times.push(response.responseTime);

    if (response.statusCode === 200 || response.statusCode === 201) {
      stats.requestsByType.judgment.success++;
      stats.successfulRequests++;
      return { success: true, response };
    } else {
      stats.requestsByType.judgment.failed++;
      stats.failedRequests++;
      stats.errors.push({
        type: 'judgment',
        statusCode: response.statusCode,
        message: response.data,
      });
      return { success: false, response };
    }
  } catch (error) {
    stats.requestsByType.judgment.failed++;
    stats.failedRequests++;

    if (error.type === 'connection_error') {
      stats.connectionErrors++;
    } else if (error.type === 'timeout_error') {
      stats.timeoutErrors++;
    }

    stats.errors.push({
      type: 'judgment',
      error: error.error,
      errorType: error.type,
    });

    return { success: false, error };
  } finally {
    stats.totalRequests++;
  }
}

// Test 4: Post Comment
async function testPostComment(user, contentId = 'test_content_1') {
  if (!user.token) {
    return { success: false, error: 'No token available' };
  }

  const url = new URL(`${CONFIG.baseUrl}/comments`);

  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`,
    },
  };

  const postData = {
    contentId: contentId,
    content: `Test comment from ${user.nickname} at ${Date.now()}`,
  };

  try {
    const response = await makeRequest(options, postData);
    stats.requestsByType.comment.times.push(response.responseTime);

    if (response.statusCode === 200 || response.statusCode === 201) {
      stats.requestsByType.comment.success++;
      stats.successfulRequests++;
      return { success: true, response };
    } else {
      stats.requestsByType.comment.failed++;
      stats.failedRequests++;
      stats.errors.push({
        type: 'comment',
        statusCode: response.statusCode,
        message: response.data,
      });
      return { success: false, response };
    }
  } catch (error) {
    stats.requestsByType.comment.failed++;
    stats.failedRequests++;

    if (error.type === 'connection_error') {
      stats.connectionErrors++;
    } else if (error.type === 'timeout_error') {
      stats.timeoutErrors++;
    }

    stats.errors.push({
      type: 'comment',
      error: error.error,
      errorType: error.type,
    });

    return { success: false, error };
  } finally {
    stats.totalRequests++;
  }
}

// Calculate statistics
function calculateStats(times) {
  if (times.length === 0) {
    return { min: 0, max: 0, avg: 0, median: 0, p95: 0, p99: 0 };
  }

  const sorted = times.slice().sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / sorted.length,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
  };
}

// Memory monitoring
function recordMemoryUsage() {
  const usage = process.memoryUsage();
  stats.memoryUsage.push({
    timestamp: Date.now(),
    heapUsed: usage.heapUsed / 1024 / 1024, // MB
    heapTotal: usage.heapTotal / 1024 / 1024, // MB
    external: usage.external / 1024 / 1024, // MB
    rss: usage.rss / 1024 / 1024, // MB
  });
}

// Print report
function printReport() {
  console.log('\n' + '='.repeat(80));
  console.log('STRESS TEST REPORT');
  console.log('='.repeat(80));

  const duration = (stats.endTime - stats.startTime) / 1000;
  const errorRate = (stats.failedRequests / stats.totalRequests * 100).toFixed(2);
  const throughput = (stats.totalRequests / duration).toFixed(2);

  console.log('\n--- OVERALL STATISTICS ---');
  console.log(`Test Duration: ${duration.toFixed(2)} seconds`);
  console.log(`Total Requests: ${stats.totalRequests}`);
  console.log(`Successful Requests: ${stats.successfulRequests}`);
  console.log(`Failed Requests: ${stats.failedRequests}`);
  console.log(`Error Rate: ${errorRate}%`);
  console.log(`Throughput: ${throughput} requests/second`);
  console.log(`Connection Errors: ${stats.connectionErrors}`);
  console.log(`Timeout Errors: ${stats.timeoutErrors}`);

  console.log('\n--- REQUEST TYPE BREAKDOWN ---');
  for (const [type, data] of Object.entries(stats.requestsByType)) {
    const total = data.success + data.failed;
    const successRate = total > 0 ? (data.success / total * 100).toFixed(2) : 0;
    const typeStats = calculateStats(data.times);

    console.log(`\n${type.toUpperCase()}:`);
    console.log(`  Total: ${total}`);
    console.log(`  Success: ${data.success} (${successRate}%)`);
    console.log(`  Failed: ${data.failed}`);

    if (data.times.length > 0) {
      console.log(`  Response Times (ms):`);
      console.log(`    Min: ${typeStats.min.toFixed(2)}`);
      console.log(`    Max: ${typeStats.max.toFixed(2)}`);
      console.log(`    Avg: ${typeStats.avg.toFixed(2)}`);
      console.log(`    Median: ${typeStats.median.toFixed(2)}`);
      console.log(`    P95: ${typeStats.p95.toFixed(2)}`);
      console.log(`    P99: ${typeStats.p99.toFixed(2)}`);
    }
  }

  // Memory usage analysis
  if (stats.memoryUsage.length > 0) {
    const firstMem = stats.memoryUsage[0];
    const lastMem = stats.memoryUsage[stats.memoryUsage.length - 1];
    const memIncrease = lastMem.heapUsed - firstMem.heapUsed;
    const memIncreasePercent = (memIncrease / firstMem.heapUsed * 100).toFixed(2);

    console.log('\n--- MEMORY USAGE ---');
    console.log(`Initial Heap Used: ${firstMem.heapUsed.toFixed(2)} MB`);
    console.log(`Final Heap Used: ${lastMem.heapUsed.toFixed(2)} MB`);
    console.log(`Memory Increase: ${memIncrease.toFixed(2)} MB (${memIncreasePercent}%)`);
    console.log(`Peak RSS: ${Math.max(...stats.memoryUsage.map(m => m.rss)).toFixed(2)} MB`);

    if (memIncreasePercent > 50) {
      console.log('  ⚠️  WARNING: Significant memory increase detected! Possible memory leak.');
    }
  }

  // Error analysis
  if (stats.errors.length > 0) {
    console.log('\n--- ERROR ANALYSIS ---');
    console.log(`Total Errors: ${stats.errors.length}`);

    // Group errors by type
    const errorsByType = {};
    stats.errors.forEach(err => {
      const key = err.type || 'unknown';
      if (!errorsByType[key]) {
        errorsByType[key] = [];
      }
      errorsByType[key].push(err);
    });

    for (const [type, errors] of Object.entries(errorsByType)) {
      console.log(`\n${type}: ${errors.length} errors`);
      // Show first 3 errors of each type
      errors.slice(0, 3).forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${JSON.stringify(err, null, 2)}`);
      });
      if (errors.length > 3) {
        console.log(`  ... and ${errors.length - 3} more`);
      }
    }
  }

  // Recommendations
  console.log('\n--- RECOMMENDATIONS ---');

  if (errorRate > 1) {
    console.log('❌ Error rate is above 1% - System needs optimization');
  } else {
    console.log('✅ Error rate is acceptable (< 1%)');
  }

  if (stats.connectionErrors > 0) {
    console.log(`⚠️  ${stats.connectionErrors} connection errors detected`);
    console.log('   Consider increasing database connection pool size');
    console.log(`   Current pool size: ${CONFIG.connectionPoolSize}`);
    console.log(`   Recommended: ${Math.max(CONFIG.connectionPoolSize, CONFIG.totalUsers)}`);
  }

  if (stats.timeoutErrors > 0) {
    console.log(`⚠️  ${stats.timeoutErrors} timeout errors detected`);
    console.log('   Some requests are taking too long to complete');
    console.log('   Consider optimizing database queries or increasing server resources');
  }

  const allTimes = Object.values(stats.requestsByType)
    .flatMap(type => type.times);
  const overallStats = calculateStats(allTimes);

  if (overallStats.avg > 1000) {
    console.log('⚠️  Average response time is above 1 second');
    console.log('   Consider adding database indexes or caching');
  } else if (overallStats.avg > 500) {
    console.log('⚠️  Average response time is above 500ms');
    console.log('   Performance could be improved');
  } else {
    console.log('✅ Response times are good');
  }

  console.log('\n' + '='.repeat(80));
}

// Test Scenario 1: Database Connection Pool Test
async function testConnectionPool() {
  console.log('\n' + '='.repeat(80));
  console.log('TEST 1: DATABASE CONNECTION POOL TEST');
  console.log('='.repeat(80));
  console.log(`Sending ${CONFIG.totalUsers} concurrent requests...`);
  console.log(`Current connection pool size: ${CONFIG.connectionPoolSize}`);

  const promises = testUsers.map(user => testGetContentList(user));
  await Promise.all(promises);

  console.log('✓ Connection pool test completed');
}

// Test Scenario 2: Mixed Operations Test
async function testMixedOperations() {
  console.log('\n' + '='.repeat(80));
  console.log('TEST 2: MIXED OPERATIONS STRESS TEST');
  console.log('='.repeat(80));
  console.log(`Duration: ${CONFIG.shortTestDuration / 1000} seconds`);
  console.log('Simulating real user behavior...');

  const startTime = Date.now();
  const operations = [];

  // Divide users into 4 groups
  const groupSize = Math.floor(CONFIG.totalUsers / 4);
  const loginUsers = testUsers.slice(0, groupSize);
  const contentUsers = testUsers.slice(groupSize, groupSize * 2);
  const judgmentUsers = testUsers.slice(groupSize * 2, groupSize * 3);
  const commentUsers = testUsers.slice(groupSize * 3);

  // First, login all users who need authentication
  console.log('Logging in users...');
  await Promise.all([...judgmentUsers, ...commentUsers].map(user => testLogin(user)));

  // Run mixed operations
  while (Date.now() - startTime < CONFIG.shortTestDuration) {
    // 5 users login
    operations.push(...loginUsers.map(user => testLogin(user)));

    // 5 users get content list
    operations.push(...contentUsers.map(user => testGetContentList(user)));

    // 5 users submit judgment
    operations.push(...judgmentUsers.map(user => testSubmitJudgment(user)));

    // 5 users post comment
    operations.push(...commentUsers.map(user => testPostComment(user)));

    // Execute batch
    await Promise.all(operations);
    operations.length = 0;

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('✓ Mixed operations test completed');
}

// Test Scenario 3: Long-term Stability Test
async function testLongTermStability() {
  console.log('\n' + '='.repeat(80));
  console.log('TEST 3: LONG-TERM STABILITY TEST');
  console.log('='.repeat(80));
  console.log(`Duration: ${CONFIG.testDuration / 1000} seconds`);
  console.log(`Target: ${CONFIG.requestsPerSecond} requests/second`);

  // Login all users first
  console.log('Logging in all users...');
  await Promise.all(testUsers.map(user => testLogin(user)));

  const startTime = Date.now();
  const interval = 1000 / CONFIG.requestsPerSecond; // ms between requests
  let requestCount = 0;

  // Start memory monitoring
  const memoryMonitor = setInterval(() => {
    recordMemoryUsage();
  }, 5000); // Every 5 seconds

  while (Date.now() - startTime < CONFIG.testDuration) {
    const batchStart = Date.now();

    // Send batch of requests
    const promises = [];
    for (let i = 0; i < CONFIG.requestsPerSecond; i++) {
      const user = testUsers[requestCount % testUsers.length];
      const operation = requestCount % 4;

      switch (operation) {
        case 0:
          promises.push(testGetContentList(user));
          break;
        case 1:
          promises.push(testSubmitJudgment(user));
          break;
        case 2:
          promises.push(testPostComment(user));
          break;
        case 3:
          promises.push(testLogin(user));
          break;
      }

      requestCount++;
    }

    await Promise.all(promises);

    // Wait for next second
    const elapsed = Date.now() - batchStart;
    const waitTime = Math.max(0, 1000 - elapsed);
    await new Promise(resolve => setTimeout(resolve, waitTime));

    // Progress indicator
    const progress = ((Date.now() - startTime) / CONFIG.testDuration * 100).toFixed(1);
    process.stdout.write(`\rProgress: ${progress}%`);
  }

  clearInterval(memoryMonitor);
  console.log('\n✓ Long-term stability test completed');
}

// Test Scenario 4: Error Recovery Test
async function testErrorRecovery() {
  console.log('\n' + '='.repeat(80));
  console.log('TEST 4: ERROR RECOVERY TEST');
  console.log('='.repeat(80));
  console.log('Testing system recovery from errors...');

  // Test with invalid data
  const invalidUser = { nickname: '', avatar: '' };
  await testLogin(invalidUser);

  // Test with missing token
  const noTokenUser = { nickname: 'test', token: null };
  await testSubmitJudgment(noTokenUser);
  await testPostComment(noTokenUser);

  // Test with invalid token
  const invalidTokenUser = { nickname: 'test', token: 'invalid_token' };
  await testSubmitJudgment(invalidTokenUser);

  // Verify system can still handle valid requests
  const validUser = testUsers[0];
  await testLogin(validUser);
  await testGetContentList(validUser);

  console.log('✓ Error recovery test completed');
}

// Main test runner
async function runTests() {
  console.log('Starting Comprehensive Stress Test Suite');
  console.log(`Target Server: ${CONFIG.baseUrl}`);
  console.log(`Total Test Users: ${CONFIG.totalUsers}`);
  console.log(`Database Connection Pool: ${CONFIG.connectionPoolSize}`);

  // Check if server is running
  try {
    await testGetContentList(testUsers[0]);
    console.log('✓ Server is accessible');
  } catch (error) {
    console.error('❌ Cannot connect to server. Please ensure the server is running.');
    process.exit(1);
  }

  stats.startTime = Date.now();

  try {
    // Run all test scenarios
    await testConnectionPool();
    await testMixedOperations();
    await testLongTermStability();
    await testErrorRecovery();

    stats.endTime = Date.now();

    // Generate report
    printReport();

    // Exit with appropriate code
    const errorRate = (stats.failedRequests / stats.totalRequests * 100);
    if (errorRate > 1) {
      console.log('\n❌ Tests completed with high error rate');
      process.exit(1);
    } else {
      console.log('\n✅ All tests completed successfully');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests();
