import { type KiroImage } from './image-handler.js';
export interface ImageCacheOptions {
    ttlMs?: number;
    maxEntries?: number;
    now?: () => number;
    cacheDir?: string | null;
}
export declare class ImageCache {
    private cache;
    private ttlMs;
    private maxEntries;
    private now;
    private cacheDir;
    constructor(opts?: ImageCacheOptions);
    private k;
    set(workspace: string, fingerprint: string, images: KiroImage[]): void;
    /**
     * Merge new images with the existing cache for this conversation.
     * New images go to the front (most recent), then existing fills in.
     * Duplicates (same content fingerprint) collapse.
     * Result is capped at MAX_KIRO_IMAGES and MAX_KIRO_IMAGE_BYTES;
     * when over budget, the OLDEST entries drop first (FIFO).
     *
     * Returns the final image count for diagnostics.
     */
    upsert(workspace: string, fingerprint: string, newImages: KiroImage[]): number;
    get(workspace: string, fingerprint: string): KiroImage[] | null;
    delete(workspace: string, fingerprint: string): void;
    hasEverHadImages(workspace: string, fingerprint: string): boolean;
    clear(): void;
    size(): number;
    private evict;
    private writeEntryToDisk;
    private loadEntryFromDisk;
    private deleteFromDisk;
    /**
     * Remove expired files from the cache dir. Runs once at construction so
     * a long-lived dir doesn't grow unbounded with stale conversations.
     */
    private sweepDiskExpired;
}
export declare const imageCache: ImageCache;
