/**
 * Hotfix RC-5.10.7 - Geração de BR Code PIX compatível
 * Segue especificações do BACEN (EMV QRCPS)
 */

interface PixData {
  pixKey: string;
  receiverName: string;
  receiverCity: string;
  value: number;
  transactionId?: string;
}

/**
 * Implementação do CRC16-CCITT (0xFFFF) exigido pelo padrão Pix/BR Code
 */
function calculateCRC16(payload: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    let b = payload.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      let bit = ((b >> (7 - j)) & 1) === 1;
      let c15 = ((crc >> 15) & 1) === 1;
      crc <<= 1;
      if (c15 !== bit) crc ^= polynomial;
    }
  }

  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Helper para gerar campos no formato TLV (Tag-Length-Value)
 */
function formatTLV(tag: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${tag}${length}${value}`;
}

/**
 * Sanitiza strings para o padrão aceito pelo Pix (sem acentos, maiúsculas)
 */
function sanitize(text: string, maxLength: number): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^A-Z0-9\s]/gi, "")   // Remove caracteres especiais
    .toUpperCase()
    .substring(0, maxLength)
    .trim();
}

export function generatePixBrCode({ pixKey, receiverName, receiverCity, value, transactionId }: PixData): string {
  // 1. Merchant Account Information (ID 26)
  const gui = formatTLV('00', 'BR.GOV.BCB.PIX');
  const key = formatTLV('01', pixKey.trim());
  const merchantAccountInfo = formatTLV('26', gui + key);

  // 2. Additional Data Field Template (ID 62)
  // TXID deve ser alfanumérico, sem espaços, max 25 chars. Usamos '***' se não houver ID.
  const rawTxid = transactionId ? sanitize(transactionId.replace(/\s+/g, ""), 25) : "***";
  const txid = formatTLV('05', rawTxid || "***");
  const additionalData = formatTLV('62', txid);

  // 3. Montagem do Payload Base
  let payload = '';
  payload += formatTLV('00', '01'); // Payload Format Indicator
  payload += formatTLV('01', '11'); // Point of Initiation Method (11 = Estático)
  payload += merchantAccountInfo;
  payload += formatTLV('52', '0000'); // Merchant Category Code
  payload += formatTLV('53', '986');  // Transaction Currency (986 = BRL)
  
  // Valor com exatamente 2 casas decimais e ponto separador
  if (value > 0) {
    payload += formatTLV('54', value.toFixed(2));
  }
  
  payload += formatTLV('58', 'BR');   // Country Code
  payload += formatTLV('59', sanitize(receiverName, 25)); // Merchant Name
  payload += formatTLV('60', sanitize(receiverCity, 15)); // Merchant City
  payload += additionalData;

  // 4. Adicionar Tag de CRC e calcular valor final
  payload += '6304';
  const crcValue = calculateCRC16(payload);
  
  return payload + crcValue;
}
