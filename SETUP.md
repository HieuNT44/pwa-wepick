# Hướng dẫn Setup Project

## Bước 1: Cài đặt Dependencies

```bash
npm install
```

Hoặc nếu dùng yarn/pnpm:

```bash
yarn install
# hoặc
pnpm install
```

## Bước 2: Tạo Icons cho PWA

Bạn cần tạo 2 file icon trong thư mục `public/`:

- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)

**Cách tạo icons:**

1. Sử dụng online tools:
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator
   - https://www.favicon-generator.org/

2. Hoặc tạo thủ công với image editor (Photoshop, Figma, etc.)

3. Đặt tên file chính xác:
   - `public/icon-192x192.png`
   - `public/icon-512x512.png`

## Bước 3: Chạy Development Server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

**Lưu ý:** Service Worker chỉ hoạt động trong production mode, không hoạt động trong development.

## Bước 4: Build và Test PWA

1. **Build production:**

```bash
npm run build
```

2. **Start production server:**

```bash
npm start
```

3. **Mở trong trình duyệt:**
   - Chrome/Edge: http://localhost:3000
   - Kiểm tra Service Worker trong DevTools > Application > Service Workers

4. **Test PWA features:**
   - Install app: Click icon install trong address bar
   - Offline mode: DevTools > Application > Service Workers > Check "Offline"
   - Lighthouse: DevTools > Lighthouse > Run PWA audit

## Bước 5: Thêm Components từ shadcn/ui

```bash
npx shadcn@latest add [component-name]
```

Ví dụ:

```bash
npx shadcn@latest add alert
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
```

## Troubleshooting

### Icons không hiển thị
- Đảm bảo file icons tồn tại trong `public/`
- Kiểm tra tên file chính xác (icon-192x192.png, icon-512x512.png)
- Clear cache và reload

### Service Worker không đăng ký
- Chỉ hoạt động trong production mode
- Đảm bảo đã chạy `npm run build && npm start`
- Kiểm tra console để xem lỗi

### PWA không installable
- Kiểm tra manifest.webmanifest có đúng format
- Đảm bảo có đủ icons
- PWA cần HTTPS (hoặc localhost cho development)

