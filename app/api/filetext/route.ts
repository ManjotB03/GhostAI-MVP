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

function installPdfJsPolyfills() {
  const g = globalThis as any;

  if (!g.DOMMatrix) {
    class SimpleDOMMatrix {
      a = 1;
      b = 0;
      c = 0;
      d = 1;
      e = 0;
      f = 0;

      constructor(init?: any) {
        if (Array.isArray(init) && init.length >= 6) {
          this.a = Number(init[0]) || 1;
          this.b = Number(init[1]) || 0;
          this.c = Number(init[2]) || 0;
          this.d = Number(init[3]) || 1;
          this.e = Number(init[4]) || 0;
          this.f = Number(init[5]) || 0;
        }
      }

      multiplySelf() {
        return this;
      }

      preMultiplySelf() {
        return this;
      }

      translateSelf(x = 0, y = 0) {
        this.e += Number(x) || 0;
        this.f += Number(y) || 0;
        return this;
      }

      scaleSelf() {
        return this;
      }

      rotateSelf() {
        return this;
      }

      invertSelf() {
        return this;
      }

      transformPoint(point: any) {
        return point;
      }

      static fromFloat32Array(arr: Float32Array) {
        return new SimpleDOMMatrix(Array.from(arr));
      }

      static fromFloat64Array(arr: Float64Array) {
        return new SimpleDOMMatrix(Array.from(arr));
      }
    }

    g.DOMMatrix = SimpleDOMMatrix;
  }

  if (!g.ImageData) {
    g.ImageData = class ImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;

      constructor(
        dataOrWidth: Uint8ClampedArray | number,
        widthOrHeight: number,
        maybeHeight?: number
      ) {
        if (typeof dataOrWidth === "number") {
          this.width = dataOrWidth;
          this.height = widthOrHeight;
          this.data = new Uint8ClampedArray(this.width * this.height * 4);
        } else {
          this.data = dataOrWidth;
          this.width = widthOrHeight;
          this.height = maybeHeight || 0;
        }
      }
    };
  }

  if (!g.Path2D) {
    g.Path2D = class Path2D {
      constructor(_path?: any) {}
      addPath() {}
    };
  }
}

async function extractPdfTextWithPdfjs(buffer: Buffer): Promise<string> {
  installPdfJsPolyfills();

  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    disableWorker: true,
    verbosity: 0,
    useSystemFonts: true,
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

    if (filename.endsWith(".txt") || filename.endsWith(".md")) {
      const text = cleanText(buffer.toString("utf8"));
      return NextResponse.json({
        ok: true,
        text,
        chars: text.length,
      });
    }

    if (filename.endsWith(".pdf")) {
      const text = await extractPdfTextWithPdfjs(buffer);

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