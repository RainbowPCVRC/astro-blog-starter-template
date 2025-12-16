document.addEventListener("mousemove", (e) => {
  document.querySelectorAll(".proximity-glow").forEach((el) => {
    const rect = el.getBoundingClientRect();

    const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
    const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 80) el.dataset.glow = "strong";
    else el.dataset.glow = "";
  });
});
