const publicRoutes = new Set([
  "/",
  "/roadmap/",
  "/chapters/http-as-a-state-machine/",
  "/chapters/routing-and-request-dispatch/",
]);

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    const pathname = new URL(request.url).pathname;
    const canonicalPath = pathname === "/" || pathname.endsWith("/") ? pathname : `${pathname}/`;
    const isPublicRoute = publicRoutes.has(canonicalPath);

    if (response.status !== 404 || !acceptsHtml || !isPublicRoute || !["GET", "HEAD"].includes(request.method)) {
      return response;
    }

    const indexUrl = new URL(request.url);
    indexUrl.pathname = "/index.html";
    indexUrl.search = "";
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};
