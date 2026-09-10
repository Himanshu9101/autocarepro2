const API_URL = "/api";

async function apiAuth(url, data) {
  const response = await fetch(API_URL + url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Something went wrong");
  return result;
}

function redirectByRole(user) {
  if (user.role === "admin") location.href = "admin/dashboard.html";
  else if (user.role === "mechanic") location.href = "mechanic/dashboard.html";
  else location.href = "customer/dashboard.html";
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async e => {
    e.preventDefault();
    const password = document.getElementById("password").value;
    if (password !== document.getElementById("confirmPassword").value) {
      await showAlert(
        "Passwords do not match.",
        "Enter matching password",
        "warning"
      );
      return;
    }
    try {
      const result = await apiAuth("/auth/register", {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        password
      });
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      redirectByRole(result.user);
    } catch (error) {
      await showAlert(
        error.message,
        "Error",
        "error"
      );
    }
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      const result = await apiAuth("/auth/login", {
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value
      });
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      redirectByRole(result.user);
    } catch (error) {
      await showAlert(
        error.message,
        "Error",
        "error"
      );
    }
  });
}
