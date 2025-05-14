// utils/deleteFromSupabase.js
const supabase = require("../../supabaseClient");

const deleteFromSupabase = async (bucket, path) => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error("Supabase file delete failed: " + error.message);
  }
};

module.exports = deleteFromSupabase;
