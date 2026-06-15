/*
   JavaScript Logic for КП "Удачный"
   Author: Antigravity CLI Agent
   Description: Controls sliders, tabs, search, modals and mobile menu
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. Mobile Menu Toggler
    // ==========================================
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('open');
            // Change icon
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('open')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                navMenu.classList.remove('open');
                const icon = mobileToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
        });

        // Close menu when clicking links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                const icon = mobileToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            });
        });
    }

    // ==========================================
    // 2. Header Scroll Effect
    // ==========================================
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ==========================================
    // 3. Hero Image Slider (Carousel)
    // ==========================================
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    function startSlideShow() {
        stopSlideShow();
        slideInterval = setInterval(nextSlide, 6000);
    }

    function stopSlideShow() {
        if (slideInterval) clearInterval(slideInterval);
    }

    // Click on dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            startSlideShow(); // reset timer
        });
    });

    // Initialize slideshow
    if (slides.length > 0) {
        showSlide(0);
        startSlideShow();
    }

    // ==========================================
    // 4. Map Tabs (Switching between phases)
    // ==========================================
    const mapTabs = document.querySelectorAll('.map-tab');
    const mapImages = document.querySelectorAll('.map-image');

    mapTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            mapTabs.forEach(t => t.classList.remove('active'));
            mapImages.forEach(img => img.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.dataset.target;
            const targetImg = document.getElementById(targetId);
            if (targetImg) {
                targetImg.classList.add('active');
            }
        });
    });

    // ==========================================
    // 5. Image Zoom modal (With Pan & Zoom controls)
    // ==========================================
    const zoomOverlay = document.getElementById('image-zoom-overlay');
    const zoomedImg = document.getElementById('zoomed-image');
    const zoomCloseBtn = document.getElementById('zoom-close-btn');

    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    // Reset coordinates and scale
    function resetZoom() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
    }

    function updateTransform() {
        if (zoomedImg) {
            zoomedImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        }
    }

    mapImages.forEach(img => {
        img.addEventListener('click', () => {
            if (zoomOverlay && zoomedImg) {
                zoomedImg.src = img.src;
                zoomOverlay.style.display = 'flex';
                document.body.style.overflow = 'hidden'; // block scroll
                resetZoom();
            }
        });
    });

    // Close on Close button click
    if (zoomCloseBtn) {
        zoomCloseBtn.addEventListener('click', () => {
            if (zoomOverlay) {
                zoomOverlay.style.display = 'none';
                document.body.style.overflow = 'auto'; // restore scroll
            }
        });
    }

    // Close on background overlay click (but not when clicking the image)
    if (zoomOverlay) {
        zoomOverlay.addEventListener('click', (e) => {
            if (e.target === zoomOverlay || e.target === zoomCloseBtn || (zoomCloseBtn && zoomCloseBtn.contains(e.target))) {
                zoomOverlay.style.display = 'none';
                document.body.style.overflow = 'auto'; // restore scroll
            }
        });

        // Mouse Wheel Zoom
        zoomOverlay.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.08;
            const direction = e.deltaY < 0 ? 1 : -1;
            
            // Limit scale between 1 and 6
            const newScale = Math.min(Math.max(scale + direction * zoomSpeed * scale, 1), 6);
            
            scale = newScale;
            updateTransform();
        }, { passive: false });
    }

    // Panning & Dragging logic
    if (zoomedImg) {
        zoomedImg.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Mobile touch support (Swipe to Pan & Pinch to Zoom)
        let prevDiff = -1;

        zoomedImg.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            if (e.targetTouches.length === 1) {
                isDragging = true;
                startX = e.targetTouches[0].clientX - translateX;
                startY = e.targetTouches[0].clientY - translateY;
            } else if (e.targetTouches.length === 2) {
                isDragging = false;
                const touch1 = e.targetTouches[0];
                const touch2 = e.targetTouches[1];
                prevDiff = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            }
        });

        zoomedImg.addEventListener('touchmove', (e) => {
            e.stopPropagation();
            if (isDragging && e.targetTouches.length === 1) {
                translateX = e.targetTouches[0].clientX - startX;
                translateY = e.targetTouches[0].clientY - startY;
                updateTransform();
            } else if (e.targetTouches.length === 2) {
                // Pinch to Zoom
                const touch1 = e.targetTouches[0];
                const touch2 = e.targetTouches[1];
                const curDiff = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
                if (prevDiff > 0) {
                    const zoomFactor = curDiff / prevDiff;
                    scale = Math.min(Math.max(scale * zoomFactor, 1), 6);
                    updateTransform();
                }
                prevDiff = curDiff;
            }
        });

        zoomedImg.addEventListener('touchend', (e) => {
            isDragging = false;
            prevDiff = -1;
        });
    }

    // ==========================================
    // 6. Interactive Search (Streets and Plots)
    // ==========================================
    const searchInput = document.getElementById('search-input');
    const searchType = document.getElementById('search-type');
    const searchBtn = document.getElementById('search-btn');
    const searchResults = document.getElementById('search-results');
    const resultsList = document.getElementById('results-list');
    const resultCount = document.getElementById('result-count');

    // Database extracted from CDR files
    const streetDB = [
        { name: 'ул. Центральная', phase: '1 очередь' },
        { name: 'ул. Радужная', phase: '1 очередь' },
        { name: 'ул. Березовая', phase: '1 очередь' },
        { name: 'ул. Родниковая', phase: '1 очередь' },
        { name: 'ул. Рябиновая', phase: '1 очередь' },
        { name: 'ул. Садовая', phase: '1 очередь' },
        { name: 'ул. Луговая', phase: '1 очередь' },
        { name: 'ул. Солнечная', phase: '1 очередь' },
        { name: 'ул. Лазурная', phase: '1 очередь' },
        { name: 'ул. Весенняя', phase: '1 очередь' },
        { name: 'ул. Цветочная', phase: '1 очередь' },
        { name: 'ул. Летняя', phase: '1 очередь' },
        { name: 'ул. Светлая', phase: '1 очередь' },
        { name: 'ул. Лесная', phase: '1 очередь' },
        { name: 'ул. 2-ая Лесная', phase: '1 очередь' },
        { name: 'пер. Рябиновый', phase: '1 очередь' },
        { name: 'пер. 2-ой Лесной', phase: '1 очередь' },
        { name: 'ул. Успеха', phase: '2 очередь' },
        { name: 'ул. Уютная', phase: '2 очередь' },
        { name: 'ул. Любимая', phase: '2 очередь' },
        { name: 'ул. Мечты', phase: '2 очередь' },
        { name: 'пер. Счастливый', phase: '2 очередь' },
        { name: 'пер. Добрый', phase: '2 очередь' }
    ];

    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        const type = searchType.value;
        resultsList.innerHTML = '';
        
        if (!query) {
            searchResults.style.display = 'none';
            return;
        }

        let matches = [];

        if (type === 'street') {
            matches = streetDB.filter(street => street.name.toLowerCase().includes(query));
            
            resultCount.textContent = `Найдено улиц: ${matches.length}`;
            
            if (matches.length > 0) {
                matches.forEach(match => {
                    const div = document.createElement('div');
                    div.className = 'result-item';
                    div.innerHTML = `
                        <span class="result-street">${match.name}</span>
                        <span class="result-phase">${match.phase}</span>
                    `;
                    
                    // Click to highlight phase on map tab
                    div.addEventListener('click', () => {
                        const tabToClick = match.phase.includes('1') ? 
                            document.querySelector('[data-target="map-phase-1"]') : 
                            document.querySelector('[data-target="map-phase-2"]');
                        if (tabToClick) tabToClick.click();
                        
                        // Scroll slightly to map view
                        document.getElementById('map-view').scrollIntoView({ behavior: 'smooth' });
                    });
                    
                    resultsList.appendChild(div);
                });
            } else {
                resultsList.innerHTML = '<div class="text-center p-3 text-muted">Совпадений не найдено. Проверьте правильность ввода.</div>';
            }
        } else if (type === 'plot') {
            // Plot search. We can parsed that 1st phase has lots like 5a, 3/1, up to 60. 2nd phase has up to 68.
            const plotNum = parseInt(query);
            
            if (isNaN(plotNum)) {
                resultsList.innerHTML = '<div class="text-center p-3 text-danger">Пожалуйста, введите корректный номер участка (число).</div>';
            } else if (plotNum < 1 || plotNum > 150) {
                resultsList.innerHTML = '<div class="text-center p-3 text-muted">Участки с такими номерами отсутствуют в реестре.</div>';
            } else {
                // Generate simulated results based on plot ranges
                // Let's decide which phase it is
                // As typical for this village:
                // Phase 2: has some specific plots, Phase 1 has others.
                // We'll show it in both if applicable or estimate.
                let phaseText = '';
                if (plotNum <= 60) {
                    matches.push({ name: `Участок №${plotNum} (Первая очередь)`, phase: '1 очередь' });
                }
                if (plotNum <= 68) {
                    matches.push({ name: `Участок №${plotNum} (Вторая очередь)`, phase: '2 очередь' });
                }
                
                resultCount.textContent = `Найдено участков: ${matches.length}`;
                
                matches.forEach(match => {
                    const div = document.createElement('div');
                    div.className = 'result-item';
                    div.innerHTML = `
                        <span class="result-street">${match.name}</span>
                        <span class="result-phase">${match.phase}</span>
                    `;
                    
                    div.addEventListener('click', () => {
                        const tabToClick = match.phase.includes('1') ? 
                            document.querySelector('[data-target="map-phase-1"]') : 
                            document.querySelector('[data-target="map-phase-2"]');
                        if (tabToClick) tabToClick.click();
                        document.getElementById('map-view').scrollIntoView({ behavior: 'smooth' });
                    });
                    
                    resultsList.appendChild(div);
                });
            }
        }

        searchResults.style.display = 'block';
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // ==========================================
    // 7. Modal Login Dialog (Auth window)
    // ==========================================
    const loginBtn = document.getElementById('login-btn');
    const loginModal = document.getElementById('login-modal');
    const modalClose = document.getElementById('modal-close');

    if (loginBtn && loginModal && modalClose) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });

        modalClose.addEventListener('click', () => {
            loginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // ==========================================
    // 8. Contact Form Submit (Demo feedback)
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect info
            const name = document.getElementById('form-name').value;
            const email = document.getElementById('form-email').value;
            const message = document.getElementById('form-message').value;
            
            if (name && email && message) {
                alert(`Спасибо, ${name}! Ваше сообщение отправлено в правление ТСН. Мы свяжемся с вами в ближайшее время.`);
                contactForm.reset();
            } else {
                alert('Пожалуйста, заполните все обязательные поля.');
            }
        });
    }
});
