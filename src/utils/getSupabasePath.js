const SUPABASE_BASE_URL = "https://unwgulonrzxvmmyczcsv.supabase.co/storage/v1/object/public/";

const getSupabasePath = (url, bucket) => {
  if (!url || !bucket) return null;

  const prefix = `${SUPABASE_BASE_URL}${bucket}/`;

  if (url.startsWith(prefix)) {
    const relativePath = url.slice(prefix.length);
    return decodeURIComponent(relativePath); // ✅ Important fix here
  }

  if (!url.includes("https://")) {
    return decodeURIComponent(url); // ✅ Also decode this
  }

  console.warn("⚠️ Supabase path parsing issue: URL doesn't match expected format");
  return null;
};

module.exports = getSupabasePath;
