
var toggler = document.getElementsByClassName("caret");
var i;
var maindir= document.getElementById("maindir");



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
traverse(data);
function traverse(obj){
	
  for (let k in obj) {
    if (obj[k] && typeof obj[k] === 'object') {
      traverse(obj[k])
    } else {
    	if (obj.contents.length!=0) {
    		var ul= document.createElement("ul");
    		//ul.setAttribute('class','nested active');
    		ul.innerHTML= obj[k];
    		maindir.appendChild(ul);

    		//console.log(obj[k]);
    	}
    	else{
    		var li= document.createElement("li");

    		li.innerHTML= obj[k];
    		console.log(obj[k]);
    		//ul.appendChild(li);

    	}
    }
  }
}
for (i = 0; i < toggler.length; i++) {
  	toggler[i].addEventListener("click", function() {
    	this.parentElement.querySelector(".nested").classList.toggle("active");
    	this.classList.toggle("caret-down");
  });
}