export async function GET(req: Request) {
  const url = new URL(req.url)
  const params = url.searchParams

  const data = {
    message: "API Response",
    params: Object.fromEntries(params)
  }

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
} 