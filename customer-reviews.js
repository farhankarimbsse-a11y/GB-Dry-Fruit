(() => {
  "use strict";
  const form = document.getElementById("customer-review-form");
  if (!form) return;
  const WHATSAPP_NUMBER = "923555850225";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const name = document.getElementById("review-customer-name").value.trim();
    const rating = document.getElementById("review-rating").value;
    const review = document.getElementById("review-message").value.trim();
    if (!name || !review) return;
    const stars = "★".repeat(Number(rating)) + "☆".repeat(5 - Number(rating));
    const message = [
      "Assalam-o-Alaikum GB Dry Fruit! I would like to share customer feedback:",
      "",
      "Name: " + name,
      "Rating: " + stars + " (" + rating + "/5)",
      "Feedback: " + review,
      "",
      "Please review my feedback before publishing it."
    ].join("\n");
    const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
    const popup = window.open(url, "_blank");
    if (popup) popup.opener = null;
    else window.location.href = url;
  });
})();
