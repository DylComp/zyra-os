interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  fallbackModels: string[];
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  fallbackModels: [
    "claude-sonnet-4-6-20250514",
    "claude-haiku-4-5-20251001",
  ],
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBackoffDelay(attempt: number, config: RetryConfig): number {
  const exponential = config.baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * config.baseDelay;
  return Math.min(exponential + jitter, config.maxDelay);
}

export async function withRetry<T>(
  fn: (model: string) => Promise<T>,
  primaryModel: string,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const models = [primaryModel, ...cfg.fallbackModels.filter((m) => m !== primaryModel)];
  let lastError: Error | null = null;

  for (const model of models) {
    for (let attempt = 0; attempt < cfg.maxRetries; attempt++) {
      try {
        return await fn(model);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (lastError.message.includes("401") || lastError.message.includes("403")) {
          throw lastError;
        }

        if (attempt < cfg.maxRetries - 1) {
          await delay(getBackoffDelay(attempt, cfg));
        }
      }
    }
  }

  throw lastError || new Error("All retry attempts exhausted");
}

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}
