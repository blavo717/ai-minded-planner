
export interface TestResult {
  testId: string;
  success: boolean;
  duration: number;
  result?: any;
  error?: string;
  timestamp: Date;
}

export interface TestSuiteResult {
  totalTests: number;
  successCount: number;
  failureCount: number;
  totalDuration: number;
  results: TestResult[];
}

export interface SystemHealthComponent {
  status: string;
  components?: Record<string, any>;
  metrics?: Record<string, any>;
}
