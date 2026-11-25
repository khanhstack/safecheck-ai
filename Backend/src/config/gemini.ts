import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("Thiếu GEMINI_API_KEY trong file .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Lưu cache danh sách model trong phiên chạy server để tăng tốc độ phản hồi
let cachedOrderedModels: string[] | null = null;

const getAvailableFlashProModels = async (): Promise<string[]> => {
  if (cachedOrderedModels && cachedOrderedModels.length > 0) {
    return cachedOrderedModels;
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`,
  );
  const data = await res.json();

  if (!data.models) {
    throw new Error(`Không lấy được danh sách model: ${JSON.stringify(data)}`);
  }

  // Chỉ giữ lại các model Gemini Flash/Pro tiêu chuẩn (loại bỏ các model đặc thù limit: 0)
  const validModels = data.models
    .filter((m: any) => {
      const name = m.name.toLowerCase();
      return (
        m.supportedGenerationMethods?.includes("generateContent") &&
        name.includes("gemini") &&
        (name.includes("flash") || name.includes("pro")) &&
        !name.includes("embedding") &&
        !name.includes("image") &&
        !name.includes("tts") &&
        !name.includes("computer-use") &&
        !name.includes("omni") &&
        !name.includes("robotics") &&
        !name.includes("exp")
      );
    })
    .map((m: any) => m.name.replace("models/", ""));

  // Ưu tiên bản ổn định (không có chữ preview) chạy trước để giữ kết quả đồng nhất
  cachedOrderedModels = [
    ...validModels.filter((m: string) => !m.includes("preview")),
    ...validModels.filter((m: string) => m.includes("preview")),
  ];

  console.log("Các model hợp lệ tìm thấy trên Key:", cachedOrderedModels);
  return cachedOrderedModels;
};

export const generateWithAutoFallback = async (parts: any[]) => {
  const ordered = await getAvailableFlashProModels();
  let lastError: any;

  for (const modelName of ordered) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`Đang gọi ${modelName} (lần ${attempt})...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0,
          },
        });
        return await model.generateContent(parts);
      } catch (err: any) {
        lastError = err;
        console.warn(`Lỗi ở ${modelName}: ${err.message?.slice(0, 100)}`);
        if (err.message?.includes("503") && attempt === 1) {
          await sleep(1500);
          continue;
        }
        break;
      }
    }
  }

  throw lastError;
};
