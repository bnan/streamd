const API_URL = 'http://0.0.0.0:1337/api/v1'

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
    let response = await fetch(file)
    return response
  } catch (error) {
    console.error(error)
  }
}

async function main() {
  let file = window.location.search.substring(1)
  console.log('file', file)

  let response = await load(file)
  console.log('response', response)
}

main()
