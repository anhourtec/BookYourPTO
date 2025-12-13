// server/api/github-stars.get.ts
export default defineEventHandler(async () => {
  const REPO = 'anhourtec/BookYourPTO'

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        // Optional but recommended if you add a token later
        // Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
      }
    })

    if (!res.ok) {
      return { stars: 0 }
    }

    const data = await res.json()

    return {
      stars: data.stargazers_count ?? 0
    }
  } catch (err) {
    return { stars: 0 }
  }
})
