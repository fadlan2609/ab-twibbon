// js/supabase.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// GANTI dengan URL dan anon key dari project Supabase Anda
// Bisa dilihat di Settings > API
const supabaseUrl = 'https://ctqzcymtwxqsuqulfprs.supabase.co'
const supabaseKey = 'sb_publishable_57zATxRSJOHFBWrSD_YxZg_s1PaeFuV'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Fungsi untuk upload twibbon
export async function createTwibbon(name, description, file) {
  try {
    // 1. Upload file ke storage
    const fileName = `twibbons/${Date.now()}_${file.name}`
    const { data: storageData, error: storageError } = await supabase.storage
      .from('twibbon-images')
      .upload(fileName, file)
    
    if (storageError) throw storageError
    
    // 2. Dapatkan public URL
    const { data: { publicUrl } } = supabase.storage
      .from('twibbon-images')
      .getPublicUrl(fileName)
    
    // 3. Simpan data ke database
    const { data, error } = await supabase
      .from('twibbons')
      .insert([
        {
          name: name,
          description: description || '',
          image_url: publicUrl,
          views: 0,
          downloads: 0,
          created_at: new Date().toISOString()
        }
      ])
      .select()
    
    if (error) throw error
    
    return {
      id: data[0].id,
      ...data[0]
    }
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// Fungsi untuk ambil semua twibbon
export async function getAllTwibbons() {
  const { data, error } = await supabase
    .from('twibbons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (error) throw error
  return data
}

// Fungsi untuk ambil satu twibbon
export async function getTwibbon(id) {
  const { data, error } = await supabase
    .from('twibbons')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  
  // Update views
  await supabase
    .from('twibbons')
    .update({ views: data.views + 1 })
    .eq('id', id)
  
  return data
}