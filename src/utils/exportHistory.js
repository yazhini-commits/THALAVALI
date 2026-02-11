import { getHistory } from "./historyStorage";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getChatPrimaryType } from "./historyStorage";
/* ================= CSV EXPORT ================= */
export function exportCSV() {
  const history = getHistory();

  if (!history || history.length === 0) {
    alert("No history available to export.");
    return;
  }

  const headers = [
    "Date",
    "Content Type",
    "Topic",
    "Tone",
    "Audience",
    "Keywords",
    "Length",
    "Generated Content",
  ];

  const rows = history.map((chat) => {
    const userMsg = chat.messages?.find((m) => m.role === "user");
    const aiMsg = chat.messages?.find((m) => m.role === "assistant");

    return [
      formatCSV(new Date(chat.createdAt).toLocaleString()),
      formatCSV(getChatPrimaryType(chat)),
      formatCSV(userMsg?.content || ""),
      formatCSV(userMsg?.meta?.tone || ""),
      formatCSV(userMsg?.meta?.audience || ""),
      formatCSV(userMsg?.meta?.keywords || ""),
      formatCSV(userMsg?.meta?.length || ""),
      formatCSV(aiMsg?.content || ""),
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "creator_content_history.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ================= PDF EXPORT ================= */
export function exportPDF() {
  const history = getHistory();

  if (!history || history.length === 0) {
    alert("No history available to export.");
    return;
  }

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  /* ================= TITLE ================= */
  doc.setFontSize(18);
  doc.text("Creator – Content History", 40, 40);

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Exported on ${new Date().toLocaleString()}`, 40, 60);

  /* ================= TABLE HEADERS ================= */
  const tableHead = [[
    "Date",
    "Type",
    "Topic",
    "Tone",
    "Audience",
    "Keywords",
    "Length",
    "Generated Content",
  ]];

  /* ================= TABLE ROWS ================= */
  const tableBody = history.map((chat) => {
    const userMsg = chat.messages?.find((m) => m.role === "user");
    const aiMsg = chat.messages?.find((m) => m.role === "assistant");

    return [
      new Date(chat.createdAt).toLocaleString(),
      getChatPrimaryType(chat),
      userMsg?.content || "",
      userMsg?.meta?.tone || "",
      userMsg?.meta?.audience || "",
      userMsg?.meta?.keywords || "",
      userMsg?.meta?.length || "",
      aiMsg?.content || "",
    ];
  });

  /* ================= TABLE RENDER ================= */
  autoTable(doc, {
    head: [["Date", "Role", "Type", "Content"]],
    body: rows,
    startY: 80,
    theme: "striped",
    styles: {
      fontSize: 9,
      cellPadding: 6,
      valign: "top",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [44, 123, 182],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 80 },
      2: { cellWidth: 140 },
      3: { cellWidth: 80 },
      4: { cellWidth: 100 },
      5: { cellWidth: 120 },
      6: { cellWidth: 80 },
      7: { cellWidth: 280 },
    },
    margin: { left: 30, right: 30 },
  });

  doc.save(`chat_session_${getChatPrimaryType(chat)}_${Date.now()}.pdf`);
}
/* ================= EXPORT SINGLE CHAT ================= */
export function exportSingleChatPDF(chat) {
  if (!chat) return;

  const userMsg = chat.messages?.find((m) => m.role === "user");
  const aiMsg = chat.messages?.find((m) => m.role === "assistant");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  doc.setFontSize(18);
  doc.text("Creator – Chat Export", 40, 40);

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(
    `Exported on ${new Date(chat.createdAt).toLocaleString()}`,
    40,
    60
  );

  autoTable(doc, {
    startY: 90,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 6 },
    body: [
      ["Date", new Date(chat.createdAt).toLocaleString()],
      ["Type", chat.type || ""],
      ["Topic", userMsg?.content || ""],
      ["Tone", userMsg?.meta?.tone || ""],
      ["Audience", userMsg?.meta?.audience || ""],
      ["Keywords", userMsg?.meta?.keywords || ""],
      ["Length", userMsg?.meta?.length || ""],
      ["Generated Content", aiMsg?.content || ""],
    ],
    columnStyles: {
      0: { cellWidth: 140, fontStyle: "bold" },
      1: { cellWidth: 360 },
    },
  });

  doc.save(
    `chat_${chat.type || "content"}_${Date.now()}.pdf`
  );
}

export function exportSingleChatCSV(chat) {
  if (!chat) return;

  const rows = chat.messages.map((m) => [
  new Date(m.createdAt).toLocaleString(),
  m.role,
  m.meta?.type || "",
  m.content || "",
]);


  const headers = [
    "Date",
    "Type",
    "Topic",
    "Tone",
    "Audience",
    "Keywords",
    "Length",
    "Generated Content",
  ];

  const row = [
    new Date(chat.createdAt).toLocaleString(),
    chat.type || "",
    userMsg?.content || "",
    userMsg?.meta?.tone || "",
    userMsg?.meta?.audience || "",
    userMsg?.meta?.keywords || "",
    userMsg?.meta?.length || "",
    aiMsg?.content || "",
  ].map(formatCSV);

  const csv = [headers.join(","), row.join(",")].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `chat_${chat.type || "content"}_${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ================= CSV SAFE STRING ================= */
function formatCSV(value) {
  if (!value) return '""';

  const safe = String(value)
    .replace(/"/g, '""')
    .replace(/\n/g, " ");

  return `"${safe}"`;
}
