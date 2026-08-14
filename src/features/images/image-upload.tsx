"use client";
import { useEffect, useState } from "react";

export function ImageUpload({ endpoint, label, fallbackSrc }: { endpoint: string; label: string; fallbackSrc?: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<string>();

  useEffect(() => {
    let objectUrl: string | undefined;
    let cancelled = false;
    fetch(`/api/backend${endpoint}?v=${Date.now()}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) return;
        return response.blob();
      })
      .then((blob) => {
        if (!blob || cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPreview(objectUrl);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [endpoint]);

  async function upload(file?: File) {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage("Use a PNG, JPEG or WebP image up to 5 MB.");
      return;
    }
    setBusy(true);
    setMessage("");
    const body = new FormData();
    body.append("file", file);
    try {
      const response = await fetch(`/api/backend${endpoint}`, { method: "PUT", body });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(payload?.message || `Could not upload image (${response.status}).`);
      }
      setPreview(URL.createObjectURL(file));
      setMessage("Image uploaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not upload image.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="my-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-sm font-semibold text-slate-900">{label}</p><div className="mt-4 flex items-center gap-4"><div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-200 text-xs text-slate-500">{preview ? <img src={preview} alt={`${label} preview`} className="size-full object-cover" onError={(event) => { if (fallbackSrc && event.currentTarget.src !== fallbackSrc) event.currentTarget.src = fallbackSrc; }} /> : fallbackSrc ? <img src={fallbackSrc} alt={`${label} preview`} className="size-full object-cover" /> : "No image"}</div><label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={busy} onChange={(event) => upload(event.target.files?.[0])} />{busy ? "Uploading…" : "Choose image"}</label></div>{message && <p role="status" className="mt-3 text-sm text-slate-700">{message}</p>}</div>;
}
