const { uploadToSupabase, deleteFromSupabase } = require('../utils/fileUpload');

class FileService {
  /**
   * Uploads a profile picture to Supabase
   * @param {Object} file - The file object from multer
   * @returns {Promise<string>} The URL of the uploaded file
   */
  static async uploadProfilePicture(file) {
    if (!file) {
      return null;
    }

    try {
      const { url } = await uploadToSupabase(
        file.buffer,
        file.originalname,
        'profile-pictures'
      );
      return url;
    } catch (error) {
      throw new Error(`Failed to upload profile picture: ${error.message}`);
    }
  }

  /**
   * Deletes a profile picture from Supabase
   * @param {string} fileUrl - The URL of the file to delete
   * @returns {Promise<void>}
   */
  static async deleteProfilePicture(fileUrl) {
    if (!fileUrl) {
      return;
    }

    try {
      await deleteFromSupabase(fileUrl);
    } catch (error) {
      throw new Error(`Failed to delete profile picture: ${error.message}`);
    }
  }
}

module.exports = FileService; 