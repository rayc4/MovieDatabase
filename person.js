let follow = document.getElementById("follow");
let unfollow = document.getElementById("unfollow");

if(follow){
	follow.addEventListener("click", function(){
		let req = new XMLHttpRequest();
		req.onreadystatechange = function(){
			if (this.readyState == 4){
				if(this.status == 200){
					if(!alert("You are now following this person."))
						window.location.reload();
		    	}else if(this.status == 401){
		    		alert("You are not logged in.");
		    	}
		    }
		}
		req.open("POST", "http://localhost:3000/people/"+id+"/follow");
		req.send();
	});
}

if(unfollow){
	unfollow.addEventListener("click", function(){
		let req = new XMLHttpRequest();
		req.onreadystatechange = function(){
			if (this.readyState == 4 && this.status == 200){
				if(!alert("You have unfollowed this person."))
					window.location.reload();
		    }
		}
		req.open("POST", "http://localhost:3000/people/"+id+"/unfollow");
		req.send();
	});
}