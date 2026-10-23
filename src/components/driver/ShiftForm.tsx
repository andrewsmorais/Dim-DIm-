"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { brl, parseMoney, todayISO } from "@/lib/format";
import { FUELS, flexAdvice, hoursLabel, shiftMetrics, vehicleFuelFor, type DayFuel, type Earning, type Shift, type Vehicle } from "@/lib/driver";
import { PLATFORMS, platformKeyFromName, platformOf } from "@/lib/driverPlatforms";
import { PlatformBadge } from "@/components/driver/PlatformBadge";
import { Card, ErrorNote, Label, btnCls, btnGhostCls, inputCls } from "@/components/ui/page";

type Db = { from: (t: string) => { insert: (v: object) => PromiseLike<{ error: unknown }>; update: (v: object) => { eq: (c: string, v: string) => PromiseLike<{ error: unknown }> } } };

type EarnDraft = { amount: string; hours: string; trips: string };
const str = (n: number | null | undefined) => (n ? String(n).replace(".", ",") : "");
const money = (s: string) => (s.trim() ? parseMoney(s) : 0);

export type LastUsed = { vehicle_id: string | null; fuel: string | null } | null;

export function ShiftForm({ supabase, userId, vehicles, editing, lastUsed, onSaved, onCancel }: {
  supabase: unknown; userId: string; vehicles: Vehicle[]; editing: Shift | null; lastUsed?: LastUsed; onSaved: () => void; onCancel?: () => void;
}) {
  const db = supabase as Db;
  const active = vehicles.filter((v) => !v.archived || v.id === editing?.vehicle_id);
  const [date, setDate] = useState(editing?.date ?? todayISO());
  // Dia novo já vem com o carro do último dia (ou o primeiro cadastrado).
  const lastActive = lastUsed?.vehicle_id && active.some((v) => v.id === lastUsed.vehicle_id) ? lastUsed.vehicle_id : null;
  const [vehicleId, setVehicleId] = useState(editing ? editing.vehicle_id ?? "" : lastActive ?? active[0]?.id ?? "");
  const vehicle = vehicles.find((v) => v.id === vehicleId) ?? null;
  // Carro flex: gasolina ou etanol no dia (começa com o do último dia).
  const [dayFuel, setDayFuel] = useState<DayFuel>(() => {
    const f = editing ? editing.fuel : lastUsed?.vehicle_id === vehicleId ? lastUsed?.fuel : null;
    return f === "etanol" ? "etanol" : "gasolina";
  });
  const [start, setStart] = useState((editing?.start_time ?? "").slice(0, 5));
  const [end, setEnd] = useState((editing?.end_time ?? "").slice(0, 5));
  const [pause, setPause] = useState(editing?.break_minutes ? String(editing.break_minutes) : "");
  const [kmMode, setKmMode] = useState<"km" | "odo">("km");
  const [km, setKm] = useState(str(editing?.km));
  const [odo, setOdo] = useState({ a: "", b: "" });
  const [price, setPrice] = useState(str(editing ? editing.fuel_price : vehicle ? vehicleFuelFor(vehicle, dayFuel).price : null));
  const [earn, setEarn] = useState<Record<string, EarnDraft>>(() => Object.fromEntries((editing?.earnings ?? []).map((e) => [e.platform, { amount: str(e.amount), hours: str(e.hours), trips: str(e.trips) }])));
  const [order, setOrder] = useState<string[]>(() => (editing?.earnings ?? []).map((e) => e.platform));
  const [custom, setCustom] = useState("");
  const [tips, setTips] = useState(str(editing?.tips));
  const [costs, setCosts] = useState({ tolls: str(editing?.tolls), parking: str(editing?.parking), wash: str(editing?.wash), food: str(editing?.food), other_cost: str(editing?.other_cost) });
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Mantém o que foi gravado num dia antigo enquanto o carro e o combustível forem os mesmos.
  const keepSaved = (id: string, f: DayFuel) => Boolean(editing && editing.vehicle_id === id && (editing.fuel === f || (editing.fuel === "flex" && f === "gasolina") || vehicles.find((v) => v.id === id)?.fuel !== "flex"));

  // Ao trocar de carro (ou de combustível no flex), o preço vem do cadastro do carro.
  function pickVehicle(id: string) {
    setVehicleId(id);
    const v = vehicles.find((x) => x.id === id);
    if (v && !keepSaved(id, dayFuel)) setPrice(str(vehicleFuelFor(v, dayFuel).price));
    if (v && keepSaved(id, dayFuel) && editing) setPrice(str(editing.fuel_price));
  }
  function pickFuel(f: DayFuel) {
    setDayFuel(f);
    if (!vehicle) return;
    setPrice(str(keepSaved(vehicle.id, f) && editing ? editing.fuel_price : vehicleFuelFor(vehicle, f).price));
  }

  function toggle(key: string) {
    if (earn[key]) {
      const next = { ...earn }; delete next[key];
      setEarn(next); setOrder(order.filter((k) => k !== key));
    } else {
      setEarn({ ...earn, [key]: { amount: "", hours: "", trips: "" } }); setOrder([...order, key]);
    }
  }
  function addCustom() {
    const name = custom.trim();
    if (!name) return;
    const key = platformKeyFromName(name);
    if (!earn[key]) toggle(key);
    setCustom("");
  }

  const kmValue = kmMode === "km" ? money(km) : Math.max(0, money(odo.b) - money(odo.a));

  // Snapshot do carro: dia novo ou carro/combustível trocado usa o cadastro atual; dia antigo mantém o que foi gravado.
  const snap = useMemo(() => {
    const keep = keepSaved(vehicleId, dayFuel);
    const now = vehicle ? vehicleFuelFor(vehicle, dayFuel) : null;
    return {
      fuel: keep ? editing!.fuel : now?.fuel ?? null,
      efficiency: keep ? editing!.efficiency : now?.efficiency ?? null,
      cost_per_km: keep ? editing!.cost_per_km : vehicle?.cost_per_km ?? 0,
      rent: keep ? editing!.rent : vehicle?.daily_rent ?? 0,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, vehicle, vehicleId, dayFuel]);

  const earnings: Earning[] = order.filter((k) => earn[k]).map((k) => ({
    platform: k, amount: money(earn[k].amount),
    hours: earn[k].hours.trim() ? money(earn[k].hours) : null, trips: earn[k].trips.trim() ? Math.round(money(earn[k].trips)) : null,
  }));

  const draft: Shift = {
    id: editing?.id ?? "novo", date, vehicle_id: vehicleId || null,
    start_time: start || null, end_time: end || null, break_minutes: Math.round(money(pause)) || 0,
    km: kmValue, fuel: snap.fuel, efficiency: snap.efficiency, fuel_price: price.trim() ? money(price) : null,
    cost_per_km: snap.cost_per_km, rent: snap.rent, earnings, tips: money(tips),
    tolls: money(costs.tolls), parking: money(costs.parking), wash: money(costs.wash), food: money(costs.food), other_cost: money(costs.other_cost),
    notes: notes.trim() || null, income_tx_id: editing?.income_tx_id ?? null, expense_tx_id: editing?.expense_tx_id ?? null,
  };
  const m = shiftMetrics(draft);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const nums = [kmValue, draft.tips, draft.tolls, draft.parking, draft.wash, draft.food, draft.other_cost, draft.break_minutes, ...earnings.map((x) => x.amount)];
    if (nums.some((n) => Number.isNaN(n) || n < 0)) { setError("Confira os valores: use só números (ex.: 150,50)."); return; }
    if (kmMode === "odo" && money(odo.b) < money(odo.a)) { setError("O hodômetro final precisa ser maior que o inicial."); return; }
    if (kmValue > 3000) { setError("Km do dia acima de 3.000. Confira o valor."); return; }
    if (!earnings.length && !draft.tips) { setError("Marque pelo menos uma plataforma e quanto ganhou nela."); return; }
    if (earnings.some((x) => !(x.amount > 0))) { setError("Informe quanto ganhou em cada plataforma marcada (ou desmarque)."); return; }
    if ((start && !end) || (!start && end)) { setError("Informe o horário de início e o de fim (ou deixe os dois em branco)."); return; }
    if (draft.fuel_price !== null && (Number.isNaN(draft.fuel_price) || draft.fuel_price > 100)) { setError("Confira o preço do combustível."); return; }
    setBusy(true);
    const { id: _id, income_tx_id: _i, expense_tx_id: _x, ...row } = draft;
    void _id; void _i; void _x;
    const payload = { ...row, updated_at: new Date().toISOString() };
    const res = editing ? await db.from("driver_shifts").update(payload).eq("id", editing.id) : await db.from("driver_shifts").insert({ ...payload, user_id: userId });
    setBusy(false);
    if (res.error) { setError("Não foi possível salvar o dia. Tente de novo."); return; }
    onSaved();
  }

  const fuelUnit = vehicle ? (vehicle.fuel === "flex" ? `R$ por litro de ${dayFuel}` : FUELS[vehicle.fuel].price) : "R$ por litro";
  const unitShort = vehicle ? FUELS[vehicle.fuel === "flex" ? dayFuel : vehicle.fuel].unit : "km/l";
  const advice = vehicle ? flexAdvice(vehicle) : null;

  return (
    <form onSubmit={save} className="space-y-4">
      <Card className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Dia</Label><input type="date" className={inputCls} value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} required /></div>
          <div><Label>Carro</Label>
            <select className={inputCls} value={vehicleId} onChange={(e) => pickVehicle(e.target.value)}>
              <option value="">Sem carro</option>
              {active.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select></div>
        </div>
        {vehicle && (
          <div className="rounded-2xl bg-brand-dark/5 dark:bg-white/5 px-3.5 py-2.5 space-y-2">
            {vehicle.fuel === "flex" && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Rodou com</span>
                {(["gasolina", "etanol"] as const).map((f) => (
                  <button key={f} type="button" onClick={() => pickFuel(f)} aria-pressed={dayFuel === f}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${dayFuel === f ? "bg-brand-dark text-white dark:bg-brand-vivid" : "bg-white/70 dark:bg-[#1E1E1E] text-gray-500"}`}>
                    {f === "gasolina" ? "Gasolina" : "Etanol"}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">
              {vehicle.name}: {snap.efficiency ? `${String(snap.efficiency).replace(".", ",")} ${unitShort}` : "sem média"}
              {vehicle.cost_per_km > 0 ? ` · manutenção ${brl(vehicle.cost_per_km)}/km` : ""}{vehicle.daily_rent > 0 ? ` · aluguel ${brl(vehicle.daily_rent)}/dia` : ""}. Já vem do cadastro do carro.
            </p>
            {advice && <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Com os preços cadastrados, {advice.best} sai mais barato ({brl(advice[advice.best])}/km).</p>}
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Começou</Label><input type="time" className={inputCls} value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div><Label>Parou</Label><input type="time" className={inputCls} value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          <div><Label>Pausa (min)</Label><input className={inputCls} inputMode="numeric" value={pause} onChange={(e) => setPause(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="0" /></div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label>Quanto rodou</Label>
            <button type="button" onClick={() => setKmMode(kmMode === "km" ? "odo" : "km")} className="text-[11px] font-bold text-brand-dark dark:text-brand-soft">{kmMode === "km" ? "Usar hodômetro" : "Digitar os km"}</button>
          </div>
          {kmMode === "km" ? (
            <input className={inputCls} inputMode="decimal" value={km} onChange={(e) => setKm(e.target.value)} placeholder="Km rodados no dia (ex.: 180)" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <input className={inputCls} inputMode="decimal" value={odo.a} onChange={(e) => setOdo({ ...odo, a: e.target.value })} placeholder="Hodômetro no início" />
              <input className={inputCls} inputMode="decimal" value={odo.b} onChange={(e) => setOdo({ ...odo, b: e.target.value })} placeholder="Hodômetro no fim" />
            </div>
          )}
        </div>
        <div><Label>Preço do combustível neste dia ({fuelUnit})</Label><input className={inputCls} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ex.: 6,19" /></div>
      </Card>

      <Card className="space-y-3">
        <p className="font-extrabold">Onde trabalhou e quanto ganhou</p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => {
            const on = Boolean(earn[p.key]);
            return (
              <button key={p.key} type="button" onClick={() => toggle(p.key)} aria-pressed={on}
                className={`inline-flex items-center gap-2 rounded-full pl-1 pr-3 py-1 text-xs font-bold border ${on ? "border-brand-dark dark:border-brand-vivid bg-brand-dark/10 dark:bg-brand-vivid/20" : "border-gray-200 dark:border-white/10 text-gray-500"}`}>
                <PlatformBadge platform={p.key} size={24} /> {p.name}
              </button>
            );
          })}
          {order.filter((k) => !PLATFORMS.some((p) => p.key === k)).map((k) => (
            <button key={k} type="button" onClick={() => toggle(k)} aria-pressed className="inline-flex items-center gap-2 rounded-full pl-1 pr-3 py-1 text-xs font-bold border border-brand-dark dark:border-brand-vivid bg-brand-dark/10 dark:bg-brand-vivid/20">
              <PlatformBadge platform={k} size={24} /> {platformOf(k).name} <X size={12} />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input className={inputCls} value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} placeholder="Outra plataforma (ex.: Loggi)" maxLength={30} />
          <button type="button" onClick={addCustom} className={btnGhostCls + " shrink-0"}><Plus size={14} /> Incluir</button>
        </div>

        {order.filter((k) => earn[k]).map((k) => (
          <div key={k} className="rounded-2xl border border-white/70 dark:border-white/5 p-3">
            <div className="flex items-center gap-2 mb-2"><PlatformBadge platform={k} size={26} /><span className="font-bold text-sm">{platformOf(k).name}</span></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Ganho (R$)</Label><input className={inputCls} inputMode="decimal" value={earn[k].amount} onChange={(e) => setEarn({ ...earn, [k]: { ...earn[k], amount: e.target.value } })} placeholder="0,00" /></div>
              <div><Label>Horas (opcional)</Label><input className={inputCls} inputMode="decimal" value={earn[k].hours} onChange={(e) => setEarn({ ...earn, [k]: { ...earn[k], hours: e.target.value } })} placeholder={order.length > 1 ? "Ex.: 3,5" : "Dia todo"} /></div>
              <div><Label>Corridas (opcional)</Label><input className={inputCls} inputMode="numeric" value={earn[k].trips} onChange={(e) => setEarn({ ...earn, [k]: { ...earn[k], trips: e.target.value.replace(/\D/g, "").slice(0, 4) } })} placeholder="0" /></div>
            </div>
          </div>
        ))}
        <div><Label>Gorjetas (R$, opcional)</Label><input className={inputCls} inputMode="decimal" value={tips} onChange={(e) => setTips(e.target.value)} placeholder="0,00" /></div>
      </Card>

      <Card className="space-y-3">
        <p className="font-extrabold">Outros gastos do dia <span className="font-normal text-xs text-gray-400">(opcional)</span></p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {([["tolls", "Pedágio"], ["parking", "Estacionamento"], ["wash", "Lavagem"], ["food", "Alimentação"], ["other_cost", "Outros"]] as const).map(([k, l]) => (
            <div key={k}><Label>{l} (R$)</Label><input className={inputCls} inputMode="decimal" value={costs[k]} onChange={(e) => setCosts({ ...costs, [k]: e.target.value })} placeholder="0,00" /></div>
          ))}
        </div>
        <div><Label>Observação</Label><input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="Ex.: chuva, evento no estádio" /></div>
      </Card>

      <Card className="space-y-3">
        <p className="font-extrabold">Resultado do dia</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 p-3"><p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">Ganho bruto</p><p className="font-extrabold">{brl(m.gross)}</p></div>
          <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 p-3"><p className="text-[11px] font-bold text-red-600 dark:text-red-300">Despesas</p><p className="font-extrabold">{brl(m.expenses)}</p></div>
          <div className="rounded-2xl bg-brand-dark/10 dark:bg-brand-vivid/20 p-3"><p className="text-[11px] font-bold text-brand-dark dark:text-brand-soft">Lucro líquido</p><p className={`font-extrabold ${m.net < 0 ? "text-red-600" : ""}`}>{brl(m.net)}</p></div>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-gray-500">Horas</dt><dd className="text-right font-bold">{m.hours ? hoursLabel(m.hours) : "—"}</dd>
          <dt className="text-gray-500">Combustível {snap.efficiency ? "" : "(cadastre o carro)"}</dt><dd className="text-right font-bold">{brl(m.fuel)}</dd>
          {m.vehicle > 0 && <><dt className="text-gray-500">Custo do carro</dt><dd className="text-right font-bold">{brl(m.vehicle)}</dd></>}
          <dt className="text-gray-500">Ganho por hora (bruto / líquido)</dt><dd className="text-right font-bold">{m.grossPerHour === null ? "—" : `${brl(m.grossPerHour)} / ${brl(m.netPerHour ?? 0)}`}</dd>
          <dt className="text-gray-500">Ganho por km (bruto / líquido)</dt><dd className="text-right font-bold">{m.grossPerKm === null ? "—" : `${brl(m.grossPerKm)} / ${brl(m.netPerKm ?? 0)}`}</dd>
          <dt className="text-gray-500">Despesa por km</dt><dd className="text-right font-bold">{m.costPerKm === null ? "—" : brl(m.costPerKm)}</dd>
        </dl>
        <ErrorNote message={error} />
        <div className="flex gap-2">
          {onCancel && <button type="button" onClick={onCancel} className={btnGhostCls + " flex-1 !py-3"}>Cancelar</button>}
          <button className={btnCls + " flex-1"} disabled={busy}>{busy ? "Salvando..." : editing ? "Salvar alterações" : "Salvar o dia"}</button>
        </div>
      </Card>
    </form>
  );
}
