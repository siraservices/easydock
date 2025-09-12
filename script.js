// Lead Storage Array (for demo purposes)
let leads = [];

// Header Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animation on Scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all animation elements
document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
    observer.observe(el);
});

// Process Tab Switching
function switchTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.process-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Add active class to clicked tab
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    
    // Hide all process steps
    document.getElementById('yacht-owners-process').style.display = 'none';
    document.getElementById('marina-owners-process').style.display = 'none';
    
    // Show selected process steps
    document.getElementById(`${tabName}-process`).style.display = 'grid';
}

// Modal Functions
function openModal() {
    const modal = document.getElementById('modalOverlay');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Reset form
    resetForm();
}

function closeModal() {
    const modal = document.getElementById('modalOverlay');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset form
    resetForm();
}

function resetForm() {
    const form = document.getElementById('leadForm');
    form.reset();
    
    // Reset user type selection
    document.querySelectorAll('.user-type-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.getElementById('userType').value = '';
    
    // Clear error messages
    document.querySelectorAll('.error-message').forEach(error => {
        error.textContent = '';
    });
    
    // Hide success message
    document.getElementById('successMessage').style.display = 'none';
    
    // Enable submit button
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
}

function selectUserType(type) {
    // Remove selected class from all options
    document.querySelectorAll('.user-type-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    document.querySelector(`[onclick="selectUserType('${type}')"]`).classList.add('selected');
    
    // Set hidden input value
    document.getElementById('userType').value = type;
}

// Form Validation
function validateForm() {
    let isValid = true;
    
    // Email validation
    const email = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.value.trim()) {
        emailError.textContent = 'Email is required';
        isValid = false;
    } else if (!emailRegex.test(email.value)) {
        emailError.textContent = 'Please enter a valid email address';
        isValid = false;
    } else {
        emailError.textContent = '';
    }
    
    // User type validation
    const userType = document.getElementById('userType');
    if (!userType.value) {
        alert('Please select whether you are a Yacht Owner or Marina Owner');
        isValid = false;
    }
    
    return isValid;
}

// Form Submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const formData = new FormData(event.target);
        
        // Submit to Formspree
        const response = await fetch('https://formspree.io/f/xpwlobgz', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            // Show success message
            const successMessage = document.getElementById('successMessage');
            successMessage.textContent = 'Thank you! We\'ll be in touch soon to discuss your marina needs.';
            successMessage.style.display = 'block';
            
            // Hide form
            event.target.style.display = 'none';
            
            // Close modal after 3 seconds
            setTimeout(() => {
                closeModal();
                event.target.style.display = 'block';
            }, 3000);
            
            // Optional: Still log locally for tracking
            const leadData = {
                email: formData.get('email'),
                launchNotify: formData.get('launchNotify') === 'on',
                message: formData.get('message'),
                userType: formData.get('userType'),
                timestamp: new Date().toISOString()
            };
            leads.push(leadData);
            console.log('Lead submitted successfully:', leadData);
            
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        
        // Show error message
        const successMessage = document.getElementById('successMessage');
        successMessage.textContent = 'Sorry, there was an error submitting your form. Please try again.';
        successMessage.style.display = 'block';
        successMessage.style.color = '#ef4444';
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
    }
}

// Newsletter Submission
function handleNewsletter(event) {
    event.preventDefault();
    
    const email = event.target.querySelector('.newsletter-input').value;
    const button = event.target.querySelector('.newsletter-btn');
    
    if (email) {
        button.textContent = 'Subscribing...';
        button.disabled = true;
        
        // Simulate subscription
        setTimeout(() => {
            alert('Thank you for subscribing to our newsletter!');
            event.target.reset();
            button.textContent = 'Subscribe';
            button.disabled = false;
        }, 1500);
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const menuToggle = document.querySelector('.mobile-menu-toggle i');
    
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    menuToggle.classList.toggle('fa-bars');
    menuToggle.classList.toggle('fa-times');
}

// Close modal when clicking outside
document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeModal();
    }
});

// Keyboard navigation for modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Initialize animations on page load
window.addEventListener('load', () => {
    // Trigger initial animations
    setTimeout(() => {
        document.querySelectorAll('.fade-in').forEach((el, index) => {
            setTimeout(() => {
                if (el.getBoundingClientRect().top < window.innerHeight) {
                    el.classList.add('visible');
                }
            }, index * 100);
        });
    }, 500);
});

// Add loading effect to buttons
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('click', (e) => {
        if (button.onclick && button.onclick.toString().includes('openModal')) {
            button.classList.add('loading');
            setTimeout(() => {
                button.classList.remove('loading');
            }, 300);
        }
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Counter animation for trust indicators
function animateCounters() {
    const counters = document.querySelectorAll('.trust-number, .stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^0-9]/g, ''));
        const increment = target / 50;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = counter.textContent.replace(/[0-9,]+/, target.toLocaleString());
                clearInterval(timer);
            } else {
                counter.textContent = counter.textContent.replace(/[0-9,]+/, Math.floor(current).toLocaleString());
            }
        }, 20);
    });
}

// Trigger counter animation when elements are visible
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            counterObserver.unobserve(entry.target);
        }
    });
});

document.querySelectorAll('.trust-indicators, .network-stats').forEach(el => {
    counterObserver.observe(el);
});


