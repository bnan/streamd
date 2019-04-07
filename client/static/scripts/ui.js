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
    ul.innerHTML = ''
    ul.appendChild(li);

    for(var i = 0; i < obj["contents"].length; i++) {
        let new_obj = obj["contents"][i];
<<<<<<< HEAD
        console.log(new_obj);
        console.log("shit");
=======
>>>>>>> 85226d6d1f9e6d4ea2960cdd970e59af6e251c9f
        var new_ul= document.createElement("ul");
        ul.appendChild(new_ul);
        traverse(new_obj, new_ul);
    }

}
var slider = document.getElementById("myRange");

slider.oninput = function() {
  console.log(this.value);
}
