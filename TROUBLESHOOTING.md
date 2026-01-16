# Troubleshooting - Hot Module Replacement (HMR)

## Vấn đề: Phải restart dev server mỗi khi code

### Giải pháp 1: Clear cache và restart

```bash
# Xóa cache Next.js
rm -rf .next

# Xóa node_modules và reinstall (nếu cần)
rm -rf node_modules
npm install

# Restart dev server
npm run dev
```

### Giải pháp 2: Clear browser cache

1. Mở Chrome DevTools (F12)
2. Right-click vào nút Reload
3. Chọn "Empty Cache and Hard Reload"
4. Hoặc vào Application > Clear storage > Clear site data

### Giải pháp 3: Disable Service Worker trong Dev Mode

Service Worker đã được tự động disable trong development mode. Nếu vẫn gặp vấn đề:

1. Mở Chrome DevTools (F12)
2. Vào Application > Service Workers
3. Unregister tất cả service workers
4. Reload trang

### Giải pháp 4: Kiểm tra file watching

Nếu đang dùng WSL hoặc Docker, có thể cần enable polling:

File `next.config.ts` đã được cấu hình với:
```typescript
webpackDevMiddleware: (config) => {
  config.watchOptions = {
    poll: 1000,
    aggregateTimeout: 300,
  };
  return config;
}
```

### Giải pháp 5: Kiểm tra port conflict

```bash
# Kiểm tra port 3000 có đang được sử dụng không
lsof -i :3000

# Nếu có, kill process hoặc dùng port khác
npm run dev -- -p 3001
```

### Giải pháp 6: Update Next.js và dependencies

```bash
npm update next react react-dom
```

### Giải pháp 7: Kiểm tra TypeScript errors

TypeScript errors có thể block HMR:

```bash
npm run lint
```

Sửa tất cả lỗi TypeScript/ESLint.

## Best Practices

1. **Luôn chạy dev server trong terminal riêng** - không chạy trong background
2. **Không edit files trong `.next/`** - đây là build output
3. **Clear cache định kỳ** - nếu thấy behavior lạ
4. **Kiểm tra console** - có thể có errors block HMR

## Kiểm tra HMR có hoạt động

1. Mở browser console
2. Edit một file component
3. Bạn sẽ thấy message: "Fast Refresh" hoặc "HMR update"
4. Nếu không thấy, có thể HMR không hoạt động

## Nếu vẫn không được

1. Tạo issue với thông tin:
   - OS version
   - Node.js version
   - Next.js version
   - Browser và version
   - Error messages từ console

