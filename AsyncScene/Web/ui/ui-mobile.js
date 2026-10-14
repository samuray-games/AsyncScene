// Mobile-only navigation, gesture arbitration and touch help. This module changes
// panel visibility only; the existing game renderers and state remain authoritative.
window.Game = window.Game || {};
(function installMobileInterface(Game){
  "use strict";

  const QUERY = "(max-width: 860px)";
  const ORDER = ["dm", "battles", "events"];
  const PANELS = Object.freeze({ dm: "dmBlock", battles: "battlesBlock", events: "eventsBlock" });
  const BUTTONS = Object.freeze({ dm: "mobileTabDm", battles: "mobileTabBattles", events: "mobileTabEvents" });
  const COUNTERS = Object.freeze({
    dm: ["dmHeaderCount"],
    battles: ["battleCount"],
    events: ["eventsHeaderCount"],
  });
  const INTERACTIVE = "button,input,textarea,select,a,[contenteditable='true'],[role='button'],[role='slider'],[data-action],[data-battle-id],[data-event-id],.battleCard,.eventCard,.dmList,.dmTab,.dmTabRow,.statToast,.lotteryToast";
  let activeKey = "dm";
  let initialized = false;
  let countObserver = null;
  let gesture = null;
  let blockedActionGesture = null;
  let suppressedClick = null;
  let longPress = null;
  let visibleLongPressTarget = null;
  let tooltip = null;
  const panelScroll = new Map();

  const isMobile = () => !!(window.matchMedia && window.matchMedia(QUERY).matches) || window.innerWidth <= 860;
  const textCount = (key) => {
    for (const id of COUNTERS[key] || []) {
      const node = document.getElementById(id);
      if (!node) continue;
      const match = String(node.textContent || "").match(/-?\d+/);
      if (match) return String(Math.max(0, Number.parseInt(match[0], 10) || 0));
    }
    return "0";
  };
  const panelElement = (key) => document.getElementById(PANELS[key]);
  const buttonElement = (key) => document.getElementById(BUTTONS[key]);

  function savePanelScroll(panel){
    if (!panel) return;
    const nodes = Array.from(panel.querySelectorAll("*"));
    panelScroll.set(panel.id, nodes.map((node, index) => ({
      index,
      top: node.scrollTop,
      left: node.scrollLeft,
      scrollable: node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1,
    })).filter((entry) => entry.scrollable));
  }

  function restorePanelScroll(panel){
    if (!panel) return;
    const saved = panelScroll.get(panel.id);
    if (!saved || !saved.length) return;
    const nodes = Array.from(panel.querySelectorAll("*"));
    window.requestAnimationFrame(() => saved.forEach((entry) => {
      const node = nodes[entry.index];
      if (!node || !node.isConnected) return;
      node.scrollTop = entry.top;
      node.scrollLeft = entry.left;
    }));
  }

  function updateCounters(){
    for (const key of ORDER) {
      const tab = buttonElement(key);
      const count = textCount(key);
      const value = document.querySelector(`[data-mobile-count="${key}"]`);
      if (value) value.textContent = count;
      if (tab) tab.setAttribute("aria-label", `${tab.querySelector("span")?.textContent || key} (${count})`);
    }
  }

  function syncA11yAndVisibility(){
    const tablist = document.getElementById("mobilePanelTabs");
    const blocks = document.getElementById("blocks");
    if (!tablist || !blocks) return;
    const mobile = isMobile();
    tablist.setAttribute("aria-hidden", mobile ? "false" : "true");
    if (mobile) blocks.setAttribute("data-active-tab", activeKey);
    else blocks.removeAttribute("data-active-tab");

    for (const key of ORDER) {
      const tab = buttonElement(key);
      const panel = panelElement(key);
      if (!tab || !panel) continue;
      if (mobile) {
        tab.setAttribute("aria-selected", key === activeKey ? "true" : "false");
        tab.tabIndex = key === activeKey ? 0 : -1;
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", tab.id);
        panel.setAttribute("aria-hidden", key === activeKey ? "false" : "true");
        panel.tabIndex = 0;
        panel.classList.toggle("mobile-tab-active", key === activeKey);
      } else {
        tab.removeAttribute("aria-selected");
        tab.removeAttribute("tabindex");
        panel.removeAttribute("role");
        panel.removeAttribute("aria-labelledby");
        panel.removeAttribute("aria-hidden");
        panel.removeAttribute("tabindex");
        panel.classList.remove("mobile-tab-active");
      }
    }
    updateCounters();
  }

  function selectTab(key, focus){
    if (!ORDER.includes(key) || key === activeKey) {
      if (focus && buttonElement(key)) buttonElement(key).focus();
      return false;
    }
    const previousPanel = panelElement(activeKey);
    savePanelScroll(previousPanel);
    activeKey = key;
    syncA11yAndVisibility();
    restorePanelScroll(panelElement(key));
    if (focus && buttonElement(key)) buttonElement(key).focus();
    const UI = Game.UI;
    if (UI && typeof UI.ensureMobilePinnedChatLayout === "function") UI.ensureMobilePinnedChatLayout();
    return true;
  }

  function onTabKeydown(event){
    if (!isMobile()) return;
    const current = event.currentTarget.getAttribute("data-mobile-tab");
    const index = ORDER.indexOf(current);
    let next = null;
    if (event.key === "ArrowRight") next = ORDER[Math.min(ORDER.length - 1, index + 1)];
    else if (event.key === "ArrowLeft") next = ORDER[Math.max(0, index - 1)];
    else if (event.key === "Home") next = ORDER[0];
    else if (event.key === "End") next = ORDER[ORDER.length - 1];
    if (!next) return;
    event.preventDefault();
    selectTab(next, true);
  }

  function isHorizontalScroller(target, panel){
    for (let node = target; node && node !== panel; node = node.parentElement) {
      if (node.hasAttribute("data-mobile-horizontal-scroll")) return true;
      const style = getComputedStyle(node);
      if (node.scrollWidth > node.clientWidth + 2 && /(auto|scroll)/.test(style.overflowX)) return true;
    }
    return false;
  }

  function isInteractiveStart(target, panel){
    if (!target || !panel || target.closest(INTERACTIVE)) return true;
    for (let node = target; node && node !== panel; node = node.parentElement) {
      if (typeof node.onclick === "function" || typeof node.onpointerdown === "function" || typeof node.onpointerup === "function") return true;
    }
    return isHorizontalScroller(target, panel);
  }

  function contentPanelFromTarget(target){
    if (!target || !target.closest) return null;
    const panel = target.closest("#dmBlock, #battlesBlock, #eventsBlock");
    if (!panel || panel.id !== PANELS[activeKey]) return null;
    if (!target.closest(".panelBody")) return null;
    return panel;
  }

  function startSwipe(event){
    if (!isMobile() || (event.pointerType !== "touch" && event.pointerType !== "pen")) return;
    if (event.isPrimary === false || event.button != null && event.button !== 0) return;
    if (suppressedClick) suppressedClick = null;
    const panel = contentPanelFromTarget(event.target);
    if (!panel) return;
    if (isInteractiveStart(event.target, panel)) {
      // A horizontal drag that starts on an action/control is not tab navigation,
      // but it must not fall through as an accidental activation click either.
      blockedActionGesture = { id: event.pointerId, target: event.target, x: event.clientX, y: event.clientY };
      return;
    }
    gesture = { id: event.pointerId, panel, target: event.target, x: event.clientX, y: event.clientY, cancelled: false };
  }

  function moveSwipe(event){
    if (blockedActionGesture && event.pointerId === blockedActionGesture.id) return;
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (Math.abs(dy) > 12 && Math.abs(dy) >= Math.abs(dx)) {
      gesture.cancelled = true;
      return;
    }
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.15 && isHorizontalScroller(gesture.target, gesture.panel)) {
      gesture.cancelled = true;
    }
  }

  function endSwipe(event){
    if (blockedActionGesture && event.pointerId === blockedActionGesture.id) {
      const currentBlocked = blockedActionGesture;
      blockedActionGesture = null;
      const dx = event.clientX - currentBlocked.x;
      const dy = event.clientY - currentBlocked.y;
      if (Math.abs(dx) >= 56 && Math.abs(dx) > Math.abs(dy) * 1.25) {
        suppressedClick = { target: currentBlocked.target, until: Date.now() + 700 };
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      return;
    }
    if (!gesture || event.pointerId !== gesture.id) return;
    const current = gesture;
    gesture = null;
    if (current.cancelled) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (Math.abs(dx) < 56 || Math.abs(dx) <= Math.abs(dy) * 1.25) return;
    const index = ORDER.indexOf(activeKey);
    const nextIndex = dx < 0 ? Math.min(ORDER.length - 1, index + 1) : Math.max(0, index - 1);
    if (nextIndex === index) return;
    selectTab(ORDER[nextIndex], false);
    suppressedClick = { target: current.target, until: Date.now() + 700 };
    event.preventDefault();
  }

  function resetSwipe(){ gesture = null; blockedActionGesture = null; }

  function hintTarget(target){
    if (!isMobile() || !target || !target.closest) return null;
    const found = target.closest("[data-stat-hover-hint],[data-stat-cap-hint],[data-toast-hover-hint],[title]");
    if (!found || found.closest(".statToast,.lotteryToast,#statToastHost")) return null;
    if (found.matches("input,textarea,select,[contenteditable='true']")) return null;
    const value = found.getAttribute("data-stat-cap-hint") || found.getAttribute("data-stat-hover-hint") || found.getAttribute("data-toast-hover-hint") || found.getAttribute("title") || "";
    return value.trim() ? { element: found, text: value.trim() } : null;
  }

  function ensureTooltip(){
    if (tooltip && tooltip.isConnected) return tooltip;
    tooltip = document.createElement("div");
    tooltip.id = "mobileLongPressHint";
    tooltip.className = "mobileLongPressHint";
    tooltip.setAttribute("role", "tooltip");
    tooltip.setAttribute("aria-hidden", "true");
    document.body.appendChild(tooltip);
    return tooltip;
  }

  function hideLongPressHint(){
    if (visibleLongPressTarget) {
      const prior = visibleLongPressTarget.getAttribute("data-mobile-prior-describedby");
      if (prior == null) visibleLongPressTarget.removeAttribute("aria-describedby");
      else visibleLongPressTarget.setAttribute("aria-describedby", prior);
      visibleLongPressTarget.removeAttribute("data-mobile-prior-describedby");
    }
    visibleLongPressTarget = null;
    if (tooltip) {
      tooltip.classList.remove("is-visible");
      tooltip.setAttribute("aria-hidden", "true");
    }
  }

  function showLongPressHint(entry){
    const element = entry.element;
    const bubble = ensureTooltip();
    if (visibleLongPressTarget && visibleLongPressTarget !== element) hideLongPressHint();
    visibleLongPressTarget = element;
    if (!element.hasAttribute("data-mobile-prior-describedby")) {
      element.setAttribute("data-mobile-prior-describedby", element.getAttribute("aria-describedby") || "");
    }
    element.setAttribute("aria-describedby", bubble.id);
    bubble.textContent = entry.text;
    bubble.classList.add("is-visible");
    bubble.setAttribute("aria-hidden", "false");
    const rect = element.getBoundingClientRect();
    const box = bubble.getBoundingClientRect();
    const left = Math.max(8, Math.min(window.innerWidth - box.width - 8, rect.left + rect.width / 2 - box.width / 2));
    const top = rect.top - box.height - 8 >= 8 ? rect.top - box.height - 8 : Math.min(window.innerHeight - box.height - 8, rect.bottom + 8);
    bubble.style.left = `${Math.round(left)}px`;
    bubble.style.top = `${Math.round(Math.max(8, top))}px`;
  }

  function startLongPress(event){
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
    if (longPress) clearTimeout(longPress.timer);
    if (visibleLongPressTarget && !visibleLongPressTarget.contains(event.target)) hideLongPressHint();
    const entry = hintTarget(event.target);
    if (!entry) return;
    const current = { id: event.pointerId, target: entry.element, entry, x: event.clientX, y: event.clientY, fired: false, timer: null };
    current.timer = window.setTimeout(() => {
      if (longPress !== current) return;
      current.fired = true;
      showLongPressHint(entry);
    }, 520);
    longPress = current;
  }

  function moveLongPress(event){
    if (!longPress || event.pointerId !== longPress.id) return;
    if (Math.hypot(event.clientX - longPress.x, event.clientY - longPress.y) > 9) {
      clearTimeout(longPress.timer);
      longPress = null;
    }
  }

  function endLongPress(event){
    if (!longPress || event.pointerId !== longPress.id) return;
    const current = longPress;
    clearTimeout(current.timer);
    longPress = null;
    if (current.fired) {
      suppressedClick = { target: current.target, until: Date.now() + 700 };
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  function onClickCapture(event){
    if (!suppressedClick) return;
    const blocked = Date.now() <= suppressedClick.until && (suppressedClick.target === event.target || suppressedClick.target.contains(event.target) || event.target.contains(suppressedClick.target));
    suppressedClick = null;
    if (!blocked) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function install(){
    if (initialized) return;
    const tabs = document.getElementById("mobilePanelTabs");
    const blocks = document.getElementById("blocks");
    if (!tabs || !blocks || ORDER.some((key) => !buttonElement(key) || !panelElement(key))) return;
    initialized = true;
    for (const key of ORDER) {
      const button = buttonElement(key);
      button.addEventListener("click", () => selectTab(key, false));
      button.addEventListener("keydown", onTabKeydown);
    }
    tabs.addEventListener("pointerdown", (event) => { if (event.pointerType === "touch" || event.pointerType === "pen") hideLongPressHint(); });
    document.addEventListener("pointerdown", startSwipe, true);
    document.addEventListener("pointermove", moveSwipe, { capture: true, passive: true });
    document.addEventListener("pointerup", endSwipe, true);
    document.addEventListener("pointercancel", resetSwipe, true);
    document.addEventListener("lostpointercapture", resetSwipe, true);
    document.addEventListener("click", onClickCapture, true);
    document.addEventListener("pointerdown", startLongPress, true);
    document.addEventListener("pointermove", moveLongPress, true);
    document.addEventListener("pointerup", endLongPress, true);
    document.addEventListener("pointercancel", () => { if (longPress) clearTimeout(longPress.timer); longPress = null; }, true);
    document.addEventListener("lostpointercapture", () => { if (longPress) clearTimeout(longPress.timer); longPress = null; }, true);
    document.addEventListener("contextmenu", (event) => {
      if (hintTarget(event.target)) event.preventDefault();
    }, true);
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && visibleLongPressTarget) hideLongPressHint(); }, true);
    if (typeof MutationObserver === "function") {
      countObserver = new MutationObserver(updateCounters);
      for (const id of ["dmHeaderCount", "battleCountWrapper", "eventsHeaderCount"]) {
        const node = document.getElementById(id);
        if (node) countObserver.observe(node, { childList: true, characterData: true, subtree: true });
      }
    }
    syncA11yAndVisibility();
    const mq = window.matchMedia ? window.matchMedia(QUERY) : null;
    const onViewportChange = () => {
      syncA11yAndVisibility();
      if (Game.UI && typeof Game.UI.ensureMobilePinnedChatLayout === "function") Game.UI.ensureMobilePinnedChatLayout();
    };
    if (mq && mq.addEventListener) mq.addEventListener("change", onViewportChange);
    else if (mq && mq.addListener) mq.addListener(onViewportChange);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("pageshow", onViewportChange);
  }

  Game.__DEV = Game.__DEV || {};
  Game.__DEV.mobileInterface = Object.freeze({
    getActiveTab: () => activeKey,
    selectTab,
    updateCounters,
    isMobile,
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})(window.Game);
