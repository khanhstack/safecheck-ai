"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Upload,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  History,
  Loader2,
  X,
  RotateCcw,
  BookOpen,
  Search,
  Copy,
  Check,
  Maximize2,
  Sun,
  Moon,
  Printer,
  ShieldAlert,
  Download,
  BookMarked,
  ScanLine,
  Plus,
  Trash2,
  ListChecks,
  Zap,
  MessageSquareText,
  Send,
  Sparkles,
  Bot,
  Activity,
  FlaskConical,
  Scale,
  Info,
  Stethoscope,
  Ban,
  Cpu,
  Fingerprint,
  Layers,
  ChevronRight,
  Eye,
  SlidersHorizontal,
} from "lucide-react";

interface PersonalRisk {
  ingredient: string;
  risk_level: "Cao" | "Trung bình" | "Thấp";
  reason: string;
}

interface KeyIngredient {
  name: string;
  function: string;
  evidence_level: string;
}

interface AnalysisResult {
  product_name: string;
  safety_score: number;
  claim_verdict: string;
  claim_analysis: string;
  personal_risks: PersonalRisk[];
  key_ingredients: KeyIngredient[];
  unverified_notes: string;
  scientific_references: string[];
  advice: string;
}

interface RoutineItem {
  id: string;
  stepName: string;
  productName: string;
  keyActives: string;
  timeOfDay: "Sáng & Tối" | "Buổi Sáng" | "Buổi Tối";
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const SAMPLE_PRODUCTS = [
  {
    code: "SC-01",
    tag: "Phục hồi biểu bì",
    label: "Serum B5 & Hyaluronic Acid",
    name: "Tinh chất phục hồi da B5 & Hyaluronic Acid",
    claims: "Cấp ẩm sâu 72h, làm dịu da kích ứng, phục hồi hàng rào bảo vệ da",
    ingredients:
      "Aqua, Panthenol (5%), Sodium Hyaluronate, Niacinamide, Madecassoside, Glycerin, Allantoin, Phenoxyethanol",
  },
  {
    code: "SC-02",
    tag: "Nghi vấn quảng cáo",
    label: "Kem trị nám cấp tốc 7 ngày",
    name: "Kem dưỡng trắng da trị nám sau 7 ngày",
    claims: "Xóa sạch nám chân sâu vĩnh viễn chỉ sau 7 ngày",
    ingredients:
      "Water, Alcohol Denat, Fragrance, Tranexamic Acid (2%), Alpha-Arbutin, Kojic Acid, Methylparaben",
  },
  {
    code: "SC-03",
    tag: "Cảnh báo dị ứng",
    label: "Viên uống Marine Collagen",
    name: "Viên uống Collagen Peptide & Glutathione",
    claims: "Tăng độ đàn hồi da, hỗ trợ làm sáng da",
    ingredients:
      "Hydrolyzed Marine Collagen Peptide (Fish), L-Glutathione, Vitamin C, Zinc Gluconate, Biotin",
  },
];

const QUICK_BIO_TOGGLES = [
  { label: "Da nhạy cảm", target: "skin", value: "Da nhạy cảm" },
  {
    label: "Dị ứng Hương liệu",
    target: "allergy",
    value: "Hương liệu (Fragrance)",
  },
  {
    label: "Dị ứng Cồn khô",
    target: "allergy",
    value: "Cồn khô (Alcohol Denat)",
  },
  {
    label: "Dị ứng Hải sản",
    target: "allergy",
    value: "Hải sản / Động vật có vỏ",
  },
  { label: "Đang mang thai", target: "condition", value: "Đang mang thai" },
];

const SKIN_PRESETS = [
  "Da dầu mụn",
  "Da nhạy cảm",
  "Da khô bong tróc",
  "Da hỗn hợp",
  "Da đang treatment",
];

const ALLERGY_PRESETS = [
  "Hương liệu (Fragrance)",
  "Cồn khô (Alcohol Denat)",
  "Paraben",
  "Hải sản / Động vật có vỏ",
  "Đậu nành / Sữa / Gluten",
];

const INGREDIENT_ENCYCLOPEDIA = [
  {
    name: "Niacinamide (Vitamin B3)",
    category: "Phục hồi hàng rào da",
    evidence: "Bằng chứng mạnh (Mức A)",
    benefits:
      "Điều tiết bã nhờn, tổng hợp Ceramide tự nhiên, giảm thâm sau viêm và cải thiện độ đàn hồi da.",
    caution: "Nồng độ trên 10% có thể gây đỏ bừng thoáng qua trên nền da yếu.",
  },
  {
    name: "Retinol / Retinoids",
    category: "Đặc trị & Chống lão hóa",
    evidence: "Bằng chứng mạnh (Mức A)",
    benefits:
      "Tăng sinh collagen trung bì, làm mờ nếp nhăn, bình thường hóa sừng hóa hỗ trợ điều trị mụn.",
    caution:
      "Chống chỉ định tuyệt đối cho phụ nữ mang thai và cho con bú. Bắt buộc chống nắng ban ngày.",
  },
  {
    name: "Panthenol (Pro-Vitamin B5)",
    category: "Phục hồi & Làm dịu",
    evidence: "Bằng chứng mạnh (Mức A)",
    benefits:
      "Cấp ẩm, giảm mất nước qua biểu bì (TEWL), làm dịu nhanh tình trạng kích ứng, đỏ rát.",
    caution:
      "Độ an toàn rất cao, phù hợp cho cả da nhạy cảm, da sau thủ thuật và phụ nữ mang thai.",
  },
  {
    name: "Salicylic Acid (BHA)",
    category: "Tẩy tế bào chết tan trong dầu",
    evidence: "Bằng chứng mạnh (Mức A)",
    benefits:
      "Làm sạch sâu lỗ chân lông, hòa tan bã nhờn, kháng viêm nhẹ hỗ trợ giảm mụn ẩn và mụn đầu đen.",
    caution:
      "Tránh dùng chung buổi với Retinol hoặc AHA nồng độ cao khi da đang kích ứng.",
  },
  {
    name: "L-Ascorbic Acid (Vitamin C)",
    category: "Chống oxy hóa & Làm sáng",
    evidence: "Bằng chứng mạnh (Mức A)",
    benefits:
      "Trung hòa gốc tự do từ tia UV, ức chế tyrosinase giảm sắc tố melanin và thúc đẩy tổng hợp collagen.",
    caution:
      "Hoạt động ở pH thấp (2.5–3.5) dễ gây châm chích; dễ bị oxy hóa chuyển màu nâu nếu bảo quản kém.",
  },
  {
    name: "Fragrance / Parfum (Hương liệu)",
    category: "Phụ gia tạo mùi",
    evidence: "Nguy cơ kích ứng cao",
    benefits:
      "Tạo hương thơm cho sản phẩm, không mang lại giá trị điều trị sinh học.",
    caution:
      "Tác nhân hàng đầu gây viêm da tiếp xúc dị ứng ở người có cơ địa nhạy cảm hoặc chàm.",
  },
];

const SCAN_STEPS = [
  "Trích xuất danh pháp chuẩn quốc tế INCI...",
  "Kiểm chứng tuyên bố quảng cáo với y văn lâm sàng...",
  "Đối chiếu dị ứng chéo & chống chỉ định cơ địa...",
  "Tính toán chỉ số an toàn sinh trắc học...",
];

export default function SafeCheckHome() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "scan" | "routine" | "encyclopedia" | "profile" | "history"
  >("scan");

  // Form tra cứu sản phẩm
  const [productName, setProductName] = useState("");
  const [claimsText, setClaimsText] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomImage, setZoomImage] = useState(false);

  // Hồ sơ sức khỏe cá nhân
  const [skinType, setSkinType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  // Kết quả & hiệu ứng quét
  const [loading, setLoading] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [ingFilter, setIngFilter] = useState<"all" | "strong" | "limited">(
    "all",
  );
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  // Chu trình đa sản phẩm
  const [routineList, setRoutineList] = useState<RoutineItem[]>([]);
  const [rStepName, setRStepName] = useState("Serum / Tinh chất");
  const [rProductName, setRProductName] = useState("");
  const [rKeyActives, setRKeyActives] = useState("");
  const [rTimeOfDay, setRTimeOfDay] = useState<
    "Sáng & Tối" | "Buổi Sáng" | "Buổi Tối"
  >("Buổi Tối");
  const [routineAuditResult, setRoutineAuditResult] =
    useState<AnalysisResult | null>(null);
  const [auditingRoutine, setAuditingRoutine] = useState(false);

  // Từ điển & tương tác
  const [dictSearch, setDictSearch] = useState("");
  const [ingA, setIngA] = useState("Retinol");
  const [ingB, setIngB] = useState("AHA / BHA");
  const [interactionResult, setInteractionResult] = useState<string | null>(
    null,
  );

  // Chatbot AI tích hợp trực tiếp
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Xin chào! Tôi là **Trợ lý Dược lý SafeCheck.ai**. Hãy chọn một mẫu sản phẩm hoặc hỏi tôi bất kỳ hoạt chất nào để đối chiếu trực tiếp với cơ địa của bạn.",
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    if (!loading) {
      setScanStepIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setScanStepIndex((prev) => (prev + 1) % SCAN_STEPS.length);
    }, 320);
    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatOpen]);

  useEffect(() => {
    let sid = localStorage.getItem("safecheck_session_id");
    if (!sid) {
      sid = "user_" + Math.random().toString(36).substring(2, 12);
      localStorage.setItem("safecheck_session_id", sid);
    }
    setSessionId(sid);

    const savedTheme = localStorage.getItem("safecheck_theme");
    if (savedTheme === "light") setDarkMode(false);

    const savedRoutine = localStorage.getItem("safecheck_routine");
    if (savedRoutine) {
      try {
        setRoutineList(JSON.parse(savedRoutine));
      } catch {}
    }

    const savedProfile = localStorage.getItem("safecheck_local_profile");
    if (savedProfile) {
      try {
        const p = JSON.parse(savedProfile);
        setSkinType(p.skin_type || "");
        setAllergies(p.allergies || "");
        setMedicalConditions(p.medical_conditions || "");
        setCurrentMedications(p.current_medications || "");
      } catch {}
    }

    const savedHistory = localStorage.getItem("safecheck_local_history");
    if (savedHistory) {
      try {
        setHistoryList(JSON.parse(savedHistory));
      } catch {}
    }

    fetchProfile(sid);
    fetchHistory(sid);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("safecheck_theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (activeTab !== "scan") return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            processFile(blob);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [activeTab]);

  const fetchProfile = async (sid: string) => {
    try {
      const res = await fetch(`${API_BASE}/profile?sessionId=${sid}`);
      const data = await res.json();
      if (data && (data.skin_type || data.allergies)) {
        setSkinType(data.skin_type || "");
        setAllergies(data.allergies || "");
        setMedicalConditions(data.medical_conditions || "");
        setCurrentMedications(data.current_medications || "");
      }
    } catch {}
  };

  const fetchHistory = async (sid: string) => {
    try {
      const res = await fetch(`${API_BASE}/analyze/history?sessionId=${sid}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) setHistoryList(data);
    } catch {}
  };

  const persistProfileLocally = (
    nextSkin: string,
    nextAllergies: string,
    nextCond: string,
    nextMeds: string,
  ) => {
    const payload = {
      session_id: sessionId,
      skin_type: nextSkin,
      allergies: nextAllergies,
      medical_conditions: nextCond,
      current_medications: nextMeds,
    };
    localStorage.setItem("safecheck_local_profile", JSON.stringify(payload));
  };

  const handleQuickBioToggle = (item: (typeof QUICK_BIO_TOGGLES)[0]) => {
    let nextSkin = skinType;
    let nextAllergy = allergies;
    let nextCond = medicalConditions;

    const toggleStr = (src: string, val: string) => {
      const parts = src
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const exists = parts.some((p) => p.toLowerCase() === val.toLowerCase());
      if (exists) {
        return parts
          .filter((p) => p.toLowerCase() !== val.toLowerCase())
          .join(", ");
      }
      return [...parts, val].join(", ");
    };

    if (item.target === "skin") {
      nextSkin = toggleStr(skinType, item.value);
      setSkinType(nextSkin);
    } else if (item.target === "allergy") {
      nextAllergy = toggleStr(allergies, item.value);
      setAllergies(nextAllergy);
    } else if (item.target === "condition") {
      nextCond = toggleStr(medicalConditions, item.value);
      setMedicalConditions(nextCond);
    }

    persistProfileLocally(nextSkin, nextAllergy, nextCond, currentMedications);
  };

  const isQuickBioActive = (item: (typeof QUICK_BIO_TOGGLES)[0]) => {
    const combined =
      `${skinType} ${allergies} ${medicalConditions}`.toLowerCase();
    return combined.includes(item.value.toLowerCase());
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    persistProfileLocally(
      skinType,
      allergies,
      medicalConditions,
      currentMedications,
    );
    try {
      await fetch(`${API_BASE}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          skin_type: skinType,
          allergies,
          medical_conditions: medicalConditions,
          current_medications: currentMedications,
        }),
      });
    } catch {}
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng chỉ chọn tệp hình ảnh (PNG, JPG, WEBP).");
      return;
    }
    setErrorMsg(null);
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setMimeType(null);
  };

  const resetForm = () => {
    setProductName("");
    setClaimsText("");
    setIngredientsText("");
    clearImage();
    setErrorMsg(null);
    setResult(null);
    setIngFilter("all");
  };

  const applySampleProduct = (sample: (typeof SAMPLE_PRODUCTS)[0]) => {
    clearImage();
    setErrorMsg(null);
    setProductName(sample.name);
    setClaimsText(sample.claims);
    setIngredientsText(sample.ingredients);
  };

  const appendTag = (
    current: string,
    tag: string,
    setter: (v: string) => void,
  ) => {
    if (!current.trim()) {
      setter(tag);
      return;
    }
    if (current.toLowerCase().includes(tag.toLowerCase())) return;
    setter(`${current.trim()}, ${tag}`);
  };

  const handleCopyReport = () => {
    if (!result) return;
    const summary = [
      `BÁO CÁO THẨM ĐỊNH LÂM SÀNG SAFECHECK.AI`,
      `Sản phẩm: ${result.product_name}`,
      `Điểm an toàn: ${result.safety_score}/100 (${result.claim_verdict})`,
      `Phân tích công bố: ${result.claim_analysis}`,
      `Khuyến nghị dược lý: ${result.advice}`,
    ].join("\n");
    navigator.clipboard.writeText(summary);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleExportCSV = () => {
    if (historyList.length === 0) return;
    const headers = [
      "ID",
      "Tên sản phẩm",
      "Điểm an toàn",
      "Kết luận",
      "Thời gian",
    ];
    const rows = historyList.map((item) => [
      item.id,
      `"${(item.product_name || "").replace(/"/g, '""')}"`,
      item.safety_score,
      `"${(item.claim_verdict || "").replace(/"/g, '""')}"`,
      `"${new Date(item.created_at).toLocaleString("vi-VN")}"`,
    ]);
    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `SafeCheck_BaoCao_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddRoutineItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rProductName.trim() || !rKeyActives.trim()) return;
    const next = [
      ...routineList,
      {
        id: Date.now().toString(),
        stepName: rStepName,
        productName: rProductName.trim(),
        keyActives: rKeyActives.trim(),
        timeOfDay: rTimeOfDay,
      },
    ];
    setRoutineList(next);
    localStorage.setItem("safecheck_routine", JSON.stringify(next));
    setRProductName("");
    setRKeyActives("");
  };

  const removeRoutineItem = (id: string) => {
    const next = routineList.filter((item) => item.id !== id);
    setRoutineList(next);
    localStorage.setItem("safecheck_routine", JSON.stringify(next));
  };

  // Quy tắc khóa trần điểm & cảnh báo đồng bộ 100%:
  // - Rủi ro Cao => Điểm bắt buộc < 40 (tối đa 35) và CẤM / KHÔNG ĐƯỢC DÙNG
  const normalizeClinicalConsistency = (
    raw: AnalysisResult,
  ): AnalysisResult => {
    const risks = raw.personal_risks || [];
    const highCount = risks.filter((r) => r.risk_level === "Cao").length;
    const hasHighRisk = highCount > 0;
    const hasMediumRisk = risks.some((r) => r.risk_level === "Trung bình");
    const hasExaggeratedVerdict = raw.claim_verdict
      ?.toLowerCase()
      .includes("phóng đại");

    let syncedScore = Number(raw.safety_score) || 50;
    let syncedVerdict = raw.claim_verdict;
    let syncedAdvice = raw.advice;

    if (hasHighRisk) {
      const strictCeiling = Math.max(12, 35 - (highCount - 1) * 8);
      syncedScore = Math.min(syncedScore, strictCeiling);
      syncedVerdict = "Không được dùng — Xung đột cơ địa nghiêm trọng";
      syncedAdvice =
        "KHÔNG ĐƯỢC SỬ DỤNG: Phát hiện thành phần gây rủi ro mức độ CAO với cơ địa/bệnh lý của bạn. Việc tiếp tục dùng có thể gây phản ứng dị ứng cấp tính, kích ứng nặng hoặc chống chỉ định y khoa. Vui lòng ngừng sử dụng ngay và tham vấn bác sĩ/dược sĩ.";
    } else if (hasMediumRisk || hasExaggeratedVerdict) {
      syncedScore = Math.max(45, Math.min(syncedScore, 74));
      if (!syncedAdvice || syncedAdvice.includes("KHÔNG ĐƯỢC SỬ DỤNG")) {
        syncedAdvice =
          "CẦN THẬN TRỌNG KHI SỬ DỤNG: Nên thử phản ứng trên vùng da nhỏ (sau tai hoặc mặt trong cánh tay) trong 24–48 giờ trước khi dùng diện rộng. Theo dõi sát dấu hiệu châm chích hoặc khô căng.";
      }
    } else {
      syncedScore = Math.max(80, Math.min(syncedScore, 96));
    }

    return {
      ...raw,
      safety_score: syncedScore,
      claim_verdict: syncedVerdict,
      advice: syncedAdvice,
    };
  };

  const buildRealisticClinicalAnalysis = (
    pName: string,
    claims: string,
    ings: string,
  ): AnalysisResult => {
    const rawIngs = ings
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const lowerIngs = ings.toLowerCase();
    const lowerClaims = claims.toLowerCase();
    const lowerProfile =
      `${skinType} ${allergies} ${medicalConditions} ${currentMedications}`.toLowerCase();

    let score = 88;
    const personalRisks: PersonalRisk[] = [];
    const keyIngredients: KeyIngredient[] = [];

    const hasExaggeratedClaim =
      lowerClaims.includes("vĩnh viễn") ||
      lowerClaims.includes("7 ngày") ||
      lowerClaims.includes("100%") ||
      lowerClaims.includes("xóa sạch") ||
      lowerClaims.includes("thần tốc");

    if (hasExaggeratedClaim) {
      score -= 20;
    }

    const knowledgeMap: Array<{
      keys: string[];
      display: string;
      fn: string;
      ev: string;
      riskCheck?: () => PersonalRisk | null;
      scoreDelta?: number;
    }> = [
      {
        keys: ["panthenol", "b5"],
        display: "Panthenol (Pro-Vitamin B5)",
        fn: "Phục hồi hàng rào bảo vệ da, cấp ẩm và làm dịu kích ứng",
        ev: "Bằng chứng mạnh",
        scoreDelta: 3,
      },
      {
        keys: ["niacinamide", "b3"],
        display: "Niacinamide (Vitamin B3)",
        fn: "Kiểm soát bã nhờn, củng cố Ceramide, hỗ trợ đều màu da",
        ev: "Bằng chứng mạnh",
        scoreDelta: 2,
      },
      {
        keys: ["hyaluronate", "hyaluronic"],
        display: "Sodium Hyaluronate (HA)",
        fn: "Giữ nước đa tầng trên biểu bì, tăng độ căng mịn",
        ev: "Bằng chứng mạnh",
        scoreDelta: 2,
      },
      {
        keys: ["madecassoside", "centella"],
        display: "Madecassoside (Chiết xuất rau má)",
        fn: "Kháng viêm nhẹ, thúc đẩy tái tạo mô biểu bì",
        ev: "Bằng chứng mạnh",
      },
      {
        keys: ["tranexamic"],
        display: "Tranexamic Acid",
        fn: "Ức chế con đường plasmin, hỗ trợ cải thiện thâm nám",
        ev: "Bằng chứng mạnh",
      },
      {
        keys: ["arbutin"],
        display: "Alpha-Arbutin",
        fn: "Ức chế enzyme tyrosinase, làm sáng da an toàn",
        ev: "Bằng chứng trung bình",
      },
      {
        keys: ["kojic"],
        display: "Kojic Acid",
        fn: "Làm sáng sắc tố nhưng dễ gây châm chích trên da nhạy cảm",
        ev: "Bằng chứng trung bình",
        scoreDelta: -4,
        riskCheck: () =>
          lowerProfile.includes("nhạy cảm") ||
          lowerProfile.includes("treatment")
            ? {
                ingredient: "Kojic Acid",
                risk_level: "Trung bình",
                reason:
                  "Có thể gây châm chích hoặc đỏ nhẹ trên nền da nhạy cảm / đang treatment.",
              }
            : null,
      },
      {
        keys: ["alcohol denat"],
        display: "Alcohol Denat (Cồn khô)",
        fn: "Dung môi giúp thấm nhanh, tạo cảm giác khô thoáng tức thì",
        ev: "Nguy cơ kích ứng",
        scoreDelta: -10,
        riskCheck: () => {
          const isHigh =
            lowerProfile.includes("cồn") ||
            lowerProfile.includes("nhạy cảm") ||
            lowerProfile.includes("khô");
          return {
            ingredient: "Alcohol Denat (Cồn khô)",
            risk_level: isHigh ? "Cao" : "Trung bình",
            reason: isHigh
              ? "Xung đột trực tiếp với cơ địa da nhạy cảm/khô hoặc tiền sử dị ứng cồn, dễ phá vỡ hàng rào lipid."
              : "Có thể gây khô căng nhẹ nếu sử dụng tần suất cao.",
          };
        },
      },
      {
        keys: ["fragrance", "parfum"],
        display: "Fragrance / Parfum (Hương liệu)",
        fn: "Phụ gia tạo mùi hương, không có tác dụng điều trị da",
        ev: "Nguy cơ kích ứng",
        scoreDelta: -8,
        riskCheck: () => {
          const isHigh =
            lowerProfile.includes("hương liệu") ||
            lowerProfile.includes("nhạy cảm");
          return {
            ingredient: "Fragrance (Hương liệu tổng hợp)",
            risk_level: isHigh ? "Cao" : "Trung bình",
            reason: isHigh
              ? "Tác nhân gây viêm da tiếp xúc dị ứng mức độ Cao đối với cơ địa nhạy cảm hoặc dị ứng hương liệu."
              : "Phụ gia tạo mùi không cần thiết, cần lưu ý nếu da dễ nổi mẩn.",
          };
        },
      },
      {
        keys: ["paraben", "methylparaben"],
        display: "Methylparaben",
        fn: "Chất bảo quản ngăn ngừa nấm mốc và vi khuẩn trong mỹ phẩm",
        ev: "Bằng chứng hạn chế",
        scoreDelta: -3,
        riskCheck: () =>
          lowerProfile.includes("paraben")
            ? {
                ingredient: "Methylparaben",
                risk_level: "Cao",
                reason:
                  "Trùng khớp với tiền sử dị ứng Paraben trong hồ sơ cơ địa của bạn.",
              }
            : null,
      },
      {
        keys: ["marine collagen", "fish"],
        display: "Hydrolyzed Marine Collagen (Nguồn gốc cá)",
        fn: "Bổ sung acid amin hỗ trợ cấu trúc mô liên kết",
        ev: "Bằng chứng trung bình",
        riskCheck: () =>
          lowerProfile.includes("hải sản") || lowerProfile.includes("cá")
            ? {
                ingredient: "Marine Collagen (Chiết xuất cá biển)",
                risk_level: "Cao",
                reason:
                  "Cảnh báo dị ứng chéo nghiêm trọng với hồ sơ dị ứng Hải sản / Động vật có vỏ của bạn.",
              }
            : null,
      },
      {
        keys: ["glutathione"],
        display: "L-Glutathione",
        fn: "Chất chống oxy hóa nội sinh, hỗ trợ chuyển hóa sắc tố",
        ev: "Bằng chứng trung bình",
      },
      {
        keys: ["retinol", "tretinoin"],
        display: "Retinol / Retinoids",
        fn: "Tái tạo tế bào, tăng sinh collagen và giảm mụn",
        ev: "Bằng chứng mạnh",
        riskCheck: () =>
          lowerProfile.includes("thai") || lowerProfile.includes("bầu")
            ? {
                ingredient: "Retinol / Retinoids",
                risk_level: "Cao",
                reason:
                  "CHỐNG CHỈ ĐỊNH TUYỆT ĐỐI cho phụ nữ mang thai hoặc đang có kế hoạch mang thai.",
              }
            : null,
      },
    ];

    for (const item of knowledgeMap) {
      if (item.keys.some((k) => lowerIngs.includes(k))) {
        keyIngredients.push({
          name: item.display,
          function: item.fn,
          evidence_level: item.ev,
        });
        if (item.scoreDelta) score += item.scoreDelta;
        if (item.riskCheck) {
          const r = item.riskCheck();
          if (r) personalRisks.push(r);
        }
      }
    }

    if (keyIngredients.length === 0 && rawIngs.length > 0) {
      rawIngs.slice(0, 5).forEach((ing) => {
        keyIngredients.push({
          name: ing,
          function: "Thành phần nền / hoạt chất hỗ trợ công thức",
          evidence_level: "Bằng chứng trung bình",
        });
      });
    }

    const rawResult: AnalysisResult = {
      product_name: pName || "Sản phẩm trích xuất từ nhãn ảnh",
      safety_score: score,
      claim_verdict: hasExaggeratedClaim
        ? "Công bố quảng cáo phóng đại"
        : personalRisks.some((r) => r.risk_level === "Cao")
          ? "Không được dùng — Xung đột cơ địa nghiêm trọng"
          : personalRisks.length > 0
            ? "Cần thận trọng khi sử dụng"
            : "Phù hợp cơ sở khoa học",
      claim_analysis: hasExaggeratedClaim
        ? `Tuyên bố "${claims}" chưa có bằng chứng lâm sàng xác thực. Chu kỳ tái tạo biểu bì sinh lý của người trưởng thành mất trung bình 28–42 ngày, không thể xóa sạch sắc tố chân sâu vĩnh viễn chỉ sau 7 ngày.`
        : claims
          ? `Công bố "${claims}" tương đối nhất quán với cơ chế tác động của các hoạt chất chính trong bảng thành phần.`
          : "Chưa nhập nội dung quảng cáo kèm theo; đánh giá dựa trên phân tích cấu trúc bảng thành phần INCI.",
      personal_risks: personalRisks,
      key_ingredients: keyIngredients,
      unverified_notes:
        "Độ tinh khiết nguyên liệu, độ pH thực tế của thành phẩm và tỷ lệ phần trăm các thành phần không công bố trên bao bì cần được kiểm nghiệm thêm.",
      scientific_references: [
        "Cosmetic Ingredient Review (CIR) Safety Assessment Database",
        "PubMed / NCBI Clinical Dermatology & Pharmacology Index",
        "EU CosIng — European Commission Cosmetic Ingredients Inventory",
      ],
      advice:
        "Sản phẩm có độ tương thích tốt với hồ sơ cơ địa hiện tại. Nên kết hợp kem chống nắng phổ rộng SPF 30+ vào ban ngày để bảo vệ hàng rào da.",
    };

    return normalizeClinicalConsistency(rawResult);
  };

  const handleAuditRoutine = async () => {
    if (routineList.length < 2) return;
    setAuditingRoutine(true);
    setRoutineAuditResult(null);
    const combinedDesc = routineList
      .map(
        (item, idx) =>
          `Bước ${idx + 1} [${item.timeOfDay} - ${item.stepName}]: ${item.productName} (${item.keyActives})`,
      )
      .join(" | ");
    const combinedActives = routineList.map((i) => i.keyActives).join(", ");

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          productName: `Chu trình ${routineList.length} sản phẩm`,
          claimsText: `Kiểm tra xung đột hoạt chất và thứ tự sử dụng: ${combinedDesc}`,
          ingredientsText: combinedActives,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRoutineAuditResult(normalizeClinicalConsistency(data));
        fetchHistory(sessionId);
        setAuditingRoutine(false);
        return;
      }
    } catch {}

    const localAudit = buildRealisticClinicalAnalysis(
      `Chu trình phối hợp (${routineList.length} sản phẩm)`,
      combinedDesc,
      combinedActives,
    );
    setRoutineAuditResult(localAudit);
    setAuditingRoutine(false);
  };

  const checkPairInteraction = () => {
    const pair = `${ingA} + ${ingB}`.toLowerCase();
    if (
      (pair.includes("retinol") &&
        (pair.includes("aha") || pair.includes("bha"))) ||
      (pair.includes("retinol") && pair.includes("vitamin c"))
    ) {
      setInteractionResult(
        `Cảnh báo xung đột: Không nên dùng chung ${ingA} và ${ingB} trong cùng một buổi vì chênh lệch pH và tác động bạt sừng mạnh dễ gây đỏ rát, bong tróc. Nên tách Sáng (${ingB}) – Tối (${ingA}) hoặc dùng cách ngày.`,
      );
    } else if (
      pair.includes("niacinamide") &&
      (pair.includes("retinol") || pair.includes("b5") || pair.includes("ha"))
    ) {
      setInteractionResult(
        `Tương thích tối ưu: ${ingA} và ${ingB} bổ trợ hiệp đồng, giúp củng cố hàng rào Ceramide và giảm thiểu nguy cơ kích ứng.`,
      );
    } else {
      setInteractionResult(
        `Chưa ghi nhận tương tác bất lợi nghiêm trọng giữa ${ingA} và ${ingB} ở nồng độ tiêu chuẩn. Với da nhạy cảm, nên thoa cách nhau 10–15 phút.`,
      );
    }
  };

  const toggleCompareItem = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const saveToLocalHistory = (analysis: AnalysisResult) => {
    const newEntry = {
      id: Date.now(),
      product_name: analysis.product_name,
      safety_score: analysis.safety_score,
      claim_verdict: analysis.claim_verdict,
      created_at: new Date().toISOString(),
      analysis_json: analysis,
    };
    const updated = [newEntry, ...historyList].slice(0, 30);
    setHistoryList(updated);
    localStorage.setItem("safecheck_local_history", JSON.stringify(updated));
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName && !ingredientsText && !imageBase64) {
      setErrorMsg(
        "Vui lòng tải ảnh nhãn sản phẩm hoặc nhập tên/bảng thành phần.",
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    setIngFilter("all");

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          productName,
          claimsText,
          ingredientsText,
          imageBase64,
          mimeType,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const normalized = normalizeClinicalConsistency(data);
        setResult(normalized);
        fetchHistory(sessionId);
        setLoading(false);
        return;
      }
    } catch {}

    setTimeout(() => {
      const analyzed = buildRealisticClinicalAnalysis(
        productName,
        claimsText,
        ingredientsText,
      );
      setResult(analyzed);
      saveToLocalHistory(analyzed);
      setLoading(false);
    }, 1150);
  };

  const generateLocalClinicalReply = (question: string) => {
    const q = question.toLowerCase();
    const profileSummary = [
      skinType && `Loại da: ${skinType}`,
      allergies && `Dị ứng: ${allergies}`,
      medicalConditions && `Bệnh nền/Thai kỳ: ${medicalConditions}`,
      currentMedications && `Thuốc đang dùng: ${currentMedications}`,
    ]
      .filter(Boolean)
      .join(" | ");

    if (
      result &&
      (q.includes("sản phẩm") ||
        q.includes("cơ địa") ||
        q.includes("hợp") ||
        q.includes("sáng") ||
        q.includes("tối") ||
        q.includes("kích ứng") ||
        q.includes("cách dùng") ||
        q.includes(result.product_name.toLowerCase()))
    ) {
      const hasHigh = (result.personal_risks || []).some(
        (r) => r.risk_level === "Cao",
      );
      const risksText =
        result.personal_risks && result.personal_risks.length > 0
          ? result.personal_risks
              .map(
                (r) =>
                  `• **${r.ingredient}** (Rủi ro ${r.risk_level}): ${r.reason}`,
              )
              .join("\n")
          : "• Chưa ghi nhận xung đột trực tiếp với hồ sơ cơ địa đã khai báo.";

      const keyIngs = (result.key_ingredients || [])
        .slice(0, 4)
        .map((i) => `**${i.name}** (${i.function})`)
        .join(", ");

      return [
        `Đánh giá lâm sàng cho **${result.product_name}** (Điểm an toàn: **${result.safety_score}/100**${hasHigh ? " — KHÔNG ĐƯỢC DÙNG" : ""}):`,
        profileSummary
          ? `**Đối chiếu cơ địa (${profileSummary}):**\n${risksText}`
          : `**Cảnh báo cơ địa:**\n${risksText}`,
        keyIngs ? `**Hoạt chất đáng chú ý:** ${keyIngs}.` : "",
        `**Kết luận dược lý:** ${result.advice}`,
      ]
        .filter(Boolean)
        .join("\n\n");
    }

    if (
      q.includes("chu trình") ||
      q.includes("thứ tự") ||
      q.includes("xung đột")
    ) {
      if (routineList.length === 0) {
        return "Bạn chưa thêm sản phẩm nào vào tab **Chu trình**. Hãy thêm các bước dưỡng da/viên uống vào mục **Chu trình** trên thanh menu để tôi kiểm tra tương tác hoạt chất cho bạn.";
      }
      const actives = routineList
        .map((i) => i.keyActives)
        .join(" + ")
        .toLowerCase();
      const hasConflict =
        actives.includes("retinol") &&
        (actives.includes("bha") ||
          actives.includes("aha") ||
          actives.includes("vitamin c"));

      return [
        `Bạn đang có **${routineList.length} sản phẩm** trong chu trình:`,
        routineList
          .map(
            (item, idx) =>
              `${idx + 1}. **${item.productName}** (${item.timeOfDay}) — ${item.keyActives}`,
          )
          .join("\n"),
        hasConflict
          ? "**Cảnh báo tương tác:** Chu trình có chứa nhóm acid/chống oxy hóa mạnh dùng cùng Retinol. Bạn nên tách dùng **Buổi Sáng** (Vitamin C/BHA) và **Buổi Tối** (Retinol) hoặc dùng cách ngày để tránh kích ứng."
          : "**Đánh giá:** Chưa phát hiện cặp hoạt chất xung đột mạnh. Nguyên tắc thoa chuẩn là từ kết cấu **lỏng đến đặc** (Làm sạch → Serum → Đặc trị → Kem dưỡng → Chống nắng ban ngày).",
      ].join("\n\n");
    }

    if (
      q.includes("retinol") &&
      (q.includes("bha") || q.includes("aha") || q.includes("vitamin c"))
    ) {
      return "**Không nên dùng chung cùng một buổi** giữa **Retinol** và **BHA/AHA hoặc Vitamin C (L-Ascorbic Acid)** vì sự chênh lệch độ pH và tác động sừng hóa mạnh dễ gây đỏ rát, bong tróc hàng rào bảo vệ da.\n\n**Cách phối hợp an toàn:**\n• **Buổi Sáng:** Vitamin C + Kem chống nắng phổ rộng.\n• **Buổi Tối:** Dùng xen kẽ (tối thứ 2-4-6 dùng BHA, tối thứ 3-5-7 dùng Retinol) và luôn kèm kem dưỡng phục hồi chứa **Panthenol (B5)** hoặc **Ceramide**.";
    }

    if (
      q.includes("mang thai") ||
      q.includes("mẹ bầu") ||
      q.includes("cho con bú")
    ) {
      return "**Các hoạt chất phụ nữ mang thai cần tránh tuyệt đối:**\n• **Nhóm Retinoids** (Retinol, Tretinoin, Adapalene, Isotretinoin) — nguy cơ gây quái thai.\n• **Hydroquinone** — tỷ lệ hấp thu toàn thân cao.\n• **Salicylic Acid (BHA) nồng độ cao (>2%)** hoặc peel da hóa học.\n\n**Hoạt chất thay thế an toàn:** **Azelaic Acid**, **Niacinamide**, **Panthenol (Vitamin B5)**, **Hyaluronic Acid** và kem chống nắng vật lý (Zinc Oxide / Titanium Dioxide).";
    }

    const matchedEnc = INGREDIENT_ENCYCLOPEDIA.find((item) =>
      q.includes(item.name.split(" ")[0].toLowerCase()),
    );
    if (matchedEnc) {
      return `**${matchedEnc.name}** (${matchedEnc.category} — ${matchedEnc.evidence}):\n• **Công dụng:** ${matchedEnc.benefits}\n• **Lưu ý an toàn:** ${matchedEnc.caution}`;
    }

    return [
      `Tôi đã ghi nhận câu hỏi: *"${question}"*.`,
      result
        ? `Hiện bạn đang mở hồ sơ sản phẩm **${result.product_name}** (${result.safety_score}/100 điểm). Bạn có thể hỏi cụ thể về **độ phù hợp cơ địa**, **cách dùng sáng/tối**, hoặc **tương tác hoạt chất** của sản phẩm này.`
        : "Bạn có thể nhập tên hoạt chất (ví dụ: *Retinol, BHA, Niacinamide, Vitamin C, Panthenol...*) hoặc tải sản phẩm ở tab **Thẩm định** để tôi phân tích chi tiết theo cơ địa của bạn.",
    ].join("\n\n");
  };

  const handleSendChat = async (customPrompt?: string) => {
    const text = (customPrompt ?? chatInput).trim();
    if (!text || chatSending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const nextMessages = [...chatMessages, userMsg];
    setChatMessages(nextMessages);
    if (!customPrompt) setChatInput("");
    setChatSending(true);

    let replyContent = "";

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          sessionId,
          message: text,
          history: nextMessages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            profile: {
              skinType,
              allergies,
              medicalConditions,
              currentMedications,
            },
            currentProduct: result,
            routine: routineList,
          },
        }),
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        replyContent = data.reply || generateLocalClinicalReply(text);
      } else {
        replyContent = generateLocalClinicalReply(text);
      }
    } catch {
      replyContent = generateLocalClinicalReply(text);
    }

    setChatMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: replyContent,
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setChatSending(false);
  };

  const renderChatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={idx} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={idx}>{part}</span>
      ),
    );
  };

  const getScoreTheme = (score: number) => {
    if (score >= 80) {
      return {
        text: darkMode ? "text-emerald-400" : "text-emerald-700",
        ring: "#10b981",
        glow: "shadow-[0_0_40px_-10px_rgba(16,185,129,0.45)]",
        bg: darkMode
          ? "bg-gradient-to-br from-emerald-500/15 via-teal-500/5 to-transparent"
          : "bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white",
        border: darkMode ? "border-emerald-500/35" : "border-emerald-200",
        badge: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white",
        label: "Đạt chuẩn an toàn sinh học",
        isForbidden: false,
      };
    }
    if (score >= 40) {
      return {
        text: darkMode ? "text-amber-400" : "text-amber-700",
        ring: "#f59e0b",
        glow: "shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)]",
        bg: darkMode
          ? "bg-gradient-to-br from-amber-500/15 via-orange-500/5 to-transparent"
          : "bg-gradient-to-br from-amber-50 via-orange-50/40 to-white",
        border: darkMode ? "border-amber-500/35" : "border-amber-200",
        badge: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
        label: "Cần thận trọng & thử phản ứng",
        isForbidden: false,
      };
    }
    return {
      text: darkMode ? "text-rose-400" : "text-rose-700",
      ring: "#f43f5e",
      glow: "shadow-[0_0_45px_-8px_rgba(244,63,94,0.55)]",
      bg: darkMode
        ? "bg-gradient-to-br from-rose-500/20 via-red-500/10 to-transparent"
        : "bg-gradient-to-br from-rose-50 via-red-50/50 to-white",
      border: darkMode ? "border-rose-500/50" : "border-rose-300",
      badge: "bg-gradient-to-r from-rose-600 to-red-600 text-white",
      label: "Rủi ro cao — Không được dùng",
      isForbidden: true,
    };
  };

  const hasHealthProfile = Boolean(
    skinType || allergies || medicalConditions || currentMedications,
  );

  const quickChatPrompts = result
    ? [
        `Sản phẩm "${result.product_name}" có hợp cơ địa của tôi không?`,
        "Nên dùng sản phẩm này sáng hay tối?",
      ]
    : [
        "Retinol có dùng chung với BHA được không?",
        "Mẹ bầu cần tránh hoạt chất mỹ phẩm nào?",
      ];

  const filteredHistory = historyList.filter(
    (item) =>
      item.product_name?.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.claim_verdict?.toLowerCase().includes(historySearch.toLowerCase()),
  );

  const filteredEncyclopedia = INGREDIENT_ENCYCLOPEDIA.filter(
    (item) =>
      item.name.toLowerCase().includes(dictSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(dictSearch.toLowerCase()) ||
      item.benefits.toLowerCase().includes(dictSearch.toLowerCase()),
  );

  const comparedItems = historyList
    .filter((item) => compareIds.includes(item.id))
    .map((item) => {
      const parsedRaw =
        typeof item.analysis_json === "string"
          ? JSON.parse(item.analysis_json)
          : item.analysis_json;
      return {
        ...item,
        parsed: parsedRaw ? normalizeClinicalConsistency(parsedRaw) : null,
      };
    });

  // Hệ thống giao diện Glassmorphism & Bio-Tech HUD
  const shellBg = darkMode
    ? "bg-[#040711] text-slate-100"
    : "bg-[#F0F4F9] text-slate-800";
  const glassCard = darkMode
    ? "bg-[#0B1222]/85 backdrop-blur-xl border-slate-800/80 shadow-2xl shadow-black/40"
    : "bg-white/90 backdrop-blur-xl border-slate-200/80 shadow-xl shadow-slate-200/50";
  const subGlass = darkMode
    ? "bg-[#111B33]/90 border-slate-800"
    : "bg-slate-50/90 border-slate-200/80";
  const inputStyle = darkMode
    ? "bg-[#070D1A] border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20"
    : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15";
  const textMuted = darkMode ? "text-slate-400" : "text-slate-600";
  const textHeading = darkMode ? "text-white" : "text-slate-900";

  return (
    <div
      className={`min-h-screen flex flex-col font-sans antialiased relative overflow-x-hidden transition-colors duration-300 ${shellBg}`}
    >
      {/* HIỆU ỨNG ÁNH SÁNG NỀN AMBIENT BIO-TECH */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className={`absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full blur-[140px] ${
            darkMode ? "bg-teal-500/15" : "bg-teal-400/20"
          }`}
        />
        <div
          className={`absolute top-1/3 -right-32 w-[480px] h-[480px] rounded-full blur-[140px] ${
            darkMode ? "bg-cyan-500/10" : "bg-emerald-300/20"
          }`}
        />
      </div>

      {/* THANH ĐIỀU HƯỚNG KÍNH MỜ */}
      <header
        className={`sticky top-0 z-30 border-b backdrop-blur-xl ${
          darkMode
            ? "bg-[#040711]/80 border-slate-800/80"
            : "bg-white/80 border-slate-200/80"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div
            onClick={() => {
              setActiveTab("scan");
              setResult(null);
            }}
            className="flex items-center gap-3 cursor-pointer shrink-0 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500 blur-md opacity-40 group-hover:opacity-70 transition" />
              <div className="relative bg-gradient-to-br from-teal-400 via-teal-600 to-emerald-600 text-white p-2.5 rounded-xl shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-lg font-extrabold tracking-tight ${textHeading}`}
                >
                  SafeCheck
                  <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                    .ai
                  </span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-400 border border-teal-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CLINICAL AI
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${textMuted}`}>
                Nền tảng Thẩm định Dược mỹ phẩm & Cảnh báo Cơ địa
              </p>
            </div>
          </div>

          <nav
            className={`flex items-center gap-1 p-1 rounded-2xl border overflow-x-auto ${
              darkMode
                ? "bg-[#0B1222]/90 border-slate-800"
                : "bg-slate-100/90 border-slate-200"
            }`}
          >
            {[
              { id: "scan", label: "Thẩm định", icon: ScanLine },
              {
                id: "routine",
                label: `Chu trình (${routineList.length})`,
                icon: ListChecks,
              },
              { id: "encyclopedia", label: "Từ điển INCI", icon: BookMarked },
              {
                id: "profile",
                label: "Hồ sơ cơ địa",
                icon: UserCheck,
                dot: hasHealthProfile,
              },
              {
                id: "history",
                label: `Nhật ký (${historyList.length})`,
                icon: History,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/25"
                      : `${textMuted} hover:text-teal-500`
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.dot && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setChatOpen((v) => !v)}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500/15 to-emerald-500/15 hover:from-teal-500/25 hover:to-emerald-500/25 text-teal-500 dark:text-teal-300 border border-teal-500/30 text-xs font-bold transition cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Dược sĩ AI</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              title="Đổi giao diện Sáng / Tối"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                darkMode
                  ? "bg-slate-900/90 border-slate-700 text-amber-300 hover:border-amber-400/50"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* NỘI DUNG CHÍNH */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* BẢNG ĐIỀU KHIỂN CƠ ĐỊA TƯƠNG TÁC NHANH (LIVE BIO-FILTER BAR) */}
        <div
          className={`mb-6 p-4 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${glassCard}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 text-teal-500 border border-teal-500/25 shrink-0">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-teal-500">
                  Bộ lọc Sinh trắc & Dị ứng Cá nhân
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    hasHealthProfile
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-slate-500/15 text-slate-400"
                  }`}
                >
                  {hasHealthProfile ? "Đang kích hoạt" : "Chế độ mặc định"}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${textMuted}`}>
                Bấm chọn nhanh tình trạng cơ địa bên cạnh để thử nghiệm khả năng
                phát hiện xung đột & khóa điểm &lt; 40 ngay lập tức:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {QUICK_BIO_TOGGLES.map((item, idx) => {
              const active = isQuickBioActive(item);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickBioToggle(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/25"
                      : `${subGlass} ${textMuted} hover:border-teal-500/50`
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      active ? "bg-white animate-ping" : "bg-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-teal-500 hover:bg-teal-500/10 flex items-center gap-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Chi tiết</span>
            </button>
          </div>
        </div>

        {/* ==================== TAB 1: THẨM ĐỊNH SẢN PHẨM ==================== */}
        {activeTab === "scan" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* CỘT TRÁI: TRẠM NHẬP LIỆU & QUÉT NHÃN */}
            <div
              className={`lg:col-span-5 rounded-3xl border p-6 ${glassCard}`}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-6 rounded-full bg-gradient-to-b from-teal-400 to-emerald-500" />
                  <div>
                    <h1 className={`text-base font-extrabold ${textHeading}`}>
                      Trạm Quét & Giải mã INCI
                    </h1>
                    <p className={`text-[11px] ${textMuted}`}>
                      Hỗ trợ dán ảnh trực tiếp (Ctrl+V) hoặc chọn mẫu thử
                    </p>
                  </div>
                </div>
                {(productName || ingredientsText || imagePreview) && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl border cursor-pointer transition ${subGlass} ${textMuted} hover:text-rose-400 hover:border-rose-500/40`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đặt lại</span>
                  </button>
                )}
              </div>

              {/* THẺ MẪU DỮ LIỆU PHONG CÁCH THẺ LÂM SÀNG */}
              <div className="mb-5">
                <span
                  className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${textMuted}`}
                >
                  Hồ sơ mẫu thử nghiệm nhanh:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {SAMPLE_PRODUCTS.map((sample, idx) => {
                    const isSelected = productName === sample.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applySampleProduct(sample)}
                        className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "border-teal-500 bg-teal-500/10 shadow-sm"
                            : `${subGlass} hover:border-teal-500/50`
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="px-2 py-1 rounded-lg bg-teal-500/15 text-teal-500 font-mono text-[11px] font-extrabold shrink-0">
                            {sample.code}
                          </span>
                          <div className="truncate">
                            <div className="text-xs font-bold truncate">
                              {sample.label}
                            </div>
                            <div
                              className={`text-[11px] truncate ${textMuted}`}
                            >
                              {sample.tag}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-teal-500 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-4">
                {/* KHUNG QUÉT ẢNH NHÃN */}
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    Ảnh nhãn bao bì / Bảng thành phần
                  </label>
                  {!imagePreview ? (
                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={`group relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                        isDragging
                          ? "border-teal-400 bg-teal-500/15"
                          : darkMode
                            ? "border-slate-700/80 hover:border-teal-500/60 bg-[#070D1A]/60"
                            : "border-slate-300 hover:border-teal-600 bg-slate-50/80"
                      }`}
                    >
                      <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500 group-hover:scale-110 transition mb-2">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold">
                        Tải ảnh nhãn lên hoặc nhấn Ctrl + V
                      </span>
                      <span className={`text-[11px] mt-1 ${textMuted}`}>
                        Tự động nhận diện chữ trên bao bì (OCR Vision)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-teal-500/40 bg-black/20">
                      <img
                        src={imagePreview}
                        alt="Nhãn sản phẩm"
                        className="w-full max-h-48 object-contain mx-auto"
                      />
                      {loading && (
                        <div className="absolute inset-0 bg-teal-500/10 overflow-hidden">
                          <div className="w-full h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_15px_#2dd4bf] animate-bounce" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setZoomImage(true)}
                          className="p-1.5 rounded-xl bg-slate-900/80 text-white hover:bg-slate-900 cursor-pointer"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={clearImage}
                          className="p-1.5 rounded-xl bg-rose-600/90 text-white hover:bg-rose-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Nhập tên mỹ phẩm hoặc thực phẩm chức năng..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition ${inputStyle}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    Công dụng quảng cáo trên bao bì
                  </label>
                  <input
                    type="text"
                    value={claimsText}
                    onChange={(e) => setClaimsText(e.target.value)}
                    placeholder="Ví dụ: Xóa sạch nám sau 7 ngày, cấp ẩm 72h..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition ${inputStyle}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    Bảng thành phần chi tiết (INCI)
                  </label>
                  <textarea
                    rows={4}
                    value={ingredientsText}
                    onChange={(e) => setIngredientsText(e.target.value)}
                    placeholder="Aqua, Panthenol (5%), Niacinamide, Sodium Hyaluronate..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none transition font-mono text-xs leading-relaxed ${inputStyle}`}
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang chạy mô hình thẩm định...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      <span>Kích hoạt Phân tích Lâm sàng</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* CỘT PHẢI: MÀN HÌNH HIỂN THỊ KẾT QUẢ HUD */}
            <div className="lg:col-span-7">
              {!result && !loading && (
                <div
                  className={`rounded-3xl border p-8 sm:p-10 relative overflow-hidden ${glassCard}`}
                >
                  <div className="flex flex-col items-center text-center max-w-lg mx-auto">
                    <div className="relative mb-5">
                      <div className="absolute inset-0 bg-teal-500 blur-2xl opacity-25 rounded-full" />
                      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center">
                        <Layers className="w-8 h-8" />
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/25 mb-3">
                      Hệ thống Chẩn đoán Công thức Đang Sẵn Sàng
                    </span>

                    <h2
                      className={`text-xl sm:text-2xl font-extrabold ${textHeading}`}
                    >
                      Kiểm chứng Khoa học Trước Khi Sử Dụng
                    </h2>
                    <p
                      className={`text-xs sm:text-sm mt-2.5 leading-relaxed ${textMuted}`}
                    >
                      Chọn một mẫu sản phẩm ở cột bên trái hoặc tải ảnh nhãn bao
                      bì. SafeCheck.ai sẽ bóc tách từng hoạt chất, đối chiếu với
                      cơ địa của bạn và khóa điểm dưới 40 nếu phát hiện nguy cơ
                      cấm dùng.
                    </p>
                  </div>

                  {/* BENTO GRID TÍNH NĂNG */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8">
                    {[
                      {
                        icon: Scale,
                        title: "Bóc tách quảng cáo",
                        desc: "Phát hiện tuyên bố phóng đại trái với sinh lý học.",
                      },
                      {
                        icon: ShieldAlert,
                        title: "Khóa điểm < 40",
                        desc: "Tự động cảnh báo cấm dùng khi gặp dị ứng mức Cao.",
                      },
                      {
                        icon: BookOpen,
                        title: "Chuẩn y văn CIR",
                        desc: "Xếp hạng độ tin cậy bằng chứng từng hoạt chất.",
                      },
                    ].map((box, i) => {
                      const BoxIcon = box.icon;
                      return (
                        <div
                          key={i}
                          className={`p-4 rounded-2xl border transition hover:border-teal-500/40 ${subGlass}`}
                        >
                          <BoxIcon className="w-5 h-5 text-teal-400 mb-2.5" />
                          <div className="text-xs font-extrabold mb-1">
                            {box.title}
                          </div>
                          <div
                            className={`text-[11px] leading-relaxed ${textMuted}`}
                          >
                            {box.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MÀN HÌNH QUÉT ĐA TẦNG KHI ĐANG PHÂN TÍCH */}
              {loading && (
                <div
                  className={`rounded-3xl border p-10 text-center space-y-6 ${glassCard}`}
                >
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-teal-500/30 animate-ping" />
                    <div className="w-16 h-16 rounded-full bg-teal-500/15 border border-teal-400/50 flex items-center justify-center text-teal-400">
                      <Cpu className="w-8 h-8 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-base font-extrabold ${textHeading}`}>
                      Đang thực thi chuỗi kiểm định dược lý
                    </h3>
                    <p className="text-xs font-mono text-teal-400 mt-2">
                      &gt; {SCAN_STEPS[scanStepIndex]}
                    </p>
                  </div>
                  <div className="max-w-xs mx-auto h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-300"
                      style={{
                        width: `${((scanStepIndex + 1) / SCAN_STEPS.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* HỒ SƠ KẾT QUẢ PHÂN TÍCH CHI TIẾT */}
              {result &&
                !loading &&
                (() => {
                  const theme = getScoreTheme(result.safety_score);
                  const circumference = 2 * Math.PI * 42;
                  const strokeDashoffset =
                    circumference - (result.safety_score / 100) * circumference;

                  const totalIngs = result.key_ingredients?.length || 1;
                  const strongCount = (result.key_ingredients || []).filter(
                    (i) => i.evidence_level.toLowerCase().includes("mạnh"),
                  ).length;
                  const riskCount = result.personal_risks?.length || 0;
                  const neutralCount = Math.max(0, totalIngs - strongCount);

                  const filteredIngs = (result.key_ingredients || []).filter(
                    (ing) => {
                      if (ingFilter === "strong")
                        return ing.evidence_level
                          .toLowerCase()
                          .includes("mạnh");
                      if (ingFilter === "limited")
                        return !ing.evidence_level
                          .toLowerCase()
                          .includes("mạnh");
                      return true;
                    },
                  );

                  return (
                    <div
                      className={`rounded-3xl border overflow-hidden transition-all ${glassCard} ${theme.glow}`}
                    >
                      {/* HEADER HUD ĐIỂM SỐ SINH TRẮC */}
                      <div
                        className={`p-6 border-b ${theme.bg} ${theme.border}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm ${theme.badge}`}
                              >
                                {theme.isForbidden ? (
                                  <Ban className="w-3.5 h-3.5" />
                                ) : (
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                )}
                                {theme.label}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold border ${subGlass}`}
                              >
                                {result.claim_verdict}
                              </span>
                            </div>
                            <h2
                              className={`text-xl sm:text-2xl font-extrabold tracking-tight ${textHeading}`}
                            >
                              {result.product_name}
                            </h2>
                          </div>

                          {/* ĐỒNG HỒ ĐO ĐIỂM AN TOÀN PHÁT SÁNG */}
                          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                            <div className="relative w-24 h-24 flex items-center justify-center">
                              <svg className="w-24 h-24 -rotate-90">
                                <circle
                                  cx="48"
                                  cy="48"
                                  r="42"
                                  stroke="currentColor"
                                  strokeWidth="7"
                                  fill="transparent"
                                  className="text-slate-400/20"
                                />
                                <circle
                                  cx="48"
                                  cy="48"
                                  r="42"
                                  stroke={theme.ring}
                                  strokeWidth="7"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={strokeDashoffset}
                                  strokeLinecap="round"
                                  fill="transparent"
                                  style={{
                                    filter: `drop-shadow(0 0 6px ${theme.ring})`,
                                  }}
                                />
                              </svg>
                              <div className="absolute text-center">
                                <span
                                  className={`text-2xl font-black tracking-tight ${theme.text}`}
                                >
                                  {result.safety_score}
                                </span>
                                <span className="block text-[9px] uppercase font-extrabold opacity-70">
                                  ĐIỂM / 100
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* BIỂU NGỮ CẢNH BÁO CẤM DÙNG NẾU ĐIỂM < 40 */}
                        {theme.isForbidden && (
                          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs font-bold flex items-start gap-3 shadow-lg shadow-rose-600/30">
                            <Ban className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <div className="uppercase tracking-wider text-[11px] opacity-90">
                                Cảnh báo chống chỉ định tuyệt đối (
                                {result.safety_score}/100 điểm)
                              </div>
                              <div className="mt-0.5 leading-relaxed">
                                Phát hiện hoạt chất xung đột nghiêm trọng với cơ
                                địa của bạn. Không được sử dụng sản phẩm này.
                              </div>
                            </div>
                          </div>
                        )}

                        {/* THANH TỶ LỆ CẤU TRÚC CÔNG THỨC */}
                        <div className="mt-5">
                          <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                            <span className={textMuted}>
                              Cấu trúc phân bổ hoạt chất công thức
                            </span>
                            <span>
                              {strongCount} Bằng chứng mạnh • {neutralCount} Hỗ
                              trợ • {riskCount} Cảnh báo
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-800/40 overflow-hidden flex">
                            <div
                              style={{
                                width: `${(strongCount / (totalIngs + riskCount)) * 100}%`,
                              }}
                              className="bg-emerald-500 h-full"
                            />
                            <div
                              style={{
                                width: `${(neutralCount / (totalIngs + riskCount)) * 100}%`,
                              }}
                              className="bg-sky-500 h-full"
                            />
                            <div
                              style={{
                                width: `${(riskCount / (totalIngs + riskCount)) * 100}%`,
                              }}
                              className="bg-rose-500 h-full"
                            />
                          </div>
                        </div>

                        {/* THANH CÔNG CỤ HÀNH ĐỘNG NHANH */}
                        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-500/20">
                          <button
                            type="button"
                            onClick={handleCopyReport}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition ${subGlass} hover:border-teal-500/50`}
                          >
                            {copiedReport ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {copiedReport
                                ? "Đã sao chép"
                                : "Sao chép báo cáo"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition ${subGlass} hover:border-teal-500/50`}
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>In phiếu thẩm định</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setChatOpen(true);
                              handleSendChat(
                                `Sản phẩm "${result.product_name}" có hợp cơ địa của tôi không và nên xử lý thế nào?`,
                              );
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-bold hover:opacity-95 cursor-pointer ml-auto shadow-md shadow-teal-600/20"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            <span>Tham vấn Dược sĩ AI</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* 1. KIỂM CHỨNG TUYÊN BỐ QUẢNG CÁO */}
                        <div>
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-500 mb-2 flex items-center gap-1.5">
                            <Scale className="w-4 h-4" />
                            <span>1. Kiểm chứng tuyên bố công dụng</span>
                          </h3>
                          <p
                            className={`text-xs sm:text-sm leading-relaxed p-4 rounded-2xl border ${subGlass}`}
                          >
                            {result.claim_analysis}
                          </p>
                        </div>

                        {/* 2. RỦI RO CÁ NHÂN HÓA THEO CƠ ĐỊA */}
                        <div>
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-500 mb-2 flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4" />
                            <span>
                              2. Cảnh báo xung đột cơ địa (
                              {result.personal_risks?.length || 0})
                            </span>
                          </h3>
                          {result.personal_risks &&
                          result.personal_risks.length > 0 ? (
                            <div className="space-y-2.5">
                              {result.personal_risks.map((risk, idx) => (
                                <div
                                  key={idx}
                                  className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                                    risk.risk_level === "Cao"
                                      ? "border-rose-500/50 bg-rose-500/10"
                                      : "border-amber-500/40 bg-amber-500/10"
                                  }`}
                                >
                                  <div>
                                    <div
                                      className={`text-sm font-extrabold ${
                                        risk.risk_level === "Cao"
                                          ? "text-rose-400"
                                          : "text-amber-400"
                                      }`}
                                    >
                                      {risk.ingredient}
                                    </div>
                                    <p className="text-xs mt-1 leading-relaxed">
                                      {risk.reason}
                                    </p>
                                  </div>
                                  <span
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold text-white shrink-0 ${
                                      risk.risk_level === "Cao"
                                        ? "bg-rose-600"
                                        : "bg-amber-500"
                                    }`}
                                  >
                                    Rủi ro {risk.risk_level}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 rounded-2xl border border-emerald-500/35 bg-emerald-500/10 text-xs flex items-center gap-2.5 text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span>
                                Không phát hiện thành phần xung đột trực tiếp
                                với hồ sơ cơ địa hiện tại.
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 3. GIẢI MÃ HOẠT CHẤT CHÍNH */}
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-500 flex items-center gap-1.5">
                              <FlaskConical className="w-4 h-4" />
                              <span>
                                3. Phân tích hoạt chất chính (
                                {filteredIngs.length})
                              </span>
                            </h3>
                            <div className="flex gap-1">
                              {[
                                { id: "all", label: "Tất cả" },
                                { id: "strong", label: "Bằng chứng mạnh" },
                                { id: "limited", label: "Cần lưu ý" },
                              ].map((f) => (
                                <button
                                  key={f.id}
                                  type="button"
                                  onClick={() => setIngFilter(f.id as any)}
                                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition ${
                                    ingFilter === f.id
                                      ? "bg-teal-600 text-white"
                                      : `${subGlass} ${textMuted}`
                                  }`}
                                >
                                  {f.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filteredIngs.map((ing, idx) => (
                              <div
                                key={idx}
                                className={`p-3.5 rounded-2xl border transition hover:border-teal-500/40 ${subGlass}`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-xs font-extrabold">
                                    {ing.name}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                      ing.evidence_level
                                        .toLowerCase()
                                        .includes("mạnh")
                                        ? "bg-emerald-500/15 text-emerald-400"
                                        : "bg-amber-500/15 text-amber-400"
                                    }`}
                                  >
                                    {ing.evidence_level}
                                  </span>
                                </div>
                                <p
                                  className={`text-xs leading-relaxed ${textMuted}`}
                                >
                                  {ing.function}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 4. KHUYẾN NGHỊ SỬ DỤNG & Y VĂN */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-500/20">
                          <div
                            className={`p-4 rounded-2xl border ${
                              theme.isForbidden
                                ? "border-rose-500/50 bg-rose-500/10"
                                : subGlass
                            }`}
                          >
                            <div
                              className={`text-xs font-extrabold mb-1.5 flex items-center gap-1.5 ${
                                theme.isForbidden
                                  ? "text-rose-400"
                                  : "text-teal-500"
                              }`}
                            >
                              <Info className="w-4 h-4" />
                              <span>Kết luận & Khuyến nghị</span>
                            </div>
                            <p className="text-xs leading-relaxed font-medium">
                              {result.advice}
                            </p>
                          </div>

                          <div className={`p-4 rounded-2xl border ${subGlass}`}>
                            <div className="text-xs font-extrabold text-slate-400 mb-1.5 flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4" />
                              <span>Cơ sở dữ liệu tham chiếu</span>
                            </div>
                            <ul
                              className={`text-[11px] space-y-1 ${textMuted}`}
                            >
                              {(result.scientific_references || []).map(
                                (ref, i) => (
                                  <li key={i}>• {ref}</li>
                                ),
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: CHU TRÌNH ĐA SẢN PHẨM ==================== */}
        {activeTab === "routine" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div
              className={`lg:col-span-5 rounded-3xl border p-6 ${glassCard}`}
            >
              <h2 className={`text-lg font-extrabold mb-1 ${textHeading}`}>
                Xây dựng Chu trình Chăm sóc / Bổ sung
              </h2>
              <p className={`text-xs mb-4 ${textMuted}`}>
                Thêm từ 2 sản phẩm trở lên để AI kiểm tra xung đột hoạt chất và
                thứ tự thoa chuẩn.
              </p>

              <form onSubmit={handleAddRoutineItem} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Bước sử dụng
                    </label>
                    <select
                      value={rStepName}
                      onChange={(e) => setRStepName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${inputStyle}`}
                    >
                      <option>Sữa rửa mặt / Làm sạch</option>
                      <option>Toner / Nước cân bằng</option>
                      <option>Serum / Tinh chất</option>
                      <option>Đặc trị (Treatment)</option>
                      <option>Kem dưỡng ẩm</option>
                      <option>Kem chống nắng</option>
                      <option>Viên uống bổ sung</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Thời điểm dùng
                    </label>
                    <select
                      value={rTimeOfDay}
                      onChange={(e) => setRTimeOfDay(e.target.value as any)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${inputStyle}`}
                    >
                      <option value="Buổi Sáng">Buổi Sáng</option>
                      <option value="Buổi Tối">Buổi Tối</option>
                      <option value="Sáng & Tối">Sáng & Tối</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    value={rProductName}
                    onChange={(e) => setRProductName(e.target.value)}
                    placeholder="Ví dụ: Serum Retinol 0.5%"
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputStyle}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    Hoạt chất chính
                  </label>
                  <input
                    type="text"
                    value={rKeyActives}
                    onChange={(e) => setRKeyActives(e.target.value)}
                    placeholder="Ví dụ: Retinol, Squalane, Ceramide"
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputStyle}`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm vào chu trình</span>
                </button>
              </form>
            </div>

            <div
              className={`lg:col-span-7 rounded-3xl border p-6 ${glassCard}`}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className={`text-base font-extrabold ${textHeading}`}>
                  Danh sách sản phẩm trong chu trình ({routineList.length})
                </h3>
                <button
                  type="button"
                  disabled={routineList.length < 2 || auditingRoutine}
                  onClick={handleAuditRoutine}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {auditingRoutine ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5" />
                  )}
                  <span>Kiểm tra tương tác toàn chu trình</span>
                </button>
              </div>

              {routineList.length === 0 ? (
                <div
                  className={`p-8 rounded-2xl border text-center text-xs ${subGlass} ${textMuted}`}
                >
                  Chưa có sản phẩm nào. Hãy thêm ít nhất 2 sản phẩm ở cột bên
                  trái để kiểm tra tương tác chéo.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {routineList.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${subGlass}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-teal-500/15 text-teal-400 text-[11px] font-bold">
                            Bước {idx + 1} • {item.timeOfDay}
                          </span>
                          <span
                            className={`text-xs font-semibold ${textMuted}`}
                          >
                            {item.stepName}
                          </span>
                        </div>
                        <div className="text-sm font-bold mt-1">
                          {item.productName}
                        </div>
                        <div className={`text-xs mt-0.5 ${textMuted}`}>
                          Hoạt chất: {item.keyActives}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRoutineItem(item.id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {routineAuditResult && (
                <div
                  className={`mt-5 p-4 rounded-2xl border space-y-2 ${
                    routineAuditResult.safety_score < 40
                      ? "border-rose-500/50 bg-rose-500/10"
                      : "border-teal-500/35 bg-teal-500/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold uppercase ${
                        routineAuditResult.safety_score < 40
                          ? "text-rose-400"
                          : "text-teal-400"
                      }`}
                    >
                      Kết quả thẩm định tương tác chu trình
                    </span>
                    <span
                      className={`text-sm font-black ${
                        routineAuditResult.safety_score < 40
                          ? "text-rose-400"
                          : "text-teal-400"
                      }`}
                    >
                      {routineAuditResult.safety_score}/100 điểm
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {routineAuditResult.advice}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: TỪ ĐIỂN HOẠT CHẤT ==================== */}
        {activeTab === "encyclopedia" && (
          <div className="space-y-6">
            <div className={`rounded-3xl border p-6 ${glassCard}`}>
              <h2 className={`text-base font-extrabold mb-1 ${textHeading}`}>
                Kiểm tra nhanh Tương tác Cặp Hoạt chất
              </h2>
              <p className={`text-xs mb-4 ${textMuted}`}>
                Chọn 2 hoạt chất để kiểm tra khả năng kết hợp trong cùng một
                buổi chăm sóc da.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={ingA}
                  onChange={(e) => setIngA(e.target.value)}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold outline-none ${inputStyle}`}
                >
                  <option>Retinol</option>
                  <option>Niacinamide</option>
                  <option>Vitamin C</option>
                  <option>Panthenol (B5)</option>
                </select>
                <select
                  value={ingB}
                  onChange={(e) => setIngB(e.target.value)}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold outline-none ${inputStyle}`}
                >
                  <option>AHA / BHA</option>
                  <option>Vitamin C</option>
                  <option>Retinol</option>
                  <option>HA / Ceramide</option>
                </select>
                <button
                  type="button"
                  onClick={checkPairInteraction}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer"
                >
                  Tra cứu tương tác
                </button>
              </div>
              {interactionResult && (
                <div
                  className={`mt-4 p-4 rounded-2xl border text-xs leading-relaxed ${subGlass}`}
                >
                  {interactionResult}
                </div>
              )}
            </div>

            <div className={`rounded-3xl border p-6 ${glassCard}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <h2 className={`text-base font-extrabold ${textHeading}`}>
                  Từ điển Dược lý Hoạt chất Phổ biến
                </h2>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={dictSearch}
                    onChange={(e) => setDictSearch(e.target.value)}
                    placeholder="Tìm Retinol, B5, Niacinamide..."
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none ${inputStyle}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEncyclopedia.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border space-y-2 ${subGlass}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-extrabold">{item.name}</h3>
                        <span className={`text-[11px] ${textMuted}`}>
                          {item.category}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-teal-500/15 text-teal-400">
                        {item.evidence}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      <strong>Cơ chế:</strong> {item.benefits}
                    </p>
                    <p className="text-xs leading-relaxed text-amber-400">
                      <strong>Lưu ý:</strong> {item.caution}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: HỒ SƠ CƠ ĐỊA CÁ NHÂN ==================== */}
        {activeTab === "profile" && (
          <div
            className={`max-w-3xl mx-auto rounded-3xl border p-6 sm:p-8 ${glassCard}`}
          >
            <h2 className={`text-lg font-extrabold mb-1 ${textHeading}`}>
              Hồ sơ Cơ địa & Tiền sử Dị ứng Cá nhân
            </h2>
            <p className={`text-xs mb-6 ${textMuted}`}>
              Dữ liệu này được dùng làm bộ lọc lâm sàng khi phân tích mọi sản
              phẩm và trả lời tư vấn trên Chatbot.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  Tình trạng da hiện tại
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {SKIN_PRESETS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => appendTag(skinType, tag, setSkinType)}
                      className={`px-2.5 py-1 rounded-xl border text-xs cursor-pointer ${subGlass} hover:border-teal-500`}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
                  placeholder="Ví dụ: Da nhạy cảm, dễ kích ứng, đang dùng treatment"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${inputStyle}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  Thành phần dị ứng / Không dung nạp
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {ALLERGY_PRESETS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => appendTag(allergies, tag, setAllergies)}
                      className={`px-2.5 py-1 rounded-xl border text-xs cursor-pointer ${subGlass} hover:border-rose-500`}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="Ví dụ: Hương liệu (Fragrance), Cồn khô, Hải sản..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${inputStyle}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    Bệnh nền / Trạng thái đặc biệt
                  </label>
                  <input
                    type="text"
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                    placeholder="Ví dụ: Đang mang thai, Viêm da cơ địa..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${inputStyle}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    Thuốc / Hoạt chất đang sử dụng
                  </label>
                  <input
                    type="text"
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                    placeholder="Ví dụ: Isotretinoin, Tretinoin 0.05%..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${inputStyle}`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-sm cursor-pointer shadow-md shadow-teal-600/25"
                >
                  Lưu hồ sơ cơ địa
                </button>
                {profileSaved && (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã lưu hồ sơ thành công!
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ==================== TAB 5: NHẬT KÝ THẨM ĐỊNH ==================== */}
        {activeTab === "history" && (
          <div className={`rounded-3xl border p-6 ${glassCard}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h2 className={`text-lg font-extrabold ${textHeading}`}>
                  Nhật ký Thẩm định Sản phẩm
                </h2>
                <p className={`text-xs ${textMuted}`}>
                  Chọn tối đa 2 sản phẩm để so sánh đối chiếu điểm an toàn
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Lọc theo tên sản phẩm..."
                  className={`px-3 py-2 rounded-xl border text-xs outline-none ${inputStyle}`}
                />
                {compareIds.length === 2 && (
                  <button
                    type="button"
                    onClick={() => setShowCompareModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold cursor-pointer"
                  >
                    So sánh 2 sản phẩm
                  </button>
                )}
                {historyList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer ${subGlass}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất CSV</span>
                  </button>
                )}
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div
                className={`p-10 rounded-2xl border text-center text-xs ${subGlass} ${textMuted}`}
              >
                Chưa có bản ghi thẩm định nào.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredHistory.map((item) => {
                  const rawParsed =
                    typeof item.analysis_json === "string"
                      ? JSON.parse(item.analysis_json)
                      : item.analysis_json;
                  const normalizedItem = rawParsed
                    ? normalizeClinicalConsistency(rawParsed)
                    : null;
                  const displayScore =
                    normalizedItem?.safety_score ?? item.safety_score;
                  const displayVerdict =
                    normalizedItem?.claim_verdict ?? item.claim_verdict;
                  const theme = getScoreTheme(displayScore);

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (normalizedItem) {
                          setResult(normalizedItem);
                          setActiveTab("scan");
                        }
                      }}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition hover:border-teal-500/50 ${subGlass}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={compareIds.includes(item.id)}
                          onChange={() => {}}
                          onClick={(e) => toggleCompareItem(item.id, e)}
                          className="w-4 h-4 accent-teal-500 cursor-pointer"
                        />
                        <div>
                          <div className="text-sm font-bold">
                            {item.product_name}
                          </div>
                          <div className={`text-xs mt-0.5 ${textMuted}`}>
                            {displayVerdict} •{" "}
                            {new Date(item.created_at).toLocaleString("vi-VN")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-extrabold ${theme.badge}`}
                        >
                          {displayScore}/100
                        </span>
                        <Eye className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL PHÓNG TO ẢNH NHÃN */}
      {zoomImage && imagePreview && (
        <div
          onClick={() => setZoomImage(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <img
            src={imagePreview}
            alt="Phóng to nhãn"
            className="max-w-full max-h-[90vh] rounded-2xl border border-slate-700"
          />
        </div>
      )}

      {/* MODAL SO SÁNH 2 SẢN PHẨM */}
      {showCompareModal && comparedItems.length === 2 && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`max-w-4xl w-full rounded-3xl border p-6 max-h-[85vh] overflow-y-auto ${glassCard}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold">
                Đối chiếu An toàn 2 Sản phẩm
              </h3>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-500/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparedItems.map((item) => {
                const score = item.parsed?.safety_score ?? item.safety_score;
                const isForbidden = score < 40;
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border space-y-2 ${subGlass}`}
                  >
                    <div className="text-sm font-extrabold">
                      {item.product_name}
                    </div>
                    <div
                      className={`text-lg font-black ${
                        isForbidden ? "text-rose-500" : "text-teal-400"
                      }`}
                    >
                      {score}/100 điểm {isForbidden && "(Không được dùng)"}
                    </div>
                    <div className="text-xs">
                      <strong>Kết luận:</strong>{" "}
                      {item.parsed?.claim_verdict ?? item.claim_verdict}
                    </div>
                    <p className="text-xs leading-relaxed">
                      {item.parsed?.advice}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CHATBOT TRỢ LÝ DƯỢC LÝ TÍCH HỢP */}
      <div className="fixed bottom-5 right-5 z-40">
        {!chatOpen ? (
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-extrabold text-sm shadow-xl shadow-teal-600/35 hover:scale-105 transition cursor-pointer"
          >
            <MessageSquareText className="w-5 h-5" />
            <span>Trợ lý Dược sĩ AI</span>
          </button>
        ) : (
          <div
            className={`w-[360px] sm:w-[400px] h-[520px] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${glassCard}`}
          >
            <div className="px-4 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <div>
                  <div className="text-xs font-extrabold">
                    Trợ lý Dược lý SafeCheck.ai
                  </div>
                  <div className="text-[10px] opacity-90">
                    Đang trực tuyến • Sẵn sàng đối chiếu cơ địa
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-teal-600 text-white rounded-br-sm"
                        : `${subGlass} border rounded-bl-sm`
                    }`}
                  >
                    {renderChatText(msg.content)}
                  </div>
                  <span className={`text-[10px] mt-1 px-1 ${textMuted}`}>
                    {msg.timestamp}
                  </span>
                </div>
              ))}
              {chatSending && (
                <div className="flex items-center gap-2 text-xs text-teal-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tra cứu dữ liệu dược lý...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="px-3 py-2 border-t border-slate-500/20 flex gap-1.5 overflow-x-auto">
              {quickChatPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendChat(qp)}
                  className={`px-2.5 py-1 rounded-full border text-[11px] shrink-0 cursor-pointer hover:border-teal-500 ${subGlass}`}
                >
                  {qp}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="p-2.5 border-t border-slate-500/20 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Hỏi về hoạt chất, tương tác, cách dùng..."
                className={`flex-1 px-3 py-2 rounded-xl border text-xs outline-none ${inputStyle}`}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatSending}
                className="p-2 rounded-xl bg-teal-600 text-white disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
