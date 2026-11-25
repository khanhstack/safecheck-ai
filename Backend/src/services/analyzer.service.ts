import pool from "../config/db";
import { generateWithAutoFallback } from "../config/gemini";
import { getProfileBySession } from "./profile.service";
import { getKnowledgeContext } from "./rag.service";
import { RowDataPacket } from "mysql2";

interface AnalyzeInput {
  sessionId: string;
  productName?: string;
  claimsText?: string;
  ingredientsText?: string;
  imageBase64?: string;
  mimeType?: string;
}

// Hàm chuẩn hóa tính điểm định lượng để đảm bảo nhất quán 100% giữa các lần quét
const calculateConsistentScore = (
  data: any,
  hasIngredients: boolean,
): number => {
  let score = 100;

  // 1. Trừ điểm theo mức độ xác thực quảng cáo
  const verdict = (data.claim_verdict || "").toLowerCase();
  if (verdict.includes("thiếu bằng chứng")) {
    score -= 20;
  } else if (verdict.includes("thổi phồng") || verdict.includes("thận trọng")) {
    score -= 15;
  }

  // 2. Trừ điểm theo từng rủi ro cá nhân hóa phát hiện được
  if (Array.isArray(data.personal_risks)) {
    for (const risk of data.personal_risks) {
      const level = (risk.risk_level || "").toLowerCase();
      if (level.includes("cao")) {
        score -= 25;
      } else if (level.includes("trung bình")) {
        score -= 15;
      } else if (level.includes("thấp")) {
        score -= 5;
      }
    }
  }

  // 3. Trừ điểm nếu tỷ lệ hoạt chất "Chưa xác minh" chiếm đa số
  if (Array.isArray(data.key_ingredients) && data.key_ingredients.length > 0) {
    const unverifiedCount = data.key_ingredients.filter((ing: any) =>
      (ing.evidence_level || "").toLowerCase().includes("chưa xác minh"),
    ).length;
    if (unverifiedCount > data.key_ingredients.length / 2) {
      score -= 10;
    }
  }

  // 4. Trừ điểm nếu thiếu hoàn toàn bảng thành phần (chỉ nhập tên)
  if (!hasIngredients) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
};

export const analyzeProduct = async (input: AnalyzeInput) => {
  const {
    sessionId,
    productName,
    claimsText,
    ingredientsText,
    imageBase64,
    mimeType,
  } = input;

  // 1. Lấy hồ sơ sức khỏe cá nhân & kho tri thức RAG
  const profile = await getProfileBySession(sessionId);
  const knowledgeContext = await getKnowledgeContext();

  const profileText = profile
    ? `Loại da/cơ địa: ${profile.skin_type || "Chưa rõ"}; Dị ứng: ${profile.allergies || "Không"}; Bệnh nền: ${profile.medical_conditions || "Không"}; Thuốc đang dùng: ${profile.current_medications || "Không"}`
    : "Người dùng chưa thiết lập hồ sơ sức khỏe cá nhân.";

  // 2. Xây dựng Prompt kiểm chứng đa tầng với thang chấm điểm cố định
  const prompt = `
Bạn là SafeCheck AI - Trợ lý kiểm chứng thông tin y dược, mỹ phẩm và thực phẩm bảo vệ sức khỏe dựa trên bằng chứng khoa học.
Nhiệm vụ của bạn là thực hiện quy trình 3 bước một cách khách quan, nhất quán và chính xác:
1. Trích xuất danh sách thành phần/hoạt chất từ hình ảnh nhãn sản phẩm (nếu có) và văn bản người dùng cung cấp.
2. Đối chiếu công dụng quảng cáo với bằng chứng khoa học thực tế và KHO TRI THỨC THAM CHIẾU dưới đây.
3. Đánh giá mức độ an toàn CÁ NHÂN HÓA dựa trên HỒ SƠ SỨC KHỎE của người dùng (cảnh báo dị ứng, tương tác thuốc, chống chỉ định bệnh nền).

QUY TẮC CHẤM ĐIỂM BẮT BUỘC CHO TRƯỜNG "safety_score" (Bắt đầu từ 100 điểm):
- Nếu "claim_verdict" là "Thiếu bằng chứng khoa học": trừ 20 điểm.
- Nếu "claim_verdict" là "Cần thận trọng / Thổi phồng": trừ 15 điểm.
- Với mỗi mục trong "personal_risks": mức "Cao" trừ 25 điểm; mức "Trung bình" trừ 15 điểm; mức "Thấp" trừ 5 điểm.
- Nếu quá nửa số hoạt chất trong "key_ingredients" chỉ ở mức "Chưa xác minh": trừ 10 điểm.
- Nếu không có bảng thành phần cụ thể (không ảnh và không văn bản thành phần): trừ 10 điểm.

[HỒ SƠ SỨC KHỎE NGƯỜI DÙNG]:
${profileText}

[KHO TRI THỨC KHOA HỌC THAM CHIẾU (RAG)]:
${knowledgeContext}

[THÔNG TIN SẢN PHẨM CẦN KIỂM TRA]:
- Tên sản phẩm: ${productName || "Chưa cung cấp (tự nhận diện từ ảnh nếu có)"}
- Lời quảng cáo / Công dụng cam kết: ${claimsText || "Không có"}
- Bảng thành phần dạng chữ: ${ingredientsText || "Xem trong hình ảnh đính kèm"}

YÊU CẦU TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON SAU (viết bằng tiếng Việt chuẩn xác, khách quan, dễ hiểu):
{
  "product_name": "Tên sản phẩm nhận diện được",
  "safety_score": 85,
  "claim_verdict": "Đáng tin cậy" | "Cần thận trọng / Thổi phồng" | "Thiếu bằng chứng khoa học",
  "claim_analysis": "Phân tích chi tiết lời quảng cáo có đúng với cơ chế khoa học của các hoạt chất hay không",
  "personal_risks": [
    {
      "ingredient": "Tên thành phần gây rủi ro cho hồ sơ này",
      "risk_level": "Cao" | "Trung bình" | "Thấp",
      "reason": "Giải thích cụ thể lý do tương tác với dị ứng/bệnh nền/thuốc đang dùng"
    }
  ],
  "key_ingredients": [
    {
      "name": "Tên hoạt chất chính",
      "function": "Tác dụng thực sự theo khoa học",
      "evidence_level": "Bằng chứng mạnh" | "Bằng chứng hạn chế" | "Chưa xác minh"
    }
  ],
  "unverified_notes": "Ghi chú rõ các thông tin chưa đủ dữ liệu kiểm chứng hoặc cần kiểm tra thêm nồng độ",
  "scientific_references": ["Nguồn tham chiếu khoa học liên quan"],
  "advice": "Lời khuyên sử dụng an toàn và khuyến nghị tham khảo ý kiến bác sĩ/dược sĩ"
}
`;

  // 3. Gọi Gemini Multimodal tự động xoay vòng model
  const parts: any[] = [prompt];
  if (imageBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    });
  }

  const result = await generateWithAutoFallback(parts);
  const responseText = result.response.text();
  const analysisData = JSON.parse(responseText);

  // Đồng bộ điểm số theo công thức định lượng cố định
  const hasIngredients = Boolean(ingredientsText?.trim() || imageBase64);
  analysisData.safety_score = calculateConsistentScore(
    analysisData,
    hasIngredients,
  );

  // 4. Lưu lịch sử phân tích vào MySQL
  await pool.query(
    `INSERT INTO scan_history (session_id, product_name, safety_score, claim_verdict, analysis_json)
     VALUES (?, ?, ?, ?, ?)`,
    [
      sessionId,
      analysisData.product_name || productName || "Sản phẩm chưa đặt tên",
      analysisData.safety_score,
      analysisData.claim_verdict || "Cần thận trọng",
      JSON.stringify(analysisData),
    ],
  );

  return analysisData;
};

export const getHistoryBySession = async (sessionId: string) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, product_name, safety_score, claim_verdict, analysis_json, created_at FROM scan_history WHERE session_id = ? ORDER BY created_at DESC LIMIT 20",
    [sessionId],
  );
  return rows;
};
