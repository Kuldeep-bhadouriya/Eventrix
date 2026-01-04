"use client";

export function createMailtoHref(input: {
  subject: string;
  body: string;
  to?: string;
}) {
  const params = new URLSearchParams();
  params.set("subject", input.subject);
  params.set("body", input.body);
  const base = input.to ? `mailto:${input.to}` : "mailto:";
  return `${base}?${params.toString()}`;
}

export function createWhatsAppHref(text: string) {
  const params = new URLSearchParams();
  params.set("text", text);
  return `https://wa.me/?${params.toString()}`;
}

export function downloadTextFile(fileName: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildIcsEvent(input: {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  startUtc: Date;
  endUtc: Date;
}) {
  const toIcsDate = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eventrix//Event Pass//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${input.uid}`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(input.startUtc)}`,
    `DTEND:${toIcsDate(input.endUtc)}`,
    `SUMMARY:${escapeIcs(input.title)}`,
    input.location ? `LOCATION:${escapeIcs(input.location)}` : null,
    input.description ? `DESCRIPTION:${escapeIcs(input.description)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return lines.join("\r\n");
}

function escapeIcs(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
