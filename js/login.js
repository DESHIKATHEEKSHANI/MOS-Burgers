function validateLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
  
    const cashierUsername = "cashier";
    const cashierPassword = "cashier123";
  
    const adminUsername = "admin";
    const adminPassword = "admin123";
  
    if (username === cashierUsername && password === cashierPassword) {
        Swal.fire({
            title: "Login Successful!",
            text: "Redirecting to Cashier Page.",
            icon: "success"
        });
      window.location.href = "home.html"; 
    } else if (username === adminUsername && password === adminPassword) {
        Swal.fire({
            title: "Login Successful!",
            text: "Redirecting to Admin Page.",
            icon: "success"
        });
      window.location.href = "manage.html"; 
    } else {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Invalid Username or Password. Please try again.",
          });
    }
  }
  