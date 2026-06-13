document.addEventListener('DOMContentLoaded', () => {
    // 1. Header Scroll Effect
    const header = document.querySelector('.header');
    const handleScroll = () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Init on load

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close mobile menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // 3. Highlight Active Navigation Link
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-links a');
    let matched = false;

    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (currentPath.endsWith(href) && href !== 'index.html') {
            item.classList.add('active');
            matched = true;
        } else {
            item.classList.remove('active');
        }
    });

    // Default to Home if no match
    if (!matched && navItems.length > 0) {
        navItems.forEach(item => {
            if (item.getAttribute('href') === 'index.html' || item.getAttribute('href') === '/') {
                item.classList.add('active');
            }
        });
    }

    // 4. Scroll Animations (Fade-in on scroll)
    const animateElements = document.querySelectorAll('.animate-fade-in');
    if ('IntersectionObserver' in window && animateElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('appear');
                    observer.unobserve(entry.target); // Animates once
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animateElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        animateElements.forEach(el => el.classList.add('appear'));
    }

    // 5. Gallery Lightbox & Filtering Functionality
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    if (lightbox && galleryItems.length > 0) {
        const lightboxImg = lightbox.querySelector('.lightbox-img');
        const lightboxCaption = lightbox.querySelector('.lightbox-caption');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        
        let currentIndex = 0;
        let visibleImages = [];

        // Build list of currently visible images in the gallery
        const updateVisibleImages = () => {
            visibleImages = [];
            galleryItems.forEach(item => {
                if (window.getComputedStyle(item).display !== 'none') {
                    const imgEl = item.querySelector('img');
                    const titleEl = item.querySelector('h4');
                    visibleImages.push({
                        element: item,
                        src: item.getAttribute('data-src') || imgEl.getAttribute('src'),
                        caption: item.getAttribute('data-caption') || (titleEl ? titleEl.textContent : '')
                    });
                }
            });
        };

        // Attach click listeners to gallery items
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                updateVisibleImages();
                // Find index of clicked item in the visible list
                currentIndex = visibleImages.findIndex(img => img.element === item);
                if (currentIndex !== -1) {
                    openLightbox();
                }
            });
        });

        const openLightbox = () => {
            updateLightboxContent();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Stop body scrolling
        };

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Restore body scrolling
        };

        const updateLightboxContent = () => {
            if (visibleImages.length === 0) return;
            const currentItem = visibleImages[currentIndex];
            lightboxImg.setAttribute('src', currentItem.src);
            lightboxCaption.textContent = currentItem.caption;
        };

        const showPrev = () => {
            if (visibleImages.length === 0) return;
            currentIndex = (currentIndex - 1 + visibleImages.length) % visibleImages.length;
            updateLightboxContent();
        };

        const showNext = () => {
            if (visibleImages.length === 0) return;
            currentIndex = (currentIndex + 1) % visibleImages.length;
            updateLightboxContent();
        };

        // Events
        closeBtn.addEventListener('click', closeLightbox);
        prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
        nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
        lightbox.addEventListener('click', closeLightbox);
        
        lightboxImg.addEventListener('click', (e) => {
            e.stopPropagation();
            showNext();
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        });

        // Initialize visible list
        updateVisibleImages();
    }

    // 5b. Category Filtering Logic
    if (filterButtons.length > 0 && galleryItems.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filterValue = btn.getAttribute('data-filter');
                
                galleryItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    if (filterValue === 'all' || category === filterValue) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // 6. Contact Form Interactive Handler
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    
    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validate fields
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const service = document.getElementById('service').value;
            const message = document.getElementById('message').value.trim();
            
            if (!name || !email || !message) {
                showFormStatus('Please fill in all required fields.', 'error');
                return;
            }

            // Simulate form submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending Message...';

            setTimeout(() => {
                showFormStatus('Thank you for reaching out! Our team will contact you shortly.', 'success');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }, 1500);
        });
    }

    const showFormStatus = (msg, type) => {
        formStatus.textContent = msg;
        formStatus.className = 'form-status ' + type;
        
        // Auto fade out status after 5 seconds
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    };

    // 7. Dynamic Year in Footer
    const footerYear = document.getElementById('currentYear');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }
});
