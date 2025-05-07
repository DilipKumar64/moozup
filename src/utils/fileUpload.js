const supabase = require('../config/supabase');

/**
 * Uploads a file to Supabase Storage
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - The name of the file
 * @returns {Promise<{path: string, url: string}>} The uploaded file path and URL
 */
const uploadToSupabase = async (fileBuffer, fileName) => {
  try {
    const bucketName = process.env.SUPABASE_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('SUPABASE_BUCKET_NAME is not defined in environment variables');
    }

    // Generate a unique file name to prevent collisions
    const uniqueFileName = `${Date.now()}-${fileName}`;
    const filePath = `profilePicture/${uniqueFileName}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: 'image/jpeg', // Adjust based on your needs
        upsert: false
      });

    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: publicUrl
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Deletes a file from Supabase Storage
 * @param {string} fileUrl - The public URL of the file to delete
 * @returns {Promise<void>}
 */
const deleteFromSupabase = async (fileUrl) => {
  try {
    const bucketName = process.env.SUPABASE_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('SUPABASE_BUCKET_NAME is not defined in environment variables');
    }

    // Extract the file path from the URL
    const urlParts = new URL(fileUrl).pathname.split('/');
    const filePath = urlParts.slice(urlParts.indexOf(bucketName) + 1).join('/');

    // Delete the file
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

module.exports = {
  uploadToSupabase,
  deleteFromSupabase
}; 