import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString as parsePhoneNumberStrict,
} from "libphonenumber-js/max";

type RuntimeConfig = {
  resolvedLocale?: string;
  defaultLocale?: string;
  supportedLocales?: string[];
  localizedCopy?: Record<string, string>;
  inAppBrowserMode?: "allow" | "guide_external";
  previewMode?: boolean;
  previewDevice?: "desktop" | "tablet" | "mobile";
};

type PairingHandle = {
  pairingCode: string;
  attemptId?: string;
  pairingStatus?: string;
  expiresAt?: string;
};

type BridgeError = Error & {
  code?: string;
  retryable?: boolean;
  status?: number;
};

const flagSpriteCssCache = new Map<string, Promise<string>>();

function resolveFlagSheetHref(rawHref: string) {
  const linked = document.querySelector<HTMLLinkElement>(
    'link[rel="stylesheet"][data-template-phone-flag-sheet], link[rel="stylesheet"][href*="sprite-positions"]',
  );
  if (linked?.href) return linked.href;
  const configured = document.getElementById("phone-flag-sprite");
  if (configured?.textContent) {
    try {
      const payload = JSON.parse(configured.textContent) as { sheet?: string };
      if (typeof payload.sheet === "string") return new URL(payload.sheet, document.baseURI).href;
    } catch { /* ignore malformed embed */ }
  }
  return new URL(rawHref, document.baseURI).href;
}

function readEmbeddedFlagSpriteCss(resolvedSheetHref: string) {
  const node = document.getElementById("phone-flag-sprite");
  if (!node?.textContent) return undefined;
  try {
    const payload = JSON.parse(node.textContent) as { css?: string };
    if (typeof payload.css !== "string") return undefined;
    const base = new URL("./", resolvedSheetHref);
    return payload.css.replace(/url\("img\//g, `url("${new URL("img/", base).href}`);
  } catch {
    return undefined;
  }
}

function loadFlagSpriteCss(sheetUrl: string): Promise<string> {
  const embedded = readEmbeddedFlagSpriteCss(sheetUrl);
  if (embedded) return Promise.resolve(embedded);
  const cached = flagSpriteCssCache.get(sheetUrl);
  if (cached) return cached;
  const promise = fetch(sheetUrl).then(async (response) => {
    if (!response.ok) throw new Error(`flag sheet ${response.status}`);
    const css = await response.text();
    const base = new URL(sheetUrl);
    return css.replace(/url\("img\//g, `url("${new URL("img/", base).href}`);
  });
  flagSpriteCssCache.set(sheetUrl, promise);
  return promise;
}

function flagAssetUrls(sheetHref: string) {
  const sheetUrl = new URL(resolveFlagSheetHref(sheetHref));
  const assetBase = new URL("./", sheetUrl);
  return {
    sheet: sheetUrl.href,
    png: new URL("img/flags.png", assetBase).href,
    png2x: new URL("img/flags@2x.png", assetBase).href,
  };
}

function buildInlineFlagBaseCss(sheetHref: string) {
  const { png, png2x } = flagAssetUrls(sheetHref);
  return `.iti__flag-box{display:inline-flex!important;align-items:center;justify-content:center;width:20px;height:15px;overflow:hidden;flex-shrink:0;visibility:visible!important;opacity:1!important}.iti__flag{display:inline-block!important;visibility:visible!important;opacity:1!important;width:20px;height:15px;background-image:url("${png}");background-repeat:no-repeat;background-color:#dbdbdb;background-position:20px 0;box-shadow:0 0 1px rgba(0,0,0,.45);vertical-align:middle;box-sizing:content-box}@media(-webkit-min-device-pixel-ratio:2),(min-resolution:192dpi){.iti__flag{background-image:url("${png2x}");background-size:5652px 15px}}`;
}

type FunctionalCopy = {
  countryLabel: string;
  phoneLabel: string;
  phonePlaceholder: string;
  invalidPhone: string;
  submit: string;
  submitting: string;
  codeTitle: string;
  copyCode: string;
  copied: string;
  expires: string;
  openConsumer: string;
  openBusiness: string;
  appFallback: string;
  waiting: string;
  reconnecting: string;
  verified: string;
  expired: string;
  failed: string;
  cancelled: string;
  alreadyLinked: string;
  unavailable: string;
  inProgress: string;
  retry: string;
  initializing: string;
  initialized: string;
  initializationPartial: string;
  countrySearch?: string;
};

type WhatsAppWebGuideCopy = {
  codeTitle: string;
  instructionOpenPattern: string;
  whatsappLabel: string;
  instructionPlatformPattern: string;
  menuLabel: string;
  settingsLabel: string;
  instructionLinkedPattern: string;
  linkedDevicesLabel: string;
  linkDeviceLabel: string;
  instructionEnterPattern: string;
  phoneLinkLabel: string;
};

type ResolvedCopy = FunctionalCopy & WhatsAppWebGuideCopy;

const COPY: Record<string, FunctionalCopy> = {
  en: {
    countryLabel: "Country or region", phoneLabel: "Mobile number", phonePlaceholder: "Enter your mobile number", invalidPhone: "Enter a valid mobile number.", submit: "Start linking", submitting: "Starting…", codeTitle: "Pairing code", copyCode: "Copy code", copied: "Copied", expires: "Expires in", openConsumer: "Open WhatsApp", openBusiness: "Open WhatsApp Business", appFallback: "If the app did not open, open it manually and keep this page available.", waiting: "Waiting for confirmation on your phone…", reconnecting: "Finishing the secure connection. Keep this page open…", verified: "Account linked successfully.", expired: "This code expired.", failed: "Account linking could not be completed.", cancelled: "Account linking was cancelled.", alreadyLinked: "This number is already linked and available. You do not need to link it again.", unavailable: "This number cannot be linked here.", inProgress: "This number already has a linking request in progress.", retry: "Use another number", initializing: "Account linked. Initializing account information…", initialized: "Account information is ready.", initializationPartial: "Account linked. Some information will continue syncing in the background.", countrySearch: "Search for country name or code",
  },
  "zh-CN": {
    countryLabel: "国家或地区", phoneLabel: "手机号码", phonePlaceholder: "请输入手机号码", invalidPhone: "请输入有效的手机号码。", submit: "开始绑定", submitting: "正在开始…", codeTitle: "绑定码", copyCode: "复制绑定码", copied: "已复制", expires: "剩余时间", openConsumer: "打开 WhatsApp", openBusiness: "打开 WhatsApp Business", appFallback: "如果 App 没有打开，请手动打开，并保留当前页面。", waiting: "正在等待手机确认…", reconnecting: "正在完成安全连接，请保持页面打开…", verified: "账号绑定成功。", expired: "绑定码已过期。", failed: "账号绑定未完成。", cancelled: "账号绑定已取消。", alreadyLinked: "该号码已经绑定并可用，无需重复绑定。", unavailable: "该号码当前不能在这里绑定。", inProgress: "该号码已有正在进行的绑定请求。", retry: "使用其他号码", initializing: "账号已绑定，正在同步账号资料…", initialized: "账号资料已准备完成。", initializationPartial: "账号已绑定，部分资料将在后台继续同步。", countrySearch: "搜索国家名称或区号",
  },
  es: {
    countryLabel: "País o región", phoneLabel: "Número móvil", phonePlaceholder: "Introduce tu número móvil", invalidPhone: "Introduce un número móvil válido.", submit: "Iniciar vinculación", submitting: "Iniciando…", codeTitle: "Código de vinculación", copyCode: "Copiar código", copied: "Copiado", expires: "Caduca en", openConsumer: "Abrir WhatsApp", openBusiness: "Abrir WhatsApp Business", appFallback: "Si la aplicación no se abrió, ábrela manualmente y conserva esta página.", waiting: "Esperando confirmación en tu teléfono…", reconnecting: "Finalizando la conexión. Mantén esta página abierta…", verified: "Cuenta vinculada correctamente.", expired: "El código ha caducado.", failed: "No se pudo completar la vinculación.", cancelled: "La vinculación fue cancelada.", alreadyLinked: "Este número ya está vinculado y disponible.", unavailable: "Este número no se puede vincular aquí.", inProgress: "Este número ya tiene una vinculación en curso.", retry: "Usar otro número", initializing: "Cuenta vinculada. Sincronizando información…", initialized: "La información de la cuenta está lista.", initializationPartial: "Cuenta vinculada. Parte de la información seguirá sincronizándose.",
  },
  de: {
    countryLabel: "Land oder Region", phoneLabel: "Mobilnummer", phonePlaceholder: "Mobilnummer eingeben", invalidPhone: "Gib eine gültige Mobilnummer ein.", submit: "Verknüpfung starten", submitting: "Wird gestartet…", codeTitle: "Verknüpfungscode", copyCode: "Code kopieren", copied: "Kopiert", expires: "Läuft ab in", openConsumer: "WhatsApp öffnen", openBusiness: "WhatsApp Business öffnen", appFallback: "Falls die App nicht geöffnet wurde, öffne sie manuell und lasse diese Seite verfügbar.", waiting: "Warten auf Bestätigung am Telefon…", reconnecting: "Verbindung wird abgeschlossen. Seite geöffnet lassen…", verified: "Konto erfolgreich verknüpft.", expired: "Der Code ist abgelaufen.", failed: "Die Verknüpfung konnte nicht abgeschlossen werden.", cancelled: "Die Verknüpfung wurde abgebrochen.", alreadyLinked: "Diese Nummer ist bereits verknüpft und verfügbar.", unavailable: "Diese Nummer kann hier nicht verknüpft werden.", inProgress: "Für diese Nummer läuft bereits eine Verknüpfung.", retry: "Andere Nummer verwenden", initializing: "Konto verknüpft. Kontoinformationen werden synchronisiert…", initialized: "Kontoinformationen sind bereit.", initializationPartial: "Konto verknüpft. Einige Informationen werden im Hintergrund weiter synchronisiert.",
  },
  fr: {
    countryLabel: "Pays ou région", phoneLabel: "Numéro de mobile", phonePlaceholder: "Saisissez votre numéro", invalidPhone: "Saisissez un numéro de mobile valide.", submit: "Commencer l’association", submitting: "Démarrage…", codeTitle: "Code d’association", copyCode: "Copier le code", copied: "Copié", expires: "Expire dans", openConsumer: "Ouvrir WhatsApp", openBusiness: "Ouvrir WhatsApp Business", appFallback: "Si l’application ne s’est pas ouverte, ouvrez-la manuellement et gardez cette page disponible.", waiting: "En attente de confirmation sur votre téléphone…", reconnecting: "Finalisation de la connexion. Gardez cette page ouverte…", verified: "Compte associé avec succès.", expired: "Ce code a expiré.", failed: "L’association n’a pas pu être terminée.", cancelled: "L’association a été annulée.", alreadyLinked: "Ce numéro est déjà associé et disponible.", unavailable: "Ce numéro ne peut pas être associé ici.", inProgress: "Une association est déjà en cours pour ce numéro.", retry: "Utiliser un autre numéro", initializing: "Compte associé. Synchronisation des informations…", initialized: "Les informations du compte sont prêtes.", initializationPartial: "Compte associé. Certaines informations continueront à se synchroniser.",
  },
  "pt-BR": {
    countryLabel: "País ou região", phoneLabel: "Número de celular", phonePlaceholder: "Digite seu número", invalidPhone: "Digite um número de celular válido.", submit: "Iniciar vinculação", submitting: "Iniciando…", codeTitle: "Código de vinculação", copyCode: "Copiar código", copied: "Copiado", expires: "Expira em", openConsumer: "Abrir WhatsApp", openBusiness: "Abrir WhatsApp Business", appFallback: "Se o app não abriu, abra-o manualmente e mantenha esta página disponível.", waiting: "Aguardando confirmação no celular…", reconnecting: "Finalizando a conexão. Mantenha esta página aberta…", verified: "Conta vinculada com sucesso.", expired: "O código expirou.", failed: "Não foi possível concluir a vinculação.", cancelled: "A vinculação foi cancelada.", alreadyLinked: "Este número já está vinculado e disponível.", unavailable: "Este número não pode ser vinculado aqui.", inProgress: "Este número já possui uma vinculação em andamento.", retry: "Usar outro número", initializing: "Conta vinculada. Sincronizando informações…", initialized: "As informações da conta estão prontas.", initializationPartial: "Conta vinculada. Algumas informações continuarão sendo sincronizadas.",
  },
  ar: {
    countryLabel: "البلد أو المنطقة", phoneLabel: "رقم الهاتف", phonePlaceholder: "أدخل رقم الهاتف", invalidPhone: "أدخل رقم هاتف صالحًا.", submit: "بدء الربط", submitting: "جارٍ البدء…", codeTitle: "رمز الربط", copyCode: "نسخ الرمز", copied: "تم النسخ", expires: "تنتهي الصلاحية خلال", openConsumer: "فتح WhatsApp", openBusiness: "فتح WhatsApp Business", appFallback: "إذا لم يفتح التطبيق، افتحه يدويًا واترك هذه الصفحة متاحة.", waiting: "بانتظار التأكيد على هاتفك…", reconnecting: "جارٍ إكمال الاتصال. اترك الصفحة مفتوحة…", verified: "تم ربط الحساب بنجاح.", expired: "انتهت صلاحية الرمز.", failed: "تعذر إكمال ربط الحساب.", cancelled: "تم إلغاء ربط الحساب.", alreadyLinked: "هذا الرقم مرتبط ومتاح بالفعل.", unavailable: "لا يمكن ربط هذا الرقم هنا.", inProgress: "يوجد طلب ربط جارٍ لهذا الرقم.", retry: "استخدام رقم آخر", initializing: "تم ربط الحساب. جارٍ مزامنة المعلومات…", initialized: "معلومات الحساب جاهزة.", initializationPartial: "تم ربط الحساب. ستستمر مزامنة بعض المعلومات في الخلفية.",
  },
  id: {
    countryLabel: "Negara atau wilayah", phoneLabel: "Nomor ponsel", phonePlaceholder: "Masukkan nomor ponsel", invalidPhone: "Masukkan nomor ponsel yang valid.", submit: "Mulai menautkan", submitting: "Memulai…", codeTitle: "Kode penautan", copyCode: "Salin kode", copied: "Disalin", expires: "Berakhir dalam", openConsumer: "Buka WhatsApp", openBusiness: "Buka WhatsApp Business", appFallback: "Jika aplikasi tidak terbuka, buka secara manual dan biarkan halaman ini tersedia.", waiting: "Menunggu konfirmasi di ponsel…", reconnecting: "Menyelesaikan koneksi. Biarkan halaman ini terbuka…", verified: "Akun berhasil ditautkan.", expired: "Kode ini sudah kedaluwarsa.", failed: "Penautan akun tidak dapat diselesaikan.", cancelled: "Penautan akun dibatalkan.", alreadyLinked: "Nomor ini sudah tertaut dan tersedia.", unavailable: "Nomor ini tidak dapat ditautkan di sini.", inProgress: "Nomor ini sudah memiliki proses penautan.", retry: "Gunakan nomor lain", initializing: "Akun tertaut. Menyinkronkan informasi…", initialized: "Informasi akun siap.", initializationPartial: "Akun tertaut. Beberapa informasi akan terus disinkronkan.",
  },
  hi: {
    countryLabel: "देश या क्षेत्र", phoneLabel: "मोबाइल नंबर", phonePlaceholder: "मोबाइल नंबर दर्ज करें", invalidPhone: "मान्य मोबाइल नंबर दर्ज करें।", submit: "लिंक करना शुरू करें", submitting: "शुरू हो रहा है…", codeTitle: "लिंकिंग कोड", copyCode: "कोड कॉपी करें", copied: "कॉपी किया गया", expires: "समाप्त होने में", openConsumer: "WhatsApp खोलें", openBusiness: "WhatsApp Business खोलें", appFallback: "यदि ऐप नहीं खुला, तो उसे मैन्युअल रूप से खोलें और यह पेज उपलब्ध रखें।", waiting: "फ़ोन पर पुष्टि की प्रतीक्षा…", reconnecting: "कनेक्शन पूरा हो रहा है। पेज खुला रखें…", verified: "अकाउंट सफलतापूर्वक लिंक हो गया।", expired: "यह कोड समाप्त हो गया।", failed: "अकाउंट लिंक पूरा नहीं हो सका।", cancelled: "अकाउंट लिंक रद्द कर दिया गया।", alreadyLinked: "यह नंबर पहले से लिंक और उपलब्ध है।", unavailable: "यह नंबर यहाँ लिंक नहीं किया जा सकता।", inProgress: "इस नंबर के लिए लिंकिंग पहले से जारी है।", retry: "दूसरा नंबर इस्तेमाल करें", initializing: "अकाउंट लिंक हो गया। जानकारी सिंक हो रही है…", initialized: "अकाउंट की जानकारी तैयार है।", initializationPartial: "अकाउंट लिंक हो गया। कुछ जानकारी बैकग्राउंड में सिंक होती रहेगी।",
  },
  ru: {
    countryLabel: "Страна или регион", phoneLabel: "Номер мобильного телефона", phonePlaceholder: "Введите номер телефона", invalidPhone: "Введите действительный номер телефона.", submit: "Начать привязку", submitting: "Запуск…", codeTitle: "Код привязки", copyCode: "Копировать код", copied: "Скопировано", expires: "Истекает через", openConsumer: "Открыть WhatsApp", openBusiness: "Открыть WhatsApp Business", appFallback: "Если приложение не открылось, откройте его вручную и не закрывайте эту страницу.", waiting: "Ожидание подтверждения на телефоне…", reconnecting: "Завершаем защищённое подключение. Не закрывайте страницу…", verified: "Аккаунт успешно привязан.", expired: "Срок действия кода истёк.", failed: "Не удалось завершить привязку аккаунта.", cancelled: "Привязка аккаунта отменена.", alreadyLinked: "Этот номер уже привязан и доступен.", unavailable: "Этот номер нельзя привязать здесь.", inProgress: "Для этого номера уже выполняется привязка.", retry: "Использовать другой номер", initializing: "Аккаунт привязан. Выполняется синхронизация данных…", initialized: "Данные аккаунта готовы.", initializationPartial: "Аккаунт привязан. Часть данных продолжит синхронизироваться в фоне.",
  },
  ur: {
    countryLabel: "ملک یا خطہ", phoneLabel: "موبائل نمبر", phonePlaceholder: "اپنا موبائل نمبر درج کریں", invalidPhone: "درست موبائل نمبر درج کریں۔", submit: "لنک کرنا شروع کریں", submitting: "شروع ہو رہا ہے…", codeTitle: "لنک کرنے کا کوڈ", copyCode: "کوڈ کاپی کریں", copied: "کاپی ہو گیا", expires: "میعاد ختم ہونے میں", openConsumer: "WhatsApp کھولیں", openBusiness: "WhatsApp Business کھولیں", appFallback: "اگر ایپ نہ کھلے تو اسے خود کھولیں اور یہ صفحہ دستیاب رکھیں۔", waiting: "فون پر تصدیق کا انتظار ہے…", reconnecting: "محفوظ کنکشن مکمل ہو رہا ہے۔ صفحہ کھلا رکھیں…", verified: "اکاؤنٹ کامیابی سے لنک ہو گیا۔", expired: "اس کوڈ کی میعاد ختم ہو گئی۔", failed: "اکاؤنٹ لنک نہیں ہو سکا۔", cancelled: "اکاؤنٹ لنک کرنا منسوخ کر دیا گیا۔", alreadyLinked: "یہ نمبر پہلے سے لنک اور دستیاب ہے۔", unavailable: "یہ نمبر یہاں لنک نہیں کیا جا سکتا۔", inProgress: "اس نمبر کے لیے لنک کرنے کی درخواست پہلے سے جاری ہے۔", retry: "دوسرا نمبر استعمال کریں", initializing: "اکاؤنٹ لنک ہو گیا۔ معلومات سنک ہو رہی ہیں…", initialized: "اکاؤنٹ کی معلومات تیار ہیں۔", initializationPartial: "اکاؤنٹ لنک ہو گیا۔ کچھ معلومات پس منظر میں سنک ہوتی رہیں گی۔",
  },
  tr: {
    countryLabel: "Ülke veya bölge", phoneLabel: "Cep telefonu numarası", phonePlaceholder: "Telefon numaranızı girin", invalidPhone: "Geçerli bir telefon numarası girin.", submit: "Bağlamayı başlat", submitting: "Başlatılıyor…", codeTitle: "Bağlama kodu", copyCode: "Kodu kopyala", copied: "Kopyalandı", expires: "Kalan süre", openConsumer: "WhatsApp’ı aç", openBusiness: "WhatsApp Business’ı aç", appFallback: "Uygulama açılmadıysa elle açın ve bu sayfayı açık tutun.", waiting: "Telefonunuzda onay bekleniyor…", reconnecting: "Güvenli bağlantı tamamlanıyor. Sayfayı açık tutun…", verified: "Hesap başarıyla bağlandı.", expired: "Bu kodun süresi doldu.", failed: "Hesap bağlama tamamlanamadı.", cancelled: "Hesap bağlama iptal edildi.", alreadyLinked: "Bu numara zaten bağlı ve kullanılabilir.", unavailable: "Bu numara burada bağlanamaz.", inProgress: "Bu numara için zaten bir bağlama isteği var.", retry: "Başka bir numara kullan", initializing: "Hesap bağlandı. Bilgiler eşitleniyor…", initialized: "Hesap bilgileri hazır.", initializationPartial: "Hesap bağlandı. Bazı bilgiler arka planda eşitlenmeye devam edecek.",
  },
  fa: {
    countryLabel: "کشور یا منطقه", phoneLabel: "شماره تلفن همراه", phonePlaceholder: "شماره تلفن را وارد کنید", invalidPhone: "شماره تلفن معتبری وارد کنید.", submit: "شروع پیوند", submitting: "درحال شروع…", codeTitle: "کد پیوند", copyCode: "کپی کد", copied: "کپی شد", expires: "زمان باقی‌مانده", openConsumer: "باز کردن WhatsApp", openBusiness: "باز کردن WhatsApp Business", appFallback: "اگر برنامه باز نشد، آن را دستی باز کنید و این صفحه را نگه دارید.", waiting: "در انتظار تأیید در تلفن…", reconnecting: "درحال تکمیل اتصال امن. صفحه را باز نگه دارید…", verified: "حساب با موفقیت پیوند داده شد.", expired: "مهلت این کد تمام شد.", failed: "پیوند دادن حساب کامل نشد.", cancelled: "پیوند دادن حساب لغو شد.", alreadyLinked: "این شماره از قبل پیوند داده شده و در دسترس است.", unavailable: "این شماره را نمی‌توان اینجا پیوند داد.", inProgress: "برای این شماره درخواست پیوند درحال انجام است.", retry: "استفاده از شماره‌ای دیگر", initializing: "حساب پیوند داده شد. اطلاعات درحال همگام‌سازی است…", initialized: "اطلاعات حساب آماده است.", initializationPartial: "حساب پیوند داده شد. بخشی از اطلاعات در پس‌زمینه همگام می‌شود.",
  },
  bn: {
    countryLabel: "দেশ বা অঞ্চল", phoneLabel: "মোবাইল নম্বর", phonePlaceholder: "মোবাইল নম্বর লিখুন", invalidPhone: "সঠিক মোবাইল নম্বর লিখুন।", submit: "লিঙ্ক করা শুরু করুন", submitting: "শুরু হচ্ছে…", codeTitle: "লিঙ্ক করার কোড", copyCode: "কোড কপি করুন", copied: "কপি হয়েছে", expires: "মেয়াদ শেষ হবে", openConsumer: "WhatsApp খুলুন", openBusiness: "WhatsApp Business খুলুন", appFallback: "অ্যাপ না খুললে নিজে খুলুন এবং এই পেজটি খোলা রাখুন।", waiting: "ফোনে নিশ্চিতকরণের অপেক্ষা চলছে…", reconnecting: "নিরাপদ সংযোগ সম্পূর্ণ হচ্ছে। পেজটি খোলা রাখুন…", verified: "অ্যাকাউন্ট সফলভাবে লিঙ্ক হয়েছে।", expired: "এই কোডের মেয়াদ শেষ হয়েছে।", failed: "অ্যাকাউন্ট লিঙ্ক করা যায়নি।", cancelled: "অ্যাকাউন্ট লিঙ্ক করা বাতিল হয়েছে।", alreadyLinked: "এই নম্বরটি ইতিমধ্যে লিঙ্ক করা ও উপলভ্য।", unavailable: "এই নম্বরটি এখানে লিঙ্ক করা যাবে না।", inProgress: "এই নম্বরটির জন্য লিঙ্ক করার অনুরোধ চলছে।", retry: "অন্য নম্বর ব্যবহার করুন", initializing: "অ্যাকাউন্ট লিঙ্ক হয়েছে। তথ্য সিঙ্ক হচ্ছে…", initialized: "অ্যাকাউন্টের তথ্য প্রস্তুত।", initializationPartial: "অ্যাকাউন্ট লিঙ্ক হয়েছে। কিছু তথ্য ব্যাকগ্রাউন্ডে সিঙ্ক হতে থাকবে।",
  },
  it: {
    countryLabel: "Paese o area geografica", phoneLabel: "Numero di cellulare", phonePlaceholder: "Inserisci il numero di telefono", invalidPhone: "Inserisci un numero di telefono valido.", submit: "Avvia collegamento", submitting: "Avvio…", codeTitle: "Codice di collegamento", copyCode: "Copia codice", copied: "Copiato", expires: "Scade tra", openConsumer: "Apri WhatsApp", openBusiness: "Apri WhatsApp Business", appFallback: "Se l’app non si apre, aprila manualmente e mantieni disponibile questa pagina.", waiting: "In attesa della conferma sul telefono…", reconnecting: "Completamento della connessione sicura. Mantieni aperta la pagina…", verified: "Account collegato correttamente.", expired: "Il codice è scaduto.", failed: "Impossibile completare il collegamento.", cancelled: "Collegamento annullato.", alreadyLinked: "Questo numero è già collegato e disponibile.", unavailable: "Questo numero non può essere collegato qui.", inProgress: "Per questo numero è già in corso un collegamento.", retry: "Usa un altro numero", initializing: "Account collegato. Sincronizzazione delle informazioni…", initialized: "Le informazioni dell’account sono pronte.", initializationPartial: "Account collegato. Alcune informazioni continueranno a sincronizzarsi in background.",
  },
};

// Captured from the localized runtime resources served by web.whatsapp.com.
// See docs/whatsapp-phone-linking-copy-sources.md for the collection contract.
const WHATSAPP_WEB_GUIDE_COPY: Record<string, WhatsAppWebGuideCopy> = {
  en: { codeTitle: "Enter code on phone", instructionOpenPattern: "Open {=m2} on your phone", whatsappLabel: "WhatsApp", instructionPlatformPattern: "On Android tap {=m1} · On iPhone tap {=m5}", menuLabel: "Menu", settingsLabel: "Settings", instructionLinkedPattern: "Tap {=m1}, then {=m3}", linkedDevicesLabel: "Linked devices", linkDeviceLabel: "Link device", instructionEnterPattern: "Tap {=m1} and enter this code on your phone", phoneLinkLabel: "Link with phone number instead" },
  "zh-CN": { codeTitle: "在手机上输入代码", instructionOpenPattern: "在你的手机上打开{=m2}", whatsappLabel: "WhatsApp", instructionPlatformPattern: "在 Android 手机上，轻触{=m1}，在 iPhone 上，轻触{=m5}", menuLabel: "“菜单”", settingsLabel: "“设置”", instructionLinkedPattern: "依次轻触“{=m1}”和“{=m3}”", linkedDevicesLabel: "已关联的设备", linkDeviceLabel: "关联设备", instructionEnterPattern: "轻触“{=m1}”，然后在你的手机上输入或粘贴此验证码", phoneLinkLabel: "改用电话号码关联" },
  hi: { codeTitle: "फ़ोन पर कोड डालें", instructionOpenPattern: "अपने फ़ोन पर {=m2} खोलें", whatsappLabel: "WhatsApp", instructionPlatformPattern: "Android यूज़र्स {=m1} पर टैप करें . iPhone यूज़र्स {=m5} पर टैप करें", menuLabel: "मेनू", settingsLabel: "सेटिंग्स", instructionLinkedPattern: "{=m1} पर टैप करके {=m3} पर टैप करें", linkedDevicesLabel: "लिंक किए गए डिवाइस", linkDeviceLabel: "डिवाइस लिंक करें", instructionEnterPattern: "{=m1} पर टैप करें और अपने फ़ोन पर यह कोड डालें", phoneLinkLabel: "या फ़ोन नंबर से लिंक करें" },
  id: { codeTitle: "Masukkan kode di telepon", instructionOpenPattern: "Buka {=m2} di telepon", whatsappLabel: "WhatsApp", instructionPlatformPattern: "Di Android ketuk {=m1} · Di iPhone ketuk {=m5}", menuLabel: "Menu", settingsLabel: "Pengaturan", instructionLinkedPattern: "Ketuk {=m1}, lalu {=m3}", linkedDevicesLabel: "Perangkat tertaut", linkDeviceLabel: "Tautkan perangkat", instructionEnterPattern: "Ketuk {=m1}, lalu masukkan kode ini di telepon Anda", phoneLinkLabel: "Tautkan dengan nomor telepon saja" },
  "pt-BR": { codeTitle: "Insira o código no seu celular", instructionOpenPattern: "Abra o {=m2} no seu celular.", whatsappLabel: "WhatsApp", instructionPlatformPattern: "Toque em {=m1} no Android ou em {=m5} no iPhone.", menuLabel: "Mais opções", settingsLabel: "Configurações", instructionLinkedPattern: "Toque em {=m1} e, em seguida, em {=m3}.", linkedDevicesLabel: "Dispositivos conectados", linkDeviceLabel: "Conectar dispositivo", instructionEnterPattern: "Toque em {=m1} e insira o código exibido no seu celular.", phoneLinkLabel: "Conectar com número de telefone" },
  es: { codeTitle: "Ingresa el código en el teléfono", instructionOpenPattern: "Abre {=m2} en tu teléfono.", whatsappLabel: "WhatsApp", instructionPlatformPattern: "En Android, toca {=m1}. En iPhone, toca {=m5}.", menuLabel: "Menú", settingsLabel: "Ajustes", instructionLinkedPattern: "Toca {=m1} y, luego, {=m3}.", linkedDevicesLabel: "Dispositivos vinculados", linkDeviceLabel: "Vincular dispositivo", instructionEnterPattern: "Toca {=m1} e ingresa este código en tu teléfono.", phoneLinkLabel: "Vincular con el número de teléfono" },
  ru: { codeTitle: "Введите код на телефоне", instructionOpenPattern: "Откройте {=m2} на своем телефоне", whatsappLabel: "WhatsApp", instructionPlatformPattern: "На Android нажмите {=m1} · На iPhone нажмите {=m5}", menuLabel: "Меню", settingsLabel: "Настройки", instructionLinkedPattern: "Нажмите {=m1}, затем {=m3}", linkedDevicesLabel: "Связанные устройства", linkDeviceLabel: "Связывание устройства", instructionEnterPattern: "Нажмите \"{=m1}\" и введите этот код на своем телефоне", phoneLinkLabel: "Связать по номеру телефона" },
  ur: { codeTitle: "فون پر کوڈ درج کریں", instructionOpenPattern: "اپنے فون پر {=m2} کھولیں", whatsappLabel: "‏‏WhatsApp", instructionPlatformPattern: "‏‏Android پر {=m1} پر ٹیپ کریں ۔ iPhone پر {=m5} پر ٹیپ کریں", menuLabel: "مینیو", settingsLabel: "سیٹنگز", instructionLinkedPattern: "‏‏{=m1}، پھر {=m3} پر ٹیپ کریں", linkedDevicesLabel: "لنک کردہ ڈیوائسز", linkDeviceLabel: "آلہ لنک کریں", instructionEnterPattern: "‏‏{=m1} پر ٹیپ کریں اور اس کوڈ کو اپنے فون پر درج کریں", phoneLinkLabel: "اس کی بجائے فون نمبر کے ذریعے لنک کریں" },
  de: { codeTitle: "Code auf dem Telefon eingeben", instructionOpenPattern: "Öffne {=m2} auf deinem Telefon.", whatsappLabel: "WhatsApp", instructionPlatformPattern: "Tippe auf einem Android-Gerät auf {=m1} · Tippe auf einem iPhone auf {=m5}", menuLabel: "Menü", settingsLabel: "Einstellungen", instructionLinkedPattern: "Tippe auf {=m1} und dann auf {=m3}.", linkedDevicesLabel: "Verknüpfte Geräte", linkDeviceLabel: "Gerät hinzufügen", instructionEnterPattern: "Tippe auf {=m1} und gib diesen Code auf deinem Telefon ein.", phoneLinkLabel: "Gerät stattdessen via Telefonnummer verknüpfen" },
  tr: { codeTitle: "Kodu telefonunuza girin", instructionOpenPattern: "Telefonunuzda {=m2}'ı açın", whatsappLabel: "WhatsApp", instructionPlatformPattern: "Android'de {=m1}, iPhone'da {=m5}'a dokunun", menuLabel: "Menü", settingsLabel: "Ayarlar", instructionLinkedPattern: "{=m1}'a, ardından {=m3}'ya dokunun", linkedDevicesLabel: "Bağlı cihazlar", linkDeviceLabel: "Cihaz bağla", instructionEnterPattern: "{=m1} seçeneğine dokunun ve bu kodu telefonunuza girin", phoneLinkLabel: "Telefon numarası kullanarak bağlayın" },
  ar: { codeTitle: "أدخل الكود على الهاتف", instructionOpenPattern: "افتح {=m2} على هاتفك", whatsappLabel: "واتساب", instructionPlatformPattern: "على جهاز Android، اضغط على {=m1} · على جهاز iPhone، اضغط على {=m5}", menuLabel: "القائمة", settingsLabel: "الإعدادات", instructionLinkedPattern: "اضغط على {=m1}، ثم على {=m3}", linkedDevicesLabel: "الأجهزة المرتبطة", linkDeviceLabel: "ربط جهاز", instructionEnterPattern: "اضغط على {=m1} وأدخل هذا الكود على هاتفك", phoneLinkLabel: "الربط برقم الهاتف بدلاً من ذلك" },
  fa: { codeTitle: "کد را در تلفن وارد کنید", instructionOpenPattern: "‏{=m2} را در تلفنتان باز کنید", whatsappLabel: "واتساپ", instructionPlatformPattern: "در Android روی {=m1} ضربه بزنید. در iPhone، روی {=m5} ضربه بزنید", menuLabel: "منو", settingsLabel: "تنظیمات", instructionLinkedPattern: "روی {=m1} و سپس روی {=m3} ضربه بزنید", linkedDevicesLabel: "دستگاه‌های پیوندشده", linkDeviceLabel: "پیوند دادن دستگاه", instructionEnterPattern: "روی {=m1} ضربه بزنید و این کد را در تلفنتان وارد کنید", phoneLinkLabel: "در عوض ازطریق شماره تلفن پیوند داده شود" },
  bn: { codeTitle: "ফোনে কোডটি লিখুন", instructionOpenPattern: "আপনার ফোনে {=m2} খুলুন", whatsappLabel: "WhatsApp", instructionPlatformPattern: "Android-এ {=m1}-তে ট্যাপ করুন · iPhone-এ {=m5}-এ ট্যাপ করুন", menuLabel: "মেনু", settingsLabel: "সেটিংস", instructionLinkedPattern: "{=m1}-এ ট্যাপ করে {=m3}-এ ট্যাপ করুন", linkedDevicesLabel: "লিঙ্ক করা ডিভাইস", linkDeviceLabel: "ডিভাইস লিঙ্ক করুন", instructionEnterPattern: "{=m1}-এ ট্যাপ করুন এবং আপনার ফোনে এই কোডটি লিখুন", phoneLinkLabel: "পরিবর্তে ফোন নম্বর দিয়ে লিঙ্ক করুন" },
  it: { codeTitle: "Inserisci il codice sul telefono", instructionOpenPattern: "Apri {=m2} sul telefono.", whatsappLabel: "WhatsApp", instructionPlatformPattern: "Su Android tocca {=m1} · Su iPhone tocca {=m5}", menuLabel: "Menu", settingsLabel: "Impostazioni", instructionLinkedPattern: "Tocca {=m1}, quindi {=m3}", linkedDevicesLabel: "Dispositivi collegati", linkDeviceLabel: "Collega dispositivo", instructionEnterPattern: "Tocca {=m1} e inserisci questo codice sul telefono.", phoneLinkLabel: "In alternativa, collega con il numero di telefono" },
  fr: { codeTitle: "Saisissez le code sur le téléphone", instructionOpenPattern: "Ouvrez {=m2} sur votre téléphone", whatsappLabel: "WhatsApp", instructionPlatformPattern: "Sur Android, appuyez sur {=m1} · Sur iPhone, appuyez sur {=m5}", menuLabel: "Menu", settingsLabel: "Paramètres", instructionLinkedPattern: "Appuyez sur {=m1}, puis sur {=m3}", linkedDevicesLabel: "Appareils connectés", linkDeviceLabel: "Connecter un appareil", instructionEnterPattern: "Appuyez sur {=m1} et saisissez ce code sur votre téléphone", phoneLinkLabel: "Connecter plutôt avec un numéro de téléphone" },
};

const runtimeConfig = (): RuntimeConfig => {
  const node = document.getElementById("promotion-runtime-config");
  if (!node) return {};
  try { return JSON.parse(node.textContent || "{}"); } catch { return {}; }
};

const resolvedLocale = () => {
  const config = runtimeConfig();
  if (config.resolvedLocale) return config.resolvedLocale;
  const supported = config.supportedLocales || [];
  const fallback = config.defaultLocale || "en";
  if (supported.length) return browserPreferredLocale(supported, fallback);
  return fallback || navigator.languages?.[0] || navigator.language || "en";
};

const functionalCopy = (): ResolvedCopy => {
  const locale = resolvedLocale();
  const base = locale.toLowerCase().split("-")[0];
  const exact = Object.keys(COPY).find((key) => key.toLowerCase() === locale.toLowerCase());
  const selected = (exact ? COPY[exact] : undefined) || COPY[base] || COPY.en;
  const guide = (exact ? WHATSAPP_WEB_GUIDE_COPY[exact] : undefined) || WHATSAPP_WEB_GUIDE_COPY[base] || WHATSAPP_WEB_GUIDE_COPY.en;
  const overrides = runtimeConfig().localizedCopy || {};
  const copy: ResolvedCopy = { ...COPY.en, ...selected, ...WHATSAPP_WEB_GUIDE_COPY.en, ...guide };
  for (const key of Object.keys(copy) as Array<keyof ResolvedCopy>) {
    const value = overrides[`accountLink.${key}`];
    if (typeof value === "string" && value.trim()) copy[key] = value;
  }
  return copy;
};

const browserCountry = (): CountryCode | undefined => {
  for (const language of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    try {
      const locale = new Intl.Locale(language);
      const region = locale.region || locale.maximize().region;
      if (region && getCountries().includes(region as CountryCode)) return region as CountryCode;
    } catch { /* unsupported or malformed browser locale */ }
  }
  return undefined;
};

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  "zh-CN": "简体中文",
  hi: "हिन्दी",
  id: "Bahasa Indonesia",
  "pt-BR": "Português (Brasil)",
  es: "Español",
  ru: "Русский",
  ur: "اردو",
  de: "Deutsch",
  tr: "Türkçe",
  ar: "العربية",
  fa: "فارسی",
  bn: "বাংলা",
  it: "Italiano",
  fr: "Français",
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "Language", "zh-CN": "语言", hi: "भाषा", id: "Bahasa", "pt-BR": "Idioma",
  es: "Idioma", ru: "Язык", ur: "زبان", de: "Sprache", tr: "Dil", ar: "اللغة",
  fa: "زبان", bn: "ভাষা", it: "Lingua", fr: "Langue",
};

const matchingLocaleKey = (locale: string, values: string[]) =>
  values.find((value) => value.toLowerCase() === locale.toLowerCase());

const pickSupportedLocale = (locale: string, supported: string[]) => {
  const exact = matchingLocaleKey(locale, supported);
  if (exact) return exact;
  const base = locale.toLowerCase().split("-")[0];
  return supported.find((value) => value.toLowerCase().split("-")[0] === base);
};

const browserPreferredLocale = (supported: string[], fallback: string) => {
  if (!supported.length) return fallback;
  const candidates = navigator.languages?.length ? [...navigator.languages] : [navigator.language || fallback];
  for (const language of candidates) {
    if (!language) continue;
    const match = pickSupportedLocale(language, supported);
    if (match) return match;
  }
  return fallback;
};

const PREFERRED_COUNTRIES: CountryCode[] = ["US", "GB", "CA", "AU", "IN", "BR", "DE", "FR", "ES", "JP", "KR", "CN"];

const countryFlag = (country: CountryCode) =>
  country.toUpperCase().replace(/./g, (character) => String.fromCodePoint(127397 + character.charCodeAt(0)));

const normalizeNationalNumber = (value: string) => value.trim().replace(/[\s\-().]/g, "");

function parseValidPhoneNumber(country: CountryCode, rawInput: string) {
  const raw = rawInput.trim();
  const national = normalizeNationalNumber(raw);
  if (!national) return null;

  const dialCode = getCountryCallingCode(country);

  const tryCandidate = (candidate: string) => {
    if (!isValidPhoneNumber(candidate, country)) return null;
    const parsed = parsePhoneNumberStrict(candidate, country);
    if (!parsed?.isValid()) return null;
    return {
      e164: parsed.number,
      country: parsed.country || country,
      national: parsed.nationalNumber?.toString() || candidate.replace(/\D/g, ""),
    };
  };

  const direct = tryCandidate(national.replace(/\D/g, ""));
  if (direct) return direct;

  for (const candidate of [raw, national, national.replace(/\D/g, ""), national.replace(/^0+/, "")]) {
    const result = tryCandidate(candidate);
    if (result) return result;
  }

  const digits = national.replace(/\D/g, "").replace(/^0+/, "");
  const intl = `+${dialCode}${digits}`;
  if (!isValidPhoneNumber(intl)) return null;
  const parsedIntl = parsePhoneNumberStrict(intl);
  if (!parsedIntl?.isValid()) return null;
  return {
    e164: parsedIntl.number,
    country: parsedIntl.country || country,
    national: parsedIntl.nationalNumber?.toString() || digits,
  };
}

const sharedStyle = `
  :host{box-sizing:border-box;color:inherit;font:inherit}:host([hidden]){display:none!important}*,*::before,*::after{box-sizing:border-box}
  button,input,select{font:inherit;color:inherit}button{cursor:pointer;-webkit-tap-highlight-color:transparent}button:focus{outline:none}button:focus-visible{outline:2px solid var(--account-link-focus,#2563eb);outline-offset:2px}button:disabled{cursor:not-allowed;opacity:.65}
  [hidden]{display:none!important}.sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
`;

class AccountLinkLocaleSwitcher extends HTMLElement {
  private root = this.attachShadow({ mode: "open" });
  private select?: HTMLSelectElement;
  private flow?: HTMLElement;
  private lock = () => { if (this.select) this.select.disabled = true; };
  private unlock = () => { if (this.select) this.select.disabled = false; };

  connectedCallback() {
    const config = runtimeConfig();
    const locales = Array.from(new Set(config.supportedLocales || [config.defaultLocale || "en"]));
    if (locales.length < 2) { this.hidden = true; return; }
    const resolved = matchingLocaleKey(resolvedLocale(), locales) || locales[0];
    const labelKey = matchingLocaleKey(resolved, Object.keys(LANGUAGE_LABELS)) || resolved.split("-")[0];
    const label = LANGUAGE_LABELS[labelKey] || LANGUAGE_LABELS.en;
    this.root.innerHTML = `<style>${sharedStyle}
      :host{display:block}.locale{display:flex;justify-content:flex-end;align-items:center;gap:.5rem}.icon{font-size:1rem;line-height:1}.label{font-size:.875rem;font-weight:600}.select{min-height:2.5rem;max-width:100%;border:1px solid var(--account-link-field-border,#cbd5e1);border-radius:var(--account-link-locale-radius,.65rem);background:var(--account-link-field-bg,transparent);padding:.45rem 2rem .45rem .65rem}
    </style><label class="locale" part="container"><span class="icon" aria-hidden="true">🌐</span><span class="label" part="label">${label}</span><select class="select" part="select" aria-label="${label}">${locales.map((locale) => `<option value="${locale}">${LOCALE_NAMES[locale] || locale}</option>`).join("")}</select></label>`;
    this.select = this.root.querySelector("select")!;
    this.select.value = resolved;
    this.select.addEventListener("change", () => {
      if (!this.select?.value) return;
      if (config.previewMode && window.parent !== window) {
        window.parent.postMessage(
          {
            type: "promotion-preview:locale-change",
            locale: this.select.value,
          },
          "*",
        );
        return;
      }
      const url = new URL(window.location.href);
      url.searchParams.set("lang", this.select.value);
      window.location.assign(url.toString());
    });
    this.flow = this.closest("account-link-flow") || undefined;
    this.flow?.addEventListener("account-link-pairing-started", this.lock);
    this.flow?.addEventListener("account-link-reset", this.unlock);
  }

  disconnectedCallback() {
    this.flow?.removeEventListener("account-link-pairing-started", this.lock);
    this.flow?.removeEventListener("account-link-reset", this.unlock);
  }
}

class PhoneNumberField extends HTMLElement {
  private root = this.attachShadow({ mode: "open" });
  private country?: CountryCode;
  private select?: HTMLSelectElement;
  private input!: HTMLInputElement;
  private prefixNode?: HTMLElement;
  private error!: HTMLElement;
  private options: Array<{ country: CountryCode; name: string; englishName: string; calling: string }> = [];
  private trigger?: HTMLButtonElement;
  private flagNode?: HTMLElement;
  private panel?: HTMLElement;
  private searchInput?: HTMLInputElement;
  private listNode?: HTMLElement;
  private listOpen = false;
  private spriteFallback = false;
  private outsideListener?: (event: Event) => void;
  private repositionListener?: () => void;
  private resizeListener?: () => void;

  connectedCallback() {
    const copy = functionalCopy();
    const locale = resolvedLocale();
    const allowed = (this.getAttribute("allowed-countries") || "").split(",").map((item) => item.trim().toUpperCase()).filter(Boolean) as CountryCode[];
    const countries = (allowed.length ? allowed : getCountries()).filter((item) => getCountries().includes(item));
    this.country = browserCountry();
    if (!this.country || !countries.includes(this.country)) this.country = undefined;
    const names = new Intl.DisplayNames([locale], { type: "region" });
    const englishNames = new Intl.DisplayNames(["en"], { type: "region" });
    this.options = countries.map((country) => ({
      country,
      name: names.of(country) || country,
      englishName: englishNames.of(country) || country,
      calling: getCountryCallingCode(country),
    })).sort((a, b) => a.name.localeCompare(b.name, locale));

    if (this.getAttribute("country-picker") === "search") {
      this.renderSearchPicker(copy);
      void this.appendFlagPositions();
      return;
    }
    this.renderClassicPicker(copy);
  }

  disconnectedCallback() {
    if (this.outsideListener) document.removeEventListener("pointerdown", this.outsideListener, true);
    this.unbindReposition();
    this.unbindResize();
  }

  private renderClassicPicker(copy: ResolvedCopy) {
    this.root.innerHTML = `<style>${sharedStyle}
      :host{display:block}.field{display:grid;gap:.45rem}.label{font-weight:600}.phone{display:grid;grid-template-columns:minmax(8.5rem,42%) 1fr;border:1px solid var(--account-link-field-border,#cbd5e1);border-radius:var(--account-link-field-radius,.75rem);background:var(--account-link-field-bg,transparent);overflow:hidden;min-height:3rem}.country{display:grid;grid-template-columns:1fr auto;align-items:center;border-inline-end:1px solid var(--account-link-field-border,#cbd5e1);padding-inline:.75rem}.country select{min-width:0;width:100%;border:0;background:transparent;outline:0}.prefix{font-variant-numeric:tabular-nums;opacity:.7}.phone input{width:100%;border:0;background:transparent;padding:.75rem;outline:0}.phone:focus-within{outline:2px solid var(--account-link-focus,#2563eb);outline-offset:2px}.error{min-height:1.25em;color:var(--account-link-error,#b91c1c);font-size:.875rem}
    </style><div class="field" part="field"><label class="label" part="label" for="phone-input">${copy.phoneLabel}</label><div class="phone" part="phone-shell"><label class="country" part="country-shell"><span class="sr">${copy.countryLabel}</span><select part="country-select" aria-label="${copy.countryLabel}"><option value="">${copy.countryLabel}</option>${this.options.map((item) => `<option value="${item.country}">${item.name} · ${item.calling}</option>`).join("")}</select><span class="prefix" part="country-prefix"></span></label><input part="phone-input" id="phone-input" type="tel" inputmode="tel" autocomplete="tel" placeholder="${copy.phonePlaceholder}" aria-describedby="phone-error"></div><p class="error" part="error" id="phone-error" role="alert"></p></div>`;
    this.select = this.root.querySelector("select")!;
    this.input = this.root.querySelector("input")!;
    this.prefixNode = this.root.querySelector(".prefix")!;
    this.error = this.root.querySelector(".error")!;
    this.select.value = this.country || "";
    this.updatePrefix();
    this.select.addEventListener("change", () => {
      this.country = this.select?.value ? this.select.value as CountryCode : undefined;
      this.updatePrefix();
      this.setError("");
      this.input.focus();
    });
    this.input.addEventListener("input", () => this.formatInput());
  }

  private renderSearchPicker(copy: ResolvedCopy) {
    if (!this.country) this.country = this.resolveDefaultCountry();
    const searchLabel = copy.countrySearch || copy.countryLabel;
    const sprite = this.useSpriteFlags();
    const flagCss = sprite ? buildInlineFlagBaseCss(this.getAttribute("flag-sheet") || "assets/phone-flags/sprite-positions.css") : "";
    const flagMarkup = sprite
      ? `<span class="iti__flag-box"><span class="iti__flag part-flag" part="country-flag" aria-hidden="true"></span></span>`
      : `<span class="flag" part="country-flag" aria-hidden="true"></span>`;
    this.root.innerHTML = `<style>${sharedStyle}${flagCss}
      :host{display:block;position:relative;overflow:visible;z-index:0}:host(.picker-open){z-index:10000}:host(.has-error){animation:shake .4s ease-in-out}@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}50%{transform:translateX(8px)}75%{transform:translateX(-4px)}}.field{display:grid;gap:.75rem;overflow:visible}.label{font-weight:700;text-align:center;line-height:1.35;margin-bottom:.75rem}.phone{position:relative;display:block;border:2px solid rgba(191,149,247,.3);border-radius:8px;background:rgba(0,0,0,.22);min-height:3.125rem;overflow:visible}.phone:has(.phone-input:focus){border-color:rgba(191,149,247,.65);box-shadow:0 0 0 3px rgba(191,149,247,.14)}.country-trigger{position:absolute;inset-block:0;inset-inline-start:0;z-index:3;display:flex;align-items:center;gap:.35rem;min-width:96px;padding:0 12px 0 12px;border:0;border-inline-end:1px solid rgba(255,255,255,.14);border-radius:8px 0 0 8px;background:rgba(255,255,255,.06);color:inherit;touch-action:manipulation;cursor:pointer;-webkit-tap-highlight-color:transparent;outline:none}.country-trigger:focus{outline:none}.country-trigger[aria-expanded="true"] .arrow{transform:rotate(180deg)}.flag{font-size:1rem;line-height:1}.dial{font-size:1rem;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap;color:#fff;margin-inline-start:2px}.arrow{width:0;height:0;margin-inline-start:6px;border-top:4px solid #9ca3af;border-inline:4px solid transparent;transition:transform .2s ease;flex-shrink:0}.phone-input{width:100%;min-height:3.125rem;border:0;border-radius:8px;background:transparent;color:#fff;padding-block:.75rem;padding-inline-start:6.5625rem;padding-inline-end:.75rem;outline:0;font-size:1rem;line-height:1.2;-webkit-appearance:none;appearance:none}.phone-input::placeholder{color:rgba(255,255,255,.42);opacity:1}.country-panel{position:fixed;z-index:10001;display:grid;grid-template-rows:auto minmax(0,1fr);max-height:min(60vh,22.5rem);overflow:hidden;border:1px solid rgba(191,149,247,.45);border-radius:14px;background:linear-gradient(180deg,#171322 0%,#111018 100%);box-shadow:0 18px 48px rgba(0,0,0,.55),0 0 0 1px rgba(191,149,247,.08),0 0 32px rgba(118,52,234,.18);box-sizing:border-box}.search-wrap{padding:14px 14px 12px;border-bottom:1px solid rgba(191,149,247,.14);background:linear-gradient(180deg,rgba(23,19,34,.98) 0%,rgba(17,16,24,.96) 100%)}.search{width:100%;min-height:2.875rem;border:1px solid rgba(191,149,247,.28);border-radius:12px;background:rgba(255,255,255,.05);color:#fff;padding:0 1rem;outline:0;font-size:.9375rem;line-height:1.2;-webkit-appearance:none;appearance:none;box-sizing:border-box}.search::placeholder{color:rgba(255,255,255,.42);opacity:1}.search:focus{border-color:rgba(191,149,247,.75);box-shadow:0 0 0 3px rgba(191,149,247,.14);background:rgba(255,255,255,.07)}.list{margin:0;padding:0;list-style:none;overflow:auto;min-height:0;max-height:none;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:rgba(191,149,247,.55) rgba(255,255,255,.04)}.list::-webkit-scrollbar{width:8px}.list::-webkit-scrollbar-track{background:rgba(255,255,255,.04);border-radius:999px}.list::-webkit-scrollbar-thumb{background:rgba(191,149,247,.45);border-radius:999px}.item{display:flex;align-items:center;gap:.75rem;width:100%;min-height:3.25rem;padding:.8125rem 1rem;border:0;border-bottom:1px solid rgba(255,255,255,.05);background:transparent;color:rgba(255,255,255,.96);text-align:start;touch-action:manipulation;cursor:pointer;box-sizing:border-box}.item:last-child{border-bottom:0}.item.preferred{background:rgba(118,52,234,.08)}.item:hover,.item:focus,.item:focus-visible,.item[aria-selected="true"]{background:linear-gradient(90deg,rgba(118,52,234,.22),rgba(191,149,247,.12));outline:none}.item-name,.iti__country-name{flex:1 1 auto;min-width:0;font-size:.9375rem;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:start}.item-code,.iti__dial-code{flex:0 0 auto;margin-inline-start:auto;padding:.25rem .5rem;border-radius:999px;background:rgba(191,149,247,.1);color:#d7b6ff;font-size:.875rem;font-weight:600;letter-spacing:.02em}.divider{height:1px;margin:.25rem 0;background:rgba(191,149,247,.18)}.error{min-height:0;color:var(--account-link-error,#ff4d4d);font-size:.875rem;font-weight:700;text-align:center}.error:empty{display:none}:host(.mobile-open)::before{content:"";position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.45);backdrop-filter:blur(2px)}
    </style><div class="field" part="field"><label class="label" part="label" for="phone-input">${copy.phoneLabel}</label><div class="phone" part="phone-shell"><button type="button" class="country-trigger" part="country-trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="${copy.countryLabel}">${flagMarkup}<span class="dial" part="country-prefix"></span><span class="arrow" part="country-arrow" aria-hidden="true"></span></button><input class="phone-input" part="phone-input" id="phone-input" type="tel" inputmode="tel" autocomplete="tel" placeholder="${copy.phonePlaceholder}" aria-describedby="phone-error"></div><div class="country-panel" part="country-panel" hidden><div class="search-wrap" part="country-search-shell"><input class="search" part="country-search" type="search" inputmode="search" autocomplete="off" spellcheck="false" placeholder="${searchLabel}" aria-label="${searchLabel}"></div><ul class="list" part="country-list" role="listbox" aria-label="${copy.countryLabel}"></ul></div><p class="error" part="error" id="phone-error" role="alert"></p></div>`;
    this.trigger = this.root.querySelector(".country-trigger")!;
    this.flagNode = this.root.querySelector(sprite ? ".part-flag" : ".flag")!;
    this.prefixNode = this.root.querySelector(".dial")!;
    this.input = this.root.querySelector(".phone-input")!;
    this.panel = this.root.querySelector(".country-panel")!;
    this.searchInput = this.root.querySelector(".search")!;
    this.listNode = this.root.querySelector(".list")!;
    this.error = this.root.querySelector(".error")!;
    this.renderCountryList();
    this.syncCountryDisplay();
    this.syncPhoneInputPadding();
    this.bindResize();
    this.trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.toggleCountryPanel();
    });
    this.trigger.addEventListener("pointerdown", (event) => event.stopPropagation());
    this.panel.addEventListener("pointerdown", (event) => event.stopPropagation());
    this.searchInput.addEventListener("input", () => this.filterCountryList());
    this.searchInput.addEventListener("keydown", (event) => event.stopPropagation());
    this.input.addEventListener("input", () => this.formatInput());
    this.outsideListener = (event) => {
      if (!this.listOpen) return;
      const path = event.composedPath();
      if (!path.includes(this)) this.closeCountryPanel();
    };
    document.addEventListener("pointerdown", this.outsideListener, true);
  }

  private resolveDefaultCountry(): CountryCode | undefined {
    const locale = (navigator.languages?.[0] || navigator.language || "en").toLowerCase();
    const map: Record<string, CountryCode> = {
      zh: "CN", ja: "JP", ko: "KR", de: "DE", fr: "FR", es: "ES", pt: "BR", hi: "IN",
    };
    const prefix = locale.split("-")[0];
    const preferred = (map[prefix] && this.options.some((item) => item.country === map[prefix]) ? map[prefix] : undefined)
      || PREFERRED_COUNTRIES.find((item) => this.options.some((option) => option.country === item));
    return preferred;
  }

  private formatCountryLabel(item: { country: CountryCode; name: string; englishName: string }) {
    if (item.name && item.englishName && item.name !== item.englishName) return `${item.englishName} (${item.name})`;
    return item.englishName || item.name;
  }

  private useSpriteFlags() {
    return this.getAttribute("flag-style") === "sprite" && !this.spriteFallback;
  }

  private fallbackSpriteFlags() {
    this.spriteFallback = true;
    this.syncCountryDisplay();
    this.renderCountryList(this.searchInput?.value || "");
  }

  private appendFlagPositions() {
    if (!this.useSpriteFlags() || this.root.querySelector('style[data-flag-positions="true"]')) return;
    const href = this.getAttribute("flag-sheet") || "assets/phone-flags/sprite-positions.css";
    const sheet = flagAssetUrls(href).sheet;
    const embedded = readEmbeddedFlagSpriteCss(sheet);
    if (embedded) {
      const style = document.createElement("style");
      style.dataset.flagPositions = "true";
      style.textContent = embedded;
      this.root.appendChild(style);
      this.syncCountryDisplay();
      this.renderCountryList(this.searchInput?.value || "");
      return;
    }
    void loadFlagSpriteCss(sheet).then((css) => {
      if (!this.useSpriteFlags() || this.root.querySelector('style[data-flag-positions="true"]')) return;
      const style = document.createElement("style");
      style.dataset.flagPositions = "true";
      style.textContent = css;
      this.root.appendChild(style);
      this.syncCountryDisplay();
      this.renderCountryList(this.searchInput?.value || "");
    }).catch(() => this.fallbackSpriteFlags());
  }

  private syncPhoneInputPadding() {
    if (!this.trigger || !this.input) return;
    const width = Math.ceil(this.trigger.getBoundingClientRect().width);
    if (width > 0) this.input.style.paddingInlineStart = `${width + 8}px`;
  }

  private bindResize() {
    if (this.resizeListener) return;
    this.resizeListener = () => {
      window.requestAnimationFrame(() => {
        this.syncPhoneInputPadding();
        if (this.listOpen) this.positionCountryPanel();
      });
    };
    window.addEventListener("resize", this.resizeListener);
  }

  private unbindResize() {
    if (!this.resizeListener) return;
    window.removeEventListener("resize", this.resizeListener);
    this.resizeListener = undefined;
  }

  private positionCountryPanel() {
    if (!this.panel || !this.trigger) return;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const edge = 16;
    const mobile = window.matchMedia("(max-width: 767px)").matches;

    if (mobile) {
      const width = Math.min(viewportWidth - edge * 2, 420);
      const maxHeight = Math.min(viewportHeight - edge * 2, Math.round(viewportHeight * 0.72));
      const top = Math.max(edge, Math.round((viewportHeight - maxHeight) / 2));
      this.panel.style.position = "fixed";
      this.panel.style.left = `${Math.round((viewportWidth - width) / 2)}px`;
      this.panel.style.top = `${top}px`;
      this.panel.style.width = `${width}px`;
      this.panel.style.maxHeight = `${maxHeight}px`;
      this.panel.style.bottom = "";
      this.panel.style.right = "";
      this.panel.style.transform = "";
      return;
    }

    const hostRect = this.getBoundingClientRect();
    const triggerRect = this.trigger.getBoundingClientRect();
    const width = Math.max(hostRect.width, triggerRect.width);
    const maxHeight = Math.min(viewportHeight * 0.6, 360);
    const spaceBelow = viewportHeight - triggerRect.bottom - 12;
    const spaceAbove = triggerRect.top - 12;
    let top = triggerRect.bottom + 6;
    if (spaceBelow < 180 && spaceAbove > spaceBelow) {
      top = Math.max(12, triggerRect.top - Math.min(maxHeight, spaceAbove) - 6);
    }
    this.panel.style.position = "fixed";
    this.panel.style.top = `${top}px`;
    this.panel.style.left = `${Math.max(edge, Math.min(triggerRect.left, viewportWidth - width - edge))}px`;
    this.panel.style.width = `${Math.min(width, viewportWidth - edge * 2)}px`;
    this.panel.style.maxHeight = `${maxHeight}px`;
    this.panel.style.bottom = "";
    this.panel.style.right = "";
    this.panel.style.transform = "";
  }

  private bindReposition() {
    if (this.repositionListener) return;
    this.repositionListener = () => {
      if (this.listOpen) this.positionCountryPanel();
    };
    window.addEventListener("resize", this.repositionListener);
    window.addEventListener("scroll", this.repositionListener, true);
  }

  private unbindReposition() {
    if (!this.repositionListener) return;
    window.removeEventListener("resize", this.repositionListener);
    window.removeEventListener("scroll", this.repositionListener, true);
    this.repositionListener = undefined;
  }

  private setFlagNode(country: CountryCode) {
    if (!this.flagNode) return;
    if (this.useSpriteFlags()) {
      this.flagNode.className = `iti__flag iti__${country.toLowerCase()} part-flag`;
      this.flagNode.textContent = "";
      return;
    }
    this.flagNode.className = "flag";
    this.flagNode.textContent = countryFlag(country);
  }

  private renderCountryList(filter = "") {
    if (!this.listNode) return;
    const query = filter.toLowerCase().replace("+", "").trim();
    const preferred = PREFERRED_COUNTRIES.map((country) => this.options.find((item) => item.country === country)).filter(Boolean) as typeof this.options;
    const preferredSet = new Set(preferred.map((item) => item.country));
    const standard = this.options.filter((item) => !preferredSet.has(item.country));
    const match = (item: typeof this.options[number]) => {
      if (!query) return true;
      const label = this.formatCountryLabel(item).toLowerCase();
      return label.includes(query) || item.calling.includes(query) || item.country.toLowerCase().includes(query);
    };
    const preferredMatches = preferred.filter(match);
    const standardMatches = standard.filter(match);
    const rows = [
      ...preferredMatches.map((item) => ({ item, preferred: true })),
      ...(preferredMatches.length && standardMatches.length ? [{ divider: true as const }] : []),
      ...standardMatches.map((item) => ({ item, preferred: false })),
    ];
    this.listNode.innerHTML = rows.map((row) => {
      if ("divider" in row) return `<li class="divider" part="country-divider" aria-hidden="true"></li>`;
      const label = this.formatCountryLabel(row.item);
      const iso = row.item.country.toLowerCase();
      const flag = this.useSpriteFlags()
        ? `<span class="iti__flag-box"><span class="iti__flag iti__${iso}" aria-hidden="true"></span></span>`
        : `<span class="flag" aria-hidden="true">${countryFlag(row.item.country)}</span>`;
      return `<li><button type="button" class="item${row.preferred ? " preferred" : ""}" part="country-option" data-country="${row.item.country}" role="option" aria-selected="${this.country === row.item.country ? "true" : "false"}">${flag}<span class="item-name iti__country-name">${label}</span><span class="item-code iti__dial-code">+${row.item.calling}</span></button></li>`;
    }).join("");
    this.listNode.querySelectorAll<HTMLButtonElement>("[data-country]").forEach((button) => {
      button.addEventListener("click", () => {
        this.country = button.dataset.country as CountryCode;
        this.syncCountryDisplay();
        this.closeCountryPanel();
        this.setError("");
        this.input.focus();
      });
    });
  }

  private filterCountryList() {
    this.renderCountryList(this.searchInput?.value || "");
  }

  private syncCountryDisplay() {
    if (!this.country || !this.prefixNode || !this.flagNode) return;
    const selected = this.options.find((item) => item.country === this.country);
    if (!selected) return;
    this.prefixNode.textContent = `+${selected.calling}`;
    this.setFlagNode(selected.country);
    this.syncPhoneInputPadding();
  }

  private toggleCountryPanel() {
    if (this.listOpen) this.closeCountryPanel();
    else this.openCountryPanel();
  }

  private openCountryPanel() {
    if (!this.panel || !this.trigger || !this.searchInput) return;
    this.listOpen = true;
    this.panel.hidden = false;
    this.trigger.setAttribute("aria-expanded", "true");
    this.classList.add("picker-open");
    this.classList.toggle("mobile-open", window.matchMedia("(max-width: 767px)").matches);
    this.positionCountryPanel();
    this.bindReposition();
    this.renderCountryList(this.searchInput.value);
    window.setTimeout(() => this.searchInput?.focus({ preventScroll: true }), 80);
  }

  private closeCountryPanel() {
    if (!this.panel || !this.trigger || !this.searchInput) return;
    this.listOpen = false;
    this.panel.hidden = true;
    this.trigger.setAttribute("aria-expanded", "false");
    this.classList.remove("mobile-open", "picker-open");
    this.unbindReposition();
    this.panel.style.top = "";
    this.panel.style.left = "";
    this.panel.style.width = "";
    this.panel.style.maxHeight = "";
    this.panel.style.bottom = "";
    this.panel.style.right = "";
    this.panel.style.transform = "";
    this.searchInput.value = "";
    this.renderCountryList();
  }

  private updatePrefix() {
    if (!this.prefixNode) return;
    this.prefixNode.textContent = this.country ? (this.getAttribute("country-picker") === "search" ? `+${getCountryCallingCode(this.country)}` : getCountryCallingCode(this.country)) : "";
  }

  private formatInput() {
    const raw = this.input.value;
    if (raw.trim().startsWith("+")) {
      const parsed = parsePhoneNumberFromString(raw);
      if (parsed?.country) {
        this.country = parsed.country;
        if (this.select) this.select.value = parsed.country;
        this.syncCountryDisplay();
        this.updatePrefix();
        this.input.value = parsed.formatNational().replace(/^\+/, "");
        this.setError("");
        return;
      }
    }
    const digits = raw.replace(/\D/g, "");
    this.input.value = this.country ? new AsYouType(this.country).input(digits).replace(/^\+/, "") : digits;
    this.setError("");
  }

  getPhone(): { e164: string; country: CountryCode } | null {
    if (!this.country) return null;
    const parsed = parseValidPhoneNumber(this.country, this.input.value);
    if (!parsed) return null;
    return { e164: parsed.e164, country: parsed.country };
  }

  setError(message: string) {
    if (!this.error || !this.input) return;
    this.error.textContent = message;
    this.input.setAttribute("aria-invalid", message ? "true" : "false");
    this.classList.toggle("has-error", Boolean(message));
  }

  reset() {
    if (this.input) {
      this.input.value = "";
      this.setError("");
      this.closeCountryPanel();
    }
  }
}

class AccountLinkSubmit extends HTMLElement {
  private root = this.attachShadow({ mode: "open" });
  private button!: HTMLButtonElement;
  connectedCallback() {
    const copy = functionalCopy();
    this.root.innerHTML = `<style>${sharedStyle}:host{display:block}button{width:100%;min-height:3rem;border:0;border-radius:var(--account-link-action-radius,.75rem);background:var(--account-link-action-bg,#111827);color:var(--account-link-action-color,#fff);padding:.75rem 1rem;font-weight:700}</style><button part="button" type="button">${copy.submit}</button>`;
    this.button = this.root.querySelector("button")!;
    this.button.addEventListener("click", () => this.dispatchEvent(new CustomEvent("account-link-submit", { bubbles: true })));
  }
  setLoading(value: boolean) { if (this.button) { this.button.disabled = value; this.button.textContent = value ? functionalCopy().submitting : functionalCopy().submit; } }
}

class PairingCodePanel extends HTMLElement {
  private root = this.attachShadow({ mode: "open" });
  private code = "";
  private expiresAt?: number;
  private timer?: number;
  connectedCallback() {
    const copy = functionalCopy();
    this.root.innerHTML = `<style>${sharedStyle}:host{display:block}.panel{display:grid;gap:.75rem}.code{display:flex;align-items:center;justify-content:center;gap:.75rem;margin:0;font:700 var(--account-link-code-size,2rem)/1.15 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:0;word-break:normal;text-align:center}.code-group{letter-spacing:.04em;font-variant-numeric:tabular-nums}.code-separator{opacity:.72;font-weight:700;user-select:none}.actions{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap}button{min-height:2.75rem;padding:.6rem .9rem;border:1px solid currentColor;border-radius:var(--account-link-secondary-radius,.65rem);background:transparent}.expiry{opacity:.75;font-size:.875rem}</style><section class="panel" part="panel"><strong part="title">${copy.codeTitle}</strong><output class="code" part="code"></output><div class="actions" part="actions"><button part="copy-button" type="button">${copy.copyCode}</button><span class="expiry" part="expiry"></span></div></section>`;
    this.root.querySelector("button")!.addEventListener("click", () => void this.copy());
  }
  show(pairing: PairingHandle) {
    this.code = String(pairing.pairingCode || "");
    this.expiresAt = pairing.expiresAt ? Date.parse(pairing.expiresAt) : undefined;
    this.root.querySelector("output")!.innerHTML = formatPairingCodeMarkup(this.code);
    this.hidden = false;
    this.tick();
    if (this.timer) clearInterval(this.timer);
    this.timer = window.setInterval(() => this.tick(), 1000);
  }
  private tick() {
    const expiry = this.root.querySelector(".expiry");
    if (!expiry) return;
    if (!this.expiresAt || Number.isNaN(this.expiresAt)) { expiry.textContent = ""; return; }
    const seconds = Math.max(0, Math.ceil((this.expiresAt - Date.now()) / 1000));
    expiry.textContent = `${functionalCopy().expires} ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  }
  private async copy() {
    if (!this.code) return;
    try {
      await navigator.clipboard.writeText(normalizePairingCode(this.code));
    } catch {
      const input = document.createElement("textarea"); input.value = normalizePairingCode(this.code); input.style.position = "fixed"; input.style.opacity = "0"; document.body.appendChild(input); input.select(); document.execCommand("copy"); input.remove();
    }
    const button = this.root.querySelector("button")!;
    button.textContent = functionalCopy().copied;
    window.setTimeout(() => { button.textContent = functionalCopy().copyCode; }, 1600);
  }
  reset() { if (this.timer) clearInterval(this.timer); this.timer = undefined; this.hidden = true; this.code = ""; }
}

const appGuideIcons = {
  whatsapp: `<span class="guide-icon whatsapp-icon" part="whatsapp-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><rect width="24" height="24" rx="5.5" fill="#25D366"/><path fill="#fff" d="M12.04 4.002a7.996 7.996 0 0 0-6.86 12.05l-.39 1.43 1.47-.38a7.996 7.996 0 1 0 5.78-12.99Zm4.57 11.17c-.2.57-1.16 1.09-1.61 1.16-.42.06-.97.09-1.56-.1-.35-.12-.81-.28-1.39-.54-2.45-1.06-4.04-3.58-4.16-3.74-.12-.17-1-1.32-1-2.52 0-1.2.62-1.79.84-2.03.22-.24.48-.3.64-.3.16 0 .32 0 .47.01.14.01.35-.05.54.42.2.47.66 1.62.72 1.74.06.12.1.25.02.4-.08.16-.12.25-.23.39-.12.13-.24.3-.35.4-.11.11-.23.24-.1.48.14.23.61.99 1.29 1.6.88.78 1.63 1.03 1.86 1.15.23.11.37.1.5-.06.14-.15.58-.68.74-.91.16-.23.31-.19.52-.12.21.08 1.36.64 1.59.76.23.11.39.17.45.27.06.1.06.56-.13 1.11Z"/></svg></span>`,
  menu: `<span class="guide-icon menu-icon" part="android-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false" fill="currentColor"><circle cx="12" cy="6" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="18" r="1.6"/></svg></span>`,
  settings: `<span class="guide-icon settings-icon" part="iphone-settings-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.75"/><path d="M12 3v2.2M12 18.8V21M4.6 4.6l1.55 1.55M17.85 17.85l1.55 1.55M3 12h2.2M18.8 12H21M4.6 19.4l1.55-1.55M17.85 6.15l1.55-1.55"/></svg></span>`,
};

const escapeGuideText = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!));

const normalizePairingCode = (raw: string) => raw.replace(/[\s-]/g, "").toUpperCase();

const formatPairingCodeMarkup = (raw: string) => {
  const normalized = normalizePairingCode(raw);
  if (!normalized) return "";
  const left = normalized.slice(0, 4);
  const right = normalized.slice(4);
  if (!right) return escapeGuideText(left);
  return `<span class="code-group" part="code-group">${escapeGuideText(left)}</span><span class="code-separator" part="code-separator" aria-hidden="true">-</span><span class="code-group" part="code-group">${escapeGuideText(right)}</span>`;
};

const guideKeyword = (label: string, icon = "") => `<span class="guide-keyword">${escapeGuideText(label)}</span>${icon}`;

const renderGuidePattern = (pattern: string, replacements: Record<string, string>) => {
  let value = escapeGuideText(pattern);
  for (const [placeholder, replacement] of Object.entries(replacements)) value = value.split(placeholder).join(replacement);
  return value;
};

class AppLaunchActions extends HTMLElement {
  private root = this.attachShadow({ mode: "open" });
  connectedCallback() {
    const copy = functionalCopy();
    const android = /Android/i.test(navigator.userAgent);
    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const config = runtimeConfig();
    const simulatedDevice = config.previewMode ? config.previewDevice : undefined;
    const mobile = simulatedDevice
      ? simulatedDevice === "mobile" || simulatedDevice === "tablet"
      : android || ios;
    const openInstruction = renderGuidePattern(copy.instructionOpenPattern, { "{=m2}": guideKeyword(copy.whatsappLabel, appGuideIcons.whatsapp) });
    const platformInstruction = renderGuidePattern(copy.instructionPlatformPattern, { "{=m1}": guideKeyword(copy.menuLabel, appGuideIcons.menu), "{=m5}": guideKeyword(copy.settingsLabel, appGuideIcons.settings) });
    const linkedInstruction = renderGuidePattern(copy.instructionLinkedPattern, { "{=m1}": guideKeyword(copy.linkedDevicesLabel), "{=m3}": guideKeyword(copy.linkDeviceLabel) });
    const enterInstruction = renderGuidePattern(copy.instructionEnterPattern, { "{=m1}": guideKeyword(copy.phoneLinkLabel) });
    this.root.innerHTML = `<style>${sharedStyle}
      :host{display:block}.actions{display:flex;gap:.65rem;flex-wrap:wrap}button{min-height:2.75rem;padding:.6rem .9rem;border:1px solid currentColor;border-radius:var(--account-link-secondary-radius,.65rem);background:transparent}
      .guide{margin:.85rem 0 0}.steps{display:grid;gap:.7rem;margin:0;padding-inline-start:1.65rem;font-size:.9rem;line-height:1.65}.steps li{padding-inline-start:.25rem}.guide-keyword{font-weight:600;white-space:nowrap}.guide-icon{display:inline-block;margin-inline-start:.28rem;line-height:0;vertical-align:-.2em;color:#5f6673}.whatsapp-icon{vertical-align:-.24em;color:transparent}.menu-icon,.settings-icon{width:1.125rem;height:1.125rem;vertical-align:-.14em}.guide-icon svg{display:block}.whatsapp-icon svg{width:1.25rem;height:1.25rem}.menu-icon svg,.settings-icon svg{width:100%;height:100%}.fallback{margin:.65rem 0 0;color:var(--account-link-warning,#92400e);font-size:.9rem}
    </style><section part="panel"><div class="actions" part="actions" ${mobile ? "" : "hidden"}><button part="consumer-button" data-app="consumer" type="button">${copy.openConsumer}</button><button part="business-button" data-app="business" type="button">${copy.openBusiness}</button></div><div class="guide" part="guide"><ol class="steps" part="guide-steps"><li>${openInstruction}</li><li>${platformInstruction}</li><li>${linkedInstruction}</li><li>${enterInstruction}</li></ol></div><p class="fallback" part="fallback" hidden>${copy.appFallback}</p></section>`;
    this.root.querySelectorAll<HTMLButtonElement>("button[data-app]").forEach((button) => button.addEventListener("click", () => this.launch(button.dataset.app === "business" ? "business" : "consumer")));
  }
  private launch(app: "consumer" | "business") {
    const fallback = this.root.querySelector<HTMLElement>(".fallback")!;
    fallback.hidden = true;
    let pageHidden = false;
    const onVisibility = () => { if (document.visibilityState === "hidden") pageHidden = true; };
    document.addEventListener("visibilitychange", onVisibility, { once: true });
    this.dispatchEvent(new CustomEvent("account-link-app-launch", { bubbles: true, detail: { app, status: "attempted" } }));
    window.location.href = app === "business" ? "whatsapp-business://" : "whatsapp://";
    window.setTimeout(() => {
      if (!pageHidden && document.visibilityState === "visible") {
        fallback.hidden = false;
        this.dispatchEvent(new CustomEvent("account-link-app-launch", { bubbles: true, detail: { app, status: "fallback_shown" } }));
      }
    }, 1200);
  }
}

class AccountLinkStatus extends HTMLElement {
  private root = this.attachShadow({ mode: "open" });
  connectedCallback() {
    this.root.innerHTML = `<style>${sharedStyle}:host{display:block}.status{margin:0;min-height:1.5em}.error{color:var(--account-link-error,#b91c1c)}.success{color:var(--account-link-success,#047857)}button{margin-top:.75rem;min-height:2.75rem;padding:.6rem .9rem;border:1px solid currentColor;border-radius:var(--account-link-secondary-radius,.65rem);background:transparent}</style><div part="panel"><p class="status" part="message" role="status" aria-live="polite"></p><button part="retry-button" type="button" hidden>${functionalCopy().retry}</button></div>`;
    this.root.querySelector("button")!.addEventListener("click", () => this.dispatchEvent(new CustomEvent("account-link-retry", { bubbles: true })));
  }
  setState(state: string, message?: string) {
    const copy = functionalCopy();
    const messages: Record<string, string> = { waiting_phone: copy.waiting, code_issued: copy.waiting, reconnecting: copy.reconnecting, verified: copy.verified, expired: copy.expired, failed: copy.failed, cancelled: copy.cancelled, account_already_linked: copy.alreadyLinked, number_unavailable: copy.unavailable, pairing_in_progress: copy.inProgress };
    const node = this.root.querySelector<HTMLElement>(".status")!;
    node.textContent = message || messages[state] || copy.failed;
    node.className = `status ${state === "verified" ? "success" : ["expired", "failed", "cancelled", "account_already_linked", "number_unavailable", "pairing_in_progress"].includes(state) ? "error" : ""}`;
    const retry = this.root.querySelector<HTMLButtonElement>("button")!;
    retry.hidden = !["expired", "failed", "cancelled", "account_already_linked", "number_unavailable", "pairing_in_progress"].includes(state);
    this.hidden = false;
  }
  reset() { this.hidden = true; }
}

class AccountInitializationStatus extends HTMLElement {
  private root = this.attachShadow({ mode: "open" });
  connectedCallback() { this.root.innerHTML = `<style>${sharedStyle}:host{display:block}.status{margin:0;color:var(--account-link-muted,#475569)}</style><p class="status" part="message" role="status" aria-live="polite"></p>`; }
  setState(state: string) {
    const copy = functionalCopy();
    this.root.querySelector("p")!.textContent = state === "ready" ? copy.initialized : ["failed", "unsupported", "partial"].includes(state) ? copy.initializationPartial : copy.initializing;
    this.hidden = false;
  }
  reset() { this.hidden = true; }
}

class AccountLinkFlow extends HTMLElement {
  private pairing?: PairingHandle;
  private pollTimer?: number;
  private pollFailures = 0;
  private phone!: PhoneNumberField;
  private submit!: AccountLinkSubmit;
  private code!: PairingCodePanel;
  private apps!: AppLaunchActions;
  private status!: AccountLinkStatus;
  private initialization?: AccountInitializationStatus;
  private previewStateChanged = (event: Event) => {
    if (!this.pairing) return;
    const data = (event as CustomEvent<Record<string, unknown>>).detail;
    if (data) this.applyPairingState(data, false);
  };

  connectedCallback() {
    this.phone = this.querySelector("phone-number-field") as PhoneNumberField;
    this.submit = this.querySelector("account-link-submit") as AccountLinkSubmit;
    this.code = this.querySelector("pairing-code-panel") as PairingCodePanel;
    this.apps = this.querySelector("app-launch-actions") as AppLaunchActions;
    this.status = this.querySelector("account-link-status") as AccountLinkStatus;
    this.initialization = this.querySelector("account-initialization-status") as AccountInitializationStatus | undefined;
    if (!this.phone || !this.submit || !this.code || !this.apps || !this.status) throw new Error("account-link-flow requires the standard account-link elements");
    this.code.hidden = true; this.apps.hidden = true; this.status.hidden = true; if (this.initialization) this.initialization.hidden = true;
    this.addEventListener("account-link-submit", () => void this.start());
    this.addEventListener("account-link-retry", () => void this.reset());
    window.addEventListener("promotion-preview-state-change", this.previewStateChanged);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && this.pairing) void this.poll(); });
  }

  disconnectedCallback() {
    window.removeEventListener("promotion-preview-state-change", this.previewStateChanged);
    if (this.pollTimer) clearTimeout(this.pollTimer);
  }

  private async start() {
    const phone = this.phone.getPhone();
    if (!phone) { this.phone.setError(functionalCopy().invalidPhone); return; }
    const bridge = (window as unknown as { PromotionBridge?: { submitPhone(phone: string, metadata?: Record<string, unknown>): Promise<Response> } }).PromotionBridge;
    if (!bridge?.submitPhone) { this.status.setState("failed"); return; }
    this.submit.setLoading(true);
    try {
      const response = await bridge.submitPhone(phone.e164, { componentKit: "account-link-elements/v1", locale: resolvedLocale(), countrySource: "browser" });
      const payload = await response.json();
      const pairing = payload?.data?.pairing as PairingHandle | undefined;
      if (!pairing?.pairingCode) throw Object.assign(new Error("pairing code missing"), { code: "pairing_start_failed" });
      this.pairing = pairing;
      this.dispatchEvent(new CustomEvent("account-link-pairing-started", { bubbles: true, detail: { attemptId: pairing.attemptId } }));
      this.phone.hidden = true; this.submit.hidden = true;
      this.code.show(pairing); this.apps.hidden = false; this.status.setState(pairing.pairingStatus || "waiting_phone");
      this.pollFailures = 0;
      void this.poll();
    } catch (error) {
      const value = error as BridgeError;
      const code = value.code || "failed";
      if (code === "invalid_phone") {
        this.phone.setError(functionalCopy().invalidPhone);
        this.status.reset();
      } else if (
        [
          "account_already_linked",
          "number_unavailable",
          "pairing_in_progress",
        ].includes(code)
      ) {
        this.status.setState(code);
      } else {
        // Operational details remain in the management console. Visitors only
        // need a concise retryable failure state.
        this.status.setState("failed");
      }
    } finally { this.submit.setLoading(false); }
  }

  private schedule(delay: number) { if (this.pollTimer) clearTimeout(this.pollTimer); this.pollTimer = window.setTimeout(() => void this.poll(), delay); }

  private applyPairingState(data: Record<string, unknown>, scheduleNext: boolean) {
    const state = String(data.pairingStatus || "failed");
    this.pollFailures = 0;
    if (data.verified === true && state === "verified") {
      this.status.setState("verified"); this.code.reset(); this.apps.hidden = true;
      if (this.initialization) this.initialization.setState(String(data.initializationStatus || "pending"));
      if (scheduleNext && ["pending", "syncing"].includes(String(data.initializationStatus || "pending"))) {
        this.schedule(Number(data.nextPollAfterMs) || 2000);
      }
      return;
    }
    if (this.pairing && this.code.hidden) this.code.show(this.pairing);
    this.apps.hidden = false;
    this.initialization?.reset();
    this.status.setState(state);
    if (["failed", "expired", "cancelled"].includes(state)) return;
    if (scheduleNext) this.schedule(Number(data.nextPollAfterMs) || 2000);
  }

  private async poll() {
    if (!this.pairing || document.visibilityState === "hidden") return;
    const bridge = (window as unknown as { PromotionBridge?: { getPairingStatus(pairing: PairingHandle): Promise<Response> } }).PromotionBridge;
    if (!bridge?.getPairingStatus) { this.status.setState("failed"); return; }
    try {
      const response = await bridge.getPairingStatus(this.pairing);
      if (response.status === 429) {
        const retryAfterSeconds = Number(response.headers.get("Retry-After"));
        this.pollFailures = 0;
        this.schedule(
          Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
            ? retryAfterSeconds * 1000
            : 5000,
        );
        return;
      }
      if (!response.ok) throw new Error("status rejected");
      const payload = await response.json();
      this.applyPairingState(payload?.data || {}, true);
    } catch {
      this.pollFailures += 1;
      this.schedule(Math.min(2000 * (2 ** Math.min(this.pollFailures, 3)), 15000));
    }
  }

  private async reset() {
    if (this.pollTimer) clearTimeout(this.pollTimer);
    const pairing = this.pairing; this.pairing = undefined;
    const bridge = (window as unknown as { PromotionBridge?: { cancelPairing(pairing: PairingHandle): Promise<Response> } }).PromotionBridge;
    if (pairing && bridge?.cancelPairing) { try { await bridge.cancelPairing(pairing); } catch { /* terminal attempts are safe to leave */ } }
    this.code.reset(); this.apps.hidden = true; this.status.reset(); this.initialization?.reset(); this.phone.reset(); this.phone.hidden = false; this.submit.hidden = false;
    this.dispatchEvent(new CustomEvent("account-link-reset", { bubbles: true }));
  }
}

customElements.define("account-link-locale-switcher", AccountLinkLocaleSwitcher);
customElements.define("phone-number-field", PhoneNumberField);
customElements.define("account-link-submit", AccountLinkSubmit);
customElements.define("pairing-code-panel", PairingCodePanel);
customElements.define("app-launch-actions", AppLaunchActions);
customElements.define("account-link-status", AccountLinkStatus);
customElements.define("account-initialization-status", AccountInitializationStatus);
customElements.define("account-link-flow", AccountLinkFlow);

declare global {
  interface Window { AccountLinkElements?: { version: string; browserCountry(): CountryCode | undefined } }
}

window.AccountLinkElements = { version: "account-link-elements/v1", browserCountry };
