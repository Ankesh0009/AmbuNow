// const locationBtn = document.getElementById("getLocation");
// const map = document.getElementById("map");
// const locationStatus = document.getElementById("locationStatus");
// const pickupInput = document.getElementById("pickup");
// const bookingForm = document.getElementById("bookingForm");

// let currentLat = null;
// let currentLon = null;

// /* =========================
//    LIVE LOCATION + ADDRESS
// ========================= */
// locationBtn.addEventListener("click", () => {

//     if (!navigator.geolocation) {
//         locationStatus.innerText = "Geolocation not supported.";
//         return;
//     }

//     locationStatus.innerText = "Detecting location...";

//     navigator.geolocation.getCurrentPosition(
//         async position => {
//             currentLat = position.coords.latitude;
//             currentLon = position.coords.longitude;

//             // Reverse geocoding (OpenStreetMap)
//             const res = await fetch(
//                 `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLat}&lon=${currentLon}`
//             );
//             const data = await res.json();

//             const address = data.display_name || "Location not available";

//             pickupInput.value = address;
//             locationStatus.innerText = "📍 Live location detected";

//             map.src = `https://www.google.com/maps?q=${currentLat},${currentLon}&output=embed`;
//             map.style.display = "block";
//         },
//         () => {
//             locationStatus.innerText = "❌ Unable to fetch location.";
//         },
//         {
//             enableHighAccuracy: true,
//             timeout: 10000
//         }
//     );
// });

// /* =========================
//    BOOKING + AUTO WHATSAPP
// ========================= */
// bookingForm.addEventListener("submit", e => {
//     e.preventDefault();

//     const name = patientName.value;
//     const age = ageInput = document.getElementById("age").value;
//     const gender = document.getElementById("gender").value;
//     const phone = document.getElementById("phone").value;
//     const ambulanceType = document.getElementById("ambulanceType").value;
//     const address = pickupInput.value;

//     // if (!currentLat || !currentLon) {
//     //     alert("Please detect your location first.");
//     //     return;
//     // }
// error => {
//     switch (error.code) {
//         case error.PERMISSION_DENIED:
//             locationStatus.innerText = "❌ Location permission denied.";
//             break;
//         case error.POSITION_UNAVAILABLE:
//             locationStatus.innerText = "❌ Location unavailable. Check GPS.";
//             break;
//         case error.TIMEOUT:
//             locationStatus.innerText = "❌ Location request timed out.";
//             break;
//         default:
//             locationStatus.innerText = "❌ Unknown location error.";
//     }
// }

//     // Date & Time
//     const now = new Date();
//     const dateTime = now.toLocaleString();

//     // Google Maps Link
//     const mapsLink = `https://www.google.com/maps?q=${currentLat},${currentLon}`;

//     // WhatsApp Message
//     const message = `
// 🚑 Ambulance Booking Confirmed

// Patient Name: ${name}
// Age: ${age}
// Gender: ${gender}
// Contact Number: ${phone}
// Ambulance Type: ${ambulanceType}

// Pickup Address:
// ${address}

// 📍 Google Maps Location:
// ${mapsLink}

// 🕒 Date & Time:
// ${dateTime}

// Please send an ambulance immediately.
//     `;

//     const encodedMessage = encodeURIComponent(message);
//     const emergencyNumber = "916207394439";

//     // Confirmation on UI
//     document.getElementById("result").innerHTML =
//         "✅ Booking confirmed. Redirecting to WhatsApp...";

//     // Auto open WhatsApp after booking
//     setTimeout(() => {
//         window.open(
//             `https://wa.me/${emergencyNumber}?text=${encodedMessage}`,
//             "_blank"
//         );
//     }, 1000);
// });


const map = document.getElementById("map");
const locationStatus = document.getElementById("locationStatus");
const pickupInput = document.getElementById("pickup");
const bookingForm = document.getElementById("bookingForm");
const hospitalInfo = document.getElementById("hospitalInfo");

let currentLat = null;
let currentLon = null;
let nearestHospitalName = "";

/* =========================
   AUTO DETECT LOCATION
========================= */
window.addEventListener("load", () => {
    detectLocation();
});

function detectLocation() {
    if (!navigator.geolocation) {
        locationStatus.innerText = "❌ Geolocation not supported.";
        return;
    }

    locationStatus.innerText = "📍 Detecting location...";

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            currentLat = position.coords.latitude;
            currentLon = position.coords.longitude;

            // Reverse geocoding (OpenStreetMap)
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLat}&lon=${currentLon}`
            );
            const data = await res.json();

            const address = data.display_name || "Location unavailable";
            pickupInput.value = address;

            locationStatus.innerText = "📍 Location detected";

            map.src = `https://www.google.com/maps?q=${currentLat},${currentLon}&output=embed`;
            map.style.display = "block";

            findNearestHospital(currentLat, currentLon);
        },
        (error) => {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    locationStatus.innerText = "❌ Location permission denied.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    locationStatus.innerText = "❌ Location unavailable.";
                    break;
                case error.TIMEOUT:
                    locationStatus.innerText = "❌ Location request timed out.";
                    break;
                default:
                    locationStatus.innerText = "❌ Location error.";
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000
        }
    );
}

/* =========================
   NEAREST HOSPITAL
========================= */
const hospitals = [
    { name: "AIIMS Bhopal", lat: 23.2599, lon: 77.4126 },
    { name: "Hamidia Hospital", lat: 23.2591, lon: 77.4011 },
    { name: "Bansal Hospital", lat: 23.2075, lon: 77.4245 },
    { name: "JP Hospital", lat: 23.2395, lon: 77.3967 }
];

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function findNearestHospital(lat, lon) {
    let nearest = null;
    let minDistance = Infinity;

    hospitals.forEach(h => {
        const dist = getDistance(lat, lon, h.lat, h.lon);
        if (dist < minDistance) {
            minDistance = dist;
            nearest = h;
        }
    });

    nearestHospitalName = nearest.name;

    hospitalInfo.innerHTML = `
        🏥 <b>Nearest Hospital:</b> ${nearest.name}<br>
        📏 Distance: ${minDistance.toFixed(2)} km
    `;
}

/* =========================
   BOOKING + WHATSAPP
========================= */
bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!currentLat || !currentLon) {
        alert("Location not detected yet. Please wait.");
        return;
    }

    const name = document.getElementById("patientName").value;
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const phone = document.getElementById("phone").value;
    const ambulanceType = document.getElementById("ambulanceType").value;
    const address = pickupInput.value;

    const now = new Date();
    const dateTime = now.toLocaleString();
    const mapsLink = `https://www.google.com/maps?q=${currentLat},${currentLon}`;

    const message = `
🚑 Ambulance Request

Patient Name: ${name}
Age: ${age}
Gender: ${gender}
Contact: ${phone}
Ambulance Type: ${ambulanceType}

Pickup Address:
${address}

🏥 Nearest Hospital:
${nearestHospitalName}

📍 Google Maps:
${mapsLink}

🕒 ${dateTime}
    `;

    const encodedMessage = encodeURIComponent(message);
    const emergencyNumber = "916207394439";

    document.getElementById("result").innerText =
        "✅ Booking confirmed. Opening WhatsApp...";

    setTimeout(() => {
        window.open(
            `https://wa.me/${emergencyNumber}?text=${encodedMessage}`,
            "_blank"
        );
    }, 800);
});
