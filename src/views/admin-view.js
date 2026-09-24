window.PrimeViews = window.PrimeViews || {};

window.PrimeViews.admin = {
  statusLabel(status) {
    return `<span class="status">${status}</span>`;
  },
  auditEntry(actor, action, time) {
    return `<p><b>${actor} ·</b> ${action} <time>${time}</time></p>`;
  }
};
