if(isSelf){
	document.getElementById("signOut").addEventListener("click", function(){
		let req = new XMLHttpRequest();
		req.onreadystatechange = function(){
			if (this.readyState == 4 && this.status == 200){
				if(!alert("Sign out success"))
					window.location.replace("http://localhost:3000/sign");
		    }
		}
		req.open("POST", "http://localhost:3000/sign/out");
		req.send();
	});
	document.getElementById("toggle").addEventListener("click", function(){
		let req = new XMLHttpRequest();
		req.onreadystatechange = function(){
			if (this.readyState == 4 && this.status == 200){
				if(!alert("Toggle Successful"))
					window.location.reload();
		    }
		}

		let username = document.getElementById("username").innerHTML;
		req.open("POST", `http://localhost:3000/users/${username}/isContr`);
		req.send();
	});
	var lis = Array.from(document.getElementById("watchlist").childNodes);

	lis.forEach(li => {
		li.childNodes[0].addEventListener("click", function(){
			let req = new XMLHttpRequest();
			req.onreadystatechange = function(){
				if (this.readyState == 4 && this.status == 200){
					if(!alert("Removed movie from watchlist"))
						window.location.reload();
			    }
			}
			req.open("POST", "http://localhost:3000/movies/"+li.childNodes[0].id+"/removeFromWatchlist");
			req.send();
		});
	});
}
else{
	if(isFollowed){
		document.getElementById("unfollow").addEventListener("click", function(){
			let req = new XMLHttpRequest();
			req.onreadystatechange = function(){
				if (this.readyState == 4 && this.status == 200){
					if(!alert("You have unfollowed this user."))
						window.location.reload();
			    }
			}
			req.open("POST", "http://localhost:3000/users/"+username+"/unfollow");
			req.send();
		});
	}else{
		document.getElementById("follow").addEventListener("click", function(){
			let req = new XMLHttpRequest();
			req.onreadystatechange = function(){
				if (this.readyState == 4){
					if(this.status == 401){
						alert("You are not logged in.");
					}
					else if(this.status == 200){
						if(!alert("You are now following this user."))
							window.location.reload();
					}
			    }
			}
			req.open("POST", "http://localhost:3000/users/"+username+"/follow");
			req.send();
		});
	}
}