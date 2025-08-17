# نظام اللايف كورس (WebRTC + Socket.IO)

هذا الملف يشرح ميزة الجلسات المباشرة: نموذج البيانات، REST API، الجدولة والإشعارات، وأحداث Socket.IO الخاصة بإشارة WebRTC.

## نموذج البيانات
- `LiveSession` (ملف: `models/LiveSession.js`)
  - title, description
  - courseId (مرجع Course), teacherId (مرجع User)
  - scheduledAt (تاريخ), durationMinutes (مدة بالدقائق)
  - status: `scheduled | live | ended | canceled`
  - roomCode (سلسلة فريدة), recordingUrl (اختياري)

## REST Endpoints (المسار الأساسي: `/api/v1/live-sessions`)

- POST `/` (teacher)
  - إنشاء جلسة.
  - Body مثال:
    - `{ "title": "جلسة 1", "description": "مراجعة", "courseId": "<courseId>", "scheduledAt": "2025-08-12T18:00:00.000Z", "durationMinutes": 60 }`
  - تأثيرات جانبية: إنشاء Notification لكل طلاب الكورس + جدولة تذكير قبل الموعد بـ 10 دقائق وإشعار وقت البدء.

- PATCH `/:id` (teacher)
  - تعديل الجلسة؛ يتم إعادة الجدولة إذا تغير `scheduledAt`.

- PATCH `/:id/cancel` (teacher)
  - إلغاء الجلسة؛ إشعار الطلاب بالإلغاء.

- GET `/` (auth)
  - فلترة: `courseId?`, `status?`, `from?`, `to?`

- GET `/:id` (auth)
  - تفاصيل جلسة واحدة.

- POST `/:id/start` (teacher)
  - تحويل الحالة إلى `live` وإشعار الطلاب بأن الجلسة بدأت.

- GET `/:id/ice` (auth)
  - يرجع إعدادات ICE (قوائم STUN/TURN) للفرونت.

## الجدولة والإشعارات
- إذا كان `REDIS_URL` (أو `UPSTASH_REDIS_URL`) معرفًا:
  - يستخدم النظام Bull + Redis (ملف: `jobs/liveSessionQueue.js`) لجدولة التذكير والبدء بشكل موثوق.
- إن لم يتوفر Redis:
  - يعمل النظام بمؤقتات داخلية in-process (ملف: `jobs/liveSessionScheduler.js`).
- عند الإنشاء: إشعار فوري بموعد الجلسة.
- قبل الموعد بـ 10 دقائق: إشعار تذكيري.
- عند البدء: إشعار بأن الجلسة بدأت.
- جميع الإشعارات تحفظ كمستندات في `Notification` وتُبث عبر Socket.IO إلى غرفة المستخدم `user_{userId}` (حدث: `notification`).

## Socket.IO (إشارة WebRTC وغرف الجلسة)
- غرفة لكل جلسة: `live_{sessionId}`.
- أحداث:
  - `live:join` { sessionId } → انضمام للغرفة بعد التحقق أن المستخدم مدرس الكورس أو من طلابه.
  - `live:leave` { sessionId } → مغادرة.
  - `live:offer` { sessionId, sdp, to? } → بث offer للغرفة (Mesh).
  - `live:answer` { sessionId, sdp, to? } → بث answer.
  - `live:ice` { sessionId, candidate, to? } → بث ICE.
- ينضم كل مستخدم عند الاتصال لغرفته الشخصية `user_{userId}` لاستقبال إشعارات الموقع.

## البيئة (Environment)
- `WEBRTC_ICE_SERVERS_JSON` (اختياري): JSON يحتوي على مصفوفة `iceServers` للمتصفح، مثال:
  ```json
  [
    { "urls": "stun:stun.l.google.com:19302" },
    { "urls": ["turn:turn.example.com:3478"], "username": "user", "credential": "pass" }
  ]
  ```
- `REDIS_URL` أو `UPSTASH_REDIS_URL` (اختياري): لتمكين Bull/Redis للجدولة الموثوقة.

## ملاحظات الإنتاج
- لاستقرار WebSockets في الإنتاج، استضف الخادم على منصة تدعم الاتصالات طويلة الأمد (Railway/Render/Fly/EC2). Vercel Functions ليست مثالية لذلك.
- استخدم TURN مدفوع لضمان تمرير الميديا خلف NAT/Firewall.

## تجربة سريعة (Quick test)
1) أنشئ جلسة (مدرس): POST `/api/v1/live-sessions`.
2) ابدأ الجلسة: POST `/api/v1/live-sessions/:id/start`.
3) على الفرونت: اتصل بـ Socket.IO ثم
   - emit('live:join', { sessionId })
   - أرسل/استقبل `live:offer`/`live:answer`/`live:ice` وفق WebRTC API في المتصفح.
4) استمع لحدث `notification` في قناة `user_{userId}` لظهور إشعارات الموعد/البدء.

## دليل تكامل الفرونت اند (Frontend Guide)

هذه إرشادات عملية لدمج الواجهة الأمامية مع نظام اللايف:

1) المصادقة على Socket.IO
- السيرفر يتوقع تمرير `token` و`userId` في `handshake.auth`.
- مثال (باستخدام socket.io-client):

```js
import { io } from 'socket.io-client';

const socket = io(process.env.VITE_API_URL, {
  transports: ['websocket'],
  auth: {
    token: accessToken, // JWT
    userId: currentUserId,
  },
});

socket.on('connect', () => console.log('socket connected', socket.id));
socket.on('notification', (n) => {
  // أظهر إشعار في الواجهة (toastr/toast)
  console.log('Notification:', n);
});
socket.on('disconnect', () => console.log('socket disconnected'));
```

2) عرض قائمة الإشعارات المخزنة
- GET `/api/v1/notifications/my-notifications` مع Header: `Authorization: Bearer <token>`.
- ضع شارة عدد الإشعارات غير المقروءة، واستعمل PUT `/api/v1/notifications/mark-read/:notificationId` عند فتح الإشعار.

3) إنشاء جلسة (لوحة المدرس)
- POST `/api/v1/live-sessions` بالحقول: `title, description?, courseId, scheduledAt, durationMinutes?`.
- عند النجاح، اعرض كود الغرفة/رابط الجلسة ووقت الموعد.

4) بدء الجلسة (المدرس)
- استدعِ: POST `/api/v1/live-sessions/:id/start`.
- سيقوم السيرفر بتحديث الحالة إلى `live` وإرسال إشعار فوري للطلاب.

5) جلب إعدادات ICE
- GET `/api/v1/live-sessions/:id/ice` ثم مرّر الناتج إلى `RTCPeerConnection`:

```js
const { iceServers } = await (await fetch(`${API}/api/v1/live-sessions/${sessionId}/ice`, {
  headers: { Authorization: `Bearer ${token}` },
})).json();

const pc = new RTCPeerConnection({ iceServers });
```

6) الانضمام لغرفة الجلسة عبر Socket.IO

```js
socket.emit('live:join', { sessionId });
socket.on('live:error', (e) => console.error('Live error:', e));
socket.on('live:peer-joined', ({ userId }) => {
  // يمكن تحديث قائمة المشاركين
});
socket.on('live:peer-left', ({ userId }) => {
  // إزالة المشارك من القائمة
});
```

7) ضبط WebRTC (Mesh مبسط)
- المدرس: يلتقط media (كاميرا/ميكروفون أو مشاركة شاشة)، يضيفها للـ PeerConnection.
- عندما ينضم طالب جديد (`live:peer-joined`) أو عند انضمامك أنت:
  - أنشئ Offer وأرسله عبر `live:offer`.
- الطرف الآخر يرد بـ Answer عبر `live:answer`.
- تبادل ICE عبر `live:ice`.

مثال مختصر للإشارة:

```js
const peers = new Map(); // key: remoteUserId, value: { pc }

function setupPeer(remoteUserId, iceServers) {
  const pc = new RTCPeerConnection({ iceServers });
  pc.onicecandidate = (e) => {
    if (e.candidate) socket.emit('live:ice', { sessionId, candidate: e.candidate, to: remoteUserId });
  };
  pc.ontrack = (e) => {
    // اعرض فيديو/أوديو الطرف الآخر e.streams[0]
  };
  peers.set(remoteUserId, { pc });
  return pc;
}

// إرسال عرض
async function makeOfferTo(remoteUserId, stream, iceServers) {
  const { pc } = peers.get(remoteUserId) || { pc: setupPeer(remoteUserId, iceServers) };
  stream.getTracks().forEach((t) => pc.addTrack(t, stream));
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit('live:offer', { sessionId, sdp: offer, to: remoteUserId });
}

// استقبال offer
socket.on('live:offer', async ({ from, sdp }) => {
  const { pc } = peers.get(from) || { pc: setupPeer(from, iceServers) };
  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit('live:answer', { sessionId, sdp: answer, to: from });
});

// استقبال answer
socket.on('live:answer', async ({ from, sdp }) => {
  const { pc } = peers.get(from) || {};
  if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
});

// تبادل ICE
socket.on('live:ice', async ({ from, candidate }) => {
  const { pc } = peers.get(from) || {};
  if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
});
```

ملاحظات مهمة للـ UI:
- الطلاب: يُفضل تفعيل الصوت فقط افتراضيًا لتقليل الحمل، وتمكين الفيديو عند الحاجة.
- شارك الشاشة للمدرس عبر `getDisplayMedia()` عند الحاجة.
- تعامل مع إعادة الاتصال تلقائيًا (Socket.IO autoReconnect + إعادة التفاوض إن لزم).

8) مغادرة الجلسة

```js
socket.emit('live:leave', { sessionId });
peers.forEach(({ pc }) => pc.close());
peers.clear();
```

## أفضل الممارسات
- حد أقصى للطلاب في Mesh (مثال: 8-12) لضمان الأداء.
- استخدم TURN مدفوع للإنتاج.
- في الإنتاج استضف Socket.IO على خدمة تدعم WebSockets باستمرار.

