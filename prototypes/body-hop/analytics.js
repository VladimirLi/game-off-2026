// Body Hop play stats: anonymous events sent to PostHog (EU cloud), so we can see where players get stuck.
// No PostHog script, no cookies, no person profiles: each event goes straight to the capture endpoint with a random
// id that lives only for this browser tab's session (sessionStorage). Nothing is sent when:
//   - the player switched stats off (pause menu; saved as bodyhop-stats = "off"),
//   - the browser asks not to be tracked (Do Not Track),
//   - the page runs from a file (file://) or under automation (the bot and the AI persona harness),
//   - no project key is set.
// ?playtest=1 in the address marks the session as a playtest (property mode = "playtest"), otherwise "public".
//   BodyHopAnalytics.init(info); track(event, props); flush(); enabled(); setEnabled(on)
(function (root) {
  "use strict";
  const KEY = "phc_pwReP8BWxUWDHm7g4JajRMojDm6nZqDGDFQtjWJPyQrG", HOST = "https://eu.i.posthog.com"; // the "Body Hop" project (ID 361888) in PostHog EU; a public, write-only key
  const BUILD = "2026-11-21";
  let sid = null, base = {}, queue = [], timer = null;

  const allowedHere = () => KEY && /^https?:$/.test(location.protocol) && !navigator.webdriver && navigator.doNotTrack !== "1" && window.doNotTrack !== "1";
  function enabled() { try { return allowedHere() && localStorage.getItem("bodyhop-stats") !== "off"; } catch (e) { return allowedHere(); } }
  function setEnabled(on) { try { localStorage.setItem("bodyhop-stats", on ? "on" : "off"); } catch (e) { /* storage unavailable */ } if (on) track("stats_on"); }

  function init(info) {
    try { sid = sessionStorage.getItem("bodyhop-sid"); if (!sid) { sid = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()); sessionStorage.setItem("bodyhop-sid", sid); } }
    catch (e) { sid = String(Math.random()).slice(2) + Date.now(); }
    const q = new URLSearchParams(location.search);
    const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname); // our own test runs, kept apart from players
    base = { mode: local ? "dev" : q.get("playtest") ? "playtest" : "public", build: BUILD, host: location.hostname, touch: matchMedia("(hover: none) and (pointer: coarse)").matches,
      screen: `${screen.width}x${screen.height}`, lang: navigator.language, $process_person_profile: false, ...info };
    track("session_start", { referrer: document.referrer ? new URL(document.referrer).hostname : "" });
    addEventListener("pagehide", flush);
    addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
  }

  // Events wait at most two seconds and go out in one batch; flush() sends them at once (when the page is hidden).
  function track(event, props = {}) {
    if (!enabled() || !sid) return;
    queue.push({ event: "bodyhop_" + event, distinct_id: sid, properties: { ...base, ...props, $session_id: sid }, timestamp: new Date().toISOString() });
    if (!timer) timer = setTimeout(flush, 2000);
  }
  function flush() {
    clearTimeout(timer); timer = null;
    if (!queue.length) return;
    const body = JSON.stringify({ api_key: KEY, batch: queue.map((e) => ({ ...e, properties: { ...e.properties, distinct_id: e.distinct_id } })) });
    queue = [];
    try { fetch(HOST + "/batch/", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {}); } catch (e) { /* offline or blocked */ }
  }

  root.BodyHopAnalytics = { init, track, flush, enabled, setEnabled, available: allowedHere };
})(typeof self !== "undefined" ? self : this);
