import { NextResponse } from "next/server";

// ✅ Force Node runtime on Vercel (prevents Edge/browser-only pdfjs build issues)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ensureDomMatrixPolyfill() {
  // In some pdfjs bundles, DOMMatrix is referenced even for text extraction.
  // Node doesn't have it, so we polyfill.
  if (typeof (globalThis as any).DOMMatrix === "undefined") {
    try {
      // Small, safe polyfill package
      const mod: any = await import("dommatrix");
      (globalThis as any).DOMMatrix = mod.DOMMatrix || mod.default || mod;
    } catch (e) {
      // Minimal fallback if polyfill fails
      (globalThis as any).DOMMatrix = class DOMMatrix {
        // enough to satisfy pdfjs when it checks existence
        constructor() {}
      };
    }
  }
}

async function extractPdfText(buffer: ArrayBuffer) {
  await ensureDomMatrixPolyfill();

  // ✅ Use legacy build (best compatibility in Node)
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const uint8 = new Uint8Array(buffer);

  // ✅ disableWorker avoids workerSrc issues in Node / serverless
  const loadingTask = pdfjs.getDocument({
    data: uint8,
    disableWorker: true,
    verbosity: 0,
  });

  const pdf = await loadingTask.promise;

  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = (content.items || [])
      .map((it: any) => it.str)
      .filter(Boolean);
    out += strings.join(" ") + "\n\n";
  }

  return out.trim();
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message:
      "Use POST multipart/form-data with field 'file' (pdf/txt/md). Example: fetch('/api/filetext', { method:'POST', body: formData })",
  });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Missing file field 'file'." },
        { status: 400 }
      );
    }

    const name = (file.name || "").toLowerCase();

    // ✅ Plain text formats
    if (name.endsWith(".txt") || name.endsWith(".md")) {
      const text = (await file.text()).trim();
      return NextResponse.json({
        ok: true,
        fileName: file.name,
        fileSize: file.size,
        text,
        textLen: text.length,
        preview: text.slice(0, 200),
      });
    }

    // ✅ PDF
    if (!name.endsWith(".pdf")) {
      return NextResponse.json(
        { ok: false, error: "Unsupported file type. Use .pdf, .txt, or .md." },
        { status: 400 }
      );
    }

    const buf = await file.arrayBuffer();
    const text = await extractPdfText(buf);

    return NextResponse.json({
      ok: true,
      fileName: file.name,
      fileSize: file.size,
      text,
      textLen: text.length,
      preview: text.slice(0, 200),
    });
  } catch (err: any) {
    console.error("/api/filetext ERROR:", err?.message || err);
    return NextResponse.json(
      { ok: false, error: err?.message || "File parsing failed." },
      { status: 500 }
    );
  }
}
