const API_URL = 'http://0.0.0.0:1337/api/v1'
const STREAM_URL = 'http://0.0.0.0:1338/watchd/'

async function comment(repository, comment) {
  const data = {
    'repository': repository,
    'comment': comment,
  }

  try {
    let response = await fetch(`${API_URL}/comment/${repository}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    })

    let json = await response.json()
    return json.error
  } catch (error) {
    console.error(error)
  }
}

async function load(file) {
  try {
    let response = await fetch(`${STREAM_URL}/${file}`)
    let text = await response.text()
    return text
  } catch (error) {
    console.error(error)
  }
}

async function main() {
  let filename = window.location.search.substring(1)
  console.log('filename', filename)

  let pieces = filename.split('.')
  let extension = pieces[pieces.length-1]
  console.log('extension', extension)

  const el = document.querySelector('#source pre code')
  el.classList.add(`language-${extension}`)

  setInterval(async () => {
    let file = await load(filename)
    el.innerHTML = file
  }, 500)
}

main()
