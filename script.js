document.addEventListener('DOMContentLoaded', () => {
    // ========== Security: Enhanced Input Sanitization ==========
    function sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        // Remove potential XSS vectors
        const div = document.createElement('div');
        div.textContent = input;
        let sanitized = div.innerHTML;
        // Additional sanitization for common attack patterns
        sanitized = sanitized
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        return sanitized;
    }

    function validateEmail(email) {
        if (typeof email !== 'string') return false;
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email) && email.length <= 254 && email.length >= 5;
    }

    function validateName(name) {
        if (typeof name !== 'string') return false;
        const nameRegex = /^[a-zA-Z\s\-'\.]{2,100}$/;
        // Check for suspicious patterns
        const suspiciousPatterns = /<|>|script|javascript|onclick|onerror/i;
        return nameRegex.test(name) && !suspiciousPatterns.test(name);
    }

    function validateMessage(message) {
        if (typeof message !== 'string') return false;
        // Check for excessive links (spam indicator)
        const linkCount = (message.match(/https?:\/\//gi) || []).length;
        if (linkCount > 3) return false;
        return message.length >= 10 && message.length <= 2000;
    }

    // ========== Rate Limiting ==========
    const rateLimiter = {
        attempts: [],
        maxAttempts: 3,
        windowMs: 60000, // 1 minute
        cooldownMs: 300000, // 5 minutes cooldown after limit reached
        
        canSubmit() {
            const now = Date.now();
            // Remove old attempts outside the window
            this.attempts = this.attempts.filter(time => now - time < this.windowMs);
            
            // Check if in cooldown
            const cooldownUntil = localStorage.getItem('formCooldown');
            
            if (cooldownUntil && now < parseInt(cooldownUntil)) {
                const remaining = Math.ceil((parseInt(cooldownUntil) - now) / 1000);
                return { allowed: false, message: `Too many attempts. Please wait ${remaining} seconds.` };
            }
            
            if (this.attempts.length >= this.maxAttempts) {
                localStorage.setItem('formCooldown', (now + this.cooldownMs).toString());
                return { allowed: false, message: 'Too many attempts. Please wait 5 minutes.' };
            }
            
            return { allowed: true };
        },
        
        recordAttempt() {
            this.attempts.push(Date.now());
            localStorage.setItem('lastFormSubmit', Date.now().toString());
        }
    };

    // Set form timestamp on page load (for timing-based bot detection)
    const formTimestamp = document.getElementById('formTimestamp');
    const pageLoadTime = Date.now();
    
    if (formTimestamp) formTimestamp.value = pageLoadTime.toString();

    // ========== Dark/Light Mode Toggle ==========
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    
    // Check for saved theme preference or system preference
    function getPreferredTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Apply theme
    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        themeToggle.checked = theme === 'dark';
        localStorage.setItem('theme', theme);
    }
    
    // Initialize theme
    applyTheme(getPreferredTheme());
    
    // Toggle theme on checkbox change
    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        applyTheme(newTheme);
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // ========== Copy Button Functionality ==========
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const textToCopy = btn.getAttribute('data-copy');
            
            try {
                await navigator.clipboard.writeText(textToCopy);
                
                // Visual feedback
                const icon = btn.querySelector('i');
                icon.classList.remove('fa-copy');
                icon.classList.add('fa-check');
                btn.classList.add('copied');
                
                // Reset after 2 seconds
                setTimeout(() => {
                    icon.classList.remove('fa-check');
                    icon.classList.add('fa-copy');
                    btn.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                const icon = btn.querySelector('i');
                icon.classList.remove('fa-copy');
                icon.classList.add('fa-check');
                btn.classList.add('copied');
                
                setTimeout(() => {
                    icon.classList.remove('fa-check');
                    icon.classList.add('fa-copy');
                    btn.classList.remove('copied');
                }, 2000);
            }
        });
    });

    // ========== Back to Top Button ==========
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ========== Animated Skill Bars ==========
    const skillBars = document.querySelectorAll('.skill-progress');
    const skillsCard = document.querySelector('.skills-card');
    
    // Set initial progress values from data attribute
    skillBars.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        bar.style.setProperty('--progress', progress + '%');
    });
    
    // Animate skill bars when skills card becomes visible
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                skillBars.forEach(bar => {
                    bar.classList.add('animated');
                });
            }
        });
    }, { threshold: 0.3 });
    
    if (skillsCard) {
        skillsObserver.observe(skillsCard);
    }

    // ========== Mobile Navigation Toggle ==========
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');
    const header = document.querySelector('header');

    hamburger.addEventListener('click', () => {
        const isActive = navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isActive);
        
        // Trap focus in menu when open
        if (isActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Keyboard support for hamburger
    hamburger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            hamburger.click();
        }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            hamburger.focus();
        }
    });

    // Close mobile menu when a link is clicked
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    // ========== Header Scroll Effect ==========
    let lastScroll = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScroll = window.scrollY;
                
                if (currentScroll > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                
                lastScroll = currentScroll;
                ticking = false;
            });
            ticking = true;
        }
    });

    // ========== Smooth Scrolling for Anchor Links ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // ========== Advanced Scroll Animation (Intersection Observer) ==========
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -80px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Continue observing for re-animation on scroll back
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    revealElements.forEach(el => observer.observe(el));

    // ========== Typing Effect for Tagline ==========
    const tagline = document.querySelector('.tagline');
    if (tagline) {
        const originalText = tagline.textContent;
        const texts = [
            originalText,
            "Creating seamless user experiences.",
            "Turning ideas into reality.",
            "Full-stack developer & problem solver."
        ];
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 80;

        function typeText() {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                tagline.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 40;
            } else {
                tagline.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 80;
            }

            // Add cursor class
            tagline.classList.add('typing-text');

            if (!isDeleting && charIndex === currentText.length) {
                // Pause at end of word
                typingSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typingSpeed = 500;
            }

            setTimeout(typeText, typingSpeed);
        }

        // Start typing after a delay
        setTimeout(typeText, 1500);
    }

    // ========== Parallax Effect for Hero Elements ==========
    const heroSection = document.querySelector('.hero');
    const profileImg = document.querySelector('.hero-profile-img');
    const imageBlob = document.querySelector('.image-blob');

    if (heroSection && profileImg) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const heroHeight = heroSection.offsetHeight;

            if (scrollY < heroHeight) {
                const translateY = scrollY * 0.3;
                const scale = 1 - (scrollY * 0.0003);
                profileImg.style.transform = `translateY(${translateY}px) scale(${Math.max(scale, 0.9)})`;
                
                if (imageBlob) {
                    imageBlob.style.transform = `translate(-50%, -50%) scale(${1 + scrollY * 0.0005})`;
                }
            }
        });
    }

    // ========== Mouse Move Parallax for Hero ==========
    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            
            const xPos = (clientX / innerWidth - 0.5) * 20;
            const yPos = (clientY / innerHeight - 0.5) * 20;
            
            if (imageBlob) {
                imageBlob.style.transform = `translate(calc(-50% + ${xPos}px), calc(-50% + ${yPos}px))`;
            }
        });
    }

    // ========== Skill Tags Hover Effect ==========
    const skillTags = document.querySelectorAll('.tags span');
    skillTags.forEach((tag, index) => {
        tag.style.animationDelay = `${index * 50}ms`;
    });

    // ========== Contact Form Handling with Netlify Forms & Security ==========
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        const formStatus = document.getElementById('formStatus');
        
        // Real-time validation
        function showError(input, errorId, message) {
            const errorElement = document.getElementById(errorId);
            if (errorElement) {
                errorElement.textContent = message;
            }
            input.setAttribute('aria-invalid', 'true');
        }
        
        function clearError(input, errorId) {
            const errorElement = document.getElementById(errorId);
            if (errorElement) {
                errorElement.textContent = '';
            }
            input.removeAttribute('aria-invalid');
        }
        
        nameInput.addEventListener('blur', () => {
            const value = nameInput.value.trim();
            if (value && !validateName(value)) {
                showError(nameInput, 'nameError', 'Please enter a valid name (letters, spaces, hyphens only)');
            } else {
                clearError(nameInput, 'nameError');
            }
        });
        
        emailInput.addEventListener('blur', () => {
            const value = emailInput.value.trim();
            if (value && !validateEmail(value)) {
                showError(emailInput, 'emailError', 'Please enter a valid email address');
            } else {
                clearError(emailInput, 'emailError');
            }
        });
        
        messageInput.addEventListener('blur', () => {
            const value = messageInput.value.trim();
            if (value && value.length < 10) {
                showError(messageInput, 'messageError', 'Message must be at least 10 characters');
            } else {
                clearError(messageInput, 'messageError');
            }
        });

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // ===== Security Check 1: Timing-based bot detection =====
            const submitTime = Date.now();
            const loadTime = parseInt(formTimestamp?.value || '0');
            const timeDiff = submitTime - loadTime;
            
            // If form submitted in less than 3 seconds, likely a bot
            if (timeDiff < 3000) {
                console.warn('Bot detected: form submitted too quickly');
                formStatus.textContent = 'Thank you for your message!';
                return;
            }
            
            // ===== Security Check 2: Rate Limiting =====
            const rateCheck = rateLimiter.canSubmit();
            if (!rateCheck.allowed) {
                formStatus.textContent = rateCheck.message;
                formStatus.className = 'form-status error';
                return;
            }
            
            // Get and sanitize values
            const name = sanitizeInput(nameInput.value.trim());
            const email = sanitizeInput(emailInput.value.trim());
            const message = sanitizeInput(messageInput.value.trim());
            
            // Validate inputs
            let isValid = true;
            
            if (!validateName(name)) {
                showError(nameInput, 'nameError', 'Please enter a valid name');
                isValid = false;
            }
            
            if (!validateEmail(email)) {
                showError(emailInput, 'emailError', 'Please enter a valid email address');
                isValid = false;
            }
            
            if (!validateMessage(message)) {
                if (message.length < 10) {
                    showError(messageInput, 'messageError', 'Message must be at least 10 characters');
                } else if (message.length > 2000) {
                    showError(messageInput, 'messageError', 'Message must be less than 2000 characters');
                } else {
                    showError(messageInput, 'messageError', 'Message contains too many links');
                }
                isValid = false;
            }
            
            if (!isValid) {
                formStatus.textContent = 'Please fix the errors above';
                formStatus.className = 'form-status error';
                return;
            }

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;

            // Disable button and show loading
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.8';
            formStatus.className = 'form-status';
            formStatus.textContent = '';

            // Record this attempt for rate limiting
            rateLimiter.recordAttempt();

            // Submit to Netlify Forms
            try {
                const formData = new FormData(contactForm);
                
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                });

                if (response.ok) {
                    submitBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Message Sent!';
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    
                    formStatus.textContent = 'Thank you! Your message has been sent successfully.';
                    formStatus.className = 'form-status success';

                    // Reset form
                    contactForm.reset();
                    
                    // Reset timestamp for next submission
                    if (formTimestamp) formTimestamp.value = Date.now().toString();
                } else {
                    throw new Error('Form submission failed');
                }

            } catch (error) {
                console.error('Form Error:', error);
                submitBtn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i> Failed to Send';
                submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                
                formStatus.textContent = 'Failed to send message. Please try again or email me directly.';
                formStatus.className = 'form-status error';
            }

            // Reset button after a few seconds
            setTimeout(() => {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
                submitBtn.style.opacity = '';
            }, 3000);
        });
    }

    // ========== Active Nav Link on Scroll ==========
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a');

    function highlightNav() {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNav);

    // ========== Card Tilt Effect ==========
    const cards = document.querySelectorAll('.service-card, .project-card');
    const aboutCards = document.querySelectorAll('.education-card, .skills-card');
    
    // Full tilt for service and project cards
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
    
    // Minimal tilt for about section cards
    aboutCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Reduced tilt (divided by 50 instead of 20)
            const rotateX = (y - centerY) / 50;
            const rotateY = (centerX - x) / 50;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ========== Smooth Counter Animation (if needed) ==========
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }
        
        updateCounter();
    }

    // ========== Page Load Animation ==========
    document.body.classList.add('loaded');
});
