export const archive = async (link: string) => {
  const url = 'https://web.archive.org/save/' + link

  try {
    const response = await fetch(url)
    const data = response.headers.get('content-location')
    return 'https://web.archive.org' + data
  } catch (error) {
    throw error
  }
}
