import { NextResponse } from "next/server";

export const runtime = "nodejs";

// ---- helpers ----
function clampText(s: string, max = 20000) {
  const t = String(s || "").replace(/\u0000/g, "");
  return t.length > max ? t.slice(0, max) : t;
}

async function extractPdfText(buf: Buffer): Promise<string> {
  // Use dynamic import so Next doesn't try to bundle it weirdly
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // IMPORTANT: disable worker in Node (fixes your exact error)
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buf),
    disableWorker: true,
  });

  const pdf = await loadingTask.promise;

  let out = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items?.map((it: any) => it.str).filter(Boolean) || [];
    out += strings.join(" ") + "\n";
  }

  return out.trim();
}

async function extractTextFromFile(file: File): Promise<string> {
  const name = (file.name || "").toLowerCase();

  if (name.endsWith(".pdf")) {
    const buf = Buffer.from(await file.arrayBuffer());
    return await extractPdfText(buf);
  }

  // txt/md/etc
  return (await file.text()).trim();
}

// ---- routes ----
export async function GET() {
  return NextResponse.json({
    ok: true,
    message:
      "Use POST multipart/form-data with field 'file' (pdf/txt/md). Example: fetch('/api/filetext', { method:'POST', body: formData })",
  });
}

export async function POST(req: Request) {
  try {
    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("multipart/form-data")) {
      return NextResponse.json(
        { ok: false, error: "Expected multipart/form-data" },
        { status: 400 }
      );
    }

    const form = await req.formData();
    const f = form.get("file");
    const file = f instanceof File ? f : null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "Missing file field 'file'" },
        { status: 400 }
      );
    }

    // optional: basic size guard (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: "File too large (max 10MB)" },
        { status: 400 }
      );
    }

    const raw = await extractTextFromFile(file);
    const text = clampText(raw, 20000);

    return NextResponse.json({
      ok: true,
      fileName: file.name,
      fileSize: file.size,
      textLen: text.length,
      preview: text.slice(0, 400),
      text,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
