(function () {
    var API_BASE_URL = window.QUEUEFLOW_API_URL || 
        (window.QUEUEFLOW_CONFIG && window.QUEUEFLOW_CONFIG.API_BASE_URL) ||
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3000/api'
            : 'https://YOUR-RENDER-BACKEND.onrender.com/api');

    Vue.directive('uppercase', {
        bind: function (el) {
            el.style.cursor = 'pointer';
            el.setAttribute('title', 'Click to transform to uppercase');
            el.addEventListener('click', function () {
                el.innerText = el.innerText.toUpperCase();
            });
        }
    });

    Vue.directive('list', {
        bind: function (el, binding) {
            var ul = document.createElement('ul');
            if (Array.isArray(binding.value)) {
                binding.value.forEach(function (item) {
                    var li = document.createElement('li');
                    li.textContent = item;
                    ul.appendChild(li);
                });
            }
            el.appendChild(ul);
        }
    });

    function formatDate(dateString) {
        if (!dateString) return '--';
        var date = new Date(dateString);
        if (isNaN(date.getTime())) return String(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    Vue.directive('format-date', {
        inserted: function (el, binding) {
            el.textContent = formatDate(binding.value);
        },
        update: function (el, binding) {
            el.textContent = formatDate(binding.value);
        }
    });
    Vue.directive('date-format', Vue.directive('format-date'));

    var initialQueueData = [
        { token: "A101", customer: "Rahul", department: "General", status: "Waiting", joinedAt: "2026-09-15T12:30:00" },
        { token: "A102", customer: "Meet", department: "Accounts", status: "Waiting", joinedAt: "2026-09-15T12:42:00" },
        { token: "A103", customer: "Priya", department: "Inquiry", status: "Waiting", joinedAt: "2026-09-15T12:50:00" }
    ];

    function getStoredQueueTokens() {
        try {
            var stored = localStorage.getItem('queueFlowList');
            if (stored) {
                var parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {}
        return initialQueueData.slice();
    }

    var queueTokens = getStoredQueueTokens();
    var draggedItemIndex = null;

    function saveQueueTokensLocally() {
        try {
            localStorage.setItem('queueFlowList', JSON.stringify(queueTokens));
        } catch (e) {}
    }

    function updateDbBadge(connected) {
        var badge = document.getElementById('dbStatusBadge');
        if (!badge) return;
        if (connected) {
            badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
            badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> MongoDB Connected';
        } else {
            badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200';
            var msg = (API_BASE_URL && API_BASE_URL.includes('YOUR-RENDER-BACKEND'))
                ? 'Backend Offline (Set Render URL in config.js)'
                : 'Backend Offline (Local Cache)';
            badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> ' + msg;
        }
    }

    var queueApp = new Vue({
        el: '#currentQueueApp',
        data: {
            queueTokens: queueTokens,
            items: ["Subject-1", "Subject-2", "Subject-3", "Subject-4"],
            isBackendConnected: false
        },
        methods: {
            handleDragStart: function (index, event) {
                draggedItemIndex = index;
                if (event.dataTransfer) {
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', String(index));
                }
                if (event.currentTarget) event.currentTarget.style.opacity = '0.5';
            },
            handleDragEnd: function (event) {
                if (event.currentTarget) event.currentTarget.style.opacity = '1';
                draggedItemIndex = null;
            },
            handleDragOver: function (index, event) {
                event.preventDefault();
                if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
            },
            handleDrop: function (index, event) {
                event.preventDefault();
                if (draggedItemIndex !== null && draggedItemIndex !== index) {
                    var draggedItem = this.queueTokens.splice(draggedItemIndex, 1)[0];
                    this.queueTokens.splice(index, 0, draggedItem);
                    draggedItemIndex = null;
                    queueTokens = this.queueTokens;

                    saveQueueTokensLocally();

                    var tokenOrderList = this.queueTokens.map(function (t) { return t.token; });
                    fetch(API_BASE_URL + '/tokens/reorder', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ tokens: tokenOrderList })
                    }).then(function (res) {
                        if (res.ok) {
                            if (typeof window.showQueueMessage === 'function') {
                                window.showQueueMessage('Queue order saved to MongoDB!', '#16a34a');
                            }
                        }
                    }).catch(function (err) {
                        console.warn('[QueueFlow] Reorder sync to MongoDB failed:', err.message);
                    });

                    if (typeof window.syncDashboardTokenCards === 'function') {
                        window.syncDashboardTokenCards();
                    }
                }
            },

            removeToken: function (tokenNumber) {
                if (typeof window.removeQueueToken === 'function') {
                    window.removeQueueToken(tokenNumber);
                } else {
                    var normalized = tokenNumber.trim().toUpperCase();
                    var idx = this.queueTokens.findIndex(function (item) {
                        return item.token.toUpperCase() === normalized;
                    });
                    if (idx !== -1) {
                        this.queueTokens.splice(idx, 1);
                        saveQueueTokensLocally();
                    }
                }
            },

            updateStatus: function (item) {
                var currentStatus = item.status || 'Waiting';
                var nextStatus = 'Waiting';
                if (currentStatus === 'Waiting') nextStatus = 'Serving';
                else if (currentStatus === 'Serving') nextStatus = 'Completed';
                else nextStatus = 'Waiting';

                var self = this;
                fetch(API_BASE_URL + '/tokens/' + encodeURIComponent(item.token), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: nextStatus })
                })
                .then(function (res) {
                    if (!res.ok) {
                        throw new Error('HTTP ' + res.status);
                    }
                    return res.json();
                })
                .then(function () {
                    item.status = nextStatus;
                    saveQueueTokensLocally();

                    try {
                        var saved = localStorage.getItem('queueFlowToken');
                        if (saved) {
                            var savedObj = JSON.parse(saved);
                            if (savedObj && (savedObj.tokenNumber === item.token || savedObj.token === item.token)) {
                                savedObj.status = nextStatus;
                                localStorage.setItem('queueFlowToken', JSON.stringify(savedObj));
                            }
                        }
                    } catch (e) {}

                    if (typeof window.syncDashboardTokenCards === 'function') {
                        window.syncDashboardTokenCards();
                    }
                    if (typeof window.showQueueMessage === 'function') {
                        window.showQueueMessage('Token ' + item.token + ' status updated to "' + nextStatus + '" in MongoDB!', '#16a34a');
                    }
                })
                .catch(function (err) {
                    console.error('[QueueFlow] Status update failed:', err);
                    if (typeof window.showQueueMessage === 'function') {
                        window.showQueueMessage('Status update failed: ' + err.message, '#dc2626');
                    }
                });
            },

            loadTokensFromMongoDB: function () {
                var self = this;
                return fetch(API_BASE_URL + '/tokens')
                    .then(function (res) {
                        if (!res.ok) throw new Error('HTTP ' + res.status);
                        return res.json();
                    })
                    .then(function (tokens) {
                        if (Array.isArray(tokens)) {
                            var formatted = tokens.map(function (item) {
                                return {
                                    token: item.token,
                                    customer: item.customer,
                                    department: item.department,
                                    status: item.status,
                                    joinedAt: item.joinedAt || item.createdAt || new Date().toISOString(),
                                    order: item.order || 0
                                };
                            });
                            self.queueTokens = formatted;
                            queueTokens = formatted;
                            saveQueueTokensLocally();
                            self.isBackendConnected = true;
                            updateDbBadge(true);

                            if (typeof window.syncDashboardTokenCards === 'function') {
                                window.syncDashboardTokenCards();
                            }
                            return formatted;
                        }
                    })
                    .catch(function (err) {
                        console.warn('[QueueFlow] MongoDB API unavailable, falling back to local storage:', err.message);
                        self.isBackendConnected = false;
                        updateDbBadge(false);
                    });
            }
        },
        mounted: function () {
            this.loadTokensFromMongoDB();
        }
    });

    window.queueVue = {
        getTokens: function () {
            return queueApp.queueTokens;
        },
        saveTokens: function () {
            saveQueueTokensLocally();
        },
        addToken: function (item) {
            if (!item.joinedAt) item.joinedAt = new Date().toISOString();
            queueApp.queueTokens.push(item);
            saveQueueTokensLocally();
        },
        removeTokenFromUI: function (tokenNumber) {
            var normalized = tokenNumber.trim().toUpperCase();
            var index = queueApp.queueTokens.findIndex(function (item) {
                return item.token.toUpperCase() === normalized;
            });
            if (index !== -1) {
                queueApp.queueTokens.splice(index, 1);
                saveQueueTokensLocally();
                return true;
            }
            return false;
        },
        removeToken: function (tokenNumber) {
            queueApp.removeToken(tokenNumber);
        },
        refreshTokens: function () {
            return queueApp.loadTokensFromMongoDB();
        },
        tokens: queueApp.queueTokens
    };

    window.updateMongoDBBadge = updateDbBadge;
})();