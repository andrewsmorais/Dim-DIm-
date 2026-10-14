"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileUp, Sparkles } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { useUsageType } from "@/lib/useUsageType";
import { brl, formatDateBR } from "@/lib/format";
import { categoryOptions, type CatRow } from "@/lib/categories";
import { invoiceMonthFor } from "@/lib/cards";
import {
  buildPreview, buildRules, parseStatement, suggestInvert,
  type ExistingTx, type ParseResult, type PreviewRow, type Rules,
} from "@/lib/importer";
import { BackTitle, Card, Label, Toggle, ErrorNote, inputCls, btnCls, btnGhostCls } from "@/components/ui/page";

type Acc = { id: string; name: string; is_business: boolean };
type CardT = { id: string; name: string; closing_day: number; due_day: number; is_business: boolean };

export default function ImportarPage() {
  const { supabase, userId, ready } = useSupabase();
  const { isMei } = useUsageType();
  const [accounts, setAccounts] = useState<Acc[]>([]);
  const [cards, setCards] = useState<CardT[]>([]);
  const [cats, setCats] = useState<CatRow[]>([]);
  const [rules, setRules] = useState<Rules>({});
  const [loading, setLoading] = useState(true);

  const [targetKind, setTargetKind] = useState<"account" | "card">("account");
  const [targetId, setTargetId] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [existing, setExisting] = useState<ExistingTx[]>([]);
  const [invert, setInvert] = useState(false);
  const [asBusiness, setAsBusiness] = useState(false);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ inserted: number; ignored: number; kind: "account" | "card"; id: string } | null>(null);

  useEffect(() => {
    if (!ready || !userId) return;
    (async () => {
      const [a, k, c, h] = await Promise.all([
        supabase.from("accounts").select("id,name,is_business").eq("user_id", userId).eq("archived", false).order("created_at"),
        supabase.from("credit_cards").select("id,name,closing_day,due_day,is_business").eq("user_id", userId).eq("archived", false).eq("kind", "credito").order("created_at"),
        supabase.from("categories").select("id,name,type,parent_id").order("name"),
        supabase.from("transactions").select("description,type,category_id").eq("user_id", userId).not("category_id", "is", null)
          .order("date", { ascending: false }).limit(3000),
      ]);
      if (a.error || k.error || c.error) setError("Não foi possível carregar suas contas e categorias.");
      const accs = (a.data ?? []) as Acc[];
      const crds = (k.data ?? []) as CardT[];
      setAccounts(accs);
      setCards(crds);
      setCats((c.data ?? []) as CatRow[]);
      setRules(buildRules((h.data ?? []) as { description: string; type: string; category_id: string | null }[]));
      if (accs.length) { setTargetKind("account"); setTargetId(accs[0].id); }
      else if (crds.length) { setTargetKind("card"); setTargetId(crds[0].id); }
      setLoading(false);
    })();
  }, [ready, userId, supabase]);

  const targets: { id: string; name: string; is_business: boolean }[] = targetKind === "account" ? accounts : cards;
  const target = targets.find((t) => t.id === targetId);

  // Troca de destino: escolhe o primeiro da lista, sugere o sinal e pré-seleciona "empresa" quando a conta/cartão é da empresa.
  function pickKind(kind: "account" | "card") {
    setTargetKind(kind);
    const list = kind === "account" ? accounts : cards;
    setTargetId(list[0]?.id ?? "");
    if (parsed) setInvert(suggestInvert(parsed, kind));
  }
  useEffect(() => { setAsBusiness(Boolean(target?.is_business)); }, [target?.id, target?.is_business]);

  // A prévia é refeita quando muda o arquivo, o destino ou o sinal.
  useEffect(() => {
    if (!parsed) { setRows([]); return; }
    setRows(buildPreview({ rows: parsed.rows, invert, targetId: targetId || "x", rules, cats, existing }));
  }, [parsed, invert, targetId, rules, cats, existing]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setDone(null);
    try {
      if (file.size > 8 * 1024 * 1024) throw new Error("Arquivo muito grande (máximo 8 MB).");
      const res = parseStatement(await file.arrayBuffer());
      const dates = res.rows.map((r) => r.date).sort();
      const ex = await supabase.from("transactions").select("date,amount,type,import_key").eq("user_id", userId!)
        .gte("date", dates[0]).lte("date", dates[dates.length - 1]).limit(5000);
      setExisting(((ex.data ?? []) as ExistingTx[]).map((x) => ({ ...x, amount: Number(x.amount) })));
      setFileName(file.name);
      setInvert(suggestInvert(res, targetKind));
      setParsed(res);
    } catch (err) {
      setParsed(null);
      setError(err instanceof Error ? err.message : "Não consegui ler este arquivo.");
    }
  }

  const optsIncome = useMemo(() => categoryOptions(cats, "income"), [cats]);
  const optsExpense = useMemo(() => categoryOptions(cats, "expense"), [cats]);

  const setRow = (uid: number, patch: Partial<PreviewRow>) => setRows((rs) => rs.map((r) => (r.uid === uid ? { ...r, ...patch } : r)));
  const chosen = rows.filter((r) => r.include);
  const inSum = chosen.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
  const outSum = chosen.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0);
  const uncategorized = chosen.filter((r) => !r.categoryId).length;

  function applyToBlank(type: "income" | "expense", catId: string) {
    if (!catId) return;
    setRows((rs) => rs.map((r) => (r.type === type && !r.categoryId ? { ...r, categoryId: catId, catSource: null } : r)));
  }

  async function doImport() {
    if (!userId || !target || !chosen.length) return;
    setBusy(true);
    setError(null);
    const card = targetKind === "card" ? cards.find((c) => c.id === targetId) : undefined;
    const payload = chosen.map((r) => {
      const base = {
        user_id: userId, description: r.description, amount: r.amount, type: r.type, date: r.date, category_id: r.categoryId,
        origin: "manual" as const, import_key: r.key, is_business: asBusiness,
      };
      return card ? { ...base, card_id: card.id, invoice_month: invoiceMonthFor(card, r.date) } : { ...base, account_id: targetId };
    });
    let inserted = 0;
    for (let i = 0; i < payload.length; i += 200) {
      const chunk = payload.slice(i, i + 200);
      const { data, error: err } = await supabase.from("transactions").upsert(chunk, { onConflict: "user_id,import_key", ignoreDuplicates: true }).select("id");
      if (err) {
        setBusy(false);
        setError(`Parei no lançamento ${i + 1} de ${payload.length} (${inserted} já salvos). Tente de novo: o que já entrou é ignorado, sem duplicar.`);
        if (inserted) window.dispatchEvent(new Event("jakash:changed"));
        return;
      }
      inserted += data?.length ?? 0;
    }
    setBusy(false);
    window.dispatchEvent(new Event("jakash:changed"));
    setDone({ inserted, ignored: payload.length - inserted, kind: targetKind, id: targetId });
    setParsed(null);
    setRows([]);
    setFileName("");
  }

  const noTargets = !loading && accounts.length === 0 && cards.length === 0;
  const range = parsed ? `${formatDateBR(parsed.rows.map((r) => r.date).sort()[0])} a ${formatDateBR(parsed.rows.map((r) => r.date).sort().slice(-1)[0])}` : "";

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <BackTitle title="Importar extrato ou fatura" subtitle="Envie o arquivo OFX ou CSV do seu banco. Ele é lido aqui, no seu aparelho." href="/transacoes" />

      {done && (
        <Card className="mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">{done.inserted} {done.inserted === 1 ? "lançamento importado" : "lançamentos importados"}</p>
              {done.ignored > 0 && <p className="text-sm text-gray-500 mt-0.5">{done.ignored} já existiam e foram ignorados.</p>}
              <p className="text-sm text-gray-500 mt-1">Nas próximas importações o app usa o que você categorizou aqui.</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Link href="/transacoes" className={btnCls}>Ver transações</Link>
                {done.kind === "card" && <Link href={`/cartoes/${done.id}`} className={btnGhostCls}>Abrir a fatura</Link>}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-6">
        {noTargets ? (
          <p className="text-sm text-gray-500">Cadastre antes uma <Link href="/contas-bancarias" className="font-bold text-brand-dark dark:text-brand-soft">conta bancária</Link> ou um <Link href="/cartoes" className="font-bold text-brand-dark dark:text-brand-soft">cartão de crédito</Link> para dizer onde os lançamentos entram.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Onde importar</Label>
              <div className="flex items-center gap-1 rounded-full bg-brand-dark/10 dark:bg-[#161616] p-1 w-fit mb-3">
                {([["account", "Conta bancária"], ["card", "Cartão de crédito"]] as const).map(([k, l]) => (
                  <button key={k} type="button" onClick={() => pickKind(k)} disabled={(k === "account" ? accounts : cards).length === 0}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold disabled:opacity-40 ${targetKind === k ? "bg-white dark:bg-[#262626] shadow-sm" : "text-gray-500"}`}>{l}</button>
                ))}
              </div>
              <select className={inputCls} value={targetId} onChange={(e) => setTargetId(e.target.value)} aria-label="Conta ou cartão de destino">
                {targets.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {targetKind === "card" && <p className="text-xs text-gray-500 mt-1.5">As compras entram na fatura pelo fechamento e vencimento do cartão. Parcelas viram um lançamento só (não são separadas).</p>}
            </div>
            <div>
              <label className={btnCls + " cursor-pointer"}>
                <FileUp size={16} /> {parsed ? "Trocar arquivo" : "Escolher arquivo"}
                <input type="file" className="hidden" accept=".ofx,.qfx,.csv,.txt,text/csv,application/x-ofx" onChange={onFile} />
              </label>
              {fileName && <span className="ml-3 text-sm text-gray-500">{fileName}</span>}
              <p className="text-xs text-gray-400 mt-2">Aceita OFX e CSV. PDF não é suportado: no app do banco, baixe o extrato ou a fatura em OFX ou CSV.</p>
            </div>
          </div>
        )}
        <ErrorNote message={error} />
      </Card>

      {parsed && (
        <>
          <Card className="mb-6">
            <p className="font-extrabold">{parsed.rows.length} lançamentos · {range}</p>
            {parsed.skipped > 0 && <p className="text-xs text-gray-500 mt-0.5">{parsed.skipped} linhas ignoradas (saldos, totais ou valor zero).</p>}
            <div className="space-y-3 mt-4">
              <Toggle checked={invert} onChange={setInvert} label="Inverter entradas e saídas"
                hint={targetKind === "card" ? "Ligue se as compras aparecem como valores positivos no arquivo (comum em fatura)." : "Ligue se as despesas apareceram como receitas."} />
              {(isMei || target?.is_business) && (
                <Toggle checked={asBusiness} onChange={setAsBusiness} label="Lançar como da empresa (MEI)" hint="Marca estes lançamentos como PJ. Eles entram na receita bruta e no limite do MEI." />
              )}
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <p className="font-extrabold flex items-center gap-2"><Sparkles size={16} className="text-brand-dark dark:text-brand-soft" /> Revise antes de importar</p>
              <div className="flex gap-2">
                <button type="button" className={btnGhostCls} onClick={() => setRows((rs) => rs.map((r) => ({ ...r, include: true })))}>Marcar todos</button>
                <button type="button" className={btnGhostCls} onClick={() => setRows((rs) => rs.map((r) => ({ ...r, include: false })))}>Desmarcar</button>
              </div>
            </div>
            {uncategorized > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 p-3">
                <p className="text-xs text-amber-700 dark:text-amber-300 sm:col-span-2 font-bold">{uncategorized} sem categoria. Aplique uma só vez a todas as que faltam:</p>
                <select className={inputCls} defaultValue="" onChange={(e) => { applyToBlank("expense", e.target.value); e.target.value = ""; }} aria-label="Categoria para despesas sem categoria">
                  <option value="">Despesas sem categoria…</option>
                  {optsExpense.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <select className={inputCls} defaultValue="" onChange={(e) => { applyToBlank("income", e.target.value); e.target.value = ""; }} aria-label="Categoria para receitas sem categoria">
                  <option value="">Receitas sem categoria…</option>
                  {optsIncome.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            )}
            <ul className="divide-y divide-gray-100 dark:divide-[#262626]">
              {rows.map((r) => (
                <li key={r.uid} className={`py-3 flex items-start gap-3 ${r.include ? "" : "opacity-60"}`}>
                  <input type="checkbox" checked={r.include} onChange={(e) => setRow(r.uid, { include: e.target.checked })} aria-label={`Importar ${r.description}`}
                    className="mt-1.5 h-5 w-5 shrink-0 accent-brand-dark" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold truncate min-w-0">{r.description}</p>
                      <span className={`font-bold whitespace-nowrap shrink-0 ${r.type === "income" ? "text-emerald-500" : "text-red-500"}`}>{r.type === "income" ? "+" : "-"}{brl(r.amount)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDateBR(r.date)}
                      {r.note && <span className="text-amber-600 dark:text-amber-400"> · {r.note}</span>}
                      {!r.note && r.catSource === "aprendida" && <span> · categoria do seu histórico</span>}
                      {!r.note && r.catSource === "padrao" && <span> · categoria sugerida</span>}
                    </p>
                    <select className={inputCls + " mt-2 !py-2"} value={r.categoryId ?? ""} onChange={(e) => setRow(r.uid, { categoryId: e.target.value || null, catSource: null })} aria-label={`Categoria de ${r.description}`}>
                      <option value="">Sem categoria</option>
                      {(r.type === "income" ? optsIncome : optsExpense).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <div className="fixed bottom-20 md:bottom-6 inset-x-0 md:left-64 z-20 px-4 pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto">
              <div className="rounded-3xl bg-white/95 dark:bg-[#161616] border border-white/80 dark:border-white/5 shadow-xl p-3 flex items-center justify-between gap-3">
                <div className="text-xs min-w-0">
                  <p className="font-extrabold text-sm">{chosen.length} selecionados</p>
                  <p className="text-gray-500 truncate"><span className="text-emerald-500 font-bold">+{brl(inSum)}</span> · <span className="text-red-500 font-bold">-{brl(outSum)}</span></p>
                </div>
                <button type="button" className={btnCls + " shrink-0"} onClick={doImport} disabled={busy || !chosen.length || !target}>
                  {busy ? "Importando…" : "Importar"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
