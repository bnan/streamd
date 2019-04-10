function traverse(obj, ul){
  var span = document.createElement("span");

  var li = document.createElement("li");
  span.innerHTML = obj["name"];
  li.appendChild(span)
  if(obj['contents'].length === 0) {
    li.addEventListener('click', async (e) => {
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
    var new_ul = document.createElement("ul");
    ul.appendChild(new_ul);
    traverse(new_obj, new_ul);
  }

}

function sendUsername(username_new) {
  document.getElementById("modal-control").checked = false;
}

function sendText(remote_id) {
  //let username =  document.getElementById("username_text").value;
  let username = "demo";
  if( username == ""){
    //console.log("no name")
    document.getElementById("modal-control").checked = true;
    return;
  }

  //thread = document.getElementById("msg_commit").value;
  thread = "demo"

  text = document.getElementById("msg_text").value;

  send_comment(remote_id, thread, username, text)
}

function changeCommit(e) {
  document.getElementById("msg_commit").value = e;
}

var slider = document.getElementById("myRange");

slider.oninput = async function() {
  let idx = parseInt(commitsList.commits.length * parseInt(this.value)/100)
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
