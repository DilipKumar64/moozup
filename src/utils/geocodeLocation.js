const axios = require("axios");

const getCoordinatesFromLocation = async (location) => {
  const apiKey = process.env.GEOCODING_API_KEY;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    location
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      return { latitude: lat, longitude: lng };
    } else {
      console.warn("No coordinates found for location:", location);
      return { latitude: null, longitude: null };
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error.message);
    return { latitude: null, longitude: null };
  }
};

module.exports = getCoordinatesFromLocation;
