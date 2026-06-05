/* ==========================================================================
   INTERACTIVE LOGIC & SCROLL ANIMATIONS (script.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    /* ----------------------------------------------------------------------
       1. SCROLL ANIMATIONS: INTERSECTION OBSERVER
       ---------------------------------------------------------------------- */
    const scrollElements = document.querySelectorAll('.scroll-anim');

    const elementInView = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Once animated, we don't need to observe it again
                observer.unobserve(entry.target);
            }
        });
    };

    // Observer Options
    const observerOptions = {
        root: null, // Viewport
        rootMargin: '0px 0px -60px 0px', // Trigger slightly before element enters viewport completely
        threshold: 0.1 // 10% of the element must be visible
    };

    // Create the Observer
    const observer = new IntersectionObserver(elementInView, observerOptions);

    // Observe each element
    scrollElements.forEach(el => {
        observer.observe(el);
    });

    /* ----------------------------------------------------------------------
       2. INTERACTIVE ACCORDION (FAQ)
       ---------------------------------------------------------------------- */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        
        trigger.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            // Close all FAQ items (Accordion style)
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('open');
                otherItem.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
            });

            // If the clicked item was not open, open it
            if (!isOpen) {
                item.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ----------------------------------------------------------------------
       3. CUSTOM MULTI-AUDIO PLAYER FOR TESTIMONIALS
       ---------------------------------------------------------------------- */
    const audioPlayers = document.querySelectorAll('.audio-testimonial-card');

    audioPlayers.forEach((player) => {
        const playPauseBtn = player.querySelector('.audio-control-btn');
        const playIcon = player.querySelector('.play-icon-class');
        const pauseIcon = player.querySelector('.pause-icon-class');
        const audioFile = player.querySelector('audio');
        const audioTimeline = player.querySelector('.audio-timeline');
        const audioProgress = player.querySelector('.audio-progress');
        const timeCurrent = player.querySelector('.audio-time-current');
        const timeDuration = player.querySelector('.audio-time-duration');

        if (playPauseBtn && audioFile) {
            // Toggle play/pause
            playPauseBtn.addEventListener('click', () => {
                // Pause all other audios first to avoid overlapping sounds
                audioPlayers.forEach((otherPlayer) => {
                    const otherAudio = otherPlayer.querySelector('audio');
                    if (otherAudio && otherAudio !== audioFile && !otherAudio.paused) {
                        otherAudio.pause();
                        otherPlayer.querySelector('.play-icon-class').classList.remove('hidden');
                        otherPlayer.querySelector('.pause-icon-class').classList.add('hidden');
                    }
                });

                if (audioFile.paused) {
                    audioFile.play().catch(err => {
                        console.log("Dica: Certifique-se de que o arquivo de áudio existe no diretório.", err);
                    });
                    playIcon.classList.add('hidden');
                    pauseIcon.classList.remove('hidden');
                } else {
                    audioFile.pause();
                    playIcon.classList.remove('hidden');
                    pauseIcon.classList.add('hidden');
                }
            });

            // Update timeline progress bar and current time text
            audioFile.addEventListener('timeupdate', () => {
                if (audioFile.duration) {
                    const pct = (audioFile.currentTime / audioFile.duration) * 100;
                    audioProgress.style.width = `${pct}%`;
                    timeCurrent.textContent = formatTime(audioFile.currentTime);
                }
            });

            // Display total duration when metadata is ready
            audioFile.addEventListener('loadedmetadata', () => {
                timeDuration.textContent = formatTime(audioFile.duration);
            });

            // Fail-safe: update duration text if metadata was already loaded
            if (audioFile.readyState >= 1) {
                timeDuration.textContent = formatTime(audioFile.duration);
            }

            // Seek timeline click
            audioTimeline.addEventListener('click', (e) => {
                const rect = audioTimeline.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;
                const pct = clickX / width;
                if (audioFile.duration) {
                    audioFile.currentTime = pct * audioFile.duration;
                }
            });

            // Reset player when audio finishes playing
            audioFile.addEventListener('ended', () => {
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
                audioProgress.style.width = '0%';
                timeCurrent.textContent = '0:00';
            });
        }
    });

    function formatTime(seconds) {
        if (isNaN(seconds) || seconds === Infinity) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }


    /* ----------------------------------------------------------------------
       5. PERSISTENT COUNTDOWN TIMER (15m 00s - Evergreen)
       ---------------------------------------------------------------------- */
    const TIMER_DURATION_SEC = 15 * 60; // 15 minutes (900 seconds)
    let targetTime = localStorage.getItem('countdown_target_time_15m');
    const now = Date.now();

    if (!targetTime) {
        targetTime = now + TIMER_DURATION_SEC * 1000;
        localStorage.setItem('countdown_target_time_15m', targetTime);
        // Clean up old timer key if present
        localStorage.removeItem('countdown_target_time');
    } else {
        targetTime = parseInt(targetTime);
        // If expired for more than 30 minutes, reset it to give a second chance
        if (now - targetTime > 30 * 60 * 1000) {
            targetTime = now + TIMER_DURATION_SEC * 1000;
            localStorage.setItem('countdown_target_time_15m', targetTime);
        }
    }

    function updateTimer() {
        const remaining = targetTime - Date.now();

        if (remaining <= 0) {
            clearInterval(timerInterval);
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            
            // Scarcity Copy Trigger when timer hits zero
            const disclaimerElements = document.querySelectorAll('.countdown-disclaimer');
            disclaimerElements.forEach(el => {
                el.innerHTML = '<span style="color: #ef4444; font-weight: 700; display: block; margin-top: 5px; animation: pulse 1s infinite alternate;">⚠️ A OFERTA EXPIROU! O preço voltará para R$ 97,00 a qualquer momento. Garanta sua cópia agora!</span>';
            });
            return;
        }

        const minutesLeft = Math.floor((remaining / 1000 / 60) % 60);
        const secondsLeft = Math.floor((remaining / 1000) % 60);

        const minsStr = minutesLeft < 10 ? '0' + minutesLeft : minutesLeft;
        const secsStr = secondsLeft < 10 ? '0' + secondsLeft : secondsLeft;

        // Update card timer
        const minEl = document.getElementById('minutes');
        const secEl = document.getElementById('seconds');
        if (minEl && secEl) {
            minEl.textContent = minsStr;
            secEl.textContent = secsStr;
        }


    }

    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

    /* ----------------------------------------------------------------------
       6. EXIT-INTENT POPUP LOGIC
       ---------------------------------------------------------------------- */
    let popupShown = false;

    // Check session storage to prevent showing it repeatedly
    if (sessionStorage.getItem('exit_popup_shown') === 'true') {
        popupShown = true;
    }

    const exitPopup = document.getElementById('exit-popup');

    const showExitPopup = () => {
        if (!popupShown && exitPopup) {
            exitPopup.style.display = 'flex';
            // Force browser reflow to animate
            void exitPopup.offsetWidth;
            exitPopup.classList.add('show');
            popupShown = true;
            sessionStorage.setItem('exit_popup_shown', 'true');
        }
    };

    const closeExitPopup = () => {
        if (exitPopup) {
            exitPopup.classList.remove('show');
            setTimeout(() => {
                exitPopup.style.display = 'none';
            }, 300);
        }
    };

    const closeBtn = document.getElementById('close-popup-x');
    const dismissBtn = document.getElementById('popup-dismiss');
    const popupCTA = document.getElementById('popup-cta');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeExitPopup);
    }
    if (dismissBtn) {
        dismissBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeExitPopup();
        });
    }
    if (popupCTA) {
        popupCTA.addEventListener('click', () => {
            closeExitPopup();
        });
    }

    // Close on overlay backdrop click
    if (exitPopup) {
        exitPopup.addEventListener('click', (e) => {
            if (e.target === exitPopup) {
                closeExitPopup();
            }
        });
    }

    // Desktop: Trigger on mouse leaving viewport
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY < 20) {
            showExitPopup();
        }
    });

    // Mobile: Trigger on rapid scroll up
    let lastScrollTop = 0;
    let rapidScrollUpCount = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScroll < lastScrollTop) {
            const delta = lastScrollTop - currentScroll;
            if (delta > 40 && currentScroll < 500) {
                rapidScrollUpCount++;
                if (rapidScrollUpCount > 2) {
                    showExitPopup();
                }
            }
        } else {
            rapidScrollUpCount = 0;
        }
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }, { passive: true });

    // Fallback: Trigger after 25 seconds of session time
    setTimeout(() => {
        showExitPopup();
    }, 25000);

    /* ----------------------------------------------------------------------
       7. MOBILE STICKY CTA VISIBILITY
       ---------------------------------------------------------------------- */
    const mobileStickyCta = document.getElementById('mobile-sticky-cta');
    const heroSection = document.getElementById('home');
    const checkoutSection = document.getElementById('checkout');

    if (mobileStickyCta && heroSection && checkoutSection) {
        let heroOut = false;
        let checkoutIn = false;

        const updateStickyVisibility = () => {
            if (heroOut && !checkoutIn) {
                mobileStickyCta.style.transform = 'translateY(0)';
            } else {
                mobileStickyCta.style.transform = 'translateY(150px)';
            }
        };

        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                heroOut = !entry.isIntersecting;
                updateStickyVisibility();
            });
        }, { threshold: 0.1 });

        const checkoutObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                checkoutIn = entry.isIntersecting;
                updateStickyVisibility();
            });
        }, { threshold: 0.1 });

        heroObserver.observe(heroSection);
        checkoutObserver.observe(checkoutSection);
    }
});
