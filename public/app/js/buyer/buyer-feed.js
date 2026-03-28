import API from "../api.js";

async function loadFeed() {
  const data = await API.get("/api/buyer/feed");

  const skaters = document.getElementById("skater-feed");
  skaters.innerHTML = "";
  data.skaters.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name} — ${s.discipline}`;
    skaters.appendChild(li);
  });

  const shows = document.getElementById("show-feed");
  shows.innerHTML = "";
  data.shows.forEach(show => {
    const li = document.createElement("li");
    li.textContent = `${show.title} — $${(show.price_cents / 100).toFixed(2)}`;
    shows.appendChild(li);
  });

  const lessons = document.getElementById("lesson-feed");
  lessons.innerHTML = "";
  data.lessons.forEach(lesson => {
    const li = document.createElement("li");
    li.textContent = `${lesson.title} — $${(lesson.price_cents / 100).toFixed(2)}`;
    lessons.appendChild(li);
  });
}

loadFeed();
