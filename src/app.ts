// Google Analytics default capture for this template.
// Future LLM edits: do not remove this gtag setup unless replacing it with equivalent page analytics capture.
const googleAnalyticsId = "G-ZKTPLMMFDQ";
const storageKey = "pawcast-state";

type Theme = "system" | "light" | "dark";
type PetKind = "dog" | "cat" | "bird" | "small-pet" | "reptile";

export interface PetVideo {
  id: string;
  title: string;
  petName: string;
  petKind: PetKind;
  host: string;
  duration: string;
  description: string;
  live: boolean;
  likes: number;
  viewers: number;
  youtubeId?: string;
}

export interface AppState {
  appName: string;
  theme: Theme;
  selectedKind: "all" | PetKind;
  videos: PetVideo[];
}

interface AppElements {
  appNameInput: HTMLInputElement;
  categorySelect: HTMLSelectElement;
  featuredCount: HTMLElement;
  liveCount: HTMLElement;
  navLinks: NodeListOf<HTMLAnchorElement>;
  saveState: HTMLElement;
  themeSelect: HTMLSelectElement;
  title: HTMLHeadingElement;
  videoForm: HTMLFormElement;
  videoGrid: HTMLElement;
}

declare global {
  interface Window {
    dataLayer?: IArguments[];
    gtag?: (...args: unknown[]) => void;
  }
}

const petKinds: PetKind[] = ["dog", "cat", "bird", "small-pet", "reptile"];

function createVideo(
  video: Omit<PetVideo, "id">,
  idFactory: () => string,
): PetVideo {
  return { id: idFactory(), ...video };
}

export function createDefaultState(idFactory: () => string = () => crypto.randomUUID()): AppState {
  return {
    appName: "Pawcast",
    theme: "system",
    selectedKind: "all",
    videos: [
      createVideo(
        {
          title: "Nap cam from sunny window",
          petName: "Miso",
          petKind: "cat",
          host: "Lena",
          duration: "Live now",
          description: "Slow blinks, stretch breaks, and occasional commentary from the sill.",
          live: true,
          likes: 328,
          viewers: 1240,
          youtubeId: "EvsLqQS_80E",
        },
        idFactory,
      ),
      createVideo(
        {
          title: "Backyard fetch tournament",
          petName: "Rocco",
          petKind: "dog",
          host: "Miles",
          duration: "12 min",
          description: "Three rounds, one tennis ball, zero interest in returning it cleanly.",
          live: false,
          likes: 214,
          viewers: 690,
          youtubeId: "34tfyR8mO9k",
        },
        idFactory,
      ),
      createVideo(
        {
          title: "Breakfast chirp playlist",
          petName: "Kiwi",
          petKind: "bird",
          host: "Sam",
          duration: "Live now",
          description: "Morning whistles from a cockatiel with strong opinions on cereal.",
          live: true,
          likes: 187,
          viewers: 842,
          youtubeId: "e9C9K8ltDfk",
        },
        idFactory,
      ),
      createVideo(
        {
          title: "Cozy pet stream",
          petName: "Pebble",
          petKind: "small-pet",
          host: "Nora",
          duration: "Live now",
          description: "Quiet pet-room stream for easy background watching.",
          live: true,
          likes: 156,
          viewers: 734,
          youtubeId: "XsOU8JnEpNM",
        },
        idFactory,
      ),
    ],
  };
}

function isTheme(value: unknown): value is Theme {
  return value === "system" || value === "light" || value === "dark";
}

function isPetKind(value: unknown): value is PetKind {
  return petKinds.includes(value as PetKind);
}

function isSelectedKind(value: unknown): value is AppState["selectedKind"] {
  return value === "all" || isPetKind(value);
}

function isVideo(value: unknown): value is PetVideo {
  if (!value || typeof value !== "object") return false;
  const video = value as Record<string, unknown>;
  return (
    typeof video.id === "string" &&
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
    (video.youtubeId === undefined || typeof video.youtubeId === "string")
  );
}

export function parseStoredState(storedState: string | null, defaultState: AppState): AppState {
  if (!storedState) return defaultState;

  try {
    const parsed = JSON.parse(storedState) as Record<string, unknown>;
    return {
      appName: typeof parsed.appName === "string" ? parsed.appName : defaultState.appName,
      theme: isTheme(parsed.theme) ? parsed.theme : defaultState.theme,
      selectedKind: isSelectedKind(parsed.selectedKind) ? parsed.selectedKind : defaultState.selectedKind,
      videos: Array.isArray(parsed.videos) && parsed.videos.every(isVideo) ? parsed.videos : defaultState.videos,
    };
  } catch {
    return defaultState;
  }
}

export function addVideo(
  state: AppState,
  video: Omit<PetVideo, "id" | "likes" | "viewers">,
  idFactory: () => string = () => crypto.randomUUID(),
): AppState {
  const newVideo = createVideo(
    {
      ...video,
      likes: 0,
      viewers: video.live ? 1 : 0,
    },
    idFactory,
  );
  return { ...state, videos: [newVideo, ...state.videos] };
}

export function likeVideo(state: AppState, id: string): AppState {
  return {
    ...state,
    videos: state.videos.map((video) =>
      video.id === id ? { ...video, likes: video.likes + 1 } : video,
    ),
  };
}

export function setSelectedKind(
  state: AppState,
  selectedKind: AppState["selectedKind"],
): AppState {
  return { ...state, selectedKind };
}

export function getVisibleVideos(state: AppState): PetVideo[] {
  if (state.selectedKind === "all") return state.videos;
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

function getElement<T extends Element>(selector: string, type: { new (): T }): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return element;
}

function getElements(): AppElements {
  return {
    appNameInput: getElement("#app-name", HTMLInputElement),
    categorySelect: getElement("#category-select", HTMLSelectElement),
    featuredCount: getElement("#featured-count", HTMLElement),
    liveCount: getElement("#live-count", HTMLElement),
    navLinks: document.querySelectorAll<HTMLAnchorElement>(".nav a"),
    saveState: getElement("#save-state", HTMLElement),
    themeSelect: getElement("#theme-select", HTMLSelectElement),
    title: getElement(".topbar h1", HTMLHeadingElement),
    videoForm: getElement("#video-form", HTMLFormElement),
    videoGrid: getElement("#video-grid", HTMLElement),
  };
}

function formValue(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function formatKind(kind: PetKind): string {
  return kind === "small-pet" ? "Small pet" : kind.slice(0, 1).toUpperCase() + kind.slice(1);
}

function createYouTubeEmbed(video: PetVideo): HTMLIFrameElement {
  const iframe = document.createElement("iframe");
  iframe.className = "youtube-player";
  iframe.src = `https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0&modestbranding=1`;
  iframe.title = `${video.title} video stream`;
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.loading = "lazy";
  return iframe;
}

function createYouTubeWatchUrl(video: PetVideo): string {
  return `https://www.youtube.com/watch?v=${video.youtubeId}`;
}

function initializeApp() {
  initializeGoogleAnalytics();

  const defaultState = createDefaultState();
  const elements = getElements();
  let state = parseStoredState(localStorage.getItem(storageKey), defaultState);
  let saveTimer: number | undefined;

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
      poster.className = "poster";
      poster.dataset.kind = video.petKind;

      const badge = document.createElement("span");
      badge.className = video.live ? "badge live" : "badge";
      badge.textContent = video.live ? "Live" : video.duration;

      if (video.youtubeId) {
        poster.append(createYouTubeEmbed(video), badge);
      } else {
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

      const watchControl = video.youtubeId
        ? document.createElement("a")
        : document.createElement("button");
      watchControl.className = "button primary";
      watchControl.textContent = video.live ? "Watch live" : "Watch";
      if (watchControl instanceof HTMLAnchorElement) {
        watchControl.href = createYouTubeWatchUrl(video);
        watchControl.target = "_blank";
        watchControl.rel = "noreferrer";
      } else {
        watchControl.type = "button";
      }

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

      actions.append(watchControl, likeButton, viewers);
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
    if (!isPetKind(petKind)) return;

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
    if (!isSelectedKind(elements.categorySelect.value)) return;
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
    state = { ...state, theme: elements.themeSelect.value as Theme };
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
