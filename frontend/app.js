const API_BASE = 'http://localhost:5000';

// ─── Tab Navigation ───
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// ─── Modal Helpers ───
function showModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Close modal on backdrop click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
});

// ─── Toast Notification ───
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type + ' visible';
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

// ─── Events ───
async function loadEvents() {
    try {
        const res = await fetch(API_BASE + '/events');
        const events = await res.json();
        renderEvents(events);
    } catch {
        renderEvents([]);
    }
}

function renderEvents(events) {
    const tbody = document.getElementById('eventsTableBody');
    if (events.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">尚無活動資料，請點擊「新增活動」建立</td></tr>';
        return;
    }
    tbody.innerHTML = events.map(e => `
        <tr>
            <td>${e.id}</td>
            <td>${escapeHtml(e.name)}</td>
            <td>${escapeHtml(e.date)}</td>
            <td>${escapeHtml(e.location)}</td>
            <td>
                <button class="btn-success btn-sm" onclick="editEvent(${e.id})">編輯</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('eventName').value.trim();
    const date = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value.trim();

    try {
        const res = await fetch(API_BASE + '/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, date, location })
        });
        if (res.ok) {
            showToast('活動新增成功！', 'success');
            closeModal('eventModal');
            e.target.reset();
            loadEvents();
        } else {
            showToast('新增失敗，請稍後再試', 'error');
        }
    } catch {
        showToast('無法連線至伺服器', 'error');
    }
});

async function editEvent(id) {
    const name = prompt('請輸入新的活動名稱：');
    if (!name) return;
    const date = prompt('請輸入新的日期 (YYYY-MM-DD)：');
    if (!date) return;
    const location = prompt('請輸入新的地點：');
    if (!location) return;

    try {
        const res = await fetch(API_BASE + '/events/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, date, location })
        });
        if (res.ok) {
            showToast('活動更新成功！', 'success');
            loadEvents();
        } else {
            showToast('更新失敗', 'error');
        }
    } catch {
        showToast('無法連線至伺服器', 'error');
    }
}

// ─── Members ───
async function loadMembers() {
    try {
        const res = await fetch(API_BASE + '/members');
        const members = await res.json();
        renderMembers(members);
    } catch {
        renderMembers([]);
    }
}

function renderMembers(members) {
    const tbody = document.getElementById('membersTableBody');
    if (members.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">尚無會員資料，請點擊「新增會員」建立</td></tr>';
        return;
    }
    tbody.innerHTML = members.map(m => `
        <tr>
            <td>${m.id}</td>
            <td>${escapeHtml(m.name)}</td>
            <td>${escapeHtml(m.email)}</td>
            <td>${m.absences ? m.absences.length : 0}</td>
            <td>
                <button class="btn-success btn-sm" onclick="editMember(${m.id})">編輯</button>
                <button class="btn-danger btn-sm" onclick="addAbsence(${m.id})">記錄缺席</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('memberForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('memberName').value.trim();
    const email = document.getElementById('memberEmail').value.trim();

    try {
        const res = await fetch(API_BASE + '/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        });
        if (res.ok) {
            showToast('會員新增成功！', 'success');
            closeModal('memberModal');
            e.target.reset();
            loadMembers();
        } else {
            showToast('新增失敗，請稍後再試', 'error');
        }
    } catch {
        showToast('無法連線至伺服器', 'error');
    }
});

async function editMember(id) {
    const name = prompt('請輸入新的姓名：');
    if (!name) return;
    const email = prompt('請輸入新的 Email：');
    if (!email) return;

    try {
        const res = await fetch(API_BASE + '/members/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        });
        if (res.ok) {
            showToast('會員更新成功！', 'success');
            loadMembers();
        } else {
            showToast('更新失敗', 'error');
        }
    } catch {
        showToast('無法連線至伺服器', 'error');
    }
}

async function addAbsence(id) {
    const reason = prompt('請輸入缺席原因：');
    if (!reason) return;
    const date = new Date().toISOString().slice(0, 10);

    try {
        const res = await fetch(API_BASE + '/members/' + id + '/absences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason, date })
        });
        if (res.ok) {
            showToast('缺席已記錄', 'success');
            loadMembers();
        } else {
            showToast('記錄失敗', 'error');
        }
    } catch {
        showToast('無法連線至伺服器', 'error');
    }
}

// ─── Registrations & Check-in ───
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const eventId = parseInt(document.getElementById('regEventId').value);
    const userId = parseInt(document.getElementById('regUserId').value);

    try {
        const res = await fetch(API_BASE + '/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId, userId })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('報名成功！', 'success');
            e.target.reset();
        } else {
            showToast(data.message || '報名失敗', 'error');
        }
    } catch {
        showToast('無法連線至伺服器', 'error');
    }
});

document.getElementById('checkinForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const eventId = parseInt(document.getElementById('checkinEventId').value);
    const userId = parseInt(document.getElementById('checkinUserId').value);

    try {
        const res = await fetch(API_BASE + '/checkin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId, userId })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('簽到成功！', 'success');
            e.target.reset();
        } else {
            showToast(data.message || '簽到失敗', 'error');
        }
    } catch {
        showToast('無法連線至伺服器', 'error');
    }
});

document.getElementById('attendanceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const eventId = document.getElementById('attendanceEventId').value;
    const resultBox = document.getElementById('attendanceResult');

    try {
        const res = await fetch(API_BASE + '/attendance/' + eventId);
        const data = await res.json();
        resultBox.classList.add('visible');
        if (data.attendees && data.attendees.length > 0) {
            resultBox.textContent = '出席人員 ID: ' + data.attendees.join(', ');
        } else {
            resultBox.textContent = '此活動尚無出席紀錄';
        }
    } catch {
        resultBox.classList.add('visible');
        resultBox.textContent = '無法連線至伺服器';
    }
});

// ─── Pairings ───
async function requestPairing(type) {
    let inputId;
    if (type === 'balanced') inputId = 'balancedPlayers';
    else if (type === 'expert') inputId = 'expertPlayers';
    else inputId = 'womensPlayers';

    const input = document.getElementById(inputId).value.trim();
    if (!input) {
        showToast('請輸入球員名單', 'error');
        return;
    }

    const players = input.split(',').map(p => ({ name: p.trim() }));
    const resultBox = document.getElementById(type + 'Result');

    try {
        const res = await fetch(API_BASE + '/' + type, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ players })
        });
        const data = await res.json();
        resultBox.classList.add('visible');
        const results = data.pairs || data.matches || [];
        if (results.length > 0) {
            resultBox.textContent = JSON.stringify(results, null, 2);
        } else {
            resultBox.textContent = '配對完成（目前無結果，後端配對邏輯待實作）';
        }
    } catch {
        resultBox.classList.add('visible');
        resultBox.textContent = '無法連線至伺服器';
    }
}

// ─── HTML Escape ───
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ─── Init ───
loadEvents();
loadMembers();
