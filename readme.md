# 🚪 AI Escape Room Engine

Yapay zeka tarafından dinamik olarak yönetilen, metin/görsel tabanlı asenkron "Kaçış Odası" motoru. Bu proje, geleneksel statik hikaye ağaçları yerine, LLM (Büyük Dil Modelleri) yeteneklerini bir "State Machine" (Durum Makinesi) olarak kullanarak kullanıcılara sıfır veri (zero-data) ile benzersiz senaryolar sunar.

## 🚀 Proje Vizyonu
Kullanıcıların kaçış odası senaryolarında yapacakları ardışık, mantıksız veya anlık (spam) hamlelerin **Race Condition (Yarış Durumu)** yaratmasını engellemek; düşük gecikmeli, kilit (lock) mekanizmasına sahip, ölçeklenebilir ve kurumsal düzeyde bir backend mimarisi inşa etmektir.

---

## 🛠️ Teknoloji Yığını (Tech Stack)
- **Backend:** Node.js, NestJS (veya Python/FastAPI - *Antigravity mode on!* 🛸)
- **Veritabanı & State:** Supabase (PostgreSQL), JSONB yapısı ile State Management
- **Önbellek & Concurrency:** Redis (Distributed Locking & Rate Limiting)
- **Yapay Zeka:** Groq API / Google Gemini (Düşük gecikmeli LLM çağrıları)
- **Message Broker (Opsiyonel):** RabbitMQ / Kafka (Asenkron olaylar için)

---

## 🏗️ Sistem Mimarisi ve Akış

1. **İstemci (Client) İsteği:** Kullanıcı bir aksiyon gönderir (Örn: *"Odadaki sandalyeyi pencereye fırlat"*).
2. **Kilit Mekanizması (Redis Distributed Lock):**
   - Sistem, `lock:room:{roomId}` anahtarı ile o odaya özel bir kilit (Atomic Lock) oluşturur.
   - Kilitliyken gelen diğer eşzamanlı istekler doğrudan HTTP 429 (Too Many Requests) ile reddedilir veya kuyruğa alınır.
3. **Durum (State) Okuma:** Odanın mevcut durumu (JSONB) Supabase üzerinden çekilir.
4. **AI Karar Motoru:** Mevcut durum ve kullanıcının aksiyonu özel bir sistem promptu (System Prompt) ile LLM'e gönderilir.
5. **Durum Güncelleme:** LLM'den dönen mantıksal sonuç, veritabanındaki JSONB objesini günceller (Örn: `{"window": "broken", "chair": "damaged"}`).
6. **Kilit Kaldırma:** İşlem başarıyla bittiğinde veya hata aldığında Redis Lua Script kullanılarak kilit güvenli bir şekilde serbest bırakılır.

---

## 📦 Veritabanı Şeması (Taslak)

Veritabanı temel olarak odaların anlık durumlarını esnek bir şekilde tutabilmek için `JSONB` formatından yararlanır.

| Kolon Adı | Veri Tipi | Açıklama |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Odanın benzersiz kimliği |
| `user_id` | UUID (FK) | Odayı oynayan kullanıcının kimliği |
| `theme` | VARCHAR | Odanın teması (Örn: Cyberpunk, Zindan) |
| `current_state` | JSONB | Odadaki eşyalar, kapıların kilit durumu, can vb. |
| `history` | JSONB / Array | Geçmiş hamlelerin log kayıtları (LLM Context'i için) |
| `status` | VARCHAR | `active`, `completed`, `failed` |
| `created_at`| TIMESTAMP | Oluşturulma tarihi |

---

## 🔒 Öne Çıkan Mühendislik Pratikleri
- **Atomic Operations:** Redis `NX` (Not Exists) ve `PX` (Expiration) argümanları ile kusursuz kilit yönetimi.
- **Güvenli Kilit Serbest Bırakma (Lua Scripts):** Süresi dolan kilitlerin (TTL) yanlışlıkla silinmesini engellemek için Lua diliyle yazılmış özel silme algoritmaları.
- **Zero-Data Yanaşımı:** Proje, devasa statik senaryo veritabanlarına ihtiyaç duymaz. Tüm hikaye evreni LLM'in anlık `context` belleğinde üretilir ve yaşatılır.

---

## 🚧 Yol Haritası (Roadmap)
- [ ] Supabase projesinin ayağa kaldırılması ve şemaların (RLS politikaları dahil) kurulması.
- [ ] Redis bağlantılarının NestJS içine (veya ilgili framework'e) entegre edilmesi.
- [ ] `Distributed Lock` mekanizmasının bir servis/interceptor olarak yazılması.
- [ ] Groq/Gemini API entegrasyonu ve kaçış odası temel prompt mühendisliğinin yapılması.
- [ ] Frontend tarafına WebSocket (Supabase Realtime) ile anlık geri bildirim verilmesi.