const path = require('path');
const supabase = require('../../supabaseClient');

const uploadToSupabase = async (file, folder) => {
  const fileExt = path.extname(file.originalname);
  const fileName = `${Date.now()}_${file.originalname}`;
  const filePath = `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from('event-assets') // replace with your bucket name
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) throw error;

  const { data } = supabase.storage.from('event-assets').getPublicUrl(filePath);
  return data.publicUrl;
};

module.exports = uploadToSupabase;
