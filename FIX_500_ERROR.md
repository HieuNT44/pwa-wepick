# Fix Lỗi 500 - routes-manifest.json

## Vấn đề
Lỗi `ENOENT: no such file or directory, open '.next/routes-manifest.json'` khi hot reload.

## Giải pháp

### Bước 1: Dừng dev server
Nhấn `Ctrl+C` hoặc `Cmd+C` để dừng dev server.

### Bước 2: Xóa cache
```bash
rm -rf .next node_modules/.cache .turbo
```

Nếu gặp lỗi permission, thử:
```bash
sudo rm -rf .next
```

### Bước 3: Restart dev server
```bash
npm run dev
```

Hoặc dùng script clean:
```bash
npm run dev:clean
```

## Lưu ý
- Luôn dừng dev server trước khi xóa `.next`
- Nếu vẫn lỗi, thử `npm run dev:webpack` (không dùng turbo)
- Lỗi này thường xảy ra khi Next.js cache bị corrupt sau hot reload
