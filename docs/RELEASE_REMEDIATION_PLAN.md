# แผนปฏิบัติการแก้ไขและเตรียมความพร้อมก่อน Release ฉบับสมบูรณ์ (Audited Release Remediation Plan)

> **เอกสารสำหรับ:** ระบบสารสนเทศวิเคราะห์ค่าใช้จ่ายค่าไฟฟ้า อาคารสำนักงานเขตสุขภาพที่ 7  
> **สถานะ:** ตรวจสอบความถูกต้องทางเทคนิคและอนุมัติแล้ว (Approved & Hardened)  
> **วันที่ปรับปรุงล่าสุด:** 29 ตุลาคม 2569  

---

## สารบัญ
1. [ภาพรวมสถานะระบบ (System Baseline)](#1-ภาพรวมสถานะระบบ)
2. [รายการประเด็นที่ได้รับการแก้ไขและแนวทางปฏิบัติที่ถูกต้อง](#2-รายการประเด็นที่ได้รับการแก้ไขและแนวทางปฏิบัติที่ถูกต้อง)
   - [ประเด็นที่ 1: ลบการแสดงบัญชีทดสอบออกจาก Client Bundle (แก้ไขแล้ว)](#ประเด็นที่-1-ลบการแสดงบัญชีทดสอบออกจาก-client-bundle-แก้ไขแล้ว)
   - [ประเด็นที่ 2: การสับเปลี่ยนรหัสผ่านฐานข้อมูลบน Volume เดิม (Secrets Management)](#ประเด็นที่-2-การสับเปลี่ยนรหัสผ่านฐานข้อมูลบน-volume-เดิม)
   - [ประเด็นที่ 3: Reverse Proxy Header & Secure Cookie Flag บน HTTPS](#ประเด็นที่-3-reverse-proxy-header--secure-cookie-flag-บน-https)
   - [ประเด็นที่ 4: การสเกล Rate Limiter รองรับ Multi-replica ด้วย PostgreSQL](#ประเด็นที่-4-การสเกล-rate-limiter-รองรับ-multi-replica-ด้วย-postgresql)
   - [ประเด็นที่ 5: การสร้าง Materialized View พร้อม Unique Index รองรับข้อมูลมหาศาล](#ประเด็นที่-5-การสร้าง-materialized-view-พร้อม-unique-index)
   - [ประเด็นที่ 6: นโยบายการควบคุมสิทธิ์ Export ข้อมูลและการซิงก์ UI](#ประเด็นที่-6-นโยบายการควบคุมสิทธิ์-export-ข้อมูลและการซิงก์-ui)
   - [ประเด็นที่ 7: แผนสำรองข้อมูลอัตโนมัติ (Disaster Recovery & Backup)](#ประเด็นที่-7-แผนสำรองข้อมูลอัตโนมัติ-disaster-recovery--backup)
3. [ตารางสรุปแผนงานและระดับความสำคัญ (Priority Matrix)](#3-ตารางสรุปแผนงานและระดับความสำคัญ)

---

## 1. ภาพรวมสถานะระบบ

ระบบผ่านการทดสอบรอบสุดท้ายครบถ้วน 100%:
- **Unit Tests:** 20/20 ผ่าน (ครอบคลุม Fiscal Year, YoY/MoM, UTF-8 BOM, และ Data Parsing)
- **Playwright UAT:** 7/7 Scenarios ผ่าน (ครอบคลุม Dashboard, Period Filter, Charts, Matrix, Export, Route Guard, Admin Modals)
- **Session & Cookie Flow:** ยืนยัน 6/6 ขั้นตอน (ล็อกอิน, สลับหน้า, ปิดแท็บเปิดใหม่, Auto-redirect, ป้องกันหลังออกจากระบบ)
- **Healthcheck:** Endpoint `/api/health` ใช้งานได้ (Latency 2ms)
- **Docker Containers:** `electricity_app` และ `electricity_db` รันสถานะ Healthy

---

## 2. รายการประเด็นที่ได้รับการแก้ไขและแนวทางปฏิบัติที่ถูกต้อง

### ประเด็นที่ 1: ลบการแสดงบัญชีทดสอบออกจาก Client Bundle (แก้ไขแล้ว)
* **ระดับความสำคัญ:** 🔴 **สูงมาก (Critical) — ดำเนินการแก้ไขแล้ว**
* **ไฟล์:** `components/auth/login-form.tsx`
* **ข้อแก้ไขทางเทคนิค:**
  - ลบฟังก์ชัน `handleFillDemoCredentials` และสตริง `'adminpassword123'` ออกจากโค้ดโดยสิ้นเชิง
  - ลบกล่อง UI แสดงบัญชีทดสอบออกจากหน้า Login
  - ผลลัพธ์: ตรวจสอบใน Client JavaScript Bundle ไม่มีรหัสผ่านหลุดรอดให้ดึงผ่าน DevTools ได้อีกต่อไป

---

### ประเด็นที่ 2: การสับเปลี่ยนรหัสผ่านฐานข้อมูลบน Volume เดิม
* **ระดับความสำคัญ:** 🔴 **สูงมาก (Critical สำหรับเซิร์ฟเวอร์จริง)**
* **ไฟล์:** `.env`, `docker-compose.yml`
* **ข้อเท็จจริงทางเทคนิค:**
  - ตัวแปร `POSTGRES_PASSWORD` ใน `docker-compose.yml` จะมีผลเฉพาะการสร้างฐานข้อมูลครั้งแรก (initdb) เท่านั้น
  - หากเปลี่ยนรหัสผ่านใน `.env` โดยไม่สั่งเปลี่ยนรหัสผ่านภายใน PostgreSQL Container จะทำให้ App ล็อกอินเข้าฐานข้อมูลไม่ได้ (`password authentication failed`)
* **ขั้นตอนปฏิบัติที่ถูกต้องบน Production:**
  1. สั่งเปลี่ยนรหัสผ่านของผู้ใช้ `postgres` ภายในฐานข้อมูลเดิมก่อน:
     ```bash
     docker exec -it electricity_db psql -U postgres -d electricity_db -c "ALTER USER postgres WITH PASSWORD 'รหัสผ่านใหม่ที่มีความปลอดภัยสูง';"
     ```
  2. อัปเดต `.env` ให้ตรงกัน:
     ```env
     POSTGRES_PASSWORD=รหัสผ่านใหม่ที่มีความปลอดภัยสูง
     DATABASE_URL=postgresql://postgres:รหัสผ่านใหม่ที่มีความปลอดภัยสูง@postgres:5432/electricity_db?client_encoding=utf8
     JWT_SECRET=คีย์สุ่มยาว32ตัวอักษรจากการรัน_openssl_rand_base64_32
     ```
  3. สั่ง Restart แอป: `docker compose up -d app`

---

### ประเด็นที่ 3: Reverse Proxy Header & Secure Cookie Flag บน HTTPS
* **ระดับความสำคัญ:** 🟡 **ปานกลาง (เมื่อติดตั้ง SSL/TLS)**
* **ไฟล์:** `nginx.conf`, `.env`
* **ข้อเท็จจริงทางเทคนิค:**
  - เมื่อแอปพลิเคชันรันหลัง Reverse Proxy (Nginx / Caddy / Cloudflare) ตัว Proxy ต้องส่งต่อ Header การเข้ารหัสมายัง Next.js ด้วย มิเช่นนั้น Server Action และ Cookie Flag อาจทำงานผิดพลาด
* **การตั้งค่า Nginx ที่ถูกต้อง:**
  ```nginx
  location / {
      proxy_pass http://127.0.0.1:3000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
  }
  ```
  จากนั้นตั้งค่าใน `.env`: `COOKIE_SECURE=true`

---

### ประเด็นที่ 4: การสเกล Rate Limiter รองรับ Multi-replica ด้วย PostgreSQL
* **ระดับความสำคัญ:** 🟡 **ปานกลาง (เมื่อขยายรันหลาย Container)**
* **ไฟล์:** `lib/auth/actions.ts`
* **ข้อเท็จจริงทางเทคนิค:**
  - ปัจจุบันระบบมี In-Memory Rate Limiter พร้อมระบบ Auto-eviction ซึ่งเพียงพอสำหรับเซิร์ฟเวอร์เดี่ยว (Single-node)
  - หากขยายเป็นหลายเซิร์ฟเวอร์ ไม่จำเป็นต้องติดตั้ง Redis ให้สิ้นเปลืองทรัพยากร ให้ใช้ตารางใน PostgreSQL ที่มีอยู่แล้ว:
  ```sql
  CREATE TABLE login_attempts (
      id serial PRIMARY KEY,
      username varchar(50) NOT NULL,
      ip_address varchar(45) NOT NULL,
      attempted_at timestamp with time zone DEFAULT now() NOT NULL
  );
  CREATE INDEX idx_login_attempts_lookup ON login_attempts (username, attempted_at);
  ```

---

### ประเด็นที่ 5: การสร้าง Materialized View พร้อม Unique Index
* **ระดับความสำคัญ:** 🟢 **ต่ำ (รองรับข้อมูล 20,000+ แถวในอนาคต)**
* **ไฟล์:** `lib/services/analytics.ts`
* **ข้อเท็จจริงทางเทคนิค:**
  - การสั่ง `REFRESH MATERIALIZED VIEW CONCURRENTLY` จำเป็นต้องมี **Unique Index (ที่ไม่มี WHERE clause)** เสมอ
* **คำสั่ง SQL ที่ถูกต้องสมบูรณ์:**
  ```sql
  CREATE MATERIALIZED VIEW mv_fiscal_year_kpis AS
  SELECT 
    CASE WHEN month >= 10 THEN year_be + 1 ELSE year_be END AS fy_be,
    SUM(amount) AS total_amount,
    AVG(amount) AS average_monthly,
    COUNT(*) AS recorded_months
  FROM electricity_records
  GROUP BY 1;

  -- สร้าง Unique Index บังคับสำหรับ Concurrent Refresh
  CREATE UNIQUE INDEX idx_mv_fiscal_year_kpis_fy ON mv_fiscal_year_kpis (fy_be);
  ```

---

### ประเด็นที่ 6: นโยบายการควบคุมสิทธิ์ Export ข้อมูลและการซิงก์ UI
* **ระดับความสำคัญ:** 🟢 **เชิงนโยบาย (Governance)**
* **ไฟล์:** `app/api/export/route.ts`, `app/page.tsx`
* **ข้อเท็จจริงทางเทคนิค:**
  - ปุ่ม Export บนหน้าแดชบอร์ดหลักเป็นลิงก์ดาวน์โหลดตรง `<a href="/api/export?format=xlsx">`
  - หากล็อกสิทธิ์ API ให้เป็น 401 ผู้ใช้ภายนอกที่คลิกจะดาวน์โหลดไฟล์ Error JSON แทนไฟล์ Excel
* **แนวทางแก้ไขที่สอดคล้องกัน:**
  - หากต้องการจำกัดสิทธิ์เฉพาะเจ้าหน้าที่ ให้ซ่อน `ExportDropdown` บนหน้าแรกเมื่อผู้ใช้ยังไม่ล็อกอิน:
  ```tsx
  {/* แสดงปุ่ม Export เฉพาะผู้ใช้งานที่ล็อกอินแล้ว */}
  {session && (
    <div className="flex items-center gap-2">
      <ExportDropdown />
    </div>
  )}
  ```

---

### ประเด็นที่ 7: แผนสำรองข้อมูลอัตโนมัติ (Disaster Recovery & Backup)
* **ระดับความสำคัญ:** 🔴 **สูง (Critical สำหรับการดำเนินงานจริง)**
* **สคริปต์สำรองข้อมูลรายวัน (Daily Backup Cron):**
  สร้างไฟล์ `backup.sh` และตั้งใน Crontab ให้รันทุกวันเวลา 02:00 น.:
  ```bash
  #!/bin/bash
  BACKUP_DIR="/var/backups/electricity"
  mkdir -p $BACKUP_DIR
  DATE=$(date +%Y%m%d_%H%M%S)
  docker exec electricity_db pg_dump -U postgres electricity_db | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"
  # ลบไฟล์สำรองที่เก่าเกิน 30 วัน
  find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
  ```

---

## 3. ตารางสรุปแผนงานและระดับความสำคัญ

| ลำดับ | รายการ | ระดับความสำคัญ | สถานะ / กำหนดเวลา |
|:---:|---|:---:|:---:|
| **1** | ลบบัญชีทดสอบออกจากโค้ด Login | 🔴 **Critical** | **แก้ไขเรียบร้อยแล้ว** |
| **2** | ปรับปรุงประสิทธิภาพ Batch Transaction Import | 🔴 **Critical** | **แก้ไขเรียบร้อยแล้ว** |
| **3** | รัน `ALTER USER` เปลี่ยนรหัสผ่าน DB จริง | 🔴 **Critical** | ดำเนินการบน Production Server |
| **4** | ตั้งค่า Cron สำรองข้อมูลฐานข้อมูลรายวัน | 🔴 **Critical** | ดำเนินการบน Production Server |
| **5** | ตั้งค่า Nginx Proxy Header & `COOKIE_SECURE=true` | 🟡 **Medium** | ดำเนินการเมื่อติดตั้ง Domain/SSL |
| **6** | ขยาย Rate Limiter เป็น PostgreSQL Table | 🟡 **Medium** | เมื่อขยายเป็น Multi-node |
| **7** | เพิ่ม Materialized View พร้อม Unique Index | 🟢 **Low** | เมื่อข้อมูลขยายเกิน 20,000 แถว |
| **8** | กำหนดสิทธิ์ Export พร้อมซ่อนปุ่ม UI | 🟢 **Policy** | ตามนโยบายข้อมูลเปิดของหน่วยงาน |
