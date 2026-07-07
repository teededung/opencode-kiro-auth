export declare class ResponseHandler {
    handleSuccess(response: Response, model: string, conversationId: string, streaming: boolean): Promise<Response>;
    handleSdkSuccess(sdkResponse: any, model: string, conversationId: string, streaming: boolean, toolNameMapper?: (name: string) => string, thinkingRequested?: boolean): Promise<Response>;
    private handleStreaming;
    private handleSdkStreaming;
    private handleNonStreaming;
    private handleSdkNonStreaming;
}
