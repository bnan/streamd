const API_URL = 'http://0.0.0.0:1337/api/v1'
const STREAM_URL = 'http://0.0.0.0:1338'
const WATCHD_URL = 'http://0.0.0.0:1338/watchd'

async function send_comment(remote_id, thread, username, comment){
    let data = JSON.stringify({
        username:username,
        text:comment
    })


    const otherParams={
        headers:{
            "content-type":"application/json; charset=UTF-8"
        },
        body:data,
        method:"POST"
    };

    try {
        let response = await fetch(`${API_URL}/comments/${remote_id}/${thread}`, otherParams)
        let json = await response.json()
        console.log(json)
    } catch (error) {
        console.error(error)
    }
}

async function list(repoDir) {
  try {
    let response = await fetch(`${STREAM_URL}/files/${repoDir}`)
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
    document.querySelector('#source pre code').innerHTML = file
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

  let file = await load(`${repoDir}/STREAMD.md`)

  setInterval(async () => {
    if (syncing) {
      let filenames = await list(repoDir)
      console.log(filenames)
      traverse(filenames, elTree)
    }
  }, 1000)
}

main()
