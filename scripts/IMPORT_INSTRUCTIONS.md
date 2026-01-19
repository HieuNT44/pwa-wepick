# Hướng dẫn Import Players vào Firestore

## Bước 1: Tải Service Account Key

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project **we-pick-33fa3**
3. Vào **Project Settings** (⚙️) → **Service accounts**
4. Click **Generate new private key**
5. Tải file JSON về và đổi tên thành `serviceAccountKey.json`
6. Đặt file vào thư mục gốc của project (cùng cấp với `package.json`)

⚠️ **Lưu ý**: File này chứa thông tin bảo mật, đã được thêm vào `.gitignore` để không commit lên Git.

## Bước 2: Chạy script import

```bash
npm run import:players
```

Script sẽ:
- Đọc dữ liệu từ `src/data/users-example.json`
- Import vào collection `players` trong Firestore
- Sử dụng `id` từ JSON làm document ID
- Bỏ qua field `matchHistory` (không cần thiết)

## Bước 3: Kiểm tra kết quả

1. Vào [Firestore Console](https://console.firebase.google.com/project/we-pick-33fa3/firestore)
2. Kiểm tra collection `players`
3. Xác nhận đã có 8 documents được import

## Troubleshooting

### Lỗi: "serviceAccountKey.json not found"
- Đảm bảo file `serviceAccountKey.json` nằm ở thư mục gốc của project
- Kiểm tra tên file chính xác (phân biệt hoa/thường)

### Lỗi: "Permission denied"
- Kiểm tra Service Account có quyền **Cloud Datastore User** hoặc **Firebase Admin**
- Đảm bảo project ID trong serviceAccountKey.json đúng

### Lỗi: "Cannot find module"
- Chạy `npm install` để cài đặt dependencies
- Đảm bảo `firebase-admin` đã được cài đặt

