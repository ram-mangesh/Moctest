# Flutter Conversion Plan — ExamPrep Platform

## Overview
This is a full-stack exam preparation platform with **React JS frontend** (located in `/mock/src`) backed by a **Spring Boot** API at `http://localhost:8089/api`. The app supports two roles: **STUDENT** and **ADMIN**, with 70+ components across 16 feature domains.

---

## STEP 1 — COMPLETE COMPONENT INVENTORY

### 📁 Auth (4 files)
| File | Description |
|------|-------------|
| `Login.jsx` | Email+password login, JWT storage, role-based redirect |
| `Registraion.jsx` | 4-field signup with password strength meter, completion progress bar |
| `ProtectedRoute.jsx` | Token + role guard wrapping protected routes |
| `LogoutButton.jsx` | Clears localStorage, redirects to `/login` |

### 📁 Admin (14 files)
| File | Description |
|------|-------------|
| `AdminDashboard.jsx` | Admin home with sidebar nav |
| `AdminNavbar.jsx` | Top navigation bar |
| `AdminPanel.jsx` | Panel wrapper |
| `Sidebar.jsx` | Full admin sidebar with all links |
| `ExamManager.jsx` | CRUD for exams |
| `SubjectManager.jsx` | CRUD for subjects |
| `TopicManager.jsx` | CRUD for topics |
| `QuestionManager.jsx` | Manages question list with filters |
| `QuestionForm.jsx` | Add/edit question with multi-choice |
| `QuestionList.jsx` | Paginated list of questions |
| `DifficultyAnalyzer.jsx` | AI-powered difficulty analysis UI |
| `NotificationManager.jsx` | Send/schedule notifications |
| `PlatformOverview.jsx` | Platform-wide stats dashboard |
| `StudentInsights.jsx` | Per-student analytics |
| `TeacherAiGenerator.jsx` | AI question generation tool |
| `TeacherAnnotationPanel.jsx` | Annotate student answers |
| `ThemeCtx.jsx` | Admin theme context |
| `ToastProvider.jsx` | Toast notifications wrapper |
| `injectGlobalStyles.jsx` | Global CSS injection |

### 📁 User — Pages (20 files)
| File | Description |
|------|-------------|
| `LandingPage.jsx` | Public landing / marketing page |
| `Home.jsx` | Dashboard after login (exam list) |
| `SubjectPage.jsx` | Lists subjects for a given exam |
| `TopicPage.jsx` | Lists topics for a given subject |
| `ExamPage.jsx` | Exam detail/preview |
| `ExamsPage.jsx` | Browse all exams |
| `TestPage.jsx` | Test start page |
| `ResultPage.jsx` | Post-test result with score, per-question review |
| `ProgressPage.jsx` | Student progress over time |
| `HistoryPage.jsx` | Attempt history list |
| `AdaptiveLearning.jsx` | Personalized weak/avg/strong topic roadmap |
| `EngagementAnalytics.jsx` | Study pattern analytics |
| `WellbeingPage.jsx` | Student mental health & wellbeing tracker |
| `RecommendationEngine.jsx` | AI-driven topic/resource recommendations |
| `ProgressChart.jsx` | Chart component for progress |
| `ScoreDonutChart.jsx` | Donut chart for score breakdown |
| `TopicWiseChart.jsx` | Bar chart per topic |
| `StudentAnnotations.jsx` | View teacher annotations |
| `UserNavbar.jsx` | User-facing top nav |
| `UserLayout.jsx` | Shared user page layout |

### 📁 User — Components (12 files)
| File | Description |
|------|-------------|
| `AiChat.jsx` | AI chatbot popup |
| `VoiceAiTutor.jsx` | Full voice call AI tutor (SpeechRecognition + TTS) |
| `Cards.jsx` | Reusable card components |
| `DifficultySlider.jsx` | Slider for difficulty selection |
| `ExamCard.jsx` | Exam listing card |
| `SubjectCard.jsx` | Subject listing card |
| `TopicCard.jsx` | Topic listing card |
| `PageHeader.jsx` | Page header with title |
| `RoadmapPdfButton.jsx` | Export PDF roadmap |
| `UserNavbar.jsx` | User nav (duplicate, different from Pages/) |
| `UserSidebar.jsx` | Collapsible user sidebar |
| `WellbeingWidget.jsx` | Wellbeing mini widget |

### 📁 MockTest (12 files)
| File | Description |
|------|-------------|
| `MockTest.jsx` | **Core exam engine** — loads questions, manages time, answers, submit |
| `TestHeader.jsx` | Timer + exam name + analytics indicator |
| `QuestionPanel.jsx` | Shows current question + MCQ options |
| `QuestionPalette.jsx` | Question grid (answered/skipped/review color-coded) |
| `FooterControls.jsx` | Previous/Next/Mark Review/Submit buttons |
| `ScratchPad.jsx` | Drawable canvas scratchpad |
| `NudgeToast.jsx` | Real-time nudges from AI analytics |
| `ToastProvider.jsx` | Toast context for mock test |
| `trackAttempt.jsx` | Posts behavior data per answer |
| `useRealtimeAnalytics.jsx` | Polls backend for real-time nudges |
| `Blindaccessibleexam.jsx` | Fully accessible version with TTS for visually impaired |
| `Accessibleexambutton.jsx` | Button to launch accessible exam |

### 📁 hooks (4 files) — Critical custom hooks
| File | Description |
|------|-------------|
| `useAntiCheat.js` | **8 detection modes**: tab switch, split screen, copy/paste, right-click, keyboard shortcuts, fullscreen exit, DevTools open |
| `useFaceProctoring.js` | **Face tracking** via `face-api.js` — no face, multiple faces, face shift, eye movement |
| `SplitScreenDetector.jsx` | Edge Copilot / Windows Snap split-screen detection |
| `useTextToSpeech.js` | TTS for accessibility |

### 📁 Group Exam (6 files)
| File | Description |
|------|-------------|
| `GroupExamList.jsx` | List/Create/Join group exams via invite code |
| `GroupLobby.jsx` | Waiting room with live participant list |
| `GroupMockTest.jsx` | Group mode (delegates to MockTest with `mode="GROUP"`) |
| `Leaderboard.jsx` | Real-time leaderboard after group exam |
| `Themecontext.jsx` | Group theme context |
| `Theme.css` | Group-specific styles |

### 📁 Real Exam (3 files)
| File | Description |
|------|-------------|
| `RealExamsPage.jsx` | Browse available real exams |
| `RealExamPreviewPage.jsx` | Preview exam details + start |
| `RealExamRankingPage.jsx` | National ranking board |

### 📁 Game (7 files)
| File | Description |
|------|-------------|
| `Gamificationdashboard.jsx` | Achievements, XP, badges, streaks |
| `ExamQuestGame.jsx` | Full MCQ game engine with lives, scoring, levels |
| `SnakeLadder.jsx` | Snake & Ladder board game with questions |
| `MagicPotion.jsx` | Match-skill game — pick right potions |
| `HeistMaster.jsx` | Heist-themed question game |
| `SpaceDefender.jsx` | Space invader-style game |
| `TrainExpress.jsx` | Train puzzle game |

### 📁 AI Chatbot (3 files)
| File | Description |
|------|-------------|
| `AiChatSlider.jsx` | Slide-in chat panel |
| `AiHintWhisperer.jsx` | Hint overlay during exam |
| `Chatboticon.jsx` | Floating chat icon |

### 📁 Assignment (1 file)
| File | Description |
|------|-------------|
| `AssignmentList.jsx` | Student assignment list from teacher |

### 📁 Review Dashboard (1 file)
| File | Description |
|------|-------------|
| `Reviewdashboard.jsx` | Review past wrong answers with explanations |

### 📁 Study Planner (1 file)
| File | Description |
|------|-------------|
| `SmartStudyPlanner.jsx` | AI-generated weekly study plan |

### 📁 Settings (4 files)
| File | Description |
|------|-------------|
| `SettingsPage.jsx` | User profile + behavioral analytics view |
| `Behavioralchart.jsx` | Time-spent / option-change behavior chart |
| `StressConfigPanel.jsx` | Stress detection config |
| `StudentAnnotations.jsx` | View teacher annotations in settings |

### 📁 Common (5 files)
| File | Description |
|------|-------------|
| `Badge.jsx` | Reusable badge chip |
| `Button.jsx` | Styled button |
| `Card.jsx` | Card wrapper |
| `Input.jsx` | Styled input |
| `LanguageSwitcher.jsx` | i18n language toggle |

### 📁 i18n / Data / Utils
| File | Description |
|------|-------------|
| `i18n.js` | i18next setup |
| `i18n/*.json` | Translations (EN + others) |
| `Component/Data/` | Static data files |
| `Component/utils/fullscreen.js` | Enter/exit fullscreen util |

---

## STEP 2 — ROUTING INVENTORY

### User Routes (`/`)
| React Path | Screen | Protected |
|------------|--------|-----------|
| `/` | LandingPage | No |
| `/login` | Login | No |
| `/register` | Registration | No |
| `/game` | ExamQuestGame | No |
| `/blind-exam/:topicId` | BlindAccessibleExam | No |
| `/achievements` | GamificationDashboard | No |
| `/review` | ReviewDashboard | No |
| `/home` | Home | ✅ |
| `/exam/:examId` | SubjectPage | ✅ |
| `/subject/:subjectId` | TopicPage | ✅ |
| `/test/:topicId` | MockTestPage (SOLO) | ✅ |
| `/result` | ResultPage | ✅ |
| `/progress` | ProgressPage | ✅ |
| `/history` | HistoryPage | ✅ |
| `/group-exams` | GroupExamList | ✅ |
| `/group-exams/:id` | GroupLobby | ✅ |
| `/group-exams/:id/start` | GroupMockTest | ✅ |
| `/group-exams/:id/leaderboard` | Leaderboard | ✅ |
| `/real-exams` | RealExamsPage | ✅ |
| `/real-exam-ranking` | RealExamRankingPage | ✅ |
| `/real-exam/:examId` | RealExamPreviewPage | ✅ |
| `/real-exam/start/:examId` | MockTestPage (REAL) | ✅ |
| `/assignments` | AssignmentList | ✅ |
| `/settings` | SettingsPage | ✅ |
| `/study-planner` | SmartStudyPlanner | ✅ |
| `/adaptive-learning` | AdaptiveLearning | ✅ |
| `/analytics` | EngagementAnalytics | ✅ |
| `/wellbeing` | WellbeingPage | ✅ |
| `/recommendations` | RecommendationEngine | ✅ |

### Admin Routes (`/admin`)
| React Path | Screen | Protected |
|------------|--------|-----------|
| `/admin` | AdminDashboard | ✅ ADMIN |
| `/admin/exams` | ExamManager | ✅ |
| `/admin/subjects` | SubjectManager | ✅ |
| `/admin/topics` | TopicManager | ✅ |
| `/admin/questions` | QuestionManager | ✅ |

---

## STEP 3 — API CALLS CATALOG

**Base URL:** `http://localhost:8089/api`  
**Auth:** JWT Bearer token from `localStorage["token"]`  
**Auto 401 redirect:** → `/login` + clears token

| Endpoint | Method | Used In |
|----------|--------|---------|
| `/auth/login` | POST | Login |
| `/auth/register` | POST | Registration |
| `/user/questions?topicId=` | GET | MockTest (SOLO/GROUP) |
| `/user/test/submit?topicId=` | POST | MockTest submit |
| `/user/test/attempts` | GET | AdaptiveLearning, History |
| `/user/ai/teacher-context` | GET | VoiceAiTutor |
| `/user/ai/teacher-call` | POST (text/plain) | VoiceAiTutor |
| `/api/user/difficulty/logs` | GET | AdaptiveLearning |
| `/api/user/difficulty/override` | POST | AdaptiveLearning |
| `/real-exam/start` | POST | MockTest (REAL) |
| `/real-exam/submit/:sessionId` | POST | MockTest (REAL) |
| `/group-exam/my-groups` | GET | GroupExamList |
| `/group-exam/create?topicId=` | POST | GroupExamList |
| `/group-exam/join/:code` | POST | GroupExamList |
| `/group-exam/:id` | GET | GroupLobby, MockTest |
| `/group-exam/:id/submit` | POST | MockTest (GROUP) |
| `/exam-data/exams` | GET | GroupExamList, Home |
| `/exam-data/subjects/:examId` | GET | SubjectPage, GroupExamList |
| `/exam-data/topics/:subjectId` | GET | TopicPage, GroupExamList |

---

## STEP 4 — STATE MANAGEMENT INVENTORY

| React State | Location | Purpose |
|-------------|----------|---------|
| `token, role, name, userId` | localStorage | Auth persistence |
| `ai_call_logs` | localStorage | VoiceAiTutor call history |
| `ep_session_map` | localStorage | attemptId→sessionId mapping |
| `form { email, password }` | Login | Login form state |
| `form { name, email, phone, password }` | Registration | Signup form |
| `focused, showPass, loading, error, success` | Auth screens | UI state |
| `questions, currentQ, answers, duration` | MockTest | Core exam state |
| `violations, sessionId, review` | MockTest | Proctoring + exam control |
| `analytics, nudges` | useRealtimeAnalytics | Live behavioral nudges |
| `groups, exams, subjects, topics` | GroupExamList | Cascading dropdowns |
| `topicData, overrides, saving, saved` | AdaptiveLearning | Personalized learning |
| `screen, micState, callTimer, muted` | VoiceAiTutor | Voice call state |
| `transcript, lastResponse, typedQ` | VoiceAiTutor | Chat state |

---

## STEP 5 — FEATURE MAPPING: React → Flutter

| React Feature | Flutter Equivalent |
|---------------|-------------------|
| `useState` | `StatefulWidget` / `Riverpod StateProvider` / `setState` |
| `useEffect` | `initState()`, `didChangeDependencies()`, `Timer`, `FutureBuilder` |
| `useRef` | `final _ref = useRef()` → `late final controller` / `ValueNotifier` |
| `useMemo` | `late final computed = ...` / custom getter |
| `useCallback` | Regular method / `VoidCallback` |
| `useContext` | `Provider.of<T>()` / `ref.watch()` (Riverpod) |
| React Router `<Route path>` | `GoRouter` routes with paths |
| Route params `:id` | `GoRouterState.params['id']` |
| `navigate('/path')` | `context.go('/path')` or `context.push()` |
| `location.state` | GoRouter `extra` parameter |
| `localStorage.getItem/setItem` | `shared_preferences` package |
| Axios `api.get/post` | `Dio` with base URL + interceptors |
| JWT interceptor | `Dio Interceptor` — attach token, handle 401 |
| `face-api.js` (TinyFaceDetector) | `google_mlkit_face_detection` |
| `SpeechRecognition API` | `speech_to_text` package |
| `SpeechSynthesis (TTS)` | `flutter_tts` package |
| `document.fullscreenElement` | `SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersive)` |
| `window.visibilityState` | `WidgetsBindingObserver` (AppLifecycleState) |
| `window.resize` | `LayoutBuilder` / `MediaQuery` |
| `document.addEventListener('keydown')` | `RawKeyboardListener` / `Focus` widget |
| `navigator.mediaDevices.getUserMedia` | `camera` package |
| Canvas (ScratchPad) | `CustomPainter` with `GestureDetector` |
| `react-i18next` | `flutter_localizations` + `intl` |
| CSS animations | Flutter `AnimationController` / `TweenAnimationBuilder` |
| glassmorphism (`backdrop-filter:blur`) | `BackdropFilter(filter: ImageFilter.blur())` |
| Tailwind CSS | Flutter custom `ThemeData` / custom widget classes |
| `window.SpeechSynthesis` | `flutter_tts` |
| recharts / chart.js | `fl_chart` or `syncfusion_flutter_charts` |
| `setTimeout / setInterval` | `Future.delayed()` / `Timer.periodic()` |
| `Promise.all` | `Future.wait([...])` |
| `WebSocket` (GroupLobby) | `web_socket_channel` package |
| PDF generation | `pdf` + `printing` packages |

---

## STEP 6 — CRITICAL FLUTTER NOTES (Browser Features)

### ⚠️ Face Proctoring (`useFaceProctoring.js`)
- **React**: Uses `face-api.js` TinyFaceDetector loaded from `/models/`
- **Flutter**: Use `google_mlkit_face_detection` (native ML Kit)
  - Detects: face count, face position (bounding box)
  - Eye tracking: ML Kit provides `leftEyeOpenProbability` — use as proxy for eye movement
  - Requires `camera` plugin for live feed
  - **No browser dependency** — works natively on Android/iOS

### ⚠️ Anti-Cheat (`useAntiCheat.js`)
- **Tab switch**: `WidgetsBindingObserver` → `AppLifecycleState.paused`
- **Split screen** (30% width drop): `MediaQuery.of(context).size.width` change detection
- **Copy/paste**: `TextField` with `enableInteractiveSelection: false`; clipboard restriction via `Clipboard` override
- **Keyboard shortcuts**: `RawKeyboardListener` — catch Ctrl+C, F12 etc. (limited on mobile)
- **Fullscreen exit**: `SystemChrome` events
- **DevTools**: Not applicable for Flutter mobile (browser-only concern)
- **Right-click**: `GestureDetector` `onSecondaryTap` (desktop only)

### ⚠️ Voice AI Tutor (`VoiceAiTutor.jsx`)
- **Speech Recognition**: `speech_to_text` package — same flow (start/stop, interim results)
- **TTS**: `flutter_tts` — set volume, rate, pitch, language
- **Call logs**: `shared_preferences` (replaces localStorage)
- **Call timer**: `Timer.periodic` (replaces setInterval)

### ⚠️ ScratchPad (`ScratchPad.jsx`)
- **React**: HTML `<canvas>` with mouse events
- **Flutter**: `CustomPainter` + `GestureDetector` for touch drawing — full feature parity

### ⚠️ i18n
- **React**: `react-i18next` with EN + other language JSON files
- **Flutter**: `flutter_localizations` + `intl` + ARB files — convert JSON to `.arb`

### ⚠️ PDF Export (`RoadmapPdfButton.jsx`)
- **React**: Browser `window.print()` or `jsPDF`
- **Flutter**: `pdf` package + `printing` plugin — cross-platform

### ⚠️ WebSocket (GroupLobby)
- The `websocket.js` file is a stub (empty component)
- GroupLobby likely uses polling (`setInterval`) or a real WebSocket
- **Flutter**: `web_socket_channel` for real-time connection

---

## STEP 7 — RECOMMENDED FLUTTER PROJECT STRUCTURE

```
lib/
├── main.dart
├── app.dart                    # MaterialApp + GoRouter
├── core/
│   ├── api/
│   │   ├── dio_client.dart     # Dio setup + interceptors (JWT + 401)
│   │   └── api_endpoints.dart  # All endpoint strings
│   ├── auth/
│   │   └── auth_service.dart   # Token read/write (SharedPreferences)
│   ├── router/
│   │   └── app_router.dart     # GoRouter all routes
│   └── theme/
│       └── app_theme.dart      # Colors, fonts, theme data
├── features/
│   ├── auth/
│   │   ├── login_screen.dart
│   │   └── register_screen.dart
│   ├── home/
│   │   ├── home_screen.dart
│   │   ├── subject_page.dart
│   │   └── topic_page.dart
│   ├── mock_test/
│   │   ├── mock_test_screen.dart    # Core exam engine
│   │   ├── test_header.dart
│   │   ├── question_panel.dart
│   │   ├── question_palette.dart
│   │   ├── footer_controls.dart
│   │   └── scratch_pad.dart
│   ├── proctoring/
│   │   ├── anti_cheat_service.dart
│   │   └── face_proctoring_service.dart
│   ├── group_exam/
│   │   ├── group_exam_list.dart
│   │   ├── group_lobby.dart
│   │   └── leaderboard.dart
│   ├── real_exam/
│   │   ├── real_exams_page.dart
│   │   ├── real_exam_preview.dart
│   │   └── real_exam_ranking.dart
│   ├── result/
│   │   └── result_screen.dart
│   ├── progress/
│   │   ├── progress_page.dart
│   │   └── history_page.dart
│   ├── adaptive_learning/
│   │   └── adaptive_learning_screen.dart
│   ├── ai_tutor/
│   │   └── voice_ai_tutor.dart
│   ├── games/
│   │   ├── exam_quest_game.dart
│   │   ├── snake_ladder.dart
│   │   ├── magic_potion.dart
│   │   ├── heist_master.dart
│   │   ├── space_defender.dart
│   │   └── train_express.dart
│   ├── gamification/
│   │   └── gamification_dashboard.dart
│   ├── admin/
│   │   ├── admin_dashboard.dart
│   │   ├── exam_manager.dart
│   │   ├── subject_manager.dart
│   │   ├── topic_manager.dart
│   │   └── question_manager.dart
│   ├── settings/
│   │   └── settings_page.dart
│   ├── study_planner/
│   │   └── smart_study_planner.dart
│   ├── wellbeing/
│   │   └── wellbeing_page.dart
│   ├── analytics/
│   │   └── engagement_analytics.dart
│   ├── recommendations/
│   │   └── recommendation_engine.dart
│   └── assignments/
│       └── assignment_list.dart
└── shared/
    ├── widgets/
    │   ├── glass_card.dart         # Glassmorphism card
    │   ├── gradient_button.dart
    │   ├── loading_spinner.dart
    │   └── toast.dart
    └── providers/
        └── auth_provider.dart      # Riverpod auth state
```

---

## STEP 8 — RECOMMENDED PACKAGES

```yaml
dependencies:
  flutter:
    sdk: flutter
  # Navigation
  go_router: ^14.0.0
  # HTTP
  dio: ^5.4.0
  # Storage
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0
  # State Management
  flutter_riverpod: ^2.5.1
  riverpod_annotation: ^2.3.4
  # Camera & Face Detection
  camera: ^0.10.5
  google_mlkit_face_detection: ^0.10.0
  # Speech
  speech_to_text: ^6.6.0
  flutter_tts: ^4.0.2
  # Charts
  fl_chart: ^0.67.0
  # WebSocket
  web_socket_channel: ^3.0.0
  # PDF
  pdf: ^3.10.4
  printing: ^5.12.0
  # Animations
  lottie: ^3.1.0
  # i18n
  flutter_localizations:
    sdk: flutter
  intl: ^0.19.0
  # Image / UI
  cached_network_image: ^3.3.1
  shimmer: ^3.0.0
```

---

## STEP 9 — SCREEN CONVERSION ORDER (Suggested)

| Priority | Screen | Complexity |
|----------|--------|------------|
| 1 | Login | Low |
| 2 | Registration | Low |
| 3 | Home | Medium |
| 4 | SubjectPage / TopicPage | Low |
| 5 | MockTest (SOLO) | **Very High** |
| 6 | ResultPage | Medium |
| 7 | ProgressPage / HistoryPage | Medium |
| 8 | AdaptiveLearning | Medium |
| 9 | Admin routes | Medium |
| 10 | GroupExam | High |
| 11 | RealExam | High |
| 12 | VoiceAiTutor | **Very High** |
| 13 | Games (7 games) | High per game |
| 14 | Study Planner | Medium |
| 15 | Wellbeing / Analytics | Medium |
| 16 | LandingPage | Medium |
| 17 | Settings | Medium |

---

## STEP 10 — OPEN QUESTIONS FOR USER

> [!IMPORTANT]
> Before starting code, clarify:

1. **Target Platform**: Android only? iOS too? Web (Flutter Web)?
2. **State Management**: Riverpod (recommended) or Bloc/Provider/GetX?
3. **Face Proctoring**: Is this required on mobile? (ML Kit works but camera permission flows differ on iOS vs Android)
4. **Anti-Cheat on Mobile**: Many browser-based cheats (F12, right-click) don't apply. Should mobile have a different anti-cheat strategy?
5. **i18n**: Which languages need to be supported in Flutter?
6. **Group Exam WebSocket**: The `websocket.js` is a stub. Does GroupLobby use real-time WebSocket or polling? Need to inspect `GroupLobby.jsx` further.
7. **Design fidelity**: Exact pixel-perfect match, or "same features, Flutter Material Design"?
8. **Generate all 70 screens now**, or **one screen at a time** starting from Screen #1?

---

## STEP 11 — VALIDATION CHECKLIST (Post-Conversion)

- [ ] Auth: Login → JWT stored → role-based redirect
- [ ] Auth: Register → strength meter → navigate to login
- [ ] Auth: Protected routes redirect if no token
- [ ] MockTest: Questions load, timer counts down, auto-submit on time-up
- [ ] MockTest: Answer selection tracked + API submit
- [ ] MockTest: AntiCheat fires on app background
- [ ] MockTest: FaceProctoring detects no-face, multiple faces
- [ ] MockTest: Scratch pad draws
- [ ] MockTest: Violation count → auto-submit at MAX
- [ ] Group Exam: Create → invite code → lobby → leaderboard
- [ ] Real Exam: Start → submit → ranking page
- [ ] AdaptiveLearning: Pulls attempts, classifies, shows roadmap
- [ ] VoiceAiTutor: Speech → API → TTS playback
- [ ] VoiceAiTutor: Mute, Speaker, Keyboard, Settings
- [ ] Admin: CRUD for Exams, Subjects, Topics, Questions
- [ ] Games: All 7 games playable
- [ ] i18n: Language switch works across all screens
- [ ] 401 responses: token cleared, redirect to login

