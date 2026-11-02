// -------------------- UI : Gestion des Modales --------------------

// Modale Auth (connexion/inscription)
const authModal = document.getElementById("auth-modal");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const closeAuthBtn = document.querySelector(".close-modal");
const modalTitle = document.getElementById("modal-title");
const nameFields = document.getElementById("name-fields");

// Ouvrir la modale Connexion
loginBtn.addEventListener("click", () => {
  modalTitle.textContent = "Connexion";
  nameFields.classList.add("hidden");
  authModal.classList.remove("hidden");
});

// Ouvrir la modale Inscription
registerBtn.addEventListener("click", () => {
  modalTitle.textContent = "Inscription";
  nameFields.classList.remove("hidden");
  authModal.classList.remove("hidden");
});

// Fermer la modale Auth
closeAuthBtn.addEventListener("click", () => {
  authModal.classList.add("hidden");
});

// -------------------- Modale Proposer un événement --------------------
const eventModal = document.getElementById("event-modal");
const openEventBtn = document.querySelector("#organiser .btn");
const closeEventBtn = document.querySelector(".close-event-modal");

// Ouvrir la modale "Proposer un événement"
openEventBtn.addEventListener("click", () => {
  eventModal.classList.remove("hidden");
});

// Fermer la modale "Proposer un événement"
closeEventBtn.addEventListener("click", () => {
  eventModal.classList.add("hidden");
});

// Fermer modales si clic en dehors du contenu
window.addEventListener("click", (e) => {
  if (e.target === authModal) authModal.classList.add("hidden");
  if (e.target === eventModal) eventModal.classList.add("hidden");
});

const API = "http://localhost:5000/api";
let token = null;
let allEvents = []; // stocke tous les événements pour filtrage
let map; // Carte Leaflet

// -------------------- UTIL --------------------
function showStatus(message, isError = false) {
  alert(message); // tu peux remplacer par un toast ou une bannière
}

// -------------------- AUTH --------------------
document.getElementById("auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const mode = document.getElementById("modal-title").textContent; // Connexion ou Inscription
  const endpoint = mode === "Connexion" ? "login" : "register";

  try {
    const res = await fetch(`${API}/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || res.statusText);

    if (endpoint === "login") {
      token = data.token;
      showStatus("✅ Connecté !");
    } else {
      showStatus("✅ Inscription réussie !");
    }

    authModal.classList.add("hidden");
    document.getElementById("auth-form").reset();
  } catch (err) {
    showStatus(`Erreur: ${err.message}`, true);
  }
});

// -------------------- EVENTS --------------------
async function loadEvents() {
  try {
    const res = await fetch(`${API}/events/`);
    const events = await res.json();
    if (!res.ok) throw new Error(events.msg || res.statusText);

    allEvents = events; // stocker pour filtrage
    renderEvents(events);
  } catch (err) {
    showStatus(`Erreur chargement événements: ${err.message}`, true);
  }
}

function renderEvents(events) {
  const list = document.getElementById("event-list");

  if (events.length === 0) {
    list.innerHTML = "<p>Aucun événement trouvé</p>";
    return;
  }

  list.innerHTML = events.map(e => `
    <div class="event-card">
      <h3>${e.title}</h3>
      <p><i class="fas fa-calendar"></i> ${new Date(e.date).toLocaleDateString('fr-FR')}</p>
      <p><i class="fas fa-tag"></i> ${e.categorie || 'Sans catégorie'}</p>
      <p><i class="fas fa-map-marker-alt"></i> ${e.location?.text || "Lieu inconnu"}</p>
    </div>
  `).join("");

  // Rafraîchir la carte (sécurisé)
  if (map) refreshMap(events);
}

function refreshMap(events) {
  if (!map) return; // sécurité

  // Supprimer les anciens marqueurs
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) map.removeLayer(layer);
  });

  const bounds = [];

  // Ajouter les marqueurs
  events.forEach(e => {
    if (e.location && e.location.lat && e.location.lng) {
      const marker = L.marker([e.location.lat, e.location.lng])
        .addTo(map)
        .bindPopup(`<b>${e.title}</b><br>${new Date(e.date).toLocaleDateString('fr-FR')}`);

      bounds.push([e.location.lat, e.location.lng]);
    }
  });

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50] });
  }
}

// -------------------- AJOUT ÉVÉNEMENT --------------------
document.getElementById("event-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!token) return showStatus("⚠️ Connecte-toi d’abord !", true);

  const title = document.getElementById("event-title").value;
  const date = document.getElementById("event-date").value;
  const categorie = document.getElementById("event-category").value;
  const locationText = document.getElementById("event-location").value;

  // 🔹 Géocodage avec Nominatim
  const geoRes = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationText)}`,
    { headers: { "User-Agent": "EcoConnectApp" } }
  );
  const geoData = await geoRes.json();

  let location = null;
  if (geoData.length > 0) {
    location = {
      lat: parseFloat(geoData[0].lat),
      lng: parseFloat(geoData[0].lon),
      text: locationText
    };
  } else {
    return showStatus("⚠️ Lieu introuvable, essaie un autre nom.", true);
  }

  try {
    const res = await fetch(`${API}/events/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ title, date, categorie, location })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || res.statusText);

    showStatus("✅ Événement ajouté !");
    eventModal.classList.add("hidden");
    document.getElementById("event-form").reset();
    loadEvents();
  } catch (err) {
    if (err.message.includes("Token has expired")) {
      showStatus("⚠️ Session expirée, reconnecte-toi.", true);
      token = null;
      authModal.classList.remove("hidden");
    } else {
      showStatus(`Erreur ajout: ${err.message}`, true);
    }
  }
});

// -------------------- NEWSLETTER --------------------
document.getElementById("newsletter-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.querySelector(".newsletter-input").value;
  try {
    const res = await fetch(`${API}/newsletter/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || res.statusText);

    showStatus("✅ Inscription newsletter !");
    document.querySelector(".newsletter-input").value = "";
  } catch (err) {
    showStatus(`Erreur newsletter: ${err.message}`, true);
  }
});

// -------------------- FILTRE --------------------
document.getElementById("search").addEventListener("input", applyFilters);
document.getElementById("category").addEventListener("change", applyFilters);

function applyFilters() {
  const search = document.getElementById("search").value.toLowerCase();
  const cat = document.getElementById("category").value;

  const filtered = allEvents.filter(e =>
    (e.title.toLowerCase().includes(search) || e.location?.text?.toLowerCase().includes(search)) &&
    (cat === "" || e.categorie === cat)
  );

  renderEvents(filtered);
}

// -------------------- LEAFLET --------------------
document.addEventListener("DOMContentLoaded", () => {
  map = L.map("map").setView([32.0, -6.0], 6); // Maroc par défaut
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  loadEvents();
});
