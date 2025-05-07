const supabase = require("../../supabaseClient");

const deleteFromSupabase = async (url) => {
  try {
    // Extract path from public URL
    const urlParts = url.split("/");
    const bucketName = urlParts[7];
    const filePath = urlParts.slice(4).join("/");

    console.log("URL parts:", urlParts);
    console.log("Bucket Name:", bucketName);
    console.log("File Path:", filePath);

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error("Error deleting from Supabase:", error.message);
    } else {
      console.log("Deleted from Supabase:", filePath);
    }
  } catch (err) {
    console.error("deleteFromSupabase error:", err.message);
  }
};

module.exports = { deleteFromSupabase };
