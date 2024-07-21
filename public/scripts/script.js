const menuButtons = document.querySelectorAll(".menu-button");
const screenOverlay = document.querySelector(".main-layout .screen-overlay");
const themeButton = document.querySelector(".navbar .theme-button i");

// Toggle sidebar visibility when menu buttons are clicked
menuButtons.forEach(button => {
  button.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-hidden");
  });
});

// Toggle sidebar visibility when screen overlay is clicked
screenOverlay.addEventListener("click", () => {
  document.body.classList.toggle("sidebar-hidden");
});

// Initialize dark mode based on localStorage
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
  themeButton.classList.replace("uil-moon", "uil-sun");
} else {
  themeButton.classList.replace("uil-sun", "uil-moon");
}

// Toggle dark mode when theme button is clicked
themeButton.addEventListener("click", () => {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
  themeButton.classList.toggle("uil-sun", isDarkMode);
  themeButton.classList.toggle("uil-moon", !isDarkMode);
});

// Show sidebar on large screens by default
if (window.innerWidth >= 768) {
  document.body.classList.remove("sidebar-hidden");
}
document.addEventListener('DOMContentLoaded', () => {
  const videoCards = document.querySelectorAll('.video-card');

  videoCards.forEach(card => {
    card.addEventListener('click', async (event) => {
      event.preventDefault();
      const url = card.getAttribute('data-url');
      const platform = card.getAttribute('data-platform');

      let iframeSrc = '';
      if (platform === 'youtube') {
        iframeSrc = getYouTubeEmbedURL(url);
      } else if (platform === 'xnxx') {
        iframeSrc = await getXnxxIframe(url);
      }

      Swal.fire({
        html: `<iframe width="100%" height="400" src="${iframeSrc}" frameborder="0" allowfullscreen></iframe>`,
        showCloseButton: true,
        showConfirmButton: false,
        width: '80%',
        padding: '1em',
        background: '#fff',
        backdrop: `
          rgba(0,0,0,0.4)
        `
      });
    });
  });

  function getYouTubeEmbedURL(url) {
    const videoId = url.split('v=')[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  async function getXnxxIframe(url) {
    try {
      const response = await fetch(`/xnxxdown?url=${url}`);
      const data = await response.json();
      const iframe = data
      return iframe;
    } catch (error) {
      console.error('Error fetching Xnxx iframe:', error);
      return '';
    }
  }
});
