// KUBEY Logo Animasyon Script

const logoAnimation = () => {
    const timeline = anime.timeline({
        easing: 'easeOutExpo',
        duration: 1000
    });

    // 1. K harfinin dikey çizgisi
    timeline.add({
        targets: '#k-vertical',
        strokeDashoffset: [1000, 0],
        duration: 800,
        easing: 'easeInOutQuad'
    });

    // 2. K harfinin üst çapraz çizgisi
    timeline.add({
        targets: '#k-diagonal-1',
        strokeDashoffset: [1000, 0],
        duration: 600,
        easing: 'easeInOutQuad'
    }, '-=400');

    // 3. K harfinin alt çapraz çizgisi
    timeline.add({
        targets: '#k-diagonal-2',
        strokeDashoffset: [1000, 0],
        duration: 600,
        easing: 'easeInOutQuad'
    }, '-=400');

    // 4. Dekoratif dairelerin animasyonu
    timeline.add({
        targets: ['#circle-1', '#circle-2', '#circle-3'],
        scale: [0, 1],
        opacity: [0, 1],
        duration: 500,
        delay: anime.stagger(100),
        easing: 'easeOutElastic(1, .8)'
    }, '-=300');

    // 5. Logo dönme ve parlama efekti
    timeline.add({
        targets: '#logo-k',
        rotate: [0, 360],
        duration: 1000,
        easing: 'easeInOutQuad'
    }, '-=200');

    // 6. KUBEY harflerinin animasyonu
    timeline.add({
        targets: '.letter',
        opacity: [0, 1],
        translateY: [30, 0],
        rotateX: [90, 0],
        duration: 800,
        delay: anime.stagger(100),
        easing: 'easeOutExpo'
    }, '-=500');

    // 7. Alt başlık animasyonu
    timeline.add({
        targets: '.tagline-word',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        delay: anime.stagger(150),
        easing: 'easeOutQuad'
    }, '-=400');

    // 8. Partiküllerin animasyonu
    timeline.add({
        targets: '.particle',
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0.8],
        translateY: [0, -50],
        translateX: () => anime.random(-30, 30),
        duration: 2000,
        delay: anime.stagger(100),
        easing: 'easeOutQuad'
    }, '-=1000');

    // 9. Replay butonunu göster
    timeline.add({
        targets: '.replay-btn',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: 'easeOutQuad',
        complete: () => {
            document.querySelector('.replay-btn').classList.add('visible');
        }
    }, '-=500');

    // 10. Logo sürekli yavaş sallanma efekti (animasyon bittikten sonra)
    timeline.add({
        targets: '#logo-k',
        translateY: [0, -10, 0],
        duration: 2000,
        easing: 'easeInOutQuad',
        loop: true
    });

    // Dairelere sürekli pulse efekti
    anime({
        targets: ['#circle-1', '#circle-2', '#circle-3'],
        scale: [1, 1.3, 1],
        duration: 1500,
        delay: anime.stagger(200),
        easing: 'easeInOutQuad',
        loop: true
    });

    return timeline;
};

// Sayfa yüklendiğinde animasyonu başlat
let mainTimeline;
window.addEventListener('DOMContentLoaded', () => {
    mainTimeline = logoAnimation();
});

// Replay butonu işlevi
document.addEventListener('DOMContentLoaded', () => {
    const replayBtn = document.getElementById('replay-btn');
    
    replayBtn.addEventListener('click', () => {
        // Tüm elementleri sıfırla
        anime.remove('#k-vertical, #k-diagonal-1, #k-diagonal-2');
        anime.remove(['#circle-1', '#circle-2', '#circle-3']);
        anime.remove('#logo-k');
        anime.remove('.letter');
        anime.remove('.tagline-word');
        anime.remove('.particle');
        anime.remove('.replay-btn');
        
        // Başlangıç durumlarına dön
        document.querySelectorAll('#k-vertical, #k-diagonal-1, #k-diagonal-2').forEach(el => {
            el.style.strokeDashoffset = '1000';
        });
        
        document.querySelectorAll('#circle-1, #circle-2, #circle-3').forEach(el => {
            el.style.transform = 'scale(0)';
            el.style.opacity = '0';
        });
        
        document.querySelector('#logo-k').style.transform = 'rotate(0deg)';
        
        document.querySelectorAll('.letter').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px) rotateX(90deg)';
        });
        
        document.querySelectorAll('.tagline-word').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
        });
        
        document.querySelectorAll('.particle').forEach(el => {
            el.style.opacity = '0';
        });
        
        replayBtn.style.opacity = '0';
        replayBtn.classList.remove('visible');
        
        // Animasyonu yeniden başlat
        setTimeout(() => {
            mainTimeline = logoAnimation();
        }, 100);
    });
});

// Hover efektleri
document.addEventListener('DOMContentLoaded', () => {
    const letters = document.querySelectorAll('.letter');
    
    letters.forEach((letter, index) => {
        letter.addEventListener('mouseenter', () => {
            anime({
                targets: letter,
                scale: [1, 1.2, 1],
                color: ['#ffffff', '#00D9FF', '#ffffff'],
                duration: 600,
                easing: 'easeOutElastic(1, .6)'
            });
        });
    });
});
