# دليل نظام اللايف كورس والشير سكرين الكامل

## 📖 نظرة عامة
نظام متكامل للجلسات المباشرة يدعم:
- إنشاء وإدارة الجلسات المباشرة
- WebRTC للتواصل المرئي والصوتي
- مشاركة الشاشة (Screen Sharing)
- إشعارات فورية ومجدولة
- التحكم في الوصول حسب الأدوار

---

## 🏗️ المعمارية التقنية

### Backend Stack:
- **Node.js + Express.js** - REST API
- **Socket.IO** - Real-time communication & WebRTC signaling
- **MongoDB + Mongoose** - قاعدة البيانات
- **JWT** - المصادقة والتفويض
- **Bull + Redis** - جدولة الإشعارات (اختياري)

### Frontend Requirements:
- **WebRTC APIs** - getUserMedia, getDisplayMedia
- **Socket.IO Client** - Real-time events
- **Modern Browser** - يدعم WebRTC و Screen Share

---

## 📊 نماذج البيانات

### LiveSession Model
```javascript
{
  title: String,              // عنوان الجلسة
  description: String,        // وصف الجلسة
  courseId: ObjectId,         // معرف الكورس
  teacherId: ObjectId,        // معرف المعلم
  scheduledAt: Date,          // موعد الجلسة
  durationMinutes: Number,    // مدة الجلسة بالدقائق
  status: String,             // حالة الجلسة: scheduled|live|ended|canceled
  roomCode: String,           // كود الغرفة (فريد)
  recordingUrl: String        // رابط التسجيل (اختياري)
}
```

### Course Model (relevant fields)
```javascript
{
  students: [ObjectId],       // مصفوفة معرفات الطلاب المسجلين
  teacherId: ObjectId         // معرف المعلم المالك
}
```

### User Model (relevant fields)
```javascript
{
  purchasedCourses: [ObjectId], // الكورسات المشتراة
  role: String                  // student|teacher|admin
}
```

---

## 🌐 REST API Endpoints

### 1. إنشاء جلسة مباشرة
```http
POST /api/v1/live-sessions
```

**الوصول:** المعلمون فقط (isTeacher middleware)

**Request Headers:**
```http
Authorization: Bearer <teacher_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "جلسة مراجعة الـ JavaScript",
  "description": "مراجعة شاملة لأساسيات JavaScript",
  "courseId": "67dcb5a3553aadf3cbda95d7",
  "scheduledAt": "2025-08-17T19:00:00.000Z",
  "durationMinutes": 90
}
```

**Response (201 Created):**
```json
{
  "_id": "689b95684b16a546e1c8cf2d",
  "title": "جلسة مراجعة الـ JavaScript",
  "description": "مراجعة شاملة لأساسيات JavaScript",
  "courseId": "67dcb5a3553aadf3cbda95d7",
  "teacherId": "67c46c37d6c55ee4d5840c0c",
  "scheduledAt": "2025-08-17T19:00:00.000Z",
  "durationMinutes": 90,
  "status": "scheduled",
  "roomCode": "live_1m2n3o4p_abc123",
  "createdAt": "2025-08-17T10:30:00.000Z",
  "updatedAt": "2025-08-17T10:30:00.000Z"
}
```

**الآثار الجانبية:**
- إرسال إشعار فوري لجميع طلاب الكورس
- جدولة تذكير قبل الموعد بـ 10 دقائق
- جدولة إشعار وقت بداية الجلسة

---

### 2. بدء الجلسة
```http
POST /api/v1/live-sessions/:id/start
```

**الوصول:** المعلم مالك الجلسة أو الأدمن

**Request Headers:**
```http
Authorization: Bearer <teacher_jwt_token>
```

**Request Body:** فارغ

**Response (200 OK):**
```json
{
  "_id": "689b95684b16a546e1c8cf2d",
  "status": "live",
  "updatedAt": "2025-08-17T19:00:15.000Z"
}
```

**الآثار الجانبية:**
- تغيير حالة الجلسة إلى "live"
- إرسال إشعار فوري للطلاب بأن الجلسة بدأت

---

### 3. إنهاء الجلسة
```http
POST /api/v1/live-sessions/:id/end
```

**الوصول:** المعلم مالك الجلسة أو الأدمن

**Request Headers:**
```http
Authorization: Bearer <teacher_jwt_token>
```

**Request Body:** فارغ

**Response (200 OK):**
```json
{
  "_id": "689b95684b16a546e1c8cf2d",
  "status": "ended",
  "updatedAt": "2025-08-17T20:30:00.000Z"
}
```

**الآثار الجانبية:**
- تغيير حالة الجلسة إلى "ended"
- إرسال إشعار للطلاب بانتهاء الجلسة

---

### 4. إلغاء الجلسة
```http
PATCH /api/v1/live-sessions/:id/cancel
```

**الوصول:** المعلم مالك الجلسة أو الأدمن

**Request Headers:**
```http
Authorization: Bearer <teacher_jwt_token>
```

**Request Body:** فارغ

**Response (200 OK):**
```json
{
  "message": "Canceled"
}
```

**الآثار الجانبية:**
- تغيير حالة الجلسة إلى "canceled"
- إرسال إشعار للطلاب بإلغاء الجلسة

---

### 5. تعديل الجلسة
```http
PATCH /api/v1/live-sessions/:id
```

**الوصول:** المعلم مالك الجلسة أو الأدمن

**Request Headers:**
```http
Authorization: Bearer <teacher_jwt_token>
Content-Type: application/json
```

**Request Body (اختياري - أرسل فقط الحقول المراد تغييرها):**
```json
{
  "title": "عنوان جديد",
  "description": "وصف محدث",
  "scheduledAt": "2025-08-17T20:00:00.000Z",
  "durationMinutes": 120
}
```

**Response (200 OK):**
```json
{
  "_id": "689b95684b16a546e1c8cf2d",
  "title": "عنوان جديد",
  "description": "وصف محدث",
  "scheduledAt": "2025-08-17T20:00:00.000Z",
  "durationMinutes": 120,
  "updatedAt": "2025-08-17T11:00:00.000Z"
}
```

**ملاحظة:** إذا تم تغيير `scheduledAt`، ستتم إعادة جدولة الإشعارات.

---

### 6. قائمة الجلسات (عامة)
```http
GET /api/v1/live-sessions
```

**الوصول:** مستخدمون مصادق عليهم (حسب الدور)

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters (اختيارية):**
```
?courseId=67dcb5a3553aadf3cbda95d7
&status=scheduled
&from=2025-08-17T00:00:00.000Z
&to=2025-08-18T23:59:59.000Z
```

**فلترة حسب الدور:**
- **Admin:** يرى جميع الجلسات
- **Teacher:** يرى جلسات كورساته فقط
- **Student:** يرى جلسات الكورسات المسجل بها

**Response (200 OK):**
```json
[
  {
    "_id": "689b95684b16a546e1c8cf2d",
    "title": "جلسة مراجعة",
    "status": "scheduled",
    "scheduledAt": "2025-08-17T19:00:00.000Z",
    "courseId": "67dcb5a3553aadf3cbda95d7"
  }
]
```

---

### 7. تفاصيل جلسة واحدة
```http
GET /api/v1/live-sessions/:id
```

**الوصول:** المعلم مالك الجلسة، الطلاب المسجلين، أو الأدمن

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "_id": "689b95684b16a546e1c8cf2d",
  "title": "جلسة مراجعة الـ JavaScript",
  "description": "مراجعة شاملة لأساسيات JavaScript",
  "courseId": "67dcb5a3553aadf3cbda95d7",
  "teacherId": "67c46c37d6c55ee4d5840c0c",
  "scheduledAt": "2025-08-17T19:00:00.000Z",
  "durationMinutes": 90,
  "status": "scheduled",
  "roomCode": "live_1m2n3o4p_abc123",
  "recordingUrl": null,
  "createdAt": "2025-08-17T10:30:00.000Z",
  "updatedAt": "2025-08-17T10:30:00.000Z"
}
```

**Error (403 Forbidden):**
```json
{
  "message": "Forbidden"
}
```

---

### 8. جلب إعدادات ICE للـ WebRTC
```http
GET /api/v1/live-sessions/:id/ice
```

**الوصول:** مستخدمون مصادق عليهم

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" },
    {
      "urls": ["turn:turn.example.com:3478"],
      "username": "user123",
      "credential": "password123"
    }
  ]
}
```

**الاستخدام في الفرونت:**
```javascript
const response = await fetch(`/api/v1/live-sessions/${sessionId}/ice`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { iceServers } = await response.json();

const peerConnection = new RTCPeerConnection({ iceServers });
```

---

### 9. قائمة جلسات الطالب (خاص)
```http
GET /api/v1/student/live-sessions
```

**الوصول:** الطلاب فقط

**Request Headers:**
```http
Authorization: Bearer <student_jwt_token>
```

**Query Parameters (اختيارية):**
```
?status=scheduled&from=2025-08-17T00:00:00.000Z
```

**Response (200 OK):**
```json
[
  {
    "_id": "689b95684b16a546e1c8cf2d",
    "title": "جلسة مراجعة الـ JavaScript",
    "description": "مراجعة شاملة لأساسيات JavaScript",
    "course": {
      "_id": "67dcb5a3553aadf3cbda95d7",
      "title": "Web Development Basics"
    },
    "teacher": {
      "_id": "67c46c37d6c55ee4d5840c0c",
      "name": "أحمد محمد",
      "username": "ahmed_teacher"
    },
    "scheduledAt": "2025-08-17T19:00:00.000Z",
    "durationMinutes": 90,
    "status": "scheduled",
    "roomCode": "live_1m2n3o4p_abc123"
  }
]
```

## 📱 مثال استخدام الـ API في React

### 1. إنشاء جلسة جديدة (للمعلم)
```jsx
const createSession = async (courseId, sessionData) => {
  try {
    const response = await fetch('/api/v1/live-sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        courseId,
        title: sessionData.title,
        scheduledAt: sessionData.scheduledAt
      })
    });
    
    const result = await response.json();
    if (result.success) {
      // إعادة توجيه للجلسة أو عرض رسالة نجاح
      console.log('Session created:', result.data);
    }
  } catch (error) {
    console.error('Error creating session:', error);
  }
};
```

### 2. جلب الجلسات للطالب
```jsx
const getStudentSessions = async () => {
  try {
    const response = await fetch('/api/v1/student/live-sessions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    if (result.success) {
      return result.data;
    }
  } catch (error) {
    console.error('Error fetching sessions:', error);
  }
};
```

### 3. الانضمام للجلسة مع Socket.IO
```jsx
const joinLiveSession = async (sessionId) => {
  // التحقق من صلاحية الوصول
  const hasAccess = await checkSessionAccess(sessionId);
  if (!hasAccess) return;
  
  // الاتصال بـ Socket.IO
  const socket = io(SERVER_URL, {
    auth: { 
      token: localStorage.getItem('accessToken'),
      userId: localStorage.getItem('userId')
    }
  });
  
  // الانضمام للجلسة
  socket.emit('live:join', { sessionId });
  
  // معالجة الأحداث
  socket.on('live:user-joined', handleUserJoined);
  socket.on('live:offer', handleOffer);
  socket.on('live:answer', handleAnswer);
  socket.on('live:ice-candidate', handleIceCandidate);
};
```

---

## 🔌 Socket.IO Events

### الاتصال والمصادقة
```javascript
const socket = io('http://localhost:8080', {
  auth: {
    token: 'jwt_token_here',
    userId: 'user_id_here'
  }
});
```

### أحداث الجلسة المباشرة

#### 1. الانضمام للجلسة
**من الفرونت للسيرفر:**
```javascript
socket.emit('live:join', { 
  sessionId: '689b95684b16a546e1c8cf2d' 
});
```

**من السيرفر للفرونت (نجح الانضمام):**
```javascript
socket.on('live:peer-joined', ({ userId }) => {
  console.log(`User ${userId} joined the session`);
  // إنشاء اتصال WebRTC جديد
});
```

**من السيرفر للفرونت (خطأ):**
```javascript
socket.on('live:error', ({ message }) => {
  console.error('Error:', message);
  // "Session not found" | "Not allowed"
});
```

#### 2. مغادرة الجلسة
**من الفرونت للسيرفر:**
```javascript
socket.emit('live:leave', { 
  sessionId: '689b95684b16a546e1c8cf2d' 
});
```

**من السيرفر للفرونت:**
```javascript
socket.on('live:peer-left', ({ userId }) => {
  console.log(`User ${userId} left the session`);
  // إغلاق اتصال WebRTC وإزالة الفيديو
});
```

### أحداث WebRTC Signaling

#### 3. إرسال Offer
**من الفرونت للسيرفر:**
```javascript
socket.emit('live:offer', {
  sessionId: '689b95684b16a546e1c8cf2d',
  sdp: offerSdp,
  to: 'target_user_id' // اختياري للـ mesh
});
```

**من السيرفر للفرونت:**
```javascript
socket.on('live:offer', async ({ from, sdp, to }) => {
  // معالجة الـ offer وإرسال answer
  const pc = peerConnections.get(from);
  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  
  socket.emit('live:answer', {
    sessionId: sessionId,
    sdp: answer,
    to: from
  });
});
```

#### 4. إرسال Answer
**من الفرونت للسيرفر:**
```javascript
socket.emit('live:answer', {
  sessionId: '689b95684b16a546e1c8cf2d',
  sdp: answerSdp,
  to: 'target_user_id'
});
```

**من السيرفر للفرونت:**
```javascript
socket.on('live:answer', async ({ from, sdp }) => {
  const pc = peerConnections.get(from);
  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
});
```

#### 5. تبادل ICE Candidates
**من الفرونت للسيرفر:**
```javascript
socket.emit('live:ice', {
  sessionId: '689b95684b16a546e1c8cf2d',
  candidate: iceCandidate,
  to: 'target_user_id'
});
```

**من السيرفر للفرونت:**
```javascript
socket.on('live:ice', async ({ from, candidate }) => {
  const pc = peerConnections.get(from);
  await pc.addIceCandidate(new RTCIceCandidate(candidate));
});
```

### أحداث مشاركة الشاشة

#### 6. بدء مشاركة الشاشة
**من الفرونت للسيرفر:**
```javascript
socket.emit('live:screen-share-start', { 
  sessionId: '689b95684b16a546e1c8cf2d' 
});
```

**من السيرفر للفرونت:**
```javascript
socket.on('live:screen-share-started', ({ userId }) => {
  console.log(`${userId} started screen sharing`);
  // تحديث UI لإظهار أن المستخدم يشارك الشاشة
  markUserAsScreenSharing(userId, true);
});
```

#### 7. إيقاف مشاركة الشاشة
**من الفرونت للسيرفر:**
```javascript
socket.emit('live:screen-share-stop', { 
  sessionId: '689b95684b16a546e1c8cf2d' 
});
```

**من السيرفر للفرونت:**
```javascript
socket.on('live:screen-share-stopped', ({ userId }) => {
  console.log(`${userId} stopped screen sharing`);
  // تحديث UI لإزالة إشارة مشاركة الشاشة
  markUserAsScreenSharing(userId, false);
});
```

### أحداث الإشعارات
```javascript
socket.on('notification', ({ title, message, createdAt }) => {
  // إظهار إشعار في الواجهة
  showNotification(title, message);
});
```

---

## 🖥️ مشاركة الشاشة في React (Screen Sharing)

### التدفق الكامل للتطبيق في React:

#### 1. Hook لإدارة مشاركة الشاشة:
```jsx
const useScreenShare = (socket, sessionId, peerConnections) => {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  
  const startScreenShare = async () => {
    try {
      // 1. طلب إذن مشاركة الشاشة
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      setScreenStream(stream);
      
      // 2. استبدال video track في جميع اتصالات WebRTC
      const videoTrack = stream.getVideoTracks()[0];
      
      peerConnections.forEach(async (pc) => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      });
      
      // 3. إشعار المشاركين
      socket.emit('live:screen-share-start', { sessionId });
      
      // 4. مراقبة انتهاء المشاركة
      videoTrack.addEventListener('ended', () => {
        stopScreenShare();
      });
      
      setIsScreenSharing(true);
      return stream;
      
    } catch (error) {
      console.error('Screen share failed:', error);
    }
  };
  
  const stopScreenShare = async () => {
    if (screenStream) {
      // إيقاف جميع tracks
      screenStream.getTracks().forEach(track => track.stop());
      
      // العودة للكاميرا
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // استبدال tracks مرة أخرى
      const videoTrack = cameraStream.getVideoTracks()[0];
      peerConnections.forEach(async (pc) => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      });
      
      socket.emit('live:screen-share-stop', { sessionId });
      setIsScreenSharing(false);
      setScreenStream(null);
    }
  };
  
  return { isScreenSharing, startScreenShare, stopScreenShare };
};
```

#### 2. Component لأزرار التحكم:
```jsx
const ScreenShareButton = ({ socket, sessionId, peerConnections }) => {
  const { isScreenSharing, startScreenShare, stopScreenShare } = 
    useScreenShare(socket, sessionId, peerConnections);
  
  const handleToggle = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };
  
  return (
    <button 
      onClick={handleToggle}
      className={`btn ${isScreenSharing ? 'btn-danger' : 'btn-primary'}`}
    >
      {isScreenSharing ? 'إيقاف المشاركة' : 'مشاركة الشاشة'}
    </button>
  );
};
```

#### 3. معالجة أحداث مشاركة الشاشة:
```jsx
const LiveSessionPage = () => {
  const [screenSharingUsers, setScreenSharingUsers] = useState([]);
  
  useEffect(() => {
    // عندما يبدأ مستخدم آخر مشاركة الشاشة
    socket.on('live:screen-share-start', ({ userId }) => {
      setScreenSharingUsers(prev => [...prev, userId]);
      // يمكن إظهار مؤشر بصري
      showToast(`${getUserName(userId)} بدأ مشاركة الشاشة`);
    });
    
    // عندما يتوقف عن المشاركة
    socket.on('live:screen-share-stop', ({ userId }) => {
      setScreenSharingUsers(prev => prev.filter(id => id !== userId));
      showToast(`${getUserName(userId)} أوقف مشاركة الشاشة`);
    });
    
    return () => {
      socket.off('live:screen-share-start');
      socket.off('live:screen-share-stop');
    };
  }, [socket]);
  
  return (
    <div className="live-session-page">
      {/* عرض قائمة من يشارك الشاشة */}
      {screenSharingUsers.length > 0 && (
        <div className="screen-sharing-indicator">
          🖥️ يشارك الشاشة: {screenSharingUsers.map(getUserName).join(', ')}
        </div>
      )}
    </div>
  );
};
```

### خطوات التطبيق:

#### **المرحلة 1: إعداد الأذونات**
```jsx
// التحقق من دعم المتصفح
if (!navigator.mediaDevices?.getDisplayMedia) {
  console.error('مشاركة الشاشة غير مدعومة في هذا المتصفح');
}
```

#### **المرحلة 2: UI Components**
- إضافة زر مشاركة الشاشة للـ Control Panel
- مؤشر بصري لمن يشارك الشاشة
- إشعارات عند بدء/إيقاف المشاركة

#### **المرحلة 3: إدارة الحالة**
- حفظ حالة المشاركة في State
- تتبع المستخدمين الذين يشاركون الشاشة
- التنسيق مع WebRTC connections

#### **المرحلة 4: معالجة الأخطاء**
```jsx
const handleScreenShareError = (error) => {
  if (error.name === 'NotAllowedError') {
    showError('المستخدم رفض مشاركة الشاشة');
  } else if (error.name === 'NotSupportedError') {
    showError('مشاركة الشاشة غير مدعومة');
  } else {
    showError('خطأ في مشاركة الشاشة: ' + error.message);
  }
};
```
}
```

#### 2. إيقاف مشاركة الشاشة
```javascript
async function stopScreenShare() {
  try {
    // 1. الحصول على stream الكاميرا مرة أخرى
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    
    // 2. استبدال video track في جميع الاتصالات
    const videoTrack = cameraStream.getVideoTracks()[0];
    
    for (const [userId, peerConnection] of peerConnections) {
      const sender = peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      if (sender) {
        await sender.replaceTrack(videoTrack);
      }
    }
    
    // 3. تحديث الفيديو المحلي
    localVideo.srcObject = cameraStream;
    localStream = cameraStream;
    
    // 4. إشعار المشاركين
    socket.emit('live:screen-share-stop', { sessionId });
    
    isScreenSharing = false;
  } catch (error) {
    console.error('Stop screen share failed:', error);
  }
}
```

### الفرق بين أنواع المشاركة:

| النوع | API المستخدم | الوصف |
|-------|---------------|--------|
| **Camera** | `getUserMedia({ video: true })` | كاميرا الويب العادية |
| **Screen** | `getDisplayMedia({ video: true })` | مشاركة الشاشة أو النافذة |
| **Audio** | `getUserMedia({ audio: true })` | الميكروفون |
| **System Audio** | `getDisplayMedia({ audio: true })` | صوت النظام مع مشاركة الشاشة |

---

## 🔐 نظام الوصول والأذونات

### التحقق من الوصول:

#### للمعلم:
- يمكنه إنشاء/تعديل/بدء/إنهاء جلسات كورساته فقط
- لا يمكنه الوصول لجلسات معلمين آخرين

#### للطالب:
- يمكنه رؤية والانضمام لجلسات الكورسات المسجل بها فقط
- طريقتان للتحقق:
  1. `Course.students` array
  2. `User.purchasedCourses` array

#### للأدمن:
- وصول كامل لجميع الجلسات
- يمكنه بدء/إنهاء أي جلسة
- يمكنه الانضمام لأي جلسة عبر Socket.IO

### كيفية إضافة طالب لكورس:

#### الطريقة الأولى (مصفوفة Course.students):
```javascript
// في MongoDB
db.courses.updateOne(
  { _id: ObjectId("courseId") },
  { $addToSet: { students: ObjectId("studentId") } }
);
```

#### الطريقة الثانية (مصفوفة User.purchasedCourses):
```javascript
// في MongoDB
db.users.updateOne(
  { _id: ObjectId("studentId") },
  { $addToSet: { purchasedCourses: ObjectId("courseId") } }
);
```

---

## ⚙️ متغيرات البيئة

```env
# قاعدة البيانات
MONGO_URI=mongodb://localhost:27017/your_database

# JWT
ACCESS_SECRET=your_jwt_secret

# Frontend URL (للروابط في الإشعارات)
FRONTEND_URL=http://localhost:3000

# Redis (اختياري - للجدولة الموثوقة)
REDIS_URL=redis://localhost:6379

# WebRTC ICE Servers (اختياري)
WEBRTC_ICE_SERVERS_JSON=[{"urls":"stun:stun.l.google.com:19302"},{"urls":["turn:turn.example.com:3478"],"username":"user","credential":"pass"}]

# Server
PORT=8080
```

---

## 🚀 خطوات التطبيق في React

### 1. تثبيت المكتبات المطلوبة
```bash
npm install socket.io-client
```

### 2. هيكل Components المطلوبة

#### **LiveSessionPage Component:**
- الصفحة الرئيسية للجلسة المباشرة
- تحتوي على Videos Container و Controls

#### **VideoContainer Component:**
- عرض الفيديو المحلي (Local Video)
- عرض فيديوهات المشاركين (Remote Videos)
- التحكم في حجم وترتيب الفيديوهات

#### **ControlPanel Component:**
- أزرار التحكم (Join, Leave, Camera, Mic, Screen Share)
- عرض حالة الاتصال والأخطاء
- قائمة المشاركين

#### **ParticipantsList Component:**
- عرض قائمة المشاركين
- إظهار من يشارك الشاشة
- حالة الميكروفون والكاميرا لكل مشارك

### 3. Hooks المطلوبة

#### **useSocket Hook:**
- إدارة اتصال Socket.IO
- معالجة جميع الأحداث (join, leave, offer, answer, ice)
- إدارة حالة الاتصال

#### **useWebRTC Hook:**
- إدارة RTCPeerConnection objects
- معالجة ICE servers
- إدارة Local و Remote streams

#### **useScreenShare Hook:**
- التحكم في مشاركة الشاشة
- التبديل بين الكاميرا والشاشة
- معالجة أحداث بدء/إيقاف المشاركة

#### **useMediaDevices Hook:**
- الحصول على إذن الكاميرا والميكروفون
- التحكم في تشغيل/إيقاف الكاميرا والميكروفون
- معالجة أخطاء الوصول للأجهزة

### 4. State Management

#### **Session State:**
```
- sessionId: string
- isJoined: boolean
- localStream: MediaStream | null
- participants: Map<userId, participantData>
- isScreenSharing: boolean
- connectionStatus: 'connecting' | 'connected' | 'disconnected'
```

#### **WebRTC State:**
```
- peerConnections: Map<userId, RTCPeerConnection>
- iceServers: RTCIceServer[]
- localVideoRef: RefObject
- remoteVideoRefs: Map<userId, RefObject>
```

### 5. خطوات التنفيذ الأساسية

#### **المرحلة الأولى - إعداد Socket.IO:**
1. إنشاء Socket connection مع auth tokens
2. معالجة أحداث الاتصال والانقطاع
3. إعداد event listeners للأحداث الأساسية

#### **المرحلة الثانية - إعداد WebRTC:**
1. جلب ICE servers من الـ API
2. إنشاء RTCPeerConnection للمشاركين
3. إعداد معالجات الأحداث (ontrack, onicecandidate)

#### **المرحلة الثالثة - إدارة Media Streams:**
1. طلب إذن الكاميرا والميكروفون
2. عرض Local video في المكون المخصص
3. إدارة Remote videos من المشاركين

#### **المرحلة الرابعة - Signaling:**
1. معالجة أحداث انضمام/مغادرة المشاركين
2. تبادل Offer/Answer/ICE candidates
3. إدارة حالات الاتصال والأخطاء

#### **المرحلة الخامسة - مشاركة الشاشة:**
1. إضافة وظيفة getDisplayMedia
2. استبدال video tracks في جميع PeerConnections
3. إشعار المشاركين ببدء/إيقاف المشاركة

### 6. مثال لهيكل الملفات

```
src/
├── components/
│   ├── LiveSession/
│   │   ├── LiveSessionPage.jsx
│   │   ├── VideoContainer.jsx
│   │   ├── ControlPanel.jsx
│   │   └── ParticipantsList.jsx
│   └── UI/
│       ├── Button.jsx
│       └── VideoPlayer.jsx
├── hooks/
│   ├── useSocket.js
│   ├── useWebRTC.js
│   ├── useScreenShare.js
│   └── useMediaDevices.js
├── services/
│   ├── socketService.js
│   ├── webrtcService.js
│   └── apiService.js
└── utils/
    ├── constants.js
    └── mediaHelpers.js
```

### 7. نصائح للتطبيق في React

#### **استخدام useEffect للتنظيف:**
- تنظيف Socket connections عند unmount
- إغلاق MediaStreams وPeerConnections
- إلغاء تسجيل event listeners

#### **معالجة الأخطاء:**
- استخدام Error Boundaries
- معالجة رفض إذن الكاميرا/الميكروفون
- إدارة أخطاء الاتصال والشبكة

#### **تحسين الأداء:**
- استخدام useMemo للبيانات الثقيلة
- useCallback للدوال المتكررة
- تأجيل تحميل المكونات غير الضرورية

#### **User Experience:**
- Loading states أثناء الاتصال
- إشعارات للمستخدم عند الأحداث المهمة
- مؤشرات بصرية لحالة الميكروفون والكاميرا

### 8. مكتبات مساعدة موصى بها

```bash
# للإشعارات
npm install react-hot-toast

# للأيقونات
npm install react-icons

# لإدارة الحالة (اختياري)
npm install zustand

# للتحكم في الميديا
npm install react-use
```

---

## ⚠️ ملاحظات مهمة للإنتاج

### 1. HTTPS مطلوب:
- WebRTC و Screen Share APIs تتطلب HTTPS
- استخدم SSL certificate في الإنتاج

### 2. TURN Servers:
- STUN servers للشبكات البسيطة
- TURN servers للشبكات المعقدة (firewalls, NAT)
- أضف TURN servers مدفوعة للإنتاج

### 3. Socket.IO في الإنتاج:
- استخدم خدمة تدعم WebSockets باستمرار
- تجنب Vercel Functions للـ Socket.IO
- استخدم Railway, Render, أو VPS

### 4. حدود المشاركين:
- Mesh topology محدودة بـ 6-8 مشاركين
- استخدم SFU/MCU للمجموعات الأكبر

### 5. معالجة الأخطاء:
- تحقق من دعم المتصفح للـ WebRTC
- معالجة رفض الإذن للكاميرا/الشاشة
- إعادة الاتصال التلقائي للـ Socket.IO

---

## 🧪 اختبار النظام

### 1. اختبار إنشاء جلسة:
```bash
curl -X POST "http://localhost:8080/api/v1/live-sessions" \
  -H "Authorization: Bearer TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Session",
    "courseId": "COURSE_ID",
    "scheduledAt": "2025-08-17T20:00:00.000Z"
  }'
```

### 2. اختبار قائمة جلسات الطالب:
```bash
curl -X GET "http://localhost:8080/api/v1/student/live-sessions" \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### 3. اختبار Socket.IO:
```javascript
const socket = io('http://localhost:8080', {
  auth: { token: 'YOUR_TOKEN', userId: 'YOUR_USER_ID' }
});

socket.emit('live:join', { sessionId: 'SESSION_ID' });
```

---

## 📝 خلاصة الميزات

✅ **منجز:**
- إنشاء وإدارة الجلسات المباشرة
- WebRTC signaling عبر Socket.IO
- مشاركة الشاشة (Screen Sharing)
- إشعارات فورية ومجدولة
- التحكم في الوصول حسب الأدوار
- دعم ICE servers قابل للتخصيص

🔄 **قابل للتحسين:**
- تسجيل الجلسات
- Chat داخل الجلسة
- رفع اليد للأسئلة
- إحصائيات الحضور والمشاركة
- SFU للمجموعات الكبيرة

---

**النظام جاهز للاستخدام في الإنتاج مع التحسينات المقترحة!** 🚀
