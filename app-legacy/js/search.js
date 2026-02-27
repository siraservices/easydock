// Marina Search and Filtering Functions

let allMarinas = [];
let filteredMarinas = [];

// Load marinas from Supabase
async function loadMarinas() {
    try {
        const client = window.getSupabaseClient();
        if (!client) {
            showError('Database connection not available. Please check your configuration.');
            return;
        }
        
        const { data, error } = await client
            .from('marinas')
            .select('*')
            .eq('is_active', true)
            .eq('is_approved', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        allMarinas = data || [];
        filteredMarinas = [...allMarinas];
        displayMarinas(filteredMarinas);
    } catch (error) {
        console.error('Error loading marinas:', error);
        showError('Failed to load marinas. Please try again.');
    }
}

// Filter marinas based on search criteria
function filterMarinas() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const stateFilter = document.getElementById('stateFilter')?.value || '';
    const maxPrice = parseFloat(document.getElementById('maxPriceFilter')?.value) || Infinity;
    const minBoatLength = parseInt(document.getElementById('minBoatLengthFilter')?.value) || 0;

    filteredMarinas = allMarinas.filter(marina => {
        // Text search (name, city, description)
        const matchesSearch = !searchTerm || 
            marina.name.toLowerCase().includes(searchTerm) ||
            marina.city.toLowerCase().includes(searchTerm) ||
            (marina.description && marina.description.toLowerCase().includes(searchTerm));

        // State filter
        const matchesState = !stateFilter || marina.state === stateFilter;

        // Price filter
        const matchesPrice = marina.base_price_per_day <= maxPrice;

        // Boat length filter
        const matchesLength = !minBoatLength || (marina.max_boat_length && marina.max_boat_length >= minBoatLength);

        return matchesSearch && matchesState && matchesPrice && matchesLength;
    });

    displayMarinas(filteredMarinas);
}

// Display marinas in the grid
function displayMarinas(marinas) {
    const container = document.getElementById('marinasContainer');
    if (!container) return;

    if (marinas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No marinas found</h3>
                <p>Try adjusting your search filters</p>
            </div>
        `;
        return;
    }

    container.innerHTML = marinas.map(marina => `
        <div class="marina-card" onclick="viewMarina('${marina.id}')">
            <img src="${marina.photos && marina.photos.length > 0 ? marina.photos[0] : 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400&h=200&fit=crop'}" 
                 alt="${marina.name}" 
                 class="marina-image"
                 onerror="this.src='https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400&h=200&fit=crop'">
            <div class="marina-content">
                <h3 class="marina-name">${marina.name}</h3>
                <p class="marina-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${marina.city}, ${marina.state}
                </p>
                <div class="marina-price">
                    $${marina.base_price_per_day.toFixed(2)}/day
                </div>
                ${marina.amenities && marina.amenities.length > 0 ? `
                    <div class="marina-amenities">
                        ${marina.amenities.slice(0, 3).map(amenity => `
                            <span class="amenity-tag">${amenity}</span>
                        `).join('')}
                    </div>
                ` : ''}
                ${marina.max_boat_length ? `
                    <p style="color: var(--gray-600); font-size: 0.875rem; margin-top: 0.5rem;">
                        <i class="fas fa-ruler"></i> Up to ${marina.max_boat_length}ft
                    </p>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// View marina details
function viewMarina(marinaId) {
    window.location.href = `marina-detail.html?id=${marinaId}`;
}

// Get unique states for filter dropdown
function populateStateFilter() {
    const states = [...new Set(allMarinas.map(m => m.state))].sort();
    const stateFilter = document.getElementById('stateFilter');
    if (stateFilter) {
        stateFilter.innerHTML = '<option value="">All States</option>' + 
            states.map(state => `<option value="${state}">${state}</option>`).join('');
    }
}

// Initialize search page
async function initSearch() {
    await loadMarinas();
    populateStateFilter();
    
    // Set up filter event listeners
    document.getElementById('searchInput')?.addEventListener('input', filterMarinas);
    document.getElementById('stateFilter')?.addEventListener('change', filterMarinas);
    document.getElementById('maxPriceFilter')?.addEventListener('input', filterMarinas);
    document.getElementById('minBoatLengthFilter')?.addEventListener('input', filterMarinas);
}

// Show error message
function showError(message) {
    const container = document.getElementById('marinasContainer');
    if (container) {
        container.innerHTML = `
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i> ${message}
            </div>
        `;
    }
}

// Export functions
window.searchFunctions = {
    loadMarinas,
    filterMarinas,
    displayMarinas,
    viewMarina,
    initSearch
};

