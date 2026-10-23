"use client";

import { isNativeApp } from "@/lib/native";

// Exportação de arquivos (CSV). No navegador baixa o arquivo; no app iOS (WKWebView não baixa blob) grava em cache
// com @capacitor/filesystem e abre a folha de compartilhar (@capacitor/share: Arquivos, AirDrop, WhatsApp...).

const safeName = (n: string) => n.replace(/[^\w.\-]+/g, "_").slice(0, 80) || "arquivo.csv";

function downloadInBrowser(filename: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** true = o arquivo foi entregue (baixado ou a folha de compartilhar abriu). false = a pessoa cancelou ou falhou. */
export async function saveOrShareText(filename: string, content: string, mime = "text/csv;charset=utf-8"): Promise<boolean> {
  if (!isNativeApp()) { downloadInBrowser(filename, content, mime); return true; }
  try {
    const [{ Filesystem, Directory, Encoding }, { Share }] = await Promise.all([import("@capacitor/filesystem"), import("@capacitor/share")]);
    const name = safeName(filename);
    const { uri } = await Filesystem.writeFile({ path: name, data: content, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await Share.share({ title: name, url: uri, dialogTitle: "Salvar ou enviar o arquivo" });
    return true;
  } catch {
    return false;
  }
}
