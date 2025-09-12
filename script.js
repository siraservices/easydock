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
    
    // Clear user type validation errors
    const userTypeOptions = document.querySelector('.user-type-selector');
    if (userTypeOptions) {
        userTypeOptions.style.border = '';
        userTypeOptions.style.borderRadius = '';
        userTypeOptions.style.backgroundColor = '';
        
        const existingError = document.getElementById('userTypeError');
        if (existingError) {
            existingError.remove();
        }
    }
    
    // Hide and reset success message
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'none';
    successMessage.innerHTML = '';
    successMessage.style.background = '';
    successMessage.style.borderRadius = '';
    successMessage.style.boxShadow = '';
    successMessage.style.border = '';
    successMessage.style.marginTop = '';
    successMessage.style.color = '';
    
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
    
    // Clear any validation error styling
    const userTypeOptions = document.querySelector('.user-type-selector');
    userTypeOptions.style.border = '';
    userTypeOptions.style.borderRadius = '';
    userTypeOptions.style.backgroundColor = '';
    
    const existingError = document.getElementById('userTypeError');
    if (existingError) {
        existingError.remove();
    }
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
    const userTypeOptions = document.querySelector('.user-type-selector');
    
    if (!userType.value) {
        // Add visual indicator to user type selection
        userTypeOptions.style.border = '2px solid #ef4444';
        userTypeOptions.style.borderRadius = '8px';
        userTypeOptions.style.backgroundColor = '#fef2f2';
        
        // Show a more user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.id = 'userTypeError';
        errorDiv.style.color = '#dc2626';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.5rem';
        errorDiv.style.textAlign = 'center';
        errorDiv.textContent = 'Please select whether you are a Yacht Owner or Marina Owner';
        
        // Remove any existing error message
        const existingError = document.getElementById('userTypeError');
        if (existingError) {
            existingError.remove();
        }
        
        userTypeOptions.appendChild(errorDiv);
        
        // Scroll to user type selection
        userTypeOptions.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        isValid = false;
    } else {
        // Clear any error styling
        userTypeOptions.style.border = '';
        userTypeOptions.style.borderRadius = '';
        userTypeOptions.style.backgroundColor = '';
        
        const existingError = document.getElementById('userTypeError');
        if (existingError) {
            existingError.remove();
        }
    }
    
    return isValid;
}

// Enhanced Thank You Message
function showThankYouMessage() {
    console.log('showThankYouMessage() called');
    const successMessage = document.getElementById('successMessage');
    console.log('successMessage element found:', !!successMessage);
    
    // Create enhanced thank you content with icon and styling
    successMessage.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="background: #22c55e; color: white; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2rem;">
                <i class="fas fa-check"></i>
            </div>
            <h3 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.5rem;">Thank You!</h3>
            <p style="color: #6b7280; margin-bottom: 1rem; font-size: 1.1rem;">Your information has been successfully submitted.</p>
            <p style="color: #6b7280; font-size: 0.95rem;">We'll be in touch soon to discuss your marina needs and help you get started with EasyDock.</p>
            <div style="margin-top: 1.5rem; padding: 1rem; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                <p style="color: #0c4a6e; margin: 0; font-size: 0.9rem;">
                    <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
                    This window will close automatically in a few seconds.
                </p>
            </div>
        </div>
    `;
    
    successMessage.style.display = 'block';
    successMessage.style.background = '#ffffff';
    successMessage.style.borderRadius = '12px';
    successMessage.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
    successMessage.style.border = '1px solid #e5e7eb';
    successMessage.style.marginTop = '1rem';
}

// Form Submission
async function handleFormSubmit(event) {
    event.preventDefault();
    console.log('Form submission started');
    
    if (!validateForm()) {
        console.log('Form validation failed');
        return;
    }
    
    console.log('Form validation passed');
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const formData = new FormData(event.target);
        console.log('Form data created:', {
            email: formData.get('email'),
            userType: formData.get('userType'),
            launchNotify: formData.get('launchNotify'),
            message: formData.get('message')
        });
        
        // Submit to Formspree
        console.log('Sending request to Formspree...');
        const response = await fetch('https://formspree.io/f/xpwlobgz', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('Response received:', response.status, response.statusText);
        
        if (response.ok) {
            console.log('Form submission successful - showing thank you message');
            // Show enhanced thank you message
            showThankYouMessage();
            
            // Hide form
            event.target.style.display = 'none';
            
            // Close modal after 5 seconds (extended time for enhanced message)
            setTimeout(() => {
                closeModal();
                event.target.style.display = 'block';
            }, 5000);
            
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
            console.log('Form submission failed with status:', response.status);
            const responseText = await response.text();
            console.log('Response text:', responseText);
            throw new Error('Form submission failed');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        console.log('Error details:', error.message);
        
        // Show enhanced error message
        const successMessage = document.getElementById('successMessage');
        successMessage.innerHTML = `
            <div style="text-align: center; padding: 1.5rem;">
                <div style="background: #ef4444; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.5rem;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 style="color: #dc2626; margin-bottom: 0.5rem;">Submission Error</h3>
                <p style="color: #6b7280; margin: 0;">Sorry, there was an error submitting your form. Please try again.</p>
            </div>
        `;
        successMessage.style.display = 'block';
        successMessage.style.background = '#fef2f2';
        successMessage.style.borderRadius = '12px';
        successMessage.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
        successMessage.style.border = '1px solid #fecaca';
        successMessage.style.marginTop = '1rem';
        
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

// Make showThankYouMessage globally accessible for testing
window.showThankYouMessage = showThankYouMessage;

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


