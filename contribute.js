document.getElementById("submitPerson").addEventListener("click", function(){
	let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if (this.readyState == 4){
	  		alert(req.responseText);
	  		if(this.status == 201){
	  			document.getElementById("personName").value = "";
	  			window.location.reload();
	  		}
	    }
	}

	req.open("POST", "http://localhost:3000/people/");
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify({"name": document.getElementById("personName").value}));
});

function showPeople(e){
	let people = document.getElementById('people');
	if(e.target.value.length >= 1){
   		let req = new XMLHttpRequest();
		req.onreadystatechange = function(){
			if (this.readyState == 4 && this.status == 200){
				people.innerHTML = '';
				names = JSON.parse(req.response)
				for(name of names){
					let option = document.createElement('option');
					option.value = name;
					people.appendChild(option)
				}
	  		}
		}
		nameIncludes = e.target.value.replaceAll(' ', '+')
		req.open("GET", `http://localhost:3000/people?nameIncludes=${nameIncludes}`);
		req.send();
	}else{
		people.innerHTML = '';
	}
}

document.querySelector("#directorInput").addEventListener('keyup', showPeople)
document.querySelector("#writerInput").addEventListener('keyup', showPeople)
document.querySelector("#actorInput").addEventListener('keyup', showPeople)

let movie = {director: [], writer: [], actor: [], genre: []};

document.getElementById("submitMovie").addEventListener("click", function(){
	let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 201){
	  		alert(req.responseText);
	  		window.location.reload();
	    }else if(this.readyState == 4){
	    	alert(req.responseText);
	    }
	}

	movie.title = document.getElementById("titleInput").value;
	movie.runtime = document.getElementById("runtimeInput").value;
	movie.year = document.getElementById("yearInput").value;
	movie.plot = [document.getElementById("plotInput").value];

	console.log(movie);
	req.open("POST", "http://localhost:3000/movies/");
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(movie));
});

document.getElementById("addDirector").addEventListener("click", function(){
	let match = people.filter(person => person.name.localeCompare(document.getElementById("directorInput").value) == 0);
	if(match.length != 0){
		dirCell = document.getElementById("directorsCell")
		dirCell.prepend(document.createElement("br"));
		dirCell.prepend(document.createTextNode(match[0].name));
		document.getElementById("directorInput").value = "";

		movie.director.push(match[0]._id);
		console.log(movie);
	}
});

document.getElementById("addWriter").addEventListener("click", function(){
	let match = people.filter(person => person.name.localeCompare(document.getElementById("writerInput").value) == 0);
	if(match.length != 0){
		writerCell = document.getElementById("writersCell")
		writerCell.prepend(document.createElement("br"));
		writerCell.prepend(document.createTextNode(match[0].name));
		document.getElementById("writerInput").value = "";

		movie.writer.push(match[0]._id);
		console.log(movie);
	}
});

document.getElementById("addActor").addEventListener("click", function(){
	let match = people.filter(person => person.name.localeCompare(document.getElementById("actorInput").value) == 0);
	if(match.length != 0){
		actorsCell = document.getElementById("actorsCell")
		actorsCell.prepend(document.createElement("br"));
		actorsCell.prepend(document.createTextNode(match[0].name));
		document.getElementById("actorInput").value = "";

		movie.actor.push(match[0]._id);
		console.log(movie);
	}
});

document.getElementById("addGenre").addEventListener("click", function(){
	if(document.getElementById("genreInput").value != ""){
		genresCell = document.getElementById("genresCell");
		genresCell.prepend(document.createElement("br"));
		genresCell.prepend(document.createTextNode(document.getElementById("genreInput").value));

		movie.genre.push(document.getElementById("genreInput").value);
		document.getElementById("genreInput").value = "";
		console.log(movie);
	}
});

