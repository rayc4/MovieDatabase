document.getElementById("search").addEventListener("click", function(){
	let title = document.getElementById("title").value;
	let actor = document.getElementById("actor").value;
	let genre = document.getElementById("genre").value;

	window.location = `http://localhost:3000/movies?title=${title}&actor=${actor}&genre=${genre}&page=1`;
});