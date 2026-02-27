// Supabase Client Setup
// This file initializes the Supabase client and provides helper functions

// Initialize Supabase client - wait for CONFIG to be available
let supabaseClient = null;

function initSupabaseClient() {
    if (!window.CONFIG || !window.CONFIG.supabase) {
        console.error('CONFIG not loaded. Make sure config.js is loaded before this script.');
        return null;
    }

    const supabaseUrl = window.CONFIG.supabase.url;
    const supabaseAnonKey = window.CONFIG.supabase.anonKey;

    if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL' || 
        !supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
        console.error('Supabase credentials not configured. Please update config.js');
        return null;
    }

    // Check if supabase is already loaded (from CDN in HTML)
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);
        initializeSupabase();
        return supabaseClient;
    } else {
        // Load Supabase library dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
        script.type = 'module';
        document.head.appendChild(script);
        
        script.onload = () => {
            if (typeof supabase !== 'undefined') {
                supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);
                window.supabaseClient = supabaseClient;
                initializeSupabase();
            }
        };
    }
}

// Initialize Supabase functionality
function initializeSupabase() {
    if (!supabaseClient) return;
    
    // Set up auth state listener
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            console.log('User signed in:', session.user);
            // Redirect to dashboard if on auth page
            if (window.location.pathname.includes('auth.html')) {
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            }
        } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabaseClient);
} else {
    initSupabaseClient();
}

// Helper function to get current user
async function getCurrentUser() {
    if (!supabaseClient) {
        await waitForSupabase();
    }
    if (!supabaseClient) return null;
    
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) {
        console.error('Error getting user:', error);
        return null;
    }
    return user;
}

// Helper function to get user profile
async function getUserProfile(userId) {
    if (!supabaseClient) {
        await waitForSupabase();
    }
    if (!supabaseClient) return null;
    
    const { data, error } = await supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
    return data;
}

// Helper function to check if user is admin
async function isAdmin(userId) {
    const profile = await getUserProfile(userId);
    return profile && profile.role === 'admin';
}

// Wait for Supabase client to be initialized
function waitForSupabase() {
    return new Promise((resolve) => {
        if (supabaseClient) {
            resolve();
            return;
        }
        const checkInterval = setInterval(() => {
            if (supabaseClient) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);
        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            resolve();
        }, 5000);
    });
}

// Export functions for use in other files
window.supabaseHelpers = {
    getCurrentUser,
    getUserProfile,
    isAdmin,
    client: () => supabaseClient,
    waitForSupabase
};

// Make supabaseClient globally available
window.getSupabaseClient = () => {
    if (!supabaseClient) {
        initSupabaseClient();
    }
    return supabaseClient;
};

