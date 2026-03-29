let cart = JSON.parse(localStorage.getItem("cart")) || [];

let confirmBox = document.getElementById("confirm-box");
let confirmMessage = document.getElementById("confirm-message");
let confirmYes = document.getElementById("confirm-yes");
let confirmNo = document.getElementById("confirm-no");

let pendingAction = null;

let buttons = document.querySelectorAll(".add-to-cart");

if(buttons.length > 0){
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            let product = button.parentElement;
            let name = product.querySelector("h3").textContent;
            let price = product.querySelector(".price").dataset.price;

            let existingItem = cart.find(item => item.name === name);

            if(existingItem){
                existingItem.quantity += 1;
            } else {
                cart.push({
                    name,
                    price: parseFloat(price),
                    quantity: 1
                });
            }

            localStorage.setItem("cart", JSON.stringify(cart));

            let message = document.getElementById("cart-message");

            message.textContent = name + " added to cart!";
            message.style.opacity = "1";

            setTimeout(() => {
                message.style.opacity = "0";
            }, 2000);
        });
    });
}

let cartItems = document.getElementById("cart-items");

if(cartItems){
    let subtotal = 0;

    function displayCart(){
        cartItems.innerHTML = "";
        subtotal = 0;

        cart.forEach((item, index) => {
            let total = item.price * item.quantity;
            subtotal += total;

            let row = `
                <tr>
                    <td>${item.name}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>
                        <button onclick="decreaseQty(${index})">-</button>
                        ${item.quantity}
                        <button onclick="increaseQty(${index})">+</button>
                    </td>
                    <td>$${total.toFixed(2)}</td>
                    <td><button onclick="removeItem(${index})">Remove</button></td>
                </tr>
            `;

            cartItems.innerHTML += row;
        });

        let tax = subtotal * 0.15;
        let finalTotal = subtotal + tax;

        document.getElementById("subtotal").textContent = subtotal.toFixed(2);
        document.getElementById("tax").textContent = tax.toFixed(2);
        document.getElementById("total").textContent = finalTotal.toFixed(2);
    }

    displayCart();

    let clearCartBtn = document.getElementById("clear-cart");
    if(clearCartBtn){
        clearCartBtn.addEventListener("click", () => {
            localStorage.removeItem("cart");
            location.reload();
        });
    }

    window.decreaseQty = function(index){
        if(cart[index].quantity > 1){
            cart[index].quantity -= 1;
            localStorage.setItem("cart", JSON.stringify(cart));
            displayCart();
        } else {
            showConfirm("Are you sure you want to remove this item?", () => {
                cart.splice(index, 1);
                localStorage.setItem("cart", JSON.stringify(cart));
                displayCart();
            });
        }
    };

    window.increaseQty = function(index){
        cart[index].quantity += 1;
        localStorage.setItem("cart", JSON.stringify(cart));
        displayCart();
    };

    window.removeItem = function(index){
        showConfirm("Are you sure you want to remove this item?", () => {
            cart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            displayCart();
        });
    };
}

function showConfirm(message, action){
    confirmMessage.textContent = message;
    confirmBox.classList.remove("hidden");
    pendingAction = action;
}

if(confirmYes && confirmNo){
    confirmYes.addEventListener("click", () => {
        if(pendingAction){
            pendingAction();
        }
        confirmBox.classList.add("hidden");
        pendingAction = null;
    });

    confirmNo.addEventListener("click", () => {
        confirmBox.classList.add("hidden");
        pendingAction = null;
    });
}

let checkoutItems = document.getElementById("checkout-items");

if(checkoutItems){
    let checkoutCart = cart;
    let checkoutSubtotal = 0;

    function displayCheckout(){
        checkoutItems.innerHTML = "";
        checkoutSubtotal = 0;

        checkoutCart.forEach((item) => {
            let total = item.price * item.quantity;
            checkoutSubtotal += total;

            let row = `
                <tr>
                    <td>${item.name}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>$${total.toFixed(2)}</td>
                </tr>
            `;

            checkoutItems.innerHTML += row;
        });

        let checkoutTax = checkoutSubtotal * 0.15;
        let checkoutFinalTotal = checkoutSubtotal + checkoutTax;

        document.getElementById("checkout-subtotal").textContent = checkoutSubtotal.toFixed(2);
        document.getElementById("checkout-tax").textContent = checkoutTax.toFixed(2);
        document.getElementById("checkout-total").textContent = checkoutFinalTotal.toFixed(2);

        let amountField = document.getElementById("amount-paid");
        if(amountField){
            amountField.value = "$" + checkoutFinalTotal.toFixed(2);
        }
    }

    displayCheckout();

    let checkoutForm = document.getElementById("checkout-form");
    let checkoutMessage = document.getElementById("checkout-message");
    let cancelOrderBtn = document.getElementById("cancel-order");
    let clearCheckoutBtn = document.getElementById("clear-checkout");

    checkoutForm.addEventListener("submit", function(event){
        event.preventDefault();

        let name = document.getElementById("customer-name").value.trim();
        let email = document.getElementById("customer-email").value.trim();
        let phone = document.getElementById("customer-phone").value.trim();
        let address = document.getElementById("customer-address").value.trim();

        document.getElementById("name-error").textContent = "";
        document.getElementById("email-error").textContent = "";
        document.getElementById("phone-error").textContent = "";
        document.getElementById("address-error").textContent = "";
        checkoutMessage.textContent = "";
        checkoutMessage.style.background = "transparent";

        let valid = true;

        if(name === ""){
            document.getElementById("name-error").textContent = "Full name is required.";
            valid = false;
        }

        if(email === "" || !email.includes("@")){
            document.getElementById("email-error").textContent = "Enter a valid email address.";
            valid = false;
        }

        if(phone === ""){
            document.getElementById("phone-error").textContent = "Phone number is required.";
            valid = false;
        }

        if(address === ""){
            document.getElementById("address-error").textContent = "Shipping address is required.";
            valid = false;
        }

        if(checkoutCart.length === 0){
            checkoutMessage.textContent = "Your cart is empty.";
            checkoutMessage.style.background = "#8b0000";
            valid = false;
        }

        if(valid){
            checkoutMessage.textContent = "Order confirmed successfully!";
            checkoutMessage.style.background = "#2e7d32";

            localStorage.removeItem("cart");
            cart = [];
            checkoutCart = [];
            checkoutForm.reset();
            checkoutItems.innerHTML = "";
            document.getElementById("checkout-subtotal").textContent = "0.00";
            document.getElementById("checkout-tax").textContent = "0.00";
            document.getElementById("checkout-total").textContent = "0.00";
        }
    });

    if(cancelOrderBtn){
        cancelOrderBtn.addEventListener("click", function(){
            checkoutForm.reset();
            checkoutMessage.textContent = "Order cancelled.";
            checkoutMessage.style.background = "#8b0000";
        });
    }

    if(clearCheckoutBtn){
        clearCheckoutBtn.addEventListener("click", function(){
            checkoutForm.reset();
            document.getElementById("name-error").textContent = "";
            document.getElementById("email-error").textContent = "";
            document.getElementById("phone-error").textContent = "";
            document.getElementById("address-error").textContent = "";
            checkoutMessage.textContent = "Form cleared.";
            checkoutMessage.style.background = "#555";
        });
    }
}

let loginForm = document.getElementById("login-form");

if(loginForm){
    let loginMessage = document.getElementById("login-message");

    loginForm.addEventListener("submit", function(event){
        event.preventDefault();

        let usernameOrEmail = document.getElementById("login-username").value.trim();
        let password = document.getElementById("login-password").value.trim();

        document.getElementById("login-username-error").textContent = "";
        document.getElementById("login-password-error").textContent = "";
        loginMessage.textContent = "";
        loginMessage.style.background = "transparent";

        let valid = true;

        if(usernameOrEmail === ""){
            document.getElementById("login-username-error").textContent = "Username or email is required.";
            valid = false;
        }

        if(password === ""){
            document.getElementById("login-password-error").textContent = "Password is required.";
            valid = false;
        }

        if(valid){
            let registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];

            if(registeredUsers.length === 0){
                loginMessage.textContent = "No registered user found. Please register first.";
                loginMessage.style.background = "#8b0000";
                return;
            }

            let foundUser = registeredUsers.find(user =>
                (user.username === usernameOrEmail || user.email === usernameOrEmail) &&
                user.password === password
            );

            if(foundUser){
                loginMessage.textContent = "Login successful!";
                loginMessage.style.background = "#2e7d32";
                localStorage.setItem("loggedInUser", JSON.stringify(foundUser));
                loginForm.reset();

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
            } else {
                loginMessage.textContent = "Login unsuccessful. Invalid username/email or password.";
                loginMessage.style.background = "#8b0000";
            }
        }
    });
}

let registerForm = document.getElementById("register-form");

if(registerForm){
    let registerMessage = document.getElementById("register-message");

    registerForm.addEventListener("submit", function(event){
        event.preventDefault();

        let name = document.getElementById("reg-name").value.trim();
        let dob = document.getElementById("reg-dob").value;
        let email = document.getElementById("reg-email").value.trim().toLowerCase();
        let username = document.getElementById("reg-username").value.trim();
        let password = document.getElementById("reg-password").value.trim();
        let confirmPassword = document.getElementById("reg-confirm-password").value.trim();

        document.getElementById("reg-name-error").textContent = "";
        document.getElementById("reg-dob-error").textContent = "";
        document.getElementById("reg-email-error").textContent = "";
        document.getElementById("reg-username-error").textContent = "";
        document.getElementById("reg-password-error").textContent = "";
        document.getElementById("reg-confirm-password-error").textContent = "";
        registerMessage.textContent = "";
        registerMessage.style.background = "transparent";

        let valid = true;

        if(name === ""){
            document.getElementById("reg-name-error").textContent = "Full name is required.";
            valid = false;
        }

        if(dob === ""){
            document.getElementById("reg-dob-error").textContent = "Date of birth is required.";
            valid = false;
        }

        if(email === ""){
            document.getElementById("reg-email-error").textContent = "Email is required.";
            valid = false;
        } else if(!email.includes("@") || !email.includes(".")){
            document.getElementById("reg-email-error").textContent = "Enter a valid email address.";
            valid = false;
        }

        if(username === ""){
            document.getElementById("reg-username-error").textContent = "Username is required.";
            valid = false;
        } else if(username.length < 4){
            document.getElementById("reg-username-error").textContent = "Username must be at least 4 characters.";
            valid = false;
        }

        if(password === ""){
            document.getElementById("reg-password-error").textContent = "Password is required.";
            valid = false;
        } else if(password.length < 6){
            document.getElementById("reg-password-error").textContent = "Password must be at least 6 characters.";
            valid = false;
        }

        if(confirmPassword === ""){
            document.getElementById("reg-confirm-password-error").textContent = "Please confirm your password.";
            valid = false;
        } else if(confirmPassword !== password){
            document.getElementById("reg-confirm-password-error").textContent = "Passwords do not match.";
            valid = false;
        }

        let registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];

        let duplicateEmail = registeredUsers.some(user => user.email === email);
        let duplicateUsername = registeredUsers.some(user => user.username === username);

        if(email !== "" && duplicateEmail){
            document.getElementById("reg-email-error").textContent = "This email is already registered.";
            valid = false;
        }

        if(username !== "" && duplicateUsername){
            document.getElementById("reg-username-error").textContent = "This username is already taken.";
            valid = false;
        }

        if(valid){
            let newUser = {
                name: name,
                dob: dob,
                email: email,
                username: username,
                password: password
            };

            registeredUsers.push(newUser);
            localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

            registerMessage.textContent = "Registration successful!";
            registerMessage.style.background = "#2e7d32";
            registerForm.reset();
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const welcomeUser = document.getElementById("welcome-user");
    const authLink = document.getElementById("auth-link");
    const logoutBtn = document.getElementById("logout-btn");
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (welcomeUser) {
        welcomeUser.textContent = loggedInUser ? "Welcome, " + loggedInUser.username + "!" : "";
    }

    if (authLink) {
        authLink.style.display = loggedInUser ? "none" : "inline-block";
    }

    if (logoutBtn) {
        logoutBtn.style.display = loggedInUser ? "inline-block" : "none";

        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("loggedInUser");
            window.location.href = "index.html";
        });
    }
});