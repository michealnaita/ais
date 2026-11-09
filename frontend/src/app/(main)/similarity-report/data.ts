/* Mock similarity-report API. Every submission shows the same sample document for now. Replace with real API calls. */
import { mockDelay } from "@/services/mockDelay";
import type { MatchSource, Paragraph, ReportContent, SourceId } from "./types";

const SOURCES: Record<SourceId, MatchSource> = {
  arslan: { name: "Arslan_HIST304_2025.docx", meta: "Student submission · Deniz Arslan · 2025", ac: "#b8860b", bg2: "#fdf3d7" },
  kaya: { name: "JSTOR — “The Tanzimat Era, 1839–76”", meta: "Academic article · R. Davison", ac: "#0284c7", bg2: "#e2f1fc" },
  yildiz: { name: "Yıldız_HIST304_2024.docx", meta: "Student submission · Kemal Yıldız · 2024", ac: "#7c3aed", bg2: "#ece7fc" },
  demir: { name: "Britannica — “Ottoman Empire”", meta: "Public web source", ac: "#0d9488", bg2: "#d4f5ee" },
};

const PARAS: Paragraph[] = [
  { text: "This essay examines the Tanzimat reforms and argues that, while they are often framed as a straightforward programme of Westernisation, they are better understood as a pragmatic attempt by the Ottoman state to centralise authority and preserve its territorial integrity." },
  { src: "arslan", score: 91, text: "The Tanzimat, a Turkish word meaning reorganization, was a period of reform in the Ottoman Empire that began in 1839 and ended with the First Constitutional Era in 1876. The era was characterised by various attempts to modernise the empire and to secure its territorial integrity against nationalist movements from within and aggressive powers from outside.",
    source: "The Tanzimat (meaning reorganization) was a period of reform in the Ottoman Empire that began in 1839 and ended with the First Constitutional Era in 1876. The period was characterized by various attempts to modernize the empire and to secure its territorial integrity against nationalist movements and aggressive foreign powers." },
  { text: "What this conventional account underplays, however, is the degree to which reform was driven by fiscal desperation. The wars with Russia and the loss of revenue from breakaway provinces left the treasury unable to function, and many of the administrative changes were as much about taxation as about liberty." },
  { src: "kaya", score: 64, text: "The Edict of Gülhane of 1839 promised security of life, honour and property to all subjects regardless of religion, and replaced the arbitrary confiscation of property with a regular system of taxation. In doing so it articulated, for the first time in an Ottoman state document, something resembling the idea of equal citizenship.",
    source: "Promulgated in 1839, the Gülhane Edict guaranteed the security of life, honour, and property of all subjects irrespective of their religion, and abolished the practice of confiscation in favour of a regularised system of taxation — articulating for the first time in an official Ottoman document a notion approaching equal citizenship." },
  { text: "Whether these guarantees were honoured in practice is, of course, a separate question, and the gap between proclamation and implementation is one of the recurring themes of the period." },
  { src: "yildiz", score: 78, text: "A central pillar of the reforms was the creation of the Nizamiye courts, a hierarchy of secular tribunals that operated alongside the existing religious courts. These new courts gradually absorbed commercial and criminal matters, narrowing the jurisdiction of the şeriat and laying the institutional groundwork for a dual legal system.",
    source: "One of the central pillars of the reforms was the establishment of the Nizamiye courts — a hierarchy of secular tribunals operating alongside the religious courts. These courts steadily took over commercial and criminal cases, reducing the jurisdiction of the şeriat and creating the foundations of a dual legal system." },
  { text: "It is worth noting that this dualism was not resolved during the Tanzimat itself; rather, it produced a layered and sometimes contradictory legal culture that persisted well into the republican era." },
  { src: "arslan", score: 88, text: "The Reform Edict of 1856, known as the Islahat Fermanı, went further than its predecessor by explicitly guaranteeing the equality of Muslims and non-Muslims and opening public employment and military service to all subjects of the empire. It was issued partly under pressure from the European powers at the close of the Crimean War.",
    source: "The Imperial Reform Edict of 1856 (Islahat Fermanı) went further than the Gülhane Edict, explicitly guaranteeing the equality of Muslims and non-Muslims and opening public office and military service to all Ottoman subjects. It was promulgated in part under pressure from the European powers following the Crimean War." },
  { text: "The contradiction at the heart of the project is by now familiar: a programme of equality imposed from above, by an absolutist state, in order to forestall the disintegration that equality was supposed to prevent." },
  { src: "demir", score: 41, text: "By the later nineteenth century the empire was frequently described, in European chanceries and newspapers alike, as the “sick man of Europe” — a characterisation that obscured the real administrative achievements of the reforming decades.",
    source: "In European diplomatic correspondence of the nineteenth century the Ottoman Empire was repeatedly referred to as the 'sick man of Europe', a phrase that tended to obscure the genuine administrative achievements of the Tanzimat decades." },
  { text: "Read in this light, the Tanzimat is neither a triumph of liberal progress nor a hollow imitation of Europe, but a contested and unfinished project of state survival whose ambiguities the later empire never fully escaped." },
];

export async function fetchReportContent(): Promise<ReportContent> {
  await mockDelay();
  return { paras: PARAS, sources: SOURCES };
}
