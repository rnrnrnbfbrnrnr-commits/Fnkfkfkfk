// ==UserScript==

// @name         M3U8 Pure Fullscreen Player Only

// @namespace    http://tampermonkey.net/

// @version      14.0

// @description  تدمير شامل وحقن مشغل بث مباشر ذكي ومستقر جداً ضد التجمّد وبدون إعلانات

// @author       Ahmed PRO & Gemini

// @match        *://*/*

// @run-at       document-start

// @grant        none

// ==/UserScript==

(function() {

    'use strict';

    let isNuked = false;

    // ─── درع الحظر الاستباقي للمنبثقات ───

    function freezePopups(targetWindow) {

        try {

            Object.defineProperty(targetWindow, 'open', {

                value: function() { return null; },

                writable: false,

                configurable: false

            });

            targetWindow.HTMLAnchorElement.prototype.click = function() { return false; };

        } catch(e) {}

    }

    freezePopups(window);

    if (window !== window.top) {

        freezePopups(window.top);

    }

    if (window === window.top) {

        window.addEventListener("message", function(event) {

            if (event.data && typeof event.data === "string" && event.data.includes(".m3u8")) {

                executeAbsoluteNuke(event.data);

            }

        }, false);

    }

    // ─── دالة الإبادة وحقن مشغل البث المستقر ───

    function executeAbsoluteNuke(streamUrl) {

        if (isNuked) return;

        isNuked = true;

        // 1. إيقاف جميع المؤقتات في الخلفية لضمان تنظيف الموقع

        let maxId = setTimeout(function(){}, 0);

        for (let i = 0; i < maxId; i++) {

            clearTimeout(i);

            clearInterval(i);

        }

        // 2. إبادة الـ HTML بالكامل

        document.documentElement.innerHTML = `

            <head>

                <title>📺 Stable Live Stream</title>

                <meta name="viewport" content="width=device-width, initial-scale=1.0">

            </head>

            <body></body>

        `;

        const newBody = document.body.cloneNode(true);

        document.body.parentNode.replaceChild(newBody, document.body);

        // 3. تصميم الواجهة السينمائية (تعديل خاص لإخفاء التوقيت وسرعة التشغيل)

        const style = document.createElement('style');

        style.textContent = `

            html, body {

                background: #000000 !important;

                margin: 0 !important;

                padding: 0 !important;

                width: 100vw !important;

                height: 100vh !important;

                overflow: hidden !important;

                display: flex !important;

                justify-content: center !important;

                align-items: center !important;

                font-family: system-ui, -apple-system, sans-serif;

            }



            .main-player-wrapper {

                width: 100vw;

                height: 100vh;

                position: relative;

                background: #000;

            }

            :root {

                --plyr-color-main: #00ffcc !important;

                --plyr-video-background: #000000 !important;

                --plyr-control-color: #ffffff !important;

                --plyr-control-icon-size: 22px !important;

                --plyr-control-radius: 12px !important;

                --plyr-control-spacing: 16px !important;

            }

            .plyr {

                width: 100% !important;

                height: 100% !important;

                background: #000 !important;

            }

            .plyr__video-wrapper {

                height: 100% !important;

            }

            video {

                object-fit: contain !important;

            }

            /* شريط الأدوات العلوي العائم */

            .top-floating-bar {

                position: absolute;

                top: 25px;

                right: 25px;

                z-index: 10;

                display: flex;

                gap: 12px;

                opacity: 0;

                pointer-events: none;

                transition: opacity 0.3s ease-in-out;

            }

            .main-player-wrapper:hover .top-floating-bar,

            .plyr--paused .top-floating-bar {

                opacity: 1;

                pointer-events: auto;

            }

            .premium-btn {

                background: rgba(10, 10, 10, 0.6) !important;

                color: rgba(255, 255, 255, 0.9) !important;

                border: 1px solid rgba(255, 255, 255, 0.15) !important;

                padding: 10px 18px !important;

                border-radius: 30px !important;

                cursor: pointer !important;

                font-weight: 500 !important;

                font-size: 12px !important;

                backdrop-filter: blur(10px) !important;

                transition: all 0.2s ease !important;

            }

            .premium-btn:hover {

                background: #00ffcc !important;

                color: #000 !important;

                border-color: #00ffcc !important;

                box-shadow: 0 0 15px rgba(0, 255, 204, 0.5) !important;

            }

        `;

        document.head.appendChild(style);

        // 4. بناء الـ DOM للمشغل

        const wrapper = document.createElement('div');

        wrapper.className = 'main-player-wrapper';

        const topBar = document.createElement('div');

        topBar.className = 'top-floating-bar';

        const reloadBtn = document.createElement('button');

        reloadBtn.className = 'premium-btn';

        reloadBtn.innerHTML = '🔄 إعادة تحميل البث';

        reloadBtn.onclick = () => window.location.reload();

        const copyBtn = document.createElement('button');

        copyBtn.className = 'premium-btn';

        copyBtn.innerHTML = '📋 نسخ الرابط';

        copyBtn.onclick = () => {

            navigator.clipboard.writeText(streamUrl);

            copyBtn.innerHTML = '✅ تم نسخ الرابط!';

            setTimeout(() => copyBtn.innerHTML = '📋 نسخ الرابط', 1500);

        };

        topBar.appendChild(reloadBtn);

        topBar.appendChild(copyBtn);

        const video = document.createElement('video');

        video.id = 'plyr-premium-player';

        video.setAttribute('playsinline', 'true');

        video.crossOrigin = 'anonymous';

        wrapper.appendChild(topBar);

        wrapper.appendChild(video);

        document.body.appendChild(wrapper);

        // 5. تحميل مراجع التشغيل الخارجية (Plyr & Hls)

        const loadAsset = (type, url) => {

            return new Promise((resolve) => {

                const el = document.createElement(type);

                if (type === 'link') {

                    el.rel = 'stylesheet';

                    el.href = url;

                    document.head.appendChild(el);

                    resolve();

                } else {

                    el.src = url;

                    el.onload = () => resolve();

                    document.head.appendChild(el);

                }

            });

        };

        const plyrCss = 'https://cdn.jsdelivr.net/npm/plyr@3.7.8/dist/plyr.css';

        const hlsJs = 'https://cdn.jsdelivr.net/npm/hls.js@1.4.12/dist/hls.min.js';

        const plyrJs = 'https://cdn.jsdelivr.net/npm/plyr@3.7.8/dist/plyr.polyfilled.min.js';

        Promise.all([loadAsset('link', plyrCss), loadAsset('script', hlsJs)]).then(() => {

            loadAsset('script', plyrJs).then(() => {

                initializeAdvancedPlayer(video, streamUrl);

            });

        });

    }

    // ─── تهيئة المشغل المطور وضبط استقرار البث ───

    function initializeAdvancedPlayer(videoElement, url) {

        let hlsInstance = null;

        // إعدادات Plyr (تم حذف السرعة، شريط التقدم، وعداد الوقت تماماً)

        const liveConfig = {

            controls: ['play-large', 'play', 'mute', 'volume', 'pip', 'fullscreen'],

            autoplay: true,

            settings: [], // تفريغ الإعدادات لحذف خيار السرعة بشكل كامل

            tooltips: { controls: false, seek: false },

            i18n: {

                play: 'تشغيل',

                pause: 'إيقاف مؤقت',

                mute: 'كتم الصوت',

                unmute: 'إلغاء الكتم',

                enterFullscreen: 'ملء الشاشة',

                exitFullscreen: 'خروج من ملء الشاشة',

                pip: 'صورة داخل صورة'

            }

        };

        if (typeof Hls !== 'undefined' && Hls.isSupported()) {

            // هندسة إعدادات ثبات البث وحظر التجمّد

            hlsInstance = new Hls({

                maxBufferLength: 30,             // حجم المخزن المؤقت بالثواني

                maxMaxBufferLength: 60,          // الحد الأقصى للمخزن في حالات الإنترنت السريع

                enableWorker: true,              // تشغيل العمليات في الخلفية لتخفيف الضغط

                lowLatencyMode: false,           // ❌ تعطيل وضع الاقتراب الشديد لتجنب التوقف

                liveSyncDuration: 12,            // 🛡️ البقاء خلف البث المباشر بـ 12 ثانية كمسافة أمان

                liveMaxLatencyDuration: 25,      // أقصى تأخير مسموح به قبل إعادة الضبط

                manifestLoadingMaxRetry: 5,

                levelLoadingMaxRetry: 5

            });

            hlsInstance.loadSource(url);

            hlsInstance.attachMedia(videoElement);



            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {

                new Plyr(videoElement, liveConfig);

                videoElement.play().catch(() => {});

            });

            // معالجة أخطاء الشبكة الذكية

            hlsInstance.on(Hls.Events.ERROR, function(event, data) {

                if (data.fatal) {

                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {

                        hlsInstance.startLoad();

                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {

                        hlsInstance.recoverMediaError();

                    }

                }

            });

        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {

            videoElement.src = url;

            new Plyr(videoElement, liveConfig);

            videoElement.play().catch(() => {});

        }

        // ─── 🔄 ذكاء الاصطناعي لمنع التعليق المستمر (Anti-Freeze Mechanism) ───

        let stallTimeout = null;

        videoElement.addEventListener('waiting', () => {

            clearTimeout(stallTimeout);

            // إذا تجمّد البث ولم يستجب لمدة 3 ثوانٍ

            stallTimeout = setTimeout(() => {

                if (hlsInstance && hlsInstance.liveSyncPosition) {

                    // القفز الفوري إلى النقطة الحية الآمنة الجديدة وتحديث الاتصال

                    videoElement.currentTime = hlsInstance.liveSyncPosition;

                } else {

                    // حل احتياطي للمتصفحات التي لا تدعم Hls.js بشكل مباشر

                    videoElement.currentTime = videoElement.duration - 12;

                }

            }, 3000);

        });

        // عند عودة البث للعمل بنجاح، نلغي مؤقت الطوارئ

        videoElement.addEventListener('playing', () => {

            clearTimeout(stallTimeout);

        });

    }

    // ─── أدوات اصطياد اتصالات الشبكة الذكية ───

    function reportStreamUrl(url) {

        if (!url) return;

        if (window === window.top) {

            executeAbsoluteNuke(url);

        } else {

            window.top.postMessage(url, "*");

        }

    }

    const origFetch = window.fetch;

    window.fetch = async (...args) => {

        const response = await origFetch(...args);

        try {

            const url = args[0];

            if (typeof url === "string" && url.includes(".m3u8")) {

                reportStreamUrl(url);

            }

        } catch(e) {}

        return response;

    };

    const origOpen = XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.open = function(method, url) {

        if (typeof url === "string" && url.includes(".m3u8")) {

            reportStreamUrl(url);

        }

        return origOpen.apply(this, arguments);

    };

    setInterval(() => {

        performance.getEntries().forEach(entry => {

            if (entry.name && entry.name.includes(".m3u8")) {

                reportStreamUrl(entry.name);

            }

        });

    }, 400);

})();

