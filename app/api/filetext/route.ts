import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanText(input: string) {
  return input
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractPdfTextWithPdfjs(buffer: Buffer): Promise<string> {
  // ✅ Import inside the function to keep Next happy with ESM builds
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // ✅ No worker on server
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    disableWorker: true,
    verbosity: 0,
  });

  const pdf = await loadingTask.promise;

  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = (content?.items || []) as any[];
    const strings = items.map((it) => it?.str).filter(Boolean);
    out += strings.join(" ") + "\n\n";
  }

  return cleanText(out);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const f = form.get("file");

    if (!f || typeof (f as any).arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "Missing file (did not receive a Blob/File in form-data)" },
        { status: 400 }
      );
    }

    const blob = f as Blob & { name?: string };
    const filename = (blob.name || "upload").toLowerCase();

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // txt / md
    if (filename.endsWith(".txt") || filename.endsWith(".md")) {
      const text = cleanText(buffer.toString("utf8"));
      return NextResponse.json({ ok: true, text, chars: text.length });
    }

    // pdf
    if (filename.endsWith(".pdf")) {
      const text = await extractPdfTextWithPdfjs(buffer);
      return NextResponse.json({ ok: true, text, chars: text.length });
    }

    return NextResponse.json(
      { error: "Unsupported file type. Use .pdf, .txt, or .md." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("FILETEXT ERROR:", err);
    return NextResponse.json(
      {
        error: "File parse failed",
        details: err?.message || String(err) || "Unknown",
      },
      { status: 500 }
    );
  }
}