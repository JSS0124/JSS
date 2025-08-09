document.getElementById("addDeliveryForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const deliveryData = {
        date: document.getElementById("date").value,
        slipNumber: document.getElementById("slipNumber").value.trim(),
        vehicleNumber: document.getElementById("vehicleNumber").value.trim(),
        customer: document.getElementById("customer").value.trim(),
        vendor: document.getElementById("vendor").value.trim(),
        product: document.getElementById("product").value.trim(),
        foot: document.getElementById("foot").value.trim(),
        az: document.getElementById("az").value.trim(),
        size: document.getElementById("size").value.trim(),
        totalSqft: document.getElementById("totalSqft").value.trim(),
        rate: document.getElementById("rate").value.trim(),
        totalAmount: document.getElementById("totalAmount").value.trim(),
        remarks: document.getElementById("remarks").value.trim()
    };

    // Basic validation
    if (!deliveryData.date || !deliveryData.customer || !deliveryData.product) {
        alert("Please fill in required fields: Date, Customer, and Product.");
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
