// ===== КОШИК =====

function getCart() {
    let cart = localStorage.getItem("cart");

    if (cart) {
        return JSON.parse(cart);
    }

    return [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(name, price, image, button) {
    let cart = getCart();

    let product = cart.find(function(item) {
        return item.name === name;
    });

    if (product) {
        product.quantity = product.quantity + 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1,
            image: image
        });
    }

    saveCart(cart);
    updateCartCount();

    if (button) {
        let oldText = button.innerHTML;

        button.innerHTML = "✓ Додано";
        button.style.transform = "scale(0.95)";

        setTimeout(function() {
            button.innerHTML = oldText;
            button.style.transform = "";
        }, 1200);
    }
}

// ===== ПОКАЗ КОШИКА =====

function displayCart() {
    let cart = getCart();

    let cartItems = document.getElementById("cart-items");
    let cartTotal = document.getElementById("cart-total");

    if (!cartItems || !cartTotal) {
        return;
    }

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Ваш кошик поки порожній 🛒</p>";
        cartTotal.innerHTML = "";
        return;
    }

    let total = 0;
    let html = "";

    cart.forEach(function(item) {
        let itemTotal = item.price * item.quantity;

        total = total + itemTotal;

        html = html + `
    <div class="cart-item">
         <img src="${item.image}" alt="${item.name}">
        <h2>${item.name}</h2>

        <p>Ціна: ${item.price} грн</p>

        <div class="quantity">
            <button onclick="changeQuantity(${cart.indexOf(item)}, -1)">−</button>

            <span>${item.quantity}</span>

            <button onclick="changeQuantity(${cart.indexOf(item)}, 1)">+</button>
        </div>

        <p>Сума: ${itemTotal} грн</p>

        <button onclick="removeFromCart(${cart.indexOf(item)})">
             Видалити
        </button>
    </div>
`;
    });

    cartItems.innerHTML = html;
    cartTotal.innerHTML = `<h2>Разом: ${total} грн</h2>`;
}

function changeQuantity(index, amount) {
    let cart = getCart();

    cart[index].quantity = cart[index].quantity + amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart(cart);
    displayCart();
    updateCartCount();
}

function removeFromCart(index) {
    let cart = getCart();

    cart.splice(index, 1);

    saveCart(cart);
    displayCart();
    updateCartCount();
}

document.addEventListener("DOMContentLoaded", function() {
    displayCart();
    updateCartCount()
});

function updateCartCount() {
    let cart = getCart();
    let total = 0;

    cart.forEach(function(item) {
        total = total + item.quantity;
    });

    document.querySelectorAll(".cart-count").forEach(function(element) {
        element.textContent = total;
    });
}

function clearCart() {
    localStorage.removeItem("cart");
    displayCart();
    updateCartCount();
}

async function submitOrder() {

    let emailScriptUrl = "https://script.google.com/macros/s/AKfycbxAsQitgx8DULyLe3kU6bbsHsd9ThX2btmBKepAovGEyZkXd7WxH2YRA2PPlBI_aJU/exec";

    let name = document.getElementById("name").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let city = document.getElementById("city").value.trim();
    let email = document.getElementById("email").value.trim();

    let delivery = document.querySelector('input[name="delivery"]:checked');
    let payment = document.querySelector('input[name="payment"]:checked');

    if (!name || !phone || !email || !city) {
        alert("Будь ласка, заповніть усі обов'язкові поля 🤍");
        return;
    }

    if (!delivery) {
        alert("Будь ласка, оберіть спосіб доставки 📦");
        return;
    }

    if (!payment) {
        alert("Будь ласка, оберіть спосіб оплати 💳");
        return;
    }

    let deliveryAddress = "";

    if (delivery.value === "Нова пошта — відділення") {
        deliveryAddress = document.getElementById("nova-branch").value.trim();
    }

    if (delivery.value === "Нова пошта — поштомат") {
        deliveryAddress = document.getElementById("nova-locker").value.trim();
    }

    if (delivery.value === "Кур'єр Нової пошти") {
        deliveryAddress = document.getElementById("nova-courier").value.trim();
    }

    if (delivery.value === "Укрпошта — відділення") {
        deliveryAddress = document.getElementById("ukr-branch").value.trim();
    }

    if (delivery.value !== "Самовивіз" && !deliveryAddress) {
        alert("Будь ласка, вкажіть адресу доставки 📦");
        return;
    }

    if (delivery.value === "Самовивіз") {
        deliveryAddress = "Самовивіз";
    }

    let cart = getCart();

    if (cart.length === 0) {
        alert("Ваш кошик порожній 🛒");
        return;
    }

    let lastOrderNumber = localStorage.getItem("lastOrderNumber");

    if (!lastOrderNumber) {
        lastOrderNumber = 1000;
    }

    let orderNumber = "K" + (Number(lastOrderNumber) + 1);

    localStorage.setItem(
        "lastOrderNumber",
        Number(lastOrderNumber) + 1
    );

    let order = {
        orderNumber: orderNumber,
        name: name,
        phone: phone,
        email: email,
        city: city,
        delivery: delivery.value,
        deliveryAddress: deliveryAddress,
        payment: payment.value,
        products: cart
    };

    localStorage.setItem("order", JSON.stringify(order));

    await fetch(emailScriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(order)
    });

    let orders = localStorage.getItem("orders");

    if (orders) {
        orders = JSON.parse(orders);
    } else {
        orders = [];
    }

    orders.push(order);

    localStorage.setItem("orders", JSON.stringify(orders));

    alert("Дякуємо за замовлення! 🤍");

    localStorage.removeItem("cart");

    updateCartCount();

    window.location.href = "success.html";
}

// ===== ПОКАЗ ЗАМОВЛЕННЯ =====

function displayOrder() {

    let orderSummary = document.getElementById("order-summary");

    if (!orderSummary) {
        return;
    }

    let savedOrder = localStorage.getItem("order");

    if (!savedOrder) {
        orderSummary.innerHTML = "<p>Інформацію про замовлення не знайдено.</p>";
        return;
    }

    let order = JSON.parse(savedOrder);

    let html = `
        <div class="customer-info">

            <h3>Дані замовлення</h3>

            <p><strong>Номер замовлення:</strong> ${order.orderNumber}</p>

            <p><strong>Ім'я:</strong> ${order.name}</p>

            <p><strong>Телефон:</strong> ${order.phone}</p>

            <p><strong>Email:</strong> ${order.email}</p>

            <p><strong>Місто:</strong> ${order.city}</p>

            <p><strong>Спосіб доставки:</strong> ${order.delivery}</p>

            <p><strong>Дані доставки:</strong> ${order.deliveryAddress}</p>

            <p><strong>Спосіб оплати:</strong> ${order.payment}</p>

        </div>

        <h2>Ваше замовлення</h2>
    `;

    let total = 0;

    order.products.forEach(function(item) {

        let itemTotal = item.price * item.quantity;

        total = total + itemTotal;

        html = html + `
            <div class="order-product">

                <img src="${item.image}" alt="${item.name}">

                <div>
                    <h3>${item.name}</h3>
                    <p>Кількість: ${item.quantity}</p>
                    <p>${itemTotal} грн</p>
                </div>

            </div>
        `;
    });

    html = html + `
        <h3 class="order-total">
            Разом за товари: ${total} грн
        </h3>

        <p>
            Вартість доставки оплачується окремо при отриманні
            та не входить у суму замовлення.
        </p>
    `;

    orderSummary.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", function() {
    displayOrder();
});

// ===== ЗАМОВЛЕННЯ ВЛАСНИКА =====

function displayAdminOrder() {

    let adminOrder = document.getElementById("admin-order");

    if (!adminOrder) {
        return;
    }

    let savedOrders = localStorage.getItem("orders");

    if (!savedOrders) {
        adminOrder.innerHTML = "<p>Замовлень поки немає 🕯️</p>";
        return;
    }

    let orders = JSON.parse(savedOrders);

    let html = "";

    orders.forEach(function(order) {

        html = html + `
            <div class="admin-order-box">

                <h2>Замовлення № ${order.orderNumber}</h2>

                <div class="admin-customer-info">

                    <h3>Дані покупця</h3>

                    <p><strong>Ім'я:</strong> ${order.name}</p>

                    <p><strong>Телефон:</strong> ${order.phone}</p>

                    <p><strong>Email:</strong> ${order.email}</p>

                    <p><strong>Місто:</strong> ${order.city}</p>

                    <p><strong>Спосіб доставки:</strong> ${order.delivery}</p>

                    <p><strong>Дані доставки:</strong> ${order.deliveryAddress}</p>

                    <p><strong>Спосіб оплати:</strong> ${order.payment}</p>

                </div>

                <h3>Товари</h3>
        `;

        let total = 0;

        order.products.forEach(function(item) {

            let itemTotal = item.price * item.quantity;

            total = total + itemTotal;

            html = html + `
                <div class="admin-product">

                    <img src="${item.image}" alt="${item.name}">

                    <div>
                        <h3>${item.name}</h3>
                        <p>Кількість: ${item.quantity}</p>
                        <p>${itemTotal} грн</p>
                    </div>

                </div>
            `;
        });

        html = html + `
                <h2 class="admin-total">
                    Разом за товари: ${total} грн
                </h2>

                <p>
                    Доставка оплачується покупцем окремо при отриманні
                    та не входить у суму замовлення.
                </p>

            </div>
        `;
    });

    adminOrder.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", function() {
    displayAdminOrder();
});

// ===== АКТИВАЦІЯ ПОЛЯ ДОСТАВКИ =====

function setupDeliveryFields() {

    let deliveryOptions = document.querySelectorAll('input[name="delivery"]');

    let fields = [
        "nova-branch",
        "nova-locker",
        "nova-courier",
        "ukr-branch"
    ];

    function updateDeliveryFields() {

        fields.forEach(function(fieldId) {

            let field = document.getElementById(fieldId);

            if (field) {
                field.disabled = true;
                field.value = "";
            }

        });

        let selected = document.querySelector('input[name="delivery"]:checked');

        if (!selected) {
            return;
        }

        let fieldMap = {
            "Нова пошта — відділення": "nova-branch",
            "Нова пошта — поштомат": "nova-locker",
            "Кур'єр Нової пошти": "nova-courier",
            "Укрпошта — відділення": "ukr-branch"
        };

        let selectedField = fieldMap[selected.value];

        if (selectedField) {

            let field = document.getElementById(selectedField);

            if (field) {
                field.disabled = false;
                field.focus();
            }

        }

    }

    deliveryOptions.forEach(function(option) {

        option.addEventListener("change", updateDeliveryFields);

    });

    updateDeliveryFields();

}

    document.addEventListener("DOMContentLoaded", setupDeliveryFields);


function changeProductImage(mainImageId, imageSrc) {

    document.getElementById(mainImageId).src = imageSrc;

}
