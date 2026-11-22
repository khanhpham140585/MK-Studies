# Japanese Reading Teacher Agent - Requirements Specification

## 1. Project Overview

### Project Name
Japanese Reading Teacher Agent

### Purpose
Xây dựng AI Agent đóng vai giáo viên tiểu học Nhật Bản chuyên hỗ trợ trẻ 7 tuổi gặp khó khăn về đọc và phát triển ngôn ngữ.

Agent hỗ trợ:
- Học Hiragana
- Học Katakana
- Học trường âm (長音)
- Học âm ghép (拗音)
- Học âm ngắt (促音)
- Học đọc hiểu

### Target User

**Primary User**
- Trẻ 7 tuổi
- Học lớp 2 tại Nhật

**Secondary User**
- Phụ huynh
- Giáo viên hỗ trợ

---

## 2. Learning Profile

### Current Level

Child can:
- Nhận diện phần lớn Hiragana
- Biết một phần Katakana

Child struggles with:
- Đọc câu dài
- Trường âm (ー)
- Âm ghép (きゃ、きゅ、きょ)
- Âm ngắt (っ)
- Đọc hiểu

---

## 3. Core Features

### Feature 1: Hiragana Training

**Goal**
Củng cố khả năng nhận diện và đọc Hiragana.

**Functions**
- Nhận diện chữ
- Ghép chữ thành từ
- Đọc từ
- Đọc câu ngắn

**Success Criteria**
- Đọc chính xác ≥ 90% Hiragana
- Đọc từ 2–4 chữ không cần trợ giúp

### Feature 2: Katakana Training

**Goal**
Tăng khả năng đọc Katakana.

**Functions**
- Học theo nhóm ký tự
- Nhận diện chữ
- Ghép từ đơn giản
- Đọc từ mượn

**Success Criteria**
- Đọc chính xác ≥ 80% Katakana cơ bản

### Feature 3: Long Vowel Training (長音)

**Goal**
Phân biệt trường âm.

**Functions**
- So sánh từ gần giống nhau
- Nghe và đọc
- Chọn đáp án đúng

**Examples**
- おばさん / おばあさん
- ケーキ / ケキ

**Success Criteria**
- Phân biệt đúng ≥ 80%

### Feature 4: Blended Sounds Training (拗音)

**Goal**
Đọc chính xác âm ghép.

**Functions**
- Dạy きゃ、きゅ、きょ
- Đọc từ chứa âm ghép

**Examples**
- きょう
- きゃく
- りょこう

**Success Criteria**
- Đọc chính xác ≥ 80%

### Feature 5: Small Tsu Training (促音)

**Goal**
Đọc âm ngắt.

**Functions**
- So sánh từ có và không có っ
- Luyện đọc

**Examples**
- きて / きって
- さか / サッカー

**Success Criteria**
- Đọc chính xác ≥ 80%

### Feature 6: Reading Comprehension

**Goal**
Hiểu nội dung sau khi đọc.

**Functions**
- Đọc câu ngắn
- Đọc đoạn ngắn
- Trả lời câu hỏi

**Example**
ねこ が います。

Q: なに が いますか？

A: ねこ

**Success Criteria**
- Trả lời đúng ≥ 70%

---

## 4. Teaching Method

Agent must follow:

1. Look
2. Listen
3. Repeat
4. Choose
5. Reward

Every lesson:
- 5–10 phút
- Tối đa 1 kỹ năng chính
- Không quá 5 từ mới

---

## 5. Lesson Generator

### Lesson Structure

1. Lesson Goal
2. Materials
3. Practice
4. Quiz
5. Reward Message

---

## 6. Student Assessment

Agent shall evaluate:

- Hiragana mastery
- Katakana mastery
- Long vowel mastery
- Blended sound mastery
- Small tsu mastery
- Reading comprehension

Score Range: 0–100

---

## 7. Progress Tracking

Store:
- Date
- Lesson
- Score
- Notes

Example:

- Date: 2026-06-08
- Skill: Long Vowels
- Score: 8/10

---

## 8. Personalization

Agent shall adapt difficulty based on:

- Age
- Reading level
- Previous scores
- Mistake patterns

Difficulty Levels:
- L1 Beginner
- L2 Basic Reader
- L3 Developing Reader
- L4 Independent Reader

---

## 9. Safety Requirements

Agent must NOT:

- Diagnose autism
- Diagnose language disorders
- Provide medical advice
- Replace therapists

Agent should recommend professional support when concerns exceed educational scope.

---

## 10. Technical Requirements

### Backend
- Node.js
- TypeScript
- Express

### Database
- SQLite

### Modules
- Teacher Agent
- Lesson Generator
- Assessment Engine
- Progress Tracker
- Memory Service

### Optional
- Speech Recognition
- Text To Speech
- Parent Dashboard

---

## 11. Future Features

- Voice reading practice
- Pronunciation scoring
- AI-generated worksheets
- Flashcards
- Kanji introduction
- Parent progress reports
- Multi-student support
