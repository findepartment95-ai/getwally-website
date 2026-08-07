/* eslint-disable react-hooks/immutability, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
"use client";

import { ChangeEvent, CSSProperties, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Camera,
  ChartNoAxesCombined,
  ChevronDown,
  CheckCircle2,
  Cloud,
  FileSpreadsheet,
  CirclePlus,
  Goal,
  House,
  Mic,
  PiggyBank,
  Send,
  Square,
  Sparkles,
  Target,
  Trash2,
  Upload,
  UsersRound,
  WalletCards,
} from "lucide-react";
import "./mvp.css";

type Transaction = {
  id: number;
  date: string;
  title: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  ownerId: number | "family";
  source?: "manual" | "excel" | "pdf" | "receipt" | "voice";
};

type FamilyMember = {
  id: number;
  name: string;
  role: string;
  category: string;
  limit: number;
};

const initialTransactions: Transaction[] = [
  { id: 1, date: "2026-07-29", title: "Заработная плата", category: "Доход", amount: 14_000_000, type: "income", ownerId: 1 },
  { id: 2, date: "2026-07-29", title: "Korзинка", category: "Продукты", amount: 485_000, type: "expense", ownerId: "family" },
  { id: 3, date: "2026-07-28", title: "Аренда квартиры", category: "Дом", amount: 4_200_000, type: "expense", ownerId: "family" },
  { id: 4, date: "2026-07-27", title: "Транспорт", category: "Транспорт", amount: 175_000, type: "expense", ownerId: 1 },
  { id: 5, date: "2026-07-25", title: "Кафе", category: "Досуг", amount: 260_000, type: "expense", ownerId: 1 },
  { id: 201, date: "2026-07-29", title: "Доход Аваза", category: "Доход", amount: 10_000_000, type: "income", ownerId: 2 },
  { id: 202, date: "2026-07-28", title: "Покупки для дома", category: "Продукты", amount: 1_500_000, type: "expense", ownerId: 2 },
  { id: 203, date: "2026-07-26", title: "Транспорт Аваза", category: "Транспорт", amount: 700_000, type: "expense", ownerId: 2 },
  { id: 204, date: "2026-07-24", title: "Дом и досуг", category: "Дом", amount: 1_800_000, type: "expense", ownerId: 2 },
];

type WallyState = {
  transactions: Transaction[];
  familyMembers: FamilyMember[];
  familyLimit: number;
  goalAmount: number;
  goalSaved: number;
  preferences?: UserPreferences;
  conversationHistory?: ConversationTurn[];
};

type ConversationTurn = { role: "user" | "assistant"; text: string; createdAt: string };
type UserPreferences = { language: string; priorities: string[]; rules: string[]; notes: string };
type PendingAction = { type: "add_expense" | "add_income" | "update_goal"; title: string; amount: number; category?: string; ownerId?: number | "family"; reason?: string };

type ImportCandidate = Transaction & { selected: boolean };

const categories = [
  "Продукты", "Дом", "Коммунальные услуги", "Транспорт", "Кафе и рестораны",
  "Досуг", "Здоровье", "Образование и учёба", "Путешествия", "Одежда",
  "Дети", "Красота и уход", "Подписки и связь", "Кредиты и долги",
  "Подарки", "Налоги", "Благотворительность", "Другое",
];
const formatSum = (value: number) => new Intl.NumberFormat("ru-RU").format(Math.round(value));
const getInitials = (name: string) => name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

function categoryFor(text: string) {
  const value = text.toLowerCase();
  const rules: Array<[string, string[]]> = [
    ["Продукты", ["korzinka", "корзинка", "market", "supermarket", "grocery", "продукт", "makro", "havas"]],
    ["Коммунальные услуги", ["коммун", "electric", "электр", "газ", "water", "вода", "тепло"]],
    ["Дом", ["rent", "аренд", "мебел", "ремонт", "home"]],
    ["Транспорт", ["taxi", "такси", "yandex", "метро", "автобус", "топливо", "бензин", "fuel"]],
    ["Кафе и рестораны", ["cafe", "кафе", "restaurant", "ресторан", "coffee", "кофе", "food delivery"]],
    ["Здоровье", ["аптек", "pharmacy", "clinic", "клиник", "doctor", "врач", "medical"]],
    ["Образование и учёба", ["school", "школ", "university", "универс", "курс", "обуч", "education", "udemy"]],
    ["Путешествия", ["hotel", "отель", "booking", "airways", "avia", "авиа", "поезд", "travel", "путеше", "тур"]],
    ["Одежда", ["clothing", "fashion", "одежд", "обув", "zara"]],
    ["Дети", ["детск", "kindergarten", "садик", "игруш"]],
    ["Красота и уход", ["salon", "салон", "beauty", "космет"]],
    ["Подписки и связь", ["internet", "интернет", "telecom", "mobile", "spotify", "netflix", "подпис"]],
    ["Кредиты и долги", ["credit", "кредит", "loan", "займ", "долг"]],
    ["Налоги", ["tax", "налог"]],
    ["Благотворительность", ["charity", "благотвор", "donation"]],
    ["Досуг", ["cinema", "кино", "театр", "game", "развлеч"]],
  ];
  return rules.find(([, words]) => words.some((word) => value.includes(word)))?.[0] || "Другое";
}

function amountFrom(value: unknown) {
  if (typeof value === "number") return Math.abs(value);
  const normalized = String(value ?? "").replace(/[^\d,.-]/g, "").replace(/,(?=\d{1,2}$)/, ".").replace(/,/g, "");
  return Math.abs(Number(normalized) || 0);
}

function dateFrom(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  const match = String(value ?? "").match(/(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})|(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})/);
  if (!match) return new Date().toISOString().slice(0, 10);
  if (match[1]) return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  return `${match[6]}-${match[5].padStart(2, "0")}-${match[4].padStart(2, "0")}`;
}

function makeSpaceCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return `WALLY-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function getAnswer(question: string, income: number, expense: number, goalAmount: number, goalSaved: number) {
  const freeCash = Math.max(income - expense, 0);
  const q = question.toLowerCase();
  if (q.includes("отлож") || q.includes("накоп")) {
    return `В этом месяце после учтённых расходов остаётся ${formatSum(freeCash)} сум. Безопасный ориентир для накоплений — ${formatSum(freeCash * 0.7)} сум, оставив 30% свободного остатка как резерв.`;
  }
  if (q.includes("цель") || q.includes("отпуск")) {
    const left = Math.max(goalAmount - goalSaved, 0);
    const months = freeCash > 0 ? Math.ceil(left / (freeCash * 0.7)) : 0;
    return months
      ? `До цели осталось ${formatSum(left)} сум. При текущем темпе безопасных накоплений цель можно достичь примерно за ${months} мес.`
      : "Сейчас свободного остатка недостаточно. Добавьте доходы или пересмотрите лимиты расходов — я пересчитаю срок.";
  }
  if (q.includes("расход")) {
    return `Расходы составляют ${formatSum(expense)} сум — это ${income ? Math.round((expense / income) * 100) : 0}% учтённого дохода. Ниже я показал категории, которые сильнее всего влияют на бюджет.`;
  }
  return `Я вижу доходы ${formatSum(income)} сум и расходы ${formatSum(expense)} сум. Спросите, сколько можно отложить, когда будет достигнута цель или какие расходы самые крупные.`;
}

type SpeechRecognitionEventLike = {
  results: ArrayLike<{ 0: { transcript: string }; isFinal?: boolean }>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export default function WallyMvp() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("Здравствуйте! Я уже проанализировал демонстрационный семейный бюджет. Спросите меня о расходах или накоплениях.");
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Нажмите на микрофон и задайте вопрос");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [liveConversation, setLiveConversation] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({ language: "ru", priorities: [], rules: [], notes: "" });
  const [goalAmount, setGoalAmount] = useState(18_000_000);
  const [goalSaved, setGoalSaved] = useState(6_800_000);
  const [familyLimit, setFamilyLimit] = useState(12_000_000);
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeMemberId, setActiveMemberId] = useState(0);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { id: 1, name: "Паринова Диана", role: "Владелец бюджета", category: "Семейный бюджет", limit: 7_000_000 },
    { id: 2, name: "Аваз", role: "Участник семьи", category: "Семейный бюджет", limit: 5_000_000 },
  ]);
  const [spaceCode, setSpaceCode] = useState("");
  const [syncStatus, setSyncStatus] = useState<"loading" | "saved" | "saving" | "offline" | "error">("loading");
  const [showSync, setShowSync] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importOwner, setImportOwner] = useState<number | "family">("family");
  const [importCandidates, setImportCandidates] = useState<ImportCandidate[]>([]);
  const [importStatus, setImportStatus] = useState("");
  const [importProgress, setImportProgress] = useState(0);
  const hydrated = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const lastRemoteUpdate = useRef("");
  const applyingRemote = useRef(false);
  const savingCloud = useRef(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const liveConversationRef = useRef(false);

  useEffect(() => {
    const savedCode = window.localStorage.getItem("wally-space-code") || makeSpaceCode();
    window.localStorage.setItem("wally-space-code", savedCode);
    setSpaceCode(savedCode);
    void loadCloudState(savedCode);
  }, []);

  useEffect(() => {
    if (!hydrated.current || !spaceCode) return;
    if (applyingRemote.current) {
      applyingRemote.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSyncStatus("saving");
    saveTimer.current = setTimeout(() => { saveTimer.current = null; void saveCloudState(); }, 700);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [transactions, familyMembers, familyLimit, goalAmount, goalSaved, preferences, conversationHistory, spaceCode]);

  useEffect(() => {
    if (!spaceCode) return;
    const refresh = () => { if (!document.hidden) void refreshCloudState(spaceCode); };
    const interval = window.setInterval(refresh, 4000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [spaceCode]);

  function applyCloudState(state: WallyState) {
    applyingRemote.current = true;
    setTransactions(state.transactions || []);
    setFamilyMembers(state.familyMembers || []);
    setFamilyLimit(state.familyLimit || 12_000_000);
    setGoalAmount(state.goalAmount || 18_000_000);
    setGoalSaved(state.goalSaved || 0);
    setPreferences(state.preferences || { language: "ru", priorities: [], rules: [], notes: "" });
    setConversationHistory(state.conversationHistory || []);
  }

  async function loadCloudState(code: string) {
    setSyncStatus("loading");
    try {
      const response = await fetch("/api/wally-state", { headers: { "x-wally-space-code": code } });
      if (!response.ok) throw new Error("load");
      const data = await response.json() as { exists: boolean; state?: WallyState; updatedAt?: string };
      if (data.exists && data.state) {
        applyCloudState(data.state);
        lastRemoteUpdate.current = data.updatedAt || "";
      } else {
        const oldTransactions = window.localStorage.getItem("wally-mvp-transactions");
        const oldMembers = window.localStorage.getItem("wally-family-members");
        if (oldTransactions) setTransactions(JSON.parse(oldTransactions));
        if (oldMembers) setFamilyMembers(JSON.parse(oldMembers));
      }
      hydrated.current = true;
      setSyncStatus("saved");
      window.setTimeout(() => void saveCloudState(code), 50);
    } catch {
      hydrated.current = true;
      setSyncStatus("offline");
    }
  }

  async function refreshCloudState(code: string) {
    if (!hydrated.current || savingCloud.current || saveTimer.current) return;
    try {
      const response = await fetch("/api/wally-state", { cache: "no-store", headers: { "x-wally-space-code": code } });
      if (!response.ok) return;
      const data = await response.json() as { exists: boolean; state?: WallyState; updatedAt?: string };
      if (!data.exists || !data.state || !data.updatedAt || data.updatedAt <= lastRemoteUpdate.current) return;
      applyCloudState(data.state);
      lastRemoteUpdate.current = data.updatedAt;
      setSyncStatus("saved");
    } catch {
      setSyncStatus("offline");
    }
  }

  async function saveCloudState(code = spaceCode) {
    if (!code) return;
    savingCloud.current = true;
    try {
      const state: WallyState = { transactions, familyMembers, familyLimit, goalAmount, goalSaved, preferences, conversationHistory };
      const response = await fetch("/api/wally-state", { method: "PUT", headers: { "content-type": "application/json", "x-wally-space-code": code }, body: JSON.stringify(state) });
      if (!response.ok) throw new Error("save");
      const result = await response.json() as { updatedAt?: string };
      if (result.updatedAt) lastRemoteUpdate.current = result.updatedAt;
      setSyncStatus("saved");
    } catch {
      setSyncStatus("error");
    } finally {
      savingCloud.current = false;
    }
  }

  const visibleTransactions = useMemo(() => activeMemberId === 0 ? transactions : transactions.filter((t) => t.ownerId === activeMemberId), [transactions, activeMemberId]);
  const income = useMemo(() => visibleTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0), [visibleTransactions]);
  const expense = useMemo(() => visibleTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0), [visibleTransactions]);
  const balance = income - expense;
  const goalProgress = Math.min((goalSaved / goalAmount) * 100, 100);
  const activeMember = familyMembers.find((member) => member.id === activeMemberId) || familyMembers[0];
  const isFamilyMode = activeMemberId === 0;
  const activeLimit = isFamilyMode ? familyLimit : activeMember?.limit || 0;
  const familyRemaining = Math.max(activeLimit - expense, 0);
  const familyProgress = activeLimit ? Math.min((expense / activeLimit) * 100, 100) : 0;

  const categoryData = useMemo(() => {
    const totals = visibleTransactions.filter((t) => t.type === "expense").reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [visibleTransactions]);

  const transactionOwnerName = (transaction: Transaction) => transaction.ownerId === "family"
    ? "Семейный бюджет"
    : familyMembers.find((member) => member.id === transaction.ownerId)?.name || "Участник";

  function addTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const type = data.get("type") as "income" | "expense";
    const transaction: Transaction = {
      id: Date.now(),
      date: String(data.get("date")),
      title: String(data.get("title")),
      category: type === "income" ? "Доход" : String(data.get("category")),
      amount: Number(data.get("amount")),
      type,
      ownerId: data.get("ownerId") === "family" ? "family" : Number(data.get("ownerId")),
      source: "manual",
    };
    setTransactions((prev) => [transaction, ...prev]);
    setShowForm(false);
    event.currentTarget.reset();
  }

  function rowsToCandidates(rows: unknown[][], source: "excel" | "pdf" | "receipt") {
    const header = rows[0]?.map((cell) => String(cell).toLowerCase()) || [];
    const findColumn = (...names: string[]) => header.findIndex((cell) => names.some((name) => cell.includes(name)));
    const dateIndex = findColumn("дата", "date", "sana");
    const titleIndex = findColumn("опис", "назнач", "наимен", "контраг", "merchant", "details", "operation");
    const amountIndex = findColumn("сумма", "amount", "miqdor", "расход", "debit");
    const incomeIndex = findColumn("приход", "доход", "credit", "income");
    return rows.slice(header.length ? 1 : 0).flatMap((row, index) => {
      const line = row.map(String).join(" ").trim();
      const amount = amountFrom(amountIndex >= 0 ? row[amountIndex] : [...row].reverse().find((cell) => amountFrom(cell) > 0));
      if (!line || amount <= 0) return [];
      const isIncome = incomeIndex >= 0 && amountFrom(row[incomeIndex]) > 0;
      const title = titleIndex >= 0 && row[titleIndex] ? String(row[titleIndex]) : line.replace(/[\d\s.,-]{5,}/g, " ").trim().slice(0, 80) || "Операция из выписки";
      return [{ id: Date.now() + index, date: dateFrom(dateIndex >= 0 ? row[dateIndex] : line), title, category: isIncome ? "Доход" : categoryFor(line), amount, type: isIncome ? "income" as const : "expense" as const, ownerId: importOwner, source, selected: true }];
    }).slice(0, 300);
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportCandidates([]);
    setImportStatus(`Анализирую ${file.name}…`);
    setImportProgress(8);
    try {
      let candidates: ImportCandidate[] = [];
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (["xlsx", "xls", "csv"].includes(extension || "")) {
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
        setImportProgress(70);
        candidates = rowsToCandidates(rows, "excel");
      } else if (extension === "pdf" || file.type === "application/pdf") {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), disableWorker: true }).promise;
        const lines: unknown[][] = [];
        for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
          const page = await document.getPage(pageNumber);
          const content = await page.getTextContent();
          const grouped = new Map<number, string[]>();
          for (const item of content.items as Array<{ str?: string; transform?: number[] }>) {
            const y = Math.round(item.transform?.[5] || 0);
            grouped.set(y, [...(grouped.get(y) || []), item.str || ""]);
          }
          [...grouped.entries()].sort((a, b) => b[0] - a[0]).forEach(([, parts]) => lines.push([parts.join(" ")]));
          setImportProgress(Math.round((pageNumber / document.numPages) * 70));
        }
        candidates = rowsToCandidates(lines, "pdf");
      } else if (file.type.startsWith("image/")) {
        const { recognize } = await import("tesseract.js");
        const result = await recognize(file, "rus+eng", { logger: (message) => { if (message.status === "recognizing text") setImportProgress(Math.round(message.progress * 75)); } });
        const text = result.data.text;
        const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
        const totalLine = [...lines].reverse().find((line) => /(итог|total|сумма|to'lov)/i.test(line)) || lines.sort((a, b) => amountFrom(b) - amountFrom(a))[0] || "";
        const amount = amountFrom(totalLine);
        const title = lines.find((line) => line.length > 2 && !/чек|receipt|касса/i.test(line)) || "Покупка по чеку";
        if (amount) candidates = [{ id: Date.now(), date: dateFrom(text), title: title.slice(0, 80), category: categoryFor(text), amount, type: "expense", ownerId: importOwner, source: "receipt", selected: true }];
      } else {
        throw new Error("Поддерживаются Excel, CSV, PDF, JPG и PNG");
      }
      if (!candidates.length) throw new Error("Не удалось найти операции. Проверьте, что в файле есть даты, описания и суммы.");
      setImportCandidates(candidates);
      setImportProgress(100);
      setImportStatus(`WALLY нашёл ${candidates.length} операций и распределил их по категориям. Проверьте результат перед сохранением.`);
    } catch (error) {
      setImportStatus(error instanceof Error ? error.message : "Не удалось обработать файл");
      setImportProgress(0);
    }
    event.target.value = "";
  }

  function confirmImport() {
    const selected = importCandidates.filter((item) => item.selected).map(({ selected: _selected, ...transaction }) => transaction);
    setTransactions((previous) => [...selected, ...previous]);
    setImportCandidates([]);
    setShowImport(false);
    setAnswer(`Готово: я добавил ${selected.length} операций, распределил расходы по категориям и сохранил их в семейной истории.`);
  }

  function speak(text: string) {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ru-RU";
    utterance.rate = 1;
    utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((voice) => voice.lang.toLowerCase().startsWith("ru")) || null;
    setVoiceStatus("WALLY отвечает голосом");
    utterance.onend = () => {
      setVoiceStatus(liveConversationRef.current ? "Продолжаю слушать…" : "Нажмите на микрофон, чтобы продолжить разговор");
      if (liveConversationRef.current) window.setTimeout(() => startVoice(), 350);
    };
    utterance.onerror = () => setVoiceStatus("Ответ показан на экране");
    window.speechSynthesis.speak(utterance);
  }

  async function processQuestion(text: string, answerByVoice = false) {
    const cleanQuestion = text.trim();
    if (!cleanQuestion) return;
    setVoiceStatus("WALLY анализирует ваш бюджет…");
    setAiThinking(true);
    const now = new Date().toISOString();
    const userTurn: ConversationTurn = { role: "user", text: cleanQuestion, createdAt: now };
    let response = "";
    try {
      const apiResponse = await fetch("/api/wally-ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: cleanQuestion, transactions, familyMembers, familyLimit, goalAmount, goalSaved, preferences, history: [...conversationHistory, userTurn].slice(-12) }),
      });
      if (!apiResponse.ok) throw new Error("ai-unavailable");
      const result = await apiResponse.json() as { reply?: string; memory?: { kind: "priority" | "rule" | "note"; value: string } | null; pendingAction?: PendingAction | null };
      response = result.reply || "Уточните, пожалуйста, ваш запрос.";
      if (result.pendingAction) setPendingAction(result.pendingAction);
      if (result.memory?.value) {
        setPreferences((current) => result.memory?.kind === "priority"
          ? { ...current, priorities: [...new Set([...current.priorities, result.memory!.value])].slice(-12) }
          : result.memory?.kind === "rule"
            ? { ...current, rules: [...new Set([...current.rules, result.memory!.value])].slice(-12) }
            : { ...current, notes: [current.notes, result.memory.value].filter(Boolean).join("; ").slice(-800) });
      }
    } catch {
      response = getAnswer(cleanQuestion, income, expense, goalAmount, goalSaved);
      const match = cleanQuestion.match(/(?:запиши|добавь|потратил[аи]?|расход)\s+(?:операцию\s+)?([\d\s.,]+)\s*(?:сум)?(?:\s+на)?\s*(.*)/i);
      if (match && amountFrom(match[1])) {
        setPendingAction({ type: "add_expense", title: match[2].trim() || "Расход по команде", amount: amountFrom(match[1]), category: categoryFor(match[2]), ownerId: isFamilyMode ? "family" : activeMemberId, reason: "Добавление операции требует подтверждения" });
        response = "Я подготовил операцию. Подтвердите её перед сохранением в семейный бюджет.";
      }
    } finally {
      setAiThinking(false);
    }
    setAnswer(response);
    setConversationHistory((current) => [...current, userTurn, { role: "assistant", text: response, createdAt: new Date().toISOString() }].slice(-40));
    setQuestion("");
    if (answerByVoice) window.setTimeout(() => speak(response), 120);
  }

  function confirmPendingAction() {
    if (!pendingAction) return;
    if (pendingAction.type === "update_goal") setGoalAmount(Math.max(pendingAction.amount, 0));
    else {
      const type = pendingAction.type === "add_income" ? "income" : "expense";
      setTransactions((current) => [{ id: Date.now(), date: new Date().toISOString().slice(0, 10), title: pendingAction.title, category: type === "income" ? "Доход" : pendingAction.category || categoryFor(pendingAction.title), amount: pendingAction.amount, type, ownerId: pendingAction.ownerId || (isFamilyMode ? "family" : activeMemberId), source: "voice" }, ...current]);
    }
    const confirmation = pendingAction.type === "update_goal" ? `Цель обновлена: ${formatSum(pendingAction.amount)} сум.` : `Подтверждено и сохранено: ${pendingAction.title}, ${formatSum(pendingAction.amount)} сум.`;
    setAnswer(confirmation);
    setConversationHistory((current) => [...current, { role: "assistant", text: confirmation, createdAt: new Date().toISOString() }].slice(-40));
    setPendingAction(null);
    if (voiceEnabled) speak(confirmation);
  }

  function toggleLiveConversation() {
    const next = !liveConversationRef.current;
    liveConversationRef.current = next;
    setLiveConversation(next);
    if (next) {
      setVoiceEnabled(true);
      setVoiceStatus("Запускаю живой разговор…");
      startVoice();
    } else {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
      setIsListening(false);
      setVoiceStatus("Живой разговор завершён");
    }
  }

  function askWally(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void processQuestion(question, voiceEnabled);
  }

  function addFamilyMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const member: FamilyMember = {
      id: Date.now(),
      name: String(data.get("memberName")),
      role: String(data.get("memberRole")),
      category: String(data.get("budgetCategory")),
      limit: Number(data.get("memberLimit")),
    };
    setFamilyMembers((prev) => [...prev, member]);
    setActiveMemberId(member.id);
    setShowFamilyForm(false);
    event.currentTarget.reset();
    window.setTimeout(() => document.getElementById("family-budget")?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  function startVoice() {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    window.speechSynthesis?.cancel();
    const SpeechWindow = window as typeof window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const BrowserSpeech = SpeechWindow.SpeechRecognition || SpeechWindow.webkitSpeechRecognition;
    if (!BrowserSpeech) {
      const message = "Голосовой разговор не поддерживается этим браузером. Откройте WALLY в Chrome или Safari и разрешите доступ к микрофону.";
      setAnswer(message);
      setVoiceStatus("Микрофон недоступен в этом браузере");
      return;
    }
    const recognition = new BrowserSpeech();
    recognitionRef.current = recognition;
    recognition.lang = "ru-RU";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus("Слушаю вас…");
    };
    recognition.onresult = (event) => {
      let transcript = "";
      let finalTranscript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        transcript += result[0]?.transcript || "";
        if (result.isFinal !== false) finalTranscript += result[0]?.transcript || "";
      }
      setQuestion(transcript);
      if (finalTranscript.trim()) {
        recognition.stop();
        void processQuestion(finalTranscript, true);
      }
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      setVoiceStatus(event.error === "not-allowed" ? "Разрешите WALLY доступ к микрофону" : "Не расслышал. Нажмите и попробуйте ещё раз");
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.start();
  }

  return (
    <main className="mvp">
      <aside className="mvp-sidebar">
        <Link className="mvp-brand" href="/"><img src="/wally-logo-transparent-hd.png" alt="WALLY" /></Link>
        <nav aria-label="Разделы приложения">
          <a className="active" href="#overview"><House />Обзор</a>
          <a href="#operations"><WalletCards />Операции</a>
          <a href="#analytics"><ChartNoAxesCombined />Аналитика</a>
          <a href="#goals"><Target />Цели</a>
          <a href="#family-budget"><UsersRound />Семейный бюджет</a>
          <a href="#assistant"><Bot />WALLY AI</a>
        </nav>
        <div className="mvp-profile-wrap">
          {showProfileMenu && (
            <div className="profile-menu" role="menu" aria-label="Выбор участника">
              <small>ВЫБЕРИТЕ БЮДЖЕТ</small>
              <button type="button" role="menuitem" className={isFamilyMode ? "selected family-option" : "family-option"} onClick={() => { setActiveMemberId(0); setShowProfileMenu(false); }}>
                <span><UsersRound /></span><div><b>Семейный бюджет</b><small>Общие данные всех участников</small></div>{isFamilyMode && <i>✓</i>}
              </button>
              {familyMembers.map((member) => (
                <button
                  type="button"
                  role="menuitem"
                  className={!isFamilyMode && member.id === activeMember?.id ? "selected" : ""}
                  key={member.id}
                  onClick={() => { setActiveMemberId(member.id); setShowProfileMenu(false); }}
                >
                  <span>{getInitials(member.name)}</span>
                  <div><b>{member.name}</b><small>{member.role}</small></div>
                  {!isFamilyMode && member.id === activeMember?.id && <i>✓</i>}
                </button>
              ))}
            </div>
          )}
          <div className="mvp-profile">
            <button className="profile-switcher" type="button" aria-label="Переключить профиль" aria-expanded={showProfileMenu} onClick={() => setShowProfileMenu((value) => !value)}>
              <span>{isFamilyMode ? <UsersRound /> : getInitials(activeMember?.name || "Паринова Диана")}</span>
              <div><b>{isFamilyMode ? "Семейный бюджет" : activeMember?.name}</b><small>{isFamilyMode ? "Общие данные семьи" : activeMember?.role}</small></div>
              <ChevronDown />
            </button>
            <button
              className="profile-add"
              type="button"
              aria-label="Добавить участника"
              title="Добавить участника"
              onClick={() => setShowFamilyForm(true)}
            >+</button>
          </div>
        </div>
      </aside>

      <section className="mvp-content">
        <header className="mvp-header">
          <div><small>31 июля 2026</small><h1>{isFamilyMode ? "Семейный обзор" : `Профиль: ${activeMember?.name}`}</h1><p>{isFamilyMode ? "Общие данные всех участников семьи." : "Доходы, расходы и аналитика выбранного участника."}</p></div>
          <div className="header-actions">
            <input ref={cameraInput} className="camera-input" type="file" accept="image/*" capture="environment" onChange={(event) => { setShowImport(true); void importFile(event); }} />
            <button className={`sync-button ${syncStatus}`} onClick={() => setShowSync(true)}><Cloud />{syncStatus === "saved" ? "Синхронизировано" : syncStatus === "saving" ? "Сохраняю…" : syncStatus === "loading" ? "Загрузка…" : "Нет синхронизации"}</button>
            <button className="scan-button" onClick={() => cameraInput.current?.click()}><Camera />Сканировать чек</button>
            <button className="import-button" onClick={() => setShowImport(true)}><Upload />Импорт</button>
            <button className="add-button" onClick={() => setShowForm(true)}><CirclePlus />Добавить операцию</button>
          </div>
        </header>

        <section className="kpi-grid" id="overview">
          <article><div className="kpi-icon balance"><WalletCards /></div><span>Доступный баланс</span><strong>{formatSum(balance)} <small>сум</small></strong><p><ArrowUpRight />После расходов этого месяца</p></article>
          <article><div className="kpi-icon income"><ArrowDownRight /></div><span>Доходы</span><strong>{formatSum(income)} <small>сум</small></strong><p><ArrowUpRight />Учтённые поступления</p></article>
          <article><div className="kpi-icon expense"><ArrowUpRight /></div><span>Расходы</span><strong>{formatSum(expense)} <small>сум</small></strong><p className="expense-text"><ArrowUpRight />{income ? Math.round((expense / income) * 100) : 0}% от дохода</p></article>
          <article><div className="kpi-icon saving"><PiggyBank /></div><span>Можно отложить</span><strong>{formatSum(Math.max(balance * 0.7, 0))} <small>сум</small></strong><p><Sparkles />Расчёт WALLY</p></article>
        </section>

        <section className="mvp-card family-budget" id="family-budget">
          <div className="family-budget-copy">
            <div className="card-head">
              <div><small>{isFamilyMode ? "СЕМЕЙНЫЙ БЮДЖЕТ" : "ЛИЧНЫЙ БЮДЖЕТ"}</small><h2>{isFamilyMode ? "Общий план на месяц" : activeMember?.name}</h2></div>
              <span className="family-badge"><UsersRound />{isFamilyMode ? `${familyMembers.length} участника` : activeMember?.role}</span>
            </div>
            <p>{isFamilyMode ? "Общие доходы и расходы семьи, включая операции всех участников." : "Здесь отображаются только операции и показатели выбранного участника."}</p>
            <label>
              {isFamilyMode ? "Общий месячный лимит" : "Персональный месячный лимит"}
              <div className="limit-input"><input type="number" min="0" step="100000" value={activeLimit} onChange={(e) => { const value = Math.max(Number(e.target.value), 0); if (isFamilyMode) setFamilyLimit(value); else setFamilyMembers((prev) => prev.map((member) => member.id === activeMemberId ? { ...member, limit: value } : member)); }} /><span>сум</span></div>
            </label>
          </div>
          <div className="family-budget-progress">
            <div className="family-progress-head"><b>{Math.round(familyProgress)}%</b><span>использовано</span></div>
            <div className="family-progress-track"><i style={{ width: `${familyProgress}%` }} /></div>
            <div className="family-stats">
              <span><small>Потрачено</small><b>{formatSum(expense)} сум</b></span>
              <span><small>Осталось</small><b>{formatSum(familyRemaining)} сум</b></span>
            </div>
            <div className="family-members">
              <div className="family-members-head"><b>Участники</b><button type="button" onClick={() => setShowFamilyForm(true)}>+ Добавить</button></div>
              {familyMembers.map((member) => (
                <div className={`family-member ${!isFamilyMode && member.id === activeMember?.id ? "active" : ""}`} key={member.id} onClick={() => setActiveMemberId(member.id)}>
                  <span>{getInitials(member.name)}</span>
                  <div><b>{member.name}</b><small>{member.role} · {member.category}</small></div>
                  <strong>{formatSum(member.limit)} сум</strong>
                  {member.id !== 1 && <button aria-label={`Удалить ${member.name}`} onClick={(event) => { event.stopPropagation(); setFamilyMembers((prev) => prev.filter((item) => item.id !== member.id)); if (activeMemberId === member.id) setActiveMemberId(1); }}><Trash2 /></button>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mvp-grid">
          <article className="mvp-card spending-analytics" id="analytics">
            <div className="card-head"><div><small>АНАЛИТИКА</small><h2>Куда уходят деньги</h2></div><span>Июль</span></div>
            <div className="category-chart">
              {categoryData.map(([category, value], index) => (
                <div className="category-row" key={category}>
                  <div><i className={`category-dot dot-${index % 5}`} /><span>{category}</span><b>{formatSum(value)} сум</b></div>
                  <div className="bar-track"><i style={{ width: `${expense ? Math.max((value / expense) * 100, 4) : 0}%` }} /></div>
                </div>
              ))}
            </div>
          </article>

          <article className="mvp-card goal-card" id="goals">
            <div className="card-head"><div><small>ЦЕЛЬ</small><h2>Семейный отпуск</h2></div><Goal /></div>
            <div className="goal-ring" style={{ "--progress": `${goalProgress * 3.6}deg` } as CSSProperties}>
              <div><b>{Math.round(goalProgress)}%</b><span>накоплено</span></div>
            </div>
            <div className="goal-values"><span><small>Собрано</small><b>{formatSum(goalSaved)} сум</b></span><span><small>Цель</small><b>{formatSum(goalAmount)} сум</b></span></div>
            <input aria-label="Изменить накопленную сумму" type="range" min="0" max={goalAmount} step="100000" value={goalSaved} onChange={(e) => setGoalSaved(Number(e.target.value))} />
          </article>
        </section>

        <section className="mvp-grid lower">
          <article className="mvp-card operations" id="operations">
            <div className="card-head"><div><small>ПОСЛЕДНИЕ</small><h2>Операции</h2></div><button onClick={() => setShowForm(true)}>Добавить</button></div>
            <div className="transaction-list">
              {visibleTransactions.slice(0, 6).map((t) => (
                <div className="transaction" key={t.id}>
                  <span className={t.type}><i>{t.type === "income" ? "↙" : "↗"}</i></span>
                  <div><b>{t.title}</b><small>{transactionOwnerName(t)} · {t.category} · {new Date(t.date).toLocaleDateString("ru-RU")}{t.source && t.source !== "manual" ? ` · ${t.source === "voice" ? "команда WALLY" : t.source === "receipt" ? "чек" : `импорт ${t.source.toUpperCase()}`}` : ""}</small></div>
                  <strong className={t.type}>{t.type === "income" ? "+" : "−"}{formatSum(t.amount)} сум</strong>
                  <button aria-label={`Удалить ${t.title}`} onClick={() => setTransactions((prev) => prev.filter((item) => item.id !== t.id))}><Trash2 /></button>
                </div>
              ))}
            </div>
          </article>

          <article className="mvp-card assistant" id="assistant">
            <div className="assistant-top"><div className="wally-avatar"><Bot /></div><div><small>WALLY AI</small><h2>Финансовый помощник</h2></div><i className="online" /></div>
            <div className={`voice-state ${isListening ? "listening" : ""}`} aria-live="polite">
              <span className="voice-state-orb"><i /><i /><i /></span>
              <div><b>{aiThinking ? "WALLY думает" : isListening ? "WALLY слушает" : "Голосовой диалог"}</b><small>{voiceStatus}</small></div>
              <button type="button" onClick={() => { setVoiceEnabled((value) => !value); window.speechSynthesis?.cancel(); }} aria-pressed={voiceEnabled}>{voiceEnabled ? "Голос вкл." : "Голос выкл."}</button>
            </div>
            <button className={`live-conversation-button ${liveConversation ? "active" : ""}`} type="button" onClick={toggleLiveConversation}>
              {liveConversation ? <><Square />Завершить живой разговор</> : <><AudioLines />Начать живой разговор</>}
            </button>
            <div className="assistant-message"><Sparkles /><p>{answer}</p></div>
            <div className="quick-prompts">
              <button onClick={() => setQuestion("Сколько можно отложить?")}>Сколько можно отложить?</button>
              <button onClick={() => setQuestion("Когда достигнем цели?")}>Когда достигнем цели?</button>
              <button onClick={() => setQuestion("Запиши 150 000 сум на продукты")}>Записать расход голосом</button>
            </div>
            <form className="ask-form" onSubmit={askWally}>
              <button className={isListening ? "mic-active" : ""} type="button" onClick={startVoice} aria-label={isListening ? "Остановить прослушивание" : "Начать голосовой диалог"}>{isListening ? <Square /> : <Mic />}</button>
              <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Спросите WALLY о финансах…" />
              <button type="submit" aria-label="Отправить"><Send /></button>
            </form>
          </article>
        </section>
        <p className="mvp-disclaimer"><CheckCircle2 />Телефон, веб-версия и мобильное приложение используют одну облачную историю WALLY. Изменения автоматически появляются на всех устройствах.</p>
      </section>

      {showForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowForm(false)}>
          <form className="transaction-form" onSubmit={addTransaction} onMouseDown={(e) => e.stopPropagation()}>
            <div className="form-head"><div><small>НОВАЯ ОПЕРАЦИЯ</small><h2>Добавьте доход или расход</h2></div><button type="button" onClick={() => setShowForm(false)}>×</button></div>
            <label>Чей бюджет?<select name="ownerId" defaultValue={isFamilyMode ? "family" : String(activeMemberId)}><option value="family">Семейный бюджет</option>{familyMembers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
            <label>Тип<select name="type" defaultValue="expense"><option value="expense">Расход</option><option value="income">Доход</option></select></label>
            <label>Название<input name="title" required placeholder="Например, продукты" /></label>
            <label>Категория<select name="category">{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label>Сумма, сум<input name="amount" required type="number" min="1" placeholder="500000" /></label>
            <label>Дата<input name="date" required type="date" defaultValue="2026-07-31" /></label>
            <button className="save-button" type="submit">Сохранить операцию</button>
          </form>
        </div>
      )}

      {pendingAction && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setPendingAction(null)}>
          <div className="transaction-form confirmation-card" role="dialog" aria-modal="true" aria-label="Подтверждение действия WALLY" onMouseDown={(event) => event.stopPropagation()}>
            <div className="form-head"><div><small>ПОДТВЕРЖДЕНИЕ</small><h2>WALLY предлагает действие</h2></div><button type="button" onClick={() => setPendingAction(null)}>×</button></div>
            <p>{pendingAction.reason || "Проверьте данные перед сохранением."}</p>
            <div className="confirmation-details"><span>{pendingAction.title}</span><b>{formatSum(pendingAction.amount)} сум</b><small>{pendingAction.type === "update_goal" ? "Новая финансовая цель" : pendingAction.category || "Операция"}</small></div>
            <div className="confirmation-actions"><button type="button" onClick={() => setPendingAction(null)}>Отменить</button><button className="save-button" type="button" onClick={confirmPendingAction}>Подтвердить и сохранить</button></div>
          </div>
        </div>
      )}

      {showFamilyForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowFamilyForm(false)}>
          <form className="transaction-form family-form" onSubmit={addFamilyMember} onMouseDown={(e) => e.stopPropagation()}>
            <div className="form-head"><div><small>СЕМЕЙНЫЙ БЮДЖЕТ</small><h2>Добавить участника</h2></div><button type="button" aria-label="Закрыть" onClick={() => setShowFamilyForm(false)}>×</button></div>
            <label>Категория<select name="budgetCategory" defaultValue="Семейный бюджет"><option>Семейный бюджет</option><option>Личный бюджет</option><option>Только просмотр</option></select></label>
            <label>Имя и фамилия<input name="memberName" required placeholder="Например, Паринов Алексей" /></label>
            <label>Роль<select name="memberRole" defaultValue="Участник семьи"><option>Участник семьи</option><option>Супруг / супруга</option><option>Ребёнок</option><option>Родитель</option></select></label>
            <label>Персональный лимит, сум<input name="memberLimit" required type="number" min="0" step="100000" placeholder="3 000 000" /></label>
            <button className="save-button" type="submit">Добавить в семейный бюджет</button>
          </form>
        </div>
      )}

      {showSync && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowSync(false)}>
          <div className="transaction-form sync-form" onMouseDown={(event) => event.stopPropagation()}>
            <div className="form-head"><div><small>ОБЛАЧНАЯ СИНХРОНИЗАЦИЯ</small><h2>Ваше пространство WALLY</h2></div><button type="button" onClick={() => setShowSync(false)}>×</button></div>
            <p>Войдите в один аккаунт WALLY на телефоне и компьютере. Чек, добавленный с камеры телефона, автоматически появится в веб-версии — без копирования файлов и ручного обновления.</p>
            <div className="sync-flow"><span><b>1</b>Сканирование на телефоне</span><i>→</i><span><b>2</b>Облачная история</span><i>→</i><span><b>3</b>Обновление всех устройств</span></div>
            <button className="save-button" type="button" onClick={() => setShowSync(false)}>Понятно</button>
            <small className="security-note">Синхронизация привязана к вашему защищённому аккаунту WALLY.</small>
          </div>
        </div>
      )}

      {showImport && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowImport(false)}>
          <div className="transaction-form import-form" onMouseDown={(event) => event.stopPropagation()}>
            <div className="form-head"><div><small>УМНЫЙ ИМПОРТ</small><h2>Выписка или чек</h2></div><button type="button" onClick={() => setShowImport(false)}>×</button></div>
            <p>Загрузите Excel, CSV, PDF или фотографию чека. WALLY распознает операции и предложит категории.</p>
            <label>Чей бюджет?<select value={String(importOwner)} onChange={(event) => setImportOwner(event.target.value === "family" ? "family" : Number(event.target.value))}><option value="family">Семейный бюджет</option>{familyMembers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
            <button className="camera-action" type="button" onClick={() => cameraInput.current?.click()}><Camera /><span><b>Сканировать чек камерой</b><small>На телефоне сразу откроется камера</small></span></button>
            <label className="file-drop"><FileSpreadsheet /><b>Выбрать выписку или готовое фото</b><span>Excel · CSV · PDF · JPG · PNG</span><input type="file" accept=".xlsx,.xls,.csv,.pdf,image/*" onChange={importFile} /></label>
            {importStatus && <div className="import-status"><div><i style={{ width: `${importProgress}%` }} /></div><p>{importStatus}</p></div>}
            {importCandidates.length > 0 && <div className="import-review">
              {importCandidates.slice(0, 30).map((item) => <div key={item.id} className="import-row">
                <input type="checkbox" checked={item.selected} onChange={(event) => setImportCandidates((previous) => previous.map((candidate) => candidate.id === item.id ? { ...candidate, selected: event.target.checked } : candidate))} />
                <div><input value={item.title} onChange={(event) => setImportCandidates((previous) => previous.map((candidate) => candidate.id === item.id ? { ...candidate, title: event.target.value } : candidate))} /><select value={item.category} onChange={(event) => setImportCandidates((previous) => previous.map((candidate) => candidate.id === item.id ? { ...candidate, category: event.target.value } : candidate))}>{item.type === "income" && <option>Доход</option>}{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
                <b>{formatSum(item.amount)} сум</b>
              </div>)}
              <button className="save-button" type="button" onClick={confirmImport}>Добавить выбранные операции</button>
            </div>}
          </div>
        </div>
      )}
    </main>
  );
}
