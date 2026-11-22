# BẢN ĐẶC TẢ YÊU CẦU PHẦN MỀM (SOFTWARE REQUIREMENTS SPECIFICATION - SRS)
## DỰ ÁN: APPFLASH - NỀN TẢNG HỌC TẬP TƯƠNG TÁC & AI TRỢ GIẢNG ĐA PHƯƠNG THỨC

---

## 1. GIỚI THIỆU TỔNG QUAN (INTRODUCTION)

### 1.1. Mục đích tài liệu
Tài liệu này đặc tả chi tiết toàn bộ yêu cầu chức năng, yêu cầu phi chức năng, kiến trúc kỹ thuật và mô hình dữ liệu của hệ thống **APPFLASH**. Tài liệu là cơ sở đối chiếu cho quá trình phát triển, kiểm thử, tích hợp và bảo trì hệ thống.

### 1.2. Phạm vi dự án
**APPFLASH** là nền tảng web giáo dục tương tác đa phương thức, kết hợp công nghệ Web tương tác (Canvas, Web Speech API, NLP) và trí tuệ nhân tạo (AI Agent). Hệ thống được thiết kế đặc thù nhằm:
1. **Hỗ trợ học ngôn ngữ Nhật Bản**: Tập trung chuyên sâu cho trẻ em lứa tuổi tiểu học (đặc biệt trẻ 7 tuổi học lớp 2 tại Nhật) hoặc người mới bắt đầu gặp khó khăn về đọc chữ, phát âm, trường âm, âm ngắt, âm ghép và đọc hiểu.
2. **Học tiếng Anh theo chủ đề**: Cung cấp bộ thẻ học từ vựng trực quan kèm phát âm và phân tích ngữ pháp.
3. **Toán học trực quan kiểu Montessori**: Trực quan hóa các phép tính cộng, trừ, nhân, chia thông qua tương tác kéo thả.
4. **Trình đọc và ghi chú tài liệu PDF thông minh**: Hỗ trợ mở tài liệu học tập, tô vẽ, khoanh tròn, làm bài tập trực tiếp trên canvas PDF.
5. **AI Trợ giảng (Teacher Agent)**: Khung AI Agent hỗ trợ lập kế hoạch học tập, thực thi công cụ và lưu trữ bộ nhớ học tập cá nhân hóa.

### 1.3. Đối tượng sử dụng (Target Users)
- **Người học chính (Primary Users)**: Trẻ em từ 5–8 tuổi (đặc biệt trẻ lớp 2 tiểu học cần củng cố năng lực đọc ngôn ngữ).
- **Người học phụ (Secondary Users)**: Người bắt đầu học tiếng Nhật, tiếng Anh; người học thông qua phương pháp trực quan (Visual Learners).
- **Người giám sát & đồng hành**: Phụ huynh và giáo viên giáo dục đặc biệt/hỗ trợ ngôn ngữ.

---

## 2. KIẾN TRÚC TỔNG THỂ HỆ THỐNG (SYSTEM ARCHITECTURE)

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  |  Flashcard Modules |  |  Educational Games |  |  PDF Annotation & Canvas    |  |
|  |  (JP / EN / Kanji) |  | (Shiritori, Memory)|  |  (PDF.js + Draw Layer)      |  |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  +-----------------------------------------------------------------------------+  |
|  | Web Speech API (TTS / STT) | NLP Tokenizer (Compromise) | Touch / Swipe UI  |  |
+-----------------------------------------------------------------------------------+
                                         │  HTTP / JSON APIs
                                         ▼
+-----------------------------------------------------------------------------------+
|                             BACKEND LAYER (Node.js / Express 5)                  |
|  +-------------------------------------+  +------------------------------------+  |
|  | Static & View Server (index.ts)     |  | REST API Controller (server.ts)    |  |
|  | - Web Pages (/base, /readpdf, ...)  |  | - POST /chat                       |  |
|  | - Data Provider (/data, /api/pdfs)  |  | - GET /health, /api/pdftree        |  |
|  +-------------------------------------+  +------------------------------------+  |
|                                        │                                          |
|                                        ▼                                          |
|  +-----------------------------------------------------------------------------+  |
|  |                              AI AGENT ENGINE                                |  |
|  |   [Planner.ts]  ──────────►  [ToolRegistry.ts]  ────────► [MemoryStore.ts]   |  |
|  |  (Sinh kế hoạch)           (Thực thi tác vụ)            (Lưu bộ nhớ đệm)    |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                                DATA & PERSISTENCE                                 |
|  - SQLite Database (`data/agent.db`): Lưu lịch sử tương tác & bộ nhớ Agent        |
|  - JSON Datasets (`data/*.json`): Kho từ vựng Hiragana, Katakana, Kanji, English  |
|  - PDF Library (`data/pdfs/`): Kho học liệu, mê cung, IQ, bài tập trực quan       |
+-----------------------------------------------------------------------------------+
```

### 2.1. Ngăn xếp công nghệ (Technology Stack)
- **Ngôn ngữ lập trình chính**: TypeScript, JavaScript (ES6+), HTML5, CSS3.
- **Backend Runtime**: Node.js, Express (v5.2.1), `ts-node`.
- **Cơ sở dữ liệu**: SQLite3 (lưu trữ tiến trình và lịch sử Agent qua `data/agent.db`).
- **Thư viện Client-side**:
  - `PDF.js` (Mozilla): Render và xử lý tài liệu PDF.
  - `Compromise NLP`: Phân tích cú pháp và nhận diện từ loại (Verb, Noun, Adjective, Adverb).
  - `Web Speech API`: Nhận dạng giọng nói (Speech Recognition) và phát âm văn bản (Speech Synthesis).
  - Canvas 2D API: Hệ thống vẽ vector tương tác nhiều lớp.

---

## 3. ĐẶC TẢ CHI TIẾT TÍNH NĂNG (DETAILED FUNCTIONAL REQUIREMENTS)

### PHÂN HỆ 1: HỆ THỐNG FLASHCARD ĐA NGÔN NGỮ (FLASHCARD CORE)

#### FR-1.1. Học chữ cái và từ vựng Tiếng Nhật cơ bản
- **Ký tự Hiragana & Katakana**:
  - Học bảng chữ cái đơn (Hiragana/Katakana Char): mặt chữ to, rõ ràng, tối ưu cho trẻ em.
  - Học từ vựng đơn kèm hình ảnh Emoji tương ứng (Hiragana/Katakana Word).
- **Bộ âm nâng cao**:
  - **Biến âm và Bán biến âm (濁音・半濁音)**: Học các âm đi kèm tenten (゛) và maru (゜) như が, ざ, だ, ば, ぱ.
  - **Âm ghép (拗音 - Yoon)**: Học các âm kết hợp chữ nhỏ như きゃ, きゅ, きょ, しゃ, ちゃ,...
  - **Trường âm (長音 - Chouon)**: Luyện nhận diện và phân biệt nguyên âm kéo dài (ví dụ: `おばさん` vs `おばあさん`, `ケーキ` vs `ケキ`).

#### FR-1.2. Học Hán tự (Kanji) theo cấp bậc và chủ đề
- **Kanji Tiểu học theo niên khóa**:
  - Hán tự Lớp 1 (Grade 1 Kanji): Các chữ cơ bản về số, thiên nhiên, bộ phận cơ thể.
  - Hán tự Lớp 2 (Grade 2 Kanji): Mở rộng chữ ghép và từ vựng trường học.
  - Hán tự Lớp 3 (Grade 3 Kanji) và chủ đề mở rộng Lớp 3.
- **Kho Hán tự chuẩn hóa theo nhóm số**:
  - Hỗ trợ tải dữ liệu theo từng nhóm: 1–100, 101–200, 201–300, 301–400, 401–500.
  - Học đọc hiểu ngữ cảnh (読解 1–100): Hiển thị câu ví dụ chứa chữ Hán cần học.

#### FR-1.3. Tính năng hỗ trợ thao tác thẻ (Interactive Card Controls)
- **Chế độ hiển thị linh hoạt**:
  - **Ẩn/Hiện Emoji (`👀`)**: Giúp kiểm tra trí nhớ học sinh mà không bị phụ thuộc vào hình ảnh minh họa.
  - **Ẩn/Hiện Đáp án (`🔍`)**: Ẩn phần cách đọc/nghĩa để học sinh tự đoán trước khi lật đáp án.
  - **Xáo trộn ngẫu nhiên (`🎲`)**: Trộn thứ tự các thẻ để tránh học vẹt vị trí.
  - **Chế độ toàn màn hình (Fullscreen)**: Tối ưu không gian hiển thị trên máy tính bảng và màn hình cảm ứng.
- **Điều hướng cử chỉ (Touch & Gesture)**:
  - Hỗ trợ chạm (Tap) để phát âm hoặc lật thẻ.
  - Vuốt trái / vuốt phải (Swipe Left/Right) trên màn hình cảm ứng để chuyển thẻ bài học kế tiếp hoặc trước đó.

---

### PHÂN HỆ 2: HỌC TIẾNG NHẬT NÂNG CAO & LUYỆN NÓI AI (STUDY JAPANESE)

#### FR-2.1. Giao diện Thẻ Kanji tương tác chuyên sâu (`/study-japanese`)
- Hiển thị đầy đủ thông tin một ký tự/từ vựng:
  - Emoji đại diện minh họa ngữ nghĩa.
  - Chữ Kanji kích thước lớn (chạm vào để nghe phát âm giọng chuẩn bản xứ).
  - Phiên âm chi tiết: Kunyomi, Onyomi, Romaji/Hiragana.
  - Câu ví dụ thực tế (例文 - Reibun).
  - Dịch nghĩa tiếng Việt / tiếng Anh.

#### FR-2.2. Nhận dạng giọng nói và chấm điểm phát âm qua Micro
- Tích hợp `SpeechRecognition` (Web Speech API).
- Học sinh bấm nút thu âm (`🎤 開始`) và đọc to từ vựng hoặc câu ví dụ.
- Hệ thống tự động so khớp văn bản nhận dạng được với từ vựng mục tiêu:
  - Tính điểm chính xác (Speech Score: 0–100%).
  - Đưa ra phản hồi màu sắc: Xanh (chính xác), Cam/Đỏ (cần phát âm lại).

#### FR-2.3. Phân tích ngữ pháp tự động (NLP Syntax Analyzer)
- Tích hợp thư viện xử lý ngôn ngữ tự nhiên `compromise`.
- Tự động tách từ (tokenization) và gán nhãn từ loại của câu mẫu:
  - Danh từ (**Noun**): Tô màu xanh lam.
  - Động từ (**Verb**): Tô màu xanh lá.
  - Tính từ (**Adjective**): Tô màu vàng cam.
  - Trạng từ (**Adverb**): Tô màu tím nhạt.
- Cho phép người học bấm vào từng từ đơn trong câu để xem nghĩa và cách phát âm riêng rẽ.

---

### PHÂN HỆ 3: HỆ THỐNG TRÒ CHƠI GIÁO DỤC TƯƠNG TÁC (GAMIFIED LEARNING)

#### FR-3.1. Trò chơi "Vị trí ghi nhớ" (🧠 位置覚える - Spatial Memory)
- Trình bày một lưới thẻ (Board 2x3 hoặc tùy chọn) chứa từ vựng và emoji.
- Cho phép xem vị trí trong khoảng thời gian định trước (Timer đếm ngược).
- Sau khi hết thời gian, các thẻ sẽ ẩn nội dung, yêu cầu học sinh nhớ và chỉ ra thẻ ở ô số tương ứng.

#### FR-3.2. Trò chơi "Lật thẻ tìm cặp" (🎴 Memory Game - 3D Card Match)
- Bàn cờ gồm các thẻ úp với hiệu ứng lật 3D sống động.
- Người chơi lật từng cặp thẻ: 1 thẻ chữ Hán/từ vựng và 1 thẻ Emoji tương ứng.
- Khi ghép đúng, thẻ giữ trạng thái mở kèm hiệu ứng chúc mừng (Confetti animation).
- Tích hợp bộ đếm lượt lật và thời gian hoàn thành.

#### FR-3.3. Trò chơi "Ai biến mất?" (🎴 Guess Game - なにが なくなった？)
- Hiển thị danh sách các thẻ từ vựng và hình ảnh theo từng cấp độ (Level 1: 3 thẻ, Level 2: 4 thẻ, lên tới 6 thẻ).
- Hệ thống tự động ẩn đi ngẫu nhiên một vật thể và hiển thị dấu hỏi `❓`.
- Học sinh lựa chọn đáp án đúng từ danh sách các nút từ vựng tiếng Nhật.
- Tự động tính điểm và thăng cấp.

#### FR-3.4. Trò chơi "Nối từ Hán tự" (🎴 かんじを つなごう！ - Kanji Matching)
- Hiển thị một chữ Hán mục tiêu ở trung tâm màn hình (ví dụ: `犬`, `猫`, `山`, `川`, `木`).
- Cung cấp lưới các lựa chọn Emoji minh họa.
- Người chơi chọn Emoji khớp với chữ Hán:
  - Hỗ trợ nút gợi ý (Hint) kèm cách đọc Hiragana (giới hạn số lần dùng).
  - Tích hợp thanh tiến trình (Progress bar) và danh hiệu thành tích (Achievements).

#### FR-3.5. Trò chơi "Nối chữ tiếng Nhật" (🎴 Shiritori - しりとりゲーム)
- Trò chơi nối chữ truyền thống của Nhật: Từ tiếp theo phải bắt đầu bằng âm tiết cuối của từ trước đó.
- Cấm kết thúc bằng âm `ん` (nếu ra âm `ん` sẽ thua theo luật Shiritori).
- Chế độ gợi ý bằng Emoji, phân cấp độ từ dễ đến khó.
- Tự động kiểm tra tính hợp lệ của từ nối theo từ điển tiếng Nhật tích hợp.

#### FR-3.6. Toán học trực quan Montessori (`/CongTru.html` & `tst3.html`)
- Mô phỏng toán học mầm non và lớp 1: Phép cộng và trừ trong phạm vi 10 và 20.
- Tương tác kéo-thả trực quan quả táo (`🍎`) vào các nhóm giỏ để hình dung bản chất của phép gộp số và tách số.
- Học bảng cửu chương nhân và chia thông qua flashcard trực quan.

---

### PHÂN HỆ 4: HỌC TIẾNG ANH THEO CHỦ ĐỀ (STUDY ENGLISH)

#### FR-4.1. Flashcard tiếng Anh đa chủ đề (`/study-english`)
- 12+ bộ từ vựng phong phú: Bảng chữ cái Alphabet, Animals (động vật), Body (bộ phận cơ thể), Clothes (trang phục), Family (gia đình), Food (đồ ăn), School (trường học), Toys (đồ chơi), Vehicles (phương tiện), Basic Verbs (động từ cơ bản), Basic Adjectives (tính từ cơ bản), Jobs & Places.
- Phát âm chuẩn tiếng Anh bản ngữ qua trình đọc giọng nói.
- Phân tích ngữ pháp câu ví dụ tiếng Anh bằng NLP.

#### FR-4.2. Huấn luyện viên Flashcard tự động (`/flash-card`)
- Tùy chọn số lượng từ học trong một phiên (Word count, mặc định 10 từ).
- Chế độ tự động chạy (Auto Slide Runner): Tự chuyển từ vựng sau khoảng thời gian đặt trước.
- Điều khiển Play/Stop linh hoạt, bật/tắt phát âm tự động.

---

### PHÂN HỆ 5: TRÌNH ĐỌC VÀ CHÚ THÍCH PDF TƯƠNG TÁC (PDF ANNOTATION VIEWER)

#### FR-5.1. Quản lý và duyệt tài liệu PDF
- API `/api/pdftree` quét đệ quy thư mục `data/pdfs`, trả về cấu trúc cây thư mục phân cấp rõ ràng (Folder & File).
- Khả năng tải các sách bài tập (Worksheet, sách mê cung, bài toán tư duy IQ, trò chơi tìm điểm khác nhau).

#### FR-5.2. Công cụ ghi chú đa năng (Canvas Drawing Tools)
- Hệ thống render hai lớp: Lớp nền hiển thị trang PDF gốc (`pdfCanvas`) và lớp tương tác vẽ đè (`drawCanvas`).
- Bộ công cụ vẽ đầy đủ:
  - Bút tự do (Pencil/Pen) với bảng màu sắc đa dạng.
  - Điều chỉnh nét vẽ (Brush Size).
  - Tẩy xóa (Eraser) và Xóa toàn bộ nét vẽ của trang (Clear Page).
  - Thao tác phóng to, thu nhỏ (Zoom In/Out), vừa màn hình (Fit Width/Height).
  - Điều hướng trang nhanh (Trang trước, Trang sau, Nhập số trang trực tiếp).

---

### PHÂN HỆ 6: LÕI AI AGENT & TRỢ GIẢNG SƯ PHẠM (TEACHER AGENT ENGINE)

#### FR-6.1. Hồ sơ sư phạm AI (Teacher Persona)
- **Danh tính**: Giáo viên tiểu học Nhật Bản hỗ trợ trẻ 7 tuổi (lớp 2) gặp khó khăn về ngôn ngữ và đọc hiểu.
- **Quy tắc sư phạm cốt lõi**:
  1. *Quy tắc 5 bước*: Nhìn (Look) ➔ Nghe (Listen) ➔ Nhắc lại (Repeat) ➔ Chọn (Choose) ➔ Khen thưởng (Reward).
  2. *Thời lượng & Khối lượng*: Mỗi bài học kéo dài từ 5–10 phút, tập trung duy nhất vào 1 kỹ năng chính, tối đa không quá 5 từ mới.
  3. *Tâm lý học tích cực*: Luôn sử dụng ngôn từ khích lệ, khen ngợi, sử dụng hình ảnh thân thiện.
  4. *Ranh giới an toàn y tế*: Không chẩn đoán bệnh lý tự kỷ, chậm phát triển hay đưa ra lời khuyên y khoa; chỉ hỗ trợ phương pháp sư phạm và khuyến nghị phụ huynh gặp chuyên gia khi cần thiết.

#### FR-6.2. Kiến trúc Agent Backend
- **Planner (`Planner.ts`)**: Tiếp nhận yêu cầu/câu hỏi của người dùng và tạo lập kế hoạch thực thi tác vụ.
- **ToolRegistry (`ToolRegistry.ts`)**: Đăng ký và kích hoạt các công cụ trợ giúp.
- **MemoryStore (`MemoryStore.ts`) & SQLite (`sqlite.ts`)**:
  - Lưu trữ nhật ký đệm các bước: `prompt`, `plan`, `toolOutput`.
  - Lưu vết bền vững vào bảng `memory` trong SQLite (`data/agent.db`).
- **REST Endpoints**:
  - `POST /chat`: Tiếp nhận tin nhắn từ client và trả về phản hồi từ Agent.
  - `GET /health`: Kiểm tra tình trạng hoạt động của service AI Agent.

---

## 4. ĐẶC TẢ GIAO DIỆN LẬP TRÌNH (API SPECIFICATION)

### 4.1. `POST /chat`
- **Mô tả**: Gửi câu hỏi/prompt tới AI Agent để nhận phản hồi và lưu vào bộ nhớ.
- **Request Body**:
  ```json
  {
    "prompt": "Hướng dẫn em đọc âm ngắt chữ っ trong từ きって"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "reply": "Agent received: Hướng dẫn em đọc âm ngắt chữ っ trong từ きって | Plan: plan:Hướng dẫn em đọc âm ngắt chữ っ trong từ きって"
  }
  ```
- **Response Lỗi (400 Bad Request)**:
  ```json
  {
    "error": "Prompt is required."
  }
  ```

### 4.2. `GET /api/pdftree`
- **Mô tả**: Lấy toàn bộ cây thư mục và danh sách file PDF trong thư mục `data/pdfs`.
- **Response (200 OK)**:
  ```json
  [
    {
      "type": "folder",
      "name": "iq",
      "children": [
        {
          "type": "file",
          "name": "iq_test_level1.pdf",
          "relativePath": "iq/iq_test_level1.pdf"
        }
      ]
    },
    {
      "type": "file",
      "name": "Preschool Worksheets PDF Book.pdf",
      "relativePath": "Preschool Worksheets PDF Book.pdf"
    }
  ]
  ```

### 4.3. `GET /api/pdfs`
- **Mô tả**: Lấy danh sách phẳng toàn bộ đường dẫn tương đối của các file PDF có trong hệ thống.
- **Response (200 OK)**:
  ```json
  [
    "iq/iq_test_level1.pdf",
    "Preschool Worksheets PDF Book.pdf",
    "Tìm điểm khác nhau.pdf"
  ]
  ```

### 4.4. `GET /health`
- **Mô tả**: Kiểm tra trạng thái sẵn sàng của backend.
- **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "service": "appflash-ai-agent"
  }
  ```

---

## 5. MÔ HÌNH DỮ LIỆU (DATA MODEL)

### 5.1. Cơ sở dữ liệu SQLite (`data/agent.db`)
Bảng `memory`:
| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Khóa chính tự tăng |
| `prompt` | TEXT | NOT NULL | Yêu cầu / câu hỏi của người dùng |
| `plan` | TEXT | NOT NULL | Kế hoạch do Planner tạo ra |
| `tool_output` | TEXT | NOT NULL | Kết quả thực thi từ công cụ |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Thời điểm ghi nhận |

### 5.2. Cấu trúc dữ liệu thẻ từ vựng JSON (`data/*.json`)
```json
[
  {
    "id": 1,
    "kanji": "日",
    "reading": "ひ / にち",
    "romaji": "hi / nichi",
    "emoji": "☀️",
    "vietnamese": "Mặt trời, ngày",
    "english": "Sun, day",
    "example": "きょう は いい ひ です。",
    "example_vi": "Hôm nay là một ngày đẹp trời."
  }
]
```

---

## 6. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

### 6.1. Hiệu năng & Khả năng phản hồi (Performance)
- Giao diện người dùng phản hồi tương tác tức thì (< 100ms cho các thao tác lật thẻ, chạm chọn).
- Tải trang ban đầu và render thẻ từ JSON diễn ra trong vòng dưới 1 giây.
- Canvas vẽ mượt mà đạt chuẩn 60 FPS, không gây giật lag khi trẻ thao tác tô vẽ liên tục.

### 6.2. Tính khả dụng & Thân thiện người dùng (Usability & Accessibility)
- Giao diện trực quan, màu sắc sinh động, cỡ chữ to (font size lớn 40px – 150px) phù hợp thị giác trẻ nhỏ.
- Sử dụng Emoji phổ biến thay cho hình ảnh cồng kềnh giúp tiết kiệm tài nguyên và thân thiện với trẻ em.
- Tương thích tối ưu cho các thiết bị màn hình cảm ứng (iPad, máy tính bảng Android, điện thoại).

### 6.3. Tính bảo mật & Riêng tư (Security & Privacy)
- Toàn bộ dữ liệu xử lý âm thanh phát âm và ghi nhận giọng nói được thực thi cục bộ qua trình duyệt (Web Speech API), đảm bảo không rò rỉ dữ liệu giọng nói của trẻ em ra ngoài máy chủ lạ tính phí.
- Cơ sở dữ liệu lưu trữ nội bộ bằng SQLite dạng file gọn nhẹ, không yêu cầu phân quyền phức tạp.

### 6.4. Tính độc lập & Khả năng chạy Offline (Reliability & Offline First)
- Toàn bộ tài nguyên âm thanh (TTS), chữ cái, dữ liệu JSON và tài liệu PDF được đóng gói và phục vụ trực tiếp từ máy chủ nội bộ.
- Có khả năng hoạt động tốt trong mạng LAN nội bộ hoặc môi trường không có kết nối Internet tốc độ cao.

---

## 7. ĐỊNH HƯỚNG MỞ RỘNG (FUTURE ROADMAP)

1. **Chấm điểm phát âm bằng mô hình AI chuyên sâu**: Tích hợp Whisper hoặc các mô hình STT chuyên cho trẻ em nói tiếng Nhật để nâng cao độ chính xác nhận diện ngữ điệu (Pitch Accent).
2. **AI Sinh bài tập tự động (AI-generated Worksheets)**: Tự động tổng hợp các từ vựng trẻ hay phát âm sai để xuất ra file PDF bài tập riêng biệt.
3. **Bảng điều khiển cho phụ huynh (Parent Dashboard)**: Theo dõi biểu đồ tiến bộ học tập, thống kê thời gian học và tỷ lệ nhớ từ theo từng tuần.
4. **Hệ thống phần thưởng ảo (Gamification Gamified Economy)**: Bổ sung huy hiệu, sao thưởng, nuôi thú ảo để tăng động lực học tập mỗi ngày cho bé.

