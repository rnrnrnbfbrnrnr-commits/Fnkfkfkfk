// ==UserScript==
// @name         ياسين تيفي وكورا - النسخة المدمجة الفائقة V15.0 (IPTV الجانبي وإبادة الإعلانات)
// @namespace    http://tampermonkey.net/
// @version      15.0
// @description  دمج صفحة المباريات السينمائية الفاخرة مع نظام IPTV القنوات الجانبي (يسار) وزر الإخفاء التفاعلي مع تدمير شامل للإعلانات والمودال
// @author       Ahmed PRO & Gemini
// @match        *://*.yacinetv.watch/*
// @match        *://*.smartagro.mov/*
// @match        *://*.sport24wire.com/*
// @match        *://*.kora-plus.app/*
// @match        *://*/*
// @exclude      *://*.google.com/*
// @exclude      *://*.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // ─── 1. تعطيل وتجميد محركات إعلانات جوجل والمنبثقات برمجياً ───
    try {
        Object.defineProperty(window, 'adsbygoogle', {
            value: { push: function() { /* قتل الإعلانات */ } },
            writable: false, configurable: false
        });
        window.googletag = { cmd: [], config: function(){}, defineOutOfPageSlot: function(){ return { addService: function(){}, setConfig: function(){} }; }, pubads: function(){ return { addEventListener: function(){} }; }, enableServices: function(){}, display: function(){} };
    } catch(e) {}

    function freezePopups(targetWindow) {
        try {
            Object.defineProperty(targetWindow, 'open', {
                value: function() { return null; },
                writable: false, configurable: false
            });
            targetWindow.HTMLAnchorElement.prototype.click = function() { return false; };
        } catch(e) {}
    }
    freezePopups(window);

    // ─── 2. حقن الـ CSS السينمائي والهيكلي الشامل (المباريات + القنوات الجانبية) ───
    const style = document.createElement('style');
    style.innerHTML = `
        /* 🛑 إبادة وحظر نوافذ المكافآت (Rewarded Ads) والمودال والإعلانات */
        #rewardModal, .modal, .modal-content, ins[id*="rewarded"], div[id*="rewarded"], iframe[id*="rewarded"],
        [id*="gpt_unit"], [class*="modal-open"], #kk-adblock-overlay, #kk-adblock-box,
        div[style*="min-height: 120px"], div[style*="background:#f8f9fa"], div[style*="background: rgb(248, 249, 250)"],
        ins.adsbygoogle, iframe[id*="aswift"], iframe[name*="aswift"], [id*="google_ads"], [class*="banner"] {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            position: absolute !important;
            z-index: -9999 !important;
            pointer-events: none !important;
            padding: 0 !important;
            margin: 0 !important;
        }

        /* 🛑 إخفاء الهياكل النصية والمقالات وعناصر التشويش الخارجية لتركيز الساحة */
        body > nav, body > footer, body > div:nth-child(1), body > div:nth-child(2),
        main.wrap > section, .wrap > section, .rtl-section, .ltr-section,
        #why-heading, #coverage-ar-heading, #coverage-en-heading,
        header, footer, sidebar, .sidebar, nav, .nav, .share, .comments, .related-posts, 
        .col-lg-3, .col-md-4, #masthead, #colophon, br,
        .article-content p, .article-content h2, .article-content h3, article h2, article p {
            display: none !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        /* 🔓 تأمين فك قفل التصفح والسكرول */
        body, html, body.modal-open {
            overflow: auto !important;
            height: auto !important;
            max-height: none !important;
            position: static !important;
            top: 0 !important;
            pointer-events: auto !important;
        }

        /* 🌆 إعادة بناء الخلفية السينمائية الفاخرة للسينما الرياضية */
        html, body {
            background-color: #0b0b0d !important;
            background-image: radial-gradient(circle at top, #1c1313 0%, #0b0b0d 100%) !important;
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Cairo', system-ui, -apple-system, sans-serif !important;
            color: #ffffff !important;
        }

        /* ─── قسم أ: تنسيق صفحة جدول المباريات الرئيسية ─── */
        main.wrap, .wrap {
            max-width: 650px !important;
            margin: 0 auto !important;
            padding: 25px 15px !important;
            display: block !important;
            min-height: 100vh !important;
            box-sizing: border-box !important;
        }

        .date-bar {
            background: rgba(255, 255, 255, 0.03) !important;
            border: 1px solid rgba(255, 255, 255, 0.06) !important;
            backdrop-filter: blur(10px) !important;
            padding: 16px !important;
            border-radius: 16px !important;
            text-align: center !important;
            margin-bottom: 25px !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        }
        .date-bar h2 {
            margin: 0 0 6px 0 !important;
            font-size: 16px !important;
            color: #f3f4f6 !important;
            font-weight: 600 !important;
        }

        #grid {
            display: grid !important;
            gap: 16px !important;
            width: 100% !important;
        }

        .card {
            border: 1px solid rgba(255, 255, 255, 0.05) !important;
            background: #141418 !important;
            border-radius: 16px !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25) !important;
            transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease !important;
            text-decoration: none !important;
            overflow: hidden !important;
        }
        .card:hover {
            transform: translateY(-3px) !important;
            border-color: rgba(234, 32, 39, 0.5) !important;
            box-shadow: 0 12px 35px rgba(234, 32, 39, 0.15) !important;
        }
        .card-body, .card-head, .card-foot, .teams, .team, .center-col, .score, .team-name {
            opacity: 1 !important;
            visibility: visible !important;
        }

        /* ─── قسم ب: تنسيق صفحة البث المباشر والمشغل وعناصر الـ IPTV الجانبية ─── */
        article, .col-lg-9 {
            display: block !important;
            max-width: 950px !important;
            margin: 0 auto !important;
            padding: 20px 15px !important;
            box-sizing: border-box !important;
        }

        /* تصميم مشغل الفيديو السينمائي */
        .custom-inline-embed, .koora-xyz[style*="height"], iframe#match_frame, iframe[src*="player"], video {
            display: block !important;
            width: 100% !important;
            height: 510px !important;
            background: #000000 !important;
            border: 2px solid rgba(255, 255, 255, 0.06) !important;
            border-radius: 16px !important;
            box-shadow: 0 25px 55px rgba(0, 0, 0, 0.8) !important;
            margin-bottom: 20px !important;
        }

        /* تحويل حاوية الأزرار إلى نظام IPTV الجانبي (يسار الشاشة) */
        .iptv-sidebar-active {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            bottom: 0 !important;
            width: 280px !important;
            background: rgba(15, 16, 22, 0.9) !important;
            backdrop-filter: blur(15px) !important;
            -webkit-backdrop-filter: blur(15px) !important;
            border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
            box-shadow: 8px 0 30px rgba(0, 0, 0, 0.7) !important;
            z-index: 99999 !important;
            padding: 70px 15px 20px 15px !important;
            overflow-y: auto !important;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            box-sizing: border-box !important;
        }

        /* كسر تنسيق الشبكة الأصلي ليتوافق عمودياً داخل الـ IPTV */
        .iptv-sidebar-active.bs-g, .iptv-sidebar-active .bs-g {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            width: 100% !important;
        }
        .iptv-sidebar-active .col-6, .iptv-sidebar-active .col-md-6 {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            display: block !important;
        }

        /* عندما يتم إخفاء القائمة الجانبية */
        .iptv-sidebar-hidden {
            transform: translateX(-100%) !important;
        }

        /* تنسيق أزرار القنوات الاحترافية داخل الـ IPTV */
        .iptv-sidebar-active .btn-purple, .iptv-sidebar-active button {
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            padding: 12px 15px !important;
            background: rgba(255, 255, 255, 0.03) !important;
            border: 1px solid rgba(255, 255, 255, 0.06) !important;
            color: #d1d5db !important;
            border-radius: 10px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            width: 100% !important;
            transition: all 0.2s ease !important;
            text-align: right !important;
            gap: 10px !important;
        }
        .iptv-sidebar-active .btn-purple:hover, .iptv-sidebar-active button:hover {
            background: linear-gradient(135deg, #e20e17 0%, #99050b 100%) !important;
            color: #ffffff !important;
            border-color: #e20e17 !important;
            box-shadow: 0 0 15px rgba(226, 14, 23, 0.4) !important;
            transform: translateX(4px) !important;
        }

        /* 🔘 زر الإخفاء والإظهار التفاعلي الطافي الفاخر */
        .iptv-toggle-btn {
            position: fixed !important;
            left: 20px !important;
            top: 15px !important;
            z-index: 100000 !important;
            background: linear-gradient(135deg, #e20e17 0%, #99050b 100%) !important;
            color: white !important;
            border: none !important;
            padding: 10px 16px !important;
            border-radius: 8px !important;
            font-size: 13px !important;
            font-weight: bold !important;
            font-family: 'Cairo', sans-serif !important;
            cursor: pointer !important;
            box-shadow: 0 4px 15px rgba(226, 14, 23, 0.4) !important;
            transition: all 0.2s ease !important;
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            direction: rtl !important;
        }
        .iptv-toggle-btn:hover {
            transform: scale(1.05) !important;
            box-shadow: 0 6px 20px rgba(226, 14, 23, 0.6) !important;
        }

        :root { --plyr-color-main: #e20e17 !important; }
        .plyr { width: 100% !important; height: 100% !important; }
    `;
    if (document.head) { document.head.appendChild(style); } else { document.documentElement.appendChild(style); }

    // ─── 3. ملاحقة وتطهير عناصر الإعلانات وقفل الشاشة ───
    function absoluteAdDestroyer() {
        const adSelectors = [
            '#rewardModal', '.modal', 'ins[id*="rewarded"]', 'div[id*="rewarded"]', 
            'iframe[id*="rewarded"]', '[id*="gpt_unit"]', 'ins.adsbygoogle', 
            'iframe[id*="aswift"]', 'iframe[name*="aswift"]', '#kk-adblock-overlay', 
            '#kk-adblock-box', 'div[style*="min-height: 120px"]', 'div[style*="background:#f8f9fa"]'
        ];
        adSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => el.remove());
        });

        if (document.body) {
            if (document.body.classList.contains('modal-open')) {
                document.body.classList.remove('modal-open');
            }
            document.body.style.setProperty('overflow', 'auto', 'important');
            document.body.style.setProperty('height', 'auto', 'important');
            document.body.style.setProperty('pointer-events', 'auto', 'important');
        }
    }

    // ─── 4. بناء هيكلية الـ IPTV والزر الطافي التفاعلي لقائمة القنوات ───
    let toggleBtn = null;
    function buildIptvLayout() {
        // البحث عن حاويات الأزرار الأصلية للموقع وتحويل مظهرها
        let targetContainer = document.querySelector('.bs-g') || document.querySelector('.koora-xyz:not(.custom-inline-embed)');
        
        if (targetContainer && !targetContainer.classList.contains('iptv-sidebar-active')) {
            targetContainer.classList.add('iptv-sidebar-active');
            
            // إضافة زر الإخفاء / الإظهار الطافي إذا لم يكن موجوداً
            if (!toggleBtn) {
                toggleBtn = document.createElement('button');
                toggleBtn.className = 'iptv-toggle-btn';
                toggleBtn.innerHTML = '📺 إخفاء القنوات';
                document.body.appendChild(toggleBtn);
                
                toggleBtn.addEventListener('click', () => {
                    if (targetContainer.classList.contains('iptv-sidebar-hidden')) {
                        targetContainer.classList.remove('iptv-sidebar-hidden');
                        toggleBtn.innerHTML = '📺 إخفاء القنوات';
                        toggleBtn.style.left = '20px';
                    } else {
                        targetContainer.classList.add('iptv-sidebar-hidden');
                        toggleBtn.innerHTML = '📺 عرض القنوات';
                        toggleBtn.style.left = '20px';
                    }
                });
            }
        }
    }

    // تشغيل العمليات والمراقبة اللحظية للعناصر
    window.addEventListener('DOMContentLoaded', () => {
        absoluteAdDestroyer();
        buildIptvLayout();
        scanForEmbeddedM3u8();
    });
    
    const observer = new MutationObserver(() => {
        absoluteAdDestroyer();
        buildIptvLayout();
        scanForEmbeddedM3u8();
    });
    
    window.addEventListener('load', () => {
        if (document.body) {
            absoluteAdDestroyer();
            buildIptvLayout();
            observer.observe(document.body, { childList: true, subtree: true });
        }
    });

    // ─── 5. اصطياد روابط الـ m3u8 وتشغيل المشغل الفاخر تلقائياً ───
    let currentPlayingUrl = "";
    let globalHlsInstance = null;
    let globalPlyrInstance = null;

    if (window === window.top) {
        window.addEventListener("message", function(event) {
            if (event.data && typeof event.data === "string" && event.data.includes(".m3u8")) {
                injectDynamicPlayer(event.data);
            }
        }, false);
    }

    const origFetch = window.fetch;
    window.fetch = async (...args) => {
        const response = await origFetch(...args);
        if (typeof args[0] === "string" && args[0].includes(".m3u8")) handleM3u8Found(args[0]);
        return response;
    };

    const origOpen = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function(method, url) {
        if (typeof url === 'string' && url.includes('.m3u8')) handleM3u8Found(url);
        return origOpen.apply(this, arguments);
    };

    function scanForEmbeddedM3u8() {
        document.querySelectorAll('iframe').forEach(iframe => {
            try { if (iframe.src && iframe.src.includes('.m3u8')) handleM3u8Found(iframe.src); } catch(e){}
        });
        document.querySelectorAll('video, source').forEach(el => {
            const src = el.src || el.getAttribute('src');
            if (src && src.includes('.m3u8')) handleM3u8Found(src);
        });
    }

    function handleM3u8Found(url) {
        if (window === window.top) { injectDynamicPlayer(url); } else { window.top.postMessage(url, "*"); }
    }

    function injectDynamicPlayer(streamUrl) {
        if (currentPlayingUrl === streamUrl) return;
        currentPlayingUrl = streamUrl;

        let playerContainers = document.querySelectorAll(".koora-xyz");
        let targetPlayerArea = playerContainers.length >= 2 ? playerContainers[1] : (document.getElementById("match_frame")?.parentElement || document.querySelector('.koora-xyz'));

        if (targetPlayerArea) {
            if (globalPlyrInstance) { try { globalPlyrInstance.destroy(); } catch(e){} globalPlyrInstance = null; }
            if (globalHlsInstance) { try { globalHlsInstance.destroy(); } catch(e){} globalHlsInstance = null; }

            targetPlayerArea.innerHTML = "";
            targetPlayerArea.className = "koora-xyz custom-inline-embed";

            const video = document.createElement('video');
            video.id = 'plyr-premium-player';
            video.setAttribute('playsinline', 'true');
            video.crossOrigin = 'anonymous';
            targetPlayerArea.appendChild(video);

            loadAssets().then(() => initializeAdvancedPlayer(video, streamUrl));
        }
    }

    function initializeAdvancedPlayer(videoElement, url) {
        const liveConfig = { controls: ['play-large', 'play', 'mute', 'volume', 'pip', 'fullscreen'], autoplay: true, settings: [] };

        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            globalHlsInstance = new Hls({ maxBufferLength: 15, enableWorker: true, liveSyncDuration: 6 });
            globalHlsInstance.loadSource(url);
            globalHlsInstance.attachMedia(videoElement);
            globalHlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                globalPlyrInstance = new Plyr(videoElement, liveConfig);
                videoElement.play().catch(() => {});
            });
        }
    }

    function loadAsset(type, url) {
        return new Promise((resolve) => {
            if (type === 'link') {
                if (document.querySelector(`link[href="${url}"]`)) return resolve();
                const el = document.createElement('link'); el.rel = 'stylesheet'; el.href = url;
                document.head.appendChild(el); resolve();
            } else {
                if (document.querySelector(`script[src="${url}"]`)) return resolve();
                const el = document.createElement('script'); el.src = url; el.onload = () => resolve();
                document.head.appendChild(el);
            }
        });
    }
    
    function loadAssets() {
        return Promise.all([
            loadAsset('link', 'https://cdn.jsdelivr.net/npm/plyr@3.7.8/dist/plyr.css'),
            loadAsset('script', 'https://cdn.jsdelivr.net/npm/hls.js@1.4.12/dist/hls.min.js')
        ]).then(() => loadAsset('script', 'https://cdn.jsdelivr.net/npm/plyr@3.7.8/dist/plyr.polyfilled.min.js'));
    }
})();
