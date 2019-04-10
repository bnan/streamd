const API_URL = 'http://0.0.0.0:1337/api/v1'
const STREAM_URL = 'http://0.0.0.0:1338'
const WATCHD_URL = 'http://0.0.0.0:1338/watchd'

async function updateChat(chatEl, repo_id){
    try {
        let response = await fetch(`${API_URL}/comments/${repo_id}`)
        let json = await response.json()

        for(let elem of Object.keys(json)  ) {
            for(let message of Object.keys(json[elem])  ) {
                var li = document.createElement("li");
                //var input = document.createElement("input");
                //var h5 = document.createElement("h5");
                var p = document.createElement("p");

                //h5.innerHTML = json[elem][message]["username"] +" @ ";
                p.innerHTML = json[elem][message]["text"];
                //input.setAttribute("type","button");
                //input.setAttribute("id","commit-text");
                //input.setAttribute("onClick","changeCommit(this.value)");
                //input.setAttribute("value",repo_id);

                //h5.appendChild(input);
                //li.appendChild(h5)
                li.appendChild(p)

                chatEl.appendChild(li);
            }
        }

    } catch (error) {
        console.error(error)
    }
}

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
    } catch (error) {
        console.error(error)
    }
}

async function commits(repoDir) {
    try {
        let response = await fetch(`${STREAM_URL}/commits/${repoDir}`)
        let json = await response.json()
        return json
    } catch (error) {
        console.error(error)
    }
}

async function commit(repoDir, commit) {
    try {
        let response = await fetch(`${STREAM_URL}/commit/${repoDir}/${commit}`)
    } catch (error) {
        console.error(error)
    }
}

async function sync(repoDir) {
    try {
        let response = await fetch(`${STREAM_URL}/commit/${repoDir}`)
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
let commitsList = {}
let repoDir = ''
let currentFile = ''
let filenames = []
let file = ''


async function main() {
    let pieces = window.location.href.split('/')
    repoDir = pieces[pieces.length-1]
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


    const elChat = document.querySelector('#ul-chat')

    currentFile = 'STREAMD.md'

    await sync(repoDir)
    file = await load(`${repoDir}/STREAMD.md`)

    setInterval(async () => {
        if (syncing) {
            filenames = await list(repoDir)
            file = await load(`${repoDir}/${currentFile}`)
            commitsList = await commits(repoDir)
            traverse(filenames, elTree)
        }
    }, 1000)
}

main()
