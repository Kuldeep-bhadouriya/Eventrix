"use client";

import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export async function downloadElementAsPng(
  element: HTMLElement,
  options?: { fileName?: string }
) {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = options?.fileName ?? "event-pass.png";
  link.click();
}

export async function downloadElementAsPdf(
  element: HTMLElement,
  options?: { fileName?: string; title?: string }
) {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 24;
  const maxWidth = pageWidth - margin * 2;

  // Note: jsPDF needs dimensions; we approximate by scaling to fit width.
  const imgProps = pdf.getImageProperties(dataUrl);
  const ratio = imgProps.width / imgProps.height;
  const width = maxWidth;
  const height = width / ratio;

  if (options?.title) {
    pdf.setFontSize(14);
    pdf.text(options.title, margin, 24);
    pdf.addImage(dataUrl, "PNG", margin, 36, width, height);
  } else {
    pdf.addImage(dataUrl, "PNG", margin, margin, width, height);
  }

  pdf.save(options?.fileName ?? "event-pass.pdf");
}
