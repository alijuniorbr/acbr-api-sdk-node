import {
  AcbrApi,
  AxiosHttpClient,
  getAcbrApiTokenForBrowser,
} from "@alijunior/acbr-api-sdk-node";

// === Configuração da AcbrApi ===
// sem aspas: lê o valor real da env var (com aspas vira string literal e quebra o auth)
const clientId = "import.meta.env.VITE_ACBR_API_CLIENT_ID";
const clientSecret = "import.meta.env.VITE_ACBR_API_CLIENT_SECRET";
const scope = "import.meta.env.VITE_ACBR_API_SCOPE";
const tokenUrl = "https://auth.acbr.api.br/realms/ACBrAPI/protocol/openid-connect/token";
const baseUrl = "https://prod.acbr.api.br/";

// === Cache de token e cliente ===
let tokenPromise: Promise<string> | null = null;
let apiClient: AcbrApi | null = null;

export async function getAcbrApiClient(): Promise<AcbrApi> {
  if (apiClient)
    return apiClient;

  if (!tokenPromise) {
    // ATENÇÃO: o Keycloak da Acbr API normalmente não libera CORS para o browser.
    // Em produção, obtenha o token no backend e injete o access_token aqui.
    tokenPromise = getAcbrApiTokenForBrowser(clientId, clientSecret, tokenUrl, scope);
  }

  const token = await tokenPromise;

  // Inicializa a API com o token obtido
  const httpClient = new AxiosHttpClient({
    accessToken: token,
    baseURL: baseUrl,
  });
  apiClient = new AcbrApi(httpClient, baseUrl);

  return apiClient;
}

// Função para resetar o cache (útil para testes ou logout)
export function resetAcbrApiClient() {
  tokenPromise = null;
  apiClient = null;
}
