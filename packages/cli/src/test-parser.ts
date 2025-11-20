// Test output parser for extracting test statistics from common test runners

export interface ParsedTestResult {
  framework: string | null;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration: number | null; // milliseconds
  coverage: number | null; // percentage
}

/**
 * Parse test output from various frameworks and extract statistics
 */
export function parseTestOutput(output: string): ParsedTestResult | null {
  const result: ParsedTestResult = {
    framework: null,
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0,
    duration: null,
    coverage: null,
  };

  // Detect framework and parse accordingly
  if (output.includes('PASS') && output.includes('FAIL') || output.includes('Test Suites:')) {
    // Jest/Vitest
    result.framework = parseJestVitestOutput(output, result);
  } else if (output.includes('passing') && output.includes('failing')) {
    // Mocha
    result.framework = parseMochaOutput(output, result);
  } else if (output.includes('passed') && output.includes('failed') && output.includes('pytest')) {
    // pytest
    result.framework = parsePytestOutput(output, result);
  } else if (output.includes('OK') && output.includes('test')) {
    // Python unittest
    result.framework = parseUnittestOutput(output, result);
  } else {
    // Try generic parsing
    return parseGenericOutput(output);
  }

  // Calculate total if not set
  if (result.total === 0) {
    result.total = result.passed + result.failed + result.skipped;
  }

  return result.total > 0 ? result : null;
}

/**
 * Parse Jest/Vitest output
 */
function parseJestVitestOutput(output: string, result: ParsedTestResult): string {
  // Jest format:
  // Test Suites: 2 failed, 1 passed, 3 total
  // Tests:       5 failed, 10 passed, 15 total
  // Time:        2.345 s
  
  const testSuitesMatch = output.match(/Test Suites:.*?(\d+)\s+passed/i);
  const testsMatch = output.match(/Tests:\s+(?:(\d+)\s+failed,?\s*)?(?:(\d+)\s+skipped,?\s*)?(?:(\d+)\s+passed)/i);
  const totalMatch = output.match(/Tests:.*?(\d+)\s+total/i);
  const timeMatch = output.match(/Time:\s+([\d.]+)\s*s/i);
  const coverageMatch = output.match(/All files\s*\|\s*([\d.]+)/);
  
  if (testsMatch) {
    result.failed = testsMatch[1] ? parseInt(testsMatch[1], 10) : 0;
    result.skipped = testsMatch[2] ? parseInt(testsMatch[2], 10) : 0;
    result.passed = testsMatch[3] ? parseInt(testsMatch[3], 10) : 0;
  }
  
  if (totalMatch) {
    result.total = parseInt(totalMatch[1], 10);
  }
  
  if (timeMatch) {
    result.duration = Math.floor(parseFloat(timeMatch[1]) * 1000);
  }
  
  if (coverageMatch) {
    result.coverage = parseFloat(coverageMatch[1]);
  }
  
  // Determine if Jest or Vitest
  return output.includes('vitest') ? 'vitest' : 'jest';
}

/**
 * Parse Mocha output
 */
function parseMochaOutput(output: string, result: ParsedTestResult): string {
  // Mocha format:
  // 10 passing (234ms)
  // 2 failing
  // 1 pending
  
  const passingMatch = output.match(/(\d+)\s+passing/i);
  const failingMatch = output.match(/(\d+)\s+failing/i);
  const pendingMatch = output.match(/(\d+)\s+pending/i);
  const timeMatch = output.match(/passing\s+\((\d+)ms\)/i);
  
  if (passingMatch) {
    result.passed = parseInt(passingMatch[1], 10);
  }
  
  if (failingMatch) {
    result.failed = parseInt(failingMatch[1], 10);
  }
  
  if (pendingMatch) {
    result.skipped = parseInt(pendingMatch[1], 10);
  }
  
  if (timeMatch) {
    result.duration = parseInt(timeMatch[1], 10);
  }
  
  return 'mocha';
}

/**
 * Parse pytest output
 */
function parsePytestOutput(output: string, result: ParsedTestResult): string {
  // pytest format:
  // ===== 10 passed, 2 failed, 1 skipped in 2.34s =====
  
  const statsMatch = output.match(/=+\s*(?:(\d+)\s+passed)?(?:,\s*(\d+)\s+failed)?(?:,\s*(\d+)\s+skipped)?(?:\s+in\s+([\d.]+)s)?/i);
  
  if (statsMatch) {
    result.passed = statsMatch[1] ? parseInt(statsMatch[1], 10) : 0;
    result.failed = statsMatch[2] ? parseInt(statsMatch[2], 10) : 0;
    result.skipped = statsMatch[3] ? parseInt(statsMatch[3], 10) : 0;
    
    if (statsMatch[4]) {
      result.duration = Math.floor(parseFloat(statsMatch[4]) * 1000);
    }
  }
  
  // Coverage
  const coverageMatch = output.match(/TOTAL\s+\d+\s+\d+\s+(\d+)%/);
  if (coverageMatch) {
    result.coverage = parseInt(coverageMatch[1], 10);
  }
  
  return 'pytest';
}

/**
 * Parse Python unittest output
 */
function parseUnittestOutput(output: string, result: ParsedTestResult): string {
  // unittest format:
  // Ran 15 tests in 2.345s
  // OK
  // or FAILED (failures=2, errors=1)
  
  const ranMatch = output.match(/Ran\s+(\d+)\s+tests?\s+in\s+([\d.]+)s/i);
  const failedMatch = output.match(/FAILED\s*\((?:failures=(\d+))?(?:,\s*errors=(\d+))?\)/i);
  
  if (ranMatch) {
    result.total = parseInt(ranMatch[1], 10);
    result.duration = Math.floor(parseFloat(ranMatch[2]) * 1000);
  }
  
  if (failedMatch) {
    const failures = failedMatch[1] ? parseInt(failedMatch[1], 10) : 0;
    const errors = failedMatch[2] ? parseInt(failedMatch[2], 10) : 0;
    result.failed = failures + errors;
    result.passed = result.total - result.failed;
  } else if (output.includes('OK')) {
    result.passed = result.total;
  }
  
  return 'unittest';
}

/**
 * Generic parser for unrecognized frameworks
 */
function parseGenericOutput(output: string): ParsedTestResult | null {
  const result: ParsedTestResult = {
    framework: 'unknown',
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0,
    duration: null,
    coverage: null,
  };
  
  // Try to find common patterns
  const patterns = [
    { regex: /(\d+)\s+(?:test(?:s)?|spec(?:s)?)\s+passed/i, key: 'passed' },
    { regex: /(\d+)\s+(?:test(?:s)?|spec(?:s)?)\s+failed/i, key: 'failed' },
    { regex: /(\d+)\s+(?:test(?:s)?|spec(?:s)?)\s+skipped/i, key: 'skipped' },
    { regex: /✓\s*(\d+)/i, key: 'passed' },
    { regex: /✗\s*(\d+)/i, key: 'failed' },
  ];
  
  for (const pattern of patterns) {
    const match = output.match(pattern.regex);
    if (match && pattern.key in result) {
      result[pattern.key as 'passed' | 'failed' | 'skipped'] = parseInt(match[1], 10);
    }
  }
  
  result.total = result.passed + result.failed + result.skipped;
  
  return result.total > 0 ? result : null;
}

/**
 * Check if output appears to be from a test command
 */
export function isTestOutput(output: string): boolean {
  const testIndicators = [
    'Test Suites:',
    'Tests:',
    'passing',
    'failing',
    'passed',
    'failed',
    'skipped',
    'pytest',
    'Ran',
    'test',
    'spec',
    'PASS',
    'FAIL',
  ];
  
  return testIndicators.some(indicator => output.includes(indicator));
}


