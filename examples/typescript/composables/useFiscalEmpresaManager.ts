import type { AcbrApi, Empresa } from "@alijunior/acbr-api-sdk-node";
import { getAcbrApiClient } from "./useAcbrApiClient";

export function useFiscalEmpresaManager() {
  // === api ===
  let apiClient: AcbrApi | null = null;
  const getApi = async () => {
    if (!apiClient) {
      apiClient = await getAcbrApiClient();
    }
    return apiClient;
  };

  // === CONSULTAR EMPRESA (por CNPJ) ===
  const consultarCnpj = async (cnpj: string): Promise<Empresa | null> => {
    const api = await getApi();

    const cleaned = cnpj.replace(/\D/g, "");
    if (!/^\d{14}$/.test(cleaned)) {
      throw new Error("CNPJ inválido");
    }

    try {
      const resultado = await api.consultarEmpresa({ cpf_cnpj: cleaned });
      console.log("✅ Empresa encontrada na AcbrApi:", resultado);
      return resultado;
    }
    catch (err: unknown) {
      // o adapter expõe `status` e `body` no erro (não `err.response`)
      const status = (err as { status?: number }).status;
      const message
        = (err as { body?: { error?: { message?: string } } }).body?.error?.message
          ?? (err as Error).message;
      console.log("🔍 Erro ao consultar AcbrApi:", { status, message });

      // 404 = empresa não cadastrada → retorna null; demais erros propagam
      if (status === 404)
        return null;
      throw err;
    }
  };

  return { consultarCnpj };
}
