# Endpoints Documentation

هذا الملف يحتوي على توثيق جميع الـ Endpoints الخاصة بالمشروع، وسيتم إضافة معلومات عن كل الملفات والـ endpoints هنا.

---

## Auth Endpoints

### 1. Register
**POST** `/register`
تسجيل مستخدم جديد.

**Body:**
- username (string)
- password (string)
- confirm_password (string)
- email (string)
- firstName (string, اختياري)
- lastName (string, اختياري)
- dob (date, اختياري)
- role (string, اختياري)
- (حقول إضافية للمعلمين: certificates, graduationYear, university, major, bio, socialMedia)

**Responses:**
- 201: تم التسجيل بنجاح
- 400: المستخدم موجود بالفعل أو كلمة المرور غير متطابقة

---

### 2. Login
**POST** `/login`
تسجيل الدخول للمستخدم.

**Body:**
- username (string)
- password (string)

**Responses:**
- 200: تسجيل الدخول ناجح (مع accessToken و refreshToken)
- 401: بيانات الدخول غير صحيحة أو الحساب غير مفعل

---

### 3. Verify OTP
**POST** `/verify-otp`
تفعيل الحساب باستخدام كود OTP المرسل على البريد الإلكتروني.

**Body:**
- email (string)
- otp (string)

**Responses:**
- 200: تم تفعيل الحساب
- 400: كود OTP غير صحيح أو بيانات ناقصة أو OTP منتهي الصلاحية
- 404: المستخدم غير موجود

---

### 4. Resend OTP
**POST** `/resend-otp`
إعادة إرسال كود OTP للبريد الإلكتروني.

**Body:**
- email (string)

**Responses:**
- 200: تم إرسال الكود
- 400: البريد الإلكتروني غير صحيح أو المستخدم غير موجود أو طلب متكرر بسرعة
- 500: خطأ في السيرفر

---

### 5. Refresh Token
**POST** `/refresh-token`
تجديد التوكنات (JWT).

**Body:**
- token (string)

**Responses:**
- 200: تم التجديد (مع accessToken و refreshToken جديدين)
- 401/403: غير مصرح

---

### 6. Logout
**POST** `/logout`
تسجيل الخروج وحذف التوكن.

**Body:**
- token (string)

**Responses:**
- 200: تم تسجيل الخروج

---

### 7. Get Current User
**GET** `/current-user`
جلب بيانات المستخدم الحالي (يتطلب توكن).

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: بيانات المستخدم
- 404: المستخدم غير موجود

---

### 8. Forget Password
**POST** `/forget-password`
إرسال رابط إعادة تعيين كلمة المرور للبريد الإلكتروني.

**Body:**
- email (string)

**Responses:**
- 200: تم إرسال الرابط
- 404: المستخدم غير موجود

---

### 9. Reset Password
**POST** `/reset-password`
تعيين كلمة مرور جديدة باستخدام التوكن المرسل على البريد الإلكتروني.

**Body:**
- email (string)
- token (string)
- newPassword (string)

**Responses:**
- 200: تم تغيير كلمة المرور
- 400: بيانات ناقصة أو توكن غير صالح
- 404: المستخدم غير موجود

---

> **ملاحظة:**
بعض الـ Endpoints تستخدم Rate Limiting للحماية من الإساءة.

---

## Cart Endpoints

### 1. Add Course to Cart
**POST** `/cart`
إضافة كورس إلى السلة.

**Body:**
- courseId (string): معرف الكورس

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: تم إضافة الكورس للسلة
- 400: معرف الكورس غير صحيح أو الكورس موجود بالفعل
- 404: الكورس غير موجود
- 500: خطأ في السيرفر

---

### 2. Remove Course from Cart
**DELETE** `/cart`
حذف كورس من السلة.

**Body:**
- courseId (string): معرف الكورس

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: تم حذف الكورس من السلة
- 400: معرف الكورس غير صحيح
- 404: السلة أو الكورس غير موجود
- 500: خطأ في السيرفر

---

### 3. Get User Cart
**GET** `/cart/:userId`
جلب سلة المستخدم.

**Params:**
- userId (string): معرف المستخدم

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: بيانات السلة
- 400: معرف المستخدم غير صحيح
- 403: غير مصرح بالوصول
- 404: السلة غير موجودة
- 500: خطأ في السيرفر

---

### 4. Checkout
**POST** `/cart/checkout`
إتمام عملية الشراء (تصفير السلة).

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: تم الشراء بنجاح
- 400: السلة فارغة
- 500: خطأ في السيرفر

---

### 5. Apply Coupon
**POST** `/cart/apply-coupon`
تطبيق كوبون خصم على السلة.

**Body:**
- couponCode (string): كود الكوبون

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: تم تطبيق الكوبون
- 400: الكوبون غير صالح أو مستخدم من قبل أو السلة فارغة
- 500: خطأ في السيرفر

---

## Answers Endpoints

### 1. Get All Answers  
**GET** `/answers`  
جلب جميع الإجابات.

**Responses:**  
- 200: قائمة بكل الإجابات  
- 500: خطأ في السيرفر

---

### 2. Get Answer By ID  
**GET** `/answers/:_id`  
جلب إجابة واحدة باستخدام الـ ID.

**Parameters:**  
- _id (string): معرف الإجابة

**Responses:**  
- 200: بيانات الإجابة  
- 404: لم يتم العثور على الإجابة  
- 500: خطأ في السيرفر

---

### 3. Add Answer  
**POST** `/answers`  
إضافة إجابة جديدة.

**Body:**  
- content (string): نص الإجابة  
- isCorrect (boolean): هل الإجابة صحيحة  
- questionId (string): معرف السؤال المرتبط

**Responses:**  
- 201: تم إضافة الإجابة  
- 400: بيانات ناقصة أو خطأ في الإدخال

---

### 4. Update Answer  
**PUT** `/answers`  
تحديث بيانات إجابة موجودة.

**Body:**  
- _id (string): معرف الإجابة  
- ... (أي بيانات أخرى للتحديث)

**Responses:**  
- 200: تم تحديث الإجابة  
- 400: بيانات ناقصة أو خطأ في الإدخال  
- 404: لم يتم العثور على الإجابة

---

### 5. Delete Answer  
**DELETE** `/answers`  
حذف إجابة.

**Body:**  
- _id (string): معرف الإجابة

**Responses:**  
- 200: تم حذف الإجابة  
- 400: بيانات ناقصة  
- 404: لم يتم العثور على الإجابة  
- 500: خطأ في السيرفر

---

> **ملاحظة:**  
كل هذه الـ Endpoints تتعامل مع نموذج الإجابات (Answer) وتستخدم MongoDB عبر Mongoose.

---

## Category Endpoints

### 1. Add Category
**POST** `/categories`
إضافة كاتيجوري جديدة.

**Body:**
- name (string): اسم الكاتيجوري
- description (string): وصف الكاتيجوري (اختياري)

**Responses:**
- 201: تم إضافة الكاتيجوري
- 400: الكاتيجوري موجودة بالفعل
- 500: خطأ في السيرفر

---

### 2. Get All Categories
**GET** `/categories`
جلب جميع الكاتيجوريز.

**Responses:**
- 200: قائمة الكاتيجوريز
- 500: خطأ في السيرفر

---

### 3. Get Category By ID
**GET** `/categories/:id`
جلب كاتيجوري معينة باستخدام الـ ID.

**Params:**
- id (string): معرف الكاتيجوري

**Responses:**
- 200: بيانات الكاتيجوري
- 404: الكاتيجوري غير موجودة
- 500: خطأ في السيرفر

---

### 4. Update Category
**PUT** `/categories/:id`
تحديث كاتيجوري.

**Params:**
- id (string): معرف الكاتيجوري

**Body:**
- name (string): اسم جديد (اختياري)
- description (string): وصف جديد (اختياري)

**Responses:**
- 200: تم تحديث الكاتيجوري
- 404: الكاتيجوري غير موجودة
- 500: خطأ في السيرفر

---

### 5. Delete Category
**DELETE** `/categories/:id`
حذف كاتيجوري.

**Params:**
- id (string): معرف الكاتيجوري

**Responses:**
- 200: تم حذف الكاتيجوري بنجاح
- 404: الكاتيجوري غير موجودة
- 500: خطأ في السيرفر

---

## Chatbot Endpoints

### 1. Get Chatbot Response
**POST** `/chatbot`
الحصول على رد من الشات بوت (BlenderBot).

**Body:**
- userMessage (string): رسالة المستخدم

**Responses:**
- 200: رد الشات بوت (string)
- 500: خطأ في السيرفر أو في الاتصال بـ HuggingFace API

---

## Community Endpoints

### 1. Create Post
**POST** `/community/posts`
إنشاء منشور جديد.

**Body:**
- content (string): نص المنشور (مطلوب)
- media (string/array): وسائط (اختياري)
- type (string): نوع المنشور (اختياري)
- groupId (string): معرف الجروب (اختياري)
- courseId (string): معرف الكورس (اختياري)

**Headers:**
- Authorization: Bearer token

**Responses:**
- 201: تم إنشاء المنشور
- 400: بيانات ناقصة
- 404: الجروب غير موجود
- 500: خطأ في السيرفر

---

### 2. Get Posts
**GET** `/community/posts`
جلب جميع المنشورات (مع إمكانية الفلترة حسب الجروب أو الكورس).

**Query:**
- groupId (string): فلترة حسب الجروب (اختياري)
- courseId (string): فلترة حسب الكورس (اختياري)

**Responses:**
- 200: قائمة المنشورات
- 500: خطأ في السيرفر

---

### 3. Like/Unlike Post
**POST** `/community/posts/:postId/like`
عمل لايك أو إلغاء لايك لمنشور.

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: حالة المنشور بعد التعديل
- 404: المنشور غير موجود
- 500: خطأ في السيرفر

---

### 4. Create Comment
**POST** `/community/comments`
إضافة تعليق على منشور.

**Body:**
- content (string): نص التعليق (مطلوب)
- postId (string): معرف المنشور (مطلوب)
- parentCommentId (string): معرف التعليق الأب (اختياري)

**Headers:**
- Authorization: Bearer token

**Responses:**
- 201: تم إضافة التعليق
- 400: بيانات ناقصة
- 404: المنشور غير موجود
- 500: خطأ في السيرفر

---

### 5. Get Comments
**GET** `/community/posts/:postId/comments`
جلب تعليقات منشور معين.

**Responses:**
- 200: قائمة التعليقات
- 500: خطأ في السيرفر

---

### 6. Like Comment
**POST** `/community/posts/:postId/comments/:commentId/like`
عمل لايك لتعليق.

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: قائمة التعليقات بعد التعديل
- 404: التعليق غير موجود
- 500: خطأ في السيرفر

---

### 7. Create Group
**POST** `/community/groups`
إنشاء جروب جديد.

**Body:**
- name (string): اسم الجروب (مطلوب)
- description (string): وصف الجروب (اختياري)
- courseId (string): معرف الكورس (اختياري)
- isPrivate (boolean): جروب خاص (اختياري)
- invitedMembers (array): أعضاء مدعوين (اختياري)

**Headers:**
- Authorization: Bearer token

**Responses:**
- 201: تم إنشاء الجروب
- 400: بيانات ناقصة
- 500: خطأ في السيرفر

---

### 8. Accept Group Invite
**POST** `/community/groups/:groupId/accept-invite`
قبول دعوة جروب.

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: بيانات الجروب بعد الانضمام
- 404: الجروب غير موجود
- 500: خطأ في السيرفر

---

### 9. Get User Groups
**GET** `/community/groups`
جلب جميع الجروبات التي ينتمي إليها المستخدم أو تمت دعوته إليها.

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: قائمة الجروبات
- 500: خطأ في السيرفر

---

### 10. Add Group Member
**POST** `/community/groups/add-member`
إضافة عضو للجروب (فقط للمنشئ).

**Body:**
- groupId (string): معرف الجروب
- userId (string): معرف العضو

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: بيانات الجروب بعد الإضافة
- 403: غير مصرح (فقط المنشئ)
- 404: الجروب غير موجود
- 500: خطأ في السيرفر

---

### 11. Remove Group Member
**POST** `/community/groups/remove-member`
حذف عضو من الجروب (فقط للمنشئ).

**Body:**
- groupId (string): معرف الجروب
- userId (string): معرف العضو

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: بيانات الجروب بعد الحذف
- 403: غير مصرح (فقط المنشئ)
- 404: الجروب غير موجود
- 500: خطأ في السيرفر

---

### 12. Create Chat Room
**POST** `/community/chatrooms`
إنشاء غرفة دردشة.

**Body:**
- name (string): اسم الغرفة

**Headers:**
- Authorization: Bearer token

**Responses:**
- 201: تم إنشاء الغرفة
- 400: بيانات ناقصة
- 500: خطأ في السيرفر

---

### 13. Get User Chat Rooms
**GET** `/community/chatrooms`
جلب جميع غرف الدردشة التي ينتمي إليها المستخدم.

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: قائمة الغرف
- 500: خطأ في السيرفر

---

### 14. Send Group Message
**POST** `/community/groups/send-message`
إرسال رسالة في جروب.

**Body:**
- groupId (string): معرف الجروب
- content (string): نص الرسالة

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: تم إرسال الرسالة
- 400: بيانات ناقصة
- 404: الجروب غير موجود
- 500: خطأ في السيرفر

---

### 15. Send Admin Notification
**POST** `/community/admin/notification`
إرسال إشعار من الأدمن (Admins only).

**Body:**
- message (string): نص الإشعار
- broadcastTo (string/array): الفئة المستهدفة

**Headers:**
- Authorization: Bearer token (role: admin)

**Responses:**
- 201: تم إرسال الإشعار
- 403: غير مصرح (Admins only)
- 500: خطأ في السيرفر

---

### 16. Get Notifications
**GET** `/community/notifications`
جلب إشعارات المستخدم.

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: قائمة الإشعارات
- 500: خطأ في السيرفر

---

### 17. Get Activity Stats
**GET** `/community/activity-stats`
جلب إحصائيات نشاط المستخدم.

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: بيانات الإحصائيات
- 500: خطأ في السيرفر

---

## Coupon Endpoints

### 1. Create Coupon
**POST** `/coupons`
إنشاء كوبون جديد (للمعلمين فقط).

**Headers:**
- Authorization: Bearer token (role: advertiser)

**Responses:**
- 201: تم إنشاء الكوبون
- 400: الحد الأقصى للكوبونات أو خطأ آخر
- 403: غير مصرح (فقط للمعلنين)
- 500: خطأ في السيرفر

---

### 2. Get Advertiser Coupons
**GET** `/coupons/my`
جلب كوبونات المعلن مع عدد الاستخدامات.

**Headers:**
- Authorization: Bearer token (role: advertiser)

**Responses:**
- 200: قائمة الكوبونات مع عدد الاستخدامات
- 403: غير مصرح (فقط للمعلنين)
- 500: خطأ في السيرفر

---

### 3. Get Admin Coupon Report
**GET** `/coupons/admin/report`
جلب تقرير الكوبونات للمشرف (Admins only).

**Headers:**
- Authorization: Bearer token (role: admin)

**Responses:**
- 200: تقرير الكوبونات
- 403: غير مصرح (Admins only)
- 500: خطأ في السيرفر

---

## Course Endpoints

### 1. Add Course
**POST** `/courses`
إضافة كورس جديد (للمعلمين فقط).

**Headers:**
- Authorization: Bearer token (role: teacher)

**Body:**
- title, description, price, level, category, sections, resources, tags, whatYouWillLearn, requirements, targetAudience, lessonVideos, lessonThumbnails, featuredImage

**Responses:**
- 201: تم إنشاء الكورس
- 400: بيانات ناقصة أو خطأ في الملفات
- 500: خطأ في السيرفر

---

### 2. Get All Courses
**GET** `/courses`
جلب جميع الكورسات.

**Responses:**
- 200: قائمة الكورسات
- 500: خطأ في السيرفر

---

### 3. Get Courses Count
**GET** `/courses/count`
جلب عدد الكورسات فقط.

**Responses:**
- 200: عدد الكورسات
- 500: خطأ في السيرفر

---

### 4. Get Course Preview
**GET** `/courses/preview`
جلب بيانات معاينة الكورسات مع متوسط التقييم.

**Responses:**
- 200: قائمة الكورسات مع التقييم
- 500: خطأ في السيرفر

---

### 5. Get Most Viewed Courses
**GET** `/courses/most-viewed?limit=10`
جلب الكورسات الأكثر مشاهدة.

**Query:**
- limit (number): عدد النتائج (اختياري)

**Responses:**
- 200: قائمة الكورسات
- 404: لا يوجد كورسات
- 500: خطأ في السيرفر

---

### 6. Get Course Preview By ID
**GET** `/courses/preview/:id`
جلب معاينة كورس واحد مع زيادة عدد المشاهدات.

**Params:**
- id (string): معرف الكورس

**Responses:**
- 200: بيانات الكورس
- 404: الكورس غير موجود
- 500: خطأ في السيرفر

---

### 7. Get Course Details Without Videos
**GET** `/courses/details/:id`
جلب تفاصيل كورس بدون روابط الفيديو.

**Params:**
- id (string): معرف الكورس

**Responses:**
- 200: تفاصيل الكورس
- 404: الكورس غير موجود
- 500: خطأ في السيرفر

---

### 8. Get Course By ID
**GET** `/courses/:id`
جلب كورس واحد بالمعرف.

**Params:**
- id (string): معرف الكورس

**Responses:**
- 200: بيانات الكورس
- 404: الكورس غير موجود
- 500: خطأ في السيرفر

---

### 9. Get Courses By Teacher
**GET** `/courses/teacher/:teacherId`
جلب جميع كورسات معلم معين.

**Params:**
- teacherId (string): معرف المعلم

**Responses:**
- 200: قائمة الكورسات
- 404: لا يوجد كورسات
- 500: خطأ في السيرفر

---

### 10. Update Course
**PUT** `/courses/:id`
تحديث بيانات كورس (للمعلم فقط).

**Headers:**
- Authorization: Bearer token (role: teacher)

**Params:**
- id (string): معرف الكورس

**Body:**
- أي من بيانات الكورس للتحديث

**Responses:**
- 200: تم التحديث
- 404: الكورس غير موجود
- 500: خطأ في السيرفر

---

### 11. Delete Course
**DELETE** `/courses/:id`
حذف كورس.

**Params:**
- id (string): معرف الكورس

**Responses:**
- 200: تم الحذف
- 404: الكورس غير موجود
- 500: خطأ في السيرفر

---

## Feedback Endpoints

### 1. Get All Feedbacks
**GET** `/feedbacks`
جلب جميع التقييمات.

**Responses:**
- 200: قائمة التقييمات
- 500: خطأ في السيرفر

---

### 2. Get Feedbacks By Course ID
**GET** `/feedbacks/course/:courseId`
جلب تقييمات كورس معين.

**Params:**
- courseId (string): معرف الكورس

**Responses:**
- 200: قائمة التقييمات
- 500: خطأ في السيرفر

---

### 3. Get Feedback By ID
**GET** `/feedbacks/:_id`
جلب تقييم واحد بالمعرف.

**Params:**
- _id (string): معرف التقييم

**Responses:**
- 200: بيانات التقييم
- 404: التقييم غير موجود
- 500: خطأ في السيرفر

---

### 4. Add Feedback
**POST** `/feedbacks`
إضافة تقييم جديد.

**Body:**
- courseId (string): معرف الكورس
- comment (string): التعليق
- rating (number): التقييم (1-5)

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: تم إضافة التقييم
- 400: بيانات ناقصة أو تقييم غير صحيح
- 500: خطأ في السيرفر

---

### 5. Update Feedback
**PUT** `/feedbacks/:id`
تحديث تقييم (فقط لصاحب التقييم).

**Params:**
- id (string): معرف التقييم

**Body:**
- comment (string): التعليق
- rating (number): التقييم (1-5)

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: تم التحديث
- 400: تقييم غير صحيح
- 404: التقييم غير موجود أو غير مصرح
- 500: خطأ في السيرفر

---

### 6. Delete Feedback
**DELETE** `/feedbacks/:_id`
حذف تقييم (فقط لصاحب التقييم).

**Params:**
- _id (string): معرف التقييم

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: تم الحذف
- 404: التقييم غير موجود أو غير مصرح
- 500: خطأ في السيرفر

---

## Forum Endpoints

### 1. Get All Forums
**GET** `/forums`
جلب جميع المنتديات.

**Responses:**
- 200: قائمة المنتديات
- 500: خطأ في السيرفر

---

### 2. Get Forum By ID
**GET** `/forums/:id`
جلب منتدى واحد بالمعرف.

**Params:**
- id (string): معرف المنتدى

**Responses:**
- 200: بيانات المنتدى
- 400: معرف غير صحيح
- 404: المنتدى غير موجود
- 500: خطأ في السيرفر

---

### 3. Create Forum
**POST** `/forums`
إنشاء منتدى جديد.

**Body:**
- userId (string): معرف المستخدم
- title (string): عنوان المنتدى
- content (string): محتوى المنتدى

**Responses:**
- 201: تم الإنشاء
- 400: بيانات ناقصة
- 500: خطأ في السيرفر

---

### 4. Update Forum
**PUT** `/forums/:id`
تحديث محتوى منتدى.

**Params:**
- id (string): معرف المنتدى

**Body:**
- content (string): المحتوى الجديد

**Responses:**
- 200: تم التحديث
- 400: معرف غير صحيح أو بيانات ناقصة
- 404: المنتدى غير موجود
- 500: خطأ في السيرفر

---

### 5. Delete Forum
**DELETE** `/forums/:id`
حذف منتدى.

**Params:**
- id (string): معرف المنتدى

**Responses:**
- 200: تم الحذف
- 400: معرف غير صحيح
- 404: المنتدى غير موجود
- 500: خطأ في السيرفر

---

## Group Endpoints

### 1. Get All Groups
**GET** `/groups`
جلب جميع الجروبات.

**Responses:**
- 200: قائمة الجروبات
- 500: خطأ في السيرفر

---

### 2. Get Group By ID
**GET** `/groups/:id`
جلب جروب واحد بالمعرف.

**Params:**
- id (string): معرف الجروب

**Responses:**
- 200: بيانات الجروب
- 400: معرف غير صحيح
- 404: الجروب غير موجود
- 500: خطأ في السيرفر

---

### 3. Create Group
**POST** `/groups`
إنشاء جروب جديد.

**Body:**
- createdBy (string): معرف المنشئ
- name (string): اسم الجروب
- courseId (string): معرف الكورس

**Responses:**
- 201: تم الإنشاء
- 400: بيانات ناقصة
- 500: خطأ في السيرفر

---

### 4. Update Group
**PUT** `/groups/:id`
تحديث اسم جروب.

**Params:**
- id (string): معرف الجروب

**Body:**
- name (string): الاسم الجديد

**Responses:**
- 200: تم التحديث
- 400: معرف غير صحيح أو بيانات ناقصة
- 404: الجروب غير موجود
- 500: خطأ في السيرفر

---

### 5. Delete Group
**DELETE** `/groups/:id`
حذف جروب.

**Params:**
- id (string): معرف الجروب

**Responses:**
- 200: تم الحذف
- 400: معرف غير صحيح
- 404: الجروب غير موجود
- 500: خطأ في السيرفر

---

## Notification Endpoints

### 1. Create Notification
**POST** `/notifications`
إرسال إشعار (Admins only).

**Headers:**
- Authorization: Bearer token (role: admin)

**Body:**
- title (string): عنوان الإشعار
- message (string): نص الإشعار
- recipientType (string): نوع المستلمين (all | teachers | students | advertisers)

**Responses:**
- 201: تم إرسال الإشعار
- 400: نوع مستلمين غير صحيح
- 403: غير مصرح (Admins only)
- 500: خطأ في السيرفر

---

### 2. Get User Notifications
**GET** `/notifications/my`
جلب إشعارات المستخدم.

**Headers:**
- Authorization: Bearer token

**Responses:**
- 200: قائمة الإشعارات
- 500: خطأ في السيرفر

---

### 3. Mark Notification As Read
**PUT** `/notifications/:notificationId/read`
تحديد إشعار كمقروء.

**Headers:**
- Authorization: Bearer token

**Params:**
- notificationId (string): معرف الإشعار

**Responses:**
- 200: تم التحديد كمقروء
- 404: الإشعار غير موجود
- 500: خطأ في السيرفر

---

### 4. Delete Notification
**DELETE** `/notifications/:notificationId`
حذف إشعار.

**Headers:**
- Authorization: Bearer token

**Params:**
- notificationId (string): معرف الإشعار

**Responses:**
- 200: تم الحذف
- 404: الإشعار غير موجود
- 500: خطأ في السيرفر

---

## Payment Endpoints

### 1. Create Payment
**POST** `/payments`
بدء عملية دفع عبر Paymob.

**Headers:**
- Authorization: Bearer token

**Body:**
- amount (number): المبلغ بالجنيه المصري
- email (string): البريد الإلكتروني (اختياري)
- phoneNumber, street, building, floor, apartment, city, country, state, postalCode (اختياري)

**Responses:**
- 200: بيانات الدفع (paymentKey, orderId)
- 401: المستخدم غير مسجل دخول
- 500: خطأ في الدفع أو السيرفر

---

## Question Endpoints

### 1. Get All Questions
**GET** `/questions`
جلب جميع الأسئلة.

**Responses:**
- 200: قائمة الأسئلة
- 500: خطأ في السيرفر

---

### 2. Get Question By ID
**GET** `/questions/:id`
جلب سؤال واحد بالمعرف.

**Params:**
- id (string): معرف السؤال

**Responses:**
- 200: بيانات السؤال
- 404: السؤال غير موجود
- 500: خطأ في السيرفر

---

### 3. Add Question
**POST** `/questions`
إضافة سؤال جديد.

**Body:**
- content (string): نص السؤال
- quizID (string): معرف الكويز

**Responses:**
- 201: تم إضافة السؤال
- 400: بيانات ناقصة
- 500: خطأ في السيرفر

---

### 4. Update Question
**PUT** `/questions/:id`
تحديث سؤال.

**Params:**
- id (string): معرف السؤال

**Body:**
- content (string): نص السؤال الجديد

**Responses:**
- 200: تم التحديث
- 400: خطأ في البيانات
- 404: السؤال غير موجود
- 500: خطأ في السيرفر

---

### 5. Delete Question
**DELETE** `/questions/:id`
حذف سؤال.

**Params:**
- id (string): معرف السؤال

**Responses:**
- 200: تم الحذف
- 404: السؤال غير موجود
- 500: خطأ في السيرفر

---

## Quiz Endpoints

### 1. Get All Quizzes
**GET** `/quizzes`
جلب جميع الكويزات.

**Responses:**
- 200: قائمة الكويزات
- 500: خطأ في السيرفر

---

### 2. Get Quiz By ID
**GET** `/quizzes/:id`
جلب كويز واحد بالمعرف.

**Params:**
- id (string): معرف الكويز

**Responses:**
- 200: بيانات الكويز
- 400: معرف غير صحيح
- 404: الكويز غير موجود
- 500: خطأ في السيرفر

---

### 3. Create Quiz
**POST** `/quizzes`
إنشاء كويز جديد.

**Body:**
- title (string): عنوان الكويز
- courseId (string): معرف الكورس

**Responses:**
- 201: تم الإنشاء
- 400: بيانات ناقصة
- 500: خطأ في السيرفر

---

### 4. Update Quiz
**PUT** `/quizzes/:id`
تحديث كويز.

**Params:**
- id (string): معرف الكويز

**Body:**
- title (string): العنوان الجديد

**Responses:**
- 200: تم التحديث
- 400: معرف غير صحيح أو بيانات ناقصة
- 404: الكويز غير موجود
- 500: خطأ في السيرفر

---

### 5. Delete Quiz
**DELETE** `/quizzes/:id`
حذف كويز.

**Params:**
- id (string): معرف الكويز

**Responses:**
- 200: تم الحذف
- 400: معرف غير صحيح
- 404: الكويز غير موجود
- 500: خطأ في السيرفر

---

## Resource Endpoints

### 1. Get Resources By Course ID
**GET** `/resources/:id`
جلب جميع الموارد الخاصة بكورس معين.

**Params:**
- id (string): معرف الكورس

**Responses:**
- 200: قائمة الموارد
- 500: خطأ في السيرفر

---

## User Endpoints

### 1. Get All Users
**GET** `/users`
جلب جميع المستخدمين.

**Responses:**
- 200: قائمة المستخدمين
- 500: خطأ في السيرفر

---

### 2. Get User By ID
**GET** `/users/:id`
جلب مستخدم واحد بالمعرف.

**Params:**
- id (string): معرف المستخدم

**Responses:**
- 200: بيانات المستخدم
- 404: المستخدم غير موجود
- 500: خطأ في السيرفر

---

### 3. Get Courses By User
**GET** `/users/:id/courses`
جلب الكورسات الخاصة بمستخدم معين (كمدرس أو طالب).

**Params:**
- id (string): معرف المستخدم

**Responses:**
- 200: قائمة الكورسات
- 404: المستخدم غير موجود
- 500: خطأ في السيرفر

---

### 4. Get User Forums
**GET** `/users/:id/forums`
جلب المنتديات الخاصة بمستخدم معين.

**Params:**
- id (string): معرف المستخدم

**Responses:**
- 200: قائمة المنتديات
- 404: المستخدم غير موجود
- 500: خطأ في السيرفر

---

### 5. Get User Notifications
**GET** `/users/:id/notifications`
جلب إشعارات مستخدم معين.

**Params:**
- id (string): معرف المستخدم

**Responses:**
- 200: قائمة الإشعارات
- 404: المستخدم غير موجود
- 500: خطأ في السيرفر

---

### 6. Get User Activities
**GET** `/users/:id/activities`
جلب أنشطة مستخدم معين.

**Params:**
- id (string): معرف المستخدم

**Responses:**
- 200: قائمة الأنشطة
- 404: المستخدم غير موجود
- 500: خطأ في السيرفر

---

### 7. Edit User Info
**PUT** `/users/:id`
تعديل بيانات مستخدم.

**Params:**
- id (string): معرف المستخدم

**Body:**
- firstName, lastName, email, dob, password, newPassword

**Responses:**
- 200: تم التحديث
- 401: كلمة مرور غير صحيحة
- 404: المستخدم غير موجود
- 500: خطأ في السيرفر

---

### 8. Delete User
**DELETE** `/users/:id`
حذف مستخدم.

**Params:**
- id (string): معرف المستخدم

**Body:**
- password (string): كلمة المرور

**Responses:**
- 200: تم الحذف
- 401: كلمة مرور غير صحيحة
- 403: لا يمكن حذف الأدمن نفسه
- 404: المستخدم غير موجود
- 500: خطأ في السيرفر

---

### 9. Update Profile Image
**PUT** `/users/:id/profile-image`
تحديث صورة البروفايل.

**Params:**
- id (string): معرف المستخدم

**Body:**
- file (image): صورة جديدة

**Responses:**
- 200: تم التحديث
- 400: لا توجد صورة
- 404: المستخدم غير موجود
- 500: خطأ في السيرفر

---

### 10. Get Students Count
**GET** `/users/students/count`
جلب عدد الطلاب فقط.

**Responses:**
- 200: عدد الطلاب
- 500: خطأ في السيرفر

---

### 11. Get Teachers Count
**GET** `/users/teachers/count`
جلب عدد المعلمين فقط.

**Responses:**
- 200: عدد المعلمين
- 500: خطأ في السيرفر

---

### 12. Get All Teachers
**GET** `/users/teachers`
جلب جميع المعلمين.

**Responses:**
- 200: قائمة المعلمين
- 404: لا يوجد معلمين
- 500: خطأ في السيرفر

---

## Admin Endpoints (جديدة)

### Complaints Management
- **GET** `/v1/admin/complaints` : عرض/بحث جميع الشكاوى
- **GET** `/v1/admin/complaints/{id}` : عرض تفاصيل شكوى
- **PATCH** `/v1/admin/complaints/{id}/status` : تحديث حالة الشكوى
- **DELETE** `/v1/admin/complaints/{id}` : حذف شكوى

### Coupons Management
- **POST** `/v1/admin/coupons` : إنشاء كوبون جديد
- **GET** `/v1/admin/coupons` : عرض/بحث جميع الكوبونات
- **GET** `/v1/admin/coupons/{id}` : عرض كوبون محدد
- **PUT** `/v1/admin/coupons/{id}` : تعديل كوبون
- **DELETE** `/v1/admin/coupons/{id}` : حذف كوبون
- **PATCH** `/v1/admin/coupons/{id}/toggle` : تفعيل/تعطيل كوبون

### Logs Management
- **GET** `/v1/admin/logs` : عرض/بحث سجل النشاطات
- **GET** `/v1/admin/logs/{id}` : عرض تفاصيل سجل
- **DELETE** `/v1/admin/logs/{id}` : حذف سجل محدد
- **DELETE** `/v1/admin/logs` : حذف جميع السجلات

### Pages Management
- **POST** `/v1/admin/pages` : إنشاء صفحة ثابتة
- **GET** `/v1/admin/pages` : عرض/بحث جميع الصفحات
- **GET** `/v1/admin/pages/{id}` : عرض صفحة محددة
- **PUT** `/v1/admin/pages/{id}` : تعديل صفحة
- **DELETE** `/v1/admin/pages/{id}` : حذف صفحة

### Admin Dashboard Stats
- **GET** `/v1/admin/stats/dashboard` : إحصائيات لوحة التحكم

---

## Teacher Endpoints (جديدة)

### Students Management
- **GET** `/v1/teacher/students?courseId=` : عرض الطلاب في كورس
- **DELETE** `/v1/teacher/students` : حذف طالب من كورس
- **GET** `/v1/teacher/students/progress?courseId=&studentId=` : عرض تقدم طالب في كورس

### Resources Management
- **POST** `/v1/teacher/resources` : إضافة مادة (ملف/رابط)
- **GET** `/v1/teacher/resources?courseId=` : عرض جميع المواد
- **DELETE** `/v1/teacher/resources/{id}` : حذف مادة

### Progress Tracking
- **GET** `/v1/teacher/progress?courseId=` : إحصائيات تقدم الطلاب في كورس

### Feedbacks Management
- **GET** `/v1/teacher/feedbacks?courseId=` : عرض تقييمات كورس
- **POST** `/v1/teacher/feedbacks/{feedbackId}/reply` : رد المعلم على تقييم
- **PATCH** `/v1/teacher/feedbacks/{feedbackId}/toggle` : إظهار/إخفاء تقييم

### Course Stats
- **GET** `/v1/teacher/course-stats?courseId=` : إحصائيات الكورس

---

## Student Endpoints (جديدة)

### Courses
- **GET** `/v1/student/courses` : عرض كورساتي
- **DELETE** `/v1/student/courses` : إلغاء الاشتراك في كورس

### Favorites
- **GET** `/v1/student/favorites` : عرض المفضلة
- **POST** `/v1/student/favorites` : إضافة كورس للمفضلة
- **DELETE** `/v1/student/favorites` : حذف كورس من المفضلة

### Certificates
- **GET** `/v1/student/certificates` : عرض جميع الشهادات
- **GET** `/v1/student/certificates/{id}` : عرض شهادة محددة

### Progress
- **GET** `/v1/student/progress?courseId=` : عرض تقدم الطالب في كورس

---

# مجموع جميع الـ Endpoints في المشروع (قديمة + جديدة)

---

### Google Auth (تسجيل/دخول عبر جوجل)
**POST** `/v1/auth/google`

**Body:**
- googleId (string): معرف جوجل للمستخدم (مطلوب)
- email (string): البريد الإلكتروني (مطلوب)
- firstName (string): الاسم الأول (مطلوب)
- lastName (string): الاسم الأخير (مطلوب)
- profileImage (string): رابط صورة البروفايل (اختياري)
- role (string): نوع المستخدم (student/teacher) (مطلوب)

**Responses:**
- 200: تسجيل الدخول/التسجيل ناجح (accessToken, refreshToken, user)
- 400: بيانات ناقصة
- 500: خطأ في السيرفر

---
