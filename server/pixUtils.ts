const { crc16 } = require('crc');

interface PixData {
  pixKey: string;
  receiverName: string;
  receiverCity: string;
  value: number;
  transactionId?: string;
}

// Função para gerar um ID de transação simples
function generateTransactionId(): string {
  return Math.random().toString(36).substring(2, 15).toUpperCase();
}

export function generatePixBrCode({ pixKey, receiverName, receiverCity, value, transactionId }: PixData): string {
  const payloadFormatIndicator = '0001';
  const pointOfInitiationMethod = '12'; // 11 = estático, 12 = dinâmico. Para copia e cola, geralmente dinâmico.
  const merchantAccountInformation = `26${String(pixKey.length + 25).padStart(2, '0')}0014BR.GOV.BCB.PIX01${pixKey}`;
  const merchantCategoryCode = '0000'; // Default para PIX, pode ser 5399 para outros
  const transactionAmount = String(value).padStart(13, '0');
  const countryCode = '5891'; // Brasil
  const merchantName = receiverName.substring(0, 25).padEnd(25, ' ');
  const merchantCity = receiverCity.substring(0, 15).padEnd(15, ' ');
  const txId = (transactionId || generateTransactionId()).substring(0, 25).padEnd(25, ' ');

  // Construir o payload
  let payload = '';
  payload += `00${payloadFormatIndicator}`; // Payload Format Indicator
  payload += `01${pointOfInitiationMethod}`; // Point of Initiation Method
  payload += `26${String(merchantAccountInformation.length).padStart(2, '0')}${merchantAccountInformation}`; // Merchant Account Information
  payload += `52${merchantCategoryCode}`; // Merchant Category Code
  payload += `53${transactionAmount}`; // Transaction Amount
  payload += `5802${countryCode}`; // Country Code
  payload += `59${String(merchantName.length).padStart(2, '0')}${merchantName}`; // Merchant Name
  payload += `60${String(merchantCity.length).padStart(2, '0')}${merchantCity}`; // Merchant City
  payload += `62${String(txId.length).padStart(2, '0')}${txId}`; // Additional Data Field Template

  // Calcular CRC16
  const crcValue = crc16(payload).toString(16).toUpperCase().padStart(4, '0');
  const brCode = `${payload}6304${crcValue}`;

  return brCode;
}
