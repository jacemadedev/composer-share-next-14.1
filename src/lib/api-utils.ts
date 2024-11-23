import { supabase } from './supabase'

export async function initializeOrUpdateUserSettings(userId: string, data: Partial<{
  openai_api_key: string;
  plan: string;
  is_premium: boolean;
  theme: string;
}> = {}) {
  try {
    const timestamp = new Date().toISOString()
    
    // First try to update
    const { error: updateError } = await supabase
      .from('user_settings')
      .update({
        ...data,
        updated_at: timestamp
      })
      .eq('user_id', userId)

    // If no row exists, create one
    if (updateError?.code === 'PGRST116') {
      const { error: insertError } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          plan: 'free',
          is_premium: false,
          theme: 'light',
          created_at: timestamp,
          updated_at: timestamp,
          ...data
        })

      if (insertError) throw insertError
    } else if (updateError) {
      throw updateError
    }

    return { success: true }
  } catch (error) {
    console.error('Error managing user settings:', error)
    return { success: false, error }
  }
} 