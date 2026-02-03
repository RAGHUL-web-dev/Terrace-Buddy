// API Service Functions

const API_BASE_URL = 'http://localhost:5000/api';

// Generic API request function
async function apiRequest(endpoint, method = 'GET', data = null, requiresAuth = true) {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
    };

    // Add authorization header if required
    if (requiresAuth) {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            throw new Error('Authentication required');
        }
    }

    const options = {
        method,
        headers,
        credentials: 'include' // Include cookies for auth
    };

    // Add body for POST, PUT, PATCH requests
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        let responseData;

        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        // Handle HTTP errors
        if (!response.ok) {
            const error = new Error(responseData.message || `HTTP ${response.status}`);
            error.response = response;
            error.data = responseData;
            throw error;
        }

        return responseData;
    } catch (error) {
        console.error('API Request Error:', error);

        // Handle specific error cases
        if (error.message === 'Failed to fetch') {
            throw new Error('Unable to connect to server. Please check your internet connection.');
        }

        // Handle authentication errors
        if (error.response && error.response.status === 401) {
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Redirect to login if not already there
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
        }

        throw error;
    }
}

// Auth API Calls
async function loginUser(email, password) {
    return apiRequest('/auth/login', 'POST', { email, password }, false);
}

async function registerUser(userData) {
    return apiRequest('/auth/register', 'POST', userData, false);
}

async function logoutUser() {
    try {
        // Call logout API
        await apiRequest('/auth/logout', 'POST', {}, true);
    } catch (error) {
        // Even if API call fails, clear local storage
        console.warn('Logout API call failed:', error);
    } finally {
        // Always clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to home page
        window.location.href = 'index.html';
    }
}

async function getCurrentUser() {
    return apiRequest('/auth/me', 'GET');
}

async function updateUserProfile(userData) {
    return apiRequest('/auth/profile', 'PUT', userData);
}

async function changePassword(currentPassword, newPassword) {
    return apiRequest('/auth/reset-password', 'PUT', { currentPassword, newPassword });
}

// User API Calls
async function getUserProfile(userId) {
    return apiRequest(`/users/profile/${userId}`, 'GET');
}

// Get user dashboard data
async function getUserDashboard() {
    return apiRequest('/users/dashboard', 'GET');
}

async function getUserNotifications() {
    return apiRequest('/users/notifications', 'GET');
}

async function markNotificationAsRead(notificationId) {
    return apiRequest(`/users/notifications/${notificationId}/read`, 'PUT');
}

async function deleteNotification(notificationId) {
    return apiRequest(`/users/notifications/${notificationId}`, 'DELETE');
}

async function getWeatherSuggestions() {
    return apiRequest('/users/weather-suggestions', 'GET');
}

async function updateUserSettings(settings) {
    return apiRequest('/users/settings', 'PUT', settings);
}

// Get user notifications
async function getNotifications() {
    return apiRequest('/users/notifications', 'GET');
}

// Community API Calls
async function getCommunities(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/communities${queryParams ? `?${queryParams}` : ''}`, 'GET');
}

async function getCommunity(communityId) {
    return apiRequest(`/communities/${communityId}`, 'GET');
}

async function createCommunity(communityData) {
    return apiRequest('/communities', 'POST', communityData);
}

async function requestToJoinCommunity(communityId) {
    return apiRequest(`/communities/${communityId}/join`, 'POST');
}

async function getMyCommunities() {
    return apiRequest('/communities/user/my-communities', 'GET');
}

async function approveJoinRequest(communityId, userId) {
    return apiRequest(`/communities/${communityId}/approve-join`, 'POST', { userId });
}

async function removeMember(communityId, userId) {
    return apiRequest(`/communities/${communityId}/remove-member`, 'POST', { userId });
}

async function createChannel(communityId, channelData) {
    return apiRequest(`/communities/${communityId}/channels`, 'POST', channelData);
}

// Marketplace API Calls
async function getMarketplaceItems(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/marketplace${queryParams ? `?${queryParams}` : ''}`, 'GET');
}


async function getMarketplaceItem(itemId) {
    return apiRequest(`/marketplace/${itemId}`, 'GET');
}

async function createMarketplaceItem(itemData) {
    // For file uploads, we need to use FormData
    const formData = new FormData();

    Object.keys(itemData).forEach(key => {
        if (key === 'images' && Array.isArray(itemData[key])) {
            itemData[key].forEach(file => {
                formData.append('itemImage', file);
            });
        } else {
            formData.append(key, itemData[key]);
        }
    });

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/marketplace`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to create marketplace item');
    }

    return response.json();
}

async function updateMarketplaceItem(itemId, itemData) {
    return apiRequest(`/marketplace/${itemId}`, 'PUT', itemData);
}

async function deleteMarketplaceItem(itemId) {
    return apiRequest(`/marketplace/${itemId}`, 'DELETE');
}

async function getMyMarketplaceItems() {
    return apiRequest('/marketplace/user/my-items', 'GET');
}

// Plant API Calls
async function getPlants() {
    return apiRequest('/plants/my-plants', 'GET');
}

async function getPlant(plantId) {
    return apiRequest(`/plants/${plantId}`, 'GET');
}

// Get user's plants
async function getUserPlants() {
    return apiRequest('/plants/my-plants', 'GET');
}


async function createPlant(plantData) {
    // For file uploads, use FormData
    const formData = new FormData();

    Object.keys(plantData).forEach(key => {
        if (key === 'images' && Array.isArray(plantData[key])) {
            plantData[key].forEach(file => {
                formData.append('plantImage', file);
            });
        } else {
            formData.append(key, plantData[key]);
        }
    });

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/plants`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to create plant');
    }

    return response.json();
}

async function updatePlant(plantId, plantData) {
    return apiRequest(`/plants/${plantId}`, 'PUT', plantData);
}

async function addPlantNote(plantId, noteData) {
    return apiRequest(`/plants/${plantId}/notes`, 'POST', noteData);
}

async function deletePlant(plantId) {
    return apiRequest(`/plants/${plantId}`, 'DELETE');
}

async function getPlantStats() {
    return apiRequest('/plants/stats', 'GET');
}

// Knowledge API Calls
async function getKnowledgeArticles(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/knowledge${queryParams ? `?${queryParams}` : ''}`, 'GET');
}

async function getKnowledgeArticle(articleId) {
    return apiRequest(`/knowledge/${articleId}`, 'GET');
}

async function searchFAQ(query, category = '') {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category) params.append('category', category);

    return apiRequest(`/faq/search${params.toString() ? `?${params.toString()}` : ''}`, 'GET', null, false);
}

async function getPlantGuidance(filters) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/guidance/plants${queryParams ? `?${queryParams}` : ''}`, 'GET');
}

async function getSeasonalTips(season = '') {
    const params = new URLSearchParams();
    if (season) params.append('season', season);

    return apiRequest(`/guidance/seasonal-tips${params.toString() ? `?${params.toString()}` : ''}`, 'GET');
}

// Chat API Calls
async function getChannelMessages(communityId, channelId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/chat/${communityId}/channels/${channelId}/messages${queryParams ? `?${queryParams}` : ''}`, 'GET');
}

async function getDirectMessages(userId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/chat/direct/${userId}${queryParams ? `?${queryParams}` : ''}`, 'GET');
}

// Weather API call
async function getWeatherByCity(city) {
    return apiRequest(`/weather/${encodeURIComponent(city)}`, 'GET');
}



// Health Check
async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Export all API functions
window.api = {
    apiRequest,

    // Auth
    loginUser,
    registerUser,
    logoutUser,
    getCurrentUser,
    updateUserProfile,
    changePassword,

    // User
    getUserProfile,
    getUserDashboard,
    getUserNotifications,
    markNotificationAsRead,
    deleteNotification,
    getWeatherSuggestions,
    updateUserSettings,

    // Community
    getCommunities,
    getCommunity,
    createCommunity,
    requestToJoinCommunity,
    getMyCommunities,
    approveJoinRequest,
    removeMember,
    createChannel,

    // Marketplace
    getMarketplaceItems,
    getMarketplaceItem,
    createMarketplaceItem,
    updateMarketplaceItem,
    deleteMarketplaceItem,
    getMyMarketplaceItems,

    // Plant
    getPlants,
    getPlant,
    createPlant,
    updatePlant,
    addPlantNote,
    deletePlant,
    getPlantStats,
    getUserPlants,
    getMyCommunities,


    // Knowledge
    getKnowledgeArticles,
    getKnowledgeArticle,
    searchFAQ,
    getPlantGuidance,
    getSeasonalTips,

    // Chat
    getChannelMessages,
    getDirectMessages,

    // Weather
    getWeatherByCity,
    getNotifications,

    // System
    checkServerHealth,
    getNotifications,
};