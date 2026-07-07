export class RetryStrategy {
    config;
    constructor(config) {
        this.config = config;
    }
    shouldContinue(context) {
        context.iterations++;
        if (context.iterations > this.config.max_request_iterations) {
            return {
                canContinue: false,
                error: `Exceeded max iterations (${this.config.max_request_iterations})`
            };
        }
        const elapsed = Date.now() - context.startTime - context.excludedMs;
        if (elapsed > this.config.request_timeout_ms) {
            return {
                canContinue: false,
                error: 'Request timeout'
            };
        }
        return { canContinue: true };
    }
    markSleep(context, ms) {
        context.excludedMs += Math.max(0, ms);
    }
    createContext() {
        return {
            iterations: 0,
            startTime: Date.now(),
            excludedMs: 0
        };
    }
}
