const BASE_URL = "http://YOUR_BACKEND_URL"; // e.g. http://192.168.1.5:5000

export const sendLocation = async (location) => {
  try {
    const response = await fetch(`${BASE_URL}/location`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(location),
    });

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
  }
};