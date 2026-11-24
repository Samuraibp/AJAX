const form = document.querySelector(".search");
const input = document.querySelector(".input");
const gallery = document.querySelector(".gallery");
const status = document.querySelector(".status");

const API_KEY = "58810918-3480d097d93bdfb8c38c2b8d0";
const ENDPOINTS = {
    photo: "https://pixabay.com/api/",
    video: "https://pixabay.com/api/videos/"
};

const getMode = () => document.querySelector('input[name="mode"]:checked').value;

function createPhotoCard(hit) {
    const card = document.createElement("figure");
    card.className = "card";

    const img = document.createElement("img");
    img.src = hit.webformatURL;
    img.alt = hit.tags;
    img.loading = "lazy";

    const caption = document.createElement("figcaption");
    caption.textContent = hit.tags;

    card.append(img, caption);
    return card;
}

function createVideoCard(hit) {
    const card = document.createElement("figure");
    card.className = "card card--video";

    const video = document.createElement("video");
    const file = hit.videos.small || hit.videos.tiny || hit.videos.medium;
    video.src = `${file.url}#t=0.1`;
    const thumb = (hit.videos.medium || hit.videos.small || {}).thumbnail;
    video.poster = thumb || `https://i.vimeocdn.com/video/${hit.picture_id}_640x360.jpg`;
    video.controls = true;
    video.preload = "metadata";
    video.playsInline = true;

    const caption = document.createElement("figcaption");
    caption.textContent = hit.tags;

    card.append(video, caption);
    return card;
}

function search(query) {
    query = query.trim();
    if (!query) return;

    const mode = getMode();
    status.textContent = "Ищем…";
    gallery.replaceChildren();

    const xhr = new XMLHttpRequest();
    xhr.open(
        "GET",
        `${ENDPOINTS[mode]}?key=${API_KEY}&q=${encodeURIComponent(query)}&per_page=18` +
        (mode === "photo" ? "&image_type=photo" : "")
    );

    xhr.onload = function () {
        if (xhr.status !== 200) {
            status.textContent = "Ошибка загрузки. Попробуйте ещё раз.";
            return;
        }

        const response = JSON.parse(xhr.responseText);

        if (response.hits.length === 0) {
            status.textContent = `По запросу «${query}» ничего не найдено.`;
            return;
        }

        status.textContent = `Найдено: ${response.hits.length}`;

        const createCard = mode === "video" ? createVideoCard : createPhotoCard;
        response.hits.forEach((hit) => gallery.appendChild(createCard(hit)));
    };

    xhr.onerror = function () {
        status.textContent = "Нет соединения с сервером.";
    };

    xhr.send();
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    search(input.value);
});

document.querySelectorAll('input[name="mode"]').forEach((radio) =>
    radio.addEventListener("change", () => search(input.value))
);

document.querySelectorAll(".chip").forEach((chip) =>
    chip.addEventListener("click", () => {
        input.value = chip.textContent;
        search(chip.textContent);
    })
);

document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== input) {
        e.preventDefault();
        input.focus();
    }
});