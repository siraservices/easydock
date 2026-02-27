// Booking Management Functions

// Create a booking request
async function createBookingRequest(marinaId) {
    try {
        const user = await window.supabaseHelpers.getCurrentUser();
        if (!user) {
            alert('Please sign in to make a booking');
            window.location.href = 'auth.html';
            return;
        }

        // Get form data
        const checkInDate = document.getElementById('checkInDate').value;
        const checkOutDate = document.getElementById('checkOutDate').value;
        const boatLength = parseInt(document.getElementById('boatLength').value);
        const boatWidth = parseInt(document.getElementById('boatWidth').value);
        const specialRequests = document.getElementById('specialRequests').value;

        if (!checkInDate || !checkOutDate) {
            showAlert('Please select check-in and check-out dates', 'error');
            return;
        }

        const client = window.getSupabaseClient();
        if (!client) {
            showAlert('Database connection not available. Please check your configuration.', 'error');
            return;
        }
        
        // Get marina to calculate price
        const { data: marina, error: marinaError } = await client
            .from('marinas')
            .select('*')
            .eq('id', marinaId)
            .single();

        if (marinaError || !marina) {
            showAlert('Marina not found', 'error');
            return;
        }

        // Calculate pricing
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        if (days <= 0) {
            showAlert('Check-out date must be after check-in date', 'error');
            return;
        }

        // Check for conflicting bookings (prevent double-booking)
        const { data: conflicts, error: conflictError } = await client
            .from('bookings')
            .select('id')
            .eq('marina_id', marinaId)
            .in('status', ['pending', 'approved', 'confirmed'])
            .lte('check_in_date', checkOutDate)
            .gte('check_out_date', checkInDate);

        if (conflictError) {
            console.error('Error checking availability:', conflictError);
        }

        if (conflicts && conflicts.length > 0) {
            showAlert('These dates are not available. Please select different dates.', 'error');
            return;
        }

        const basePrice = marina.base_price_per_day * days;
        const commissionAmount = basePrice * CONFIG.stripe.commissionRate;
        const marinaPayout = basePrice;
        const totalPrice = basePrice + commissionAmount;

        // Create booking
        const { data: booking, error: bookingError } = await client
            .from('bookings')
            .insert({
                marina_id: marinaId,
                boat_owner_id: user.id,
                check_in_date: checkInDate,
                check_out_date: checkOutDate,
                boat_length: boatLength,
                boat_width: boatWidth,
                total_price: totalPrice,
                commission_amount: commissionAmount,
                marina_payout: marinaPayout,
                status: 'pending',
                payment_status: 'pending',
                special_requests: specialRequests || null
            })
            .select()
            .single();

        if (bookingError) {
            console.error('Booking error:', bookingError);
            showAlert('Failed to create booking: ' + bookingError.message, 'error');
            return;
        }

        // Send email notification (if EmailJS configured)
        if (CONFIG.emailjs.serviceId && CONFIG.emailjs.serviceId !== 'YOUR_EMAILJS_SERVICE_ID') {
            sendBookingEmail(booking, marina, user);
        }

        showAlert('Booking request submitted! The marina owner will review it shortly.', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);

    } catch (error) {
        console.error('Error creating booking:', error);
        showAlert('An error occurred. Please try again.', 'error');
    }
}

// Approve booking (for marina owners)
async function approveBooking(bookingId) {
    try {
        const user = await window.supabaseHelpers.getCurrentUser();
        if (!user) return;

        const client = window.getSupabaseClient();
        if (!client) {
            showAlert('Database connection not available.', 'error');
            return;
        }

        // Verify user owns the marina
        const { data: booking, error: bookingError } = await client
            .from('bookings')
            .select(`
                *,
                marinas!inner(owner_id)
            `)
            .eq('id', bookingId)
            .single();

        if (bookingError || booking.marinas.owner_id !== user.id) {
            showAlert('Unauthorized', 'error');
            return;
        }

        // Update booking status
        const { error: updateError } = await client
            .from('bookings')
            .update({ status: 'approved' })
            .eq('id', bookingId);

        if (updateError) throw updateError;

        showAlert('Booking approved!', 'success');
        loadBookings(); // Reload bookings list

    } catch (error) {
        console.error('Error approving booking:', error);
        showAlert('Failed to approve booking', 'error');
    }
}

// Decline booking (for marina owners)
async function declineBooking(bookingId) {
    try {
        const user = await window.supabaseHelpers.getCurrentUser();
        if (!user) return;

        const client = window.getSupabaseClient();
        if (!client) {
            showAlert('Database connection not available.', 'error');
            return;
        }
        
        // Verify user owns the marina
        const { data: booking, error: bookingError } = await client
            .from('bookings')
            .select(`
                *,
                marinas!inner(owner_id)
            `)
            .eq('id', bookingId)
            .single();

        if (bookingError || booking.marinas.owner_id !== user.id) {
            showAlert('Unauthorized', 'error');
            return;
        }

        // Update booking status
        const { error: updateError } = await client
            .from('bookings')
            .update({ status: 'declined' })
            .eq('id', bookingId);

        if (updateError) throw updateError;

        showAlert('Booking declined', 'info');
        loadBookings(); // Reload bookings list

    } catch (error) {
        console.error('Error declining booking:', error);
        showAlert('Failed to decline booking', 'error');
    }
}

// Cancel booking (for boat owners)
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
        const user = await window.supabaseHelpers.getCurrentUser();
        if (!user) return;

        const client = window.getSupabaseClient();
        if (!client) {
            showAlert('Database connection not available.', 'error');
            return;
        }
        
        // Verify user owns the booking
        const { data: booking, error: bookingError } = await client
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .eq('boat_owner_id', user.id)
            .single();

        if (bookingError || !booking) {
            showAlert('Booking not found or unauthorized', 'error');
            return;
        }

        // Update booking status
        const { error: updateError } = await client
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId);

        if (updateError) throw updateError;

        showAlert('Booking cancelled', 'info');
        loadBookings(); // Reload bookings list

    } catch (error) {
        console.error('Error cancelling booking:', error);
        showAlert('Failed to cancel booking', 'error');
    }
}

// Load bookings for current user
async function loadBookings() {
    const user = await window.supabaseHelpers.getCurrentUser();
    if (!user) return [];

    try {
        const client = window.getSupabaseClient();
        if (!client) {
            return [];
        }
        
        const profile = await window.supabaseHelpers.getUserProfile(user.id);
        const isMarinaOwner = profile && profile.user_type === 'marina_owner';

        let query = client
            .from('bookings')
            .select(`
                *,
                marinas(name, city, state, photos, phone, email),
                boat_owner:user_profiles!bookings_boat_owner_id_fkey(full_name, email)
            `)
            .order('created_at', { ascending: false });

        if (isMarinaOwner) {
            // Marina owners see bookings for their marinas
            // First get their marina IDs
            const { data: marinas } = await client
                .from('marinas')
                .select('id')
                .eq('owner_id', user.id);
            
            const marinaIds = marinas?.map(m => m.id) || [];
            
            if (marinaIds.length > 0) {
                query = query.in('marina_id', marinaIds);
            } else {
                return []; // No marinas, no bookings
            }
        } else {
            // Boat owners see their own bookings
            query = query.eq('boat_owner_id', user.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data || [];

    } catch (error) {
        console.error('Error loading bookings:', error);
        return [];
    }
}

// Send booking email notification
async function sendBookingEmail(booking, marina, user) {
    // This would integrate with EmailJS
    // For now, just log it
    console.log('Booking email notification:', {
        bookingId: booking.id,
        marinaName: marina.name,
        userEmail: user.email
    });
}

// Show alert message
function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '100px';
    alert.style.right = '20px';
    alert.style.zIndex = '10000';
    alert.style.minWidth = '300px';
    alert.style.maxWidth = '500px';

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Export functions
window.bookingFunctions = {
    createBookingRequest,
    approveBooking,
    declineBooking,
    cancelBooking,
    loadBookings
};

