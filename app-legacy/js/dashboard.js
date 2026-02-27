// Dashboard Functions

let currentUser = null;
let userProfile = null;

// Initialize dashboard
async function initDashboard() {
    // Check authentication
    currentUser = await window.supabaseHelpers.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'auth.html';
        return;
    }

    // Get user profile
    userProfile = await window.supabaseHelpers.getUserProfile(currentUser.id);
    if (!userProfile) {
        console.error('User profile not found');
        return;
    }

    // Update UI
    document.querySelector('.user-name').textContent = currentUser.email || userProfile.full_name || 'User';

    // Show appropriate tabs based on user type
    if (userProfile.user_type === 'marina_owner') {
        document.getElementById('tab-marinas').style.display = 'block';
        document.getElementById('tab-create-marina').style.display = 'block';
    }

    // Load initial content
    await loadDashboardContent();

    // Setup create marina form
    document.getElementById('createMarinaForm')?.addEventListener('submit', handleCreateMarina);

    // Setup edit marina form
    document.getElementById('editMarinaForm')?.addEventListener('submit', handleUpdateMarina);

    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('dashboardContent').style.display = 'block';
}

// Load dashboard content
async function loadDashboardContent() {
    await loadBookings();
    if (userProfile.user_type === 'marina_owner') {
        await loadMarinas();
    }
}

// Load and display bookings
async function loadBookings() {
    const bookings = await window.bookingFunctions.loadBookings();
    const container = document.getElementById('bookingsList');

    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>No bookings yet</h3>
                <p>Start by searching for marinas to book</p>
                <a href="search.html" class="btn btn-primary" style="margin-top: 1rem;">Search Marinas</a>
            </div>
        `;
        return;
    }

    const isMarinaOwner = userProfile.user_type === 'marina_owner';

    container.innerHTML = bookings.map(booking => {
        const marina = booking.marinas;
        const boatOwner = booking.boat_owner;
        const statusClass = `status-${booking.status}`;

        return `
            <div class="card" style="margin-bottom: 1rem;">
                <div class="card-header">
                    <div>
                        <h3 style="margin-bottom: 0.5rem;">${marina.name}</h3>
                        <p style="color: var(--gray-600); font-size: 0.875rem;">
                            ${marina.city}, ${marina.state}
                        </p>
                    </div>
                    <span class="status-badge ${statusClass}">${booking.status}</span>
                </div>
                <div style="margin-bottom: 1rem;">
                    <p><strong>Dates:</strong> ${new Date(booking.check_in_date).toLocaleDateString()} - ${new Date(booking.check_out_date).toLocaleDateString()}</p>
                    <p><strong>Total Price:</strong> $${booking.total_price.toFixed(2)}</p>
                    ${isMarinaOwner ? `
                        <p><strong>Boat Owner:</strong> ${boatOwner?.full_name || boatOwner?.email || 'N/A'}</p>
                        <p><strong>Boat Size:</strong> ${booking.boat_length}ft x ${booking.boat_width}ft</p>
                    ` : ''}
                    ${booking.special_requests ? `
                        <p><strong>Special Requests:</strong> ${booking.special_requests}</p>
                    ` : ''}
                    ${!isMarinaOwner && (booking.status === 'approved' || booking.status === 'confirmed') && (marina.phone || marina.email) ? `
                        <div class="contact-info" style="margin-top: 1rem;">
                            <p style="font-weight: 600; margin-bottom: 0.5rem;"><i class="fas fa-info-circle"></i> Contact marina to arrange payment:</p>
                            ${marina.phone ? `<p><i class="fas fa-phone"></i> ${marina.phone}</p>` : ''}
                            ${marina.email ? `<p><i class="fas fa-envelope"></i> ${marina.email}</p>` : ''}
                        </div>
                    ` : ''}
                </div>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    ${isMarinaOwner && booking.status === 'pending' ? `
                        <button onclick="approveBooking('${booking.id}')" class="btn btn-primary">Approve</button>
                        <button onclick="declineBooking('${booking.id}')" class="btn btn-danger">Decline</button>
                    ` : ''}
                    ${!isMarinaOwner && (booking.status === 'pending' || booking.status === 'approved') ? `
                        <button onclick="cancelBooking('${booking.id}')" class="btn btn-danger">Cancel</button>
                    ` : ''}
                    <a href="marina-detail.html?id=${marina.id}" class="btn btn-secondary">View Marina</a>
                </div>
            </div>
        `;
    }).join('');
}

// Load and display marinas (for marina owners)
async function loadMarinas() {
    if (userProfile.user_type !== 'marina_owner') return;

    try {
        const client = window.getSupabaseClient();
        if (!client) {
            console.error('Supabase client not available');
            return;
        }
        
        const { data: marinas, error } = await client
            .from('marinas')
            .select('*')
            .eq('owner_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const container = document.getElementById('marinasList');

        if (marinas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-anchor"></i>
                    <h3>No marinas listed yet</h3>
                    <p>Create your first marina listing to get started</p>
                </div>
            `;
            return;
        }

        container.innerHTML = marinas.map(marina => `
            <div class="card" style="margin-bottom: 1rem;">
                <div class="card-header">
                    <div>
                        <h3 style="margin-bottom: 0.5rem;">${marina.name}</h3>
                        <p style="color: var(--gray-600); font-size: 0.875rem;">
                            ${marina.city}, ${marina.state}
                        </p>
                    </div>
                    <div>
                        ${marina.is_approved ? `
                            <span class="status-badge status-confirmed">Approved</span>
                        ` : `
                            <span class="status-badge status-pending">Pending Approval</span>
                        `}
                        ${marina.is_active ? `
                            <span class="status-badge status-confirmed">Active</span>
                        ` : `
                            <span class="status-badge status-cancelled">Inactive</span>
                        `}
                    </div>
                </div>
                <div style="margin-bottom: 1rem;">
                    <p><strong>Price:</strong> $${marina.base_price_per_day.toFixed(2)}/day</p>
                    ${marina.max_boat_length ? `
                        <p><strong>Max Boat Length:</strong> ${marina.max_boat_length}ft</p>
                    ` : ''}
                </div>
                <div style="display: flex; gap: 1rem;">
                    <a href="marina-detail.html?id=${marina.id}" class="btn btn-secondary">View</a>
                    <button onclick="editMarina('${marina.id}')" class="btn btn-secondary">Edit</button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading marinas:', error);
    }
}

// Handle create marina form submission
async function handleCreateMarina(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('marinaName').value,
        description: document.getElementById('marinaDescription').value,
        address: document.getElementById('marinaAddress').value,
        city: document.getElementById('marinaCity').value,
        state: document.getElementById('marinaState').value.toUpperCase(),
        zip_code: document.getElementById('marinaZip').value,
        base_price_per_day: parseFloat(document.getElementById('pricePerDay').value),
        base_price_per_week: document.getElementById('pricePerWeek').value ? parseFloat(document.getElementById('pricePerWeek').value) : null,
        base_price_per_month: document.getElementById('pricePerMonth').value ? parseFloat(document.getElementById('pricePerMonth').value) : null,
        max_boat_length: document.getElementById('maxBoatLength').value ? parseInt(document.getElementById('maxBoatLength').value) : null,
        max_boat_width: document.getElementById('maxBoatWidth').value ? parseInt(document.getElementById('maxBoatWidth').value) : null,
        phone: document.getElementById('marinaPhone').value || null,
        email: document.getElementById('marinaEmail').value || null,
        amenities: Array.from(document.querySelectorAll('.amenity-checkbox:checked')).map(cb => cb.value),
        photos: [], // Photo upload can be added later
        is_active: true,
        is_approved: false // Requires admin approval
    };

    try {
        const client = window.getSupabaseClient();
        if (!client) {
            showAlert('Database connection not available.', 'error');
            return;
        }
        
        const { data, error } = await client
            .from('marinas')
            .insert(formData)
            .select()
            .single();

        if (error) throw error;

        showAlert('Marina listing created! It will be reviewed by an admin before going live.', 'success');
        
        // Reset form
        e.target.reset();
        
        // Switch to marinas tab and reload
        switchTab('marinas');
        await loadMarinas();

    } catch (error) {
        console.error('Error creating marina:', error);
        showAlert('Failed to create marina listing: ' + error.message, 'error');
    }
}

// Edit marina - open modal with pre-populated form
async function editMarina(marinaId) {
    try {
        const client = window.getSupabaseClient();
        if (!client) {
            showAlert('Database connection not available.', 'error');
            return;
        }

        // Fetch marina data
        const { data: marina, error } = await client
            .from('marinas')
            .select('*')
            .eq('id', marinaId)
            .eq('owner_id', currentUser.id)
            .single();

        if (error || !marina) {
            showAlert('Marina not found or unauthorized.', 'error');
            return;
        }

        // Populate form fields
        document.getElementById('editMarinaId').value = marina.id;
        document.getElementById('editMarinaName').value = marina.name || '';
        document.getElementById('editMarinaDescription').value = marina.description || '';
        document.getElementById('editMarinaAddress').value = marina.address || '';
        document.getElementById('editMarinaCity').value = marina.city || '';
        document.getElementById('editMarinaState').value = marina.state || '';
        document.getElementById('editMarinaZip').value = marina.zip_code || '';
        document.getElementById('editPricePerDay').value = marina.base_price_per_day || '';
        document.getElementById('editPricePerWeek').value = marina.base_price_per_week || '';
        document.getElementById('editPricePerMonth').value = marina.base_price_per_month || '';
        document.getElementById('editMaxBoatLength').value = marina.max_boat_length || '';
        document.getElementById('editMaxBoatWidth').value = marina.max_boat_width || '';
        document.getElementById('editMarinaPhone').value = marina.phone || '';
        document.getElementById('editMarinaEmail').value = marina.email || '';

        // Set amenities checkboxes
        const amenities = marina.amenities || [];
        document.querySelectorAll('.edit-amenity-checkbox').forEach(cb => {
            cb.checked = amenities.includes(cb.value);
        });

        // Show modal
        document.getElementById('editMarinaModal').style.display = 'flex';

    } catch (error) {
        console.error('Error loading marina for edit:', error);
        showAlert('Failed to load marina details.', 'error');
    }
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editMarinaModal').style.display = 'none';
    document.getElementById('editMarinaForm').reset();
}

// Handle edit marina form submission
async function handleUpdateMarina(e) {
    e.preventDefault();

    const marinaId = document.getElementById('editMarinaId').value;

    const formData = {
        name: document.getElementById('editMarinaName').value,
        description: document.getElementById('editMarinaDescription').value,
        address: document.getElementById('editMarinaAddress').value,
        city: document.getElementById('editMarinaCity').value,
        state: document.getElementById('editMarinaState').value.toUpperCase(),
        zip_code: document.getElementById('editMarinaZip').value,
        base_price_per_day: parseFloat(document.getElementById('editPricePerDay').value),
        base_price_per_week: document.getElementById('editPricePerWeek').value ? parseFloat(document.getElementById('editPricePerWeek').value) : null,
        base_price_per_month: document.getElementById('editPricePerMonth').value ? parseFloat(document.getElementById('editPricePerMonth').value) : null,
        max_boat_length: document.getElementById('editMaxBoatLength').value ? parseInt(document.getElementById('editMaxBoatLength').value) : null,
        max_boat_width: document.getElementById('editMaxBoatWidth').value ? parseInt(document.getElementById('editMaxBoatWidth').value) : null,
        phone: document.getElementById('editMarinaPhone').value || null,
        email: document.getElementById('editMarinaEmail').value || null,
        amenities: Array.from(document.querySelectorAll('.edit-amenity-checkbox:checked')).map(cb => cb.value)
    };

    try {
        const client = window.getSupabaseClient();
        if (!client) {
            showAlert('Database connection not available.', 'error');
            return;
        }

        const { error } = await client
            .from('marinas')
            .update(formData)
            .eq('id', marinaId)
            .eq('owner_id', currentUser.id);

        if (error) throw error;

        showAlert('Marina updated successfully!', 'success');
        closeEditModal();
        await loadMarinas();

    } catch (error) {
        console.error('Error updating marina:', error);
        showAlert('Failed to update marina: ' + error.message, 'error');
    }
}

// Tab switching
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(`tab-content-${tabName}`).style.display = 'block';
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// Booking actions
async function approveBooking(id) {
    await window.bookingFunctions.approveBooking(id);
    await loadBookings();
}

async function declineBooking(id) {
    await window.bookingFunctions.declineBooking(id);
    await loadBookings();
}

async function cancelBooking(id) {
    await window.bookingFunctions.cancelBooking(id);
    await loadBookings();
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
document.addEventListener('DOMContentLoaded', initDashboard);

// Export functions
window.dashboardFunctions = {
    initDashboard,
    loadBookings,
    loadMarinas,
    switchTab
};

