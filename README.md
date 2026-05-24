<div align="center">
  <img width="120" src="public/regenerated_image_1777458964528.png" alt="Aegis GRC Logo" />
  <h1>Aegis GRC Platform</h1>
  <p><strong>Enterprise Governance, Risk & Compliance — Powered by AI</strong></p>
</div>

---

## რა არის Aegis GRC?

**Aegis GRC** არის თანამედროვე, AI-ინტეგრირებული Governance, Risk & Compliance (GRC) პლატფორმა, რომელიც შექმნილია კიბერუსაფრთხოების გუნდებისა და საწარმოებისათვის. პლატფორმა NIST Cybersecurity Framework 2.0-ის სტრუქტურაზეა აგებული და ორგანიზაციებს სთავაზობს 360°-იან ხედვას მათი სარისკო, კომპლაიანსისა და აუდიტ გარემოს შესახებ.

---

## მთავარი შესაძლებლობები

### 🛡️ GRC ბირთვი
| მოდული | აღწერა |
|--------|---------|
| **Dashboard** | ყველა KPI-ის, NIST ქულების და გაფრთხილებების ცენტრალური ხედვა |
| **Risk Management** | რისკების შეფასება, პრიორიტეტიზაცია, სტატუსის თვალყური |
| **Findings** | დასკვნების (vulnerabilities, audit findings) სრული life-cycle მართვა |
| **Compliance** | NIST CSF 2.0, ISO 27001, SOC 2 ფრეიმვორქების ანალიზი და ქულა |
| **Controls & Evidence** | კონტროლების მეფინგი, მტკიცებულებათა შეგროვება |
| **Policies** | კორპორატული პოლიტიკების დოკუმენტაცია და ვერსიირება |
| **Vendors** | მესამე მხარის (TPSA) რისკის შეფასება |
| **Assets** | IT აქტივების ინვენტარი და კლასიფიკაცია |
| **BIA** | Business Impact Analysis — კრიტიკული პროცესების იმპაქტი |
| **Audit Management** | შიდა და გარე აუდიტების ორგანიზება, ნიმუშები, ანგარიშები |

### 🤖 AI ინტელექტი
- **Aegis Intelligence** — ჩაშენებული AI ასისტენტი (Google Gemini), რომელიც იცნობს თქვენი ორგანიზაციის GRC კონტექსტს
- **Slash Commands (`/`)** — სწრაფი Skill-გამოძახება: `/Risk Analyst`, `/Audit Evidence Reviewer` და სხვა
- **Starter Prompts** — ერთი კლიკით: "Summarize today's risk posture", "Which audit evidence is the weakest?" და სხვა
- **Custom Skills** — საკუთარი AI agent skill-ების შექმნა და კონფიგურაცია

### 👥 Role-Based Access Control (RBAC)
| როლი | წვდომა |
|------|---------|
| **Admin** | სრული წვდომა ყველა მოდულსა და პარამეტრებზე |
| **Auditor** | აუდიტი, AI Intelligence |
| **Compliance Lead** | კომპლაიანსი, კონტროლები, პოლიტიკები, მტკიცებულება, ნაპოვნები |
| **Risk Officer** | რისკები, ვენდორები, BIA, დავალებები, კალენდარი |
| **User** | Dashboard, დავალებები, კალენდარი, ნოტები |

### 📊 ანალიტიკა და ანგარიშები
- NIST CSF 2.0 ექვსი ფუნქციის (GOVERN, IDENTIFY, PROTECT, DETECT, RESPOND, RECOVER) ქულა და ტენდენციები
- ინტერაქტიული Recharts სქემები
- Export-ready ანგარიშები

### 🗓️ ოპერაციული ინსტრუმენტები
- **Tasks** — დავალებების სიები და სტატუსი
- **Calendar** — GRC ღონისძიებები, deadline-ები
- **Notes** — კომანდის შიდა დოკუმენტაცია
- **Connectors** — გარე სისტემებთან ინტეგრაციის ჰაბი
- **Notifications** — რეალ-დროული გაფრთხილებები

---

## ტექნიკური სტეკი

| ფენა | ტექნოლოგია |
|------|------------|
| **Frontend** | React 19, Vite 6, TypeScript, Tailwind CSS 4 |
| **Animations** | Motion (Framer Motion) |
| **Charts** | Recharts |
| **Backend** | Express.js 4, TypeScript, tsx |
| **AI** | Google Gemini API (`@google/genai`) |
| **Icons** | Lucide React |
| **State** | React useState / localStorage |

---

## სწრაფი დაწყება

### წინაპირობები
- Node.js 18+

### ინსტალაცია

```bash
npm install
```

### გარემოს ცვლადები

`.env` ფაილი (`.env.example`-ის საფუძველზე):

```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://localhost:4000
```

### გაშვება (development)

```bash
# Terminal 1 — Backend API (port 4000)
npm run server:dev

# Terminal 2 — Frontend (port 3000)
npm run dev
```

### Production build

```bash
npm run build
npm run preview
```

---

## Default მომხმარებლები (demo)

| Email | პაროლი | როლი |
|-------|--------|------|
| admin@company.com | ნებისმიერი | Admin |
| auditor@auditfirm.com | ნებისმიერი | Auditor |
| compliance@company.com | ნებისმიერი | Compliance Lead |
| risk@company.com | ნებისმიერი | Risk Officer |
| officer@company.com | ნებისმიერი | User |

---

## პროექტის სტრუქტურა

```
Aegis2.4/
├── src/
│   ├── components/
│   │   ├── ai/          # AegisIntelligenceView, AIChatAssistant
│   │   ├── auth/        # LoginView
│   │   ├── layout/      # Sidebar, Header
│   │   └── views/       # ყველა მოდულის View
│   ├── lib/             # API client, utils
│   └── rbac.ts          # Role-based access control
├── server/
│   ├── index.ts         # Express entry point (port 4000)
│   ├── data/store.ts    # In-memory data store
│   └── routes/          # risks, findings, vendors, tasks, calendar, nist, notifications
├── public/              # Static assets
└── dist/                # Production build
```

---

<div align="center">
  <sub>Built with ❤️ — Aegis GRC Platform v2.4</sub>
</div>
