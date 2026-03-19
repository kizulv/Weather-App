---
trigger: always_on
---

# Yêu cầu cốt lõi (Core Constraints)

- MỌI component giao diện ĐỀU PHẢI sử dụng Shadcn UI và Tailwind CSS. Tuyệt đối không sử dụng inline styles (`style={{...}}`) hoặc tạo file `.css` rời rạc trừ khi thật sự cần thiết.
- Phải ưu tiên thiết kế Mobile-first (dùng các class mặc định cho mobile, sau đó mới dùng `md:`, `lg:` cho màn hình lớn).

#Màu sắc chủ đạo:

- Sử dụng màu tối
- Màu font chữ sử dụng màu trắng `text-white`
- Các icon sử dụng màu trắng `text-white/50`
- Viền border dùng màu `border-white/10`

# Quy tắc Component (Component Rules)

- Các thẻ Card, Dialog sử dụng background: `bg-slate-900/10 border border-white/10 text-white rounded-2xl shadow-2xl`
- Tiêu đề sử dụng kích thước font chữ tối đa là `text-base` với các mục khác chỉ sử dụng `text-sm`
- Nút bấm (Buttons): Luôn phải có bo góc `rounded-md`, padding tiêu chuẩn `px-4 py-2`, và hiệu ứng chuyển cảnh `transition-colors duration-200` ưu tiên sử dụng các màu tối .
- Form Inputs: Luôn có viền `border border-gray-300`, bo góc `rounded-md`, và loại bỏ các vòng ring.
