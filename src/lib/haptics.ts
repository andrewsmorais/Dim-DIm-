"use client";

import { isNativeApp } from "@/lib/native";

/** Vibração leve de confirmação (só no app iOS; no site não faz nada). */
export async function lightImpact(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch { /* sem vibração: tudo bem */ }
}
