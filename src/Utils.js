export function buildLocationURI(session) {
  return `location?session=${encodeURI(session)}`;
}

export function getSession() {
    const urlParams = new URLSearchParams(window.location.search);

    const session = urlParams.get("session");
    if (session && session.length > 0) {
        return session;
    }

    return "tesla";
}