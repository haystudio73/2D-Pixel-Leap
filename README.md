# 🎮 Pixel Leap: Retro 2D Platformer

<img width="1374" height="766" alt="image" src="https://github.com/user-attachments/assets/7beafc4a-449f-455b-b933-5a235feadafa" />

> **Pixel Leap** là tựa game đi cảnh (2D Platformer) mang phong cách **Cyberpunk Pixel Art** cổ điển kết hợp công nghệ hiện đại. Game sở hữu engine vật lý chính xác, hiệu ứng đồ họa đa lớp Parallax 60 FPS mượt mà, hệ thống bùa lợi phát sáng, chế độ Vô tận với Mini Boss ngẫu nhiên, hệ thống thời tiết sống động, âm thanh Chiptune hoài niệm và Bảng xếp hạng điểm cao trực tuyến.

---

## 🌟 Tính Năng Nổi Bật

### 1. 🗺️ Đa Dạng Chế Độ Chơi
- **Chế độ Chiến Dịch (Campaign Mode)**: Vượt qua các Sector được thiết kế công phu, thu thập tiền vàng, kích hoạt trạm Checkpoint lưu điểm hồi sinh và chạm đến Cổng Dịch Chuyển Không Gian (Exit Portal) để qua màn.
- **Chế độ Vô Tận (Endless Mode)**: Địa hình được kiến tạo ngẫu nhiên theo thuật toán (Procedural Generation). Càng chạy xa, độ khó càng tăng và tự động chuyển đổi giữa 4 vùng đất sinh thái (Biome) kỳ ảo sau mỗi 1200m.
- **Cảnh Trôi Menu Chính (Scenic Drifting Stage)**: Camera tự động lướt êm qua các cảnh quan sống động ngay tại màn hình chờ, tạo trải nghiệm thị giác ấn tượng.

---

### 2. 👾 Hệ Thống Random Mini Boss (Endless Mode)
Trong chế độ Vô tận, cứ mỗi **3 đến 5 phút** (khoảng 180s - 260s), một **Mini Boss Titan** hùng mạnh sẽ xuất hiện:
- **Còi báo động đỏ (Warning Siren)**: Báo động sớm 3 giây với âm thanh còi hú điện tử và biểu ngữ cảnh báo nhấp nháy đỏ `⚠️ WARNING: TITAN MECHA DETECTED! ⚠️`.
- **Thanh máu Boss (HUD Health Bar)**: Hiển thị thời gian thực lượng máu (HP), tên và danh hiệu của Boss trên đầu màn hình.
- **Chủng loại Boss theo Biome**:
  - 🏙️ **NEXUS DREADNOUGHT** (*Cyber City* - 6 HP): Cánh phản lực Cyber, phóng chùm tên lửa Plasma định vị và lao húc quét sàn.
  - 💎 **PRISM BEHEMOTH** (*Crystal Cavern* - 7 HP): Người đá pha lê lục bảo, bắn mảnh ngọc Prismatic Shards và dậm chấn động.
  - 🌋 **MAGMA PYRO-DRAKE** (*Volcanic Core* - 8 HP): Rồng máy nham thạch, phun 3 quả cầu lửa nóng chảy và lao bổ nhào.
  - 🌌 **ASTRAL CHRONOS** (*Starlight Citadel* - 8 HP): Thủ lĩnh không gian vô tận, bắn quả cầu Pulsar xoáy và dịch chuyển áp sát.
- **Cơ chế chiến đấu**:
  - **Dậm đầu (Stomp)**: Nhảy đạp lên đỉnh đầu/lõi Boss gây 1 sát thương (bật nẩy lên cao `-540 vy` và hồi lượt nhảy đúp).
  - **Lướt xuyên phá (Dash Smash / Shield Crush)**: Dùng kỹ năng lướt `SPEED_DASH` hoặc khi đang bật `SHIELD` đâm trực diện gây **2 sát thương cực mạnh**.
  - **Choáng váng (Vulnerable Phase)**: Sau mỗi đòn lao húc, Boss sẽ bị choáng 1.6s để lộ lõi năng lượng phát tia lửa vàng.
- **Phần thưởng hạ Boss**: Thưởng nóng **+3.000 Điểm**, rơi cơn mưa **6 Viên Ngọc Quý (Gems +500đ/viên)** và **1 Bùa lợi Huyền Thoại (Legendary Power-Up)**.

---

### 3. 🌦️ Hệ Thống 4 Vùng Đất (Biomes) & Thời Tiết Động (Dynamic Weather)
- 🏙️ **Sector 01 - Neon Metropolis (`CYBER_CITY`)**: Thành phố cyberpunk ngập tràn ánh đèn neon, trăng kỹ thuật số và xe bay lơ lửng. Đi kèm thời tiết **Mưa Điện Tử (`CYBER_RAIN`)** với vệt chớp sáng và giọt nước bắn trên bục.
- 💎 **Sector 02 - Subterranean Cavern (`CRYSTAL_CAVERN`)**: Hang động pha lê ngầm lấp lánh bào tử phát quang. Đi kèm thời tiết **Bão Ma Trận Dữ Liệu (`DATA_STREAM`)**.
- 🌋 **Sector 03 - Magma Foundry (`VOLCANIC_CORE`)**: Lõi núi lửa nóng chảy rực lửa, trăng máu và thác nham thạch sôi sục. Đi kèm thời tiết **Bão Tàn Tro Lửa (`EMBER_STORM`)**.
- 🌌 **Sector 04 - Celestial Realm (`STARLIGHT_CITADEL`)**: Pháo đài tinh vân giữa các vì sao và hố đen vũ trụ. Đi kèm thời tiết **Tuyết Vũ Trụ Lấp Lánh (`COSMIC_SNOW`)**.

---

### 4. ⚡ Hệ Thống Bùa Lợi Phát Sáng (Power-Ups)
- 👟 **Double Jump (Ngọc Lục Bảo)**: Cho phép nhảy thêm một lần giữa không trung.
- ⚡ **Speed Dash (Tia Sét Vàng)**: Tăng tốc độ di chuyển và kích hoạt khả năng lướt xuyên vật cản/tiêu diệt quái.
- 🧲 **Coin Magnet (Nam Châm Lam)**: Tự động hút tất cả tiền vàng và đá quý xung quanh trong phạm vi rộng.
- 🛡️ **Energy Shield (Khiên Chắn Lục)**: Hấp thụ và triệt tiêu 1 lần sát thương bất kỳ khi va chạm quái vật hoặc đạn Boss.
- ⏳ **Time Warp (Bẻ Cong Thời Gian Tím)**: Làm chậm chuyển động của môi trường và kẻ địch xung quanh.

---

### 5. 🧑‍🚀 Bộ Sưu Tập Nhân Vật (Character Customization)
Hệ thống 6 Avatar Cyber độc quyền có hoạt ảnh chân thực và màu sắc ánh sáng riêng biệt:
1. **Pixel Runner (Mặc định)**: Tia sáng Cyan & Áo giáp Xanh Navy.
2. **Cyber Ninja**: Mở khóa khi đạt 5.000 điểm hoặc vượt Sector 1.
3. **Void Phantom**: Mở khóa khi đạt 12.000 điểm hoặc vượt Sector 2.
4. **Neon Valkyrie**: Mở khóa khi đạt 25.000 điểm hoặc vượt Sector 3.
5. **Solar Vanguard**: Mở khóa khi đạt 40.000 điểm hoặc vượt Sector 4.
6. **Quantum Overlord**: Mở khóa khi đạt 60.000 điểm.

---

### 6. 🎯 Hệ Thống Nhiệm Vụ Hàng Ngày & Kinh Tế Cyber Credits (Daily Missions)
Hệ thống **Nhiệm Vụ Hàng Ngày (Daily Missions & Bounties)** tạo ra 3 thử thách độc đáo mỗi ngày và phần thưởng tiền tệ hấp dẫn:
- **Tự động làm mới mỗi ngày (Daily Reset at 00:00)**: Đồng hồ đếm ngược thời gian thực đến thời điểm 00:00 hàng ngày để tái thiết lập 3 thử thách mới theo thuật toán mã hóa ngày (Seeded PRNG).
- **3 Nhóm thử thách cân bằng**:
  - 🪙 **Nhóm Thu Thập Tiền Tài**: Thu thập 40 - 75 đồng tiền vàng hoặc đá quý (*Coin Collector / Treasury Raider*).
  - ⚡ **Nhóm Nhanh Nhẹn & Di Chuyển**: Thực hiện 60 - 120 cú nhảy/nhảy đúp (*High Altitude Acrobat*) hoặc 20 - 40 cú lướt siêu tốc (*Sonic Velocity*).
  - 🛡️ **Nhóm Chiến Đấu & Thử Thách**: Chạy cự ly 800m - 1.500m (*Endless Marathon*), tiêu diệt 8 - 15 quái vật bằng đạp đầu hoặc lướt (*Drone Destroyer*), nhặt 4 - 6 bùa lợi (*Cyber Energized*), tiêu diệt Titan Mini-Boss (*Titan Slayer*) hoặc vượt màn Campaign (*Sector Liberator*).
- **Kinh tế Ví Tiền Tệ (Cyber Credits Wallet)**:
  - Tích lũy tiền thưởng Cyber Credits khi bấm nhận thưởng (**CLAIM**) cho từng nhiệm vụ (+160đ - +350đ).
  - **Phần thưởng Hoàn Thành 3/3 (Daily Mastery Bonus)**: Hoàn thành toàn bộ 3 nhiệm vụ trong ngày nhận thêm **+300 Cyber Credits**.
  - Ví Cyber Credits được hiển thị trực tiếp trên Menu chính, bảng HUD và cửa sổ tùy biến nhân vật.
- **Thông báo hoàn thành trực quan (Real-time Toast & Sound FX)**: Ngay khi đạt mốc thử thách trong lúc chơi, âm thanh chiến thắng vang lên kèm banner thông báo nhấp nháy trên màn hình để người chơi có thể bấm mở nhận quà ngay lập tức.
- **Phím tắt nhanh**: Nhấn phím `M` bất kỳ lúc nào để mở/đóng bảng nhiệm vụ hàng ngày.

---

### 7. 🏆 Bảng Xếp Hạng Trực Tuyến & CSDL SQLite
- Tích hợp động cơ cơ sở dữ liệu nhẹ **SQLite (`sql.js`)** lưu trữ bảng vàng Arcade High Scores.
- Ghi nhận thông tin: Thứ hạng (Rank), Tên người chơi, Điểm số, Số Coin, Quãng đường (Distance) và Chế độ chơi.
- Tự động đánh dấu vị trí xếp hạng mới đạt được với hiệu ứng phát sáng lấp lánh.

---

### 8. 🎵 Âm Thanh & Âm Nhạc Chiptune Siêu Mượt
- **Bộ tổng hợp âm thanh kép (Dual Audio Engine)**:
  - **Procedural Synthesizer**: Sử dụng Web Audio API tổng hợp âm sắc 8-bit sống động mà không tốn dung lượng tải.
  - **WAV Sound Pack**: Các hiệu ứng âm thanh chất lượng cao.
- 4 bản nhạc nền đặc sắc: *Cyber Odyssey, Neon Velocity, Synthwave Sunset, 8-Bit Adrenaline*.
- Bật/tắt và điều chỉnh âm lượng riêng biệt cho Nhạc nền (BGM) và Hiệu ứng (SFX).

---

### 9. ⚙️ Tùy Chỉnh Đồ Họa & Tối Ưu Hóa Phần Cứng
Hỗ trợ đầy đủ menu Settings chuyên sâu:
- **Tốc độ khung hình (FPS Target)**: 30 FPS / 60 FPS / 120 FPS / 144 FPS / Không giới hạn (Uncapped).
- **Chất lượng hạt (Particle Quality)**: Cao (Ultra) / Vừa (Medium) / Tối thiểu (Low) / Tắt (Off).
- **Hiệu ứng thời tiết (Weather Quality)**: Ultra, Medium, Low, Off.
- **Hiệu ứng Parallax**: 3 lớp phối cảnh mượt mà.
- **Bộ lọc CRT Retro (Scanlines)**: Off / Nhẹ (Subtle) / Cổ điển (Classic Arcade CRT).
- **Rung màn hình (Screen Shake)**: Tắt / Nhẹ / Đầy đủ (Full).
- **Chế độ tiết kiệm pin (Low Power Mode)**: Dành cho thiết bị di động hoặc máy cấu hình yếu.

---

## 🕹️ Hướng Dẫn Điều Khiển (Controls)

### ⌨️ Trên Máy Tính (Keyboard)
| Hành Động | Phím Bấm Chính | Phím Phụ |
| :--- | :--- | :--- |
| **Di chuyển trái / phải** | Phím mũi tên `←` / `→` | Phím `A` / `D` |
| **Nhảy / Nhảy đúp** | Phím cách `Space` | Phím mũi tên `↑` / Phím `W` |
| **Lướt siêu tốc (Dash)** | Phím `Shift` (Trái/Phải) | Phím `J` / `K` |
| **Nhảy xuống bục một chiều** | Phím mũi tên `↓` + `Space` | Phím `S` + `Space` |
| **Bảng Nhiệm Vụ Hàng Ngày (Daily Missions)** | Phím `M` | Nút Huy hiệu trên HUD / Menu |
| **Tùy biến nhân vật (Hero Skins)** | Phím `C` | Nút HERO trên Menu / HUD |
| **Cài đặt hệ thống & Âm thanh** | Phím `O` | Nút CONFIG trên Menu |
| **Tạm dừng (Pause)** | Phím `P` | Phím `Escape` |
| **Chơi lại nhanh** | Phím `R` (tại màn hình Pause / Game Over) | — |

---

### 📱 Trên Điện Thoại & Máy Tính Bảng (Touch Screen)
- **Nút D-Pad ảo bên trái**: Chạm giữ để di chuyển trái / phải hoặc cúi người.
- **Nút Nhảy `JUMP` (Màu xanh neon)**: Nhấn 1 lần để nhảy, nhấn 2 lần để nhảy đúp.
- **Nút Lướt `DASH` (Màu vàng ánh kim)**: Nhấn để lướt vọt về phía trước.
- **Nút Tạm dừng `PAUSE`**: Góc trên cùng để tạm dừng trò chơi bất kỳ lúc nào.

---

## 🚀 Cài Đặt & Chạy Dự Án

### Yêu Cầu Môi Trường
- **Node.js**: Phiên bản `>= 18.0.0`
- **NPM** hoặc **Yarn** / **PNPM**

### Các Bước Cài Đặt

1. **Cài đặt các gói phụ thuộc (Dependencies)**:
   ```bash
   npm install
   ```

2. **Khởi chạy máy chủ phát triển (Development Server)**:
   ```bash
   npm run dev
   ```
   *Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:3000`*

3. **Kiểm tra cú pháp & TypeScript Linter**:
   ```bash
   npm run lint
   ```

4. **Đóng gói sản phẩm (Production Build)**:
   ```bash
   npm run build
   ```

5. **Khởi chạy bản Build**:
   ```bash
   npm start
   ```

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
├── index.html                   # File HTML chính, cấu hình viewport & font Press Start 2P
├── server.ts                    # Máy chủ Express tích hợp Vite middleware
├── package.json                 # Cấu hình dự án và danh sách thư viện
├── metadata.json                # Thông tin metadata của ứng dụng
├── src/
│   ├── main.tsx                 # Điểm khởi đầu ứng dụng React
│   ├── App.tsx                  # Game loop chính, quản lý state và tích hợp hệ thống
│   ├── index.css                # Cấu hình Tailwind CSS & keyframe animations
│   ├── components/              # Các thành phần giao diện người dùng (UI Components)
│   │   ├── HUD.tsx              # Thanh thông số người chơi (Máu, Điểm, Coin, Bùa lợi)
│   │   ├── TitleScreen.tsx      # Màn hình chính bắt đầu game
│   │   ├── CharacterSelectModal.tsx # Giao diện chọn & tùy biến nhân vật Cyber
│   │   ├── LevelSelectModal.tsx # Giao diện chọn màn chơi Chiến dịch
│   │   ├── LevelClearModal.tsx  # Giao diện tổng kết khi hoàn thành màn
│   │   ├── GameOverModal.tsx    # Giao diện khi hết mạng, nhập tên lưu điểm cao
│   │   ├── PauseModal.tsx       # Giao diện tạm dừng trò chơi
│   │   ├── LeaderboardModal.tsx # Bảng xếp hạng High Scores trực tuyến (SQLite)
│   │   ├── SettingsModal.tsx    # Menu cài đặt đồ họa, phần cứng & điều khiển
│   │   ├── AudioSettingsModal.tsx # Menu cài đặt âm lượng & danh sách nhạc BGM
│   │   └── TouchControls.tsx    # Bộ nút điều khiển cảm ứng trên Mobile
│   └── game/                    # Game Engine Logic & Hệ thống game
│       ├── types.ts             # Định nghĩa toàn bộ kiểu dữ liệu (Player, Boss, Biome, PowerUp...)
│       ├── renderer.ts          # Bộ vẽ Canvas 2D: Parallax, Boss, Thời tiết, Hạt, Ánh sáng
│       ├── physics.ts           # Engine tính toán va chạm, trọng lực, gia tốc, bục di động
│       ├── levels.ts            # Dữ liệu 4 màn Chiến dịch & Thuật toán tạo màn Vô tận
│       ├── boss.ts              # Trí tuệ nhân tạo (AI) và cơ chế chiến đấu của Mini Boss
│       ├── weather.ts           # Hệ thống tạo và chuyển đổi thời tiết ngẫu nhiên
│       ├── characters.ts        # Thuộc tính và chỉ số của 6 Avatar nhân vật
│       ├── audio.ts             # Web Audio API Synthesizer & Bộ phát âm thanh WAV
│       ├── settings.ts          # Quản lý cài đặt LocalStorage & Tối ưu hóa hiệu năng
│       ├── leaderboard.ts       # Tương tác với CSDL SQLite lưu trữ điểm cao
│       └── checkpoints.ts       # Quản lý lưu trữ & hồi sinh tại trạm kiểm soát
```

---

## 🎯 Mẹo Chơi Đạt Điểm Cao

1. **Tận dụng Bùa Lợi**: Thu thập nam châm vàng (`COIN_MAGNET`) kết hợp với lướt siêu tốc (`SPEED_DASH`) để dọn sạch toàn bộ tiền vàng và ngọc quý trên đường chạy.
2. **Kỹ Thuật Đạp Đầu Boss**: Khi Mini Boss chuẩn bị lao húc (`CHARGING`), hãy canh nhịp nhảy lên trên cao và đạp thẳng vào đầu Boss để gây sát thương và được bật nẩy an toàn.
3. **Bảo Toàn Khiên Chắn**: Luôn ưu tiên giữ khiên năng lượng (`SHIELD`) để tránh mất mạng bất ngờ trước các bẫy gai (`SPIKE`) và hố sâu.
4. **Nhảy Xuống Bục**: Nhấn `↓ + Space` để nhanh chóng rơi xuống các bục mỏng (One-Way Platforms) né đạn của Boss hoặc kẻ địch bay (`FLYER`).

---

**Chúc bạn có những giây phút giải trí tuyệt vời cùng Pixel Leap!** 🚀✨
