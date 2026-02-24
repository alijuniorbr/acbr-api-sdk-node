// index.ts

export * from "./src/adapters/axios-http-client";
// Adapters HTTP
export * from "./src/adapters/fetch-http-client";

// Cliente principal
export * from "./src/api/acbr-api";
export * from "./src/api/acbr-api-token-acquire";
// Tokens (Node + Browser)
// - Node (objeto completo do token)
export { getClientCredentialsToken } from "./src/api/acbr-api-token-acquire";

export * from "./src/api/acbr-api-token-browser";
// - Browser (APENAS para testes locais; NÃO usar em produção)
export { getAcbrApiTokenForBrowser } from "./src/api/acbr-api-token-browser";
export * from "./src/api/acbr-api-token-string";
// - Node (apenas string do access_token; wrapper que usa a função acima)
export { getAccessTokenString } from "./src/api/acbr-api-token-string";

export * from "./src/types/acbr-api-api.httpclient";
export * from "./src/types/acbr-api-interfaces";

export * from "./src/types/acbr-api-interfaces-definitions";
export * from "./src/types/acbr-api-payloads";
// Tipos e HttpClient base
export * from "./src/types/acbr-api.types";
