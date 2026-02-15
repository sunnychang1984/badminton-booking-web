// ===== Badminton Booking - Interactive Preview UI =====

// ---------- State Management ----------
const state = {
    events: [],
    members: [],
    registrations: [],
    pairings: [],
    currentPage: 'dashboard'
};

// Backend API base URL (falls back to mock data if unavailable)
const API_BASE = 'http://localhost:5000';
let useApi = false;

// ---------- Color palette for avatars ----------
const avatarColors = [
    '#4361ee', '#2ec4b6', '#ff9f1c', '#e71d36', '#7209b7',
    '#3a86a7', '#f72585', '#4cc9f0', '#fb5607', '#8338ec'
];

function getAvatarColor(id) {
    return avatarColors[(id - 1) % avatarColors.length];
}

// ---------- Initialization ----------
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSidebar();
    loadSampleData();
    renderAll();
});

function loadSampleData() {
    // Pre-load sample data for preview
    state.events = [
        { id: 1, name: '週六早晨羽球練習', date: '2026-02-21T09:00', location: '台北市信義運動中心' },
        { id: 2, name: '週三晚間友誼賽', date: '2026-02-18T19:00', location: '新北市板橋體育館' },
        { id: 3, name: '春季羽球盃', date: '2026-03-01T10:00', location: '台北市大安運動中心' }
    ];

    state.members = [
        { id: 1, name: '王小明', email: 'xiaoming@email.com', level: 'intermediate', gender: 'male', absences: [] },
        { id: 2, name: '林美玲', email: 'meiling@email.com', level: 'advanced', gender: 'female', absences: [] },
        { id: 3, name: '陳大偉', email: 'dawei@email.com', level: 'expert', gender: 'male', absences: [] },
        { id: 4, name: '張小芳', email: 'xiaofang@email.com', level: 'beginner', gender: 'female', absences: [] },
        { id: 5, name: '李志明', email: 'zhiming@email.com', level: 'intermediate', gender: 'male', absences: [] },
        { id: 6, name: '黃雅琪', email: 'yaqi@email.com', level: 'advanced', gender: 'female', absences: [] }
    ];

    state.registrations = [
        { eventId: 1, userId: 1, status: 'registered' },
        { eventId: 1, userId: 2, status: 'checked-in' },
        { eventId: 1, userId: 3, status: 'registered' },
        { eventId: 2, userId: 1, status: 'checked-in' },
        { eventId: 2, userId: 4, status: 'registered' }
    ];
}

// ---------- Navigation ----------
function initNavigation() {
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    state.currentPage = page;

    // Update sidebar active state
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // Update page visibility
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) pageEl.classList.add('active');

    // Update title
    const titles = {
        dashboard: '儀表板',
        events: '活動管理',
        members: '會員管理',
        registrations: '報名 / 簽到',
        pairings: '配對系統'
    };
    document.getElementById('page-title').textContent = titles[page] || '';

    // Refresh content for this page
    renderAll();

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');
}

function initSidebar() {
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}

// ---------- Render All ----------
function renderAll() {
    renderDashboard();
    renderEventsTable();
    renderMembersGrid();
    renderRegistrationsTable();
    renderDropdowns();
    renderPairingsEventSelect();
}

// ---------- Dashboard ----------
function renderDashboard() {
    document.getElementById('stat-events').textContent = state.events.length;
    document.getElementById('stat-members').textContent = state.members.length;
    document.getElementById('stat-registrations').textContent = state.registrations.length;
    document.getElementById('stat-pairings').textContent = state.pairings.length;

    // Recent events table
    const tbody = document.getElementById('dashboard-events-table');
    if (state.events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">尚無活動資料</td></tr>';
    } else {
        tbody.innerHTML = state.events.slice(0, 5).map(event => {
            const regCount = state.registrations.filter(r => r.eventId === event.id).length;
            const dateStr = formatDate(event.date);
            const isPast = new Date(event.date) < new Date();
            return `<tr>
                <td><strong>${escapeHtml(event.name)}</strong></td>
                <td>${dateStr}</td>
                <td>${escapeHtml(event.location)}</td>
                <td><span class="badge-status ${isPast ? 'badge-checked-in' : 'badge-upcoming'}">${isPast ? '已結束' : '即將開始'}</span></td>
            </tr>`;
        }).join('');
    }

    // Recent members
    const membersList = document.getElementById('dashboard-members-list');
    if (state.members.length === 0) {
        membersList.innerHTML = '<p class="text-muted text-center">尚無會員資料</p>';
    } else {
        membersList.innerHTML = state.members.slice(0, 5).map(member => {
            const initial = member.name.charAt(0);
            const color = getAvatarColor(member.id);
            return `<div class="dashboard-member-item">
                <div class="dashboard-member-avatar" style="background:${color}">${initial}</div>
                <div>
                    <div style="font-weight:600;font-size:14px">${escapeHtml(member.name)}</div>
                    <div style="font-size:12px;color:var(--text-muted)">${escapeHtml(member.email)}</div>
                </div>
                <span class="member-level level-${member.level}" style="margin-left:auto">${getLevelLabel(member.level)}</span>
            </div>`;
        }).join('');
    }
}

// ---------- Events ----------
function renderEventsTable() {
    const tbody = document.getElementById('events-table');
    if (state.events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">尚無活動資料，請新增活動</td></tr>';
        return;
    }

    tbody.innerHTML = state.events.map(event => {
        const regCount = state.registrations.filter(r => r.eventId === event.id).length;
        return `<tr>
            <td>#${event.id}</td>
            <td><strong>${escapeHtml(event.name)}</strong></td>
            <td>${formatDate(event.date)}</td>
            <td>${escapeHtml(event.location)}</td>
            <td><span class="badge bg-primary">${regCount} 人</span></td>
            <td>
                <button class="btn-action btn-edit me-1" onclick="editEvent(${event.id})" title="編輯">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deleteEvent(${event.id})" title="刪除">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>`;
    }).join('');
}

function handleEventSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('event-id').value;
    const name = document.getElementById('event-name').value.trim();
    const date = document.getElementById('event-date').value;
    const location = document.getElementById('event-location').value.trim();

    if (id) {
        // Update
        const event = state.events.find(ev => ev.id === parseInt(id));
        if (event) {
            event.name = name;
            event.date = date;
            event.location = location;
            showToast('活動已更新', 'success');
        }
    } else {
        // Create
        const newEvent = {
            id: state.events.length > 0 ? Math.max(...state.events.map(e => e.id)) + 1 : 1,
            name,
            date,
            location
        };
        state.events.push(newEvent);
        showToast('活動已新增', 'success');
    }

    hideModal('eventModal');
    document.getElementById('event-form').reset();
    document.getElementById('event-id').value = '';
    renderAll();
}

function editEvent(id) {
    const event = state.events.find(e => e.id === id);
    if (!event) return;

    document.getElementById('event-id').value = event.id;
    document.getElementById('event-name').value = event.name;
    document.getElementById('event-date').value = event.date;
    document.getElementById('event-location').value = event.location;
    document.getElementById('eventModalTitle').textContent = '編輯活動';
    showModal('eventModal');
}

function deleteEvent(id) {
    if (!confirm('確定要刪除此活動嗎？')) return;
    state.events = state.events.filter(e => e.id !== id);
    state.registrations = state.registrations.filter(r => r.eventId !== id);
    showToast('活動已刪除', 'info');
    renderAll();
}

// ---------- Members ----------
function renderMembersGrid() {
    const grid = document.getElementById('members-grid');
    if (state.members.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center text-muted py-5">尚無會員資料，請新增會員</div>';
        return;
    }

    grid.innerHTML = state.members.map(member => {
        const initial = member.name.charAt(0);
        const color = getAvatarColor(member.id);
        const genderIcon = member.gender === 'female' ? 'bi-gender-female' : 'bi-gender-male';
        return `<div class="col-lg-3 col-md-4 col-sm-6">
            <div class="member-card">
                <div class="member-avatar" style="background:${color}">${initial}</div>
                <h6>${escapeHtml(member.name)} <i class="bi ${genderIcon}" style="font-size:14px"></i></h6>
                <div class="member-email">${escapeHtml(member.email)}</div>
                <div class="member-level level-${member.level}">${getLevelLabel(member.level)}</div>
                <div class="mt-3">
                    <button class="btn-action btn-edit me-1" onclick="editMember(${member.id})" title="編輯">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteMember(${member.id})" title="刪除">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}

function handleMemberSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('member-id').value;
    const name = document.getElementById('member-name').value.trim();
    const email = document.getElementById('member-email').value.trim();
    const level = document.getElementById('member-level').value;
    const gender = document.getElementById('member-gender').value;

    if (id) {
        const member = state.members.find(m => m.id === parseInt(id));
        if (member) {
            member.name = name;
            member.email = email;
            member.level = level;
            member.gender = gender;
            showToast('會員已更新', 'success');
        }
    } else {
        const newMember = {
            id: state.members.length > 0 ? Math.max(...state.members.map(m => m.id)) + 1 : 1,
            name,
            email,
            level,
            gender,
            absences: []
        };
        state.members.push(newMember);
        showToast('會員已新增', 'success');
    }

    hideModal('memberModal');
    document.getElementById('member-form').reset();
    document.getElementById('member-id').value = '';
    renderAll();
}

function editMember(id) {
    const member = state.members.find(m => m.id === id);
    if (!member) return;

    document.getElementById('member-id').value = member.id;
    document.getElementById('member-name').value = member.name;
    document.getElementById('member-email').value = member.email;
    document.getElementById('member-level').value = member.level;
    document.getElementById('member-gender').value = member.gender;
    document.getElementById('memberModalTitle').textContent = '編輯會員';
    showModal('memberModal');
}

function deleteMember(id) {
    if (!confirm('確定要刪除此會員嗎？')) return;
    state.members = state.members.filter(m => m.id !== id);
    state.registrations = state.registrations.filter(r => r.userId !== id);
    showToast('會員已刪除', 'info');
    renderAll();
}

// ---------- Registrations ----------
function renderDropdowns() {
    const eventSelects = ['reg-event', 'checkin-event'];
    const memberSelects = ['reg-member', 'checkin-member'];

    eventSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        const current = select.value;
        select.innerHTML = '<option value="">-- 請選擇活動 --</option>' +
            state.events.map(e => `<option value="${e.id}" ${current == e.id ? 'selected' : ''}>${escapeHtml(e.name)} (${formatDate(e.date)})</option>`).join('');
    });

    memberSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        const current = select.value;
        select.innerHTML = '<option value="">-- 請選擇會員 --</option>' +
            state.members.map(m => `<option value="${m.id}" ${current == m.id ? 'selected' : ''}>${escapeHtml(m.name)}</option>`).join('');
    });
}

function renderRegistrationsTable() {
    const tbody = document.getElementById('registrations-table');
    if (state.registrations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">尚無報名紀錄</td></tr>';
        return;
    }

    tbody.innerHTML = state.registrations.map(reg => {
        const event = state.events.find(e => e.id === reg.eventId);
        const member = state.members.find(m => m.id === reg.userId);
        const statusLabel = reg.status === 'checked-in' ? '已簽到' : '已報名';
        const statusClass = reg.status === 'checked-in' ? 'badge-checked-in' : 'badge-registered';
        return `<tr>
            <td>${event ? escapeHtml(event.name) : '未知活動'}</td>
            <td>${member ? escapeHtml(member.name) : '未知會員'}</td>
            <td><span class="badge-status ${statusClass}">${statusLabel}</span></td>
            <td>
                ${reg.status !== 'checked-in' ? `<button class="btn btn-sm btn-outline-success" onclick="quickCheckin(${reg.eventId}, ${reg.userId})"><i class="bi bi-check-lg"></i> 簽到</button>` : '<span class="text-success"><i class="bi bi-check-circle-fill"></i></span>'}
            </td>
        </tr>`;
    }).join('');
}

function handleRegister(e) {
    e.preventDefault();
    const eventId = parseInt(document.getElementById('reg-event').value);
    const userId = parseInt(document.getElementById('reg-member').value);

    if (!eventId || !userId) {
        showToast('請選擇活動和會員', 'error');
        return;
    }

    const exists = state.registrations.find(r => r.eventId === eventId && r.userId === userId);
    if (exists) {
        showToast('此會員已報名此活動', 'error');
        return;
    }

    state.registrations.push({ eventId, userId, status: 'registered' });
    showToast('報名成功', 'success');
    document.getElementById('registration-form').reset();
    renderAll();
}

function handleCheckin(e) {
    e.preventDefault();
    const eventId = parseInt(document.getElementById('checkin-event').value);
    const userId = parseInt(document.getElementById('checkin-member').value);

    if (!eventId || !userId) {
        showToast('請選擇活動和會員', 'error');
        return;
    }

    const reg = state.registrations.find(r => r.eventId === eventId && r.userId === userId);
    if (!reg) {
        showToast('此會員尚未報名此活動', 'error');
        return;
    }

    if (reg.status === 'checked-in') {
        showToast('此會員已簽到', 'error');
        return;
    }

    reg.status = 'checked-in';
    showToast('簽到成功', 'success');
    document.getElementById('checkin-form').reset();
    renderAll();
}

function quickCheckin(eventId, userId) {
    const reg = state.registrations.find(r => r.eventId === eventId && r.userId === userId);
    if (reg) {
        reg.status = 'checked-in';
        showToast('簽到成功', 'success');
        renderAll();
    }
}

// ---------- Pairings ----------
function renderPairingsEventSelect() {
    const select = document.getElementById('pairing-event-select');
    if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="">-- 選擇活動 --</option>' +
        state.events.map(e => `<option value="${e.id}" ${current == e.id ? 'selected' : ''}>${escapeHtml(e.name)}</option>`).join('');
}

function generatePairing(type) {
    const eventSelect = document.getElementById('pairing-event-select');
    const eventId = parseInt(eventSelect.value);

    // Get available players (either from selected event or all members)
    let players;
    if (eventId) {
        const regUserIds = state.registrations
            .filter(r => r.eventId === eventId && r.status === 'checked-in')
            .map(r => r.userId);
        players = state.members.filter(m => regUserIds.includes(m.id));
    }

    if (!players || players.length < 2) {
        // Fall back to all members if not enough checked-in players
        players = [...state.members];
    }

    if (players.length < 2) {
        showToast('至少需要 2 位會員才能配對', 'error');
        return;
    }

    // Filter by type
    if (type === 'womens-doubles') {
        const femalePlayers = players.filter(p => p.gender === 'female');
        if (femalePlayers.length < 2) {
            showToast('女子雙打至少需要 2 位女性會員', 'error');
            return;
        }
        players = femalePlayers;
    } else if (type === 'expert') {
        const expertPlayers = players.filter(p => p.level === 'advanced' || p.level === 'expert');
        if (expertPlayers.length < 2) {
            showToast('高手對決至少需要 2 位高級以上會員', 'error');
            return;
        }
        players = expertPlayers;
    }

    // Shuffle players
    const shuffled = [...players].sort(() => Math.random() - 0.5);

    // Create pairs (doubles: 2v2)
    const pairs = [];
    for (let i = 0; i + 3 <= shuffled.length; i += 4) {
        pairs.push({
            team1: [shuffled[i], shuffled[i + 1]],
            team2: [shuffled[i + 2], shuffled[i + 3]]
        });
    }

    // Handle remaining players for singles
    const remainder = shuffled.length % 4;
    const remaining = shuffled.slice(shuffled.length - remainder);
    if (remaining.length >= 2) {
        pairs.push({
            team1: [remaining[0]],
            team2: [remaining[1]],
            singles: true
        });
    }

    if (pairs.length === 0 && shuffled.length >= 2) {
        pairs.push({
            team1: [shuffled[0]],
            team2: [shuffled[1]],
            singles: true
        });
    }

    // Store pairings
    state.pairings = pairs;

    // Render result
    renderPairingsResult(pairs, type);

    const typeLabels = { balanced: '均衡配對', expert: '高手對決', 'womens-doubles': '女子雙打' };
    showToast(`${typeLabels[type]}已產生 ${pairs.length} 場`, 'success');
    renderDashboard();
}

function renderPairingsResult(pairs, type) {
    const container = document.getElementById('pairings-result');
    if (pairs.length === 0) {
        container.innerHTML = '<div class="text-center text-muted py-4"><i class="bi bi-shuffle display-4"></i><p class="mt-2">無法產生配對</p></div>';
        return;
    }

    const typeLabels = { balanced: '均衡配對', expert: '高手對決', 'womens-doubles': '女子雙打' };
    const typeColors = { balanced: 'primary', expert: 'warning', 'womens-doubles': 'danger' };

    container.innerHTML = `
        <div class="d-flex align-items-center gap-2 mb-3">
            <span class="badge bg-${typeColors[type]}">${typeLabels[type]}</span>
            <small class="text-muted">共 ${pairs.length} 場</small>
        </div>
        ${pairs.map((pair, idx) => `
            <div class="pairing-match">
                <div class="pairing-player">
                    ${pair.team1.map(p => `<div class="player-name">${escapeHtml(p.name)}</div><div class="player-level">${getLevelLabel(p.level)}</div>`).join('<div style="margin:4px 0;border-top:1px dashed #ddd"></div>')}
                </div>
                <div class="pairing-vs">VS</div>
                <div class="pairing-player">
                    ${pair.team2.map(p => `<div class="player-name">${escapeHtml(p.name)}</div><div class="player-level">${getLevelLabel(p.level)}</div>`).join('<div style="margin:4px 0;border-top:1px dashed #ddd"></div>')}
                </div>
            </div>
        `).join('')}
        <div class="text-center mt-3">
            <button class="btn btn-outline-primary btn-sm" onclick="generatePairing('${type}')">
                <i class="bi bi-arrow-repeat me-1"></i>重新配對
            </button>
        </div>
    `;
}

// ---------- Modal ----------
function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('show');
        // Reset title for new entries
        if (id === 'eventModal' && !document.getElementById('event-id').value) {
            document.getElementById('eventModalTitle').textContent = '新增活動';
        }
        if (id === 'memberModal' && !document.getElementById('member-id').value) {
            document.getElementById('memberModalTitle').textContent = '新增會員';
        }
    }
}

function hideModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('show');
        // Reset form
        if (id === 'eventModal') {
            document.getElementById('event-form').reset();
            document.getElementById('event-id').value = '';
        }
        if (id === 'memberModal') {
            document.getElementById('member-form').reset();
            document.getElementById('member-id').value = '';
        }
    }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('show');
    }
});

// ---------- Toast ----------
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-exclamation-circle-fill',
        info: 'bi-info-circle-fill'
    };

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `<i class="bi ${icons[type]}"></i><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = '0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ---------- Utility ----------
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${d.getFullYear()}/${month}/${day} ${hours}:${minutes}`;
}

function getLevelLabel(level) {
    const labels = {
        beginner: '初級',
        intermediate: '中級',
        advanced: '高級',
        expert: '專家'
    };
    return labels[level] || level;
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
