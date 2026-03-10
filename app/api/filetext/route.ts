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

async function extractPdfText(buffer: Buffer): Promise<string> {
  const mod: any = await import("pdf-parse");
  const PDFParse = mod?.PDFParse || mod?.default?.PDFParse || mod?.default;

  if (!PDFParse) {
    throw new Error("Could not load PDFParse from pdf-parse.");
  }

  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    const text =
      typeof result === "string"
        ? result
        : typeof result?.text === "string"
        ? result.text
        : "";

    return cleanText(text);
  } finally {
    if (typeof parser.destroy === "function") {
      await parser.destroy().catch(() => {});
    }
  }
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

    if (filename.endsWith(".txt") || filename.endsWith(".md")) {
      const text = cleanText(buffer.toString("utf8"));
      return NextResponse.json({
        ok: true,
        text,
        chars: text.length,
      });
    }

    if (filename.endsWith(".pdf")) {
      const text = await extractPdfText(buffer);

      return NextResponse.json({
        ok: true,
        text,
        chars: text.length,
      });
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