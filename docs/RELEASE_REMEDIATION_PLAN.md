# แผนปฏิบัติการแก้ไขและปรับปรุงระบบก่อน Release (Production Remediation Plan)

> **เอกสารสำหรับ:** ระบบสารสนเทศวิเคราะห์ค่าใช้จ่ายค่าไฟฟ้า อาคารสำนักงานเขตสุขภาพที่ 7  
> **สถานะ:** เตรียมความพร้อมก่อนนำขึ้น Production (Pre-release Staging)  
> **วันที่จัดทำ:** 29 ตุลาคม 2569  

---

## สารบัญ
1. [ภาพรวมสถานะปัจจุบัน (Current State)](#1-ภาพรวมสถานะปัจจุบัน)
2. [รายการประเด็นที่ต้องแก้ไขและแนวทางปฏิบัติ (Action Items)](#2-รายการประเด็นที่ต้องแก้ไขและแนวทางปฏิบัติ)
   - [ประเด็นที่ 1: ปิดการแสดงบัญชีทดสอบในหน้า Login (Critical Security)](#ประเด็นที่-1-ปิดการแสดงบัญชีทดสอบในหน้า-login)
   - [ประเด็นที่ 2: สร้างและสับเปลี่ยนกุญแจความลับ (Secrets Management)](#ประเด็นที่-2-สร้างและสับเปลี่ยนกุญแจความลับ)
   - [ประเด็นที่ 3: การเปิดใช้ Secure Cookie Flag บน HTTPS (SSL/TLS Enforcement)](#ประเด็นที่-3-การเปิดใช้-secure-cookie-flag-บน-https)
   - [ประเด็นที่ 4: การสเกล Rate Limiter รองรับ Multi-replica (Future Scalability)](#ประเด็นที่-4-การสเกล-rate-limiter-รองรับ-multi-replica)
   - [ประเด็นที่ 5: การคำนวณแบบ Materialized View รองรับข้อมูลปริมาณมหาศาล](#ประเด็นที่-5-การคำนวณแบบ-materialized-view)
   - [ประเด็นที่ 6: นโยบายการควบคุมสิทธิ์ Export ข้อมูล (Governance Policy)](#ประเด็นที่-6-นโยบายการควบคุมสิทธิ์-export-ข้อมูล)
3. [ตารางสรุปแผนงานและระดับความสำคัญ (Priority Matrix)](#3-ตารางสรุปแผนงานและระดับความสำคัญ)

---

## 1. ภาพรวมสถานะปัจจุบัน

ระบบผ่านการทดสอบหลักทั้งหมดแล้ว:
- **Unit Tests:** 20/20 ผ่าน (100%)
- **Playwright UAT:** 7/7 Scenarios ผ่าน (100%)
- **UTF-8 Full System:** ฐานข้อมูล, API, Excel/CSV Export และฟอนต์ Sarabun พร้อมใช้งาน
- **Docker Containers:** `electricity_app` และ `electricity_db` รันสถานะ Healthy
- **Health Check Endpoint:** `/api/health` ใช้งานได้ (Latency ~2ms)

---

## 2. รายการประเด็นที่ต้องแก้ไขและแนวทางปฏิบัติ

### ประเด็นที่ 1: ปิดการแสดงบัญชีทดสอบในหน้า Login
* **ระดับความสำคัญ:** 🔴 **สูงมาก (Critical)**
* **ไฟล์ที่เกี่ยวข้อง:** `components/auth/login-form.tsx` (บรรทัด 110–124)
* **ปัญหา:** หน้า Login สาธารณะแสดงกล่องข้อความ `"บัญชีทดสอบ: admin"` พร้อมปุ่ม *"กรอกอัตโนมัติ"* ผู้ใช้ภายนอกสามารถคลิกเพื่อเข้าระบบได้ทันที
* **แนวทางแก้ไข:**
  1. เพิ่ม Environment Variable: `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=false`
  2. แก้ไขโค้ดใน `components/auth/login-form.tsx` ให้แสดงเฉพาะเมื่อตั้งค่าเป็น `true` เท่านั้น:
  ```tsx
  {process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS === 'true' && (
    <div className="mt-5 pt-3 border-t border-slate-200">
      {/* กล่องแสดง Demo Credentials */}
    </div>
  )}
  ```

---

### ประเด็นที่ 2: สร้างและสับเปลี่ยนกุญแจความลับ (Secrets Management)
* **ระดับความสำคัญ:** 🔴 **สูงมาก (Critical)**
* **ไฟล์ที่เกี่ยวข้อง:** `.env`, `docker-compose.yml`
* **ปัญหา:** คีย์ `JWT_SECRET` และรหัสผ่านฐานข้อมูล `POSTGRES_PASSWORD` ปัจจุบันยังเป็นค่าเริ่มต้นสำหรับช่วงพัฒนา (`super-secret-jwt-key-...` และ `postgrespassword`)
* **แนวทางแก้ไข:**
  1. สร้างกุญแจความลับใหม่ความยาว 32 bytes แบบสุ่มบน Production Server:
     ```bash
     # สร้าง JWT Secret
     openssl rand -base64 32
     # สร้างรหัสผ่านฐานข้อมูลที่มีความซับซ้อน
     openssl rand -hex 16
     ```
  2. กำหนดค่าใน `.env` ของเซิร์ฟเวอร์จริง:
     ```env
     JWT_SECRET=C8x...[คีย์สุ่มใหม่]...
     POSTGRES_PASSWORD=db_pass_...[รหัสผ่านใหม่]...
     DATABASE_URL=postgresql://postgres:db_pass_...[รหัสผ่านใหม่]@postgres:5432/electricity_db
     ```
  3. ตรวจสอบว่าไฟล์ `.env` ถูกกันไว้ใน `.gitignore` ไม่ถูก Commit เข้า Git Repository

---

### ประเด็นที่ 3: การเปิดใช้ Secure Cookie Flag บน HTTPS
* **ระดับความสำคัญ:** 🟡 **ปานกลาง (Medium)**
* **ไฟล์ที่เกี่ยวข้อง:** `lib/auth/session.ts`, `docker-compose.yml`, `.env`
* **ปัญหา:** ปัจจุบันระบบตั้ง `COOKIE_SECURE=false` เพื่อให้ทดสอบผ่าน HTTP (Localhost และ LAN IP) ได้โดยเบราว์เซอร์ไม่ทิ้ง Cookie แต่เมื่อนำขึ้น Domain ที่มี HTTPS/SSL ต้องเปิดใช้ Secure Flag เพื่อป้องกัน Man-in-the-Middle (MitM)
* **แนวทางแก้ไข:**
  1. เมื่อติดตั้ง Nginx / Cloudflare พร้อมใบรับรอง SSL เรียบร้อยแล้ว ให้ปรับค่าใน `.env`:
     ```env
     COOKIE_SECURE=true
     ```
  2. เบราว์เซอร์จะส่ง Cookie ผ่านการเชื่อมต่อที่มีการเข้ารหัส HTTPS เท่านั้น

---

### ประเด็นที่ 4: การสเกล Rate Limiter รองรับ Multi-replica
* **ระดับความสำคัญ:** 🟡 **ปานกลาง (Medium - Future Scalability)**
* **ไฟล์ที่เกี่ยวข้อง:** `lib/auth/actions.ts`
* **ปัญหา:** ระบบ Rate Limiter ปัจจุบันเก็บใน Memory (`Map<string, AttemptRecord>`) ของ Node.js process เดียว หากในอนาคตรัน Container 2 ตัวขึ้นไป (Horizontal Scaling / Load Balancer) ตัวนับจะแยกจากกัน
* **แนวทางแก้ไข:**
  1. เมื่อต้องการขยายเป็น Cluster หรือ Kubernetes ให้เปลี่ยน Storage ของ Rate Limiter เป็น **Redis**:
     ```ts
     import Redis from 'ioredis';
     const redis = new Redis(process.env.REDIS_URL);
     // นับจำนวนครั้งด้วย redis.incr(key) และตั้ง expire
     ```
  2. หรือบันทึกตาราง `login_attempts` ใน PostgreSQL โดยตรง

---

### ประเด็นที่ 5: การคำนวณแบบ Materialized View รองรับข้อมูลปริมาณมหาศาล
* **ระดับความสำคัญ:** 🟢 **ต่ำ (Low - รองรับข้อมูล 10+ ปีข้างหน้า)**
* **ไฟล์ที่เกี่ยวข้อง:** `lib/services/analytics.ts`, `lib/db/schema.ts`
* **ปัญหา:** ฟังก์ชัน `getDashboardAnalytics()` ปัจจุบันดึงทุกแถวมาคำนวณ KPI, ตารางแจกแจง, และ Anomaly ใน Memory ของ JavaScript (ข้อมูล 84 งวดใช้ RAM < 100KB, เวลาคำนวณ < 5ms) หากในอนาคตมีข้อมูลขยายเป็นหลายหมื่นระเบียน (เช่น เก็บแยกรายมิเตอร์/รายตึก) การดึงข้อมูลทั้งหมดเข้า RAM อาจกินเวลาเพิ่มขึ้น
* **แนวทางแก้ไข:**
  1. สร้าง **Materialized View** ใน PostgreSQL เพื่อ Pre-aggregate ข้อมูลรายปีงบและรายเดือน:
     ```sql
     CREATE MATERIALIZED VIEW mv_fiscal_year_kpis AS
     SELECT 
       CASE WHEN month >= 10 THEN year_be + 1 ELSE year_be END AS fy_be,
       SUM(amount) AS total_amount,
       AVG(amount) AS average_monthly,
       COUNT(*) AS recorded_months
     FROM electricity_records
     GROUP BY 1;
     ```
  2. สั่ง `REFRESH MATERIALIZED VIEW CONCURRENTLY` เมื่อมีการนำเข้าข้อมูลใหม่

---

### ประเด็นที่ 6: นโยบายการควบคุมสิทธิ์ Export ข้อมูล
* **ระดับความสำคัญ:** 🟢 **คำแนะนำเชิงนโยบาย (Governance)**
* **ไฟล์ที่เกี่ยวข้อง:** `app/api/export/route.ts`
* **ปัญหา:** ปัจจุบันปุ่ม Export (Excel/CSV) อยู่บนแดชบอร์ดหลัก ประชาชนทั่วไปสามารถดาวน์โหลดไฟล์ข้อมูลสรุปได้โดยไม่ต้องล็อกอิน
* **แนวทางแก้ไข:**
  - **กรณีที่ 1 (เป็นข้อมูลเปิดภาครัฐ):** คงไว้ตามเดิม เพื่อความโปร่งใสของข้อมูลสาธารณูปโภค
  - **กรณีที่ 2 (ต้องการจำกัดเฉพาะเจ้าหน้าที่):** เพิ่มการตรวจสอบ Session ใน `app/api/export/route.ts`:
    ```ts
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนดาวน์โหลด' }, { status: 401 });
    }
    ```

---

## 3. ตารางสรุปแผนงานและระดับความสำคัญ

| ลำดับ | รายการ | ระดับความสำคัญ | กำหนดเวลาที่ควรทำ | ผลกระทบหากไม่ทำ |
|:---:|---|:---:|:---:|---|
| **1** | ซ่อนกล่องบัญชีทดสอบในหน้า Login | 🔴 **Critical** | **ทันทีก่อน Release** | ผู้ใช้ภายนอกเข้าถึงระบบหลังบ้านได้ |
| **2** | สร้างคีย์ `JWT_SECRET` และรหัสผ่าน DB ใหม่ | 🔴 **Critical** | **ทันทีก่อน Release** | เสี่ยงถูกปลอมแปลง Session Token |
| **3** | เปิด `COOKIE_SECURE=true` เมื่อมี HTTPS | 🟡 **Medium** | **เมื่อติดตั้ง SSL** | Cookie ถูกส่งผ่านช่องทางไม่เข้ารหัส |
| **4** | ย้าย Rate Limiter ไปยัง Redis | 🟡 **Medium** | **เมื่อเริ่มรัน 2+ Replicas** | Rate limit ไม่แม่นยำเมื่อมี Load Balancer |
| **5** | สร้าง Materialized View ใน PostgreSQL | 🟢 **Low** | **เมื่อข้อมูล > 20,000 แถว** | แดชบอร์ดประมวลผลช้าลงเมื่อข้อมูลมหาศาล |
| **6** | กำหนดสิทธิ์การ Export ไฟล์รายงาน | 🟢 **Policy** | **ตามดุลยพินิจของหน่วยงาน** | ข้อมูลสรุปถูกดาวน์โหลดได้โดยบุคคลทั่วไป |
