"use client";

import { INSTITUTIONS, nameInitials, resolveInstitution } from "@/lib/institutions";
import { Label, inputCls } from "@/components/ui/page";

// Selo da instituição: cor + iniciais (não é o logotipo oficial). Sem escolha, tenta pelo nome; senão, iniciais neutras.
export function InstitutionBadge({ institution, name, size = 48, className = "" }: { institution?: string | null; name?: string | null; size?: number; className?: string }) {
  const inst = resolveInstitution(institution, name);
  const label = inst?.initials ?? nameInitials(name);
  const long = label.length >= 3;
  return (
    <span
      aria-hidden="true"
      className={`shrink-0 inline-flex items-center justify-center font-extrabold select-none ${className}`}
      style={{
        width: size, height: size, borderRadius: Math.round(size * 0.3),
        background: inst?.color ?? "rgba(91,91,240,0.12)", color: inst?.fg ?? "#5B5BF0",
        fontSize: Math.round(size * (long ? 0.3 : 0.38)), letterSpacing: "-0.02em",
      }}
    >
      {label}
    </span>
  );
}

export function InstitutionSelect({ value, onChange, name }: { value: string; onChange: (v: string) => void; name?: string }) {
  return (
    <div>
      <Label>Banco ou instituição (opcional)</Label>
      <div className="flex items-center gap-3">
        <InstitutionBadge institution={value} name={name} size={40} />
        <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Escolher automaticamente pelo nome</option>
          {INSTITUTIONS.map((i) => <option key={i.key} value={i.key}>{i.name}</option>)}
        </select>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">O selo usa a cor e as iniciais da instituição. Não é o logotipo oficial.</p>
    </div>
  );
}
