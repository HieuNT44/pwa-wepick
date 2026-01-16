# Quick Start Guide

## Các bước khởi tạo và chạy project

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Tạo icons cho PWA (bắt buộc)

Bạn cần tạo 2 file icon trong thư mục `public/`:

- `public/icon-192x192.png` (192x192 pixels)  
- `public/icon-512x512.png` (512x512 pixels)

**Cách nhanh nhất:** Sử dụng online tool như https://realfavicongenerator.net/ hoặc tạo thủ công.

### 3. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

**Lưu ý:** Service Worker chỉ hoạt động trong production mode.

### 4. Build và test PWA (production)

```bash
# Build
npm run build

# Start production server
npm start
```

Sau đó mở http://localhost:3000 và kiểm tra PWA features.

### 5. Kiểm tra PWA

1. **Chrome DevTools:**
   - F12 > Application tab
   - Kiểm tra Manifest, Service Workers, Cache Storage

2. **Lighthouse:**
   - F12 > Lighthouse tab
   - Chọn "Progressive Web App"
   - Click "Analyze page load"

3. **Test Offline:**
   - DevTools > Application > Service Workers
   - Check "Offline"
   - Reload trang

### 6. Thêm components từ shadcn/ui

```bash
npx shadcn@latest add [component-name]
```

Ví dụ:
```bash
npx shadcn@latest add alert
npx shadcn@latest add dropdown-menu
```

---

## Tóm tắt commands

```bash
# Install
npm install

# Development
npm run dev

# Production build & start
npm run build
npm start

# Lint
npm run lint

# Add shadcn component
npx shadcn@latest add [name]
```

---

## Cấu trúc chính

- `src/app/` - App Router pages
- `src/components/` - React components
- `src/components/ui/` - shadcn/ui components
- `public/` - Static files (manifest, icons, service worker)
- `components.json` - shadcn/ui config

---

Xem thêm chi tiết trong [README.md](./README.md) và [SETUP.md](./SETUP.md)

