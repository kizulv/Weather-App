# Quy tắc dự án

Repository này là một ứng dụng `Next.js 16 + React 19 + TypeScript + Tailwind 4 + shadcn/ui + MongoDB`.

## Cách làm việc

- Luôn đọc các file đang quyết định hành vi hiện tại trước khi sửa. Khi luồng xử lý chưa rõ, hãy lần theo import theo cả chiều gọi vào và gọi ra.
- Ưu tiên thay đổi nhỏ nhất nhưng an toàn để giải quyết đúng yêu cầu. Không refactor lan sang khu vực không liên quan nếu người dùng không yêu cầu.
- Giữ nguyên ngôn ngữ thiết kế, cấu trúc component, và cách tổ chức route hiện có trừ khi có yêu cầu redesign.
- Ưu tiên tái sử dụng utility, schema, service, và pattern component sẵn có trước khi thêm abstraction mới.

## Yêu cầu cốt lõi

- Mọi component giao diện đều phải sử dụng `shadcn/ui` và `Tailwind CSS`.
- Tuyệt đối không dùng inline style như `style={{ ... }}`.
- Không tạo file `.css` rời rạc trừ khi thật sự cần thiết và đã có lý do rõ ràng.
- Phải ưu tiên thiết kế mobile-first: dùng class mặc định cho mobile trước, sau đó mới mở rộng bằng `md:`, `lg:`, hoặc breakpoint lớn hơn.

## Quy ước giao diện

- Font chữ mặc định dùng `text-xs`.
- Các tiêu đề có thể dùng `text-sm`.
- Không dùng kích thước lớn hơn `text-base` cho tiêu đề nếu không có yêu cầu đặc biệt.
- Giao diện ưu tiên tông màu tối.
- Màu chữ mặc định dùng `text-white`.
- Icon ưu tiên dùng `text-white/50`.
- Viền mặc định dùng `border-white/10`.

## Quy tắc component

- Card và Dialog dùng style nền chuẩn: `bg-slate-900/50 backdrop-blur-xl border border-white/10 text-white rounded-2xl shadow-2xl`.
- Tiêu đề trong component chỉ nên dùng tối đa `text-base`; các nội dung còn lại ưu tiên `text-xs`.
- Button luôn có `rounded-sm`, `px-4 py-2`, và `transition-colors duration-200`; ưu tiên bảng màu tối và đồng nhất với giao diện hiện có.
- Input và field của form luôn có `border border-gray-300`, `rounded-sm`, loại bỏ ring mặc định nếu không cần, và dùng `text-xs`.
- Ưu tiên dùng các primitive hiện có trong `src/components/ui/**` thay vì tự dựng lại component mới.
- Không sử dụng type `any` và `unknow`.

## Quy tắc frontend

- UI theo route đặt trong `src/app/**`, còn UI tái sử dụng đặt trong `src/components/**`.
- Ưu tiên dùng lại các primitive trong `src/components/ui/**` và helper dùng chung trước khi tạo component riêng lẻ.
- Client component chỉ nên giữ phần tương tác và local state; phần fetch dữ liệu hoặc logic thiên về server nên được đẩy khỏi client khi hợp lý.
- Giữ đúng format hiện tại của dự án: không dùng dấu `;`, dùng dấu nháy kép, thụt đầu dòng 2 khoảng trắng, và để Prettier sắp xếp class Tailwind.

## Quy tắc API và dữ liệu

- API route nằm trong `src/app/api/**/route.ts` và cần trả về JSON rõ trạng thái thành công hoặc lỗi.
- Input request cần được validate bằng `zod` khi phù hợp. Ưu tiên tái sử dụng schema trong `src/modules/**` trước khi tạo schema mới.
- Khi business logic bắt đầu lớn hơn mức phù hợp cho route handler, hãy chuyển nó vào module hoặc service.
- Không thay đổi cấu trúc lưu trữ, hành vi cookie auth, hoặc API contract nếu chưa kiểm tra hết các consumer trực tiếp.

## Quy tắc an toàn

- Không thêm dependency mới nếu stack hiện tại vẫn giải quyết được bài toán.
- Không đổi tên hàng loạt hoặc di chuyển file trên diện rộng nếu chưa có yêu cầu rõ ràng.
- Nếu task đụng tới auth, automation, weather fetching, hoặc tích hợp Home Assistant, phải kiểm tra call chain trước khi sửa.
- Nếu xuất hiện trade-off khó thấy hoặc có rủi ro kiến trúc, hãy dừng lại và nêu ngắn gọn các phương án thay vì tự đoán.

## Quy tắc kiểm tra

- Với mọi thay đổi code, hãy chạy bước verify hẹp nhất nhưng đủ ý nghĩa trước, rồi mới mở rộng nếu cần.
- Ưu tiên `npm run lint` và `npm run typecheck` khi phần code chạm tới các luồng dùng chung.
- Nếu không thể verify đầy đủ, phải nói rõ phần nào chưa được kiểm tra và vì sao.

## Quản lý thay đổi

- Mỗi task nên bám vào một kết quả rõ ràng: thêm tính năng, sửa lỗi, refactor, hoặc review.
- Với task không tầm thường, hãy nhắc lại ngắn gọn mục tiêu, phạm vi, ràng buộc, và điều kiện hoàn thành trước khi sửa.
- Nếu thay đổi chạm đồng thời UI, API, và data flow, hãy triển khai theo từng bước nhỏ, dễ lần theo.
- Nếu trong lúc làm phát hiện thêm vấn đề không liên quan trực tiếp, hãy ghi chú riêng thay vì gộp mặc định vào cùng một thay đổi.

## Quy ước commit

- Ưu tiên commit nhỏ, tập trung, và gắn với một thay đổi rõ ràng từ góc nhìn người dùng hoặc developer.
- Dùng commit message theo dạng: `type(scope): mo-ta-ngan`.
- Các loại nên dùng: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`.
- Nếu có thay đổi về contract, biến môi trường, hoặc migration, hãy ghi rõ trong phần body của commit khi cần.

## Kỳ vọng khi review

- Khi review, ưu tiên tìm bug, regression, và rủi ro trước, rồi mới tới maintainability hoặc polish.
- Cần chú ý kỹ các luồng auth, cookie, response shape của API, hành vi refresh theo thời gian, và side effect của automation.
- Với thay đổi giao diện, phải kiểm tra đủ các trạng thái `loading`, `empty`, `error`, và `success` nếu có.
- Với thay đổi dữ liệu hoặc contract, phải kiểm tra cả bên phát dữ liệu lẫn các consumer trực tiếp.
- Nếu một luồng rủi ro mà chưa có test, phải nêu rõ điều đó kể cả khi implementation trông có vẻ đúng.

## Sẵn sàng release

- Trước khi merge hoặc deploy, cần tóm tắt: đã thay đổi gì, đã verify gì, và còn cần test tay phần nào.
- Chạy `npm run build` nếu thay đổi ảnh hưởng đến routing, rendering, config, hoặc hành vi dùng chung của ứng dụng.
- Phải nêu rõ các biến môi trường, bước setup tay, backfill dữ liệu, hoặc lưu ý rollout nếu có.
- Nếu thay đổi đụng tới auth, automation, hoặc Home Assistant, nên kèm một gợi ý smoke test ngắn cho phần đó.

## Cách prompt với Codex

- Với task triển khai: yêu cầu Codex đọc file liên quan trước, plan ngắn, rồi mới implement.
- Với task review: yêu cầu liệt kê findings trước, có file reference, và sắp theo mức độ nghiêm trọng.
- Với task rủi ro: yêu cầu Codex dừng lại và đưa ra 2 phương án ngắn trước khi chọn một quyết định kiến trúc không hiển nhiên.
- Với handoff: chỉ cần yêu cầu tóm tắt ngắn, trạng thái verify, và bước tiếp theo hợp lý.
