import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  addVideo,
  createDefaultState,
  getVisibleVideos,
  likeVideo,
  parseStoredState,
  setSelectedKind,
} from "../public/app.js";

test("createDefaultState uses supplied id factory", () => {
  let nextId = 1;
  const state = createDefaultState(() => `video-${nextId++}`);

  assert.deepEqual(
    state.videos.map((video) => video.id),
    ["video-1", "video-2", "video-3"],
  );
});

test("parseStoredState merges valid stored values with defaults", () => {
  const defaultState = createDefaultState(() => "default-id");
  const stored = JSON.stringify({
    appName: "Pet Room",
    theme: "dark",
    selectedKind: "dog",
    videos: [
      {
        id: "stored-id",
        title: "Stored clip",
        petName: "Rocco",
        petKind: "dog",
        host: "Miles",
        duration: "5 min",
        description: "Stored video",
        live: false,
        likes: 3,
        viewers: 12,
      },
    ],
  });

  assert.deepEqual(parseStoredState(stored, defaultState), {
    appName: "Pet Room",
    theme: "dark",
    selectedKind: "dog",
    videos: [
      {
        id: "stored-id",
        title: "Stored clip",
        petName: "Rocco",
        petKind: "dog",
        host: "Miles",
        duration: "5 min",
        description: "Stored video",
        live: false,
        likes: 3,
        viewers: 12,
      },
    ],
  });
});

test("parseStoredState falls back when stored JSON is invalid", () => {
  const defaultState = createDefaultState(() => "default-id");

  assert.equal(parseStoredState("{", defaultState), defaultState);
});

test("video reducers add, like, and filter immutably", () => {
  const state = createDefaultState(() => "seed");
  const added = addVideo(
    state,
    {
      title: "Tunnel dash",
      petName: "Pepper",
      petKind: "small-pet",
      host: "Kai",
      duration: "Live now",
      description: "Fast laps through the cardboard course.",
      live: true,
    },
    () => "new-video",
  );
  const liked = likeVideo(added, "new-video");
  const filtered = setSelectedKind(liked, "small-pet");

  assert.deepEqual(added.videos[0], {
    id: "new-video",
    title: "Tunnel dash",
    petName: "Pepper",
    petKind: "small-pet",
    host: "Kai",
    duration: "Live now",
    description: "Fast laps through the cardboard course.",
    live: true,
    likes: 0,
    viewers: 1,
  });
  assert.equal(state.videos.length, 3);
  assert.equal(liked.videos[0].likes, 1);
  assert.deepEqual(
    getVisibleVideos(filtered).map((video) => video.petName),
    ["Pepper"],
  );
});

test("served files do not reference disallowed providers or tooling", async () => {
  const servedFiles = [
    "public/app.js",
    "public/humans.txt",
    "public/index.html",
    "public/llm.txt",
  ];

  for (const file of servedFiles) {
    const content = await readFile(file, "utf8");
    assert.doesNotMatch(content, /\bgit\b|cloudflare/i, file);
  }
});
