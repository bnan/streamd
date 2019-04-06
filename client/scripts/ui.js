
var toggler = document.getElementsByClassName("caret");
var i;

var tree = 
[
  {
    "name": "MainFolder",
    "children": [
      {
        "name": "hasChild",
        "children": [
          {
            "name": "leaf",
            "children": []
          }
        ]
      },
      {
        "name": "hasChild2",
        "children": [
          {
            "name": "leaf2",
            "children": []
          },
          {
            "name": "leaf3",
            "children": []
          }
        ]
      },
    ]
  }
];

printTree(tree, '/');

function printTree(tree, slug){
  var maindir = document.getElementById('maindir');
  var ul = document.createElement("ul");
  var li = document.createElement("li");
  var span = document.createElement("span");
  slug = slug || '/';
  
  for(var i = 0; i < tree.length; i++) {
    

    ul.setAttribute('class','nested');
	li.innerHTML=tree[i].name;
	ul.appendChild(li);
	maindir.appendChild(ul);

    console.log(slug+tree[i].name + '/');
    if(tree[i].children.length){
      
      	
      console.log(tree[i].children)
      printTree(tree[i].children, slug+tree[i].name + '/')
    	
    }
  }
}

for (i = 0; i < toggler.length; i++) {
  	toggler[i].addEventListener("click", function() {
    	this.parentElement.querySelector(".nested").classList.toggle("active");
    	this.classList.toggle("caret-down");
  });
}