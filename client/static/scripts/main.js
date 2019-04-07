const API_URL = 'http://0.0.0.0:1337/api/v1'
const STREAM_URL = 'http://0.0.0.0:1338'
const WATCHD_URL = 'http://0.0.0.0:1338/watchd'

async function list() {
  try {
    let response = await fetch(`${STREAM_URL}`)
    let json = await response.json()
    return json
  } catch (error) {
    console.error(error)
  }
}

async function load(filename) {
  try {
    let response = await fetch(`${WATCHD_URL}/${filename}`)
    let file = await response.text()
    return file
  } catch (error) {
    console.error(error)
  }
}

let syncing = true

async function main() {
  let pieces = window.location.href.split('/')
  const repoDir = pieces[pieces.length-1]
  //const extension = 'python'

  const elCode = document.querySelector('#source pre code')
  elCode.onselectstart = function() {
    syncing = false
  }
  elCode.onmouseup = function() {
    if (!syncing) {
      document.execCommand('copy')
      syncing = true
    }
  }

  const elTree = document.querySelector('#maindir')

  setInterval(async () => {
    if (syncing) {
      let filenames = await list()
      traverse(filenames, elTree)

      let file = await load(`${repoDir}/STREAMD.md`)
      elCode.innerHTML = file
    }
  }, 1000)
}

main()
