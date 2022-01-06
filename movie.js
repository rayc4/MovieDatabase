document.getElementById("basic").addEventListener("click", basicClicked);
document.getElementById("full").addEventListener("click", fullClicked);

if(inWatchlist)
	document.getElementById("removeFromWatchlist").addEventListener("click", removeFromWatchlist);
else
	document.getElementById("addToWatchlist").addEventListener("click", addToWatchlist);

function basicClicked(){
	let div = document.createElement("div");
	div.id = "revDiv";

	addNumInput(div);
	addSubmitButton(div);

	document.getElementById("revForm").append(div);
	div.scrollIntoView();
}

function fullClicked(){

	let div = document.createElement("div");
	div.id = "revDiv";

	addNumInput(div);

	let sumInput = document.createElement("input");
	sumInput.style.width = "50ch";
	sumInput.id = "sumInput";
	div.append(document.createTextNode("Summary: "));
	div.append(document.createElement("br"));
	div.append(sumInput);

	div.append(document.createElement("br"));
	div.append(document.createElement("br"));

	let fullInput = document.createElement("textarea");
	fullInput.rows = "10";
	fullInput.cols = "47";
	fullInput.id = "fullInput";
	div.append(document.createTextNode("Full Review: "));
	div.append(document.createElement("br"));
	div.append(fullInput);

	addSubmitButton(div);

	document.getElementById("revForm").append(div);
	div.scrollIntoView();
}

function addNumInput(div){
	if(document.getElementById("revDiv") != null)
		document.getElementById("revDiv").remove();

	let numInput = document.createElement("input");
	numInput.type = "number";
	numInput.min = 1;
	numInput.max = 10;
	numInput.id = "numInput";
	div.append(numInput);
	div.append(document.createTextNode("/10"));

	div.append(document.createElement("br"));
	div.append(document.createElement("br"));
}

function addSubmitButton(div){
	div.append(document.createElement("br"));
	div.append(document.createElement("br"));

	button = document.createElement("button");
	button.addEventListener("click", submit);
	button.type = "button";
	button.innerHTML = "Submit";
	div.append(button);
}

function addToWatchlist(){
	let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if (this.readyState == 4){
			if(this.status == 401){
				alert("You are not logged in");
			}else if(this.status == 200){
				if(!alert("Added movie to watchlist"))
					window.location.reload();
			}
	    }
	}
	req.open("POST", "http://localhost:3000/movies/"+id+"/addToWatchlist");
	req.send();
}

function removeFromWatchlist(){
	let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 200){
			if(!alert("Removed movie from watchlist"))
				window.location.reload();
	    }
	}
	req.open("POST", "http://localhost:3000/movies/"+id+"/removeFromWatchlist");
	req.send();
}

function submit(){
	let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if (this.readyState == 4){
			if(this.status == 401){
				alert("You are not logged in.");
			}
			else if(this.status == 400){
				alert(JSON.parse(req.responseText));
			}
			else if(this.status == 201){
				alert("Review Added.")
				window.location.reload();
			}
	    }
	}
	let review = {};
	review.isFull = document.getElementById("full").checked;
	review.movie = id;
	review.score = document.getElementById("numInput").value;
	if(review.isFull){
		review.summary = document.getElementById("sumInput").value;
		review.body = document.getElementById("fullInput").value;
	}
	req.open("POST", "http://localhost:3000/movies/"+id+"/reviews");
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(review));
}
