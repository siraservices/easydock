// Authentication Functions
// Handles signup, login, logout, and user profile management

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', async () => {
    const user = await window.supabaseHelpers.getCurrentUser();
    if (user) {
        updateUIForLoggedInUser(user);
    } else {
        updateUIForLoggedOutUser();
    }
});

// Sign Up Function
async function signUp(email, password, fullName, userType) {
    try {
        const client = window.getSupabaseClient();
        if (!client) {
            return { success: false, error: 'Supabase client not initialized. Please check your configuration.' };
        }
        
        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await client.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    user_type: userType
                }
            }
        });

        if (authError) throw authError;

        // Update user profile with additional info
        if (authData.user) {
            const { error: profileError } = await client
                .from('user_profiles')
                .update({
                    full_name: fullName,
                    user_type: userType
                })
                .eq('id', authData.user.id);

            if (profileError) {
                console.error('Error updating profile:', profileError);
            }
        }

        return { success: true, user: authData.user, message: 'Account created successfully!' };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }
}

// Sign In Function
async function signIn(email, password) {
    try {
        const client = window.getSupabaseClient();
        if (!client) {
            return { success: false, error: 'Supabase client not initialized. Please check your configuration.' };
        }
        
        const { data, error } = await client.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        return { success: true, user: data.user, message: 'Signed in successfully!' };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }
}

// Sign Out Function
async function signOut() {
    try {
        const client = window.getSupabaseClient();
        if (!client) {
            return { success: false, error: 'Supabase client not initialized.' };
        }
        
        const { error } = await client.auth.signOut();
        if (error) throw error;

        // Redirect to home page
        window.location.href = 'index.html';
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
}

// Update User Profile
async function updateProfile(userId, updates) {
    try {
        const client = window.getSupabaseClient();
        if (!client) {
            return { success: false, error: 'Supabase client not initialized.' };
        }
        
        const { data, error } = await client
            .from('user_profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, error: error.message };
    }
}

// Get Current User Profile
async function getCurrentUserProfile() {
    const user = await window.supabaseHelpers.getCurrentUser();
    if (!user) return null;

    return await window.supabaseHelpers.getUserProfile(user.id);
}

// Update UI based on authentication status
function updateUIForLoggedInUser(user) {
    // Show user menu, hide login buttons
    const loginButtons = document.querySelectorAll('.login-btn, .signup-btn');
    const userMenu = document.querySelector('.user-menu');
    
    loginButtons.forEach(btn => btn.style.display = 'none');
    if (userMenu) userMenu.style.display = 'block';
    
    // Update user name if element exists
    const userNameEl = document.querySelector('.user-name');
    if (userNameEl) {
        userNameEl.textContent = user.email;
    }
}

function updateUIForLoggedOutUser() {
    // Show login buttons, hide user menu
    const loginButtons = document.querySelectorAll('.login-btn, .signup-btn');
    const userMenu = document.querySelector('.user-menu');
    
    loginButtons.forEach(btn => btn.style.display = 'block');
    if (userMenu) userMenu.style.display = 'none';
}

// Export functions for use in other files
window.authFunctions = {
    signUp,
    signIn,
    signOut,
    updateProfile,
    getCurrentUserProfile,
    getCurrentUser: window.supabaseHelpers.getCurrentUser
};

