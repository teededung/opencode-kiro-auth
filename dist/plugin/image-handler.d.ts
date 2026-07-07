interface UnifiedImage {
    mediaType: string;
    data: string;
}
export declare const MAX_KIRO_IMAGES = 4;
export declare const MAX_KIRO_IMAGE_BYTES = 3750000;
export interface KiroImage {
    format: string;
    source: {
        bytes: Uint8Array;
    };
}
interface ImageConversionResult {
    images: KiroImage[];
    omitted: number;
}
export declare function extractAllImages(content: any): UnifiedImage[];
export declare function convertImagesToKiroFormat(images: UnifiedImage[]): ImageConversionResult;
export declare function extractTextFromParts(parts: any[]): string;
export {};
