export interface JsonRpcError {
    code: number;
    message: string;
    data?: unknown;
  }
  
  export interface JsonRpcResponse<T> {
    jsonrpc: string;
    id: string | number;
    result?: T;
    error?: JsonRpcError;
  }
  