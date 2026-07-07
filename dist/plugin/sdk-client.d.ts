import { CodeWhispererStreamingClient } from '@aws/codewhisperer-streaming-client';
import type { Effort, KiroAuthDetails } from './types.js';
/**
 * Resolve the correct chat endpoint for the given auth details.
 *
 * - Accounts with a profileArn (Kiro Pro / Q Developer Pro) → runtime.kiro.dev
 *   This endpoint serves all models including third-party ones (glm-5, minimax, …).
 *   It requires a profileArn on every request and returns 400 without one.
 *
 * - Accounts without a profileArn (free AWS Builder ID) → q.amazonaws.com
 *   This endpoint accepts the same token + request shape but only serves
 *   Claude-family models. Using runtime.kiro.dev here causes a 400.
 */
export declare function resolveKiroEndpoint(auth: KiroAuthDetails): string;
export declare function createSdkClient(auth: KiroAuthDetails, region: string, effort?: Effort): CodeWhispererStreamingClient;
export declare function clearSdkClientCache(): void;
