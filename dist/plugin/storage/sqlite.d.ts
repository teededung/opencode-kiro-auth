import type { ManagedAccount } from '../types.js';
export declare const DB_PATH: string;
export declare class KiroDatabase {
    private db;
    private path;
    constructor(path?: string);
    private init;
    getAccounts(): any[];
    private upsertAccountInternal;
    upsertAccount(acc: ManagedAccount): Promise<void>;
    batchUpsertAccounts(accounts: ManagedAccount[]): Promise<void>;
    deleteAccount(id: string): Promise<void>;
    markAccountsUnhealthy(ids: string[], reason: string): Promise<void>;
    private rowToAccount;
    private static readonly REAUTH_LOCK_TTL_MS;
    acquireReauthLock(): boolean;
    isReauthLockHeld(): boolean;
    releaseReauthLock(): void;
    close(): void;
    getConversationId(workspace: string, fingerprint: string): {
        convId: string;
        agentContinuationId: string;
    } | undefined;
    deleteConversationId(workspace: string, fingerprint: string): void;
    /**
     * Persist a conversationId and agentContinuationId, clean up entries older than ttlDays (default 7).
     */
    setConversationId(workspace: string, fingerprint: string, convId: string, agentContinuationId: string, ttlDays?: number): void;
}
export declare function createDatabase(path?: string): KiroDatabase;
export declare const kiroDb: KiroDatabase;
