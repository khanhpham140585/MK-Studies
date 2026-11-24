# Kế hoạch Nâng cấp Memory Game: Mở rộng 50 Levels & Hệ thống 5 Lượt Trái Tim (❤️ Hearts)

Tài liệu này tổng hợp khảo sát hiện trạng trò chơi **Memory Game** trong [`src/base.html`](file:///d:/workspaces/AI/APPFLASH/src/base.html), đồng thời đưa ra kiến trúc thiết kế chi tiết để mở rộng lên **50 cấp độ (Max Level 50)** và bổ sung **hệ thống 5 lượt chơi bằng biểu tượng trái tim (❤️)**.

---

## 1. Trả lời Câu hỏi về Trò chơi Nối từ (`src/Noitu.html`)

> **Hỏi**: *"Hiện tại có 6 hình emoji cho chọn, sau khi thay đổi vẫn còn chế độ này chứ?"*  
> **Trả lời**: **CÓ, 100% giữ nguyên chế độ 6 ô Emoji lựa chọn!**  
> Giao diện lưới 6 ô (gồm 1 đáp án đúng và 5 đáp án sai ngẫu nhiên) hoàn toàn không thay đổi về hình thức và cách chơi. Việc nâng cấp dữ liệu sang 3 cấp độ (Grade 1, 2, 3) chỉ giúp mở rộng kho từ vựng và emoji từ 30 từ lên **470 từ phong phú**, giúp câu hỏi đa dạng và không bao giờ bị trùng lặp.

---

## 2. Khảo sát & Phân tích Memory Game Hiện tại

### 2.1. Vị trí & Cấu trúc Mã nguồn
Toàn bộ Memory Game hiện nằm trong [`src/base.html`](file:///d:/workspaces/AI/APPFLASH/src/base.html):
- **Khởi tạo & Điều khiển**: `openMemoryGame()`, `loadMemoryGame()`, `startLevel(level)`.
- **Logic lật thẻ & So khớp**: `onCardClick(card)`.
- **Trạng thái game (`mgState`)**:
  ```javascript
  let mgState = {
    level: 1, score: 0, moves: 0, time: 0, timerId: null,
    firstFlip: null, secondFlip: null, lock: false, matches: 0,
    totalPairs: 0, startTime: null
  };
  ```
- **Dữ liệu level hiện tại (`memoryLevels`)**:
  - Đang là mảng cứng gồm **8 level** (`['A','A','B','B']` ... `['A','A', ... 'J','J']`).
  - Dữ liệu thẻ hiển thị chỉ lấy từ danh sách chữ cái tiếng Anh [`englishAbcCards`](file:///d:/workspaces/AI/APPFLASH/src/base.html#L583).

### 2.2. Các Hạn chế Cần Khắc phục
1. **Giới hạn chỉ 8 levels**: Người chơi hoàn thành rất nhanh và không có thử thách dài hạn.
2. **Không có giới hạn lượt sai (Không có cơ chế Game Over)**: Người chơi có thể lật sai bao nhiêu lần tùy ý mà không bị phạt.
3. **Điểm số bị reset về 0 ở mỗi level**: `startLevel()` đặt lại `mgState.score = 0`, khiến điểm số không được tích lũy xuyên suốt hành trình leo level.

---

## 3. Thiết kế Nâng cấp: Max Level 50 & Hệ thống 5 Lượt Chơi (❤️ Hearts)

### 3.1. Hệ thống Lượt chơi Trái Tim (❤️ Hearts System)
- **Số lượt ban đầu**: Người chơi bắt đầu hành trình với **5 lượt** (`maxLives = 5`).
- **Hiển thị trực quan trên thanh trạng thái**:
  `<div class="game-stats">Lives: <span id="mgLives">❤️❤️❤️❤️❤️</span></div>`
- **Khi lật sai (Match False)**:
  - Khi 2 thẻ lật lên không khớp nhau:
    - Trừ **1 lượt**: `mgState.lives--`.
    - Cập nhật hiển thị (ví dụ còn 4 tim: `❤️❤️❤️❤️🖤` hoặc `❤️❤️❤️❤️`).
    - Thẻ tự động úp lại sau 1 giây như hiện tại.
- **Khi hết lượt (`mgState.lives <= 0`) - DỪNG CUỘC CHƠI (Game Over)**:
  - Ngay lập tức dừng đồng hồ tính giờ (`stopTimer()`).
  - Khóa bàn cờ (`mgState.lock = true`).
  - Xuất hiện Popup **Game Over & Tổng kết Thành tích**:
    - Tiêu đề: `💔 Game Over!`
    - Báo cáo kết quả:
      - 🏆 **Tổng điểm tích lũy**: `Score` (Tổng điểm đạt được từ Level 1 đến lúc thua).
      - 🎯 **Cấp độ cao nhất đạt được**: `Level X / 50`.
      - ⏱️ **Tổng thời gian đã chơi**: `Time`.
      - 👣 **Tổng số bước đi**: `Total Moves`.
    - Nút bấm: **Chơi lại từ đầu** (`Chơi lại từ Level 1`) hoặc **Về Menu**.
- **Khi Vượt qua mỗi Level (Level Up)**:
  - Hoàn thành tất cả các cặp của level:
    - **Thưởng thêm 1 lượt**: `mgState.lives = Math.min(5, mgState.lives + 1)`.
    - Đảm bảo **tối đa không bao giờ vượt quá 5 lượt**.
    - Điểm số được bảo toàn và cộng dồn tiếp tục cho level kế tiếp.
    - Popup chiến thắng hiện số tim còn lại và nút "Next Level".

```
                       [ Bắt đầu Game: 5 Lượt ❤️❤️❤️❤️❤️ ]
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
              【 LẬT ĐÚNG CẶP 】                【 LẬT SAI CẶP 】
         • +10 điểm tích lũy               • Bị trừ 1 lượt: lives - 1
         • Giữ nguyên trạng thái lật       • Thẻ tự úp lại sau 1s
         • Kiểm tra hết cặp level:         • Kiểm tra số lượt còn lại:
           └─► Level Up:                     ├─► Còn lượt: Chơi tiếp
               +1 lượt (tối đa 5 tim)        └─► Hết lượt (lives = 0):
               Chuyển sang level tiếp            [ GAME OVER ]
                                                 Tổng kết toàn bộ điểm
```

---

### 3.2. Thiết kế Cấu trúc 50 Cấp độ (Level Progression)

Để màn chơi không bị nhàm chán và kích thước bàn cờ vừa vặn với mọi màn hình thiết bị (điện thoại, iPad, laptop):
- Thay vì hardcode tĩnh 50 mảng trong mã nguồn, ta xây dựng **Hàm sinh level tự động (`generateLevelCards(level)`)**:
  - Số lượng cặp thẻ tăng dần theo thang độ khó hợp lý:
    - **Level 1 - 5 (Khởi động)**: 2 đến 4 cặp (4 - 8 thẻ) $\to$ Dễ, làm quen thao tác.
    - **Level 6 - 15 (Trung cấp)**: 5 đến 8 cặp (10 - 16 thẻ, bố cục 4x3 hoặc 4x4) $\to$ Vừa sức.
    - **Level 16 - 30 (Nâng cao)**: 9 đến 12 cặp (18 - 24 thẻ, bố cục 5x4 hoặc 6x4) $\to$ Cần tập trung cao.
    - **Level 31 - 50 (Bậc thầy / Master)**: 12 đến 16 cặp (24 - 32 thẻ, bố cục 6x5 hoặc 8x4) $\to$ Thử thách đỉnh cao.
  - **Kho hình ảnh phong phú**:
    - Lấy từ kho thẻ bài đồ sộ sẵn có trong project: 25 chữ cái `englishAbcCards`, hàng trăm từ vựng động vật/hoa quả `cardData`, tạo sự mới mẻ ở mỗi level khác nhau mà không bị trùng lặp chữ cái A-J đơn điệu.

---

### 3.3. Tự Co giãn Kích thước Thẻ bài (Responsive Card Sizing)

Khi số lượng thẻ bài lên đến 24 - 32 thẻ ở các level cao:
- Bổ sung CSS `clamp()` và dynamic columns để các thẻ bài tự thu nhỏ kích thước phù hợp với độ phân giải màn hình:
  ```css
  .board {
      display: grid;
      gap: 8px;
      justify-content: center;
      max-width: 95vw;
  }
  .card {
      width: clamp(60px, 8vw, 95px);
      height: clamp(75px, 10vw, 115px);
  }
  ```
- Đảm bảo toàn bộ bàn cờ luôn hiển thị trọn vẹn trong một khung nhìn mà không cần cuộn trang.

---

## 4. Kế hoạch Triển khai Chi tiết

| Bước | Nội dung công việc | Vị trí ảnh hưởng |
| :---: | :--- | :--- |
| **1** | **Bổ sung Hệ thống 5 Lượt (Lives) trong `mgState` & Giao diện** | - Thêm trường `lives: 5, maxLives: 5, totalScore: 0` vào `mgState`.<br/>- Thêm ô hiển thị `Lives: <span id="mgLives">❤️❤️❤️❤️❤️</span>` trên thanh điều khiển. |
| **2** | **Xử lý Logic Trừ Lượt & Game Over khi Lật Sai** | - Trong `onCardClick`: Khi 2 thẻ khác nhau $\to$ `mgState.lives--`.<br/>- Khi `lives === 0` $\to$ Kích hoạt `gameOver()`: Dừng timer, hiện popup tổng kết toàn bộ số điểm đã tích lũy. |
| **3** | **Xử lý Thưởng Lượt khi Hoàn thành Level (Level Up)** | - Trong `levelComplete()`: Cộng thêm 1 tim `lives = Math.min(5, lives + 1)`.<br/>- Lưu điểm tích lũy cộng dồn qua từng level (`score += 10`). |
| **4** | **Mở rộng Hệ thống Sinh 50 Cấp độ (`generateLevel(level)`)** | - Viết hàm tạo mảng cặp thẻ động cho 50 levels từ kho thẻ bài đa dạng.<br/>- Bố cục lưới tự động điều chỉnh số cột (`cols`). |
| **5** | **Thiết kế Popup Game Over & Hoàn thành Toàn bộ 50 Level** | - Popup Game Over với báo cáo: Tổng điểm, Level đạt được, Nút chơi lại Level 1.<br/>- Popup Chiến thắng toàn bộ 50 màn chơi với hiệu ứng pháo hoa Confetti. |
| **6** | **Kiểm thử Toàn diện & Typecheck** | - Test trừ tim khi lật sai, test hết tim báo Game Over và tổng kết điểm.<br/>- Test cộng 1 tim khi qua level mới.<br/>- Chạy `npm run typecheck`. |

---

## 5. Tiêu chuẩn Chấp nhận & Kế hoạch Kiểm thử

1. **Kiểm tra số lượt ban đầu**:
   - Khi bấm vào Memory Game: Bắt đầu ở Level 1 với đầy đủ 5 trái tim (`❤️❤️❤️❤️❤️`).
2. **Kiểm tra trừ lượt khi lật sai**:
   - Lật 2 thẻ khác nhau: Lượt giảm xuống 4 tim (`❤️❤️❤️❤️🖤` hoặc `❤️❤️❤️❤️`).
   - Lật sai tiếp 4 lần nữa: Lượt giảm về 0.
3. **Kiểm tra Game Over**:
   - Khi lượt về 0: Game lập tức dừng lại, hiện bảng tổng kết điểm số kiếm được từ đầu đến thời điểm thua.
   - Bấm nút chơi lại: Đưa người chơi về Level 1 với 5 lượt ban đầu.
4. **Kiểm tra hồi phục lượt khi Level Up**:
   - Khi đang còn 3 lượt, hoàn thành level: Số lượt tăng lên thành 4 lượt.
   - Khi đang có đủ 5 lượt, hoàn thành level: Số lượt giữ nguyên 5 (không vượt quá 5).
5. **Kiểm tra hành trình 50 Levels**:
   - Level tăng từ `1/50` lên đến `50/50`.
   - Các level có số thẻ tăng dần hợp lý và sử dụng hình ảnh phong phú.

---
Bạn vui lòng xem lại bản kế hoạch nâng cấp trên và bấm nút **Proceed** (hoặc để lại phản hồi) để tôi bắt đầu thực hiện!
