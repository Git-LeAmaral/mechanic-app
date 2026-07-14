// Helper functions for formatting inputs and displaying data

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }
  return phone;
};

export const formatDocument = (doc: string): string => {
  const cleaned = doc.replace(/\D/g, '');
  if (cleaned.length === 11) {
    // CPF
    return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9)}`;
  } else if (cleaned.length === 14) {
    // CNPJ
    return `${cleaned.substring(0, 2)}.${cleaned.substring(2, 5)}.${cleaned.substring(5, 8)}/${cleaned.substring(8, 12)}-${cleaned.substring(12)}`;
  }
  return doc;
};

export const formatPlate = (plate: string): string => {
  const cleaned = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (cleaned.length === 7) {
    // Check if it's traditional ABC-1234 or Mercosul ABC1D23
    const isMercosul = isNaN(Number(cleaned.charAt(4))) && !isNaN(Number(cleaned.charAt(3))) && !isNaN(Number(cleaned.charAt(5)));
    if (!isMercosul && !isNaN(Number(cleaned.substring(3)))) {
      return `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
    }
    return cleaned;
  }
  return plate;
};

export const parseNumber = (value: string): number => {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};
