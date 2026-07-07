import * as crypto from 'crypto';
const MAX_TOOL_NAME_LENGTH = 64;
// Slice without breaking surrogate pairs.
function safeSlice(s, end) {
    if (end <= 0)
        return '';
    if (end >= s.length)
        return s;
    const code = s.charCodeAt(end - 1);
    if (code >= 0xd800 && code <= 0xdbff)
        end -= 1;
    return s.slice(0, end);
}
export function shortenToolName(name) {
    if (!name || name.length <= MAX_TOOL_NAME_LENGTH)
        return name;
    const hash = crypto.createHash('sha256').update(name).digest('hex').slice(0, 12);
    const prefix = safeSlice(name, MAX_TOOL_NAME_LENGTH - hash.length - 1);
    return `${prefix}_${hash}`;
}
export function buildToolNameMaps(tools) {
    const originalToAlias = new Map();
    const aliasToOriginal = new Map();
    for (const t of tools) {
        const name = t.name || t.function?.name;
        if (!name)
            continue;
        const alias = shortenToolName(name);
        originalToAlias.set(name, alias);
        if (alias !== name)
            aliasToOriginal.set(alias, name);
    }
    return {
        toKiroName: (name) => originalToAlias.get(name) || shortenToolName(name),
        fromKiroName: (name) => aliasToOriginal.get(name) || name
    };
}
function sanitizeToolInput(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input))
        return input;
    const result = {};
    for (const [key, value] of Object.entries(input)) {
        if (key === '')
            continue;
        result[key] = value;
    }
    return result;
}
function sanitizeSchema(schema, seen = new WeakSet()) {
    if (!schema || typeof schema !== 'object' || Array.isArray(schema))
        return schema;
    if (seen.has(schema))
        return {};
    seen.add(schema);
    const result = {};
    for (const [key, value] of Object.entries(schema)) {
        if (key === 'additionalProperties')
            continue;
        if (key === 'required' && Array.isArray(value) && value.length === 0)
            continue;
        if ((key === 'properties' ||
            key === 'patternProperties' ||
            key === '$defs' ||
            key === 'definitions') &&
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)) {
            const props = {};
            for (const [pk, pv] of Object.entries(value)) {
                props[pk] = sanitizeSchema(pv, seen);
            }
            result[key] = props;
        }
        else if ((key === 'anyOf' || key === 'oneOf' || key === 'allOf' || key === 'prefixItems') &&
            Array.isArray(value)) {
            result[key] = value.map((v) => sanitizeSchema(v, seen));
        }
        else if ((key === 'items' || key === 'not' || key === 'contains') &&
            typeof value === 'object') {
            result[key] = sanitizeSchema(value, seen);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
export function convertToolsToCodeWhisperer(tools) {
    return tools.map((t) => ({
        toolSpecification: {
            name: shortenToolName(t.name || t.function?.name || ''),
            description: (t.description || t.function?.description || '').substring(0, 9216),
            inputSchema: {
                json: sanitizeSchema(sanitizeToolInput(t.input_schema || t.function?.parameters || {}))
            }
        }
    }));
}
export function deduplicateToolResults(trs) {
    const u = [], s = new Set();
    for (const t of trs) {
        if (!s.has(t.toolUseId)) {
            s.add(t.toolUseId);
            u.push(t);
        }
    }
    return u;
}
export function deduplicateToolCallsByContent(toolCalls) {
    const seen = new Set();
    const unique = [];
    for (const tc of toolCalls) {
        // \x00 as separator (can't appear in a tool name)
        const name = tc.name || tc.function?.name || '';
        const input = tc.input || tc.function?.arguments || '';
        const key = `${name}\x00${typeof input === 'string' ? input : JSON.stringify(input)}`;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(tc);
        }
    }
    return unique;
}
