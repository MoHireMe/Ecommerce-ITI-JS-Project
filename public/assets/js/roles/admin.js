let users = [];

function populateUserTable() {
  const tableBody = document.getElementById('user-table-body');
  tableBody.innerHTML = '';

  fetch('http://localhost:3000/users')
    .then(response => response.json())
    .then(data => {
      users = data;

      users.forEach(user => {
        const row = document.createElement('tr');
        if (user.role === 'admin') {
          row.classList.add('admin-row');
        }

        const nameTd = document.createElement('td');
        nameTd.innerHTML = `${user.name} ${user.role === 'admin' ? '<span class="star">★</span>' : ''}`;

        const emailTd = document.createElement('td');
        emailTd.textContent = user.email;

        const roleTd = document.createElement('td');
        // Capitalize the first letter of the role
        roleTd.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);

        const addressTd = document.createElement('td');
        addressTd.textContent = user.address;

        const statusTd = document.createElement('td');
        statusTd.classList.add('user-status');
        statusTd.textContent = user.isActive ? 'Active' : 'Inactive';

        const actionsTd = document.createElement('td');
        actionsTd.classList.add('actions-cell');

        const editRoleBtn = document.createElement('button');
        editRoleBtn.textContent = 'Edit Role';
        editRoleBtn.className = 'btn btn-edit';
        editRoleBtn.addEventListener('click', () => editRole(user.id));

        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = user.isActive ? 'Deactivate' : 'Activate';
        toggleBtn.className = user.isActive ? 'btn btn-danger' : 'btn btn-primary';
        toggleBtn.addEventListener('click', () => toggleActivation(user.id));

        const editDetailsBtn = document.createElement('button');
        editDetailsBtn.textContent = 'Edit Details';
        editDetailsBtn.className = 'btn btn-primary';
        editDetailsBtn.addEventListener('click', () => editDetails(user.id));

        actionsTd.appendChild(editRoleBtn);
        actionsTd.appendChild(toggleBtn);
        actionsTd.appendChild(editDetailsBtn);

        row.appendChild(nameTd);
        row.appendChild(emailTd);
        row.appendChild(roleTd);
        row.appendChild(addressTd);
        row.appendChild(statusTd);
        row.appendChild(actionsTd);

        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error fetching users:', error);
      alert('Failed to load user data');
    });
}

function editRole(userId) {
  const user = users.find(u => u.id === userId);
  const newRole = prompt("Enter new role (admin, seller, customer):", user.role);
  if (!newRole || newRole === user.role) return;

  // Validate role input
  const validRoles = ['admin', 'seller', 'customer'];
  if (!validRoles.includes(newRole.toLowerCase())) {
    alert('Invalid role. Please enter admin, seller, or customer.');
    return;
  }

  fetch(`http://localhost:3000/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role: newRole.toLowerCase() }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => res.json())
    .then(() => {
      populateUserTable();
      // Call the status styling function after table update
      if (window.styleStatusCells) {
        setTimeout(window.styleStatusCells, 100);
      }
    })
    .catch(err => console.error('Error updating role:', err));
}

function toggleActivation(userId) {
  const user = users.find(u => u.id === userId);
  const updatedStatus = !user.isActive;

  fetch(`http://localhost:3000/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive: updatedStatus }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => res.json())
    .then(() => {
      populateUserTable();
      // Call the status styling function after table update
      if (window.styleStatusCells) {
        setTimeout(window.styleStatusCells, 100);
      }
    })
    .catch(err => console.error('Error toggling user activation:', err));
}

function editDetails(userId) {
  const user = users.find(u => u.id === userId);
  const newName = prompt("Enter new name:", user.name);
  const newAddress = prompt("Enter new address:", user.address);

  if (!newName && !newAddress) return;

  fetch(`http://localhost:3000/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      ...(newName && { name: newName }),
      ...(newAddress && { address: newAddress }),
    }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => res.json())
    .then(() => {
      populateUserTable();
      // Call the status styling function after table update
      if (window.styleStatusCells) {
        setTimeout(window.styleStatusCells, 100);
      }
    })
    .catch(err => console.error('Error updating user details:', err));
}

// Initialize the table when the page loads
window.onload = function() {
  populateUserTable();
  
  // Initialize the main content margin based on sidebar state
  const dashboardSidebar = document.getElementById('dashboard-sidebar');
  const mainContent = document.querySelector('.main-content');
  
  if (dashboardSidebar && mainContent) {
    if (dashboardSidebar.classList.contains('expanded')) {
      mainContent.classList.add('sidebar-expanded');
    }
  }
};
