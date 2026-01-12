# 💰 ỨNG DỤNG QUẢN LÝ CHI TIÊU NHÓM  
**Group Expense Management Web Application**

---

## 📌 1. Giới thiệu đề tài
Trong đời sống hiện đại, các hoạt động theo nhóm như đi du lịch, thuê nhà, làm việc nhóm hay học tập chung ngày càng phổ biến. Tuy nhiên, việc ghi nhớ, theo dõi và phân chia các khoản chi tiêu giữa các thành viên thường gây khó khăn, dễ dẫn đến nhầm lẫn và tranh cãi tài chính.

Đề tài **“Ứng dụng Quản lý Chi tiêu Nhóm”** được xây dựng nhằm hỗ trợ các nhóm người dùng:
- Ghi nhận chi tiêu một cách minh bạch
- Tự động tính toán số tiền mỗi thành viên cần trả hoặc nhận
- Trao đổi thông tin nhanh chóng thông qua nhắn tin thời gian thực
- Đảm bảo an toàn dữ liệu và phân quyền truy cập theo nhóm

Ứng dụng được phát triển bằng **NodeJS**, áp dụng **Docker** để container hóa hệ thống, phù hợp với yêu cầu môn học và thực tiễn phát triển phần mềm hiện đại.

---

## 🎯 2. Mục tiêu hệ thống
- Xây dựng một ứng dụng web quản lý chi tiêu nhóm dễ sử dụng
- Tự động hóa quá trình tính toán và quyết toán chi phí
- Giảm tranh cãi tài chính giữa các thành viên
- Áp dụng mô hình phát triển **Full-stack Web Application**
- Triển khai hệ thống đa dịch vụ bằng **Docker & Docker Compose**

---

## 👥 3. Đối tượng sử dụng
- Nhóm bạn bè đi du lịch hoặc sinh hoạt chung
- Nhóm sinh viên làm bài tập, đồ án
- Nhóm đồng nghiệp chia sẻ chi phí làm việc
- Gia đình có nhu cầu quản lý chi tiêu chung

---

## 🧩 4. Chức năng chính
### 👤 Người dùng
- Đăng ký và đăng nhập bằng email & mật khẩu
- Tạo nhóm chi tiêu mới
- Tham gia nhóm chi tiêu đã tồn tại
- Thêm / sửa / xoá các khoản chi tiêu
- Xem tổng chi tiêu và số tiền cần thanh toán
- Nhắn tin trao đổi trong nhóm theo thời gian thực

### ⚙️ Hệ thống
- Xác thực và phân quyền người dùng (JWT)
- Quản lý dữ liệu theo từng nhóm
- Tính toán chi phí công bằng giữa các thành viên
- Cập nhật dữ liệu gần như real-time

---

## 🛠 5. Công nghệ sử dụng
### Backend
- **Node.js**
- **Express.js**
- **MongoDB** (Mongoose)
- **JWT Authentication**
- **Socket.IO** (Realtime chat)

### Frontend
- **ReactJS**
- HTML, CSS, JavaScript
- RESTful API

### Triển khai & môi trường
- **Docker**
- **Docker Compose**
- **Nginx**

---

## 🏗 6. Kiến trúc hệ thống
Hệ thống được thiết kế theo mô hình **Client – Server**, chia thành các dịch vụ độc lập:

- **Frontend Service**: giao diện người dùng
- **Backend Service**: xử lý nghiệp vụ, API, realtime
- **Database Service**: lưu trữ dữ liệu người dùng, nhóm, chi tiêu

Tất cả các dịch vụ được kết nối thông qua **Docker Network**, giúp hệ thống dễ triển khai, bảo trì và mở rộng.

---
