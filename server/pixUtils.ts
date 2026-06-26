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
  const transactionCurrency = '986'; // BRL
  const transactionAmount = `54${String(value.toFixed(2).length).padStart(2, '0')}${value.toFixed(2)}`;
  const countryCode = 'BR';
  const merchantName = `59${String(receiverName.length).padStart(2, '0')}${receiverName}`;
  const merchantCity = `60${String(receiverCity.length).padStart(2, '0')}${receiverCity}`;
  const additionalDataFieldTemplate = `62${String((transactionId || generateTransactionId()).length + 5).padStart(2, '0')}05${transactionId || generateTransactionId()}`;
  const crc16Indicator = '6304';

  let pixString = '';
  pixString += payloadFormatIndicator;
  pixString += pointOfInitiationMethod;
  pixString += merchantAccountInformation;
  pixString += merchantCategoryCode;
  pixString += transactionCurrency;
  pixString += transactionAmount;
  pixString += countryCode;
  pixString += merchantName;
  pixString += merchantCity;
  pixString += additionalDataFieldTemplate;

  // O cálculo do CRC16 é crucial para a validade do BR Code.
  // Uma implementação robusta de CRC16 é complexa e deve ser testada exaustivamente.
  // Para este projeto, vamos usar uma função simplificada que pode precisar de ajustes
  // ou substituição por uma biblioteca dedicada em um ambiente de produção.
  const crc16 = calculateCrc16(pixString + crc16Indicator);
  pixString += `${crc16Indicator}${crc16}`;

  return pixString;
}

// Função auxiliar para calcular CRC16 (implementação simplificada)
// ATENÇÃO: Esta implementação é um exemplo e pode não ser 100% compatível com todas as
// especificações do Banco Central do Brasil para CRC16. Para produção, considere
// usar uma biblioteca validada ou uma implementação mais robusta.
function calculateCrc16(payload: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= (payload.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}
