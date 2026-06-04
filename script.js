'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== PARTICLES BACKGROUND =====
function createParticles() {
    if (prefersReducedMotion) return;
    const container = document.getElementById('particles');
    const count = window.innerWidth < 768 ? 12 : 20;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
        particle.style.animationDelay = Math.random() * 10 + 's';
        const size = (Math.random() * 4 + 1) + 'px';
        particle.style.width = size;
        particle.style.height = size;
        fragment.appendChild(particle);
    }
    container.appendChild(fragment);
}

// ===== TYPING EFFECT =====
const typingTexts = [
    "Mỗi ngày, hàng triệu học sinh phải đối mặt với áp lực...",
    "75% học sinh THPT cảm thấy căng thẳng vì học tập...",
    "Stress học đường đang trở thành cuộc khủng hoảng thầm lặng...",
    "Đã đến lúc chúng ta cần quan tâm đến bản thân đúng cách!"
];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingTimer = null;

function typeText() {
    const element = document.getElementById('typingText');
    if (!element || document.hidden) return;
    const currentText = typingTexts[textIndex];

    if (!isDeleting) {
        element.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === currentText.length) {
            isDeleting = true;
            typingTimer = setTimeout(typeText, 2000);
            return;
        }
    } else {
        element.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % typingTexts.length;
        }
    }

    typingTimer = setTimeout(typeText, isDeleting ? 30 : 60);
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden && typingTimer) {
        clearTimeout(typingTimer);
        typingTimer = null;
    } else if (!document.hidden && !typingTimer && !prefersReducedMotion) {
        typingTimer = setTimeout(typeText, 500);
    }
});

// ===== NUMBER ANIMATION (supports decimals) =====
function animateNumber(element) {
    if (prefersReducedMotion) {
        const target = parseFloat(element.dataset.target);
        const decimals = parseInt(element.dataset.decimals) || 0;
        element.textContent = target.toFixed(decimals);
        return;
    }
    const target = parseFloat(element.dataset.target);
    const decimals = parseInt(element.dataset.decimals) || 0;
    const duration = 2000;
    const start = performance.now();

    if (element._animFrame) cancelAnimationFrame(element._animFrame);

    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = (target * eased).toFixed(decimals);
        if (progress < 1) {
            element._animFrame = requestAnimationFrame(tick);
        } else {
            element.textContent = target.toFixed(decimals);
            element._animFrame = null;
        }
    }
    element._animFrame = requestAnimationFrame(tick);
}

// ===== SCROLL ANIMATIONS =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const target = entry.target;

        if (target.classList.contains('stat-card')) {
            const delay = parseInt(target.dataset.delay) || 0;
            setTimeout(() => {
                target.classList.add('visible');
                const number = target.querySelector('.stat-number');
                if (number && !number.dataset.animated) {
                    animateNumber(number);
                    number.dataset.animated = 'true';
                }
            }, delay);
            revealObserver.unobserve(target);
        }

        if (target.classList.contains('comparison-section')) {
            target.querySelectorAll('.bar-fill').forEach(bar => {
                bar.style.width = bar.dataset.width + '%';
            });
            revealObserver.unobserve(target);
        }

        if (target.classList.contains('intro-content') || target.id === 'statsNote') {
            target.classList.add('visible');
            revealObserver.unobserve(target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

document.querySelectorAll('.stat-card, .comparison-section, .intro-content').forEach(el => {
    revealObserver.observe(el);
});

const statsNote = document.getElementById('statsNote');
if (statsNote) revealObserver.observe(statsNote);

// ===== PROGRESS BAR & NAV DOTS =====
const progressBar = document.getElementById('progressBar');
const navDots = document.querySelectorAll('.nav-dot');
const navSectionIds = ['intro', 'stats', 'definition', 'symptoms', 'interactive-story'];
let scrollPending = false;
let lastProgress = -1;

function updateProgressBar() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    if (Math.abs(progress - lastProgress) > 0.5) {
        progressBar.style.width = progress + '%';
        lastProgress = progress;
    }
    scrollPending = false;
}

window.addEventListener('scroll', () => {
    if (!scrollPending) {
        scrollPending = true;
        requestAnimationFrame(updateProgressBar);
    }
}, { passive: true });

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const index = navSectionIds.indexOf(entry.target.id);
        if (index < 0) return;
        navDots.forEach(d => d.classList.remove('active'));
        navDots[index].classList.add('active');
    });
}, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

navSectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) navObserver.observe(el);
});

// ===== NAVIGATION =====
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}

// ===== TABS =====
function switchTab(tabName, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.getElementById('tab-' + tabName).classList.add('active');
    if (btn) btn.classList.add('active');
}

// ===== QUIZ =====
let quizScore = 0;
let currentQuestion = 0;
const totalQuestions = 5;

function selectAnswer(button) {
    const question = button.closest('.quiz-question');
    if (question.querySelector('.quiz-option.selected')) return;

    const score = parseInt(button.dataset.score);
    quizScore += score;

    question.querySelectorAll('.quiz-option').forEach(opt => {
        opt.style.pointerEvents = 'none';
    });
    button.classList.add('selected');

    const dots = document.querySelectorAll('.quiz-dot');
    dots[currentQuestion].classList.add('answered');
    dots[currentQuestion].classList.remove('active');

    currentQuestion++;

    if (currentQuestion < totalQuestions) {
        dots[currentQuestion].classList.add('active');
        setTimeout(() => {
            question.classList.remove('active');
            document.querySelectorAll('.quiz-question')[currentQuestion].classList.add('active');
        }, 500);
    } else {
        setTimeout(showResult, 800);
    }
}

function showResult() {
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('quizProgress').style.display = 'none';
    const result = document.getElementById('quizResult');
    result.classList.add('active');

    const scoreEl = document.getElementById('resultScore');
    const levelEl = document.getElementById('resultLevel');
    const adviceEl = document.getElementById('resultAdvice');

    scoreEl.textContent = quizScore + '/' + (totalQuestions * 3);

    if (quizScore <= 3) {
        scoreEl.style.color = 'var(--primary-green)';
        levelEl.textContent = '🟢 Mức độ stress: THẤP';
        levelEl.style.color = 'var(--primary-green)';
        adviceEl.textContent = 'Tuyệt vời! Bạn đang quản lý stress khá tốt. Hãy duy trì lối sống lành mạnh và tiếp tục các thói quen tích cực!';
    } else if (quizScore <= 7) {
        scoreEl.style.color = 'var(--primary-orange)';
        levelEl.textContent = '🟡 Mức độ stress: TRUNG BÌNH';
        levelEl.style.color = 'var(--primary-orange)';
        adviceEl.textContent = 'Bạn đang ở mức stress trung bình. Hãy thử các phương pháp thư giãn như thiền, tập thể dục, và chia sẻ với bạn bè/người thân.';
    } else {
        scoreEl.style.color = 'var(--primary-red)';
        levelEl.textContent = '🔴 Mức độ stress: CAO';
        levelEl.style.color = 'var(--primary-red)';
        adviceEl.textContent = '⚠️ Bạn đang trải qua mức stress cao. Vui lòng tìm kiếm sự giúp đỡ từ chuyên gia tâm lý, giáo viên tư vấn, hoặc người thân. Bạn không cô đơn!';
    }
}

function resetQuiz() {
    quizScore = 0;
    currentQuestion = 0;
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('quizProgress').style.display = 'flex';
    document.getElementById('quizResult').classList.remove('active');

    document.querySelectorAll('.quiz-question').forEach((q, i) => {
        q.classList.remove('active');
        q.querySelectorAll('.quiz-option').forEach(opt => {
            opt.style.pointerEvents = 'auto';
            opt.classList.remove('selected');
        });
        if (i === 0) q.classList.add('active');
    });

    document.querySelectorAll('.quiz-dot').forEach((dot, i) => {
        dot.classList.remove('answered', 'active');
        if (i === 0) dot.classList.add('active');
    });
}

// ===== INTERACTIVE STORY =====
const storyScenes = [
    {
        outcomes: {
            0: {
                type: 'bad',
                title: '⚠️ Hậu quả: Kiệt sức',
                text: 'Minh thức đến 2h sáng. Hôm sau làm bài kiểm tra với cái đầu rỗng tuếch, chỉ được 5 điểm. Cơ thể Minh bắt đầu phát tín hiệu: đau đầu, tim đập nhanh.',
                stat: '77% học sinh thiếu ngủ vì stress - PMC9169886'
            },
            1: {
                type: 'good',
                title: '✅ Lựa chọn thông minh',
                text: 'Minh ngủ 7 tiếng. Sáng dậy sớm ôn bài với đầu óc minh mẫn. Bài kiểm tra đạt 8 điểm. Cơ thể được nghỉ ngơi giúp não bộ ghi nhớ tốt hơn.',
                stat: 'Giấc ngủ đủ giúp tăng 40% khả năng tập trung'
            },
            2: {
                type: 'neutral',
                title: '⚡ Cái bẫy "5 phút"',
                text: 'Minh lướt TikTok 2 tiếng. 1h sáng mới ngủ. Sáng hôm sau vừa mệt vừa hối hận. Đây là cách "đối phó" của 26% học sinh - nhưng nó chỉ làm vấn đề tệ hơn.',
                stat: '26% teens dùng chất kích thích/mạng XH để đối phó - stress.org'
            }
        }
    },
    {
        outcomes: {
            0: {
                type: 'neutral',
                title: '😔 Gánh nặng giữ riêng',
                text: 'Minh cười gượng nhưng trong lòng nặng trĩu. Stress không được chia sẻ sẽ tích tụ. Minh cảm thấy cô đơn giữa đám đông.',
                stat: 'Học sinh ưu tiên tìm bạn bè trước khi tìm chuyên gia'
            },
            1: {
                type: 'good',
                title: '💚 Sức mạnh của sự chia sẻ',
                text: 'Lan lắng nghe và chia sẻ rằng cô cũng từng trải qua điều tương tự. Minh cảm thấy nhẹ lòng hơn rất nhiều. "Bạn không cô đơn" - đó là điều quan trọng nhất.',
                stat: 'Chia sẻ cảm xúc giảm 30% mức độ lo âu'
            },
            2: {
                type: 'bad',
                title: '💔 Cô lập bản thân',
                text: 'Lan bị tổn thương và không dám hỏi lại. Minh mất đi một người có thể giúp đỡ. Sự cáu gắt là dấu hiệu của stress quá mức - 30% học sinh trải qua trầm cảm.',
                stat: '30% teens cảm thấy trầm cảm vì stress - stress.org'
            }
        }
    },
    {
        outcomes: {
            0: {
                type: 'good',
                title: '🌟 Cân bằng là chìa khóa',
                text: '30 phút vận động giúp Minh giải phóng endorphin, giảm cortisol. Về nhà, Minh làm bài nhanh hơn và hiệu quả hơn. Cơ thể và tâm trí cần được "sạc pin".',
                stat: 'Vận động 30 phút/ngày giảm 48% nguy cơ trầm cảm'
            },
            1: {
                type: 'bad',
                title: '🔥 Burnout đang đến gần',
                text: 'Minh làm bài đến 1h sáng, nhưng chất lượng rất kém. Não bộ mệt mỏi không thể tập trung. Đây là con đường dẫn đến kiệt sức - burnout.',
                stat: 'Làm việc liên tục không nghỉ giảm 60% hiệu suất'
            },
            2: {
                type: 'neutral',
                title: '📱 Thư giãn "giả tạo"',
                text: 'Minh vừa đi vừa lướt mạng, nhưng không thực sự thư giãn. Não vẫn bị kích thích bởi thông tin. Đây không phải là "self-care" thực sự.',
                stat: 'Lướt MXH quá mức làm tăng 25% cảm giác lo âu'
            }
        }
    },
    {
        outcomes: {
            0: {
                type: 'good',
                title: '💝 Kết nối gia đình',
                text: 'Mẹ Minh bất ngờ nhưng ôm con và nói: "Mẹ xin lỗi, mẹ không biết con đang chịu đựng như vậy." Minh cảm thấy được yêu thương và nhẹ lòng hơn rất nhiều.',
                stat: 'Học sinh có sự hỗ trợ gia đình giảm 50% nguy cơ trầm cảm'
            },
            1: {
                type: 'neutral',
                title: '🤐 Im lặng - con dao hai lưỡi',
                text: 'Bữa cơm im lặng. Mẹ Minh cảm nhận có điều gì đó nhưng không biết là gì. Minh tiếp tục chịu đựng một mình. Stress không được nói ra sẽ ăn mòn từ bên trong.',
                stat: '40% học sinh cảm thấy tuyệt vọng kéo dài'
            },
            2: {
                type: 'bad',
                title: '💥 Xung đột leo thang',
                text: 'Mẹ Minh sốc và buồn. Không khí gia đình căng thẳng. Minh vừa thấy tội lỗi vừa ấm ức. Mối quan hệ với bố mẹ rạn nứt, làm stress càng thêm nặng.',
                stat: 'Xung đột gia đình làm tăng gấp đôi nguy cơ stress nặng'
            }
        }
    },
    {
        outcomes: {
            0: {
                type: 'bad',
                title: '🚨 Vòng xoáy kiệt sức',
                text: 'Minh ngồi 8 tiếng nhưng chỉ làm được 30% công việc. Não bộ tê liệt, không thể tiếp thu. Cuối tuần trôi qua trong mệt mỏi và tội lỗi. Đây là dấu hiệu burnout rõ ràng.',
                stat: '32% sinh viên có lo âu vừa-nặng - Springer s40359-025'
            },
            1: {
                type: 'good',
                title: '🌱 Self-care đúng nghĩa',
                text: 'Buổi sáng vẽ tranh giúp Minh tìm lại niềm vui. Chiều học với tâm thế thoải mái, Minh hoàn thành bài luận xuất sắc. "Quan tâm bản thân không phải là ích kỷ - đó là điều kiện cần để bền bỉ."',
                stat: 'Self-care giúp tăng 35% hiệu suất học tập'
            },
            2: {
                type: 'neutral',
                title: '⏸️ Trú ẩn tạm thời',
                text: 'Minh xem phim cả ngày nhưng vẫn cảm thấy trống rỗng. Đây là "trốn tránh" chứ không phải "self-care". Ngày hôm sau, đống bài tập vẫn còn đó, kèm theo cảm giác tội lỗi.',
                stat: 'Trốn tránh làm tăng 40% cảm giác lo âu'
            }
        }
    }
];

let currentScene = 0;
let storyScore = 0;
const totalScenes = 5;

function startStory() {
    const overlay = document.getElementById('pageOverlay');
    overlay.classList.add('active');

    setTimeout(() => {
        document.getElementById('storyHeader').classList.add('hidden');
        document.getElementById('storyIntroText').classList.add('hidden');
        document.getElementById('startButtonContainer').style.display = 'none';

        document.getElementById('storyProgress').classList.add('show');

        const firstScene = document.querySelector('[data-scene="0"]');
        firstScene.classList.add('active');

        setTimeout(() => {
            overlay.classList.remove('active');
            firstScene.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'center'
            });
        }, prefersReducedMotion ? 0 : 600);
    }, 400);
}

function makeChoice(sceneIndex, choiceIndex, type) {
    const outcomeEl = document.getElementById('outcome-' + sceneIndex);
    if (outcomeEl.classList.contains('show')) return;

    const scene = document.querySelector(`[data-scene="${sceneIndex}"]`);
    const choices = scene.querySelectorAll('.choice-btn');
    const outcome = storyScenes[sceneIndex].outcomes[choiceIndex];

    choices.forEach((btn, idx) => {
        btn.classList.add('disabled');
        if (idx === choiceIndex) {
            btn.classList.add('selected-' + type);
        }
    });

    if (type === 'good') storyScore += 2;
    else if (type === 'neutral') storyScore += 1;

    outcomeEl.className = 'scene-outcome show ' + type;
    outcomeEl.innerHTML = `
        <div class="outcome-title">${outcome.title}</div>
        <div class="outcome-text">${outcome.text}</div>
        <div class="outcome-stat">📊 ${outcome.stat}</div>
    `;

    document.getElementById('next-' + sceneIndex).classList.add('show');

    const steps = document.querySelectorAll('.progress-step');
    steps[sceneIndex].classList.remove('active');
    steps[sceneIndex].classList.add('done');
}

let sceneTransitioning = false;

function nextScene() {
    if (sceneTransitioning) return;
    const currentSceneEl = document.querySelector(`[data-scene="${currentScene}"]`);
    
    currentScene++;

    if (currentScene < totalScenes) {
        sceneTransitioning = true;
        currentSceneEl.style.opacity = '0';
        currentSceneEl.style.transform = 'translateY(-30px) scale(0.95)';
        
        setTimeout(() => {
            currentSceneEl.classList.remove('active');
            currentSceneEl.style.display = 'none';
            currentSceneEl.style.opacity = '';
            currentSceneEl.style.transform = '';
            
            const nextSceneEl = document.querySelector(`[data-scene="${currentScene}"]`);
            nextSceneEl.style.display = 'block';
            nextSceneEl.classList.add('active');
            
            document.querySelectorAll('.progress-step')[currentScene].classList.add('active');
            
            nextSceneEl.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'center'
            });
            sceneTransitioning = false;
        }, prefersReducedMotion ? 0 : 400);
    } else {
        const overlay = document.getElementById('pageOverlay');
        overlay.classList.add('active');
        
        setTimeout(() => {
            currentSceneEl.style.display = 'none';
            document.getElementById('storyProgress').classList.remove('show');
            
            showStoryFinal();
            
            setTimeout(() => {
                overlay.classList.remove('active');
                document.getElementById('storyFinal').scrollIntoView({
                    behavior: prefersReducedMotion ? 'auto' : 'smooth',
                    block: 'center'
                });
            }, prefersReducedMotion ? 0 : 600);
        }, 400);
    }
}

function showStoryFinal() {
    const finalEl = document.getElementById('storyFinal');
    finalEl.classList.add('show');

    const iconEl = document.getElementById('finalIcon');
    const titleEl = document.getElementById('finalTitle');
    const scoreEl = document.getElementById('finalScore');
    const messageEl = document.getElementById('finalMessage');

    scoreEl.innerHTML = `Điểm self-care của bạn: <strong>${storyScore}/${totalScenes * 2}</strong>`;

    if (storyScore >= 8) {
        iconEl.textContent = '🌟';
        titleEl.textContent = 'Thật tuyệt vời... Giữa muôn vàn áp lực, bạn vẫn chọn đứng về phía bản thân.';
        titleEl.style.background = 'linear-gradient(135deg, var(--primary-green), #27ae60)';
        titleEl.style.webkitBackgroundClip = 'text';
        titleEl.style.webkitTextFillColor = 'transparent';
        messageEl.innerHTML = `
            <strong>🎉 Bạn là một "self-care master"!</strong><br><br>
            Bạn hiểu rằng: <em>"Quan tâm bản thân không phải là phần thưởng khi hoàn thành mọi việc - 
            mà là điều kiện cần để có thể hoàn thành mọi việc."</em><br><br>
            Những lựa chọn của bạn cho thấy bạn biết cân bằng giữa học tập và sức khỏe, 
            biết chia sẻ và tìm kiếm sự giúp đỡ. Đây chính là chìa khóa để vượt qua stress học đường.
        `;
    } else if (storyScore >= 4) {
        iconEl.textContent = '🌤️';
        titleEl.textContent = 'Khá ổn áp rồi! Nhưng đôi khi bạn vẫn "vô tình" bỏ quên bản thân một chút đúng không?';
        titleEl.style.background = 'linear-gradient(135deg, var(--primary-orange), #e67e22)';
        titleEl.style.webkitBackgroundClip = 'text';
        titleEl.style.webkitTextFillColor = 'transparent';
        messageEl.innerHTML = `
            <strong>💡 Bạn đang ở giữa hành trình!</strong><br><br>
            Bạn có những khoảnh khắc biết quan tâm bản thân, nhưng cũng có lúc bỏ quên chính mình. 
            Điều này rất phổ biến - <strong>37% sinh viên</strong> cũng đang trải qua trạng thái tương tự.<br><br>
            Hãy nhớ: <em>"Bạn không cần phải hoàn hảo mới xứng đáng được yêu thương. 
            Bạn xứng đáng được quan tâm ngay cả khi đang mệt mỏi."</em>
        `;
    } else {
        iconEl.textContent = '💔';
        titleEl.textContent = 'Dừng lại một chút nhé... Hình như bạn đang vô tình bỏ quên chính mình mất rồi.';
        titleEl.style.background = 'linear-gradient(135deg, var(--primary-red), #c0392b)';
        titleEl.style.webkitBackgroundClip = 'text';
        titleEl.style.webkitTextFillColor = 'transparent';
        messageEl.innerHTML = `
            <strong>🫂 Đừng lo, bạn không đơn độc.</strong><br><br>
            Những lựa chọn của bạn cho thấy bạn đang đặt mọi thứ lên trên bản thân mình: 
            điểm số, kỳ vọng, sự hoàn hảo. Nhưng cơ thể và tâm trí bạn đang kêu cứu.<br><br>
            <em>"Stress không phải là dấu hiệu của sự yếu đuối. 
            Nó là tín hiệu rằng bạn đã mạnh mẽ quá lâu."</em><br><br>
            Đã đến lúc dừng lại, hít thở, và bắt đầu quan tâm đến chính mình. 
            Đọc bài viết dưới đây để hiểu rõ hơn về hành trình này.
        `;
    }
}

function restartStory() {
    currentScene = 0;
    storyScore = 0;

    document.querySelectorAll('.story-scene').forEach((scene, i) => {
        scene.style.display = 'none';
        scene.classList.remove('active');
        scene.style.opacity = '';
        scene.style.transform = '';
        scene.querySelectorAll('.choice-btn').forEach(btn => {
            btn.classList.remove('disabled', 'selected-good', 'selected-bad', 'selected-neutral');
        });
    });

    document.querySelectorAll('.scene-outcome').forEach(o => {
        o.classList.remove('show');
        o.innerHTML = '';
    });

    document.querySelectorAll('.next-btn').forEach(btn => btn.classList.remove('show'));

    document.querySelectorAll('.progress-step').forEach((step, i) => {
        step.classList.remove('done', 'active');
        if (i === 0) step.classList.add('active');
    });

    document.getElementById('storyHeader').classList.remove('hidden');
    document.getElementById('storyIntroText').classList.remove('hidden');
    document.getElementById('startButtonContainer').style.display = 'block';
    document.getElementById('storyProgress').classList.remove('show');
    document.getElementById('storyFinal').classList.remove('show');

    document.getElementById('interactive-story').scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
}

function initApp() {
    createParticles();

    if (!prefersReducedMotion) {
        typingTimer = setTimeout(typeText, 1000);
    } else {
        const typingEl = document.getElementById('typingText');
        if (typingEl) typingEl.textContent = typingTexts[0];
    }

    updateProgressBar();
}

// Expose handlers used by inline onclick attributes
window.scrollToSection = scrollToSection;
window.switchTab = switchTab;
window.selectAnswer = selectAnswer;
window.resetQuiz = resetQuiz;
window.startStory = startStory;
window.makeChoice = makeChoice;
window.nextScene = nextScene;
window.restartStory = restartStory;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
