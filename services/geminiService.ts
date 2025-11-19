import { GoogleGenAI } from "@google/genai";

// ตรวจสอบ API Key จาก environment variable
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

/**
 * ส่งรูปภาพไปยัง Gemini เพื่ออ่านป้ายทะเบียนรถ
 * @param base64Image ข้อมูลรูปภาพในรูปแบบ Base64
 * @returns หมายเลขทะเบียนรถที่อ่านได้
 */
export const analyzeLicensePlate = async (base64Image: string): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key missing. Returning mock data or failing gracefully.");
    return "";
  }

  try {
    // ตัด header "data:image/jpeg;base64," ออกถ้ามี
    const cleanBase64 = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    const model = 'gemini-2.5-flash'; // ใช้ Flash เพื่อความเร็ว
    
    const prompt = `
      คุณคือระบบ AI สำหรับอ่านป้ายทะเบียนรถยนต์ไทย
      
      หน้าที่ของคุณ:
      1. ดูรูปภาพที่ส่งไป
      2. มองหาป้ายทะเบียนรถ
      3. อ่านตัวอักษรและตัวเลขบนป้ายทะเบียน
      4. ส่งคืนเฉพาะข้อความทะเบียนรถเท่านั้น (ไม่ต้องมีคำอธิบายอื่น)
      5. ถ้ามีชื่อจังหวัด ให้เว้นวรรคแล้วตามด้วยชื่อจังหวัด
      
      ตัวอย่าง output: 1กข 1234 กรุงเทพมหานคร
      
      ถ้าอ่านไม่ออก ให้ตอบว่า "UNKNOWN"
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg', // สมมติว่าเป็น jpeg จากกล้องมือถือ
              data: cleanBase64
            }
          }
        ]
      }
    });

    const text = response.text?.trim();
    return text === "UNKNOWN" ? "" : text || "";

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("ไม่สามารถเชื่อมต่อกับระบบ AI ได้ในขณะนี้");
  }
};