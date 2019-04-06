const API_URL = 'http://0.0.0.0:1337/api/v1'
const STREAM_URL = 'http://0.0.0.0:1338'
const WATCHD_URL = 'http://0.0.0.0:1338/watchd'

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

async function list(stream) {
  try {
    let response = await fetch(`${STREAM_URL}/`)
    let json = await response.json()
    console.log('list', json)
    return json.files
  } catch (error) {
    console.error(error)
  }
}

async function load(stream) {
  try {
    let response = await fetch(`${WATCHD_URL}/${stream}`)
    let text = await response.text()
    return text
  } catch (error) {
    console.error(error)
  }
}

async function main() {
  let pieces = window.location.href.split('/')
  const stream = pieces[pieces.length-1]
  const extension = 'python'

  const el = document.querySelector('#source pre code')
  el.classList.add(`language-${extension}`)

  setInterval(async () => {
    let file = await load(stream+'/README.md')
    el.innerHTML = file
  }, 2000)
}

main()
