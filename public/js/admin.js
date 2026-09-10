const ADMIN_API = "/api";

function adminHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("token")
  };
}

async function adminFetch(path, options = {}) {
  const r = await fetch(ADMIN_API + path, { ...options, headers: { ...adminHeaders(), ...(options.headers || {}) } });
  const d = await r.json();
  if (!r.ok) throw new Error(d.message || "Request failed");
  return d;
}

async function getUsers() {
  return adminFetch("/auth/users");
}

async function getServices() {
  return adminFetch("/services/all");
}

async function getVehicles() {
  return adminFetch("/vehicles/all");
}

async function getBookings() {
  return adminFetch("/bookings");
}

async function displayUsers() {
  const box = document.getElementById("userContainer");
  if (!box) return;
  try {
    const users = await getUsers();
    let users2 = users.filter(u => u.role === "customer" || u.role === "admin");
    box.innerHTML = users2.map(u => `
      <tr>
        <td>${u.user_id}</td>
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.phone || "-")}</td>
        <td>${escapeHtml(u.role)}</td>
        <td>${u.user_id === getUser()?.user_id ? "-" : `<button class="small-btn danger" onclick="deleteUser(${u.user_id})">Delete</button>`}</td>
      </tr>`).join("") || '<tr><td colspan="6">No users.</td></tr>';
  } catch (e) {
    box.innerHTML = `<tr><td colspan="6">${escapeHtml(e.message)}</td></tr>`;
  }
}
async function deleteUser(userId) {
  const confirmDelete = await showConfirm(
    "Are you sure you want to delete this user?\n\n" +
    "The user will not be able to log in anymore.\n" +
    "Their vehicles and bookings will remain.",
    "Delete User?"
  );

  if (!confirmDelete) return;
  try {
    const response = await adminFetch(
      `/auth/users/${userId}`,
      {
        method: "DELETE"
      }
    );
    const data = await response;
    await showAlert(
      data.message,
      "Success",
      "success"
    );
    displayUsers();
  } catch (error) {
    console.error(error);
  }
}
async function searchUsers(searchValue) {
  const box = document.getElementById("userContainer");
  if (!box) return;
  try {
    const users = await getUsers();
    const result = users.filter(user => {
      const name = user.name
        ? user.name.toLowerCase()
        : "";
      const id = user.user_id
        ? String(user.user_id).toLowerCase()
        : "";
      return (
        name.includes(searchValue) ||
        id.includes(searchValue)
      );
    });
    box.innerHTML = result.map(u => `
      <tr>
        <td>${u.user_id}</td>
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.phone || "-")}</td>
        <td>${escapeHtml(u.role)}</td>
        <td>
          ${u.user_id === getUser()?.user_id
        ? "-"
        : `<button
                   class="small-btn danger"
                   onclick="deleteUser(${u.user_id})">
                   Delete
                 </button>`
      }
        </td>
      </tr>
    `).join("") ||
      '<tr><td colspan="6">No users found.</td></tr>';
  } catch (e) {
    box.innerHTML = `<tr><td colspan="6">${escapeHtml(e.message)}</td></tr>`;
  }
}

const userContainer = document.getElementById("userContainer");
const userSearchInput = document.getElementById("search-input");
const userSearchButton = document.getElementById("search-btn");

if (userContainer && userSearchInput && userSearchButton) {
  userSearchButton.addEventListener("click", async function (e) {
    e.preventDefault();
    const searchValue = userSearchInput.value
      .trim()
      .toLowerCase();
    if (!searchValue) {
      await displayUsers();
      return;
    }
    await searchUsers(searchValue);
  });
}

async function displayMechanics() {
  const box = document.getElementById("mechanicContainer");
  if (!box) return;
  try {
    const users = await getUsers();
    const mechanics = users.filter(user =>
      user.role === "mechanic"
    );
    box.innerHTML = mechanics.map(user => `
      <tr>
        <td>${user.user_id}</td>
        <td>${escapeHtml(user.name)}</td>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(user.phone || "-")}</td>
        <td>
          <button
            class="small-btn danger"
            onclick="deleteUser(${user.user_id})">
            Delete
          </button>
        </td>
      </tr>
    `).join("") || `<tr><td colspan="5">No mechanics found.</td></tr>`;
  } catch (e) {
    box.innerHTML = `
      <tr>
        <td colspan="5">
          ${escapeHtml(e.message)}
        </td>
      </tr>
    `;
  }
}

const mechanicSearchForm =
  document.querySelector("#mechanicContainer")
    ?.closest(".dashboard-container")
    ?.querySelector(".search-cont form");
if (mechanicSearchForm) {
  mechanicSearchForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const searchValue =
      document
        .getElementById("search-input")
        .value
        .trim()
        .toLowerCase();
    if (!searchValue) {
      displayMechanics();
      return;
    }
    try {
      const users = await getUsers();
      const mechanics = users.filter(user =>
        user.role === "mechanic"
      );
      const result = mechanics.filter(user => {
        const name =
          user.name?.toLowerCase() || "";
        const email =
          user.email?.toLowerCase() || "";
        const phone =
          String(user.phone || "").toLowerCase();
        const id =
          String(user.user_id || "").toLowerCase();
        return (
          name.includes(searchValue) ||
          email.includes(searchValue) ||
          phone.includes(searchValue) ||
          id === searchValue
        );
      });
      const box =
        document.getElementById("mechanicContainer");
      box.innerHTML = result.map(user => `
        <tr>
          <td>${user.user_id}</td>
          <td>${escapeHtml(user.name)}</td>
          <td>${escapeHtml(user.email)}</td>
          <td>${escapeHtml(user.phone || "-")}</td>
          <td>
            <button
              class="small-btn danger"
              onclick="deleteUser(${user.user_id})">
              Delete
            </button>
          </td>
        </tr>
      `).join("") ||
        `<tr>
        <td colspan="5">No mechanics found.</td>
      </tr>`;
    } catch (e) {
      console.error(e);
    }
  });
}

async function displayServices() {
  const box = document.getElementById("serviceContainer");
  if (!box) return;
  try {
    const list = await getServices();
    box.innerHTML = list.map(s => `
      <tr>
        <td>${s.service_id}</td>
        <td>${escapeHtml(s.service_name)}</td>
        <td>${escapeHtml(s.description || "-")}</td>
        <td>₹${s.price}</td>
        <td>
          <span class="status ${statusClass(s.status)}">
            ${escapeHtml(s.status)}
          </span>
        </td>
        <td>
          <button
            class="small-btn edit-btn"
            onclick="editService(${s.service_id})">
            Edit
          </button>

          <button
            class="small-btn danger"
            onclick="deleteService(${s.service_id})">
            Delete
          </button>
        </td>
      </tr>
    `).join("") ||
      '<tr><td colspan="6">No services.</td></tr>';
  } catch (e) {
    box.innerHTML = `<tr><td colspan="6">${escapeHtml(e.message)}</td></tr>`;
  }
}
async function deleteService(id) {
  const confirmed = await showConfirm(
    "Delete this service?",
    "Delete service?"
  );

  if (!confirmed) return;
  try {
    await adminFetch("/services/" + id, { method: "DELETE" });
    displayServices();
  } catch (e) {
    await showAlert(
      e.message,
      "Error",
      "error"
    );
  }
}

function editService(id) {
  window.location.href = `add-service.html?edit=${id}`;
}

const serviceForm = document.getElementById("serviceForm");
if (serviceForm) {
  serviceForm.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      const editId = serviceForm.dataset.editId;
      const serviceData = {
        serviceName: document
          .getElementById("serviceName")
          .value
          .trim(),
        description: document
          .getElementById("description")
          .value
          .trim(),
        price: document
          .getElementById("price")
          .value,
        status: document
          .getElementById("status")
          .value
      };
      let response;
      if (editId) {
        response = await adminFetch(
          `/services/${editId}`,
          {
            method: "PUT",
            body: JSON.stringify(serviceData)
          }
        );
      } else {
        response = await adminFetch(
          "/services",
          {
            method: "POST",
            body: JSON.stringify(serviceData)
          }
        );
      }
      await showAlert(
        response.message,
        "Success",
        "success"
      );
      window.location.href = "services.html";
    } catch (e) {
      await showAlert(
        e.message,
        "Error",
        "error"
      );
    }
  });
}
async function loadServiceForEdit() {
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("edit");
  if (!editId) return;
  try {
    const services = await getServices();
    const service = services.find(
      s => String(s.service_id) === String(editId)
    );
    if (!service) {
      await showAlert(
        "Service not found.",
        "Service Status",
        "info"
      );
      return;
    }
    document.getElementById("serviceName").value =
      service.service_name;
    document.getElementById("description").value =
      service.description || "";
    document.getElementById("price").value =
      service.price;
    document.getElementById("status").value =
      service.status;
    const form = document.getElementById("serviceForm");
    form.dataset.editId = editId;
    const button = form.querySelector(
      "button[type='submit']"
    );
    if (button) {
      button.textContent = "Update Service";
    }
  } catch (e) {
    await showAlert(
      e.message,
      "Error",
      "error"
    );
  }
}

const serviceSearchForm =
  document.querySelector("#serviceContainer")
    ?.closest(".dashboard-container")
    ?.querySelector(".search-cont form");

if (serviceSearchForm) {
  serviceSearchForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const searchValue =
      document
        .getElementById("search-input")
        .value
        .trim()
        .toLowerCase();
    if (!searchValue) {
      displayServices();
      return;
    }
    try {
      const services = await getServices();
      const result = services.filter(service => {
        const id =
          String(service.service_id || "")
            .toLowerCase();
        const name =
          service.service_name?.toLowerCase() || "";
        const description =
          service.description?.toLowerCase() || "";
        return (
          id === searchValue ||
          name.includes(searchValue) ||
          description.includes(searchValue)
        );
      });
      const box =
        document.getElementById("serviceContainer");
      box.innerHTML = result.map(s => `
        <tr>
          <td>${s.service_id}</td>
          <td>${escapeHtml(s.service_name)}</td>
          <td>${escapeHtml(s.description || "-")}</td>
          <td>₹${s.price}</td>
          <td class="status ${statusClass(s.status)}">${escapeHtml(s.status)}</td>
          <td>
            <button
              class="small-btn edit-btn"
              onclick="editService(${s.service_id})">
              Edit
            </button>
            <button
              class="small-btn danger"
              onclick="deleteService(${s.service_id})">
              Delete
            </button>
          </td>
        </tr>
      `).join("") ||
        `<tr>
        <td colspan="6">No services found.</td>
      </tr>`;
    } catch (e) {
      console.error(e);
    }
  });
}
async function displayVehicles() {
  const box = document.getElementById("vehicleContainer");
  if (!box) return;
  try {
    const list = await getVehicles();
    box.innerHTML = list.map(v => `<tr>
          <td>${v.vehicle_id}</td>
          <td>
            ${escapeHtml(v.brand)}
            ${escapeHtml(v.model)}
          </td>
          <td>${escapeHtml(v.registration_no)}</td>
          <td>${escapeHtml(v.owner_name)}</td>
          <td>${v.year || "-"}</td>
          <td>${escapeHtml(v.fuel_type || "-")}</td>
        </tr>`).join("") || '<tr><td colspan="6">No vehicles.</td></tr>';
  } catch (e) {
    box.innerHTML = `<tr><td colspan="6">${escapeHtml(e.message)}</td></tr>`;
  }
}

const vehicleSearchForm =
  document.querySelector("#vehicleContainer")
    ?.closest(".dashboard-container")
    ?.querySelector(".search-cont form");

if (vehicleSearchForm) {
  vehicleSearchForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const searchValue =
      document.getElementById("search-input").value.trim().toLowerCase();
    if (!searchValue) {
      displayVehicles();
      return;
    }
    try {
      const vehicles = await getVehicles();
      const result = vehicles.filter(vehicle => {
        const id =
          String(vehicle.vehicle_id || "")
            .toLowerCase();
        const owner =
          vehicle.owner_name?.toLowerCase() || "";
        const registration =
          vehicle.registration_no?.toLowerCase() || "";
        const brand =
          vehicle.brand?.toLowerCase() || "";
        const model =
          vehicle.model?.toLowerCase() || "";
        return (
          id === searchValue ||
          owner.includes(searchValue) ||
          registration.includes(searchValue) ||
          brand.includes(searchValue) ||
          model.includes(searchValue)
        );
      });
      const box =
        document.getElementById("vehicleContainer");
      box.innerHTML = result.map(v => `
        <tr>
          <td>${v.vehicle_id}</td>
          <td>${escapeHtml(v.registration_no)}</td>
          <td>${escapeHtml(v.owner_name)}</td>
          <td>
            ${escapeHtml(v.brand)}
            ${escapeHtml(v.model)}
          </td>
          <td>${v.year || "-"}</td>
          <td>${escapeHtml(v.fuel_type || "-")}</td>
        </tr>
      `).join("") ||
        `<tr>
        <td colspan="6">No vehicles found.</td>
      </tr>`;
    } catch (e) {
      console.error(e);
    }
  });
}

async function displayBookings() {
  const box = document.getElementById("bookingContainer");
  if (!box) return;
  try {
    const [bookings, users] = await Promise.all([getBookings(), getUsers()]);
    const mechanics = users.filter(u => u.role === "mechanic");

    box.innerHTML = bookings.map(b => `
      <tr>
        <td>#AC${b.booking_id}</td>
        <td>${escapeHtml(b.customer_name)}</td>
        <td>${escapeHtml(b.registration_no)}</td>
        <td>${escapeHtml(b.service_name)}</td>
        <td>${formatDate(b.booking_date)}</td>
        <td>
          ${b.status === "Completed"
        ? `<span class="status completed">Completed</span>`
        : `
            <select onchange="updateBookingStatus(${b.booking_id}, this.value)">
              <option ${b.status === "Pending" ? "selected" : ""}>Pending</option>
              <option ${b.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
              <option ${b.status === "In Progress" ? "selected" : ""}>In Progress</option>
              <option ${b.status === "Completed" ? "selected" : ""}>Completed</option>
              <option ${b.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
            </select>
          `
      }
        </td>
        <td>
          <select onchange="assignMechanic(${b.booking_id},this.value)">     
           <option value="">Assign mechanic</option>
           ${mechanics.map(m => `
              <option value="${m.user_id}" ${b.mechanic_id == m.user_id ? "selected" : ""}>${escapeHtml(m.name)}</option>`).join("")}
          </select> 
          <button class="small-btn danger" onclick="deleteBooking(${b.booking_id})">Delete</button>
        </td>
      </tr>`).join("") || '<tr><td colspan="7">No bookings.</td></tr>';
  } catch (e) {
    box.innerHTML = `<tr><td colspan="7">${escapeHtml(e.message)}</td></tr>`;
  }
}

async function updateBookingStatus(id, status) {
  try {
    const bookings = await getBookings();
    const booking = bookings.find(
      b => String(b.booking_id) === String(id)
    );
    if (!booking) {
      await showAlert(
        "Booking not found.",
        "Booking Status",
        "info"
      );
      return;
    }
    if (booking.status === "Completed") {
      await showAlert(
        "Completed bookings cannot be updated.",
        "Booking Update Status",
        "warning"
      );
      return;
    }
    await adminFetch("/bookings/" + id + "/status", {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    displayBookings();
  } catch (e) {
    await showAlert(
      e.message,
      "Error",
      "error"
    );
  }
}

const bookingContainer = document.getElementById("bookingContainer");
const bookingSearchInput = document.getElementById("search-input");
const bookingSearchButton = document.getElementById("search-btn");

if (bookingContainer && bookingSearchInput && bookingSearchButton) {
  bookingSearchButton.addEventListener("click", async function (e) {
    e.preventDefault();
    const searchValue = bookingSearchInput.value
      .trim()
      .toLowerCase();
    if (!searchValue) {
      await displayBookings();
      return;
    }
    try {
      const [bookings, users] = await Promise.all([
        getBookings(),
        getUsers()
      ]);
      const mechanics = users.filter(
        user => user.role === "mechanic"
      );
      let searchId = searchValue;
      if (searchId.startsWith("#ac")) {
        searchId = searchId.substring(3);
      } else if (searchId.startsWith("ac")) {
        searchId = searchId.substring(2);
      }
      const result = bookings.filter(b => {
        const bookingId = String(b.booking_id || "");
        const customer = String(
          b.customer_name || ""
        ).toLowerCase();
        const registration = String(
          b.registration_no || ""
        ).toLowerCase();
        const service = String(
          b.service_name || ""
        ).toLowerCase();
        const status = String(
          b.status || ""
        ).toLowerCase();
        return (
          bookingId === searchId ||
          customer.includes(searchValue) ||
          registration.includes(searchValue) ||
          service.includes(searchValue) ||
          status.includes(searchValue)
        );
      });
      if (result.length === 0) {
        bookingContainer.innerHTML = `
          <tr>
            <td colspan="7">
              No bookings found.
            </td>
          </tr>
        `;
        return;
      }
      bookingContainer.innerHTML = result.map(b => `
        <tr>
          <td>
            #AC${b.booking_id}
          </td>
          <td>
            ${escapeHtml(b.customer_name)}
          </td>
          <td>
            ${escapeHtml(b.registration_no)}
          </td>
          <td>
            ${escapeHtml(b.service_name)}
          </td>
          <td>
            ${formatDate(b.booking_date)}
          </td>
          <td>
            ${b.status === "Completed"
          ? `
                  <span class="status completed">
                    Completed
                  </span>
                `
          : `
                  <select
                    onchange="updateBookingStatus(
                      ${b.booking_id},
                      this.value
                    )"
                  >
                    <option value="Pending"
                      ${b.status === "Pending" ? "selected" : ""}>
                      Pending
                    </option>
                    <option value="Confirmed"
                      ${b.status === "Confirmed" ? "selected" : ""}>
                      Confirmed
                    </option>
                    <option value="In Progress"
                      ${b.status === "In Progress" ? "selected" : ""}>
                      In Progress
                    </option>
                    <option value="Completed">
                      Completed
                    </option>
                    <option value="Cancelled"
                      ${b.status === "Cancelled" ? "selected" : ""}>
                      Cancelled
                    </option>

                  </select>
                `
        }
          </td>
          <td>
            <select
              onchange="assignMechanic(
                ${b.booking_id},
                this.value
              )"
            >
              <option value="">
                Assign mechanic
              </option>
              ${mechanics.map(m => `
                <option
                  value="${m.user_id}"
                  ${b.mechanic_id == m.user_id ? "selected" : ""}
                >
                  ${escapeHtml(m.name)}
                </option>
              `).join("")}
            </select>
            <button
              class="small-btn danger"
              onclick="deleteBooking(${b.booking_id})"
            >
              Delete
            </button>
          </td>
        </tr>
      `).join("");
    } catch (error) {
      console.error("Booking search error:", error);
      await showAlert(
        error.message,
        "Search Error",
        "error"
      );
    }
  });
}

async function assignMechanic(id, mechanicId) {
  if (!mechanicId) return;
  try {
    await adminFetch("/bookings/" + id + "/mechanic", { method: "PATCH", body: JSON.stringify({ mechanicId }) });
    await showAlert(
      "Mechanic assigned",
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
}

async function deleteBooking(id) {
  const confirmed = await showConfirm(
    "Delete this booking?",
    "Delete Booking?"
  );

  if (!confirmed) return;
  try {
    await adminFetch("/bookings/" + id, { method: "DELETE" });
    await displayBookings();
  } catch (e) {
    await showAlert(
      e.message,
      "Error",
      "error"
    );
  }
}

async function loadAdminDashboard() {
  const dashboard = document.querySelector(".dashboard-page");
  if (!dashboard) return;
  try {
    const [users, vehicles, bookings, services] = await Promise.all([getUsers(), getVehicles(), getBookings(), getServices()]);

    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    set("totalUsers", users.length);
    set("totalMechanics", users.filter(u => u.role === "mechanic").length);
    set("totalVehicles", vehicles.length);
    set("totalBookings", bookings.length);

    const recent = document.getElementById("recentBookings");

    if (recent) recent.innerHTML = bookings.slice(0, 5).map(b => `
      <tr>
        <td>#AC${b.booking_id}</td>
        <td>${escapeHtml(b.customer_name)}</td>
        <td>${escapeHtml(b.registration_no)}</td>
        <td>${escapeHtml(b.service_name)}</td>
        <td><span class="status ${statusClass(b.status)}">${escapeHtml(b.status)}</span></td>
      </tr>`).join("") || '<tr><td colspan="5">No bookings found.</td></tr>';

    const serviceRows = document.getElementById("recentServices");

    if (serviceRows) serviceRows.innerHTML = services.slice(0, 5).map(x => `<tr>
      <td>${escapeHtml(x.service_name)}</td>
      <td>${escapeHtml(x.description || "-")}</td>
      <td>₹${x.price}</td>
      <td>${escapeHtml(x.status)}</td>
     </tr>`).join("") || '<tr><td colspan="4">No services found.</td></tr>';
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin("admin")) return;
  displayUsers();
  displayMechanics();
  displayServices();
  displayVehicles();
  displayBookings();
  loadServiceForEdit();
  loadAdminDashboard();
});

async function displayMessages() {
  const box = document.getElementById('messageContainer');
  if (!box) return;
  try {
    const messages = await adminFetch('/contact');
    if (!messages.length) {
      box.innerHTML = '<tr><td colspan="7">No contact messages found.</td></tr>';
      return;
    }
    box.innerHTML = messages.map(m => `
      <tr>
        <td>${m.message_id}</td>
        <td>${escapeHtml(m.name)}</td>
        <td>${escapeHtml(m.email)}</td>
        <td>${escapeHtml(m.subject)}</td>
        <td>${escapeHtml(m.message)}</td>
        <td>${formatDate(m.created_at)}</td>
        <td><button class="small-btn danger" onclick="deleteMessage(${m.message_id})">Delete</button></td>
      </tr>`).join('');
  } catch (error) {
    box.innerHTML = `<tr><td colspan="7">${escapeHtml(error.message)}</td></tr>`;
  }
}

async function deleteMessage(id) {
  const confirmed = await showConfirm(
    'Delete this message?',
    "Delete message?"
  );

  if (!confirmed) return;
  try {
    await adminFetch('/contact/' + id, { method: 'DELETE' });
    displayMessages();
  } catch (error) {
    await showAlert(
      error.message,
      "Error",
      "error"
    );
  }
}

if (document.getElementById('messageContainer')) displayMessages();
