const MECHANIC_API = "/api";

function mechanicHeaders() {
  return { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("token") };
}
async function mechanicFetch(path, options = {}) {
  const r = await fetch(MECHANIC_API + path, { ...options, headers: { ...mechanicHeaders(), ...(options.headers || {}) } });

  const d = await r.json();
  if (!r.ok) throw new Error(d.message || "Request failed");
  return d;
}
async function getJobs() {
  return mechanicFetch("/bookings/assigned");
}

async function loadJobDetails() {
  const id = new URLSearchParams(location.search).get("id");
  const form = document.getElementById("jobForm");
  if (!id || !form) return;
  try {
    const j = await mechanicFetch("/bookings/" + id);
    const vehicleImage =
      document.getElementById("vehicleImage");

    if (vehicleImage) {
      vehicleImage.src =
        j.vehicle_image || "../assets/images/car.png";
    }
    document.getElementById("bookingId").textContent =
      "#AC" + j.booking_id;
    document.getElementById("vehicle").textContent =
      j.registration_no + " (" + j.brand + " " + j.model + ")";
    document.getElementById("customer").textContent =
      j.customer_name;
    document.getElementById("service").textContent =
      j.service_name;
    document.getElementById("date").textContent =
      formatDate(j.booking_date);
    const status = document.getElementById("status");
    const submitButton = form.querySelector("button[type='submit']");
    if (j.status === "Completed") {
      status.value = "Completed";
      status.disabled = true;
      if (submitButton) {
        submitButton.style.display = "none";
      }
    } else {
      status.value = j.status;
      status.disabled = false;
      if (submitButton) {
        submitButton.style.display = "";
      }
    }
  } catch (e) {
    await showAlert(
      e.message,
      "Error",
      "error"
    );
  }
}

const jobForm = document.getElementById("jobForm");
if (jobForm) {
  jobForm.addEventListener("submit", async e => {
    e.preventDefault();
    const id = new URLSearchParams(location.search).get("id");
    try {
      const booking = await mechanicFetch("/bookings/" + id);
      if (booking.status === "Completed") {
        await showAlert(
          "Completed jobs cannot be updated.",
          "Booking Status Info",
          "warning"
        );
        return;
      }
      await mechanicFetch("/bookings/" + id + "/status", {
        method: "PATCH",
        body: JSON.stringify({
          status: document.getElementById("status").value
        })
      });
      await showAlert(
        "Job updated!",
        "Success",
        "success"
      );
      location.href = "assigned-jobs.html";
    } catch (e) {
      await showAlert(
        e.message,
        "Error",
        "error"
      );
    }
  });
}

async function displayJobs(searchText = "") {
  const box = document.getElementById("jobContainer");

  if (!box) return;

  try {
    const jobs = await getJobs();

    const search = searchText.trim().toLowerCase();

    const filteredJobs = jobs.filter(j =>
      String(j.booking_id).toLowerCase().includes(search) ||
      String(j.registration_no || "").toLowerCase().includes(search) ||
      String(j.service_name || "").toLowerCase().includes(search) ||
      String(j.status || "").toLowerCase().includes(search)
    );

    box.innerHTML = filteredJobs.length
      ? filteredJobs.map(j => `
          <tr>
            <td>#AC${j.booking_id}</td>
            <td>
              ${escapeHtml(j.brand)}
              ${escapeHtml(j.model)}
            </td>
            <td>
              ${escapeHtml(j.registration_no)}
            </td>
            <td>
              ${escapeHtml(j.service_name)}
            </td>
            <td>
              ${formatDate(j.booking_date)}
            </td>
            <td>
              <span class="status ${statusClass(j.status)}">
                ${escapeHtml(j.status)}
              </span>
            </td>

            <td>
              <a
                href="job-details.html?id=${j.booking_id}"
                class="small-btn">
                View
              </a>
            </td>
          </tr>
        `).join("")
      : '<tr><td colspan="7">No matching jobs found.</td></tr>';

  } catch (e) {
    box.innerHTML =
      `<tr><td colspan="7">${escapeHtml(e.message)}</td></tr>`;
  }
}
const jobSearchForm = document.getElementById("jobSearchForm");

if (jobSearchForm) {
  jobSearchForm.addEventListener("submit", e => {
    e.preventDefault();
    const searchText =
      document.getElementById("jobSearchInput").value;
    displayJobs(searchText);
  });
}

async function loadMechanicDashboard() {
  if (!document.querySelector(".dashboard-page")) return;
  try {
    const jobs = await getJobs(), stats = document.querySelectorAll(".stat-card strong");
    if (stats.length >= 4) {
      stats[0].textContent = jobs.length;
      stats[1].textContent = jobs.filter(j => j.status === "In Progress").length; stats[2].textContent = jobs.filter(j => j.status === "Completed").length;
      stats[3].textContent = jobs.filter(j => j.status === "Pending").length;
    }
    const rows = document.querySelectorAll(".data-table tr");

    if (rows.length && !document.getElementById("jobContainer")) {
      const table = document.querySelector(".data-table");
      table.innerHTML = `
        <tr>
          <th>Booking ID</th>
          <th>Vehicle</th>
          <th>Vehicle No.</th>
          <th>Service</th>
          <th>Date</th>
          <th>Status</th>
        </tr>`+ jobs.slice(0, 5).map(j => `
          <tr>
            <td>#AC${j.booking_id}</td>
            <td>
              ${escapeHtml(j.brand)}
              ${escapeHtml(j.model)}
            </td>
            <td>${escapeHtml(j.registration_no)}</td>
            <td>${escapeHtml(j.service_name)}</td>
            <td>${formatDate(j.booking_date)}</td>
            <td><span class="status ${statusClass(j.status)}">${escapeHtml(j.status)}</span></td>
          </tr>`).join("");
    }
  } catch (e) {
    await showAlert(
      e.message,
      "Error",
      "error"
    );
  }
}
document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin("mechanic")) return;
  displayJobs();
  loadJobDetails();
  loadMechanicDashboard();
});
