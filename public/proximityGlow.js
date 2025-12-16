document.addEventListener("mousemove", (e) => {
  document.querySelectorAll(".proximity-glow").forEach((el) => {
    const rect = el.getBoundingClientRect();

    // Distance outside element (0 when inside)
    const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
    const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Toggle stronger glow when near
    el.dataset.glow = distance < 90 ? "strong" : "";

    // Cursor position relative to element (clamped to element bounds)
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height);

    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);

    // Intensity (0..1) based on distance
    const intensity = Math.max(0, 1 - distance / 140);
    el.style.setProperty("--glow-intensity", intensity.toFixed(3));
  });
});
