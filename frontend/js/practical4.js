document.addEventListener('DOMContentLoaded', () => {

    const API_BASE_URL = window.QUEUEFLOW_API_URL || 
        (window.location.protocol.startsWith('http') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
            ? `${window.location.origin}/api`
            : 'http://localhost:3000/api');

    const getLocationBtn = document.getElementById('getLocationBtn');
    const latitudeSpan = document.getElementById('latitude');
    const longitudeSpan = document.getElementById('longitude');
    const locationStatus = document.getElementById('locationStatus');

    let locationMap;
    let locationMarker;

    const defaultLat = 23.0225;
    const defaultLng = 72.5714;

    function initMap() {
        const mapContainer = document.getElementById('locationMap');
        if (!mapContainer || locationMap) return;

        locationMap = L.map('locationMap').setView([defaultLat, defaultLng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(locationMap);

        locationMarker = L.marker([defaultLat, defaultLng]).addTo(locationMap);
        locationMarker.bindPopup('<b>QueueFlow Service Counter</b><br>Click "Get My Location" to detect your position.').openPopup();

        setTimeout(() => {
            if (locationMap) locationMap.invalidateSize();
        }, 200);
    }

    function showLocationOnMap(latitude, longitude, popupText) {
        if (!locationMap) {
            initMap();
        }
        if (locationMap) {
            locationMap.flyTo([latitude, longitude], 15, { duration: 1.2 });
            if (locationMarker) {
                locationMarker.setLatLng([latitude, longitude]);
                locationMarker.bindPopup(popupText || '<b>You are here!</b><br>Nearest QueueFlow Counter: 100m').openPopup();
            }
        }
    }

    initMap();

    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', () => {
            if (!("geolocation" in navigator)) {
                if (locationStatus) {
                    locationStatus.textContent = "Geolocation is not supported by your browser.";
                    locationStatus.style.color = "#dc2626";
                }
                return;
            }

            if (locationStatus) {
                locationStatus.textContent = "Fetching your location...";
                locationStatus.style.color = "#64748b";
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    if (latitudeSpan) latitudeSpan.textContent = latitude.toFixed(4);
                    if (longitudeSpan) longitudeSpan.textContent = longitude.toFixed(4);
                    if (locationStatus) {
                        locationStatus.textContent = "Location retrieved successfully.";
                        locationStatus.style.color = "#16a34a";
                    }

                    showLocationOnMap(latitude, longitude, '<b>You are here!</b><br>Connected to nearest QueueFlow counter.');
                },
                (error) => {
                    if (latitudeSpan) latitudeSpan.textContent = defaultLat.toFixed(4);
                    if (longitudeSpan) longitudeSpan.textContent = defaultLng.toFixed(4);

                    const errorMsg = error.code === error.PERMISSION_DENIED
                        ? "Location permission was denied. Showing demo location."
                        : "Unable to retrieve GPS. Showing demo location.";
                    if (locationStatus) {
                        locationStatus.textContent = errorMsg;
                        locationStatus.style.color = "#ea580c";
                    }

                    showLocationOnMap(defaultLat, defaultLng, '<b>Demo Location</b><br>QueueFlow Central Service Branch');
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );
        });
    }

    const currentTokenDisplay = document.getElementById('currentTokenDisplay');
    const queuePositionDisplay = document.getElementById('queuePositionDisplay');
    const estimatedWaitDisplay = document.getElementById('estimatedWaitDisplay');
    const tokenStatusDisplay = document.getElementById('tokenStatusDisplay');
    const bookTokenBtn = document.getElementById('bookTokenBtn');
    const removeTokenBtn = document.getElementById('removeTokenBtn');
    const removeTokenActionBtn = document.getElementById('removeTokenActionBtn');
    const bookingMessage = document.getElementById('bookingMessage');

    function showMessage(text, color) {
        if (!bookingMessage) return;
        bookingMessage.textContent = text;
        bookingMessage.style.color = color || "#1e293b";
        setTimeout(() => {
            if (bookingMessage.textContent === text) {
                bookingMessage.textContent = "";
            }
        }, 5000);
    }
    window.showQueueMessage = showMessage;

    function getSavedToken() {
        try {
            const data = localStorage.getItem('queueFlowToken');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error("Error reading saved token", e);
            return null;
        }
    }

    function getNextTokenNumber() {
        const activeTokens = (window.queueVue && typeof window.queueVue.getTokens === 'function')
            ? window.queueVue.getTokens()
            : [];
        let maxNum = 100;
        let prefix = "A";

        activeTokens.forEach(t => {
            if (!t || !t.token) return;
            const match = t.token.match(/\d+/);
            if (match) {
                const num = parseInt(match[0], 10);
                if (!isNaN(num) && num > maxNum) {
                    maxNum = num;
                    const charMatch = t.token.match(/^[A-Za-z-]+/);
                    if (charMatch) prefix = charMatch[0];
                }
            }
        });

        const saved = getSavedToken();
        if (saved && (saved.tokenNumber || saved.token)) {
            const tok = saved.tokenNumber || saved.token;
            const match = tok.match(/\d+/);
            if (match) {
                const num = parseInt(match[0], 10);
                if (!isNaN(num) && num > maxNum) maxNum = num;
            }
        }

        return prefix + (maxNum + 1);
    }

    function loadSavedToken() {
        const tokenObj = getSavedToken();
        const activeTokens = (window.queueVue && typeof window.queueVue.getTokens === 'function')
            ? window.queueVue.getTokens()
            : [];

        if (tokenObj && currentTokenDisplay) {
            const tokenCode = tokenObj.tokenNumber || tokenObj.token;
            currentTokenDisplay.textContent = tokenCode;

            const posIndex = activeTokens.findIndex(t => t.token && t.token.toUpperCase() === tokenCode.toUpperCase());
            const pos = posIndex !== -1 ? posIndex + 1 : 1;

            if (queuePositionDisplay) queuePositionDisplay.textContent = pos;
            if (estimatedWaitDisplay) {
                estimatedWaitDisplay.textContent = pos === 1 ? "Next (~5m)" : (pos * 5) + " min";
            }
            if (tokenStatusDisplay) {
                const curStatus = (posIndex !== -1 && activeTokens[posIndex].status) ? activeTokens[posIndex].status : (tokenObj.status || 'Waiting');
                let badgeClass = 'badge badge-warning';
                if (curStatus === 'Completed') badgeClass = 'badge badge-success';
                else if (curStatus === 'Serving') badgeClass = 'badge badge-info';

                tokenStatusDisplay.innerHTML = `<span class="${badgeClass}">${curStatus}</span>`;
            }
            if (removeTokenBtn) removeTokenBtn.style.display = 'inline-block';
        } else {
            if (currentTokenDisplay) currentTokenDisplay.textContent = "--";
            if (queuePositionDisplay) queuePositionDisplay.textContent = "--";
            if (estimatedWaitDisplay) estimatedWaitDisplay.textContent = "--";
            if (tokenStatusDisplay) {
                tokenStatusDisplay.innerHTML = `<span class="badge badge-info">No Active Token</span>`;
            }
            if (removeTokenBtn) removeTokenBtn.style.display = 'none';
        }
    }

    window.syncDashboardTokenCards = loadSavedToken;
    window.loadSavedToken = loadSavedToken;

    async function removeSpecificToken(targetToken) {
        if (!targetToken) return;
        const normalizedToken = targetToken.trim().toUpperCase();

        try {
            const response = await fetch(`${API_BASE_URL}/tokens/${encodeURIComponent(normalizedToken)}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Server returned ${response.status}`);
            }

            let removed = false;
            if (window.queueVue && typeof window.queueVue.removeTokenFromUI === 'function') {
                removed = window.queueVue.removeTokenFromUI(normalizedToken);
            }

            const saved = getSavedToken();
            if (saved && (saved.tokenNumber === normalizedToken || saved.token === normalizedToken)) {
                localStorage.removeItem('queueFlowToken');
            }

            loadSavedToken();
            showMessage(`Token ${normalizedToken} deleted from MongoDB.`, "#dc2626");

        } catch (err) {
            console.error("[QueueFlow] Delete failed:", err);
            showMessage(`Delete error: ${err.message}`, "#dc2626");
        }
    }
    window.removeQueueToken = removeSpecificToken;

    if (bookTokenBtn) {
        bookTokenBtn.addEventListener('click', async () => {
            const savedUser = localStorage.getItem('queueFlowUser');
            let defaultName = "Rahul";
            if (savedUser) {
                const namePart = savedUser.split('@')[0];
                defaultName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
            }

            const customerName = prompt("Enter your Name:", defaultName);
            if (customerName === null) return;

            const department = prompt("Enter Department (General / Accounts / Inquiry / Billing):", "General");
            if (department === null) return;

            const name = customerName.trim() || defaultName;
            const dept = department.trim() || "General";
            const tokenNumber = getNextTokenNumber();

            const tokenPayload = {
                token: tokenNumber,
                customer: name,
                department: dept,
                status: "Waiting",
                joinedAt: new Date().toISOString()
            };

            bookTokenBtn.disabled = true;
            showMessage("Sending token to MongoDB server...", "#2563eb");

            try {
                const response = await fetch(`${API_BASE_URL}/tokens`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tokenPayload)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Server returned ${response.status}`);
                }

                const result = await response.json();
                const createdRecord = result.token || tokenPayload;

                localStorage.setItem('queueFlowToken', JSON.stringify({
                    tokenNumber: createdRecord.token,
                    customer: createdRecord.customer,
                    department: createdRecord.department,
                    status: createdRecord.status,
                    joinedAt: createdRecord.joinedAt || createdRecord.createdAt
                }));

                if (window.queueVue && typeof window.queueVue.addToken === 'function') {
                    window.queueVue.addToken(createdRecord);
                }

                loadSavedToken();
                showMessage(`Token ${createdRecord.token} booked & saved in MongoDB!`, "#16a34a");

            } catch (err) {
                console.error("[QueueFlow] Booking error:", err);
                showMessage(`Failed to save in MongoDB: ${err.message}`, "#dc2626");
            } finally {
                bookTokenBtn.disabled = false;
            }
        });
    }

    if (removeTokenActionBtn) {
        removeTokenActionBtn.addEventListener('click', () => {
            const saved = getSavedToken();
            const defaultToken = saved ? (saved.tokenNumber || saved.token) : "A101";
            const userChoice = prompt("Enter the Token Number to delete from MongoDB (e.g. A101, T-101):", defaultToken);
            if (userChoice && userChoice.trim() !== "") {
                removeSpecificToken(userChoice);
            }
        });
    }

    if (removeTokenBtn) {
        removeTokenBtn.addEventListener('click', () => {
            const saved = getSavedToken();
            if (saved) {
                removeSpecificToken(saved.tokenNumber || saved.token);
            }
        });
    }

    loadSavedToken();
});
