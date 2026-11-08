# NoteLab VN — bản nâng cấp 08/11/2026

Bản này sửa trực tiếp mã nguồn công khai tại `nhathaohcmut/notelab-vn`, dựa trên commit `fe31b9e145256a9673e36f07a221e83eb6602cf1`. Không phải ứng dụng dựng lại. Chưa xuất bản lên website đang chạy.

## Áp dụng lên GitHub Pages

1. Trên website đang dùng, chọn **Xuất sao lưu** để giữ một bản JSON dự phòng.
2. Giải nén `NoteLab-VN-upgrade.zip`. Trong repository `notelab-vn`, thay `index.html` và chép đè **toàn bộ thư mục `assets`** bằng các tệp trong gói. Không chỉ tải riêng `index.html`.
3. Commit các tệp lên nhánh đang dùng để triển khai GitHub Pages (repository gốc hiện là `main`). Đợi lần triển khai hoàn tất.
4. Mở lại **cùng địa chỉ** `https://nhathaohcmut.github.io/notelab-vn/`, trên cùng trình duyệt/hồ sơ đã lưu ghi chú. Nhấn Ctrl+F5 nếu còn giao diện cũ.

Nếu dùng Git, có thể áp dụng file patch đi kèm thay vì chép tệp:

```sh
git switch -c upgrade/notelab-mindmap-theme
git apply --check /duong-dan/NoteLab-VN-upgrade.patch
git apply /duong-dan/NoteLab-VN-upgrade.patch
git add index.html assets UPGRADE-VI.md package.json tests .gitignore
git commit -m "Add mindmaps, custom appearance and compact workspace controls"
```

Nếu `git apply --check` báo xung đột, repository đã khác bản gốc nêu trên: đối chiếu thay đổi trước khi áp dụng. Gói ZIP vẫn có đầy đủ mã nguồn đã sửa để đối chiếu.

## Tính năng

- Logo đổi thành **Note**, giữ tên **NoteLab VN**.
- Nút **Màu** ở sidebar hoặc **Công cụ → Màu & phím tắt**: chỉnh nền và highlight độc lập bằng bảng màu, HEX hoặc R/G/B; 5 preset; tự lưu vào `notelab_appearance_v1` trong localStorage. Mỗi chế độ Sáng/Tối có màu riêng. Khôi phục mặc định chỉ xóa màu tùy chỉnh của chế độ hiện tại.
- **+ Mindmap**: thêm khối sơ đồ tư duy tại con trỏ. Thêm node, sửa tên/màu, kéo thả; bấm **Nối node** rồi chọn đích; chọn đường nối/node rồi **Xóa mục chọn**; kéo nền để pan, cuộn hoặc dùng +/− để zoom, **Vừa khung** để xem toàn sơ đồ. Chọn node bằng danh sách cũng được; phím mũi tên di chuyển node khi vùng vẽ có focus. Bấm **Lưu và đóng** để cập nhật ghi chú.
- Mindmap được lưu bằng JSON trong khối Markdown `mindmap`, nên đi kèm xuất/nhập sao lưu, xuất Markdown và lịch sử ghi chú. Khối xem trước có nút xuất SVG/PNG như mạch và waveform. Giới hạn 500 node, 2000 liên kết, 120 ký tự mỗi tên; node hiển thị hai dòng, tên đầy đủ ở ô chỉnh và tooltip.
- Topbar chia nhóm điều hướng, chèn khối, chế độ xem và công cụ. Thư mục/tag nằm ở hàng riêng. Bố cục tự xuống dòng trên màn hình nhỏ, không bỏ nút chức năng.
- **Ctrl+Alt+B**: ẩn/hiện Tab; **Ctrl+Alt+L**: ẩn/hiện danh sách. Trên macOS dùng Command thay Ctrl. Không bắt các phím tắt toàn cục khi hộp thoại đang mở. Ctrl+B được trả lại cho thao tác soạn thảo/trình duyệt; Ctrl+\\ vẫn là phím tắt Tab cũ.
- Đổi tên thư mục: bấm **Đổi tên** cạnh ô chọn thư mục trong hàng Thư mục/Tags, **···** ở sidebar hoặc nhấp đúp tên thư mục. Giữ nguyên ID thư mục và liên kết ghi chú. Với **Chưa phân loại**, hộp thoại giải thích việc tạo thư mục có tên mới và chuyển toàn bộ ghi chú chưa phân loại vào đó; mục hệ thống Chưa phân loại vẫn tồn tại để nhận ghi chú mới.

### Sửa bổ sung v2

- Sửa nhấp đúp đổi tên bị mất sự kiện khi danh sách dựng lại sau lần nhấp đầu.
- Thêm nút Đổi tên trực tiếp ở hàng Thư mục/Tags, sử dụng được cả khi sidebar ẩn.
- Thêm viền/nền cho Ẩn Tab và Ẩn DS giống các nút chèn khối.
- Thêm đường kẻ ngang giữa hàng công cụ và hàng Thư mục/Tags.
- Kiểm thử bổ sung: đổi tên từ Chưa phân loại, giữ nguyên nội dung ghi chú, đổi tên thư mục thật vẫn giữ ID, tải lại vẫn còn tên mới, nhấp đúp mở đúng thư mục; kiểm tra viền và bố cục mobile.

## Dữ liệu và giới hạn

Giữ nguyên database `NoteLabVN_StudyDB_v1`, phiên bản database, các kho notes/images/versions/meta và cấu trúc sao lưu hiện tại. Không xóa hay di chuyển dữ liệu trình duyệt khi nâng cấp. Chưa truy cập dữ liệu cá nhân của bạn; kiểm thử dùng dữ liệu giả lập trong hồ sơ Chrome riêng.

Mở gói trên localhost, trình duyệt khác hoặc địa chỉ khác sẽ có kho dữ liệu riêng; nếu muốn dùng ghi chú cũ ở đó, nhập file sao lưu. Màu tùy chỉnh lưu riêng trong localStorage, chưa được đưa vào file sao lưu ghi chú. Ứng dụng vẫn dùng các CDN sẵn có cho Markdown, KaTeX và DOMPurify như bản gốc; chưa phải bản offline hoàn toàn.

Mindmap hiện vẽ thủ công; không tự sinh sơ đồ từ heading. Chưa có undo/redo riêng trong cửa sổ mindmap; Hủy bỏ các thay đổi chưa lưu, lịch sử ghi chú hoạt động theo cơ chế cũ.

## Kiểm thử đã thực hiện

Chrome headless trên Windows, viewport desktop 1600×1000 và mobile 390×844:

- Logo; nhập HEX/RGB, từ chối RGB ngoài 0–255, giữ màu sau reload; phím tắt cả hai panel.
- Tạo/đổi tên thư mục; thêm node, đổi tên, nối node, kéo thả, zoom, lưu và mở lại mindmap; từ chối liên kết tới node không tồn tại.
- Nạp database bằng mã nguồn **bản gốc**, lưu ghi chú có mạch/waveform, thư mục, phiên bản và ảnh thử; chuyển sang mã nguồn mới trên cùng origin: nội dung bản ghi và byte ảnh giữ nguyên.
- Xuất sao lưu có mindmap, nhập vào database mới: ghi chú/thư mục/ảnh giữ nguyên. Trình sửa mạch và waveform vẫn mở và lưu được.
- Không lỗi JavaScript trên trang trong các kịch bản trên; không tràn ngang toàn trang ở kích thước mobile đã thử. Đã xem ảnh chụp giao diện màu, mindmap, desktop và mobile.

Đây không phải kiểm thử mọi chức năng cũ trên mọi trình duyệt. Chưa kiểm thử thủ công trên thiết bị cảm ứng thật.

## Chạy lại kiểm thử giao diện

Yêu cầu Node.js, kết nối mạng để tải các CDN, và Playwright:

```sh
npm install
npx playwright install chromium
npm test
```

Kiểm thử tạo trình duyệt riêng và dữ liệu mẫu, không dùng hồ sơ trình duyệt cá nhân. Có thể đặt `CHROME_PATH` trỏ đến Chrome đã cài nếu không dùng Chromium của Playwright. Ảnh chụp được ghi vào `test-results/`.
