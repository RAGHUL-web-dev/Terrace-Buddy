// Utility Functions

// Get authentication token
function getToken() {
    return localStorage.getItem('token');
}

// Check if user is authenticated
function checkAuthStatus() {
    return !!getToken();
}

// Get user data from localStorage
function getUserData() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Update navbar based on authentication status
function updateNavbar() {
    const isAuthenticated = checkAuthStatus();
    const user = getUserData();
    
    // Desktop navbar
    const authLinks = document.getElementById('authLinks');
    const userMenu = document.getElementById('userMenu');
    const userNameElement = document.getElementById('userName');
    
    // Mobile navbar
    const mobileAuthLinks = document.getElementById('mobileAuthLinks');
    const mobileUserMenu = document.getElementById('mobileUserMenu');
    
    if (isAuthenticated && user) {
        // Hide auth links, show user menu
        if (authLinks) authLinks.classList.add('hidden');
        if (userMenu) userMenu.classList.remove('hidden');
        if (userNameElement) userNameElement.textContent = user.name;
        
        if (mobileAuthLinks) mobileAuthLinks.classList.add('hidden');
        if (mobileUserMenu) mobileUserMenu.classList.remove('hidden');
    } else {
        // Show auth links, hide user menu
        if (authLinks) authLinks.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
        
        if (mobileAuthLinks) mobileAuthLinks.classList.remove('hidden');
        if (mobileUserMenu) mobileUserMenu.classList.add('hidden');
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-transform duration-300 translate-x-full`;
    
    // Set styles based on type
    if (type === 'success') {
        notification.classList.add('bg-green-100', 'text-green-800', 'border', 'border-green-200');
    } else if (type === 'error') {
        notification.classList.add('bg-red-100', 'text-red-800', 'border', 'border-red-200');
    } else if (type === 'warning') {
        notification.classList.add('bg-yellow-100', 'text-yellow-800', 'border', 'border-yellow-200');
    } else {
        notification.classList.add('bg-blue-100', 'text-blue-800', 'border', 'border-blue-200');
    }
    
    // Add content
    notification.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <button class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-opacity-30 focus:outline-none">
                <span class="sr-only">Dismiss</span>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 10);
    
    // Add dismiss button functionality
    const dismissButton = notification.querySelector('button');
    dismissButton.addEventListener('click', () => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate password strength
function validatePassword(password) {
    const errors = [];
    
    if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    return errors;
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Generate random ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Handle API errors
function handleApiError(error) {
    console.error('API Error:', error);
    
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const { status, data } = error.response;
        
        if (status === 401) {
            // Unauthorized - clear local storage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
            return 'Session expired. Please login again.';
        } else if (status === 400) {
            return data.message || 'Bad request. Please check your input.';
        } else if (status === 404) {
            return 'Resource not found.';
        } else if (status === 500) {
            return 'Server error. Please try again later.';
        } else {
            return data.message || `Error ${status}: ${data.message || 'Unknown error'}`;
        }
    } else if (error.request) {
        // The request was made but no response was received
        return 'Network error. Please check your connection.';
    } else {
        // Something happened in setting up the request that triggered an Error
        return error.message || 'Unknown error occurred.';
    }
}

// Parse query parameters from URL
function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    
    for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
    }
    
    return params;
}

// Set query parameters in URL
function setQueryParams(params) {
    const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    
    const newUrl = window.location.pathname + (queryString ? `?${queryString}` : '');
    window.history.replaceState({}, '', newUrl);
}

// Check if object is empty
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

// Deep clone object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Capitalize first letter of each word
function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Truncate text with ellipsis
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Toggle element visibility
function toggleElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.toggle('hidden');
    }
}

// Show loading spinner
function showLoading(button) {
    if (button) {
        const originalText = button.innerHTML;
        button.dataset.originalText = originalText;
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading...';
        button.disabled = true;
    }
}

// Hide loading spinner
function hideLoading(button) {
    if (button && button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
        button.disabled = false;
    }
}

// Format number with commas
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Get current timestamp
function getTimestamp() {
    return new Date().toISOString();
}

// Calculate time ago
function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return interval + " year" + (interval > 1 ? "s" : "") + " ago";
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval + " month" + (interval > 1 ? "s" : "") + " ago";
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval + " day" + (interval > 1 ? "s" : "") + " ago";
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval + " hour" + (interval > 1 ? "s" : "") + " ago";
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval + " minute" + (interval > 1 ? "s" : "") + " ago";
    }
    
    return "just now";
}

// Export functions
window.utils = {
    getToken,
    checkAuthStatus,
    getUserData,
    updateNavbar,
    formatDate,
    showNotification,
    isValidEmail,
    validatePassword,
    debounce,
    formatFileSize,
    generateId,
    handleApiError,
    getQueryParams,
    setQueryParams,
    isEmpty,
    deepClone,
    capitalizeWords,
    truncateText,
    toggleElement,
    showLoading,
    hideLoading,
    formatNumber,
    getTimestamp,
    timeAgo
};