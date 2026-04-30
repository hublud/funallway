import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { formatPhoneNumberForDb } from '@/utils/whatsapp';

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    // 1. Fetch all profiles with whatsapp_number
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, whatsapp_number');
    
    if (fetchError) throw fetchError;
    
    let updatedCount = 0;
    
    // 2. Iterate and update
    for (const profile of profiles || []) {
      if (profile.whatsapp_number) {
        const formatted = formatPhoneNumberForDb(profile.whatsapp_number);
        
        if (formatted !== profile.whatsapp_number) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ whatsapp_number: formatted })
            .eq('id', profile.id);
            
          if (!updateError) updatedCount++;
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully updated ${updatedCount} phone numbers.`,
      totalProcessed: profiles?.length || 0
    });
    
  } catch (err: any) {
    console.error('Migration Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
