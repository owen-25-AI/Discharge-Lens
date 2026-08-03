# Discharge Lens 🔍

**Tech for Humanity | Katy Youth Hacks 2026**
*Translating complex medical discharge papers into clear, actionable, and accessible steps for patients worldwide.*

---

## 1. The Problem

Hospital discharge instructions are critically important but structurally broken: they are written in dense medical jargon by exhausted clinicians for equally exhausted, stressed patients. The analytical tradeoff we identified is between *clinical precision* (protecting the hospital from liability) and *patient comprehension* (preventing readmission). When a refugee or non-native speaker receives a 5-page printout filled with acronyms, they don't just misunderstand it—they ignore it, leading directly to medication errors and preventable hospital readmissions.

## 2. Who It's For

**Primary Audience:**
- Patients and family caregivers in the immediate, high-stress window post-discharge.
- Non-native English speakers, refugees, and immigrants seeking medical treatment in foreign healthcare systems.
- Individuals with low health literacy who struggle with complex clinical instructions.

**Secondary Audience:**
- Care teams and clinicians who want to ensure their patients actually retain and follow post-care instructions safely, reducing readmission metrics.

## 3. How It Works (User Flow)

The application is built for a zero-friction experience:
- **Screen 1: The Upload / Capture.** The user drops a PDF, pastes text, or uses the live webcam tab to capture a photo of their discharge papers. They can optionally select their native language (e.g., German, Spanish, Arabic) and input known allergies.
- **Screen 2: The Analysis.** A loading state indicates AI processing. (Behind the scenes, the data is routed through our edge function to Gemini 3.5 Flash).
- **Screen 3: The 2050 Cyber Healthcare Dashboard.**
  - **Summary Tab:** Displays a heavily simplified, jargon-free summary of their condition, accompanied by a visual checklist of actions. Includes a native Text-To-Speech (TTS) "Read Aloud" button for accessibility.
  - **Medications Tab:** A visual timeline of when to take what, including automated safety checks against the user's provided allergies.
  - **Details Tab:** A structured breakdown of doctor instructions, follow-up appointments, and critical "red flag" warnings that necessitate emergency care.
- **Export:** Users can generate a local PDF, share via WhatsApp, or instantly download an `.ics` file to add medication reminders directly to their calendar.

## 4. Architecture & Privacy Design

Medical data is highly sensitive. We made the deliberate architectural decision to build an application **designed around compliance, not just claiming it.**
- **No Persistent Storage:** We do not store patient documents or AI outputs in a database. Data exists ephemerally in memory during transit.
- **Client-Side Processing Bias:** Document parsing happens locally where possible. 
- **Single Serverless Transit Point:** The parsed text is sent through a single, ephemeral Supabase Edge Function to the Gemini API. There are no intermediary third-party analytics trackers, databases, or logs that persist Protected Health Information (PHI).

## 5. Tech Stack & Rationale

- **Frontend:** React + TypeScript + Vite 
  *(Rationale: Vite provides rapid HMR for hackathon speed, while React allows for a highly interactive, state-heavy dashboard without page reloads).*
- **Styling:** Vanilla CSS + Tailwind CSS + Framer Motion
  *(Rationale: Tailwind handles responsive grid layouts rapidly, while custom CSS and Framer Motion provide the premium glassmorphism/neon aesthetic and staggered micro-animations).*
- **Backend / Transit:** Supabase Edge Functions (Deno)
  *(Rationale: Edge functions allow us to securely hide the Gemini API key and execute code globally with zero cold starts, all without spinning up or managing a traditional Node.js server).*
- **AI / LLM:** Google Gemini 3.5 Flash (via RAG constraints)
  *(Rationale: Chosen for its massive context window (crucial for long medical PDFs) and native multi-language translation capabilities, outperforming competitors in speed for real-time analysis).*

## 6. Setup & Running Locally

This project uses Vite and requires a Supabase instance for the Edge Functions.

1. **Clone & Install:**
   ```bash
   git clone <repo-url>
   cd discharge-lens
   npm install
   ```
2. **Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:4560`.

*(Note: To run the AI analysis locally, you must link your Supabase CLI to your project and deploy the edge functions using `npx supabase functions deploy --no-verify-jwt`).*

## 7. Known Limitations & Production Roadmap

This is a hackathon prototype built in 24 hours. A true production version would require:
1. **HIPAA/GDPR Auditing:** While designed for privacy, true compliance requires BAA (Business Associate Agreements) with the LLM provider (Google Cloud) and rigorous penetration testing.
2. **Clinical Validations & Hallucination Guardrails:** LLMs can hallucinate. A production version would require a strict RAG architecture cross-referencing a verified medical ontology (like SNOMED CT) and prominent UI disclaimers requiring clinical verification.
3. **Advanced OCR:** Integrating enterprise-grade OCR (e.g., Google Cloud Vision or AWS Textract) to perfectly digitize crumpled, handwritten, or poorly lit discharge photographs.
4. **Offline Mode:** Adding PWA (Progressive Web App) support so patients can refer back to their simplified instructions in areas with poor cellular reception (like hospital basements or remote areas).
