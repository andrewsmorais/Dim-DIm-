// 5512981387508 -> +55 (12) 98138-7508 (celular brasileiro); outros formatos aparecem só com "+".
export function formatPhone(digits: string): string {
  const m = digits.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `+55 (${m[1]}) ${m[2]}-${m[3]}` : `+${digits}`;
}
