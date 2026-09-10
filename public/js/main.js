const API = "/api";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (getToken()) headers.Authorization = "Bearer " + getToken();
  return headers;
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  }
  catch {
    return null;
  }
}

function requireLogin(role) {
  const user = getUser();
  if (!getToken() || !user) {
    window.location.href = "../login.html";
    return false;
  }
  if (role && user.role !== role) {
    window.location.href = "../login.html";
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "../login.html";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

function statusClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "active";
  if (s === "inactive") return "inactive";
  if (s === "completed") return "completed";
  if (s === "in progress") return "ongoing";
  if (s === "confirmed") return "scheduled";
  return "pending";
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return isNaN(d) ? value : d.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

// Contact Us form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const button = contactForm.querySelector('button[type="submit"]');
    try {
      if (button) button.disabled = true;
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('contactName').value.trim(),
          email: document.getElementById('contactEmail').value.trim(),
          subject: document.getElementById('contactSubject').value.trim(),
          message: document.getElementById('contactMessage').value.trim()
        })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Could not send message');
      await showAlert(
        "Your message has been sent successfully!",
        "Success",
        "success"
      );
      contactForm.reset();
    } catch (error) {
      await showAlert(
        error.message,
        "Error",
        "error"
      );
    } finally {
      if (button) button.disabled = false;
    }
  });
}

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("active");
    if (navLinks.classList.contains("active")) {
      menuToggle.textContent = "✕";
    } else {
      menuToggle.textContent = "☰";
    }
  });
  const links = navLinks.querySelectorAll("a");
  links.forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("active");
      menuToggle.textContent = "☰";
    });
  });
  document.addEventListener("click", function (event) {
    if (
      !navLinks.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      navLinks.classList.remove("active");
      menuToggle.textContent = "☰";
    }
  });
}

function createModal() {
  if (document.getElementById("customModal")) return;

  document.body.insertAdjacentHTML("beforeend", `
    <div id="customModal" class="custom-modal-overlay">
      <div class="custom-modal">

        <div id="modalIcon" class="custom-modal-icon">
          !
        </div>

        <h3 id="modalTitle">Message</h3>

        <p id="modalMessage"></p>

        <div id="modalButtons" class="custom-modal-buttons"></div>

      </div>
    </div>
  `);
}



function showAlert(
  message,
  title = "AutoCare Pro",
  type = "success"
) {
  return new Promise(resolve => {

    createModal();

    const overlay = document.getElementById("customModal");
    const icon = document.getElementById("modalIcon");
    const titleElement = document.getElementById("modalTitle");
    const messageElement = document.getElementById("modalMessage");
    const buttons = document.getElementById("modalButtons");

    // Set icon and style
    if (type === "success") {
      icon.textContent = "✓";
      icon.className = "custom-modal-icon success";
    }

    else if (type === "error") {
      icon.textContent = "×";
      icon.className = "custom-modal-icon error";
    }

    else if (type === "warning") {
      icon.textContent = "!";
      icon.className = "custom-modal-icon warning";
    }

    else {
      icon.textContent = "i";
      icon.className = "custom-modal-icon info";
    }

    titleElement.textContent = title;
    messageElement.textContent = message;

    buttons.innerHTML = `
      <button
        class="custom-modal-btn primary"
        id="modalOk">
        OK
      </button>
    `;

    overlay.classList.add("show");

    document.getElementById("modalOk").onclick = () => {
      overlay.classList.remove("show");
      resolve();
    };

  });
}



function showConfirm(
  message,
  title = "Are you sure?"
) {
  return new Promise(resolve => {

    createModal();

    const overlay = document.getElementById("customModal");
    const icon = document.getElementById("modalIcon");
    const titleElement = document.getElementById("modalTitle");
    const messageElement = document.getElementById("modalMessage");
    const buttons = document.getElementById("modalButtons");

    icon.textContent = "?";
    icon.className = "custom-modal-icon warning";

    titleElement.textContent = title;
    messageElement.textContent = message;

    buttons.innerHTML = `
      <button
        class="custom-modal-btn secondary"
        id="modalCancel">
        Cancel
      </button>

      <button
        class="custom-modal-btn danger"
        id="modalConfirm">
        Confirm
      </button>
    `;

    overlay.classList.add("show");

    document.getElementById("modalCancel").onclick = () => {
      overlay.classList.remove("show");
      resolve(false);
    };

    document.getElementById("modalConfirm").onclick = () => {
      overlay.classList.remove("show");
      resolve(true);
    };

  });
}