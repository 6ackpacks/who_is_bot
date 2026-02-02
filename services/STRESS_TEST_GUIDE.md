# Stress Testing Quick Start Guide

## Prerequisites

1. Ensure the backend server is running:
```bash
cd C:\Users\li\Downloads\who-is-the-bot\services
npm run start:prod
```

2. Verify server is accessible:
```bash
curl http://localhost:80/health
```

## Running the Stress Tests

### Full Test Suite (Recommended)
```bash
cd C:\Users\li\Downloads\who-is-the-bot\services
node stress-test.js
```

**Duration:** ~90 seconds
**Tests:** All 4 test scenarios

### Test Scenarios Included

1. **Database Connection Pool Test**
   - 20 concurrent requests
   - Tests connection pool capacity
   - Verifies no connection timeouts

2. **Mixed Operations Test** (30 seconds)
   - Simulates real user behavior
   - 5 users login
   - 5 users fetch content
   - 5 users submit judgments
   - 5 users post comments

3. **Long-Term Stability Test** (60 seconds)
   - 20 requests per second
   - Tests for memory leaks
   - Monitors performance degradation

4. **Error Recovery Test**
   - Tests invalid inputs
   - Tests authentication failures
   - Verifies system recovery

## Customizing Tests

Edit `stress-test.js` and modify the CONFIG object:

```javascript
const CONFIG = {
  baseUrl: 'http://localhost:80',
  totalUsers: 20,              // Number of concurrent users
  testDuration: 60000,         // Long test duration (ms)
  shortTestDuration: 30000,    // Short test duration (ms)
  requestsPerSecond: 20,       // Target throughput
  connectionPoolSize: 10,      // Expected DB pool size
};
```

## Understanding Test Results

### Success Criteria
- ✅ Error rate < 1%
- ✅ No connection errors
- ✅ No timeout errors
- ✅ Memory increase < 50%
- ✅ Response times < 1000ms average

### Key Metrics to Monitor

1. **Error Rate**
   - Target: < 1%
   - Current: 0.09%

2. **Response Times**
   - Login: ~89ms average
   - Content List: ~24ms average
   - Target: < 500ms average

3. **Memory Usage**
   - Monitor heap growth
   - Check for memory leaks
   - Current: 8.11% increase (good)

4. **Throughput**
   - Current: 23.56 req/s
   - Target: 20 req/s

## Interpreting Results

### Excellent Performance
```
Error Rate: < 0.5%
Avg Response Time: < 100ms
Memory Increase: < 10%
Connection Errors: 0
```

### Acceptable Performance
```
Error Rate: 0.5% - 1%
Avg Response Time: 100-500ms
Memory Increase: 10-30%
Connection Errors: 0
```

### Needs Optimization
```
Error Rate: > 1%
Avg Response Time: > 500ms
Memory Increase: > 30%
Connection Errors: > 0
```

## Troubleshooting

### Server Not Running
```bash
# Error: Cannot connect to server
# Solution: Start the server first
cd C:\Users\li\Downloads\who-is-the-bot\services
npm run start:prod
```

### High Error Rate
- Check database connection
- Verify .env configuration
- Check server logs: `services/server.log`

### Connection Errors
- Increase DB connection pool size in `.env`:
  ```
  DB_CONNECTION_LIMIT=20
  ```
- Restart server after changes

### Timeout Errors
- Check database performance
- Verify network connectivity
- Review slow queries

## Production Recommendations

### Before Production Deployment

1. **Run Extended Tests**
   ```javascript
   // Modify CONFIG in stress-test.js
   testDuration: 300000,  // 5 minutes
   totalUsers: 50,        // More users
   ```

2. **Monitor Key Metrics**
   - Set up APM (Application Performance Monitoring)
   - Configure alerts for error rate > 1%
   - Monitor database connection pool usage

3. **Adjust Connection Pool**
   ```bash
   # In .env
   DB_CONNECTION_LIMIT=20  # For 50+ concurrent users
   DB_QUEUE_LIMIT=100
   ```

### Scaling Guidelines

| Concurrent Users | DB Pool Size | Expected Performance |
|-----------------|--------------|---------------------|
| < 20            | 10           | Excellent           |
| 20-50           | 15-20        | Good                |
| 50-100          | 25-30        | Acceptable          |
| 100+            | 40-50        | Consider clustering |

## Files

- **Test Script:** `C:\Users\li\Downloads\who-is-the-bot\services\stress-test.js`
- **Test Report:** `C:\Users\li\Downloads\who-is-the-bot\services\STRESS_TEST_REPORT.md`
- **Quick Guide:** `C:\Users\li\Downloads\who-is-the-bot\services\STRESS_TEST_GUIDE.md`

## Support

For detailed analysis and recommendations, see:
`STRESS_TEST_REPORT.md`
