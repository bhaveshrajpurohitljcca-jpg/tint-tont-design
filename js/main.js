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

    // 2. Mobile Menu Toggle & Dropdown Handling
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdownParent = document.querySelector('.nav-item-dropdown');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Reset dropdown when mobile menu closes
            if (!navLinks.classList.contains('active')) {
                if (dropdownParent) dropdownParent.classList.remove('active');
                if (dropdownMenu) dropdownMenu.classList.remove('active');
            }
        });

        // Close mobile menu when clicking a link (except dropdown toggle on mobile)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.classList.contains('dropdown-toggle') && window.innerWidth <= 992) {
                    return; // Don't close menu if clicking toggle arrow/link on mobile
                }
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                if (dropdownParent) dropdownParent.classList.remove('active');
                if (dropdownMenu) dropdownMenu.classList.remove('active');
            });
        });
    }

    if (dropdownToggle && dropdownParent && dropdownMenu) {
        dropdownToggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                e.preventDefault(); // Stop navigating to services.html on mobile click
                dropdownParent.classList.toggle('active');
                dropdownMenu.classList.toggle('active');
            }
        });
    }

    // 3. Highlight Active Navigation Link
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-links a');
    let matched = false;

    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (currentPath.endsWith(href) && href !== 'index.html' && href !== 'services.html') {
            item.classList.add('active');
            matched = true;
        } else {
            item.classList.remove('active');
        }
    });

    // Special handling for services and service detail pages
    if (currentPath.includes('services.html') || currentPath.includes('service-detail.html')) {
        if (dropdownToggle) dropdownToggle.classList.add('active');
        matched = true;
    }

    // Default to Home if no match
    if (!matched && navItems.length > 0) {
        navItems.forEach(item => {
            if (item.getAttribute('href') === 'index.html' || item.getAttribute('href') === '/') {
                item.classList.add('active');
            }
        });
    }

    // 4. Scroll Animations (Fade-in on scroll)
    const initScrollAnimations = () => {
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
    };
    initScrollAnimations(); // Run initially

    // 5. Dynamic Page Renderers (Run before Lightbox setup)
    
    // 5a. Service Detail Page Renderer
    if (currentPath.includes('service-detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const serviceKey = urlParams.get('service');
        const serviceData = SITE_DATA.services[serviceKey];
        
        if (serviceData) {
            // Render service title
            const titleElements = document.querySelectorAll('.dynamic-service-title');
            titleElements.forEach(el => { el.textContent = serviceData.title; });
            
            // Render service description
            const descEl = document.getElementById('service-description');
            if (descEl) descEl.textContent = serviceData.description;
            
            // Render image grid
            const gridEl = document.getElementById('service-images-grid');
            if (gridEl && serviceData.images) {
                gridEl.innerHTML = '';
                serviceData.images.forEach(imgSrc => {
                    const imgItem = document.createElement('div');
                    imgItem.className = 'gallery-item animate-fade-in';
                    imgItem.setAttribute('data-src', imgSrc);
                    imgItem.setAttribute('data-caption', serviceData.title + ' Installation');
                    imgItem.innerHTML = `
                        <img src="${imgSrc}" alt="${serviceData.title} Installation">
                        <div class="gallery-item-overlay">
                            <h4>${serviceData.title}</h4>
                            <span>Installation View</span>
                        </div>
                    `;
                    gridEl.appendChild(imgItem);
                });
            }
        } else {
            // If service not found, redirect to general services page
            window.location.href = 'services.html';
        }
    }

    // 5b. Gallery Page Renderer
    if (currentPath.includes('gallery.html')) {
        const containerEl = document.getElementById('gallery-container');
        if (containerEl) {
            containerEl.innerHTML = ''; // clear default placeholder content
            
            // Loop through all gallery categories
            Object.keys(SITE_DATA.gallery).forEach(key => {
                const catData = SITE_DATA.gallery[key];
                if (catData.images && catData.images.length > 0) {
                    const sectionEl = document.createElement('div');
                    sectionEl.className = 'gallery-category-section animate-fade-in';
                    sectionEl.style.marginBottom = '80px';
                    
                    let descHTML = '';
                    if (catData.description) {
                        descHTML = `<p class="category-description" style="color: var(--text-muted); font-size: 1.05rem; max-width: 800px; margin-bottom: 30px; line-height: 1.6; border-left: 3px solid var(--primary); padding-left: 15px;">${catData.description}</p>`;
                    }
                    
                    sectionEl.innerHTML = `
                        <div class="category-header" style="margin-bottom: 25px;">
                            <h3 style="font-size: 1.8rem; font-weight: 700; color: var(--black); margin-bottom: 10px;">${catData.title}</h3>
                            ${descHTML}
                        </div>
                        <div class="gallery-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px;">
                        </div>
                    `;
                    
                    const gridEl = sectionEl.querySelector('.gallery-grid');
                    catData.images.forEach(imgSrc => {
                        const imgItem = document.createElement('div');
                        imgItem.className = 'gallery-item';
                        imgItem.setAttribute('data-src', imgSrc);
                        imgItem.setAttribute('data-caption', catData.title + ' - Tint Tone Designs');
                        imgItem.innerHTML = `
                            <img src="${imgSrc}" alt="${catData.title}">
                            <div class="gallery-item-overlay">
                                <h4>${catData.title}</h4>
                                <span>Portfolio View</span>
                            </div>
                        `;
                        gridEl.appendChild(imgItem);
                    });
                    
                    containerEl.appendChild(sectionEl);
                }
            });
        }
    }

    // 5c. Clients Page Renderer
    if (currentPath.includes('clients.html')) {
        const gridEl = document.getElementById('clients-logos-grid');
        if (gridEl && SITE_DATA.clients) {
            gridEl.innerHTML = '';
            SITE_DATA.clients.forEach(imgSrc => {
                const cardEl = document.createElement('div');
                cardEl.className = 'client-card animate-fade-in';
                cardEl.style.display = 'flex';
                cardEl.style.justifyContent = 'center';
                cardEl.style.alignItems = 'center';
                cardEl.style.padding = '20px';
                cardEl.style.height = '120px';
                cardEl.style.backgroundColor = 'var(--light-bg)';
                cardEl.style.border = '1px solid var(--border-color)';
                cardEl.style.borderRadius = 'var(--radius-sm)';
                cardEl.style.transition = 'var(--transition)';
                cardEl.innerHTML = `<img src="${imgSrc}" alt="Client Logo" style="max-height: 100%; max-width: 100%; object-fit: contain; filter: grayscale(100%); opacity: 0.7; transition: var(--transition);">`;
                
                // Hover effect to remove grayscale
                cardEl.addEventListener('mouseenter', () => {
                    const img = cardEl.querySelector('img');
                    if (img) {
                        img.style.filter = 'none';
                        img.style.opacity = '1';
                    }
                    cardEl.style.boxShadow = 'var(--shadow-md)';
                    cardEl.style.transform = 'translateY(-2px)';
                });
                
                cardEl.addEventListener('mouseleave', () => {
                    const img = cardEl.querySelector('img');
                    if (img) {
                        img.style.filter = 'grayscale(100%)';
                        img.style.opacity = '0.7';
                    }
                    cardEl.style.boxShadow = 'none';
                    cardEl.style.transform = 'none';
                });
                
                gridEl.appendChild(cardEl);
            });
        }
    }

    // Re-run scroll animations check to capture dynamically created elements
    initScrollAnimations();

    // 6. Gallery Lightbox (Updated with event delegation for dynamic elements)
    const lightbox = document.getElementById('lightbox');
    
    if (lightbox) {
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
            const galleryItems = document.querySelectorAll('.gallery-item');
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

        // Attach click listener to parent/body using event delegation
        document.addEventListener('click', (e) => {
            const item = e.target.closest('.gallery-item');
            if (item) {
                updateVisibleImages();
                currentIndex = visibleImages.findIndex(img => img.element === item);
                if (currentIndex !== -1) {
                    openLightbox();
                }
            }
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
        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
        if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
        lightbox.addEventListener('click', closeLightbox);
        
        if (lightboxImg) {
            lightboxImg.addEventListener('click', (e) => {
                e.stopPropagation();
                showNext();
            });
        }

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        });
    }

    // 7. Contact Form Interactive Handler
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    
    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validate fields
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
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
        formStatus.style.display = 'block';
        
        // Auto fade out status after 5 seconds
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    };

    // 8. Dynamic Year in Footer
    const footerYear = document.getElementById('currentYear');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }
});
