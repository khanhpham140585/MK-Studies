# APPFLASH - Docker VPS Deployment Guide
> Hướng dẫn triển khai và vận hành ứng dụng **APPFLASH** trên máy chủ ảo (VPS) bằng Docker & Docker Compose.

---

## 📋 MỤC LỤC
1. [Yêu cầu hệ thống (Prerequisites)](#1-yêu-cầu-hệ-thống-prerequisites)
2. [Cài đặt Docker & Docker Compose trên VPS](#2-cài-đặt-docker--docker-compose-trên-vps)
3. [Đưa mã nguồn & dữ liệu lên VPS](#3-đưa-mã-nguồn--dữ-liệu-lên-vps)
4. [Cấu hình biến môi trường](#4-cấu-hình-biến-môi-trường)
5. [Khởi chạy ứng dụng với Docker Compose](#5-khởi-chạy-ứng-dụng-với-docker-compose)
6. [Cấu hình Nginx & Chứng chỉ SSL miễn phí (HTTPS)](#6-cấu-hình-nginx--chứng-chỉ-ssl-miễn-phí-https)
7. [Quản trị & Cập nhật học liệu PDF ngoài Docker](#7-quản-trị--cập-nhật-học-liệu-pdf-ngoài-docker)
8. [Các lệnh quản trị thường dùng & Xử lý sự cố](#8-các-lệnh-quản-trị-thường-dùng--xử-lý-sự-cố)

---

## 1. Yêu cầu hệ thống (Prerequisites)

- **Hệ điều hành khuyên dùng**: Ubuntu 22.04 LTS / 24.04 LTS hoặc Debian 11/12.
- **Cấu hình tối thiểu**:
  - CPU: 1 Core
  - RAM: 1 GB (khuyên dùng từ 2 GB)
  - Ổ cứng: 15–20 GB trống (để lưu trữ học liệu PDF và Docker image)
- **Cổng mạng (Ports) cần mở trên Firewall (UFW / Cloud Security Group)**:
  - `22`: SSH truy cập VPS
  - `80`: HTTP (Nginx / Web)
  - `443`: HTTPS (SSL bảo mật)
  - `3005` (hoặc cổng bạn cấu hình trong `.env` nếu truy cập trực tiếp không qua Nginx)

---

## 2. Cài đặt Docker & Docker Compose trên VPS

Đăng nhập vào VPS qua SSH:
```bash
ssh root@<IP_CUA_VPS>
```

### 2.1. Cập nhật hệ thống & cài đặt Docker chính thức (script tự động)
```bash
# Cập nhật package
sudo apt-get update && sudo apt-get upgrade -y

# Cài đặt curl nếu chưa có
sudo apt-get install -y curl ufw

# Tải và chạy script cài đặt Docker chính thức
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cấp quyền chạy docker cho user hiện tại (nếu dùng non-root user)
sudo usermod -aG docker $USER
```

### 2.2. Kiểm tra Docker & Docker Compose
```bash
docker --version
docker compose version
```
*(Nếu hiển thị phiên bản Docker 24+ và Docker Compose v2+ là cài đặt thành công)*.

---

## 3. Đưa mã nguồn & dữ liệu lên VPS

### Cách 1: Sử dụng Git (Khuyên dùng cho mã nguồn)
Trên VPS, tạo thư mục dự án và clone mã nguồn:
```bash
mkdir -p /opt/appflash
cd /opt/appflash

# Clone từ Git repository của bạn
git clone <URL_REPO_CUA_BAN> .
```

### Cách 2: Sao chép từ máy tính cá nhân (Windows PowerShell) qua SCP
Nếu bạn chưa đưa lên Git, có thể copy toàn bộ thư mục từ máy tính lên VPS bằng lệnh PowerShell:
```powershell
# Chạy trên máy tính Windows (PowerShell)
# Lưu ý: Loại trừ node_modules và .venv để copy nhanh
scp -r D:\workspaces\AI\APPFLASH root@<IP_CUA_VPS>:/opt/appflash
```

> [!IMPORTANT]
> **Đồng bộ thư mục PDF (`data/pdfs`)**:
> Vì `data/pdfs` được mount trực tiếp từ máy host bên ngoài container, hãy đảm bảo thư mục `/opt/appflash/data/pdfs` trên VPS có chứa các file bài tập PDF của bạn:
> ```bash
> ls -la /opt/appflash/data/pdfs
> ```

---

## 4. Cấu hình biến môi trường

Tại thư mục dự án trên VPS (`/opt/appflash`), kiểm tra hoặc tạo file `.env`:

```bash
cd /opt/appflash
nano .env
```

Nội dung file `.env`:
```env
# Cổng mà máy host sẽ mở ra ngoài (mặc định 3005)
HOST_PORT=3005
```
*(Nhấn `Ctrl + O` rồi `Enter` để lưu, `Ctrl + X` để thoát nano)*.

---

## 5. Khởi chạy ứng dụng với Docker Compose

### 5.1. Build và khởi động container
```bash
cd /opt/appflash

# Build image Docker
docker compose build

# Khởi chạy container ở chế độ chạy ngầm (detached mode)
docker compose up -d
```

### 5.2. Kiểm tra trạng thái container
```bash
docker compose ps
```
Kết quả hiển thị tương tự:
```text
NAME           IMAGE               COMMAND                  SERVICE    STATUS          PORTS
appflash-app   appflash-appflash   "docker-entrypoint.s…"   appflash   Up 15 seconds   0.0.0.0:3005->3001/tcp
```

### 5.3. Xem nhật ký hoạt động (Logs)
```bash
docker compose logs -f
```
Nhấn `Ctrl + C` để thoát màn hình xem logs.

### 5.4. Mở cổng trên tường lửa UFW (nếu VPS bật tường lửa)
```bash
sudo ufw allow 3005/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

Lúc này bạn đã có thể truy cập qua trình duyệt:
👉 **`http://<IP_CUA_VPS>:3005`** hoặc **`http://<IP_CUA_VPS>:3005/readpdf`**.

---

## 6. Cấu hình Nginx & Chứng chỉ SSL miễn phí (HTTPS)

> [!NOTE]
> **Tại sao cần HTTPS trên VPS?**
> Trình duyệt hiện đại (Chrome, Safari, Edge) chỉ cho phép tính năng **Nhận dạng giọng nói (Micro / SpeechRecognition)** hoạt động trên `localhost` hoặc kết nối bảo mật **`https://`**. Để dùng tính năng luyện nói AI trên VPS, bạn nên trỏ tên miền và bật SSL.

### 6.1. Cài đặt Nginx & Certbot
```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### 6.2. Tạo file cấu hình Reverse Proxy cho AppFlash
```bash
sudo nano /etc/nginx/sites-available/appflash
```

Dán nội dung sau vào (thay `yourdomain.com` bằng tên miền của bạn):
```nginx
server {
    listen 80;
    server_name yourdomain.com; # Thay bằng domain hoặc subdomain của bạn

    # Cho phép tải lên file PDF kích thước lớn
    client_max_body_size 200M;

    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Kích hoạt cấu hình và kiểm tra Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/appflash /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6.3. Cấp chứng chỉ SSL Let's Encrypt tự động
```bash
sudo certbot --nginx -d yourdomain.com
```
Certbot sẽ tự động cấu hình HTTPS và cơ chế tự động gia hạn chứng chỉ khi hết hạn.

Bây giờ bạn có thể truy cập an toàn qua:
👉 **`https://yourdomain.com/readpdf`** (Hỗ trợ đầy đủ Micro & Loa phát âm).

---

## 7. Quản trị & Cập nhật học liệu PDF ngoài Docker

Nhờ cơ chế **Volume Bind Mount** trong `docker-compose.yml`:
```yaml
volumes:
  - ./data/pdfs:/app/data/pdfs
  - ./data/agent.db:/app/data/agent.db
```

### Thêm hoặc cập nhật sách PDF mới mà KHÔNG cần build lại Docker:
Chỉ cần tải file PDF trực tiếp vào thư mục `/opt/appflash/data/pdfs/` trên VPS. Container sẽ **nhận file mới ngay lập tức**:

```bash
# Ví dụ copy từ máy tính cá nhân lên thư mục noibong trên VPS:
scp "D:\SachMoi.pdf" root@<IP_CUA_VPS>:/opt/appflash/data/pdfs/noibong/
```
Hoặc dùng các phần mềm SFTP trực quan như **FileZilla / WinSCP / Cyberduck** kết nối vào VPS và kéo thả file PDF vào thư mục `/opt/appflash/data/pdfs/`.

---

## 8. Các lệnh quản trị thường dùng & Xử lý sự cố

### 8.1. Các lệnh thao tác với Docker
| Tác vụ | Lệnh |
| :--- | :--- |
| **Khởi động ứng dụng** | `docker compose up -d` |
| **Dừng ứng dụng** | `docker compose down` |
| **Khởi động lại** | `docker compose restart` |
| **Xem logs trực tiếp** | `docker compose logs -f` |
| **Kiểm tra trạng thái** | `docker compose ps` |
| **Build lại sau khi sửa code** | `docker compose build && docker compose up -d` |

### 8.2. Cập nhật mã nguồn mới từ Git
```bash
cd /opt/appflash
git pull
docker compose restart
```

### 8.3. Sao lưu cơ sở dữ liệu SQLite
Dữ liệu lịch sử chat và học tập của Agent được lưu bền vững tại `/opt/appflash/data/agent.db`. Để sao lưu:
```bash
cp /opt/appflash/data/agent.db /opt/appflash/data/agent.db.backup
```

### 8.4. Xử lý lỗi thường gặp (Troubleshooting)

1. **Lỗi cổng 3005 bị trùng (`port is already allocated`)**:
   - Sửa file `.env` đổi sang cổng khác (ví dụ `HOST_PORT=3006` hoặc `3008`), sau đó chạy `docker compose up -d`.
2. **Lỗi không mở được file PDF (404 Not Found)**:
   - Kiểm tra tên file/thư mục có đúng chữ hoa/thường hay không (Linux phân biệt chữ hoa/thường).
   - Kiểm tra quyền đọc file: `sudo chmod -R 755 /opt/appflash/data/pdfs`.
3. **Lỗi Micro không hoạt động**:
   - Kiểm tra xem bạn đã truy cập qua giao thức `https://` chưa. Web Speech API bắt buộc phải có HTTPS trên IP/Domain công khai.

