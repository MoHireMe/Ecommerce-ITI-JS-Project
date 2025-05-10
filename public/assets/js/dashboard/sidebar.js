// DASHBOARD SIDEBAR
document.addEventListener('DOMContentLoaded', function() {
  const dashboardSidebar = document.getElementById('dashboard-sidebar');
  const togglePanel = document.getElementById('togglePanel');
  const mainContent = document.querySelector('.main-content');

  // Check if sidebar was previously expanded (using localStorage)
  const sidebarState = localStorage.getItem('dashboardSidebarExpanded');
  if (sidebarState === 'true' && dashboardSidebar) {
    dashboardSidebar.classList.add('expanded');
    if (mainContent) mainContent.classList.add('sidebar-expanded');
    if (togglePanel) togglePanel.classList.add('sidebar-expanded');
  }

  // Toggle sidebar when button is clicked
  if (dashboardSidebar && togglePanel) {
    togglePanel.addEventListener('click', () => {
      dashboardSidebar.classList.toggle('expanded');
      togglePanel.classList.toggle('sidebar-expanded');
      if (mainContent) mainContent.classList.toggle('sidebar-expanded');
      
      // Save sidebar state to localStorage
      localStorage.setItem('dashboardSidebarExpanded', dashboardSidebar.classList.contains('expanded'));
    });
  }
});
