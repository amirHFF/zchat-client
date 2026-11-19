import "./nativeTouchScroll.css";

/** Must match the media query in nativeTouchScroll.css. */
const TOUCH_QUERY = "(pointer: coarse)";
const SCROLLER_SELECTOR = ".cs-message-list__scroll-wrapper";
const TOUCH_EVENTS = ["touchstart", "touchmove", "touchend"] as const;

let installed = false;

/**
 * On touch screens, keep touch events inside a chatscope MessageList away from
 * perfect-scrollbar's own touch handlers, so only the browser scrolls the list
 * (see nativeTouchScroll.css). The listener runs in the capture phase on the
 * document, before the event reaches the scroller, and never cancels the
 * event: taps, clicks, text selection and native scrolling are unaffected.
 */
export function installNativeTouchScroll(): void {
  if (installed || typeof window === "undefined" || !window.matchMedia) return;
  installed = true;

  const touchScreen = window.matchMedia(TOUCH_QUERY);

  const stopLibraryTouchHandling = (event: Event) => {
    // Read on every event so it always agrees with the CSS media query.
    if (!touchScreen.matches) return;
    const target = event.target;
    if (target instanceof Element && target.closest(SCROLLER_SELECTOR)) {
      event.stopPropagation();
    }
  };

  for (const type of TOUCH_EVENTS) {
    document.addEventListener(type, stopLibraryTouchHandling, {
      capture: true,
      passive: true,
    });
  }
}
