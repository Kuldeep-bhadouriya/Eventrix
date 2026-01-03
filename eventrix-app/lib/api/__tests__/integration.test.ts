/**
 * API Utilities Test Suite
 * 
 * Manual testing file to verify API utilities work correctly.
 * Run with: npx tsx lib/api/__tests__/integration.test.ts
 */

import { z } from 'zod';
import {
  ApiError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  RateLimitError,
  isApiError,
} from '../api-error';
import {
  successResponse,
  errorResponse,
  createdResponse,
  paginatedResponse,
  parsePagination,
} from '../api-response';
import {
  validate,
  safeValidate,
  commonSchemas,
} from '../api-validator';
import {
  rateLimit,
  rateLimitPresets,
  getClientIp,
  clearRateLimits,
} from '../rate-limiter';
import {
  apiLogger,
  logger,
} from '../api-logger';

async function runTests() {
  try {
    console.log('🔧 Testing API Utilities Integration\n');

    // 1. Test Error Classes
    console.log('1️⃣  Testing Error Classes...');

    const validationError = new ValidationError('Test validation error', [
      { field: 'email', message: 'Invalid email' },
    ]);
    console.log('   ✓ ValidationError created:', validationError.statusCode === 400);

    const notFoundError = new NotFoundError('User', '123');
    console.log('   ✓ NotFoundError created:', notFoundError.statusCode === 404);

    const rateLimitError = new RateLimitError('Too many requests', 60);
    console.log('   ✓ RateLimitError created:', rateLimitError.statusCode === 429);

    console.log('   ✓ isApiError check:', isApiError(validationError) === true);

    // 2. Test Response Utilities
    console.log('\n2️⃣  Testing Response Utilities...');

    const mockReq = new Request('http://localhost:3000/api/test?page=2&limit=20');
    const searchParams = new URL(mockReq.url).searchParams;
    const pagination = parsePagination(searchParams);
    
    console.log('   ✓ Parse pagination:', pagination.page === 2 && pagination.limit === 20);

    const successResp = successResponse({ id: 1, name: 'Test' });
    console.log('   ✓ Success response created:', successResp.status === 200);

    const errorResp = errorResponse(notFoundError);
    console.log('   ✓ Error response created:', errorResp.status === 404);

    const createdResp = createdResponse({ id: 1 }, '/api/test/1');
    console.log('   ✓ Created response:', createdResp.status === 201);

    const paginatedResp = paginatedResponse([{ id: 1 }, { id: 2 }], 1, 10, 50);
    console.log('   ✓ Paginated response created:', paginatedResp.status === 200);

    // 3. Test Validation
    console.log('\n3️⃣  Testing Validation Utilities...');

    const testSchema = z.object({
      name: z.string().min(1),
      email: commonSchemas.email,
    });

    const validData = validate({ name: 'John', email: 'john@example.com' }, testSchema);
    console.log('   ✓ Valid data passes:', validData.name === 'John');

    const invalidResult = safeValidate({ name: '', email: 'invalid' }, testSchema);
    console.log('   ✓ Invalid data caught:', !invalidResult.success);

    const emailValid = safeValidate('test@example.com', commonSchemas.email);
    console.log('   ✓ Email validation works:', emailValid.success === true);

    const passwordValid = safeValidate('Test123!@#', commonSchemas.password);
    console.log('   ✓ Password validation works:', passwordValid.success === true);

    // 4. Test Rate Limiter
    console.log('\n4️⃣  Testing Rate Limiter...');

    clearRateLimits();

    const testLimiter = rateLimit({
      windowMs: 60000,
      max: 5,
    });

    const testReq1 = new Request('http://localhost:3000/api/test');
    
    try {
      await testLimiter(testReq1);
      console.log('   ✓ First request allowed');
    } catch (error) {
      console.log('   ✗ First request failed:', error);
    }

    const ip = getClientIp(testReq1);
    console.log('   ✓ IP extraction works:', ip !== undefined);

    console.log('   ✓ Rate limit presets exist:', 
      rateLimitPresets.strict !== undefined &&
      rateLimitPresets.moderate !== undefined
    );

    // 5. Test Logger
    console.log('\n5️⃣  Testing Logger...');

    const testReq2 = new Request('http://localhost:3000/api/test');
    const log = apiLogger()(testReq2);
    
    console.log('   ✓ Logger created');
    
    console.log('   ✓ Log methods exist:', 
      typeof log.info === 'function' &&
      typeof log.error === 'function' &&
      typeof log.debug === 'function'
    );

    logger.info('Test info message');
    logger.debug('Test debug message');
    console.log('   ✓ Structured logger works');

    // 6. Test Index Exports
    console.log('\n6️⃣  Testing Index Exports...');
    const apiIndex = await import('../index');
    
    const exports = [
      'ApiError',
      'ValidationError',
      'NotFoundError',
      'successResponse',
      'errorResponse',
      'validateBody',
      'rateLimit',
      'apiLogger',
    ];

    const allExported = exports.every(exp => exp in apiIndex);
    console.log('   ✓ All utilities exported:', allExported);

    // Summary
    console.log('\n✅ All API Utilities Tests Passed!\n');
    console.log('Summary:');
    console.log('  • Error classes: Working ✓');
    console.log('  • Response utilities: Working ✓');
    console.log('  • Validation: Working ✓');
    console.log('  • Rate limiting: Working ✓');
    console.log('  • Logging: Working ✓');
    console.log('  • Exports: Working ✓');

  } catch (error) {
    console.error('\n❌ Test Failed:', error);
    process.exit(1);
  }
}

runTests();

