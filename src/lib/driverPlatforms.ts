// Plataformas para motorista e entregador. Selo = cor da marca + nome/iniciais, feito pelo app.
// Não são os logotipos oficiais (marcas registradas de cada empresa).

export type Platform = { key: string; name: string; color: string; fg: string; initials: string };

export const PLATFORMS: Platform[] = [
  { key: "uber", name: "Uber", color: "#000000", fg: "#FFFFFF", initials: "Uber" },
  { key: "99", name: "99", color: "#FFD400", fg: "#111111", initials: "99" },
  { key: "indrive", name: "inDrive", color: "#C1F11D", fg: "#141414", initials: "iD" },
  { key: "blablacar", name: "BlaBlaCar", color: "#00AFF5", fg: "#FFFFFF", initials: "Bla" },
  { key: "ifood", name: "iFood", color: "#EA1D2C", fg: "#FFFFFF", initials: "iF" },
  { key: "ubereats", name: "Uber Eats", color: "#06C167", fg: "#FFFFFF", initials: "UE" },
  { key: "rappi", name: "Rappi", color: "#FF441F", fg: "#FFFFFF", initials: "Ra" },
  { key: "lalamove", name: "Lalamove", color: "#F16622", fg: "#FFFFFF", initials: "La" },
  { key: "particular", name: "Corrida particular", color: "#475569", fg: "#FFFFFF", initials: "R$" },
];

const byKey = new Map(PLATFORMS.map((p) => [p.key, p]));

/** Chave conhecida -> plataforma; texto livre (outra plataforma digitada) -> selo neutro com as iniciais. */
export function platformOf(key: string): Platform {
  const known = byKey.get(key);
  if (known) return known;
  const name = key.replace(/^outra:/, "").trim() || "Outra";
  const parts = name.split(/\s+/).filter(Boolean);
  const initials = (parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
  return { key, name, color: "#E5E7EB", fg: "#374151", initials };
}

/** Nome digitado pela pessoa -> chave. Reconhece as conhecidas pelo nome ("uber", "Noventa e nove" não). */
export function platformKeyFromName(name: string): string {
  const n = name.trim().toLowerCase().replace(/\s+/g, "");
  const hit = PLATFORMS.find((p) => p.key === n || p.name.toLowerCase().replace(/\s+/g, "") === n);
  return hit ? hit.key : `outra:${name.trim().slice(0, 30)}`;
}
