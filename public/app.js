// Google Analytics default capture for this template.
// Future LLM edits: do not remove this gtag setup unless replacing it with equivalent page analytics capture.
const googleAnalyticsId = "G-ZKTPLMMFDQ";
const storageKey = "pawcast-state";
const petKinds = ["dog", "cat", "bird", "small-pet", "reptile"];
function createVideo(video, idFactory) {
    return { id: idFactory(), ...video };
}
export function createDefaultState(idFactory = () => crypto.randomUUID()) {
    return {
        appName: "Pawcast",
        theme: "system",
        selectedKind: "all",
        videos: [
            createVideo({
                title: "24/7 Live Cat TV: birds and squirrels",
                petName: "Whisker lounge",
                petKind: "cat",
                host: "Birder King",
                duration: "Live now",
                description: "Backyard birds and squirrels running all day for cats, dogs, and curious pets.",
                live: true,
                likes: 982,
                viewers: 12400,
                youtubeId: "34tfyR8mO9k",
                youtubeUrl: "https://www.youtube.com/watch?v=34tfyR8mO9k",
            }, idFactory),
            createVideo({
                title: "Live puppy room cam",
                petName: "Puppy pile",
                petKind: "dog",
                host: "Puppy Cam",
                duration: "Live now",
                description: "Real-time puppy pen watch with naps, play breaks, and toy chaos.",
                live: true,
                likes: 746,
                viewers: 8300,
                youtubeId: "vroMtrHyb6g",
                youtubeUrl: "https://www.youtube.com/watch?v=vroMtrHyb6g",
            }, idFactory),
            createVideo({
                title: "No-ads live cat TV",
                petName: "Window patrol",
                petKind: "bird",
                host: "Paul Dinning",
                duration: "Live now",
                description: "Continuous bird and squirrel stream made for pets who watch from couch or perch.",
                live: true,
                likes: 694,
                viewers: 9100,
                youtubeId: "UEyEs8AE1ss",
                youtubeUrl: "https://www.youtube.com/watch?v=UEyEs8AE1ss",
            }, idFactory),
            createVideo({
                title: "Cat TV aquarium live 24/7",
                petName: "Tank watch",
                petKind: "cat",
                host: "Cat TV Aquarium",
                duration: "Live now",
                description: "Real fish glide through a live aquarium stream for cats and quiet pet rooms.",
                live: true,
                likes: 522,
                viewers: 6400,
                youtubeId: "wVWLrwqsq3c",
                youtubeUrl: "https://www.youtube.com/watch?v=wVWLrwqsq3c",
            }, idFactory),
            createVideo({
                title: "Live cat TV: birds, bunnies, squirrels",
                petName: "Critter yard",
                petKind: "small-pet",
                host: "Outdoor Cat TV",
                duration: "Live now",
                description: "Small wildlife feed with motion and soft outdoor sound for pets at home.",
                live: true,
                likes: 438,
                viewers: 5200,
                youtubeId: "1HIuo_Roo6A",
                youtubeUrl: "https://www.youtube.com/watch?v=1HIuo_Roo6A",
            }, idFactory),
        ],
    };
}
function isTheme(value) {
    return value === "system" || value === "light" || value === "dark";
}
function isPetKind(value) {
    return petKinds.includes(value);
}
function isSelectedKind(value) {
    return value === "all" || isPetKind(value);
}
function isVideo(value) {
    if (!value || typeof value !== "object")
        return false;
    const video = value;
    return (typeof video.id === "string" &&
        typeof video.title === "string" &&
        typeof video.petName === "string" &&
        isPetKind(video.petKind) &&
        typeof video.host === "string" &&
        typeof video.duration === "string" &&
        typeof video.description === "string" &&
        typeof video.live === "boolean" &&
        typeof video.likes === "number" &&
        Number.isFinite(video.likes) &&
        typeof video.viewers === "number" &&
        Number.isFinite(video.viewers) &&
        (video.youtubeId === undefined || typeof video.youtubeId === "string") &&
        (video.youtubeUrl === undefined || typeof video.youtubeUrl === "string"));
}
export function parseStoredState(storedState, defaultState) {
    if (!storedState)
        return defaultState;
    try {
        const parsed = JSON.parse(storedState);
        return {
            appName: typeof parsed.appName === "string" ? parsed.appName : defaultState.appName,
            theme: isTheme(parsed.theme) ? parsed.theme : defaultState.theme,
            selectedKind: isSelectedKind(parsed.selectedKind) ? parsed.selectedKind : defaultState.selectedKind,
            videos: Array.isArray(parsed.videos) && parsed.videos.every(isVideo) ? parsed.videos : defaultState.videos,
        };
    }
    catch {
        return defaultState;
    }
}
export function addVideo(state, video, idFactory = () => crypto.randomUUID()) {
    const newVideo = createVideo({
        ...video,
        likes: 0,
        viewers: video.live ? 1 : 0,
    }, idFactory);
    return { ...state, videos: [newVideo, ...state.videos] };
}
export function likeVideo(state, id) {
    return {
        ...state,
        videos: state.videos.map((video) => video.id === id ? { ...video, likes: video.likes + 1 } : video),
    };
}
export function setSelectedKind(state, selectedKind) {
    return { ...state, selectedKind };
}
export function getVisibleVideos(state) {
    if (state.selectedKind === "all")
        return state.videos;
    return state.videos.filter((video) => video.petKind === state.selectedKind);
}
function initializeGoogleAnalytics() {
    const googleTagScript = document.createElement("script");
    googleTagScript.async = true;
    googleTagScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
    document.head.append(googleTagScript);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
        window.dataLayer?.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", googleAnalyticsId);
}
function getElement(selector, type) {
    const element = document.querySelector(selector);
    if (!(element instanceof type)) {
        throw new Error(`Missing required element: ${selector}`);
    }
    return element;
}
function getElements() {
    return {
        appNameInput: getElement("#app-name", HTMLInputElement),
        categorySelect: getElement("#category-select", HTMLSelectElement),
        featuredCount: getElement("#featured-count", HTMLElement),
        liveCount: getElement("#live-count", HTMLElement),
        navLinks: document.querySelectorAll(".nav a"),
        saveState: getElement("#save-state", HTMLElement),
        themeSelect: getElement("#theme-select", HTMLSelectElement),
        title: getElement(".topbar h1", HTMLHeadingElement),
        videoForm: getElement("#video-form", HTMLFormElement),
        videoGrid: getElement("#video-grid", HTMLElement),
    };
}
function formValue(formData, name) {
    return String(formData.get(name) ?? "").trim();
}
function formatKind(kind) {
    return kind === "small-pet" ? "Small pet" : kind.slice(0, 1).toUpperCase() + kind.slice(1);
}
function youtubeThumbnailUrl(videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
function initializeApp() {
    initializeGoogleAnalytics();
    const defaultState = createDefaultState();
    const elements = getElements();
    let state = parseStoredState(localStorage.getItem(storageKey), defaultState);
    let saveTimer;
    function saveState() {
        localStorage.setItem(storageKey, JSON.stringify(state));
        elements.saveState.textContent = "Saved";
        window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(() => {
            elements.saveState.textContent = "Autosaves";
        }, 1600);
    }
    function applyTheme() {
        document.documentElement.dataset.theme = state.theme;
    }
    function renderVideos() {
        elements.videoGrid.replaceChildren();
        const visibleVideos = getVisibleVideos(state);
        if (visibleVideos.length === 0) {
            const emptyState = document.createElement("p");
            emptyState.className = "empty-state";
            emptyState.textContent = "No posts in this pet lane yet. Add one above.";
            elements.videoGrid.append(emptyState);
            return;
        }
        visibleVideos.forEach((video) => {
            const card = document.createElement("article");
            card.className = "video-card";
            const poster = document.createElement("div");
            poster.className = video.youtubeId ? "poster has-video" : "poster";
            poster.dataset.kind = video.petKind;
            const badge = document.createElement("span");
            badge.className = video.live ? "badge live" : "badge";
            badge.textContent = video.live ? "Live" : video.duration;
            if (video.youtubeId) {
                const thumbnail = document.createElement("img");
                thumbnail.className = "youtube-thumb";
                thumbnail.src = youtubeThumbnailUrl(video.youtubeId);
                thumbnail.alt = "";
                thumbnail.loading = "lazy";
                const playMark = document.createElement("span");
                playMark.className = "play-mark";
                playMark.setAttribute("aria-hidden", "true");
                poster.append(thumbnail, badge, playMark);
            }
            else {
                const avatar = document.createElement("span");
                avatar.className = "pet-avatar";
                avatar.textContent = video.petName.charAt(0).toUpperCase();
                poster.append(badge, avatar);
            }
            const body = document.createElement("div");
            body.className = "video-body";
            const meta = document.createElement("p");
            meta.className = "video-meta";
            meta.textContent = `${formatKind(video.petKind)} hosted by ${video.host}`;
            const heading = document.createElement("h3");
            heading.textContent = video.title;
            const description = document.createElement("p");
            description.textContent = video.description;
            const actions = document.createElement("div");
            actions.className = "video-actions";
            const watchButton = document.createElement("a");
            watchButton.className = "button primary";
            watchButton.href = video.youtubeUrl ?? `https://www.youtube.com/results?search_query=${encodeURIComponent(video.title)}`;
            watchButton.target = "_blank";
            watchButton.rel = "noopener noreferrer";
            watchButton.textContent = video.live ? "Open live" : "Open";
            const likeButton = document.createElement("button");
            likeButton.className = "button secondary";
            likeButton.type = "button";
            likeButton.textContent = `Like ${video.likes}`;
            likeButton.addEventListener("click", () => {
                state = likeVideo(state, video.id);
                saveState();
                render();
            });
            const viewers = document.createElement("span");
            viewers.className = "viewer-count";
            viewers.textContent = `${video.viewers.toLocaleString()} viewers`;
            actions.append(watchButton, likeButton, viewers);
            body.append(meta, heading, description, actions);
            card.append(poster, body);
            elements.videoGrid.append(card);
        });
    }
    function render() {
        document.title = `${state.appName} | Pet livestreams`;
        elements.title.textContent = state.appName;
        elements.appNameInput.value = state.appName;
        elements.themeSelect.value = state.theme;
        elements.categorySelect.value = state.selectedKind;
        elements.featuredCount.textContent = String(state.videos.length);
        elements.liveCount.textContent = String(state.videos.filter((video) => video.live).length);
        applyTheme();
        renderVideos();
    }
    function updateCurrentNavLink() {
        const currentHash = window.location.hash || "#feed";
        elements.navLinks.forEach((link) => {
            link.setAttribute("aria-current", link.getAttribute("href") === currentHash ? "page" : "false");
        });
    }
    elements.videoForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(elements.videoForm);
        const petKind = formValue(formData, "pet-kind");
        if (!isPetKind(petKind))
            return;
        state = addVideo(state, {
            title: formValue(formData, "title"),
            petName: formValue(formData, "pet-name"),
            petKind,
            host: formValue(formData, "host"),
            duration: formData.has("live") ? "Live now" : "8 min",
            description: formValue(formData, "description"),
            live: formData.has("live"),
        });
        saveState();
        render();
        elements.videoForm.reset();
        getElement("#title", HTMLInputElement).focus();
    });
    elements.categorySelect.addEventListener("change", () => {
        if (!isSelectedKind(elements.categorySelect.value))
            return;
        state = setSelectedKind(state, elements.categorySelect.value);
        saveState();
        render();
    });
    elements.appNameInput.addEventListener("input", () => {
        state = { ...state, appName: elements.appNameInput.value.trim() || "Pawcast" };
        saveState();
        render();
    });
    elements.themeSelect.addEventListener("change", () => {
        state = { ...state, theme: elements.themeSelect.value };
        saveState();
        render();
    });
    window.addEventListener("hashchange", updateCurrentNavLink);
    render();
    updateCurrentNavLink();
}
if (typeof document !== "undefined") {
    initializeApp();
}
