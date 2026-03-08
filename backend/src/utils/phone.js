export function normalizarTelefoneBR(numero) {
    if (!numero) return null;
  
    let digits = String(numero).replace(/\D/g, "");
  
    // Se vier com 0 na frente
    if (digits.startsWith("0")) {
      digits = digits.replace(/^0+/, "");
    }
  
    // Se não tiver código do país, adiciona 55
    if (!digits.startsWith("55")) {
      digits = `55${digits}`;
    }
  
    // mínimo razoável para BR
    if (digits.length < 12 || digits.length > 13) {
      return null;
    }
  
    return digits;
  }