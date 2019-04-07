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
                    "contents": []
                }
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
        console.log(e.target.textContent)
        let pieces = window.location.href.split('/')
        let repoDir = pieces[pieces.length-1]
        await load(`${repoDir}/${e.target.textContent}`)
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
