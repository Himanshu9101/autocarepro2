const CUSTOMER_API = "/api";

function customerHeaders() {
  return { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("token") };
}

async function customerFetch(path, options = {}) {
  const response = await fetch(CUSTOMER_API + path, {
    ...options,
    headers: { ...customerHeaders(), ...(options.headers || {}) }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

async function getVehicles() {
  return customerFetch("/vehicles");
}
async function getMyBookings() {
  return customerFetch("/bookings/my");
}

async function displayVehicles() {
  const box = document.getElementById("vehicleContainer");
  if (!box) return;
  try {
    const vehicles = await getVehicles();
    if (!vehicles.length) {
      box.innerHTML = '<p class="empty-message">No vehicles added yet.</p>';
      return;
    }
    box.innerHTML = vehicles.map(v => `
      <div class="panel vehicle-card">
        <img
          class="vehicle-image"
          src="${v.vehicle_image || "../assets/images/car.png"}"
          alt="${escapeHtml(v.brand)} ${escapeHtml(v.model)}"
          onerror="this.src='../assets/images/car.png'"
        >
        <div class="vehicle-box">
          <div>
            <strong>
              ${escapeHtml(v.brand)} ${escapeHtml(v.model)}
            </strong>
            <span>
              ${escapeHtml(v.registration_no)}
            </span>
          </div>
        </div>
        <div class="detail-row">
          <span>Year</span>
          <strong>${v.year || "-"}</strong>
        </div>
        <div class="detail-row">
          <span>Fuel</span>
          <strong>
            ${escapeHtml(v.fuel_type || "-")}
          </strong>
        </div>
        <div class="action-row">
          <button
            class="small-btn danger"
            onclick="deleteVehicle(${v.vehicle_id})">
            Delete
          </button>
        </div>
      </div>`).join("");
  } catch (e) {
    box.innerHTML = `<p>${escapeHtml(e.message)}</p>`;
  }
}

async function deleteVehicle(id) {
  const confirmed = await showConfirm(
    "Are you sure you want to delete this vehicle?",
    "Delete Vehicle?"
  );

  if (!confirmed) return;
  try {
    await customerFetch("/vehicles/" + id, { method: "DELETE" });
    await displayVehicles();
  } catch (e) {
    await showAlert(
      e.message,
      "Error",
      "error"
    );
  }
}

const vehicleForm = document.getElementById("vehicleForm");
if (vehicleForm) {
  vehicleForm.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append(
        "registrationNo",
        document.getElementById("registration").value.trim()
      );
      formData.append(
        "brand",
        document.getElementById("brand").value.trim()
      );
      formData.append(
        "model",
        document.getElementById("model").value.trim()
      );
      formData.append(
        "year",
        document.getElementById("year").value
      );
      formData.append(
        "fuelType",
        document.getElementById("fuel").value
      );
      const imageInput =
        document.getElementById("vehicleImage");
      if (imageInput.files.length > 0) {
        formData.append(
          "vehicleImage",
          imageInput.files[0]
        );
      }
      const response = await fetch(
        CUSTOMER_API + "/vehicles",
        {
          method: "POST",
          headers: {
            "Authorization":
              "Bearer " + localStorage.getItem("token")
          },
          body: formData
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || "Request failed"
        );
      }
      await showAlert(
        "Vehicle added successfully!",
        "Success",
        "success"
      );
      location.href = "vehicles.html";
    } catch (e) {
      await showAlert(
        e.message,
        "Error",
        "error"
      );
    }
  });
}

async function loadBookingForm() {
  const vehicleSelect = document.getElementById("vehicle");
  const serviceSelect = document.getElementById("service");
  if (!vehicleSelect || !serviceSelect) return;
  try {
    const [vehicles, services] = await Promise.all([
      getVehicles(),
      fetch(CUSTOMER_API + "/services").then(async r => {
        const d = await r.json();
        if (!r.ok) {
          throw new Error(d.message || "Could not load services");
        }
        return d;
      })
    ]);
    vehicleSelect.innerHTML =
      '<option value="">Select Vehicle</option>' +
      vehicles.map(v => `
        <option value="${v.vehicle_id}">
          ${escapeHtml(v.brand)} ${escapeHtml(v.model)} -
          ${escapeHtml(v.registration_no)}
        </option>
      `).join("");
    serviceSelect.innerHTML =
      '<option value="">Select Service</option>' +
      services.map(s =>
        `<option value="${s.service_id}">
          ${escapeHtml(s.service_name)} - ₹${s.price}
        </option>`
      ).join("");
    const date = document.getElementById("date");
    if (date) {
      const today = new Date();
      today.setDate(today.getDate() + 7);
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      date.min = `${year}-${month}-${day}`;
    }
  } catch (e) {
    await showAlert(
      "Could not load booking form: " + e.message,
      "Error",
      "error"
    );
  }
}

const bookingForm = document.getElementById("bookingForm");
if (bookingForm) {
  bookingForm.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      await customerFetch("/bookings", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: document.getElementById("vehicle").value,
          serviceId: document.getElementById("service").value,
          bookingDate: document.getElementById("date").value
        })
      });
      await showAlert(
        "Booking created successfully!",
        "Success",
        "success"
      );
      location.href = "bookings.html";
    } catch (e) {
      await showAlert(
        e.message,
        "Error",
        "error"
      );
    }
  });
}

async function displayBookings() {
  const box = document.getElementById("bookingContainer");
  if (!box) return;
  try {
    const bookings = await getMyBookings();
    box.innerHTML = bookings.length ? bookings.map(b => `
      <tr>
        <td>#AC${b.booking_id}</td>
        <td>${escapeHtml(b.registration_no)}</td>
        <td>${escapeHtml(b.service_name)}</td>
        <td>${formatDate(b.booking_date)}</td>
        <td><span class="status ${statusClass(b.status)}">${escapeHtml(b.status)}</span></td>
      </tr>`).join("")
      : '<tr><td colspan="5">No bookings found.</td></tr>';
  } catch (e) {
    box.innerHTML = `<tr><td colspan="5">${escapeHtml(e.message)}</td></tr>`;
  }
}

async function loadProfile() {
  const form = document.getElementById("profileForm");
  if (!form) return;
  try {
    const user = await customerFetch("/auth/profile");
    document.getElementById("name").value = user.name || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("phone").value = user.phone || "";
  } catch (e) {
    await showAlert(
      e.message,
      "Error",
      "error"
    );
  }
}

const profileForm = document.getElementById("profileForm");
if (profileForm) {
  profileForm.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      const user = await customerFetch("/auth/profile", {
        method: "PUT", body: JSON.stringify({
          name: document.getElementById("name").value.trim(),
          phone: document.getElementById("phone").value.trim()
        })
      });
      const old = getUser() || {};
      localStorage.setItem("user", JSON.stringify({ ...old, ...user }));
      await showAlert(
        "Profile updated successfully!",
        "Success",
        "success"
      );
    } catch (e) {
      await showAlert(
        e.message,
        "Error",
        "error"
      );
    }
  });
}

async function loadCustomerDashboard() {
  if (!document.querySelector(".dashboard-page")) return;
  const heading = document.querySelector(".dashboard-header h1"),
    user = getUser();
  if (heading && user?.name) heading.textContent = `Welcome, ${user.name} 👋`;
  try {
    const [vehicles, bookings] = await Promise.all([getVehicles(), getMyBookings()]);
    const set = (id, v) => {
      const e = document.getElementById(id);
      if (e) e.textContent = v;
    };
    set("customerVehicles", vehicles.length);
    set("customerBookings", bookings.length);
    set("customerOngoing", bookings.filter(b => b.status === "In Progress").length);
    set("customerCompleted", bookings.filter(b => b.status === "Completed").length);
    const rows = document.getElementById("dashboardBookingRows");
    if (rows) rows.innerHTML = bookings.slice(0, 5).map(b => `
      <tr>
        <td>#AC${b.booking_id}</td>
        <td>${escapeHtml(b.brand)} ${escapeHtml(b.model)}</td>
        <td>${escapeHtml(b.registration_no)}</td>
        <td>${escapeHtml(b.service_name)}</td>
        <td>${formatDate(b.booking_date)}</td>
        <td><span class="status ${statusClass(b.status)}">${escapeHtml(b.status)}</span></td>
      </tr>`).join("") || '<tr><td colspan="5">No bookings yet.</td></tr>';
    const vehicleRows = document.getElementById("dashboardVehicleRows");

    if (vehicleRows) {
      vehicleRows.innerHTML = vehicles.slice(0, 3).map(v => `
      <div class="vehicle-box dashboard-vehicle">
        <img
          class="dashboard-vehicle-image"
          src="${v.vehicle_image || "../assets/images/car.png"}"
          alt="${escapeHtml(v.brand)} ${escapeHtml(v.model)}"
          onerror="this.src='../assets/images/car.png'"
        >
        <div>
          <strong>
            ${escapeHtml(v.brand)} ${escapeHtml(v.model)}
          </strong>
          <span>
            ${escapeHtml(v.registration_no)}
            • ${v.year || "-"}
            • ${escapeHtml(v.fuel_type || "-")}
          </span>
        </div>
      </div>
    `).join("")
        || '<p>No vehicles added yet.</p>';
    }
  } catch (e) {
    console.error(e);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin("customer")) return;
  displayVehicles();
  displayBookings();
  loadBookingForm();
  loadProfile();
  loadCustomerDashboard();
});
