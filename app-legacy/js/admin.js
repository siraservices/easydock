// Admin Panel Functions

// Initialize admin panel
async function initAdmin() {
    // Check authentication
    const user = await window.supabaseHelpers.getCurrentUser();
    if (!user) {
        window.location.href = 'auth.html';
        return;
    }

    // Check if user is admin
    const isAdminUser = await window.supabaseHelpers.isAdmin(user.id);
    if (!isAdminUser) {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('unauthorized').style.display = 'block';
        return;
    }

    // Update UI
    document.querySelector('.user-name').textContent = user.email;

    // Load admin data
    await loadAdminStats();
    await loadPendingMarinas();
    await loadAllBookings();
    await loadAllUsers();

    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
}

// Load admin statistics
async function loadAdminStats() {
    try {
        const client = window.getSupabaseClient();
        if (!client) {
            console.error('Supabase client not available');
            return;
        }
        
        // Get user count
        const { count: userCount } = await client
            .from('user_profiles')
            .select('*', { count: 'exact', head: true });

        // Get marina count
        const { count: marinaCount } = await client
            .from('marinas')
            .select('*', { count: 'exact', head: true });

        // Get booking count
        const { count: bookingCount } = await client
            .from('bookings')
            .select('*', { count: 'exact', head: true });

        // Get total revenue (sum of commission amounts)
        const { data: bookings } = await client
            .from('bookings')
            .select('commission_amount')
            .eq('payment_status', 'paid');

        const totalRevenue = bookings?.reduce((sum, b) => sum + (parseFloat(b.commission_amount) || 0), 0) || 0;

        // Update stats
        document.getElementById('statUsers').textContent = userCount || 0;
        document.getElementById('statMarinas').textContent = marinaCount || 0;
        document.getElementById('statBookings').textContent = bookingCount || 0;
        document.getElementById('statRevenue').textContent = '$' + totalRevenue.toFixed(2);

    } catch (error) {
        console.error('Error loading admin stats:', error);
    }
}

// Load pending marinas for approval
async function loadPendingMarinas() {
    try {
        const client = window.getSupabaseClient();
        if (!client) {
            console.error('Supabase client not available');
            return;
        }
        
        const { data: marinas, error } = await client
            .from('marinas')
            .select(`
                *,
                owner:user_profiles!marinas_owner_id_fkey(full_name, email)
            `)
            .eq('is_approved', false)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const container = document.getElementById('pendingMarinas');

        if (marinas.length === 0) {
            container.innerHTML = '<p style="color: var(--gray-600);">No pending marina approvals</p>';
            return;
        }

        container.innerHTML = marinas.map(marina => `
            <div class="card" style="margin-bottom: 1rem;">
                <div class="card-header">
                    <div>
                        <h3 style="margin-bottom: 0.5rem;">${marina.name}</h3>
                        <p style="color: var(--gray-600); font-size: 0.875rem;">
                            ${marina.city}, ${marina.state} | Owner: ${marina.owner?.full_name || marina.owner?.email || 'N/A'}
                        </p>
                    </div>
                    <span class="status-badge status-pending">Pending</span>
                </div>
                <div style="margin-bottom: 1rem;">
                    <p><strong>Address:</strong> ${marina.address}</p>
                    <p><strong>Price:</strong> $${marina.base_price_per_day.toFixed(2)}/day</p>
                    ${marina.description ? `<p><strong>Description:</strong> ${marina.description}</p>` : ''}
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button onclick="approveMarina('${marina.id}')" class="btn btn-primary">Approve</button>
                    <button onclick="rejectMarina('${marina.id}')" class="btn btn-danger">Reject</button>
                    <a href="marina-detail.html?id=${marina.id}" class="btn btn-secondary">View Details</a>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading pending marinas:', error);
    }
}

// Load all bookings
async function loadAllBookings() {
    try {
        const client = window.getSupabaseClient();
        if (!client) {
            console.error('Supabase client not available');
            return;
        }
        
        const { data: bookings, error } = await client
            .from('bookings')
            .select(`
                *,
                marinas(name, city, state),
                boat_owner:user_profiles!bookings_boat_owner_id_fkey(full_name, email)
            `)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        const container = document.getElementById('allBookings');

        if (bookings.length === 0) {
            container.innerHTML = '<p style="color: var(--gray-600);">No bookings yet</p>';
            return;
        }

        container.innerHTML = bookings.map(booking => {
            const statusClass = `status-${booking.status}`;
            return `
                <div class="card" style="margin-bottom: 1rem;">
                    <div class="card-header">
                        <div>
                            <h3 style="margin-bottom: 0.5rem;">${booking.marinas.name}</h3>
                            <p style="color: var(--gray-600); font-size: 0.875rem;">
                                ${booking.marinas.city}, ${booking.marinas.state}
                            </p>
                        </div>
                        <span class="status-badge ${statusClass}">${booking.status}</span>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <p><strong>Boat Owner:</strong> ${booking.boat_owner?.full_name || booking.boat_owner?.email || 'N/A'}</p>
                        <p><strong>Dates:</strong> ${new Date(booking.check_in_date).toLocaleDateString()} - ${new Date(booking.check_out_date).toLocaleDateString()}</p>
                        <p><strong>Total Price:</strong> $${booking.total_price.toFixed(2)}</p>
                        <p><strong>Commission:</strong> $${booking.commission_amount.toFixed(2)}</p>
                        <p><strong>Payment Status:</strong> ${booking.payment_status}</p>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// Load all users
async function loadAllUsers() {
    try {
        const client = window.getSupabaseClient();
        if (!client) {
            console.error('Supabase client not available');
            return;
        }
        
        const { data: users, error } = await client
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        const container = document.getElementById('allUsers');

        if (users.length === 0) {
            container.innerHTML = '<p style="color: var(--gray-600);">No users found</p>';
            return;
        }

        container.innerHTML = users.map(user => `
            <div class="card" style="margin-bottom: 1rem;">
                <div class="card-header">
                    <div>
                        <h3 style="margin-bottom: 0.5rem;">${user.full_name || 'No Name'}</h3>
                        <p style="color: var(--gray-600); font-size: 0.875rem;">${user.email}</p>
                    </div>
                    <span class="status-badge status-${user.user_type === 'marina_owner' ? 'confirmed' : 'pending'}">
                        ${user.user_type}
                    </span>
                </div>
                <div>
                    <p><strong>Type:</strong> ${user.user_type}</p>
                    <p><strong>Role:</strong> ${user.role}</p>
                    <p><strong>Joined:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Approve marina
async function approveMarina(marinaId) {
    if (!confirm('Approve this marina listing?')) return;

    try {
        const client = window.getSupabaseClient();
        if (!client) {
            showAlert('Database connection not available.', 'error');
            return;
        }
        
        const { error } = await client
            .from('marinas')
            .update({ is_approved: true })
            .eq('id', marinaId);

        if (error) throw error;

        showAlert('Marina approved successfully!', 'success');
        await loadPendingMarinas();
        await loadAdminStats();

    } catch (error) {
        console.error('Error approving marina:', error);
        showAlert('Failed to approve marina', 'error');
    }
}

// Reject marina
async function rejectMarina(marinaId) {
    if (!confirm('Reject this marina listing? It will be removed from the platform.')) return;

    try {
        const client = window.getSupabaseClient();
        if (!client) {
            showAlert('Database connection not available.', 'error');
            return;
        }
        
        const { error } = await client
            .from('marinas')
            .update({ is_active: false, is_approved: false })
            .eq('id', marinaId);

        if (error) throw error;

        showAlert('Marina rejected', 'info');
        await loadPendingMarinas();
        await loadAdminStats();

    } catch (error) {
        console.error('Error rejecting marina:', error);
        showAlert('Failed to reject marina', 'error');
    }
}

// Switch admin tab
function switchAdminTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(`admin-tab-content-${tabName}`).style.display = 'block';
    document.getElementById(`admin-tab-${tabName}`).classList.add('active');
}

// Show alert
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '100px';
    alert.style.right = '20px';
    alert.style.zIndex = '10000';
    alert.style.minWidth = '300px';

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initAdmin);

// Export functions
window.adminFunctions = {
    initAdmin,
    loadAdminStats,
    loadPendingMarinas,
    loadAllBookings,
    loadAllUsers,
    approveMarina,
    rejectMarina,
    switchAdminTab
};

