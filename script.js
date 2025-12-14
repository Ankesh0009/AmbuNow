const locationBtn = document.getElementById("getLocation");
const map = document.getElementById("map");
const locationStatus = document.getElementById("locationStatus");
const pickupInput = document.getElementById("pickup");
const bookingForm = document.getElementById("bookingForm");

let currentLat = null;
let currentLon = null;

/* =========================
   LIVE LOCATION + ADDRESS
========================= */
locationBtn.addEventListener("click", () => {

    if (!navigator.geolocation) {
        locationStatus.innerText = "Geolocation not supported.";
        return;
    }

    locationStatus.innerText = "Detecting location...";

    navigator.geolocation.getCurrentPosition(
        async position => {
            currentLat = position.coords.latitude;
            currentLon = position.coords.longitude;

            // Reverse geocoding (OpenStreetMap)
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLat}&lon=${currentLon}`
            );
            const data = await res.json();

            const address = data.display_name || "Location not available";

            pickupInput.value = address;
            locationStatus.innerText = "📍 Live location detected";

            map.src = `https://www.google.com/maps?q=${currentLat},${currentLon}&output=embed`;
            map.style.display = "block";
        },
        () => {
            locationStatus.innerText = "❌ Unable to fetch location.";
        },
        {
            enableHighAccuracy: true,
            timeout: 10000
        }
    );
});

/* =========================
   BOOKING + AUTO WHATSAPP
========================= */
bookingForm.addEventListener("submit", e => {
    e.preventDefault();

    const name = patientName.value;
    const age = ageInput = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const phone = document.getElementById("phone").value;
    const ambulanceType = document.getElementById("ambulanceType").value;
    const address = pickupInput.value;

    // if (!currentLat || !currentLon) {
    //     alert("Please detect your location first.");
    //     return;
    // }
error => {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            locationStatus.innerText = "❌ Location permission denied.";
            break;
        case error.POSITION_UNAVAILABLE:
            locationStatus.innerText = "❌ Location unavailable. Check GPS.";
            break;
        case error.TIMEOUT:
            locationStatus.innerText = "❌ Location request timed out.";
            break;
        default:
            locationStatus.innerText = "❌ Unknown location error.";
    }
}

    // Date & Time
    const now = new Date();
    const dateTime = now.toLocaleString();

    // Google Maps Link
    const mapsLink = `https://www.google.com/maps?q=${currentLat},${currentLon}`;

    // WhatsApp Message
    const message = `
🚑 Ambulance Booking Confirmed

Patient Name: ${name}
Age: ${age}
Gender: ${gender}
Contact Number: ${phone}
Ambulance Type: ${ambulanceType}

Pickup Address:
${address}

📍 Google Maps Location:
${mapsLink}

🕒 Date & Time:
${dateTime}

Please send an ambulance immediately.
    `;

    const encodedMessage = encodeURIComponent(message);
    const emergencyNumber = "916207394439";

    // Confirmation on UI
    document.getElementById("result").innerHTML =
        "✅ Booking confirmed. Redirecting to WhatsApp...";

    // Auto open WhatsApp after booking
    setTimeout(() => {
        window.open(
            `https://wa.me/${emergencyNumber}?text=${encodedMessage}`,
            "_blank"
        );
    }, 1000);
});
