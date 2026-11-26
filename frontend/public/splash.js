// Show the logo splash only once per browser session.
// The first visit sets a flag; later loads in the same session add the
// "splash-seen" class, which hides the splash (see the styles in index.html).
// If session storage is blocked (e.g. some private modes) the splash just shows each time.
try {
  if (sessionStorage.getItem('tb-splash-seen')) {
    document.documentElement.classList.add('splash-seen');
  } else {
    sessionStorage.setItem('tb-splash-seen', '1');
  }
} catch {
  // Ignore: showing the splash again is harmless.
}
