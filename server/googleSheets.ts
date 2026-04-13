import { google } from "googleapis";


const SHEET_NAME = "Convidados";

// ✅ pega o JSON direto do Render
const credentialsJSON = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

console.log("CREDENTIALS JSON EXISTS:", !!credentialsJSON);

if (!credentialsJSON) {
  throw new Error("GOOGLE_APPLICATION_CREDENTIALS não configurado");
}

// ✅ converte string -> objeto
const credentials = JSON.parse(credentialsJSON);

// ✅ usa credentials direto (SEM keyFile)
const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

// ===== TYPES =====
export interface ConvidadoRow {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  status: string;
  acompanhantes: number;
  criancas: number;
  menores8: number;
  dataConfirmacao: string;
  acompanhanteDetalhes?: string;
  mensagem?: string;
  limite: number; // Nova coluna L
}

// ===== HELPERS =====
function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getSheetId() {
  const id = process.env.GOOGLE_SHEETS_ID;
  if (!id) throw new Error("GOOGLE_SHEETS_ID não configurado");
  return id;
}

// ===== CORE =====
export async function buscarTodosConvidados(): Promise<ConvidadoRow[]> {
  const sheetId = getSheetId();

  // Range expandido para incluir a coluna L (limite)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A:L`,
  });

  const rows = response.data.values || [];

  return rows.slice(1).map((row) => ({
    id: row[0] || "",
    nome: row[1] || "",
    email: row[2] || "",
    telefone: row[3] || "",
    status: row[4] || "Pendente",
    acompanhantes: parseInt(row[5]) || 0,
    criancas: parseInt(row[6]) || 0,
    menores8: parseInt(row[7]) || 0,
    dataConfirmacao: row[8] || "",
    acompanhanteDetalhes: row[9] || "",
    mensagem: row[10] || "",
    limite: parseInt(row[11]) || 0, // Coluna L
  }));
}

export async function buscarConvidados(nome: string) {
  const lista = await buscarTodosConvidados();
  const termo = normalizar(nome);

  // Busca EXATA (conforme solicitado pelo usuário)
  return lista.filter((c) =>
    normalizar(c.nome) === termo
  );
}

export async function salvarConfirmacao(data: {
  id: string;
  status: string;
  acompanhantes: number;
  criancas: number;
  menores8: number;
  acompanhanteDetalhes?: string;
  mensagem?: string;
}) {
  const sheetId = getSheetId();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A:L`,
  });

  const rows = response.data.values || [];

  const index = rows.findIndex((row, i) => i > 0 && row[0] === data.id);
  if (index === -1) return false;

  const rowNumber = index + 1;
  const linha = rows[index];

  // Mantém os valores originais e atualiza apenas o RSVP
  const novosValores = [
    linha[0], // ID
    linha[1], // NOME
    linha[2], // EMAIL
    linha[3], // TELEFONE
    data.status,
    data.acompanhantes,
    data.criancas,
    data.menores8,
    new Date().toISOString(),
    data.acompanhanteDetalhes || "",
    data.mensagem || "",
    linha[11] || 0, // LIMITE (Mantém o valor original da coluna L)
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A${rowNumber}:L${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [novosValores] },
  });

  return true;
}

// ===== ADMIN FUNCTIONS =====

export async function adicionarConvidado(data: {
  nome: string;
  email?: string;
  telefone?: string;
  limite?: number;
}) {
  const sheetId = getSheetId();
  const lista = await buscarTodosConvidados();
  
  // Lógica de ID Sequencial
  let novoId = 1;
  if (lista.length > 0) {
    const ids = lista.map(c => parseInt(c.id)).filter(id => !isNaN(id));
    if (ids.length > 0) {
      novoId = Math.max(...ids) + 1;
    }
  }
  
  const novaLinha = [
    novoId.toString(),
    data.nome,
    data.email || "",
    data.telefone || "",
    "Pendente",
    0, 0, 0, "", "", "",
    data.limite || 0 // Coluna L
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A:L`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [novaLinha] },
  });

  return true;
}

export async function atualizarConvidado(id: string, data: Partial<ConvidadoRow>) {
  const sheetId = getSheetId();
  const lista = await buscarTodosConvidados();
  const index = lista.findIndex(c => c.id === id);
  if (index === -1) return false;

  const rowNumber = index + 2; 
  
  const current = lista[index];
  const novosValores = [
    current.id,
    data.nome || current.nome,
    data.email || current.email,
    data.telefone || current.telefone,
    data.status || current.status,
    data.acompanhantes !== undefined ? data.acompanhantes : current.acompanhantes,
    data.criancas !== undefined ? data.criancas : current.criancas,
    data.menores8 !== undefined ? data.menores8 : current.menores8,
    current.dataConfirmacao,
    current.acompanhanteDetalhes,
    current.mensagem,
    data.limite !== undefined ? data.limite : current.limite // Coluna L
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A${rowNumber}:L${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [novosValores] },
  });

  return true;
}

export async function deletarConvidado(id: string) {
  const sheetId = getSheetId();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A:A`,
  });
  
  const rows = response.data.values || [];
  const index = rows.findIndex((row, i) => i > 0 && row[0] === id);
  if (index === -1) return false;

  const sheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const sheetObj = sheet.data.sheets?.find(s => s.properties?.title === SHEET_NAME);
  const sheetInternalId = sheetObj?.properties?.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheetInternalId,
            dimension: "ROWS",
            startIndex: index,
            endIndex: index + 1
          }
        }
      }]
    }
  });

  return true;
}
