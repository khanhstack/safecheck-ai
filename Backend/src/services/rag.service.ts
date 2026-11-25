import pool from "../config/db";
import { RowDataPacket } from "mysql2";

export const getKnowledgeContext = async (): Promise<string> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM ingredient_knowledge",
    );

    if (!rows || rows.length === 0) {
      return "Chưa có dữ liệu hoạt chất tham chiếu trong kho tri thức.";
    }

    return rows.map((item) => JSON.stringify(item)).join("\n");
  } catch (error) {
    console.error("Lỗi đọc kho tri thức:", error);
    return "Sử dụng kiến thức y dược chuẩn xác để đánh giá.";
  }
};
