function filterReports() {
    const issueType = document.getElementById('issueType').value;
    const rows = document.querySelectorAll('#reportsList tr');
    
    rows.forEach(row => {
        if (issueType === 'all' || row.getAttribute('data-issue-type') === issueType) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
