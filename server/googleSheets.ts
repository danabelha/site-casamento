import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const SHEET_NAME = "Convidados";
const credentialsJSON = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

if (!credentialsJSON) {
  throw new Error("GOOGLE_APPLICATION_CREDENTIALS não configurado");
}

const credentials = JSON.parse(credentialsJSON);
const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

// Cache temporário em memória para acelerar leituras repetitivas (Ponto 5)
let cacheConvidados: ConvidadoRow[] | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 10000; // 10 segundos de cache

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
  limite: number;
}

export interface PresenteIntencaoRow {
  id?: string; // Gerado automaticamente
  convidadoId: string;
  convidadoNome: string;
  presenteNome: string;
  valor: number;
  pix: string;
  status: string;
  dataHora?: string; // Gerado automaticamente
}

const SHEET_PRESENTES_NAME = "Presentes";

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

export async function buscarTodosConvidados(forceRefresh = false): Promise<ConvidadoRow[]> {
  const now = Date.now();
  if (!forceRefresh && cacheConvidados && (now - lastCacheTime < CACHE_DURATION)) {
    return cacheConvidados;
  }

  const sheetId = getSheetId();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A:L`,
  });

  const rows = response.data.values || [];
  const data = rows.slice(1).map((row) => ({
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
    limite: parseInt(row[11]) || 0,
  }));

  cacheConvidados = data;
  lastCacheTime = now;
  return data;
}

export async function buscarConvidados(nome: string) {
  const lista = await buscarTodosConvidados();
  const termo = normalizar(nome);
  return lista.filter((c) => normalizar(c.nome) === termo);
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
  const lista = await buscarTodosConvidados(true); // Força refresh para garantir posição correta
  const index = lista.findIndex(c => c.id === data.id);
  if (index === -1) return false;

  const rowNumber = index + 2; 
  const current = lista[index];

  const novosValores = [
    current.id,
    current.nome,
    current.email,
    current.telefone,
    data.status,
    data.acompanhantes,
    data.criancas,
    data.menores8,
    new Date().toLocaleString("pt-BR"),
    data.acompanhanteDetalhes || "",
    data.mensagem || "",
    current.limite || 0,
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A${rowNumber}:L${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [novosValores] },
  });

  cacheConvidados = null; // Limpa cache após alteração
  return true;
}

export async function adicionarConvidado(data: {
  nome: string;
  email?: string;
  telefone?: string;
  limite?: number;
}) {
  const sheetId = getSheetId();
  const lista = await buscarTodosConvidados(true);
  
  let novoId = 1;
  if (lista.length > 0) {
    const ids = lista.map(c => parseInt(c.id)).filter(id => !isNaN(id));
    if (ids.length > 0) novoId = Math.max(...ids) + 1;
  }
  
  const novaLinha = [
    novoId.toString(),
    data.nome,
    data.email || "",
    data.telefone || "",
    "Pendente",
    0, 0, 0, "", "", "",
    data.limite || 0
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A:L`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [novaLinha] },
  });

  cacheConvidados = null;
  return true;
}

export async function atualizarConvidado(id: string, data: Partial<ConvidadoRow>) {
  const sheetId = getSheetId();
  const lista = await buscarTodosConvidados(true);
  const index = lista.findIndex(c => c.id === id);
  if (index === -1) return false;

  const rowNumber = index + 2; 
  const current = lista[index];

  // Garantindo que todos os campos sejam preservados ou atualizados corretamente (Ponto 7)
  const novosValores = [
    current.id,
    data.nome !== undefined ? data.nome : current.nome,
    data.email !== undefined ? data.email : current.email,
    data.telefone !== undefined ? data.telefone : current.telefone,
    data.status !== undefined ? data.status : current.status,
    data.acompanhantes !== undefined ? data.acompanhantes : current.acompanhantes,
    data.criancas !== undefined ? data.criancas : current.criancas,
    data.menores8 !== undefined ? data.menores8 : current.menores8,
    current.dataConfirmacao || "",
    data.acompanhanteDetalhes !== undefined ? data.acompanhanteDetalhes : current.acompanhanteDetalhes,
    data.mensagem !== undefined ? data.mensagem : current.mensagem,
    data.limite !== undefined ? data.limite : current.limite
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A${rowNumber}:L${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [novosValores] },
  });

  cacheConvidados = null;
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

  cacheConvidados = null;
  return true;
}

async function garantirAbaPresentes() {
  const sheetId = getSheetId();
  const sheetsMeta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const abaPresentesExiste = sheetsMeta.data.sheets?.some(s => s.properties?.title === SHEET_PRESENTES_NAME);

  if (!abaPresentesExiste) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: SHEET_PRESENTES_NAME,
            },
          },
        }],
      },
    });

    // Adicionar cabeçalhos
    const headers = ["id", "convidadoId", "convidadoNome", "presenteNome", "valor", "pix", "status", "dataHora"];
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${SHEET_PRESENTES_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    });
  }
}

export async function registrarIntencaoPresente(data: PresenteIntencaoRow) {
  await garantirAbaPresentes();
  const sheetId = getSheetId();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SHEET_PRESENTES_NAME}!A:A`,
  });
  const rows = response.data.values || [];
  let novoId = 1;
  if (rows.length > 1) { // Ignora o cabeçalho
    const ids = rows.slice(1).map(row => parseInt(row[0])).filter(id => !isNaN(id));
    if (ids.length > 0) novoId = Math.max(...ids) + 1;
  }

  const novaLinha = [
    novoId.toString(),
    data.convidadoId,
    data.convidadoNome,
    data.presenteNome,
    data.valor.toString(),
    data.pix,
    data.status,
    new Date().toLocaleString("pt-BR"),
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${SHEET_PRESENTES_NAME}!A:H`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [novaLinha] },
  });

  return true;
}

export async function listarIntencoesPresentes(): Promise<PresenteIntencaoRow[]> {
  await garantirAbaPresentes();
  const sheetId = getSheetId();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SHEET_PRESENTES_NAME}!A:H`,
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) return []; // Apenas cabeçalho

  return rows.slice(1).map(row => ({
    id: row[0],
    convidadoId: row[1],
    convidadoNome: row[2],
    presenteNome: row[3],
    valor: parseFloat(row[4]),
    pix: row[5],
    status: row[6],
    dataHora: row[7],
  }));
}

export async function calcularRankingPresentes() {
  const intencoes = await listarIntencoesPresentes();
  const rankingMap = new Map<string, { quantidade: number; valorTotal: number }>();

  intencoes.forEach(intencao => {
    if (rankingMap.has(intencao.presenteNome)) {
      const current = rankingMap.get(intencao.presenteNome)!;
      current.quantidade++;
      current.valorTotal += intencao.valor;
      rankingMap.set(intencao.presenteNome, current);
    } else {
      rankingMap.set(intencao.presenteNome, { quantidade: 1, valorTotal: intencao.valor });
    }
  });

  const ranking = Array.from(rankingMap.entries()).map(([presenteNome, data]) => ({
    presenteNome,
    quantidade: data.quantidade,
    valorTotal: data.valorTotal,
  }));

  ranking.sort((a, b) => b.valorTotal - a.valorTotal);

  return ranking;
}
