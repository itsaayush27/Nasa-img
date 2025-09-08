const apiKey = "LTnEOL1Lah2MCIXx3Be4KVf1gAZxVH5PXYj1pVf8"; 

const currentImageContainer = document.getElementById("current-image-container");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchHistory = document.getElementById("search-history");

//Helpers to save/load from localStorage
function saveSearch(date) {
  let searches = JSON.parse(localStorage.getItem("searches")) || [];
  if (!searches.includes(date)) {
    searches.push(date);
    localStorage.setItem("searches", JSON.stringify(searches));
  }
}

function saveImageData(date, data) {
  localStorage.setItem(`apod-${date}`, JSON.stringify(data));
}

function getSavedImageData(date) {
  return JSON.parse(localStorage.getItem(`apod-${date}`));
}

// Render image in container
function renderImage(data, date) {
  currentImageContainer.innerHTML = `
    <h2>${data.title} (${date})</h2>
    ${data.media_type === "image"
      ? `<img src="${data.url}" alt="${data.title}">`
      : `<iframe src="${data.url}" frameborder="0"></iframe>`}
    <p>${data.explanation}</p>
  `;
}

// Fetch NASA APOD
async function fetchImage(date) {
  // Check local cache first
  const cached = getSavedImageData(date);
  if (cached) {
    renderImage(cached, date);
    return;
  }

  try {
    currentImageContainer.innerHTML = `<p>⏳ Loading NASA Image...</p>`;

    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`
    );

    if (!response.ok) throw new Error(`Status: ${response.status}`);

    const data = await response.json();
    renderImage(data, date);
    saveImageData(date, data); // ✅ Cache it

  } catch (err) {
    currentImageContainer.innerHTML = `<p style="color:red">❌ Error: ${err.message}</p>`;
  }
}

// Show search history
function renderSearchHistory() {
  searchHistory.innerHTML = "";
  const searches = JSON.parse(localStorage.getItem("searches")) || [];
  searches.forEach((date) => {
    const li = document.createElement("li");
    li.textContent = date;
    li.addEventListener("click", () => fetchImage(date));
    searchHistory.appendChild(li);
  });
}

// Handle search form submit
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const date = searchInput.value;
  if (date) {
    fetchImage(date);
    saveSearch(date);
    renderSearchHistory();
  }
});

// Load today's image on startup
(function init() {
  const today = new Date().toISOString().split("T")[0];
  fetchImage(today);
  renderSearchHistory();
})();

// Function to clear search history
function clearHistory() {
  localStorage.removeItem("searches"); // remove saved searches
  document.getElementById("search-history").innerHTML = ""; // clear UI
}

// Attach event to button
document.getElementById("clear-history-btn").addEventListener("click", clearHistory);

