export declare function shortenToolName(name: string): string;
export declare function buildToolNameMaps(tools: any[]): {
    toKiroName: (name: string) => string;
    fromKiroName: (name: string) => string;
};
export declare function convertToolsToCodeWhisperer(tools: any[]): any[];
export declare function deduplicateToolResults(trs: any[]): any[];
export declare function deduplicateToolCallsByContent(toolCalls: any[]): any[];
