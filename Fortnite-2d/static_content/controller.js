var stage=null;
var view = null;
var pausedInterval = null;
var interval=null;
var paused = false;
var authenticated=false;
var credentials={ "username": "", "password":"" , "skill":"", "birthday":""};
function setupGame(){
	stage=new Stage(document.getElementById('stage'));
	// https://javascript.info/keyboard-events
	document.addEventListener('keydown', moveByKey);
    document.addEventListener('keyup', stopCharacter);
	document.addEventListener('mousemove', faceToMouse);
	document.addEventListener('mouseup', fire);
}
function startGame(){
	interval=setInterval(function(){ stage.step(); stage.draw(); },50);
}
function pauseGame(){
	pausedInterval = interval;
	clearInterval(interval);
	interval=null;
}
function fire(event) {
	if (typeof event === 'object') {
		switch (event.button) {
		  case 0:
			var x = (event.clientX - stage.canvas.offsetLeft) - stage.player.x - stage.player.start_x;
			var y = (event.clientY - stage.canvas.offsetTop) - stage.player.y - stage.player.start_y;
			direction = new Pair(x, y);
			stage.player.fire(direction);
			// stage.player.update();
			break;
		}
	}	
}
function moveByKey(event){
	var key = event.key;
	var moveMap = { 
		'a': new Pair(-5,0),
		's': new Pair(0,5),
		'd': new Pair(5,0),
		'w': new Pair(0,-5),
	};
	if(key in moveMap){
		stage.player.velocity=moveMap[key];
		// stage.player.update();
	}
	if(key == 'Escape'){
		if(paused){
			startGame();
			paused = false;
		}else{
			pauseGame();
			paused = true;
		}
	}
	if(key == 'r'){
		if(stage.enemies == 0){
			addScore(stage.player.score);
		}
		stage=new Stage(document.getElementById('stage'));
	}
}

function addScore(score){
	var info =  { 
		username: credentials.username,
		score: score
	};
	$.ajax({
		method: "POST",
		url: "/api/score",
		contentType: "application/json",	
		dataType:"json",
		processData:true,
		data: JSON.stringify(info)
	}).done(function(data, text_status, jqXHR){
		console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
	}).fail(function(err){
		console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
		alert(JSON.stringify(err.responseJSON.error));
	});
}

function stopCharacter(event){
        var key = event.key;
        var moveMap = { 
		'a': new Pair(0,0),
		's': new Pair(0,0),
		'd': new Pair(0,0),
		'w': new Pair(0,0)
	};
	if(key in moveMap){
		stage.player.velocity=moveMap[key];
		// stage.player.update();
	}
}
// function mouseMove(event){
// 	stage.player.x_direction = event.clientX - stage.player.x_direction;
// 	stage.player.y_direction = event.clientY - stage.player.y_direction;
// }

function mouseCanvas(event){
	var rect = stage.canvas.getBoundingClientRect();
	var mouse_y=event.clientY - rect.top;
	var mouse_x=event.clientX - rect.left;
	return [mouse_x,mouse_y];
}

function faceToMouse(event){
	var mouse_xy=mouseCanvas(event);
	stage.player.rotate(mouse_xy[0],mouse_xy[1]);	
}

function login(){
	credentials =  { 
		"username": $("#username").val(), 
		"password": $("#password").val() 
	};

        $.ajax({
                method: "POST",
                url: "/api/auth/login",
                data: JSON.stringify({}),
				headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
				authenticated = true;
				$("#ui_login").hide();
				$("#ui_register").hide();
				$("#ui_profile").hide();
				$("#ui_instructions").hide();
				$("#ui_leaderboard").hide();
				$("#ui_nav").show();
				$("#ui_score").show();
				$("#ui_play").show();


		setupGame();
		startGame();

        }).fail(function(err){
				alert(JSON.stringify(err.responseJSON.error));
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}

function register(){
	var skill = "";
	if(document.getElementById('beginner').checked){
		skill = document.getElementById('beginner').value;
	}else if(document.getElementById('intermediate').checked){
		skill = document.getElementById('intermediate').value;
	}else if(document.getElementById('advanced').checked){
		skill = document.getElementById('advanced').value;
	}

	var registration =  { 
		username: $("#usr").val(), 
		password: $("#psw").val(),
		skill: skill, 
		birthday: new Date($("#date").val()).toUTCString()	
	};

	if ($("#psw").val().trim() != $("#psw-repeat").val().trim()){
		alert("Passwords do not match.");
	} else {
		$.ajax({
			method: "POST",
			url: "/api/register/",
			contentType: "application/json",	
			dataType:"json",
			processData:true,
			data: JSON.stringify(registration)
		}).done(function(data, text_status, jqXHR){
			console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
			$("#ui_nav").hide();
			$("#ui_register").hide();
			$("#ui_leaderboard").hide();
			$("#ui_instructions").hide();
        	$("#ui_login").show();
		}).fail(function(err){
			console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
			alert(JSON.stringify(err.responseJSON.error));
		});
	}	
}

function update(){
	var skill = "";
	var new_pass = "";
	if($("#new_psw").val() == ""){
		new_pass = credentials.password;
	}else{
		new_pass=$("#new_psw").val();
	}

	if(document.getElementById('profile_beginner').checked){
		skill = document.getElementById('profile_beginner').value;
	}else if(document.getElementById('profile_intermediate').checked){
		skill = document.getElementById('profile_intermediate').value;
	}else if(document.getElementById('profile_advanced').checked){
		skill = document.getElementById('profile_advanced').value;
	}

	var registration =  { 
		username: credentials.username, 
		password: new_pass,
		skill: skill, 
		birthday: new Date($("#profile_date").val()).toUTCString()
	};

	if ($("#new_psw").val().trim() != $("#new_psw-repeat").val().trim()){
		$("#error_msg").html("Passwords do not match.");
	} else {
		credentials.password=new_pass;
		$.ajax({
			method: "POST",
			url: "/api/update",
			contentType: "application/json",	
			dataType:"json",
			processData:true,
			data: JSON.stringify(registration)
		}).done(function(data, text_status, jqXHR){
			console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
		}).fail(function(err){
			console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
			alert(JSON.stringify(err.responseJSON.error));
		});
	}	
}

function delete_account(){
	var info =  { 
		username: credentials.username
	};
	$.ajax({
		method: "POST",
		url: "/api/delete",
		contentType: "application/json",	
		dataType:"json",
		processData:true,
		data: JSON.stringify(info)
	}).done(function(data, text_status, jqXHR){
		console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
		$("#ui_login").show();
		$("#ui_profile").hide();
		$("#ui_leaderboard").hide();
		$("#ui_instructions").hide();
		$("#ui_nav").hide();
		$("#ui_play").hide();
	}).fail(function(err){
		console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
		alert(JSON.stringify(err.responseJSON.error));
	});
}

function login_change(){
	$("#ui_leaderboard").hide();
	$("#ui_nav").hide();
	$("#ui_register").hide();
	$("#ui_instructions").hide();
	$("#ui_login").show();
}

function register_change(){
	$("#ui_leaderboard").hide();
	$("#ui_nav").hide();
	$("#ui_login").hide();
	$("#ui_instructions").hide();
    $("#ui_register").show();
}
function game_change(){
	$("#ui_leaderboard").hide();
	$("#ui_login").hide();
	$("#ui_profile").hide();
	$("#ui_instructions").hide();
	$("#ui_nav").show();
	$("#ui_score").show();
	$("#ui_play").show();
}
function profile_change(){
	$("#ui_leaderboard").hide();
	$("#ui_login").hide();
	$("#ui_nav").show();
	$("#ui_instructions").hide();
	$("#ui_profile").show();
	$("#ui_play").hide();
	document.getElementById('profile_username').innerHTML = credentials.username;

	var info =  { 
		username: credentials.username
	};
	$.ajax({
		method: "POST",
		url: "/api/info",
		contentType: "application/json",	
		dataType:"json",
		processData:true,
		data: JSON.stringify(info)
	}).done(function(data, text_status, jqXHR){
		console.log(jqXHR.status+" "+text_status);
		var info = JSON.parse(data);
		if(info.skill == "beginner"){
			document.getElementById('profile_beginner').checked = true;
		}else if(info.skill == "intermediate"){
			document.getElementById('profile_intermediate').checked = true;
		}else if(info.skill == "advanced"){
			document.getElementById('profile_advanced').checked = true;
		}
		var d = new Date(info.birthday);
		if(d.getMonth() < 10){
			document.getElementById('profile_date').value = d.getFullYear() + "-0"+d.getMonth()+"-"+d.getDate();
		}else{
			document.getElementById('profile_date').value = d.getFullYear() + "-"+d.getMonth()+"-"+d.getDate();
		}
		document.getElementById('profile_score').innerHTML = info.score;
	}).fail(function(err){
		console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
		alert(JSON.stringify(err.responseJSON.error));
	});
}

function leaderboard_change(){
	$("#ui_login").hide();
	$("#ui_profile").hide();
	$("#ui_instructions").hide();
	$("#ui_leaderboard").show();
	$("#ui_nav").show();
	$("#ui_play").hide();

	$.ajax({
		method: "POST",
		url: "/api/leaderboard",
		contentType: "application/json",	
		dataType:"json",
		processData:true,
		data: "{}"
	}).done(function(data, text_status, jqXHR){
		console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
		var info = JSON.parse(data);
		const table = document.getElementById("leaderboard_body");
		$('#leaderboard_body').empty();
		for(var i=0; i < info.scores.length; i++){
			let row = table.insertRow();
			let un = row.insertCell(0);
			un.innerHTML = info.scores[i].username;
			let sc = row.insertCell(1);
			sc.innerHTML = info.scores[i].score;
		}
	}).fail(function(err){
		console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
		alert(JSON.stringify(err.responseJSON.error));
	});
}

function instructions_change(){
	$("#ui_login").hide();
	$("#ui_instructions").show();
	$("#ui_profile").hide();
	$("#ui_leaderboard").hide();
	$("#ui_nav").show();
	$("#ui_play").hide();
}

function logout_change(){
	clearInterval(interval);
	setupGame();
	$("#ui_login").show();
	$("#ui_profile").hide();
	$("#ui_instructions").hide();
	$("#ui_leaderboard").hide();
	$("#ui_nav").hide();
	$("#ui_play").hide();
}

// Using the /api/auth/test route, must send authorization header
function test(){
        $.ajax({
                method: "GET",
                url: "/api/auth/test",
                data: {},
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
				alert(JSON.stringify(err.responseJSON.error));
        });
}

$(function(){
        // Setup all events here and display the appropriate UI
        $("#loginSubmit").on('click',function(){ login(); });
		$("#register").on('click',function(){ register(); });
		$("#update").on('click',function(){ update(); });
		$("#delete").on('click',function(){ delete_account(); });
		$("#register_change").on('click',function(){ register_change(); });
		$("#instructions_change").on('click',function(){ instructions_change(); });
		$("#login_change").on('click',function(){ login_change(); });
		$("#game_change").on('click',function(){ game_change(); });
		$("#profile_change").on('click',function(){ profile_change(); });
		$("#leaderboard_change").on('click',function(){ leaderboard_change(); });
		$("#logout_change").on('click',function(){ logout_change(); });
		$("#ui_nav").hide();
		$("#ui_register").hide();
		$("#ui_leaderboard").hide();
		$("#ui_profile").hide();
		$("#ui_instructions").hide();
        $("#ui_login").show();
        $("#ui_play").hide();
});

