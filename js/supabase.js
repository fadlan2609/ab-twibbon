// js/supabase.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// GANTI DENGAN DATA DARI STEP 5
const supabaseUrl = 'https://ctqzcymtwxqsuqulfprs.supabase.co'  // Ganti dengan URL Anda
const supabaseKey = 'sb_publishable_57zATxRSJOHFBWrSD_YxZg_s1PaeFuV'  // Ganti dengan anon key Anda

export const supabase = createClient(supabaseUrl, supabaseKey)

// ==================== FUNGSI UNTUK TWIBBON ====================

/**
 * Membuat twibbon baru
 */
export async function createTwibbon(name, description, file) {
  try {
    // Validasi input
    if (!name) throw new Error('Nama twibbon harus diisi')
    if (!file) throw new Error('File harus diupload')
    
    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Ukuran file maksimal 5MB')
    }
    
    // 1. Upload file ke storage
    const fileName = `twibbons/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('twibbon-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (storageError) {
      console.error('Storage error:', storageError)
      throw new Error('Gagal upload gambar: ' + storageError.message)
    }
    
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
    
    if (error) {
      console.error('Database error:', error)
      throw new Error('Gagal simpan data: ' + error.message)
    }
    
    return {
      id: data[0].id,
      ...data[0]
    }
  } catch (error) {
    console.error('Error createTwibbon:', error)
    throw error
  }
}

/**
 * Mendapatkan semua twibbon
 */
export async function getAllTwibbons() {
  try {
    const { data, error } = await supabase
      .from('twibbons')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getAllTwibbons:', error)
    return []
  }
}

/**
 * Mendapatkan satu twibbon berdasarkan ID
 */
export async function getTwibbon(id) {
  try {
    // Ambil data twibbon
    const { data, error } = await supabase
      .from('twibbons')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    if (!data) throw new Error('Twibbon tidak ditemukan')
    
    // Update views (async, tidak perlu ditunggu)
    supabase
      .from('twibbons')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', id)
      .then()
    
    return data
  } catch (error) {
    console.error('Error getTwibbon:', error)
    throw error
  }
}

/**
 * Increment downloads
 */
export async function incrementDownloads(id) {
  try {
    // Ambil data dulu
    const { data, error: getError } = await supabase
      .from('twibbons')
      .select('downloads')
      .eq('id', id)
      .single()
    
    if (getError) throw getError
    
    // Update downloads
    const { error } = await supabase
      .from('twibbons')
      .update({ downloads: (data.downloads || 0) + 1 })
      .eq('id', id)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error incrementDownloads:', error)
    return false
  }
}

/**
 * Hapus twibbon (jika diperlukan)
 */
export async function deleteTwibbon(id, imageUrl) {
  try {
    // Hapus dari database
    const { error: dbError } = await supabase
      .from('twibbons')
      .delete()
      .eq('id', id)
    
    if (dbError) throw dbError
    
    // Hapus dari storage (ambil nama file dari URL)
    if (imageUrl) {
      const fileName = imageUrl.split('/').pop()
      const { error: storageError } = await supabase.storage
        .from('twibbon-images')
        .remove([`twibbons/${fileName}`])
      
      if (storageError) console.warn('Gagal hapus file:', storageError)
    }
    
    return true
  } catch (error) {
    console.error('Error deleteTwibbon:', error)
    throw error
  }
}
