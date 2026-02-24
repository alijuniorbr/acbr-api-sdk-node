import type { AcbrApi } from "@alijunior/acbr-api-sdk-node";
import type { EmpresaResult } from "../types";
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

  // === CONSULTAR CNPJ ===
  // eslint-disable-next-line unused-imports/no-unused-vars
  const consultarCnpj = async (cnpj: string): Promise<EmpresaResult | null> => {
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
    catch (err: any) {
      console.log("🔍 Erro ao consultar AcbrApi:", {
        status: err.response?.status,
        message: err.message,
      });
    }

    return null;
  };
}
