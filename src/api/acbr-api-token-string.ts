// src/api/acbr-api-token-string.ts

/**
 * Obtém **apenas a string** do access token usando o fluxo
 * OAuth2 Client Credentials (lado **servidor/Node**).
 *
 * Internamente chama {@link getClientCredentialsToken}.
 *
 * @param input Parâmetros do fluxo (URL do token, credenciais, escopo e authStyle).
 * @returns `Promise<string>` contendo `access_token`.
 *
 * @example
 * ```ts
 * const accessToken = await getAccessTokenString({
 *   tokenUrl: "https://auth.acbr.api.br/realms/ACBrAPI/protocol/openid-connect/token",
 *   clientId: process.env.CLIENT_ID!,
 *   clientSecret: process.env.CLIENT_SECRET!,
 *   scope: "empresa conta cnpj cep nfce nfe", // opcional
 *   authStyle: "auto",
 * });
 * http.setHeader("Authorization", `Bearer ${accessToken}`);
 * ```
 */

import {
  ClientCredentialsInput,
  getClientCredentialsToken,
} from "./acbr-api-token-acquire";

export async function getAccessTokenString(
  input: ClientCredentialsInput,
): Promise<string> {
  const token = await getClientCredentialsToken(input);
  return token.access_token;
}
