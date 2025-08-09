const urlParams = new URLSearchParams(window.location.search);
const deliveryId = urlParams.get("id");

async function loadDelivery() {
    try {
        const res = await fetch(`/api/deliveries/${deliveryId}`);
        if (!res.ok) throw new Error("Failed to fetch delivery data");
        const delivery = await res.json();

        document.getElementById("customer").value = delivery.customer || "";
        document.getElementById("product").value = delivery.product || "";
        document.getElementById("quantity").value = delivery.quantity || "";
        document.getElementById("deliveryDate").value = delivery.deliveryDate ? delivery.deliveryDate.split("T")[0] : "";
        document.getElementById("status").value = delivery.status || "";
    } catch (err) {
        console.error("Error loading delivery:", err);
        alert("Failed to load delivery details.");
    }
}

document.getElementById("editDeliveryForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const updatedData = {
        customer: document.getElementById("customer").value.trim(),
        product: document.getElementById("product").value.trim(),
        quantity: parseInt(document.getElementById("quantity").value, 10),
        deliveryDate: document.getElementById("deliveryDate").value.trim(),
        status: document.getElementById("status").value.trim()
    };

    try {
        const res = await fetch(`/api/deliveries/${deliveryId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData)
        });

        if (!res.ok) throw new Error(await res.text());

        alert("Delivery updated successfully!");
        window.location.href = "/delivery/delivery.html";
    } catch (err) {
        console.error("Error updating delivery:", err);
        alert("Failed to update delivery.");
    }
});

loadDelivery();
