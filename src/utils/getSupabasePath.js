// utils/getSupabasePath.js
const getSupabasePath = (url, bucket) => {
  const prefix = `https://unwgulonrzxvmmyczcsv.supabase.co/storage/v1/object/public/${bucket}/`;
  return url.startsWith(prefix) ? url.replace(prefix, "") : url;
};

module.exports = getSupabasePath;
