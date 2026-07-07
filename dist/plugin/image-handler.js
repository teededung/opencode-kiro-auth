import { Buffer } from 'node:buffer';
export const MAX_KIRO_IMAGES = 4;
export const MAX_KIRO_IMAGE_BYTES = 3_750_000;
/** Decode base64 to a plain Uint8Array. Uses Node Buffer when available (native
 *  C++, ~10x faster than the atob + charCodeAt loop) and falls back to atob
 *  in non-Node environments. Returns a fresh Uint8Array — Buffer's underlying
 *  ArrayBuffer is shared with Node's pool, so we copy to detach. */
function base64ToUint8Array(b64) {
    if (typeof Buffer !== 'undefined') {
        const buf = Buffer.from(b64, 'base64');
        const out = new Uint8Array(buf.byteLength);
        out.set(buf);
        return out;
    }
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++)
        arr[i] = bin.charCodeAt(i);
    return arr;
}
export function extractAllImages(content) {
    if (!Array.isArray(content))
        return [];
    const images = [];
    for (const item of content) {
        if (item.type === 'image' && item.source?.type === 'base64') {
            images.push({
                mediaType: item.source.media_type || 'image/jpeg',
                data: item.source.data
            });
        }
        else if (item.type === 'image_url' && item.image_url?.url) {
            const url = item.image_url.url;
            if (!url.startsWith('data:'))
                continue;
            const comma = url.indexOf(',');
            if (comma < 0)
                continue;
            const data = url.slice(comma + 1);
            if (!data)
                continue;
            const headerEnd = url.indexOf(';', 5);
            const mediaType = headerEnd > 0 ? url.slice(5, headerEnd) : url.slice(5, comma);
            images.push({
                mediaType: mediaType || 'image/jpeg',
                data
            });
        }
    }
    return images;
}
export function convertImagesToKiroFormat(images) {
    const selected = [];
    let totalBase64Chars = 0;
    for (const img of images) {
        if (selected.length >= MAX_KIRO_IMAGES)
            break;
        if (totalBase64Chars + img.data.length > MAX_KIRO_IMAGE_BYTES)
            break;
        selected.push(img);
        totalBase64Chars += img.data.length;
    }
    return {
        images: selected.map((img) => {
            const format = img.mediaType.split('/')[1] || 'png';
            return { format, source: { bytes: base64ToUint8Array(img.data) } };
        }),
        omitted: images.length - selected.length
    };
}
export function extractTextFromParts(parts) {
    const textParts = [];
    for (const part of parts) {
        if (part.text && typeof part.text === 'string') {
            textParts.push(part.text);
        }
        else if (part.type === 'text' && part.text) {
            textParts.push(part.text);
        }
    }
    return textParts.join('');
}
