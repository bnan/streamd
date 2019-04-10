var toggler = document.getElementsByClassName("caret");
var i;
var maindir= document.getElementById("maindir");
maindir.setAttribute("class","nested");
maindir.setAttribute("class","active");

var data = {
    "name": "root",
    "contents": [
        {
            "name": "A",
            "contents": [
                {
                    "name": "fileA1",
                    "contents": [] }
            ]
        },
        {
            "name": "B",
            "contents": [
                {
                    "name": "dirB1",
                    "contents": [
                        {
                            "name": "fileBB1",
                            "contents": []
                        }
                    ]
                },
                {
                    "name": "fileB1",
                    "contents": []
                }
            ]
        }
    ]
};

function traverse(obj, ul){
    var span =document.createElement("span");
    //span.setAttribute("class","caret");

    var li= document.createElement("li");
    span.innerHTML= obj["name"];
    li.appendChild(span)
    if(obj['contents'].length == 0) {
      li.addEventListener('click', async (e) => {
        //console.log(e.target.textContent)
        let pieces = window.location.href.split('/')
        let repoDir = pieces[pieces.length-1]
        await load(`${repoDir}/${e.target.textContent}`)
        currentFile = e.target.textContent
      })
    }
    ul.innerHTML = ''
    ul.appendChild(li);

    for(var i = 0; i < obj["contents"].length; i++) {
        let new_obj = obj["contents"][i];
        var new_ul= document.createElement("ul");
        ul.appendChild(new_ul);
        traverse(new_obj, new_ul);
    }

}

function sendUsername(username_new) {
    document.getElementById("modal-control").checked = false;
}

function sendText(remote_id) {
    //console.log("send text")
    //let username =  document.getElementById("username_text").value;
    let username = "demo";
    //console.log(username)
    if( username == ""){
        //console.log("no name")
        document.getElementById("modal-control").checked = true;
        return;
    }

    //thread = document.getElementById("msg_commit").value;
    thread = "demo"
    //console.log(thread)

    text = document.getElementById("msg_text").value;
    //console.log(text)

    send_comment(remote_id, thread, username, text)
}

function changeCommit(e) {
    document.getElementById("msg_commit").value = e;
}

var slider = document.getElementById("myRange");

slider.oninput = async function() {
  //console.log('commits', commitsList)
  let idx = parseInt(commitsList.commits.length * parseInt(this.value)/100)
  //console.log('idx', this.value, commitsList.commits.length, idx)
  await commit(repoDir, commitsList.commits[idx])
  traverse(filenames, document.querySelector('#maindir'))
  await load(`${repoDir}/${currentFile}`)
}


var syncbtn = document.getElementById("syncbtn");
syncbtn.onclick = async function() {
  let res = await sync(repoDir)
  await load(`${repoDir}/${currentFile}`)
  slider.value = 100
  traverse(filenames, document.querySelector('#maindir'))
}
