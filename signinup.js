document.getElementById("signIn").addEventListener("click", function(){
	let username = document.getElementById("usernameInput").value;
	let password = document.getElementById("passwordInput").value;
	
	let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if (this.readyState == 4){
			if(this.status == 200){
				if(!alert("Sign in success"))
					window.location.replace(`http://localhost:3000/users/${username}`);
			}else if(this.status == 401){
				alert("Login credentials invalid.");
			}
	    }

	}
	req.open("POST", "http://localhost:3000/sign/in");
	req.setRequestHeader("Content-type", "application/json");
	req.send(JSON.stringify({"username": username, "password": password}));
});

document.getElementById("signUp").addEventListener("click", function(){
	let username = document.getElementById("usernameInput").value;
	let password = document.getElementById("passwordInput").value;

	if(username.includes(" ") || password.includes(" ")){
		alert("Username and password cannot contain spaces.");
		return;
	}

	let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if (this.readyState == 4){
			if(this.status == 201){
				alert("Account successfully created. You can now sign in.");
			}else if(this.status == 409){
				alert("That username has been taken.");
			}else if(this.status == 400){
				alert("Username and password must contain at least one character.")
			}
	    }

	}
	req.open("POST", "http://localhost:3000/sign/up");
	req.setRequestHeader("Content-type", "application/json");
	req.send(JSON.stringify({"username": username, "password": password}));
});
