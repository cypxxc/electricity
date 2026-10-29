# ระบบรายงานและวิเคราะห์ค่าใช้จ่ายค่าไฟฟ้า (Electricity Expenditure Analytics System)
### สำนักงานเขตสุขภาพที่ 7 &bull; กระทรวงสาธารณสุข

ระบบสารสนเทศเว็บแอปพลิเคชันสำหรับติดตาม วิเคราะห์ และตรวจสอบแนวโน้มการเบิกจ่ายค่าใช้จ่ายค่าไฟฟ้าเฉพาะอาคารสำนักงานเขตสุขภาพที่ 7 ตามระบบปีงบประมาณไทย (1 ตุลาคม – 30 กันยายน) รองรับการแสดงผลเชิงสถิติขั้นสูง การตรวจจับจุดผิดปกติ และการบริหารจัดการข้อมูลครบวงจร พร้อมระบบ Deploy อัตโนมัติผ่าน Docker

---

## 🌟 จุดเด่นและฟังก์ชันการทำงานหลัก (Key Features)

1. **แดชบอร์ดติดตามและวิเคราะห์ภาพรวม (Executive Analytics Dashboard)**
   - สรุปตัวชี้วัดสำคัญ (KPIs) แบบไดนามิก: ยอดรวมประวัติศาสตร์, ค่าใช้จ่ายเฉลี่ยต่อเดือน, ยอดเบิกจ่ายปีงบประมาณล่าสุด พร้อมอัตราการเปลี่ยนแปลงเมื่อเทียบกับปีงบประมาณก่อนหน้า (YoY)
   - แถบตัวกรองช่วงปีงบประมาณ (Segmented Period Selector) อัปเดตข้อมูลทุกส่วนบนหน้าจอให้สอดคล้องกันทันที
   - บทสรุปแนวโน้มเชิงภาษาธรรมชาติ (Data-Driven Narrative) อธิบายทิศทางการใช้จ่ายโดยอัตโนมัติ

2. **กราฟวิเคราะห์แนวโน้มอัจฉริยะ (Electricity Expenditure Explorer)**
   - **แสดงยอดเงินบนจุดกราฟตลอดเวลา (Permanently Displayed Data Labels):** แสดงตัวเลขยอดเงินประจำเดือนกำกับอยู่เหนือจุดพิกัดกราฟในรูปป้ายกำกับ (Badge Pill) พร้อมเข็มชี้หมุดตำแหน่ง เพื่อให้อ่านข้อมูลง่ายโดยไม่ต้องเลื่อนเมาส์ชี้
   - **รองรับ 3 โหมดการวิเคราะห์:**
     - **รายเดือน (Monthly Trend):** ดูกราฟพื้นที่ (Area Chart) รายเดือนของปีที่เลือก หรือดูภาพรวมต่อเนื่องทุกปี
     - **รายปี (Yearly Trend):** ดูกราฟแท่ง (Bar Chart) เปรียบเทียบยอดรวมและค่าเฉลี่ยของแต่ละปีงบประมาณ
     - **เปรียบเทียบข้ามปี (YoY Comparison):** กราฟแท่งคู่และเส้นคู่เปรียบเทียบเดือนต่อเดือนระหว่างปีงบประมาณปัจจุบันกับปีก่อนหน้า

3. **ระบบสถิติและการตรวจจับความผิดปกติ (Statistical Anomaly Detection)**
   - ตรวจจับงวดการใช้จ่ายที่มีค่าเบี่ยงเบนสูงผิดปกติทางสถิติด้วย **Z-Score (+2.0σ ขึ้นไป)** พร้อมระบุสถานะและสามารถคลิกดูรายละเอียดเชิงลึก (Anomaly Inspector Modal)

4. **ตารางแสดงข้อมูลรายเดือนและรายปี (Data Matrix & Cross-Tab Table)**
   - สลับดูข้อมูลได้ทั้ง **ระบบปีงบประมาณไทย (ต.ค. - ก.ย.)** และ **ระบบปีปฏิทิน (ม.ค. - ธ.ค.)**
   - แสดงยอดรวม ยอดเฉลี่ย และไฮไลต์งวดที่ค่าใช้จ่ายพุ่งสูงผิดปกติ

5. **ระบบส่งออกข้อมูล (Comprehensive Exporting)**
   - ส่งออกข้อมูลเป็น **Excel (.xlsx)** จัดรูปแบบสวยงาม พร้อมสรุป KPI และสถิติ
   - ส่งออกข้อมูลเป็น **CSV (.csv)** ปลอดภัยจาก CSV Formula Injection
   - ส่งออกข้อมูลเป็น **JSON (.json)** สำหรับงานวิเคราะห์ต่อยอด

6. **ระบบบริหารจัดการข้อมูล (Admin Back-Office)**
   - ระบบยืนยันตัวตน (Authentication) ปลอดภัยด้วย Signed Session Cookie (JWT) และระบบจำกัดจำนวนครั้งการล็อกอิน (Rate Limiting)
   - ตารางจัดการข้อมูล (Records Ledger): ค้นหา, กรองตามปี, เรียงลำดับ, แบ่งหน้า (Pagination)
   - เพิ่ม แก้ไข และลบข้อมูลการเบิกจ่ายค่าไฟฟ้าแต่ละงวด
   - **ระบบนำเข้าข้อมูล (Excel/CSV Import):** รองรับการอัปโหลดไฟล์สรุปค่าไฟฟ้า ตรวจสอบความถูกต้องและแจ้งเตือนข้อผิดพลาดก่อนบันทึก

7. **โครงสร้างสถาปัตยกรรมยืดหยุ่นรองรับอนาคต (Future-Proof Design)**
   - ปลดล็อกการ Hardcode ปีงบประมาณ ระบบจะคำนวณและสร้างตัวเลือกปี 2570, 2571... โดยอัตโนมัติตามข้อมูลที่มีอยู่ในฐานข้อมูล

---

## 🛠️ สถาปัตยกรรมและเทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend & Full-Stack:** [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Build Engine & Runtime:** [Turbopack](https://turbo.build/pack) + [Bun](https://bun.sh/)
- **UI & Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide React Icons](https://lucide.dev/)
- **Data Visualization:** [Recharts 3](https://recharts.org/)
- **Database:** [PostgreSQL 17](https://www.postgresql.org/)
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Data Processing:** [SheetJS (xlsx)](https://sheetjs.com/) + [Zod Validation](https://zod.dev/)
- **Authentication & Security:** [JOSE (JWT)](https://github.com/panva/jose) + HTTP Security Headers
- **Containerization:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) (Multi-stage Minimal Build)

---

## 🚀 คู่มือการติดตั้งและเริ่มต้นใช้งาน (Installation Guide)

ท่านสามารถเลือกวิธีการติดตั้งและรันระบบได้ **2 รูปแบบ** ตามความสะดวก:
1. **[แบบที่ 1: ติดตั้งและรันบนเครื่องคอมพิวเตอร์โดยตรง (Local Development ด้วย Bun)](#-แบบที่-1-ติดตั้งและรันบนเครื่องคอมพิวเตอร์โดยตรง-local-development-ด้วย-bun)** — *แนะนำสำหรับนักพัฒนา หรือผู้ที่ต้องการแก้ไขโค้ดและรันบนเครื่องตนเองแบบละเอียดทุกขั้นตอน*
2. **[แบบที่ 2: ติดตั้งและรันอัตโนมัติผ่าน Docker Compose](#-แบบที่-2-ติดตั้งและรันอัตโนมัติผ่าน-docker-compose-one-click-deployment)** — *แนะนำสำหรับเซิร์ฟเวอร์ หรือผู้ที่ต้องการเปิดใช้งานทันทีด้วยคำสั่งเดียวโดยไม่ต้องติดตั้งเครื่องมืออื่นแยก*

---

### 💻 แบบที่ 1: ติดตั้งและรันบนเครื่องคอมพิวเตอร์โดยตรง (Local Development ด้วย Bun)

คู่มือนี้จะอธิบายตั้งแต่ขั้นตอนการดาวน์โหลดไฟล์, แตกไฟล์ ZIP, ติดตั้งเครื่องมือ Bun, เชื่อมต่อฐานข้อมูล, นำเข้าข้อมูล ไปจนถึงเปิดระบบใช้งานได้สำเร็จ:

#### 📌 สิ่งที่ต้องมีในเครื่อง (Prerequisites)
- ระบบปฏิบัติการ: Windows 10/11, macOS หรือ Linux
- เบราว์เซอร์: Google Chrome, Microsoft Edge, Safari หรือ Firefox

---

#### ขั้นตอนที่ 1: ดาวน์โหลดโปรเจกต์ (Download Source Code)
สามารถเลือกได้ **2 วิธี**:

* **วิธี A (สำหรับผู้ใช้ทั่วไป - ดาวน์โหลดไฟล์ ZIP):**
  1. เข้าไปที่หน้า GitHub Repository ของโปรเจกต์
  2. คลิกที่ปุ่มสีเขียว **`<> Code`** มุมขวาบน
  3. เลือกคลิก **`Download ZIP`**
  4. เมื่อดาวน์โหลดเสร็จสิ้น ให้คลิกขวาที่ไฟล์ `.zip` แล้วเลือก **`Extract All...`** (แตกไฟล์ทั้งหมด)
  5. วางโฟลเดอร์โปรเจกต์ไว้ในตำแหน่งที่ต้องการ เช่น `C:\voltage` หรือ `D:\voltage\my-bun-app`

* **วิธี B (สำหรับผู้ที่มี Git - Clone Repository):**
  เปิด Terminal หรือ PowerShell แล้วพิมพ์:
  ```bash
  git clone https://github.com/cypxxc/voltage.git
  cd voltage
  ```

---

#### ขั้นตอนที่ 2: ติดตั้ง Bun Runtime (JavaScript Engine & Package Manager)
โปรเจกต์นี้ใช้ **Bun** ซึ่งมีความเร็วในการประมวลผลและการทำงานสูงมาก

* **สำหรับระบบปฏิบัติการ Windows:**
  1. เปิด **PowerShell** (กดปุ่ม `Windows + X` แล้วเลือก Terminal หรือ PowerShell)
  2. รันคำสั่งด้านล่างนี้:
     ```powershell
     powershell -c "irm bun.sh/install.ps1 | iex"
     ```
  3. เมื่อติดตั้งเสร็จ ให้ **ปิดแล้วเปิด PowerShell ใหม่** 1 ครั้ง เพื่อให้ระบบโหลด Environment PATH

* **สำหรับระบบปฏิบัติการ macOS / Linux:**
  1. เปิด **Terminal** แล้วรันคำสั่ง:
     ```bash
     curl -fsSL https://bun.sh/install | bash
     ```
  2. รีโหลด Shell configuration หรือเปิดหน้าต่าง Terminal ใหม่

* **ตรวจสอบว่าติดตั้ง Bun สำเร็จหรือไม่:**
  พิมพ์คำสั่ง:
  ```bash
  bun --version
  ```
  *(ถ้าขึ้นหมายเลขเวอร์ชัน เช่น `1.1.x` หรือ `1.3.x` แปลว่าพร้อมใช้งานเรียบร้อยแล้ว)*

---

#### ขั้นตอนที่ 3: เปิด Terminal / PowerShell เข้าสู่โฟลเดอร์โปรเจกต์
1. เข้าไปยังโฟลเดอร์โปรเจกต์ที่แตกไฟล์ไว้ในขั้นตอนที่ 1
2. **ทางลัดบน Windows:** กดคลิกขวาที่พื้นที่ว่างในโฟลเดอร์ แล้วเลือก **"Open in Terminal"** หรือเปิด PowerShell แล้วสั่ง `cd` ไปยังโฟลเดอร์:
   ```powershell
   cd D:\voltage\my-bun-app
   ```

---

#### ขั้นตอนที่ 4: จัดเตรียมฐานข้อมูล PostgreSQL
ระบบจำเป็นต้องมีฐานข้อมูล **PostgreSQL** (เวอร์ชัน 14–17) โดยเลือกได้ 2 ทาง:

* **ทางเลือกที่ 4.1 (ง่ายที่สุด - ใช้ Docker เปิดเฉพาะฐานข้อมูล):**
  หากเครื่องมี Docker Desktop อยู่แล้ว สามารถเปิดเฉพาะ Database ด้วยคำสั่ง:
  ```bash
  docker compose up -d postgres
  ```

* **ทางเลือกที่ 4.2 (ติดตั้ง PostgreSQL ลงในเครื่องคอมพิวเตอร์โดยตรง):**
  1. ดาวน์โหลดตัวติดตั้ง PostgreSQL จากเว็บไซต์หลัก: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
  2. ติดตั้งตามขั้นตอนปกติ กำหนดรหัสผ่านของ Superuser `postgres` (เช่น `postgrespassword`)
  3. เปิดโปรแกรม **pgAdmin** หรือ **psql** แล้วสร้างฐานข้อมูลใหม่ชื่อ:
     ```sql
     CREATE DATABASE electricity_db;
     ```

---

#### ขั้นตอนที่ 5: ติดตั้ง Dependencies และ Libraries ของโปรเจกต์
ในโฟลเดอร์โปรเจกต์ ให้รันคำสั่ง:
```bash
bun install
```
*(ระบบจะดาวน์โหลดแพ็กเกจทั้งหมด เช่น Next.js 16, React 19, Tailwind CSS, Recharts, Drizzle ORM ให้อัตโนมัติในเวลาเพียงไม่กี่วินาที)*

---

#### ขั้นตอนที่ 6: สร้างและตั้งค่าไฟล์ Environment Variables (`.env.local`)
1. ทำการคัดลอกไฟล์ต้นแบบ `.env.example` ไปเป็น `.env.local`:
   * **บน Windows PowerShell:**
     ```powershell
     copy .env.example .env.local
     ```
   * **บน macOS / Linux:**
     ```bash
     cp .env.example .env.local
     ```

2. เปิดไฟล์ `.env.local` ด้วยโปรแกรมแก้ไขข้อความ (เช่น VS Code หรือ Notepad) เพื่อตรวจสอบหรือแก้ไขการตั้งค่า:
   ```ini
   # การเชื่อมต่อฐานข้อมูล PostgreSQL บนเครื่อง localhost
   DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/electricity_db

   # คีย์สำหรับเข้ารหัส Session Token (JWT)
   JWT_SECRET=super-secret-jwt-key-min-32-chars-long-12345

   # ข้อมูลบัญชีผู้ดูแลระบบเริ่มต้น
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=adminpassword123
   ```
   *(หมายเหตุ: หากท่านตั้งรหัสผ่าน PostgreSQL ในขั้นตอนที่ 4 แตกต่างไปจากนี้ ให้แก้ไขตรงส่วน `postgrespassword` ให้ตรงกับรหัสผ่านของท่าน)*

---

#### ขั้นตอนที่ 7: สร้างตารางและนำเข้าข้อมูลเริ่มต้น (Migration & Seeding)

1. **สร้างตารางในฐานข้อมูล (Push Schema):**
   ```bash
   bun run db:push
   ```
   *(คำสั่งนี้จะเชื่อมต่อกับ PostgreSQL และสร้างตาราง `electricity_records` และ `users` ตามสคีมา)*

2. **นำเข้าข้อมูลประวัติศาสตร์จริง 84 งวด (ปีงบ 2563–2569) พร้อมสร้าง User Admin:**
   ```bash
   bun run seed
   ```
   *(ระบบจะอ่านข้อมูลจากไฟล์ Excel `สรุปค่าไฟฟ้า 62-69.xlsx` และบันทึกลงฐานข้อมูล พร้อมสร้างบัญชีผู้ดูแลระบบ `admin`)*

3. **(ทางเลือกเสริม) นำเข้าข้อมูลจำลอง 2 ปีใหม่ (ปี พ.ศ. 2570 และ 2571 ครบทุกเดือน):**
   หากต้องการทดสอบระบบโดยมีข้อมูลเพิ่มเติมอีก 24 งวด:
   ```bash
   bun run scripts/seed_mock_2years.ts
   ```

---

#### ขั้นตอนที่ 8: เริ่มเปิดใช้งานเว็บแอปพลิเคชัน (Start Development Server)
รันคำสั่งเปิดเซิร์ฟเวอร์:
```bash
bun run dev
```

เมื่อหน้าต่างขึ้นข้อความ:
```text
▲ Next.js 16.4.3 (Turbopack)
- Local: http://localhost:3000
✓ Ready in ...ms
```

สามารถเปิด Web Browser แล้วเข้าใช้งานได้ทันที:
* 📊 **หน้ารายงานแดชบอร์ดหลัก (ผู้ใช้ทั่วไป):**
  👉 [http://localhost:3000](http://localhost:3000)
* ⚙️ **หน้าระบบบริหารจัดการข้อมูล (Admin Back-Office):**
  👉 [http://localhost:3000/admin](http://localhost:3000/admin)
  - **Username:** `admin`
  - **Password:** `adminpassword123`

---

#### ขั้นตอนที่ 9: คำสั่งสำหรับทดสอบและตรวจสอบความพร้อมของระบบ
* **รันชุดทดสอบคำนวณสถิติและปีงบประมาณ (Unit Tests):**
  ```bash
  bun test
  ```
  *(ทดสอบตรรกะปีงบประมาณไทย, 2-Sigma Outlier, อัตรา MoM/YoY ทั้งหมด 18 รายการ)*

* **ทดสอบคอมไพล์ระบบแบบ Production Build:**
  ```bash
  bun run build
  ```

---

### 🐳 แบบที่ 2: ติดตั้งและรันอัตโนมัติผ่าน Docker Compose (One-Click Deployment)

วิธีนี้เหมาะสำหรับผู้ที่มี **Docker Desktop** อยู่แล้ว หรือนำขึ้น Server เพราะ Docker จะจัดการติดตั้งทั้ง **เว็บแอปพลิเคชัน**, **ฐานข้อมูล PostgreSQL 17**, และ **รัน Script นำเข้าข้อมูล 84 งวด + Admin** ให้เสร็จสรรพในคำสั่งเดียว

#### ขั้นตอนการรันผ่าน Docker:
1. **คัดลอกไฟล์ Environment:**
   ```bash
   # Windows PowerShell
   copy .env.example .env

   # Linux / macOS
   cp .env.example .env
   ```

2. **สั่ง Build และเปิดระบบทั้งหมดในเบื้องหลัง:**
   ```bash
   docker compose up -d --build
   ```

3. **เข้าใช้งานระบบ:**
   - หน้ารายงานแดชบอร์ด: [http://localhost:3000](http://localhost:3000)
   - หน้า Admin: [http://localhost:3000/admin](http://localhost:3000/admin) (User: `admin` / Pass: `adminpassword123`)

---

## 💻 คำสั่ง Docker Compose ที่เป็นประโยชน์ในการดูแลระบบ

| การทำงาน | คำสั่ง |
| :--- | :--- |
| **ตรวจสอบสถานะ Container** | `docker compose ps` |
| **ดูบันทึกการทำงานสด (Live Logs)** | `docker compose logs -f` |
| **ดู Logs เฉพาะแอปพลิเคชัน** | `docker compose logs -f app` |
| **ดู Logs เฉพาะฐานข้อมูล** | `docker compose logs -f postgres` |
| **หยุดการทำงานระบบชั่วคราว** | `docker compose stop` |
| **เปิดระบบที่หยุดไว้กลับขึ้นมา** | `docker compose start` |
| **รีสตาร์ทระบบทั้งหมด** | `docker compose restart` |
| **ปิดระบบและลบ Container ออก** | `docker compose down` |
| **ปิดระบบพร้อมล้าง Volume ข้อมูลทั้งหมด** | `docker compose down -v` *(คำเตือน: ข้อมูลใน DB จะถูกลบ)* |
| **รันคำสั่ง Seed ข้อมูลใหม่เข้าไปในแอป** | `docker compose exec app bun run seed` |

---

## 🔒 แนวทางปฏิบัติด้านความปลอดภัยสำหรับ Production (Production Checklist)

ก่อนนำระบบขึ้นใช้งานจริงในสภาพแวดล้อม Production แนะนำให้ปรับแต่งการตั้งค่าดังนี้:

1. **เปลี่ยน `JWT_SECRET` เป็นคีย์เฉพาะที่มีความปลอดภัยสูง:**
   สุ่มคีย์ Base64 ขนาดยาวอย่างน้อย 32 ตัวอักษร เช่น:
   ```bash
   openssl rand -base64 32
   ```
   นำคีย์ที่ได้ไปใส่ในตัวแปร `JWT_SECRET` ในไฟล์ `.env`

2. **เปลี่ยนรหัสผ่านผู้ดูแลระบบ (`ADMIN_PASSWORD`):**
   เปลี่ยนรหัสผ่านเริ่มต้นจาก `adminpassword123` เป็นรหัสผ่านที่มีความซับซ้อน

3. **การสำรองข้อมูลฐานข้อมูล (Database Backup):**
   สามารถสั่ง Dump ข้อมูล PostgreSQL จาก Docker ออกมาเป็นไฟล์ SQL ได้ตลอดเวลา:
   ```bash
   docker exec electricity_db pg_dump -U postgres -d electricity_db > backup_$(date +%Y%m%d).sql
   ```
   และกู้คืนข้อมูลด้วยคำสั่ง:
   ```bash
   docker exec -i electricity_db psql -U postgres -d electricity_db < backup_file.sql
   ```

4. **การเชื่อมต่อผ่าน HTTPS / Reverse Proxy:**
   แนะนำให้นำ Nginx, Traefik, Caddy หรือ Cloudflare มาเป็น Reverse Proxy ข้างหน้าพอร์ต 3000 เพื่อจัดการ SSL/TLS Certificate และ Force HTTPS

---

## 📁 โครงสร้างโฟลเดอร์ของโปรเจกต์ (Project Structure)

```text
my-bun-app/
├── app/                              # Next.js App Router (Routes & Server Pages)
│   ├── (auth)/login/                 # หน้าล็อกอินเข้าสู่ระบบ Admin
│   ├── admin/                        # หน้าระบบจัดการข้อมูล บันทึก และ Import
│   ├── api/                          # Backend API Routes (Export, Import)
│   ├── globals.css                   # Global Stylesheet (Tailwind CSS v4)
│   ├── layout.tsx                    # Root Layout Template
│   └── page.tsx                      # หน้ารายงานสรุปแดชบอร์ดหลัก
├── components/                       # React UI Components
│   ├── admin/                        # คอมโพเนนต์หน้า Admin (Table, Modals, Import)
│   ├── dashboard/                    # คอมโพเนนต์แดชบอร์ด (Charts, KPIs, Matrix)
│   │   ├── expenditure-trend-explorer.tsx # กราฟแนวโน้มพร้อมป้ายยอดเงินประจำเดือน
│   │   ├── period-selector.tsx       # แถบเลือกปีงบประมาณ
│   │   ├── kpi-cards.tsx             # การ์ดสรุปตัวชี้วัดทางการเงิน
│   │   ├── data-matrix-table.tsx     # ตาราง Matrix รายเดือนและรายปีงบประมาณ
│   │   ├── anomaly-modal.tsx         # ป๊อปอัปตรวจสอบค่างวดผิดปกติทางสถิติ
│   │   └── export-dropdown.tsx       # เมนูส่งออกข้อมูล Excel / CSV / JSON
│   └── navbar.tsx                    # เมนูส่วนบนของระบบ
├── lib/                              # ฟังก์ชันและเซอร์วิสส่วนกลาง
│   ├── auth/                         # ระบบ JWT Session และ Cookie Management
│   ├── db/                           # Drizzle ORM Schema และ PostgreSQL Pool
│   ├── services/                     # Analytics Engine, Export/Import Services
│   ├── utils/                        # ฟังก์ชันคำนวณสถิติและคณิตศาสตร์
│   └── validations/                  # Zod Schemas ตรวจสอบความถูกต้องของข้อมูล
├── scripts/                          # สคริปต์จัดการระบบ (Database Seeding)
├── tests/                            # ชุดทดสอบ Consistency และ Performance
├── init.sql                          # สคริปต์ SQL ตั้งต้นสำหรับสร้าง DB + 84 งวด
├── Dockerfile                        # Multi-stage Docker Build (Alpine Standalone)
├── docker-compose.yml                # Docker Compose Configuration
├── .env.example                      # Template ไฟล์คอนฟิกตัวแปรระบบ
└── README.md                         # เอกสารคู่มือระบบ
```

---

## 📄 ลิขสิทธิ์และการสนับสนุน

ระบบนี้พัฒนาขึ้นเพื่อสนับสนุนการดำเนินงานของ **สำนักงานเขตสุขภาพที่ 7 กระทรวงสาธารณสุข**  
หากมีข้อสงสัยหรือพบปัญหาในการติดตั้งและการใช้งาน สามารถประสานงานกับทีมผู้พัฒนาระบบได้ทันทีครับ
