document.addEventListener('DOMContentLoaded', () => {
    // ========== Security: Input Sanitization Helper ==========
    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    function validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email) && email.length <= 254;
    }

    function validateName(name) {
        const nameRegex = /^[a-zA-Z\s\-'\.]{2,100}$/;
        return nameRegex.test(name);
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

    // ========== Contact Form Handling with Security ==========
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        const honeypotInput = document.getElementById('website');
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

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Honeypot check - if filled, it's likely a bot
            if (honeypotInput && honeypotInput.value) {
                console.warn('Bot detected');
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
            
            if (message.length < 10) {
                showError(messageInput, 'messageError', 'Message must be at least 10 characters');
                isValid = false;
            }
            
            if (message.length > 2000) {
                showError(messageInput, 'messageError', 'Message must be less than 2000 characters');
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

            // Simulate sending (replace with actual API call)
            setTimeout(() => {
                // In production, you would send data to a secure backend here
                // Example: fetch('/api/contact', { method: 'POST', body: JSON.stringify({ name, email, message }) })
                
                submitBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Message Sent!';
                submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                
                formStatus.textContent = 'Thank you! Your message has been sent successfully.';
                formStatus.className = 'form-status success';

                // Reset form
                contactForm.reset();

                // Reset button after a few seconds
                setTimeout(() => {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    submitBtn.style.opacity = '';
                }, 3000);
            }, 1500);
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
    const cards = document.querySelectorAll('.service-card, .project-card, .education-card, .skills-card');
    
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
