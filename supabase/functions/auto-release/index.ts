import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    console.log('Running auto-release check at:', now.toISOString());
    console.log('Checking for bookings before:', fifteenMinutesAgo.toISOString());

    // Find confirmed bookings where:
    // 1. The booking date is today
    // 2. The start time has passed by more than 15 minutes
    // 3. Status is still 'confirmed' (not checked in)
    const { data: overdueBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id, title, room_id, user_id, start_time')
      .eq('date', today)
      .eq('status', 'confirmed')
      .lt('start_time', currentTime);

    if (fetchError) {
      console.error('Error fetching bookings:', fetchError);
      throw fetchError;
    }

    console.log('Found bookings to check:', overdueBookings?.length || 0);

    let releasedCount = 0;
    
    if (overdueBookings && overdueBookings.length > 0) {
      for (const booking of overdueBookings) {
        // Check if booking start time + 15 minutes has passed
        const [hours, minutes] = booking.start_time.split(':').map(Number);
        const bookingStartTime = new Date(now);
        bookingStartTime.setHours(hours, minutes, 0, 0);
        
        const releaseTime = new Date(bookingStartTime.getTime() + 15 * 60 * 1000);
        
        if (now > releaseTime) {
          // Mark as no_show
          const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: 'no_show' })
            .eq('id', booking.id);

          if (updateError) {
            console.error('Error updating booking:', booking.id, updateError);
          } else {
            console.log('Released booking:', booking.id, booking.title);
            releasedCount++;

            // Log analytics event
            await supabase.from('analytics_events').insert({
              event_type: 'auto_release',
              room_id: booking.room_id,
              user_id: booking.user_id,
              metadata: { booking_id: booking.id, reason: 'no_checkin_15min' }
            });
          }
        }
      }
    }

    const result = {
      success: true,
      checked_at: now.toISOString(),
      bookings_checked: overdueBookings?.length || 0,
      bookings_released: releasedCount,
    };

    console.log('Auto-release result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Auto-release error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
