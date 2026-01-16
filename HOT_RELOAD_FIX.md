# Fix Hot Reload Issues

## Vấn đề
Mỗi khi save code lại bị lỗi 500, hot reload không hoạt động.

## Giải pháp đã áp dụng

### 1. Cấu hình Webpack với Polling
Đã thêm `watchOptions` với polling mode để đảm bảo file changes được detect đúng cách.

### 2. Disable Cache trong Dev
Đã disable webpack cache trong dev mode để tránh cache corrupt.

### 3. Scripts mới
- `npm run dev:clean` - Clean cache và chạy dev
- `npm run dev:webpack` - Chạy với webpack (không turbo)
- `npm run dev:fresh` - Clean hoàn toàn và chạy

## Cách sử dụng

### Khi gặp lỗi 500:
1. **Dừng dev server** (Ctrl+C hoặc Cmd+C)
2. **Chạy lại với clean:**
   ```bash
   npm run dev:clean
   ```

### Nếu vẫn lỗi:
```bash
npm run dev:webpack
```

### Nếu vẫn không được:
```bash
npm run clean
npm run dev
```

## Lưu ý
- Luôn dừng dev server trước khi clean
- Nếu dùng TurboPack (`--turbo`), thử chuyển sang webpack
- Polling mode có thể làm tăng CPU usage một chút nhưng đảm bảo HMR hoạt động ổn định

