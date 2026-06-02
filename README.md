<h1 align="center">@alijunior/acbr-api-sdk-node</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@alijunior/acbr-api-sdk-node">
    <img alt="npm version" src="https://img.shields.io/npm/v/@alijunior/acbr-api-sdk-node.svg">
  </a>
  <a href="https://www.npmjs.com/package/@alijunior/acbr-api-sdk-node">
    <img alt="npm downloads" src="https://img.shields.io/npm/dw/@alijunior/acbr-api-sdk-node.svg">
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@alijunior/acbr-api-sdk-node.svg">

</p>
<h3>Veja também o SDK para a Nuvem Fiscal 
  <a href="https://github.com/alijuniorbr/nuvemfiscal-sdk-node">
    @alijunior/nuvemfiscal-sdk-node
  </a>
</h3>
<br />

SDK em **TypeScript/Node.js** para integração com a **Acbr API**, com tipos gerados a partir do OpenAPI e client HTTP enxuto (fetch/axios).

> ✅ Destaques
>
> - Tipagem forte (params, body e response) **direto do OpenAPI**
> - Client simples: `AcbrApi`
> - Adapters: `FetchHttpClient` (nativo) e `AxiosHttpClient` (opcional)
> - **Helpers de token**:
>   - `getClientCredentialsToken` (objeto completo do token)
>   - `getAccessTokenString` (só a string do token; wrapper)
>   - `getAcbrApiTokenForBrowser` (para **testes no browser** — não usar em produção)

> 🤖 **Usando com assistentes de IA?** Este pacote inclui um arquivo [`llms.txt`](./llms.txt) com contexto pronto sobre como aplicar o SDK no backend e no browser. Aponte seu assistente para ele.

> 💡 Este SDK é **gêmeo** do [`@alijunior/nuvemfiscal-sdk-node`](https://github.com/alijuniorbr/nuvemfiscal-sdk-node): mesma interface, mesmos adapters e mesmos helpers de token. Se você já usa um, o outro funciona do mesmo jeito — trocando apenas o nome do client (`AcbrApi` ⇆ `NuvemFiscalApi`), o `tokenUrl` e o `API_BASE`.

---

## Instalação

```bash
pnpm add @alijunior/acbr-api-sdk-node
```

ou

```bash
npm i @alijunior/acbr-api-sdk-node
```

ou

```bash
yarn add @alijunior/acbr-api-sdk-node
```

### Requisitos

- Node **>= 18** (fetch nativo)
- TypeScript **>= 5** (recomendado)

---

## Variáveis de ambiente (para exemplos)

Crie um `.env` na raiz do seu projeto:

```dotenv
TOKEN_URL=https://auth.acbr.api.br/realms/ACBrAPI/protocol/openid-connect/token
CLIENT_ID=SEU_CLIENT_ID
CLIENT_SECRET=SEU_CLIENT_SECRET
API_BASE=https://prod.acbr.api.br/
SCOPE=empresa conta cnpj cep nfce nfe
```

> A autenticação da Acbr API usa **Keycloak** (`auth.acbr.api.br`). O endpoint de token é o padrão OpenID Connect: `.../realms/ACBrAPI/protocol/openid-connect/token`.

---

## Helpers de Token

### 1) `getClientCredentialsToken` (Node – objeto completo)

Fluxo **OAuth2 Client Credentials**. Retorna `{ access_token, expires_in, ... }`.  
Suporta `authStyle`: `"basic" | "body" | "both" | "auto"` (padrão: `"auto"`).

```ts
import {
  getClientCredentialsToken,
  type ClientCredentialsInput,
} from "@alijunior/acbr-api-sdk-node";

const input: ClientCredentialsInput = {
  tokenUrl: process.env.TOKEN_URL!,
  clientId: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
  scope: process.env.SCOPE, // opcional
  authStyle: "auto", // tenta basic e cai para Body em 400/401
};

const token = await getClientCredentialsToken(input);
console.log("access_token:", token.access_token, "exp:", token.expires_in);
```

### 2) `getAccessTokenString` (Node – apenas a string)

Wrap prático quando você só precisa do `access_token`.

```ts
import { getAccessTokenString } from "@alijunior/acbr-api-sdk-node";

const accessToken = await getAccessTokenString({
  tokenUrl: process.env.TOKEN_URL!,
  clientId: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
  scope: process.env.SCOPE, // opcional
});
```

### 3) `getAcbrApiTokenForBrowser` (Browser – **somente testes**)

Útil para provar o fluxo **localmente**. **Não use em produção** (expõe o `client_secret`).

Assinatura: `getAcbrApiTokenForBrowser(clientId, clientSecret, tokenUrl?, scope?)`. Os parâmetros `tokenUrl` e `scope` são **opcionais** e posicionais.

> ⚠️ **Atenção (CORS):** o servidor de autenticação Keycloak da Acbr API normalmente **não libera CORS** para origens de browser. Na prática, mesmo em testes, a obtenção de token direto do navegador pode ser bloqueada. O caminho confiável é obter o token **no backend** e expô-lo ao front (veja a seção sobre browser em produção, mais abaixo).

```ts
import { getAcbrApiTokenForBrowser } from "@alijunior/acbr-api-sdk-node";

const accessToken = await getAcbrApiTokenForBrowser(
  "CLIENT_ID",
  "CLIENT_SECRET",
  "https://auth.acbr.api.br/realms/ACBrAPI/protocol/openid-connect/token",
  "empresa conta cnpj cep nfce nfe"
);
```

---

## Usando o Client com o Token

### Com `fetch` (nativo Node 18+)

```ts
import {
  AcbrApi,
  FetchHttpClient,
  getAccessTokenString,
} from "@alijunior/acbr-api-sdk-node";

const accessToken = await getAccessTokenString({
  tokenUrl: process.env.TOKEN_URL!,
  clientId: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
  scope: process.env.SCOPE,
});

const http = new FetchHttpClient({
  headers: { Authorization: `Bearer ${accessToken}` },
});

const api = new AcbrApi(http, process.env.API_BASE!);

// CEP
const cep = await api.consultarCep({ Cep: "04513010" });
console.log("CEP:", cep);

// CNPJ (exemplo)
const cnpjList = await api.listarCnpj({
  cnae_principal: "6201501",
  municipio: "3550308",
  natureza_juridica: "2062",
  $top: 5,
  $skip: 0,
  $inlinecount: false,
});
console.log("CNPJ:", cnpjList);
```

### Com `axios` (opcional)

O `AxiosHttpClient` recebe um objeto de configuração. Você pode passar apenas o `accessToken` (o adapter cria a instância axios internamente) **ou** fornecer uma `axiosInstance` própria.

```ts
import {
  AcbrApi,
  AxiosHttpClient,
  getAccessTokenString,
} from "@alijunior/acbr-api-sdk-node";

const accessToken = await getAccessTokenString({
  tokenUrl: process.env.TOKEN_URL!,
  clientId: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
});

const http = new AxiosHttpClient({
  accessToken,
  baseURL: process.env.API_BASE!,
});

const api = new AcbrApi(http, process.env.API_BASE!);

// exemplo
const cep = await api.consultarCep({ Cep: "01001000" });
```

Caso prefira controlar a instância axios (interceptors, timeout, etc.), passe-a via `axiosInstance`:

```ts
import axios from "axios";
import { AxiosHttpClient } from "@alijunior/acbr-api-sdk-node";

const axiosInstance = axios.create({
  baseURL: process.env.API_BASE!,
  headers: { Authorization: `Bearer ${accessToken}` },
});

const http = new AxiosHttpClient({ axiosInstance });
```

> **Opções do construtor do `AxiosHttpClient`:** `{ accessToken?, axiosInstance?, baseURL?, headers?, timeoutMs? }`. Se `accessToken` e `axiosInstance` forem informados simultaneamente, a `axiosInstance` prevalece.

---

## Exemplo completo: empresa, certificado e emissão

Fluxo típico: cadastrar a empresa emitente, enviar o certificado digital, configurar a NFC-e e emitir.

```ts
import {
  AcbrApi,
  FetchHttpClient,
  getAccessTokenString,
  type Empresa,
} from "@alijunior/acbr-api-sdk-node";

const accessToken = await getAccessTokenString({
  tokenUrl: process.env.TOKEN_URL!,
  clientId: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
  scope: process.env.SCOPE,
});

const http = new FetchHttpClient({
  headers: { Authorization: `Bearer ${accessToken}` },
});
const api = new AcbrApi(http, process.env.API_BASE!);

// 1) Cadastrar a empresa emitente
const empresa: Empresa = {
  cpf_cnpj: "00000000000000", // sem máscara
  nome_razao_social: "Minha Empresa LTDA",
  nome_fantasia: "Minha Empresa",
  email: "contato@minhaempresa.com.br",
  inscricao_estadual: "ISENTO",
  endereco: {
    logradouro: "Rua Exemplo",
    numero: "100",
    bairro: "Centro",
    codigo_municipio: "3550308", // código IBGE
    uf: "SP",
    cep: "01001000", // sem máscara
  },
};

// criarEmpresa cria ou, se já existir, normalmente retorna conflito —
// trate o erro e use atualizarEmpresa quando necessário (veja Tratamento de erros).
await api.criarEmpresa(empresa);

// 2) Cadastrar o certificado digital (.pfx/.p12 em base64)
await api.cadastrarCertificadoEmpresa(
  { cpf_cnpj: empresa.cpf_cnpj },
  {
    certificado: "BASE64_DO_PFX",
    password: "senha-do-certificado",
  }
);

// 3) Configurar a NFC-e (CRT + CSC da SEFAZ)
//    CRT: 1=Simples Nacional, 2=SN excesso de sublimite, 3=Regime Normal, 4=MEI.
await api.alterarConfigNfce(
  { cpf_cnpj: empresa.cpf_cnpj },
  {
    CRT: 1,
    ambiente: "homologacao", // ou "producao"
    sefaz: {
      id_csc: 1,
      csc: "CODIGO_CSC_DA_SEFAZ",
    },
  }
);

// 4) Consultar a empresa
const cadastrada = await api.consultarEmpresa({ cpf_cnpj: empresa.cpf_cnpj });
console.log("Empresa cadastrada:", cadastrada.nome_razao_social);

// 5) Emitir uma NFC-e (monte o pedido conforme o tipo NfePedidoEmissao)
// const nfce = await api.emitirNfce(pedido);
// console.log("Status:", nfce.status, "Chave:", nfce.chave);
```

> Operações de exclusão (ex.: `excluirEmpresa`, `excluirCertificadoEmpresa`) retornam `void`: a API responde `204 No Content` e o adapter resolve sem corpo.

---

## Tratamento de erros (exemplo)

Os adapters levantam `Error` com `status` e, se presente, `body`.

```ts
function printHttpError(e: unknown, ctx?: string) {
  const status = (e as { status?: number }).status;
  const body = (e as { body?: { error?: { message?: string }; message?: string } }).body;
  const msg =
    body?.error?.message ??
    body?.message ??
    (e as Error)?.message ??
    String(e);

  console.error(
    `${ctx ? ctx + ": " : ""}${status ? status + " - " : ""}${msg}`
  );
}

try {
  const res = await api.listarCnpj({
    /* ... */
  });
} catch (e) {
  printHttpError(e, "Falha ao listar CNPJ");
}
```

> Em adapters baseados em `fetch`/`axios` deste SDK, o erro expõe `status` e `body` diretamente (ex.: `err.status`), e **não** `err.response.status` (formato do axios cru). Trate uma consulta `404` como "registro não encontrado".

> **Empresa já cadastrada:** ao tentar `criarEmpresa` para um CNPJ existente, a Acbr API pode retornar um erro com código do tipo `EmpresaAlreadyExists`. Nesse caso, faça o fallback para `atualizarEmpresa`. A detecção mais segura é verificar `status === 409` **ou** `/AlreadyExists/i.test(code)`, já que o status retornado pode variar.

---

## Tipos úteis (reexportados)

```ts
import type {
  CepEndereco,
  CnpjListagem,
  CnpjEmpresa,
  ContaCotaListagem,
  ContaCota,
  EmpresaListagem,
  Empresa,
  EmpresaCertificado,
  NfePedidoEmissao,
  Dfe,
  NfePedidoCancelamento,
  DfeCancelamento,
  EmpresaPedidoCadastroCertificado,
} from "@alijunior/acbr-api-sdk-node";
```

> Os tipos de **params/query/body/response** dos métodos são inferidos das **operations**/**paths** do OpenAPI. Se o contrato mudar, o TypeScript aponta onde ajustar.

---

## Download de binários

Métodos como `baixarPdfNfe` retornam `ArrayBuffer`.

```typescript
// Node: salvar em disco
import { writeFile } from "node:fs/promises";

const pdf = await api.baixarPdfNfe({ id: "..." });
await writeFile("nota.pdf", Buffer.from(pdf));
```

```typescript
// Browser: forçar download

const ab = await api.baixarPdfNfe({ id: "..." });
const blob = new Blob([ab], { type: "application/pdf" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "nota.pdf";
a.click();
URL.revokeObjectURL(url);
```

---

## Uso com assistentes de IA (`llms.txt`)

O pacote inclui um arquivo [`llms.txt`](./llms.txt) na raiz, seguindo a convenção [llmstxt.org](https://llmstxt.org/). Ele descreve, em formato otimizado para LLMs, as assinaturas verificadas dos helpers de token e adapters, os fluxos de uso em **backend** e **browser** (incluindo a restrição de CORS do Keycloak), e as armadilhas mais comuns.

Ao gerar código que usa este SDK com um assistente, forneça o conteúdo de `llms.txt` como contexto para obter exemplos corretos.

---

## Desenvolvimento

```bash
# exemplos locais (usando .env)
pnpm test

# build da lib
pnpm build
```

---

## Segurança

- **Nunca** exponha `CLIENT_SECRET` no front em produção.
- Faça a emissão de token **no backend** e envie apenas o `access_token` ao cliente.
- Rotacione/Revogue credenciais comprometidas.

---

## Licença

[MIT](./LICENSE)