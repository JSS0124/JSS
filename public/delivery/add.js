document.getElementById("addDeliveryForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const deliveryData = {
        customer: document.getElementById("customer").value.trim(),
        product: document.getElementById("product").value.trim(),
        quantity: parseInt(document.getElementById("quantity").value, 10),
        deliveryDate: document.getElementById("deliveryDate").value.trim(),
        status: document.getElementById("status").value.trim()
    };

    // Basic validation before sending
    if (!deliveryData.customer || !deliveryData.product || isNaN(deliveryData.quantity) || !deliveryData.deliveryDate) {
        alert("Please fill in all required fields with valid values.");
        return;
    }

    try {
        const response = await fetch("/api/deliveries/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(deliveryData)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || "Server error");
        }

        alert("Delivery added successfully!");
        window.location.href = "/delivery/delivery.html";
    } catch (err) {
        console.error("Error adding delivery:", err);
        alert("Failed to add delivery. See console for details.");
    }
});
