// Testes offline do Motorista de app: horas, combustível, ganho por hora/km, divisão por plataforma e exportação.
// Rodar: npm run test:driver
import assert from "node:assert/strict";
import { fuelCost, normalizeShift, platformShare, shiftMetrics, summarize, workedHours, type Shift } from "../src/lib/driver";
import { platformKeyFromName, platformOf } from "../src/lib/driverPlatforms";
import { driverCsv } from "../src/lib/driverExport";

let pass = 0;
const t = (name: string, fn: () => void) => { try { fn(); pass++; } catch (e) { console.error(`FALHOU: ${name}`); throw e; } };

const base: Shift = {
  id: "s1", date: "2026-10-20", vehicle_id: "v1", start_time: "08:00", end_time: "18:00", break_minutes: 60, km: 200,
  fuel: "gasolina", efficiency: 12.5, fuel_price: 6, cost_per_km: 0.1, rent: 0,
  earnings: [{ platform: "uber", amount: 300 }, { platform: "99", amount: 100 }], tips: 20,
  tolls: 10, parking: 0, wash: 0, food: 25, other_cost: 0, notes: null, income_tx_id: null, expense_tx_id: null,
};

t("Horas: fim - início - pausa; virar a noite", () => {
  assert.equal(workedHours("08:00", "18:00", 60), 9);
  assert.equal(workedHours("20:00", "02:30", 30), 6);
  assert.equal(workedHours(null, "10:00"), 0);
  assert.equal(workedHours("25:00", "10:00"), 0);
});

t("Combustível: km ÷ média × preço", () => {
  assert.equal(fuelCost(200, 12.5, 6), 96);
  assert.equal(fuelCost(200, 0, 6), 0);
  assert.equal(fuelCost(0, 12, 6), 0);
});

t("Dia completo: bruto, despesas, líquido, por hora e por km", () => {
  const m = shiftMetrics(base);
  assert.equal(m.gross, 420); // 300 + 100 + 20 gorjeta
  assert.equal(m.fuel, 96);
  assert.equal(m.vehicle, 20); // 200 km × 0,10
  assert.equal(m.extras, 35);
  assert.equal(m.expenses, 151);
  assert.equal(m.net, 269);
  assert.equal(m.hours, 9);
  assert.equal(m.grossPerHour, 46.67);
  assert.equal(m.netPerHour, 29.89);
  assert.equal(m.grossPerKm, 2.1);
  assert.equal(m.netPerKm, 1.35);
  assert.equal(m.costPerKm, 0.76);
});

t("Parte de uma plataforma: proporcional ao que rendeu, sem gorjeta do dia", () => {
  const p = platformShare(base, "uber")!;
  assert.equal(p.estimatedHours, true);
  assert.equal(p.metrics.gross, 300);
  assert.equal(p.metrics.hours, 6.75); // 9h × 75%
  assert.equal(p.metrics.km, 150);
  assert.equal(p.metrics.expenses, 113.25); // 151 × 75%
  assert.equal(platformShare(base, "indrive"), null);
});

t("Horas informadas por plataforma valem mais que a estimativa", () => {
  const s = { ...base, earnings: [{ platform: "uber", amount: 300, hours: 5 }, { platform: "99", amount: 100, hours: 4 }] };
  const p = platformShare(s, "uber")!;
  assert.equal(p.estimatedHours, false);
  assert.equal(p.metrics.hours, 5);
  assert.equal(p.metrics.grossPerHour, 60);
});

t("Dia com uma plataforma só: tudo é dela, inclusive gorjeta", () => {
  const s = { ...base, earnings: [{ platform: "uber", amount: 300 }] };
  const p = platformShare(s, "uber")!;
  assert.equal(p.estimatedHours, false);
  assert.equal(p.metrics.gross, 320);
  assert.equal(p.metrics.net, shiftMetrics(s).net);
});

t("Resumo do período e comparação por plataforma", () => {
  const d2: Shift = { ...base, id: "s2", date: "2026-10-21", earnings: [{ platform: "99", amount: 200 }], tips: 0, km: 100, tolls: 0, food: 0 };
  const all = summarize([base, d2]);
  assert.equal(all.days, 2);
  assert.equal(all.total.gross, 620);
  assert.equal(all.byPlatform[0].platform, "uber");
  assert.equal(all.byPlatform.find((p) => p.platform === "99")!.days, 2);
  const only99 = summarize([base, d2], "99");
  assert.equal(only99.days, 2);
  assert.equal(only99.total.gross, 300); // 100 + 200
  assert.equal(only99.byPlatform.length, 1);
});

t("Linha do banco (numeric como texto) vira números", () => {
  const s = normalizeShift({ id: 1, date: "2026-10-20", km: "120.5", efficiency: "11.20", fuel_price: "5.990", fuel: "etanol", earnings: [{ platform: "uber", amount: "150.30" }, { bad: 1 }], tips: null });
  assert.equal(s.km, 120.5);
  assert.equal(s.fuel, "etanol");
  assert.deepEqual(s.earnings, [{ platform: "uber", amount: 150.3, hours: null, trips: null }]);
  assert.equal(s.tips, 0);
});

t("Plataformas: conhecidas, digitadas e selo neutro", () => {
  assert.equal(platformOf("uber").name, "Uber");
  assert.equal(platformKeyFromName(" UBER "), "uber");
  assert.equal(platformKeyFromName("Uber Eats"), "ubereats");
  assert.equal(platformKeyFromName("Loggi"), "outra:Loggi");
  assert.equal(platformOf("outra:Loggi").name, "Loggi");
  assert.equal(platformOf("outra:Loggi").initials, "LO");
});

t("Planilha: resumo com ganho bruto, despesas e lucro líquido no topo; sem fórmula", () => {
  const csv = driverCsv([{ ...base, notes: "=HYPERLINK(\"x\")" }], [{ id: "v1", name: "Onix", fuel: "gasolina", efficiency: 12.5, fuel_price: 6, cost_per_km: 0.1, daily_rent: 0, archived: false }], { from: "2026-10-01", to: "2026-10-31" });
  assert.ok(csv.startsWith("﻿"));
  const lines = csv.split("\r\n");
  const idx = (s: string) => lines.findIndex((l) => l.startsWith(s));
  assert.ok(idx("GANHO BRUTO;420,00") > 0 && idx("GANHO BRUTO") < idx("DESPESAS;151,00") && idx("DESPESAS") < idx("LUCRO LÍQUIDO;269,00"));
  assert.ok(lines.some((l) => l.startsWith("20/10/2026;Onix;08:00;18:00;9,00;200,0;Uber 300,00 | 99 100,00;420,00")));
  assert.ok(csv.includes("'=HYPERLINK"));
});

console.log(`ok: ${pass} testes`);

// Pacote MEI só no Empresarial (teste grátis libera tudo).
import { meiLocked } from "../src/lib/plans";
assert.equal(meiLocked({ plan: "cpf", status: "active" }), true);
assert.equal(meiLocked({ plan: "familia", status: "active" }), true);
assert.equal(meiLocked({ plan: "mei", status: "active" }), false);
assert.equal(meiLocked({ plan: "cpf", status: "trial" }), false);
assert.equal(meiLocked(null), false);
console.log("ok: pacote MEI por plano");
