export async function GET() {
  const body = `User-agent: *
Allow: /

Sitemap: http://localhost:4321/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
