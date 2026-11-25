import pool from "../config/db";
import { RowDataPacket } from "mysql2";

export interface HealthProfile {
  session_id: string;
  skin_type: string;
  allergies: string;
  medical_conditions: string;
  current_medications: string;
}

export const getProfileBySession = async (sessionId: string) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM health_profiles WHERE session_id = ?",
    [sessionId],
  );
  return rows[0] || null;
};

export const upsertProfile = async (data: HealthProfile) => {
  const {
    session_id,
    skin_type,
    allergies,
    medical_conditions,
    current_medications,
  } = data;
  await pool.query(
    `INSERT INTO health_profiles (session_id, skin_type, allergies, medical_conditions, current_medications)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       skin_type = VALUES(skin_type),
       allergies = VALUES(allergies),
       medical_conditions = VALUES(medical_conditions),
       current_medications = VALUES(current_medications)`,
    [session_id, skin_type, allergies, medical_conditions, current_medications],
  );
  return { success: true };
};
