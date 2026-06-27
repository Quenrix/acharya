/* =========================================================
   Acharya Coding School — Chatbot Widget
   Flow: greeting → name → course (radio) → phone → send email → thankyou
   Email via EmailJS (free tier)
   ========================================================= */

(function () {
    'use strict';

    /* ---------- Config ---------- */
    const BOT_NAME = 'Priya';
    const BOT_AVATAR = 'bot.png'; // replace with your counselor photo URL
    const TO_EMAIL = 'acharyacodingschool1@gmail.com';

    // EmailJS config — create free account at emailjs.com
    // Replace these with your actual IDs
    const EMAILJS_SERVICE_ID = 'service_acharya';   // your EmailJS service id
    const EMAILJS_TEMPLATE_ID = 'template_acharya';  // your EmailJS template id
    const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';   // your EmailJS public key

    const COURSES = [
        'Accounts', 'AI Testing', 'Azure Data Engineer', 'Cyber Security',
        'Data Analyst', 'Data Science', 'DevOps', 'Full Stack Development',
        'Java', 'Python', 'SAP (FICO / SD / ABAP)', 'Software Testing',
        'UI/UX Design', 'Cloud Administration'
    ];

    /* ---------- State ---------- */
    let state = { step: 0, name: '', course: '', phone: '' };

    /* ---------- DOM refs ---------- */
    const fab = document.getElementById('chatbotFab');
    const win = document.getElementById('chatbotWindow');
    const msgs = document.getElementById('chatbotMessages');
    const inputEl = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('chatbotSend');
    const inputArea = document.getElementById('chatbotInputArea');
    const closeBtn = document.getElementById('chatbotClose');
    const resetBtn = document.getElementById('chatbotReset');
    const banner = document.getElementById('chatbotBanner');

    if (!fab || !win) return; // guard

    /* ---------- Open / Close ---------- */
    let isOpen = false;
    const openChat = () => {
        isOpen = true;
        win.classList.add('is-open');
        fab.setAttribute('aria-expanded', 'true');
        if (state.step === 0) startConversation();
    };
    const closeChat = () => {
        isOpen = false;
        win.classList.remove('is-open');
        fab.setAttribute('aria-expanded', 'false');
    };

    fab.addEventListener('click', (e) => { e.stopPropagation(); isOpen ? closeChat() : openChat(); });
    closeBtn?.addEventListener('click', closeChat);
    resetBtn?.addEventListener('click', () => {
        state = { step: 0, name: '', course: '', phone: '' };
        msgs.innerHTML = '';
        setInputMode('hidden');
        startConversation();
    });

    /* ---------- Input mode helpers ---------- */
    const setInputMode = (mode) => {
        // mode: 'text' | 'phone' | 'hidden'
        inputArea.classList.remove('mode-text', 'mode-phone');
        inputEl.value = '';
        if (mode === 'hidden') {
            inputArea.style.display = 'none';
        } else {
            inputArea.style.display = 'flex';
            inputArea.classList.add('mode-' + mode);
            inputEl.placeholder = mode === 'phone' ? 'Type phone number' : 'Type your name…';
            inputEl.type = mode === 'phone' ? 'tel' : 'text';
            setTimeout(() => inputEl.focus(), 100);
        }
    };

    /* ---------- Message builders ---------- */
    const timeStr = () => 'Just now';

    const addBotMsg = (html, showAvatar = true) => {
        const row = document.createElement('div');
        row.className = 'chat-row chat-row--bot';
        row.innerHTML = `
      ${showAvatar ? `<img class="chat-avatar" src="${BOT_AVATAR}" alt="${BOT_NAME}">` : `<span style="width:34px;flex-shrink:0;"></span>`}
      <div class="chat-bubble-wrap">
        <div class="chat-bubble">${html}</div>
        <span class="chat-time">${timeStr()}</span>
      </div>`;
        msgs.appendChild(row);
        scrollBottom();
    };

    const addUserMsg = (text) => {
        const row = document.createElement('div');
        row.className = 'chat-row chat-row--user';
        row.innerHTML = `
      <div class="chat-bubble-wrap">
        <div class="chat-bubble">${text}</div>
        <span class="chat-time">${timeStr()}</span>
      </div>`;
        msgs.appendChild(row);
        scrollBottom();
    };

    const addTyping = () => {
        const row = document.createElement('div');
        row.className = 'chat-row chat-row--bot chat-typing-row';
        row.innerHTML = `
      <img class="chat-avatar" src="${BOT_AVATAR}" alt="${BOT_NAME}">
      <div class="chat-typing">
        <div class="chat-typing-dots"><span></span><span></span><span></span></div>
      </div>`;
        msgs.appendChild(row);
        scrollBottom();
        return row;
    };

    const removeTyping = () => {
        const el = msgs.querySelector('.chat-typing-row');
        if (el) el.remove();
    };

    const botReply = (html, delay = 900, showAvatar = true) => {
        return new Promise(resolve => {
            const t = addTyping();
            setTimeout(() => {
                t.remove();
                addBotMsg(html, showAvatar);
                resolve();
            }, delay);
        });
    };

    const scrollBottom = () => {
        setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 50);
    };

    /* ---------- Course options ---------- */
    const addCourseOptions = () => {
        const wrap = document.createElement('div');
        wrap.className = 'chat-row chat-row--bot';
        wrap.innerHTML = `<span style="width:34px;flex-shrink:0;"></span><div class="chat-options" id="courseOptions"></div>`;
        msgs.appendChild(wrap);
        const opts = wrap.querySelector('#courseOptions');
        COURSES.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'chat-option';
            btn.innerHTML = `<span class="radio-dot"></span>${c}`;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                opts.querySelectorAll('.chat-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                state.course = c;
                setTimeout(() => {
                    wrap.remove();
                    addUserMsg(c);
                    state.step = 3;
                    askPhone();
                }, 350);
            });
            opts.appendChild(btn);
        });
        scrollBottom();
    };

    /* ---------- Conversation steps ---------- */
    const startConversation = async () => {
        setInputMode('hidden');
        await botReply('Hello! May I have a moment to chat with you?');
        // Show Yes button
        const yesRow = document.createElement('div');
        yesRow.className = 'chat-row chat-row--bot';
        yesRow.innerHTML = `<span style="width:34px;flex-shrink:0;"></span>
      <div class="chat-options">
        <button class="chat-option" id="yesBtn"><span class="radio-dot"></span>Yes</button>
        <button class="chat-option" id="noBtn"><span class="radio-dot"></span>No, thanks</button>
      </div>`;
        msgs.appendChild(yesRow);
        scrollBottom();

        document.getElementById('yesBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            yesRow.remove();
            addUserMsg('Yes');
            state.step = 1;
            askName();
        });
        document.getElementById('noBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            yesRow.remove();
            addUserMsg('No, thanks');
            botReply('No problem! Feel free to reach out anytime. 😊');
        });
    };

    const askName = async () => {
        await botReply('May I know your full name, please?');
        setInputMode('text');
    };

    const askCourse = async () => {
        await botReply(`Thank you, <strong>${state.name}</strong>. Which course interests you the most right now?`);
        setInputMode('hidden');
        addCourseOptions();
    };

    const askPhone = async () => {
        await botReply('Can you share your mobile number? Our counselor will call you soon with the details.');
        setInputMode('phone');
    };

    const finishConversation = async () => {
        setInputMode('hidden');
        addUserMsg('+91 ' + state.phone);
        await botReply('Thank you! Our counselor will contact you soon. Have a wonderful day! 🎉', 1000);
        // Send email
        sendLeadEmail();
    };

    /* ---------- Handle send ---------- */
    const handleSend = () => {
        const val = inputEl.value.trim();
        if (!val) return;

        if (state.step === 1) {
            // Name step
            if (val.length < 2) { inputEl.placeholder = 'Please enter your name…'; return; }
            state.name = val;
            setInputMode('hidden');
            addUserMsg(val);
            state.step = 2;
            askCourse();

        } else if (state.step === 3) {
            // Phone step
            const digits = val.replace(/\D/g, '');
            if (digits.length < 10) { inputEl.value = ''; inputEl.placeholder = 'Enter valid 10-digit number'; return; }
            state.phone = digits;
            state.step = 4;
            setInputMode('hidden');
            finishConversation();
        }
    };

    sendBtn?.addEventListener('click', handleSend);
    inputEl?.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });

    /* ---------- Send email via EmailJS ---------- */
    const sendLeadEmail = () => {
        // Load EmailJS SDK dynamically
        if (!window.emailjs) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = () => {
                emailjs.init(EMAILJS_PUBLIC_KEY);
                dispatchEmail();
            };
            document.head.appendChild(script);
        } else {
            dispatchEmail();
        }
    };

    const dispatchEmail = () => {
        const templateParams = {
            to_email: TO_EMAIL,
            from_name: state.name,
            course: state.course,
            phone: '+91 ' + state.phone,
            time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        };

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(() => console.log('Lead email sent ✓'))
            .catch(err => {
                // Fallback: open mailto
                console.warn('EmailJS failed, using mailto fallback', err);
                const body = encodeURIComponent(
                    `New Lead from Chatbot\n\nName: ${state.name}\nCourse: ${state.course}\nPhone: +91 ${state.phone}\nTime: ${new Date().toLocaleString('en-IN')}`
                );
                window.open(`mailto:${TO_EMAIL}?subject=New+Lead+-+${encodeURIComponent(state.name)}&body=${body}`);
            });
    };

})();