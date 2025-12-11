# Lumi — WCAG & UI Accessibility Analyzer

A production-ready MVP that analyzes UI screenshots for WCAG compliance, accessibility issues, and provides comprehensive improvement suggestions. Built with Next.js 16, TypeScript, and a beautiful iOS-inspired design.

![Lumi Dashboard](https://img.shields.io/badge/Next.js-16.0.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### Comprehensive Analysis
- **🤖 Gemini AI Insights** - AI-powered design analysis and recommendations (NEW!)
- **WCAG Compliance** - AA/AAA contrast ratio checks
- **Color Palette Extraction** - Dominant and accent color detection
- **OCR Content Analysis** - Text extraction with Tesseract.js
- **Keyboard Accessibility** - Focus order and interactive element detection
- **Sizing & Feasibility** - 44px tap target and font size validation
- **Information Hierarchy** - Layout and structure analysis
- **Theme Suggestions** - iOS, Material Design, Fluent UI recommendations
- **Typography Analysis** - Readability and pairing suggestions
- **Target Audience Detection** - Enterprise, Education, Fintech, Creative, Youth
- **Responsiveness Check** - Image optimization and layout shift detection
- **Content Suggestions** - UX writing and clarity improvements
- **Overall Accessibility Score** - 0-100 rating with detailed breakdown

### AI-Powered Features (Gemini)
- **UI Type Detection** - Automatically identifies dashboard, landing page, mobile app, etc.
- **Design System Recognition** - Detects Material, iOS, Fluent, or custom patterns
- **Strengths & Weaknesses** - AI highlights what works and what doesn't
- **Actionable Recommendations** - Specific, prioritized improvement suggestions
- **Color Scheme Analysis** - Deep dive into palette effectiveness
- **Layout & Hierarchy Insights** - AI assessment of information architecture
- **UX Quality Score** - AI-generated 0-100 rating

### Beautiful Dashboard
- **iOS-Inspired Design** - Rounded corners, soft shadows, glassy surfaces
- **Light & Dark Mode** - Full theme support with smooth transitions
- **Bento Grid Layout** - Responsive card-based dashboard
- **Keyboard Accessible** - Full navigation support
- **Reduced Motion Support** - Respects user preferences

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/CR-8/animated-ui.git
cd animated-ui
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Get Gemini API key (Optional but recommended for AI insights):**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the generated key

> **Note:** Gemini AI analysis is optional. The app works without it, but you'll get enhanced insights with AI-powered recommendations when enabled.

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Tech Stack

- **Framework:** Next.js 16.0.2 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** ShadCN + Radix UI
- **AI Analysis:** Google Gemini 1.5 Flash
- **OCR:** Tesseract.js 6.0
- **Image Processing:** Sharp 0.34
- **Color Analysis:** TinyColor2, ColorThief
- **Icons:** Lucide React
- **Theme:** next-themes

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ocr/route.ts          # Tesseract.js text extraction
│   │   ├── palette/route.ts      # Color palette extraction
│   │   └── analysis/route.ts     # Full analysis pipeline
│   ├── globals.css               # iOS design tokens & variables
│   ├── layout.tsx                # Root layout with theme provider
│   ├── page.tsx                  # Main dashboard
│   └── providers.tsx             # Theme provider wrapper
├── components/
│   └── custom/
│       ├── UploadDropzone.tsx    # Drag & drop upload
│       ├── AnalysisCard.tsx      # Base card component
│       ├── ScoreCard.tsx         # Circular score display
│       ├── ContrastMeter.tsx     # Contrast ratio visualizer
│       ├── PaletteSwatch.tsx     # Color palette display
│       ├── Sidebar.tsx           # Navigation sidebar
│       ├── Header.tsx            # Top navigation bar
│       └── ThemeToggle.tsx       # Light/dark mode toggle
└── lib/
    ├── types.ts                  # TypeScript definitions
    ├── image.ts                  # Sharp image processing
    ├── ocr.ts                    # Tesseract.js wrapper
    ├── palette.ts                # Color extraction
    ├── wcag.ts                   # WCAG compliance checks
    ├── keyboard.ts               # Keyboard accessibility
    ├── hierarchy.ts              # Information hierarchy
    ├── sizing.ts                 # Size & feasibility checks
    ├── theme.ts                  # Theme & audience analysis
    └── utils.ts                  # Utility functions
```

## 🎨 API Endpoints

### POST `/api/ocr`
Extract text using Tesseract.js.

**Request:** 
```json
{ "imageUrl": "https://..." }
```

**Response:**
```json
{
  "success": true,
  "text": "extracted text...",
  "words": [{ "text": "...", "bbox": {...}, "confidence": 95 }]
}
```

### POST `/api/analysis`
Run full accessibility analysis pipeline.

**Request:** `multipart/form-data` with `file` field  
**Response:** Complete `AnalysisResult` object with all 12 analysis modules

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial Lumi setup"
git push origin main
```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard (GEMINI_API_KEY)
   - Deploy!

### Other Platforms

Lumi works on any Node.js hosting platform:
- **Netlify** - Add build command `npm run build` and publish directory `.next`
- **Railway** - Connect GitHub repo and set environment variables
- **DigitalOcean App Platform** - Use Node.js buildpack

## 🧪 Development

### Run locally
```bash
npm run dev
```

### Build for production
```bash
npm run build
npm start
```

### Lint code
```bash
npm run lint
```

## 🎯 Usage

1. **Upload a UI screenshot** (PNG or JPG)
2. **Wait for analysis** (typically 10-30 seconds)
3. **Review dashboard cards** with detailed insights:
   - Overall accessibility score
   - WCAG compliance level
   - Contrast ratio checks
   - Keyboard accessibility
   - Typography recommendations
   - And 7 more analysis modules
4. **Export or share** results (coming soon)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - Amazing framework
- **Vercel** - Hosting and deployment
- **Tesseract.js** - OCR capabilities
- **Sharp** - Fast image processing
- **Cloudinary** - Image storage
- **ShadCN** - Beautiful UI components

## 📧 Support

For support, email support@lumi.dev or open an issue on GitHub.

---

Built with ❤️ by [CR-8](https://github.com/CR-8)
