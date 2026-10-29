"""
Browser-Use + LangChain / Gemini Automated User Acceptance Testing (UAT) Suite
Autonomously interacts with http://localhost:3000 using an LLM Agent,
verifying business workflows, user interface components, and reporting findings.
"""

import os
import sys
import asyncio

# Ensure stdout handles UTF-8 on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from dotenv import load_dotenv

# Load environment variables from .env.local and .env
load_dotenv('.env.local')
load_dotenv('.env')

from browser_use import Agent, ChatGoogle, BrowserSession, BrowserProfile

# Target Application URL
APP_URL = os.getenv("APP_URL", "http://localhost:3000")

async def run_browser_use_uat():
    # Detect Gemini API Key
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("\n" + "=" * 65)
        print("⚠️  NOTICE: GEMINI_API_KEY / GOOGLE_API_KEY is not set.")
        print("=" * 65)
        print("To run the full autonomous LLM agent with Browser-use, please set:")
        print("  $env:GEMINI_API_KEY='your-gemini-api-key'")
        print("or add it to your .env.local file:")
        print("  GEMINI_API_KEY=your-gemini-api-key\n")
        print("💡 NOTE: You can also run the deterministic E2E UAT suite immediately")
        print("   without needing an API key by executing:")
        print("   .\\.venv\\Scripts\\python.exe tests/uat/playwright_uat.py")
        print("=" * 65 + "\n")
        return False

    print("=" * 65)
    print("STARTING BROWSER-USE (PYTHON + LANGCHAIN/GEMINI) UAT AGENT")
    print(f"Target URL: {APP_URL}")
    print("=" * 65)

    # Initialize Gemini 3.1 Flash Lite for ultra-fast, responsive vision & action planning
    llm = ChatGoogle(
        model="gemini-3.1-flash-lite",
        api_key=api_key,
    )

    # Configure Browser Profile (headed so user can see live testing or headless)
    is_headless = os.getenv("HEADLESS", "true").lower() == "true"
    browser_profile = BrowserProfile(
        headless=is_headless,
        viewport_width=1440,
        viewport_height=900,
    )
    browser_session = BrowserSession(browser_profile=browser_profile)

    task_prompt = f"""
    You are an expert QA and User Acceptance Testing (UAT) Auditor.
    Your mission is to perform a rigorous UAT audit of the Electricity Expenditure Analytics System at {APP_URL}.

    Perform the following acceptance test scenarios step by step:

    1. [Dashboard Landing & Header]
       - Open {APP_URL}
       - Confirm the system branding "ระบบสารสนเทศวิเคราะห์ค่าใช้จ่ายค่าไฟฟ้า" and "สำนักงานเขตสุขภาพที่ 7"
       - Check the 3 KPI summary cards (ยอดรวมการใช้จ่าย, ค่าเฉลี่ย, ปีงบประมาณล่าสุด)
       
    2. [Interactive Period Selection]
       - Locate the "เลือกช่วงเวลาวิเคราะห์" period selector dropdown.
       - Select '2568' or 'ปีงบประมาณ 2568' from the dropdown.
       - Observe if KPIs update to calculate specifically for Fiscal Year 2568.
       - Click the "ล้างตัวกรอง (ดูภาพรวม)" button to verify it resets to all years.

    3. [Chart Trend Explorer]
       - Scroll to "ระบบกราฟวิเคราะห์แนวโน้มค่าใช้จ่ายไฟฟ้า".
       - Click the "โหมดกราฟ" dropdown and select "เปรียบเทียบรายเดือนระหว่างปี (Year-over-Year Comparison)".
       - Confirm that dual comparison bars appear.
       - Switch to "รายปี (Yearly Trend)" and confirm the yearly bars appear.

    4. [Data Matrix Breakdown]
       - Scroll to "ตารางแจกแจงค่าไฟฟ้ารายเดือนและรอบปี".
       - Click the "ปีปฏิทิน (ม.ค.–ธ.ค.)" button to view calendar months.
       - Click back to "ปีงบประมาณ (ต.ค.–ก.ย.)" to view statutory Thai fiscal months (Q1-Q4).

    5. [Report Export Menu]
       - Find and click the "ส่งออกข้อมูล (Export)" dropdown button.
       - Verify that the menu opens showing Excel (.xlsx) and CSV (.csv) download options.
       - Close the menu by pressing Escape or clicking outside.

    6. [Authentication Guard & Admin Verification]
       - Click "จัดการฐานข้อมูล (Admin)" in the top navigation bar.
       - Verify redirection to /login.
       - Fill username 'admin' and password 'adminpassword123', then submit.
       - Verify redirection to /admin.
       - Verify the admin records table, and check that the "เพิ่มข้อมูลใหม่" button is visible with unified styling.

    When finished, provide a clear, concise bulleted summary of each scenario and conclude whether all acceptance criteria have been MET.
    """

    agent = Agent(
        task=task_prompt,
        llm=llm,
        browser_session=browser_session,
        use_thinking=False,
        llm_timeout=120,
        step_timeout=180,
    )

    history = await agent.run(max_steps=20)
    print("\n" + "=" * 65)
    print("BROWSER-USE AGENT EXECUTION FINISHED")
    print("=" * 65)
    print(history)
    return True

if __name__ == "__main__":
    asyncio.run(run_browser_use_uat())
