# 📝 Admin Kontrollü Blog Sistemi

Bu proje, sadece admin kullanıcılarının gönderi paylaşabildiği, kullanıcı rollerine göre yetkilendirme yapan bir blog platformudur. Proje backend tarafında Node.js ve Express.js kullanılarak MVC yapısına uygun şekilde geliştirilmiştir. Frontend kısmı responsive olup, sade ve işlevsel bir Vanilla CSS tasarımıyla sunulmuştur.

## 🚀 Özellikler

- ✅ **Kullanıcı rolleri** (admin / normal kullanıcı) ile yetki kontrolü
- ✅ **Session tabanlı kimlik doğrulama** (express-session)
- ✅ **MVC mimarisi** ile modüler yapı
- ✅ **Rate limiting** ile temel güvenlik önlemleri
- ✅ **Database üzerinden role kontrolü** (req.session'dan değil, güncel user verisiyle)
- ✅ **Route bazlı middleware** kullanımı (admin.js, user.js, index.js)
- ✅ **Responsive frontend** (mobil ve masaüstü destekli)

## 🛠️ Kullanılan Teknolojiler

### Backend:
- Node.js
- Express.js
- express-session
- bcrypt
- MongoDB / Mongoose
- Helmet, Rate-Limiter (web güvenliği için)

### Frontend:
- HTML
- CSS (Vanilla)
- EJS (template engine)

## 🔒 Güvenlik Yaklaşımı

- Oturumlar `express-session` ile yönetilir, JWT kullanılmamıştır.
- Kullanıcı rolleri sadece oturumdan değil, gerektiğinde **veritabanından tekrar çekilerek** doğrulanır.
- `rate-limiter-express` gibi çözümlerle **brute-force saldırılara** karşı koruma sağlanır.
- Giriş yapılmayan kullanıcılar için `index.js`, kullanıcılar için `user.js`, adminler için `admin.js` route’ları tanımlanmıştır.

## 🧱 Proje Yapısı
![fileStructure](https://github.com/user-attachments/assets/4ed662ee-71fe-456d-af56-97fe75c8020b)

🧠 Ek Notlar
Eğer frontend kısmı React ile yazılsaydı proje bir MERN Stack uygulaması olurdu.

Ancak şimdiki haliyle klasik MVC + SSR (Server Side Rendering) yapısına sahip, anlaşılır bir mimari kullanılmıştır.


## 📦 Kurulum

### 1. Repo’yu klonla:
```bash
git clone https://github.com/1emin23/Blog-Websitesi.git
cd Blog-Websitesi

npm install

.env dosyası oluştur:

PORT=3000
SESSION_SECRET=your_secret
MONGODB_URI=mongodb://localhost/blog

node server.js
