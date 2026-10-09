#!/usr/bin/env python3
"""Builds the bilingual "install Lumio as an app" parent guides (poster PNG +
vertical MP4) for Android/Chrome, iOS/Safari (iPhone + iPad) and PC
(Chrome/Edge). Run from the repo root:

    python3.12 _docs/guides/build_install_guides.py

Needs Playwright's Chromium (/opt/pw-browsers/chromium), Pillow and ffmpeg.
Screenshots of the real login page are taken from a local http.server, so
the mockups always show the current design. Output: _docs/guides/*.png|mp4.
"""
import base64, os, subprocess, sys, time, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "_docs/guides"
TMP = Path(os.environ.get("LUMIO_TMP", "/tmp/lumio-guides")); TMP.mkdir(parents=True, exist_ok=True)
FONTS = ROOT / "_docs/manuals-src/assets/fonts"
SITE = "lumiooo.com"

def du(p, mime="image/png"):
    return f"data:{mime};base64," + base64.b64encode(Path(p).read_bytes()).decode()

CSS = """
@font-face{font-family:'Baloo 2';src:url('FONTS/baloo-2-latin-800-normal.woff2') format('woff2');font-weight:800}
@font-face{font-family:'Baloo 2';src:url('FONTS/baloo-2-latin-700-normal.woff2') format('woff2');font-weight:700}
@font-face{font-family:'Nunito';src:url('FONTS/nunito-latin-700-normal.woff2') format('woff2');font-weight:700}
@font-face{font-family:'Nunito';src:url('FONTS/nunito-latin-800-normal.woff2') format('woff2');font-weight:800}
@font-face{font-family:'Cairo';src:url('FONTS/cairo-arabic-700-normal.woff2') format('woff2');font-weight:700}
@font-face{font-family:'Cairo';src:url('FONTS/cairo-arabic-900-normal.woff2') format('woff2');font-weight:900}
:root{--or:#F97316;--sun:#FFC93C;--teal:#0D9488;--cocoa:#43301F;--cream:#FFF8EC;--soft:#8A7160;--line:#F0E6D6}
*{box-sizing:border-box;margin:0}
body{width:1080px;background:linear-gradient(170deg,#FFF8EC,#FFF1DA 60%,#FFE9C9);font-family:'Nunito',sans-serif;color:var(--cocoa);padding:0 0 56px}
.ar{font-family:'Cairo',sans-serif;direction:rtl}
header{padding:54px 64px 30px;display:flex;align-items:center;gap:24px}
header img.logo{height:120px}
header h1{font-family:'Baloo 2';font-size:52px;line-height:1.05}
header h1 span{color:var(--or)}
header .sub{font-size:24px;color:var(--soft);font-weight:700;margin-top:6px}
header .sub.ar{font-size:26px;margin-top:2px}
.pill{display:inline-flex;align-items:center;gap:10px;background:#fff;border:3px solid var(--or);color:var(--cocoa);border-radius:999px;padding:12px 22px;font-weight:800;font-size:24px;margin:0 64px 14px}
.pill b{color:var(--or)}
.steps{padding:16px 64px 0;display:flex;flex-direction:column;gap:30px}
.step{display:grid;grid-template-columns:300px 1fr;gap:34px;align-items:center;background:#fff;border-radius:34px;padding:30px 34px;box-shadow:0 10px 30px rgba(67,48,31,.08);position:relative}
.step.wide{grid-template-columns:470px 1fr;gap:28px}
.num{position:absolute;left:-10px;top:-14px;width:68px;height:68px;border-radius:50%;background:var(--or);color:#fff;font-family:'Baloo 2';font-size:38px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(249,115,22,.4)}
.t{display:flex;flex-direction:column;gap:10px}
.t .en{font-size:30px;font-weight:800;line-height:1.25}
.t .ar{font-size:32px;font-weight:900;line-height:1.5;color:#5A4030}
.t .en small,.t .ar small{display:block;font-size:21px;font-weight:700;color:var(--soft);margin-top:4px;line-height:1.4}
.t .ar small{font-size:23px}
.step.wide .t .en{font-size:27px}.step.wide .t .ar{font-size:29px}
.key{display:inline-block;background:#FFF1E0;border:2px solid #F9C89A;border-radius:10px;padding:2px 10px;font-weight:800;color:#C2410C}
/* phone / tablet / desktop frames */
.phone{width:300px;height:560px;border-radius:40px;background:#1C1610;padding:12px;position:relative;box-shadow:0 14px 30px rgba(0,0,0,.25)}
.phone.ios{background:#2B2B2E}
.tablet{width:300px;height:420px;border-radius:26px;background:#2B2B2E;padding:14px;position:relative;box-shadow:0 14px 30px rgba(0,0,0,.25)}
.screen{width:100%;height:100%;border-radius:30px;overflow:hidden;background:#fff;position:relative;font-size:14px}
.tablet .screen{border-radius:14px}
.desk{width:470px;position:relative}
.desk .frame{width:100%;height:320px;border-radius:14px;background:#fff;overflow:hidden;box-shadow:0 14px 30px rgba(0,0,0,.22);border:4px solid #2B2B2E;position:relative;font-size:13px}
.desk .stand{width:120px;height:18px;background:#2B2B2E;margin:0 auto;border-radius:0 0 8px 8px}
.desk .base{width:220px;height:8px;background:#2B2B2E;margin:0 auto;border-radius:8px}
.tabs{height:34px;background:#DEE1E6;display:flex;align-items:flex-end;padding:0 10px;gap:6px}
.tabs .tab{background:#fff;border-radius:10px 10px 0 0;padding:6px 14px;font-weight:700;color:#202124;display:flex;align-items:center;gap:8px;font-size:12px}
.tabs .tab img{width:14px;height:14px}
.bar{height:40px;background:#fff;display:flex;align-items:center;gap:10px;padding:0 12px;border-bottom:1px solid #E5E7EB;color:#5F6368;font-weight:800}
.bar .nav{display:flex;gap:10px;font-size:16px}
.bar .url{flex:1;height:28px;border-radius:999px;background:#F1F3F4;display:flex;align-items:center;gap:8px;padding:0 12px;font-size:12px;color:#202124;font-weight:700;position:relative}
.bar .url .inst{margin-left:auto;width:22px;height:22px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;color:#1A73E8;border:1px solid #DADCE0}
.bar .dots{font-size:20px;color:#3C4043;width:30px;text-align:center;position:relative}
.chrome{height:62px;background:#fff;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;gap:8px;padding:10px 12px}
.url{flex:1;height:38px;border-radius:999px;background:#F1F3F4;display:flex;align-items:center;gap:8px;padding:0 12px;font-size:13px;color:#202124;font-weight:700;white-space:nowrap;overflow:hidden}
.url .lock{width:12px;height:12px;border:2px solid #5F6368;border-radius:3px;border-top-width:3px}
.dots{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#3C4043;position:relative}
.hl{outline:4px solid var(--or);outline-offset:3px;border-radius:50%;box-shadow:0 0 0 10px rgba(249,115,22,.22)}
.hlbox{outline:4px solid var(--or);outline-offset:-4px;border-radius:12px;box-shadow:0 0 0 8px rgba(249,115,22,.22)}
.shot{width:100%;display:block}
.menu{position:absolute;top:10px;right:10px;width:210px;background:#fff;border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,.28);padding:8px 0;font-size:14px;color:#202124;font-weight:700;z-index:3}
.menu div{padding:11px 16px;display:flex;align-items:center;gap:12px}
.menu div i{width:18px;height:18px;border-radius:4px;background:#DADCE0;display:inline-block}
.menu div.on{background:#FFF1E0;color:#C2410C;margin:4px 8px;border-radius:10px}
.menu div.on i{background:var(--or)}
.menu.desk{top:44px;right:8px;width:230px;font-size:12px}
.menu.desk div{padding:8px 14px}
.menu.sub{right:236px;top:130px;width:200px}
.dim{position:absolute;inset:0;background:rgba(0,0,0,.45);z-index:2}
.sheet{position:absolute;left:0;right:0;bottom:0;background:#fff;border-radius:22px 22px 0 0;padding:20px 18px 22px;font-size:14px;color:#202124;z-index:3}
.sheet .app{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.sheet .app img{width:52px;height:52px;border-radius:12px}
.sheet .app b{display:block;font-size:16px}
.sheet .app span{color:#5F6368;font-size:12px}
.sheet .btns{display:flex;justify-content:flex-end;gap:10px}
.sheet .btns div{padding:9px 16px;border-radius:999px;font-weight:800}
.sheet .btns .c{color:#1A73E8}
.sheet .btns .i{background:#1A73E8;color:#fff}
/* iOS */
.iosbar{position:absolute;left:0;right:0;bottom:0;height:86px;background:rgba(249,249,249,.96);border-top:1px solid #D1D1D6;z-index:3;padding:0 10px}
.iosbar .addr{margin:8px 6px 0;height:36px;border-radius:12px;background:#E9E9EB;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#1C1C1E;gap:6px}
.iosbar .row{display:flex;justify-content:space-around;align-items:center;height:40px;color:#0A84FF;font-size:20px}
.iosbar .row span{width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:50%;position:relative}
.iostop{height:44px;background:rgba(249,249,249,.96);border-bottom:1px solid #D1D1D6;display:flex;align-items:center;gap:8px;padding:0 10px;color:#0A84FF;font-size:16px;z-index:3;position:relative}
.iostop .addr{flex:1;height:30px;border-radius:10px;background:#E9E9EB;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#1C1C1E;gap:6px}
.iostop span{width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:50%;position:relative}
.ios-sheet{position:absolute;left:0;right:0;bottom:0;background:#F2F2F7;border-radius:18px 18px 0 0;padding:14px 0 0;z-index:3;font-size:13px;color:#1C1C1E}
.ios-sheet .hdr{display:flex;align-items:center;gap:10px;padding:0 14px 12px;border-bottom:1px solid #D1D1D6}
.ios-sheet .hdr img{width:40px;height:40px;border-radius:9px}
.ios-sheet .hdr b{display:block}
.ios-sheet .hdr span{color:#6E6E73;font-size:11px}
.ios-sheet .apps{display:flex;gap:14px;padding:12px 14px;border-bottom:1px solid #D1D1D6}
.ios-sheet .apps div{width:48px;height:48px;border-radius:12px;background:#D1D1D6}
.ios-sheet .list{background:#fff;margin:10px 12px 0;border-radius:12px}
.ios-sheet .list div{padding:11px 14px;border-bottom:1px solid #E5E5EA;display:flex;align-items:center;justify-content:space-between;font-weight:600}
.ios-sheet .list div:last-child{border-bottom:none}
.ios-sheet .list div.on{background:#FFF1E0;color:#C2410C;border-radius:12px;font-weight:800}
.ios-sheet .list i{width:18px;height:18px;border-radius:5px;background:#D1D1D6;display:inline-block}
.ios-add{position:absolute;inset:0;background:#fff;z-index:3;font-size:13px;color:#1C1C1E}
.ios-add .top{display:flex;justify-content:space-between;padding:14px 14px;font-weight:600;color:#0A84FF;border-bottom:1px solid #E5E5EA}
.ios-add .top b{color:#1C1C1E}
.ios-add .top .add{font-weight:800;padding:2px 10px}
.ios-add .body{display:flex;gap:12px;padding:16px 14px;align-items:center}
.ios-add .body img{width:58px;height:58px;border-radius:13px}
.ios-add .body input{border:none;border-bottom:1px solid #D1D1D6;font-size:15px;font-weight:700;width:100%;padding:4px 0;font-family:inherit}
.ios-add .body span{display:block;font-size:11px;color:#6E6E73;margin-top:4px}
.ios-add p{padding:0 14px;color:#6E6E73;font-size:11px;line-height:1.4}
.home{height:100%;background:linear-gradient(160deg,#5B6B9A,#8FA3C8 60%,#D9C6B0);padding:28px 18px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px 10px;align-content:start}
.home.ios{background:linear-gradient(160deg,#1E3A8A,#7C3AED 55%,#F472B6)}
.home.wide{grid-template-columns:repeat(6,1fr);padding:22px 16px}
.home .ic{display:flex;flex-direction:column;align-items:center;gap:5px;font-size:10px;color:#fff;font-weight:800;text-shadow:0 1px 3px rgba(0,0,0,.4)}
.home .ic div{width:48px;height:48px;border-radius:13px;background:rgba(255,255,255,.35)}
.home.wide .ic div{width:40px;height:40px}
.home .ic img{width:52px;height:52px;border-radius:14px;background:#fff}
.home.wide .ic img{width:44px;height:44px}
.home .ic.lu{transform:scale(1.18)}
.desktop{height:100%;background:linear-gradient(160deg,#0F3460,#16537E 55%,#5FA8D3);position:relative}
.desktop .icons{position:absolute;left:18px;top:16px;display:grid;grid-template-columns:repeat(2,70px);gap:14px}
.desktop .ic{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:10px;color:#fff;font-weight:800;text-shadow:0 1px 3px rgba(0,0,0,.5)}
.desktop .ic div{width:38px;height:38px;border-radius:8px;background:rgba(255,255,255,.35)}
.desktop .ic img{width:44px;height:44px;border-radius:10px;background:#fff}
.desktop .taskbar{position:absolute;left:0;right:0;bottom:0;height:34px;background:rgba(20,20,30,.85);display:flex;align-items:center;justify-content:center;gap:12px}
.desktop .taskbar div{width:22px;height:22px;border-radius:5px;background:rgba(255,255,255,.3)}
.desktop .taskbar img{width:24px;height:24px;border-radius:6px;background:#fff}
.app-win{position:absolute;left:170px;top:22px;right:16px;bottom:44px;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,.4)}
.app-win .title{height:30px;background:#FFF1E0;display:flex;align-items:center;gap:8px;padding:0 10px;font-size:11px;font-weight:800;color:#43301F}
.app-win .title img{width:16px;height:16px;border-radius:4px}
.app-win .title .wc{margin-left:auto;display:flex;gap:10px;color:#5F6368}
.statusbar{height:24px;background:#fff;display:flex;justify-content:space-between;padding:4px 16px;font-size:11px;font-weight:800;color:#202124}
.tip{margin:34px 64px 0;background:var(--cocoa);color:#fff;border-radius:28px;padding:28px 34px;display:grid;grid-template-columns:1fr 150px;gap:24px;align-items:center}
.tip .en{font-size:24px;font-weight:800;line-height:1.35}
.tip .ar{font-size:26px;font-weight:900;line-height:1.5;margin-top:10px;color:#FFE4C4}
.tip .en span{color:var(--sun)}
.tip img{width:150px;border-radius:16px;background:#fff;padding:6px}
footer{margin:26px 64px 0;text-align:center;color:var(--soft);font-weight:800;font-size:22px}
footer b{color:var(--or)}
"""

def page(title_en, sub_en, sub_ar, steps_html, tip_en, tip_ar):
    return f"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<header><img class="logo" src="LOGO"><div><h1>{title_en}</h1><div class="sub">{sub_en}</div><div class="sub ar">{sub_ar}</div></div></header>
<div class="pill">🔗 <b>{SITE}</b> &nbsp;·&nbsp; or scan the code at the bottom</div>
<div class="steps">{steps_html}</div>
<div class="tip"><div><div class="en">{tip_en}</div><div class="ar">{tip_ar}</div></div><img src="QR"></div>
<footer>Lumio English · <b>{SITE}</b> · Small Steps, Big Futures</footer>
</body></html>"""

def step(n, art, en, en_small, ar, ar_small, wide=False):
    return f"""<div class="step{' wide' if wide else ''}"><div class="num">{n}</div>{art}
<div class="t"><div class="en">{en}<small>{en_small}</small></div><div class="ar">{ar}<small>{ar_small}</small></div></div></div>"""

# ---------- shared mockup bits ----------
STATUS = '<div class="statusbar"><span>9:41</span><span>▮▮▮ 📶 🔋</span></div>'
def chrome_bar(hl_url=False, hl_dots=False):
    return f'<div class="chrome"><div class="url{" hlbox" if hl_url else ""}"><span class="lock"></span>{SITE}</div><div class="dots{" hl" if hl_dots else ""}">⋮</div></div>'
def phone(inner, ios=False):
    return f'<div class="phone{" ios" if ios else ""}"><div class="screen">{inner}</div></div>'
def home_icons(cls="", lumi_index=5, n=12, labels=None):
    labels = labels or ["Phone","Messages","Camera","Gallery","WhatsApp","Lumio","YouTube","Maps","Clock","Settings","Calendar","Chrome"]
    out = []
    for i in range(n):
        if i == lumi_index: out.append('<div class="ic lu"><img class="hlbox" src="ICON" style="border-radius:14px">Lumio</div>')
        else: out.append(f'<div class="ic"><div></div>{labels[i]}</div>')
    return f'<div class="home {cls}">{"".join(out)}</div>'

# ---------- Android / Chrome ----------
def android_steps():
    s = []
    s.append(step(1, phone(STATUS + chrome_bar(hl_url=True) + '<img class="shot" src="SHOT_PHONE" style="margin-top:-2px">'),
        'Open the Lumio link in <span class="key">Chrome</span>', f'Type <b>{SITE}</b> in the address bar, or tap the link we sent you on WhatsApp. Make sure it opens in Chrome, not inside WhatsApp.',
        'افتحوا رابط Lumio في متصفح <span class="key">كروم</span>', 'اكتبوا الرابط في شريط العنوان أو اضغطوا على الرابط المرسل على واتساب — وتأكدوا أنه يفتح في كروم وليس داخل واتساب.'))
    s.append(step(2, phone(STATUS + chrome_bar(hl_dots=True) + '<img class="shot" src="SHOT_PHONE" style="margin-top:-2px">'),
        'Tap the three dots <span class="key">⋮</span> at the top right', 'This opens the Chrome menu.',
        'اضغطوا على النقاط الثلاث <span class="key">⋮</span> أعلى اليمين', 'تفتح قائمة كروم.'))
    menu = '<div class="menu"><div><i></i>New tab</div><div><i></i>History</div><div><i></i>Downloads</div><div><i></i>Bookmarks</div><div><i></i>Share…</div><div><i></i>Find in page</div><div class="on"><i></i>Add to Home screen</div><div><i></i>Desktop site</div><div><i></i>Settings</div></div>'
    s.append(step(3, phone(STATUS + chrome_bar() + '<img class="shot" src="SHOT_PHONE" style="margin-top:-2px;opacity:.5">' + menu),
        'Tap <span class="key">Add to Home screen</span>', 'On some phones it says <b>Install app</b> instead — it\'s the same thing.',
        'اختاروا <span class="key">إضافة إلى الشاشة الرئيسية</span>', 'في بعض الأجهزة تظهر باسم <b>تثبيت التطبيق</b> — وهي نفس الخطوة.'))
    sheet = f'<div class="dim"></div><div class="sheet"><div class="app"><img src="ICON"><div><b>Lumio English</b><span>{SITE.split("/")[0]}</span></div></div><div class="btns"><div class="c">Cancel</div><div class="i hlbox" style="border-radius:999px">Install</div></div></div>'
    s.append(step(4, phone(STATUS + chrome_bar() + '<img class="shot" src="SHOT_PHONE" style="margin-top:-2px">' + sheet),
        'Tap <span class="key">Install</span>', 'Chrome adds Lumio to your home screen in a second. Nothing is downloaded from the Play Store.',
        'اضغطوا <span class="key">تثبيت</span>', 'يضيف كروم أيقونة Lumio إلى الشاشة الرئيسية فوراً — بدون متجر Google Play.'))
    s.append(step(5, phone(home_icons()),
        'Done! Open <span class="key">Lumio</span> from the home screen', 'It opens full-screen like any app. Log in once with the Student ID — the phone remembers it. Every class, homework and the booking page are inside.',
        'تم! افتحوا <span class="key">Lumio</span> من الشاشة الرئيسية', 'يفتح بملء الشاشة مثل أي تطبيق. سجّلوا الدخول مرة واحدة برقم الطالب وسيتذكره الجوال. الحصص والواجبات وحجز المواعيد كلها بداخله.'))
    return "".join(s)

# ---------- iOS / Safari (iPhone + iPad) ----------
def ios_bottom(hl_share=False):
    return f'<div class="iosbar"><div class="addr">🔒 {SITE.split("/")[0]}</div><div class="row"><span>‹</span><span>›</span><span class="{"hl" if hl_share else ""}">⎙</span><span>📖</span><span>⧉</span></div></div>'
def ios_steps():
    s = []
    s.append(step(1, phone(STATUS + '<img class="shot" src="SHOT_PHONE">' + ios_bottom(), ios=True),
        'Open the Lumio link in <span class="key">Safari</span>', f'Type <b>{SITE}</b> in the address bar, or tap the link we sent you on WhatsApp. On iPhone and iPad this only works from <b>Safari</b> — not from Chrome and not inside WhatsApp.',
        'افتحوا رابط Lumio في متصفح <span class="key">Safari</span>', 'اكتبوا الرابط في شريط العنوان أو اضغطوا على الرابط المرسل على واتساب. على الآيفون والآيباد لا تعمل الخطوة إلا من <b>Safari</b> — ليس من كروم ولا من داخل واتساب.'))
    s.append(step(2, phone(STATUS + '<img class="shot" src="SHOT_PHONE">' + ios_bottom(hl_share=True), ios=True),
        'Tap the Share button <span class="key">⎙</span>', 'iPhone: the square with an arrow at the bottom of the screen. iPad: the same button at the top right, next to the address bar.',
        'اضغطوا زر المشاركة <span class="key">⎙</span>', 'آيفون: المربع الذي يخرج منه سهم في أسفل الشاشة. آيباد: الزر نفسه أعلى اليمين بجانب شريط العنوان.'))
    sheet = f'<div class="dim"></div><div class="ios-sheet"><div class="hdr"><img src="ICON"><div><b>Lumio English</b><span>{SITE.split("/")[0]}</span></div></div><div class="apps"><div></div><div></div><div></div><div></div></div><div class="list"><div>Copy <i></i></div><div>Add to Reading List <i></i></div><div>Add Bookmark <i></i></div><div class="on hlbox">Add to Home Screen <i style="background:#F97316"></i></div><div>Find on Page <i></i></div></div></div>'
    s.append(step(3, phone(STATUS + '<img class="shot" src="SHOT_PHONE" style="opacity:.5">' + sheet, ios=True),
        'Scroll down and tap <span class="key">Add to Home Screen</span>', 'The list is long — swipe up inside the menu until you see it.',
        'انزلوا للأسفل واختاروا <span class="key">إضافة إلى الشاشة الرئيسية</span>', 'القائمة طويلة — اسحبوا للأعلى داخل القائمة حتى تظهر.'))
    add = f'<div class="ios-add"><div class="top"><span>Cancel</span><b>Add to Home Screen</b><span class="add hlbox" style="border-radius:8px">Add</span></div><div class="body"><img src="ICON"><div><input value="Lumio"><span>https://{SITE}/</span></div></div><p>An icon will be added to your Home Screen so you can quickly access this website.</p></div>'
    s.append(step(4, phone(STATUS + add, ios=True),
        'Tap <span class="key">Add</span> at the top right', 'You can leave the name as "Lumio". Nothing is downloaded from the App Store.',
        'اضغطوا <span class="key">إضافة</span> أعلى اليمين', 'اتركوا الاسم "Lumio" كما هو. لا يتم تنزيل أي شيء من App Store.'))
    s.append(step(5, phone(home_icons("ios", labels=["Phone","Messages","Camera","Photos","WhatsApp","Lumio","YouTube","Maps","Clock","Settings","Calendar","Safari"]), ios=True),
        'Done! Open <span class="key">Lumio</span> from the Home Screen', 'It opens full-screen like any app. Log in once with the Student ID — the device remembers it. Works the same on iPad.',
        'تم! افتحوا <span class="key">Lumio</span> من الشاشة الرئيسية', 'يفتح بملء الشاشة مثل أي تطبيق. سجّلوا الدخول مرة واحدة برقم الطالب وسيتذكره الجهاز. الطريقة نفسها على الآيباد.'))
    # iPad note as step 6 with tablet art
    ipad = f'<div class="tablet"><div class="screen"><div class="iostop"><span>‹</span><span>›</span><div class="addr">🔒 {SITE.split("/")[0]}</div><span class="hl">⎙</span><span>+</span></div><img class="shot" src="SHOT_IPAD"></div></div>'
    s.append(step(6, ipad,
        'On <span class="key">iPad</span> the Share button is at the top', 'Same steps: Safari → Share ⎙ (top right) → Add to Home Screen → Add.',
        'على <span class="key">الآيباد</span> زر المشاركة في الأعلى', 'نفس الخطوات: Safari ← مشاركة ⎙ (أعلى اليمين) ← إضافة إلى الشاشة الرئيسية ← إضافة.'))
    return "".join(s)

# ---------- PC (Chrome / Edge) ----------
def desk(inner, tab_label="Login — Lumio English", hl_install=False, hl_dots=False, menu=""):
    return f'''<div class="desk"><div class="frame"><div class="tabs"><div class="tab"><img src="ICON">{tab_label}</div></div>
<div class="bar"><div class="nav">‹ › ↻</div><div class="url">🔒 {SITE}<div class="inst{" hl" if hl_install else ""}">⬇</div></div><div class="dots{" hl" if hl_dots else ""}">⋮</div></div>
{inner}{menu}</div><div class="stand"></div><div class="base"></div></div>'''
def pc_steps():
    s = []
    s.append(step(1, desk('<img class="shot" src="SHOT_DESK" style="width:100%;height:246px;object-fit:cover;object-position:top">'),
        'Open the Lumio link in <span class="key">Chrome</span> or <span class="key">Edge</span>', f'Type <b>{SITE}</b> in the address bar and press Enter. Works on Windows and Mac.',
        'افتحوا رابط Lumio في <span class="key">كروم</span> أو <span class="key">Edge</span>', 'اكتبوا الرابط في شريط العنوان واضغطوا Enter. يعمل على ويندوز وماك.', wide=True))
    s.append(step(2, desk('<img class="shot" src="SHOT_DESK" style="width:100%;height:246px;object-fit:cover;object-position:top">', hl_install=True),
        'Click the small <span class="key">install icon</span> at the end of the address bar', 'It looks like a monitor with a down arrow (Chrome) or a grid of squares (Edge). It appears a moment after the page loads.',
        'اضغطوا على <span class="key">أيقونة التثبيت</span> الصغيرة في نهاية شريط العنوان', 'شكلها شاشة بسهم للأسفل (كروم) أو مربعات صغيرة (Edge)، وتظهر بعد لحظة من فتح الصفحة.', wide=True))
    menu = '<div class="menu desk"><div><i></i>New tab</div><div><i></i>History</div><div><i></i>Downloads</div><div><i></i>Bookmarks and lists</div><div class="on"><i></i>Cast, save and share ›</div><div><i></i>Find and edit</div><div><i></i>Settings</div></div><div class="menu desk sub"><div><i></i>Cast…</div><div><i></i>Save page as…</div><div><i></i>Create QR code</div><div class="on hlbox"><i></i>Install page as app…</div></div>'
    s.append(step(3, desk('<img class="shot" src="SHOT_DESK" style="width:100%;height:246px;object-fit:cover;object-position:top;opacity:.5">', hl_dots=True, menu=menu),
        'No icon? Use the menu <span class="key">⋮</span> → Cast, save and share → <span class="key">Install page as app…</span>', 'In Edge: <b>…</b> → Apps → <b>Install this site as an app</b>.',
        'لا توجد أيقونة؟ من القائمة <span class="key">⋮</span> ← Cast, save and share ← <span class="key">Install page as app…</span>', 'في Edge: <b>…</b> ← Apps ← <b>Install this site as an app</b>.', wide=True))
    popup = f'<div class="dim"></div><div class="sheet" style="bottom:auto;top:50px;left:auto;right:30px;width:250px;border-radius:14px"><div class="app"><img src="ICON"><div><b>Install app?</b><span>Lumio English · {SITE.split("/")[0]}</span></div></div><div class="btns"><div class="c">Cancel</div><div class="i hlbox" style="border-radius:999px">Install</div></div></div>'
    s.append(step(4, desk('<img class="shot" src="SHOT_DESK" style="width:100%;height:246px;object-fit:cover;object-position:top">' + popup),
        'Click <span class="key">Install</span>', 'Lumio opens in its own window right away and is added to the Start menu (Windows) or Applications / Dock (Mac).',
        'اضغطوا <span class="key">Install</span>', 'يفتح Lumio في نافذة مستقلة فوراً، ويُضاف إلى قائمة ابدأ (ويندوز) أو التطبيقات / الـ Dock (ماك).', wide=True))
    win = f'<div class="desktop"><div class="icons"><div class="ic"><div></div>This PC</div><div class="ic"><div></div>Recycle Bin</div><div class="ic lu"><img class="hlbox" src="ICON" style="border-radius:10px">Lumio</div><div class="ic"><div></div>Documents</div></div><div class="app-win"><div class="title"><img src="ICON">Lumio English<div class="wc">— ▢ ✕</div></div><img class="shot" src="SHOT_DESK" style="width:100%;height:100%;object-fit:cover;object-position:top"></div><div class="taskbar"><div></div><div></div><img src="ICON"><div></div><div></div></div></div>'
    s.append(step(5, f'<div class="desk"><div class="frame">{win}</div><div class="stand"></div><div class="base"></div></div>',
        'Done! Open <span class="key">Lumio</span> from the desktop, Start menu or taskbar', 'Tip: right-click the Lumio icon in the taskbar → <b>Pin to taskbar</b> so it\'s always one click away. Log in once with the Student ID.',
        'تم! افتحوا <span class="key">Lumio</span> من سطح المكتب أو قائمة ابدأ أو شريط المهام', 'نصيحة: اضغطوا بزر الفأرة الأيمن على أيقونة Lumio في شريط المهام ← <b>تثبيت في شريط المهام</b> لتبقى على بُعد ضغطة واحدة. سجّلوا الدخول مرة واحدة برقم الطالب.', wide=True))
    return "".join(s)

GUIDES = {
    "android-chrome": dict(title='Put <span>Lumio</span> on your phone', sub_en='Install the student platform as an app — Android · Chrome · 1 minute', sub_ar='ثبّتوا منصة الطالب كتطبيق — أندرويد · كروم · دقيقة واحدة فقط', steps=android_steps,
        tip_en='📱 <span>iPhone or iPad?</span> Open the link in <b>Safari</b> → tap the Share button <b>⎙</b> → <b>Add to Home Screen</b> → <b>Add</b>. (We have a separate guide for that.)',
        tip_ar='آيفون أو آيباد؟ افتحوا الرابط في <b>Safari</b> ← زر المشاركة <b>⎙</b> ← <b>إضافة إلى الشاشة الرئيسية</b> ← <b>إضافة</b>. (يوجد دليل منفصل لذلك.)'),
    "ios-safari": dict(title='Put <span>Lumio</span> on your iPhone or iPad', sub_en='Install the student platform as an app — iPhone · iPad · Safari', sub_ar='ثبّتوا منصة الطالب كتطبيق — آيفون · آيباد · Safari', steps=ios_steps,
        tip_en='🤖 <span>Android phone?</span> Open the link in <b>Chrome</b> → <b>⋮</b> → <b>Add to Home screen</b> → <b>Install</b>. (We have a separate guide for that.)',
        tip_ar='جوال أندرويد؟ افتحوا الرابط في <b>كروم</b> ← <b>⋮</b> ← <b>إضافة إلى الشاشة الرئيسية</b> ← <b>تثبيت</b>. (يوجد دليل منفصل لذلك.)'),
    "pc-chrome-edge": dict(title='Put <span>Lumio</span> on your computer', sub_en='Install as an app — Windows · Mac · Chrome or Edge', sub_ar='ثبّتوا منصة الطالب كتطبيق — ويندوز · ماك · كروم أو Edge', steps=pc_steps,
        tip_en='💡 <span>Why install?</span> Lumio opens in its own clean window — no tabs, no distractions during class — and the icon is always one click away for the student.',
        tip_ar='لماذا التثبيت؟ يفتح Lumio في نافذة مستقلة ونظيفة — بلا تبويبات أو مشتتات أثناء الحصة — والأيقونة دائماً على بُعد ضغطة واحدة للطالب.'),
}

def screenshots():
    from playwright.sync_api import sync_playwright
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8799"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1.5)
    try:
        with sync_playwright() as p:
            b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
            for name, vw, vh, dsf in [("phone", 390, 700, 2), ("ipad", 820, 900, 1), ("desk", 1280, 720, 1)]:
                pg = b.new_page(viewport={"width": vw, "height": vh}, device_scale_factor=dsf)
                pg.route("**/script.google.com/**", lambda r, q: r.fulfill(status=200, content_type="application/json", body='{"ok":false}'))
                pg.goto("http://localhost:8799/login.html"); pg.wait_for_timeout(1500)
                # hide the offline/sync notice the mocked backend triggers
                pg.evaluate("const s = document.getElementById('pinError'); if (s) s.style.display = 'none';")
                pg.wait_for_timeout(200)
                pg.screenshot(path=str(TMP / f"login_{name}.png")); pg.close()
            b.close()
    finally: srv.terminate()

def render(key, cfg):
    from playwright.sync_api import sync_playwright
    html = page(cfg["title"], cfg["sub_en"], cfg["sub_ar"], cfg["steps"](), cfg["tip_en"], cfg["tip_ar"])
    (OUT / f"install-lumio-app-{key}.src.html").write_text(html)
    html = (html.replace("FONTS/", f"file://{FONTS}/")
        .replace('src="LOGO"', f'src="{du(ROOT / "assets/logo/lumio-logo.png")}"')
        .replace('src="ICON"', f'src="{du(ROOT / "assets/logo/favicon-192.png")}"')
        .replace('src="QR"', f'src="{du(ROOT / "_docs/manuals-src/assets/qr-website.png")}"')
        .replace('src="SHOT_PHONE"', f'src="{du(TMP / "login_phone.png")}"')
        .replace('src="SHOT_IPAD"', f'src="{du(TMP / "login_ipad.png")}"')
        .replace('src="SHOT_DESK"', f'src="{du(TMP / "login_desk.png")}"'))
    inl = TMP / f"{key}.html"; inl.write_text(html)
    frames = []
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
        pg = b.new_page(viewport={"width": 1080, "height": 1000}, device_scale_factor=2)
        pg.goto(f"file://{inl}"); pg.wait_for_timeout(1000)
        pg.screenshot(path=str(OUT / f"install-lumio-app-{key}.png"), full_page=True)
        H = pg.evaluate("document.body.scrollHeight"); pg.set_viewport_size({"width": 1080, "height": H}); pg.wait_for_timeout(300)
        pg.screenshot(path=str(TMP / f"{key}_header.png"), clip={"x": 0, "y": 0, "width": 1080, "height": 200})
        for i, el in enumerate(pg.query_selector_all(".step, .tip")):
            bb = el.bounding_box(); f = TMP / f"{key}_f{i}.png"
            pg.screenshot(path=str(f), clip={"x": bb["x"] - 24, "y": bb["y"] - 24, "width": bb["width"] + 48, "height": bb["height"] + 32}); frames.append(f)
        b.close()
    video(key, frames)

def video(key, frames):
    from PIL import Image
    W, H = 1080, 1920
    hdr = Image.open(TMP / f"{key}_header.png").convert("RGB"); hdr = hdr.resize((W, int(hdr.height * W / hdr.width)))
    full = Image.open(OUT / f"install-lumio-app-{key}.png").convert("RGB"); s = W / full.width
    slides = [TMP / f"{key}_s0.png"]; full.resize((W, int(full.height * s))).crop((0, 0, W, H)).save(slides[0])
    for i, f in enumerate(frames):
        im = Image.new("RGB", (W, H), (255, 243, 222)); im.paste(hdr, (0, 0))
        card = Image.open(f).convert("RGB"); sc = min((W - 60) / card.width, (H - hdr.height - 120) / card.height)
        card = card.resize((int(card.width * sc), int(card.height * sc)))
        im.paste(card, ((W - card.width) // 2, hdr.height + (H - hdr.height - card.height) // 2))
        p = TMP / f"{key}_s{i+1}.png"; im.save(p); slides.append(p)
    n = len(slides)
    cmd = ["ffmpeg", "-y", "-loglevel", "error"]
    for p in slides: cmd += ["-loop", "1", "-t", "4", "-i", str(p)]
    fc = "".join(f"[{i}:v]fade=t=in:st=0:d=0.4,fade=t=out:st=3.6:d=0.4,format=yuv420p[v{i}];" for i in range(n)) + "".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[v]"
    cmd += ["-filter_complex", fc, "-map", "[v]", "-r", "30", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(OUT / f"install-lumio-app-{key}.mp4")]
    subprocess.run(cmd, check=True)

if __name__ == "__main__":
    keys = sys.argv[1:] or list(GUIDES)
    screenshots()
    for k in keys: render(k, GUIDES[k]); print("built", k)
    # keep the original Chrome file names for links already shared
    for ext in ("png", "mp4", "src.html"):
        src = OUT / f"install-lumio-app-android-chrome.{ext}"
        if src.exists(): shutil.copy(src, OUT / f"install-lumio-app-chrome.{ext}")
