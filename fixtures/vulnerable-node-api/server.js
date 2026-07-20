import http from "node:http";
export function authorize(headers) {
  return headers["x-role"] === "admin";
}
export function createServer() {
  return http.createServer((request, response) => {
    if (request.url === "/admin/report" && !authorize(request.headers)) {
      response.writeHead(403, { "content-type": "application/json" });
      return response.end('{"error":"forbidden"}');
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.end('{"items":[{"id":"fake-1"}]}');
  });
}
if (import.meta.url === `file://${process.argv[1]}`) createServer().listen(0, "127.0.0.1");
