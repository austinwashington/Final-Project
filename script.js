let greetbutton = document.getElementById("greetbutton");
let nameInput = document.getElementById("nameinput");
let mainContent = document.getElementById("mainContent");
let popup = document.getElementById("fullscreenPopup");
let welcomeMessage = document.getElementById("welcomeMessage");
let paragraphSection = document.getElementById("paragraphSection");
let rectContainer = document.getElementById("rectContainer");
let rects = document.querySelectorAll(".rect");
let  donate= document.getElementById("donate");
let paragraph = document.getElementById("paragraphSection")

// ---- Nav stays hidden until the "Show" button is pressed ----
const gatedNav = document.querySelector("nav.nav-gated");

function welcome() {
  let firstName = nameInput.value;

   paragraph.innerHTML = `<p>Hello ${nameInput.value}, and welcome to Route Reach. This website was inspired by my personal desire to have freedom as a teen and it aims to solve problems for both the child and authoritative figure.</p>`
  // reveal the nav now that the button has been pressed
  gatedNav?.classList.add("nav-visible");

  // show fullscreen popup
  welcomeMessage.textContent = "Welcome " + firstName + ", " + "to Route reach.";
  popup.classList.add("show");

  // after a couple seconds, fade it out
  setTimeout(() => {
    popup.classList.add("fade-out");
  }, 2000);

  // once fade finishes, remove input/button and reveal paragraph + rects
  setTimeout(() => {
    popup.classList.remove("show", "fade-out");
    mainContent.style.display = "none";
    paragraphSection.style.display = "block";
    rectContainer.style.display = "flex";
    updateStack(); // recalculate now that the stack is actually visible/measurable
  }, 2600); // 2000ms wait + 600ms fade transition
}

greetbutton?.addEventListener("click", welcome);

// ---- Flashcard-stack scroll effect ----
const stackWrap = document.querySelector(".stack-wrap");
const stackRects = document.querySelectorAll(".stack-sticky .rect");

function updateStack() {
  if (!stackWrap || stackRects.length === 0) return;

  const wrapBox = stackWrap.getBoundingClientRect();
  const scrollable = wrapBox.height - window.innerHeight;
  if (scrollable <= 0) return;

  // How far we've scrolled into the stack (0 at the top, 1 once fully past it)
  const scrolledPast = Math.max(0, Math.min(-wrapBox.top, scrollable));
  const overallProgress = scrolledPast / scrollable;

  const n = stackRects.length;
  const segments = n - 1 || 1; // number of card-to-card transitions

  stackRects.forEach((rect, i) => {
    // Earlier cards sit on top of later ones until they animate away
    rect.style.zIndex = n - i;

    if (i === n - 1) {
      // Last card: no exit animation, it's the final resting card
      rect.style.transform = "translate(-50%, -50%)";
      rect.style.opacity = 1;
      return;
    }

    const segStart = i / segments;
    const segEnd = (i + 1) / segments;
    const segProgress = Math.max(0, Math.min((overallProgress - segStart) / (segEnd - segStart), 1));

    // Flashcard motion: slides up, tips back in 3D, shrinks, and fades away
    const translateY = -segProgress * 70;
    const rotateX = segProgress * 55;
    const scale = 1 - segProgress * 0.25;
    const opacity = 1 - segProgress;

    rect.style.transform =
      `translate(-50%, calc(-50% + ${translateY}px)) rotateX(${rotateX}deg) scale(${scale})`;
    rect.style.opacity = opacity;
  });
}

window.addEventListener("scroll", updateStack);
window.addEventListener("resize", updateStack);
updateStack();

// Toggle visibility of the stats info block (image + paragraph) when the button is clicked
const statsInfo = document.getElementById('statsInfo');
const showStatsBtn = document.getElementById('showStatsBtn');
if (showStatsBtn && statsInfo) {
  showStatsBtn.addEventListener('click', () => {
    const nowVisible = statsInfo.classList.toggle('visible');
    showStatsBtn.textContent = nowVisible ? 'Hide stats' : 'Show stats';
  });
}
function opengit() {
    window.open("https://gofund.me/f15f56af4");
}
donate?.addEventListener("click", opengit);

// ---- Suggestion box (product page) ----
// Sends suggestions to Formspree, which forwards them to your email
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mkodlkrn";

const suggestionInput = document.getElementById("suggestionInput");
const suggestionSubmit = document.getElementById("suggestionSubmit");
const suggestionStatus = document.getElementById("suggestionStatus");

if (suggestionInput && suggestionSubmit && suggestionStatus) {
  suggestionSubmit.addEventListener("click", async () => {
    const text = suggestionInput.value.trim();

    if (!text) {
      suggestionStatus.textContent = "Please write a suggestion before sending.";
      suggestionStatus.classList.remove("success");
      suggestionStatus.classList.add("error");
      return;
    }

    suggestionSubmit.disabled = true;
    suggestionStatus.textContent = "Sending...";
    suggestionStatus.classList.remove("success", "error");

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: JSON.stringify({ suggestion: text })
      });

      if (response.ok) {
        suggestionInput.value = "";
        suggestionStatus.textContent = "Thanks — your suggestion was sent!";
        suggestionStatus.classList.add("success");
      } else {
        suggestionStatus.textContent = "Couldn't send that. Please try again.";
        suggestionStatus.classList.add("error");
      }
    } catch (err) {
      suggestionStatus.textContent = "Couldn't send that. Check your connection and try again.";
      suggestionStatus.classList.add("error");
    } finally {
      suggestionSubmit.disabled = false;
    }
  });

  suggestionInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      suggestionSubmit.click();
    }
  });
}




