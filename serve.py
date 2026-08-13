#!/usr/bin/env python3
"""Local preview that behaves like GitHub Pages.

    python3 serve.py            # http://localhost:8000

Plain `python3 -m http.server` 404s every nav link, because the site links to
`./about` with no extension and GitHub Pages resolves that to `about.html`.
This adds the two rules that matter: extensionless paths fall back to `.html`,
and anything genuinely missing gets 404.html with a real 404 status.

Development only. It is never run in production — Pages serves the files.
"""
import http.server
import os
import sys

class Pages(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        local = super().translate_path(path)
        if os.path.isdir(local) or os.path.exists(local):
            return local
        with_html = local + ".html"
        return with_html if os.path.exists(with_html) else local

    def send_error(self, code, message=None, explain=None):
        if code == 404 and os.path.exists("404.html"):
            body = open("404.html", "rb").read()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)
            return
        super().send_error(code, message, explain)

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f"http://localhost:{port}  (ctrl-c to stop)")
    http.server.ThreadingHTTPServer(("", port), Pages).serve_forever()
