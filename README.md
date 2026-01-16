# WePick PWA

Ứng dụng Progressive Web App (PWA) được xây dựng với Next.js 15, TypeScript, Tailwind CSS và shadcn/ui.

## Tính năng

- ✅ **PWA Support**: Service Worker, offline caching, installable
- ✅ **Next.js 15**: App Router, Server Components, TypeScript
- ✅ **Firebase**: Analytics integration với Firebase
- ✅ **shadcn/ui**: Component library với Radix UI
- ✅ **Dark Mode**: Theme toggle với next-themes
- ✅ **Responsive Design**: Mobile-first với Tailwind CSS
- ✅ **Offline Support**: Trang offline fallback và offline indicator

## Yêu cầu hệ thống

- Node.js 18+ 
- npm, yarn, hoặc pnpm

## Cài đặt

1. **Clone repository và cài đặt dependencies:**

```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

2. **Cấu hình Firebase (tùy chọn):**

Firebase đã được cấu hình với default values. Để sử dụng environment variables:

- Copy `.env.example` thành `.env.local`
- Cập nhật các giá trị Firebase nếu cần

```bash
cp .env.example .env.local
```

2. **Chạy development server:**

```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## Build và Deploy

1. **Build production:**

```bash
npm run build
# hoặc
yarn build
# hoặc
pnpm build
```

2. **Start production server:**

```bash
npm start
# hoặc
yarn start
# hoặc
pnpm start
```

**Lưu ý:** PWA chỉ hoạt động trong môi trường production. Service Worker sẽ không được đăng ký trong development mode.

## Kiểm tra PWA

### Chrome DevTools

1. Mở Chrome DevTools (F12)
2. Vào tab **Application**
3. Kiểm tra:
   - **Manifest**: Xem thông tin manifest
   - **Service Workers**: Kiểm tra service worker đã đăng ký
   - **Cache Storage**: Xem các file đã được cache
   - **Lighthouse**: Chạy PWA audit

### Lighthouse PWA Audit

1. Mở Chrome DevTools (F12)
2. Vào tab **Lighthouse**
3. Chọn **Progressive Web App**
4. Click **Analyze page load**
5. Kiểm tra các tiêu chí PWA:
   - ✅ Installable
   - ✅ Offline support
   - ✅ Fast loading
   - ✅ Responsive design

### Test Offline Mode

1. Build và start production server
2. Mở ứng dụng trong Chrome
3. Vào Chrome DevTools > **Application** > **Service Workers**
4. Check **Offline** để simulate offline mode
5. Reload trang và kiểm tra trang offline fallback

## Thêm Component từ shadcn/ui

Sử dụng CLI của shadcn/ui để thêm component mới:

```bash
npx shadcn@latest add [component-name]
```

Ví dụ:

```bash
# Thêm button (đã có sẵn)
npx shadcn@latest add button

# Thêm các component khác
npx shadcn@latest add alert
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add table
```

Xem danh sách đầy đủ tại: [shadcn/ui Components](https://ui.shadcn.com/docs/components)

## Cấu trúc Project

```
pwa-wepick/
├── public/
│   ├── manifest.webmanifest    # PWA manifest
│   ├── sw.js                    # Service Worker
│   ├── icon-192x192.png        # App icon 192x192
│   └── icon-512x512.png        # App icon 512x512
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── offline/
│   │   │   └── page.tsx        # Offline fallback page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── toast.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── navbar.tsx          # Navigation bar
│   │   ├── install-button.tsx  # PWA install button
│   │   ├── offline-indicator.tsx # Offline status indicator
│   │   ├── firebase-demo.tsx   # Firebase demo component
│   │   └── theme-provider.tsx  # Theme provider
│   ├── hooks/
│   │   ├── use-toast.ts        # Toast hook
│   │   └── use-analytics.ts    # Firebase Analytics hook
│   └── lib/
│       ├── firebase/
│       │   ├── config.ts        # Firebase configuration
│       │   └── index.ts         # Firebase exports
│       └── utils.ts            # Utility functions
├── components.json              # shadcn/ui config
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
├── .env.example                # Environment variables example
└── package.json
```

## PWA Configuration

### Manifest

File `public/manifest.webmanifest` chứa thông tin về ứng dụng:
- `name`: Tên đầy đủ của app
- `short_name`: Tên ngắn
- `start_url`: URL khởi động
- `display`: Chế độ hiển thị (standalone)
- `icons`: Icons cho các kích thước khác nhau

### Service Worker

File `public/sw.js` xử lý:
- Caching các file tĩnh
- Offline fallback
- Cache management

Service Worker chỉ được đăng ký trong production mode.

## Firebase Integration

### Sử dụng Firebase Analytics

Firebase Analytics đã được tích hợp sẵn. Sử dụng hook `useAnalytics`:

```typescript
import { useAnalytics } from "@/hooks/use-analytics";

function MyComponent() {
  const { trackEvent } = useAnalytics();
  
  const handleClick = () => {
    trackEvent("button_click", { button_name: "submit" });
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

### Track Page Views

Sử dụng hook `usePageView`:

```typescript
import { usePageView } from "@/hooks/use-analytics";

export default function MyPage() {
  usePageView("My Page");
  // ...
}
```

### Firebase Configuration

Firebase config được lưu trong `src/lib/firebase/config.ts`. 
Có thể override bằng environment variables trong `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
# ... các biến khác
```

### Thêm Firebase Services khác

Để thêm Firebase services khác (Auth, Firestore, Storage, etc.):

1. Cài đặt package tương ứng:
```bash
npm install firebase
```

2. Import và sử dụng trong `src/lib/firebase/config.ts`:
```typescript
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const auth = getAuth(app);
export const db = getFirestore(app);
```

## Customization

### Thay đổi Theme Colors

Chỉnh sửa CSS variables trong `src/app/globals.css`:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --background: 0 0% 100%;
  /* ... */
}
```

### Thêm Routes mới

Tạo file mới trong `src/app/`:

```typescript
// src/app/about/page.tsx
export default function About() {
  return <div>About Page</div>;
}
```

### Cập nhật Icons

Thay thế các file icon trong `public/`:
- `icon-192x192.png` (192x192px)
- `icon-512x512.png` (512x512px)
- `favicon.ico`

## Troubleshooting

### Service Worker không hoạt động

- Đảm bảo đang chạy production build (`npm run build && npm start`)
- Kiểm tra console để xem lỗi
- Clear cache và reload

### PWA không installable

- Kiểm tra manifest.webmanifest có đúng format
- Đảm bảo có icons đủ kích thước
- Kiểm tra HTTPS (required cho PWA)

### Dark mode không hoạt động

- Kiểm tra ThemeProvider đã wrap app trong layout.tsx
- Kiểm tra class "dark" được apply đúng

## License

MIT

## Tác giả

tms-hieunguyen2

