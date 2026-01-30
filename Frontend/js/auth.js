// Authentication Functions

// Initialize authentication
function initAuth() {
    updateNavbar();
    
    // Check for token in URL (for password reset, email verification, etc.)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token && !window.location.pathname.includes('login.html')) {
        // Store token from URL (for password reset flows)
        localStorage.setItem('token', token);
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check auth status on protected pages
    const protectedPages = ['dashboard.html', 'profile.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !checkAuthStatus()) {
        window.location.href = 'login.html';
        return false;
    }
      
    return true;
}

// Login function
async function login(email, password) {
    try {
        const response = await api.loginUser(email, password);
        console.log('Login API Response:', response);
        console.log('Token from response:', response.token);
        
        if (response.success) {
            // Store token and user data
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            console.log('Token stored in localStorage:', localStorage.getItem('token'));
            
            // Update navbar
            updateNavbar();
            
            return { success: true, user: response.user };
        } else {
            return { success: false, message: response.message };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { 
            success: false, 
            message: handleApiError(error) || 'Login failed. Please try again.' 
        };
    }
}

// Register function
async function register(userData) {
    try {
        const response = await api.registerUser(userData);
        console.log('Register API Response:', response);
        console.log('Token from response:', response.token);
        
        if (response.success) {
            // Store token and user data
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            console.log('Token stored in localStorage:', localStorage.getItem('token'));
            
            // Update navbar
            updateNavbar();
            
            return { success: true, user: response.user };
        } else {
            return { success: false, message: response.message };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { 
            success: false, 
            message: handleApiError(error) || 'Registration failed. Please try again.' 
        };
    }
}

// Logout function
function logout() {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update navbar
    updateNavbar();
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Update user profile
async function updateProfile(userData) {
    try {
        const response = await api.updateUserProfile(userData);
        
        if (response.success) {
            // Update local storage
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...currentUser, ...userData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Update navbar
            updateNavbar();
            
            return { success: true, user: updatedUser };
        } else {
            return { success: false, message: response.message };
        }
    } catch (error) {
        console.error('Update profile error:', error);
        return { 
            success: false, 
            message: handleApiError(error) || 'Profile update failed.' 
        };
    }
}

// Change password
async function changePassword(currentPassword, newPassword) {
    try {
        const response = await api.changePassword(currentPassword, newPassword);
        
        if (response.success) {
            return { success: true, message: response.message };
        } else {
            return { success: false, message: response.message };
        }
    } catch (error) {
        console.error('Change password error:', error);
        return { 
            success: false, 
            message: handleApiError(error) || 'Password change failed.' 
        };
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return checkAuthStatus();
}

// Get current user
function getCurrentUser() {
    return getUserData();
}

// Refresh user data from API
async function refreshUserData() {
    try {
        const response = await api.getCurrentUser();
        
        if (response.success) {
            // Update local storage
            localStorage.setItem('user', JSON.stringify(response.user));
            
            // Update navbar
            updateNavbar();
            
            return { success: true, user: response.user };
        } else {
            // If token is invalid, logout
            if (response.message && response.message.includes('authenticate')) {
                logout();
            }
            return { success: false, message: response.message };
        }
    } catch (error) {
        console.error('Refresh user data error:', error);
        
        // If token is invalid, logout
        if (error.response && error.response.status === 401) {
            logout();
        }
        
        return { 
            success: false, 
            message: 'Failed to refresh user data' 
        };
    }
}

// Check token expiration
function checkTokenExpiration() {
    const token = getToken();
    if (!token) return false;
    
    try {
        // Decode JWT token to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        
        // Check if token expires in next 5 minutes
        if (expirationTime - currentTime < 5 * 60 * 1000) {
            // Token will expire soon, try to refresh
            refreshUserData();
        }
        
        return expirationTime > currentTime;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety
    if (/[a-z]/.test(password)) score += 1; // lowercase
    if (/[A-Z]/.test(password)) score += 1; // uppercase
    if (/\d/.test(password)) score += 1;    // numbers
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // special chars
    
    // Provide feedback
    if (password.length < 6) {
        feedback.push('Too short (minimum 6 characters)');
    } else if (password.length < 8) {
        feedback.push('Consider using at least 8 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
        feedback.push('Add uppercase letters');
    }
    
    if (!/\d/.test(password)) {
        feedback.push('Add numbers');
    }
    
    if (!/[^A-Za-z0-9]/.test(password)) {
        feedback.push('Add special characters');
    }
    
    // Determine strength level
    let strength = 'weak';
    if (score >= 4) strength = 'good';
    if (score >= 5) strength = 'strong';
    
    return {
        score,
        strength,
        feedback: feedback.length > 0 ? feedback : ['Password is strong!']
    };
}

// Auto-logout after inactivity
function setupAutoLogout(minutes = 60) {
    let timeout;
    
    function resetTimer() {
        clearTimeout(timeout);
        timeout = setTimeout(logout, minutes * 60 * 1000);
    }
    
    // Reset timer on user activity
    ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer);
    });
    
    // Start timer
    resetTimer();
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
    
    // Check token expiration periodically
    setInterval(checkTokenExpiration, 60 * 1000); // Check every minute
    
    // Setup auto-logout after 2 hours of inactivity
    setupAutoLogout(120);
});

// Export auth functions
window.auth = {
    initAuth,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated,
    getCurrentUser,
    refreshUserData,
    checkTokenExpiration,
    checkPasswordStrength,
    setupAutoLogout
};

// Make functions globally available for HTML event handlers
window.loginUser = login;
window.registerUser = register;
window.logoutUser = logout;
window.updateUserProfile = updateProfile;
window.changePassword = changePassword;
window.checkAuthStatus = checkAuthStatus;