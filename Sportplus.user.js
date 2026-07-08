// ==UserScript==
// @name         M3U8 Pure Fullscreen Player Only
// @namespace    http://tampermonkey.net/
// @version      11.0
// @description  تدمير شامل وحقن مشغل فيديو نقي يملأ كامل الشاشة بدون أي عناصر موقع
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

    // ─── دالة الإبادة وحقن المشغل الصافي ───
    function executeAbsoluteNuke(streamUrl) {
        if (isNuked) return;
        isNuked = true;

        // 1. إيقاف جميع المؤقتات في الخلفية
        let maxId = setTimeout(function(){}, 0);
        for (let i = 0; i < maxId; i++) {
            clearTimeout(i);
            clearInterval(i);
        }

        // 2. إبادة الـ HTML بالكامل
        document.documentElement.innerHTML = '<head><title>📺 Live Stream</title></head><body></body>';

        // 3. مسح مستمعي الأحداث لضمان عدم ظهور منبثقات عند الضغط
        const newBody = document.body.cloneNode(true);
        document.body.parentNode.replaceChild(newBody, document.body);

        // 4. هندسة تصميم المشغل ليمتد على كامل أبعاد الشاشة 100%
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
            }
            
            .video-fullscreen-container {
                width: 100vw;
                height: 100vh;
                position: relative;
                background: #000;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            video {
                width: 100% !important;
                height: 100% !important;
                background: #000 !important;
                object-fit: contain !important; /* يحافظ على أبعاد البث الأصلية مع شاشة سوداء بالخلفية */
            }

            /* شريط الأدوات العائم الذكي - يظهر فقط عند تحريك الماوس ويختفي تلقائياً */
            .floating-control-bar {
                position: absolute;
                top: 20px;
                right: 20px;
                z-index: 2147483647;
                display: flex;
                gap: 10px;
                opacity: 0;
                vertical-align: middle;
                transition: opacity 0.3s ease-in-out;
            }

            /* إظهار الأزرار عند تحريك الماوس فوق منطقة الفيديو */
            .video-fullscreen-container:hover .floating-control-bar {
                opacity: 1;
            }

            .minimal-btn {
                background: rgba(0, 0, 0, 0.6) !important;
                color: rgba(255, 255, 255, 0.8) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                padding: 8px 14px !important;
                border-radius: 8px !important;
                cursor: pointer !important;
                font-weight: bold !important;
                font-size: 11px !important;
                font-family: sans-serif !important;
                backdrop-filter: blur(5px) !important;
                transition: all 0.2s ease !important;
            }

            .minimal-btn:hover {
                background: #00ffcc !important;
                color: #000 !important;
                border-color: #00ffcc !important;
                box-shadow: 0 0 10px rgba(0, 255, 204, 0.5) !important;
            }
        `;
        document.head.appendChild(style);

        // 5. بناء هيكل العرض الصافي
        const container = document.createElement('div');
        container.className = 'video-fullscreen-container';

        // أزرار مخفية ذكية للمساعدة عند الحاجة (نسخ الرابط / التحديث)
        const floatingBar = document.createElement('div');
        floatingBar.className = 'floating-control-bar';

        const reloadBtn = document.createElement('button');
        reloadBtn.className = 'minimal-btn';
        reloadBtn.innerText = '🔄 إعادة تحميل';
        reloadBtn.onclick = () => window.location.reload();

        const copyBtn = document.createElement('button');
        copyBtn.className = 'minimal-btn';
        copyBtn.innerText = '📋 نسخ الرابط';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(streamUrl);
            copyBtn.innerText = '✅ تم!';
            setTimeout(() => copyBtn.innerText = '📋 نسخ الرابط', 1500);
        };

        floatingBar.appendChild(reloadBtn);
        floatingBar.appendChild(copyBtn);

        const video = document.createElement('video');
        video.id = 'pure-fullscreen-player';
        video.controls = true; // مشغل المتصفح الرسمي النظيف بدون إضافات
        video.autoplay = true;
        video.setAttribute('playsinline', 'true');

        container.appendChild(floatingBar);
        container.appendChild(video);
        document.body.appendChild(container);

        // 6. تشغيل الـ HLS المعزول والمستقر
        const initHls = () => {
            if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                const hls = new Hls({
                    maxMaxBufferLength: 30,
                    enableWorker: true,
                    lowLatencyMode: true,
                    xhrSetup: function(xhr) {
                        xhr.withCredentials = false;
                    }
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play().catch(() => {});
                });
                
                hls.on(Hls.Events.ERROR, function(event, data) {
                    if (data.fatal) {
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
                        else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.play().catch(() => {});
            }
        };

        const hlsLoader = document.createElement('script');
        hlsLoader.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        hlsLoader.onload = initHls;
        document.head.appendChild(hlsLoader);
    }

    // ─── معالج التبليغ عن الرابط ───
    function reportStreamUrl(url) {
        if (!url) return;
        if (window === window.top) {
            executeAbsoluteNuke(url);
        } else {
            window.top.postMessage(url, "*");
        }
    }

    // ─── أدوات اصطياد اتصالات الشبكة ───
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
