/*var bt = require('bing-translate/lib/bing-translate.js').init({
    client_id: '3a7a26d9254FFC08', 
    client_secret: 'SuNwPHKH6UbvhyZ34FlqOWJ9z2zN6KS8djzHpf8NvOI='
  });*/
// This file is executed in the browser, when people visit /chat/<random id>
$(function () {
	var key = "trnsl.1.1.20141205T204405Z.916da3f1c8b0abfa.932b315624f4b848e47a27661933040d190e2421";
	var translate = function (text, from, to) {
		var url = "https://translate.yandex.net/api/v1.5/tr.json/translate?key=" + key + "&lang=" + from + "-" + to + "&text=" + text;
        var xhr = new XMLHttpRequest();
        var a = "";
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var data = JSON.parse(xhr.responseText);
                a = data.text[0];
            }
        };
        xhr.open("GET", url, false);
        xhr.send();
        return a;
	};
	var makeTranslateRequest = function(token, text, from, to) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", "http://api.microsofttranslator.com/v2/Http.svc/Translate?from="+from+"&to="+to+"&text="+text, true);
        xmlhttp.setRequestHeader('Authorization', 'Bearer ' + token);
        xmlhttp.onreadystatechange = function(){
            if (xmlhttp.readyState==4 && xmlhttp.status==200){
                console.log(xmlhttp.responseText);
            }
        }
        xmlhttp.send();
    }
	// getting the id of the room from the url
	var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);

	// connect to the socket
	var socket = io.connect('/socket');

	// variables which hold the data for each person
	var name = "",
        friend = "",
        sex = "",
        img = "",
        lang = "";

	// cache some jQuery objects
	var section = $(".section"),
        footer = $("footer"),
        onConnect = $(".connected"),
        inviteSomebody = $(".invite-textfield"),
        personInside = $(".personinside"),
        chatScreen = $(".chatscreen"),
        left = $(".left"),
        noMessages = $(".nomessages"),
        tooManyPeople = $(".toomanypeople");

	// some more jquery objects
	var chatNickname = $(".nickname-chat"),
        leftNickname = $(".nickname-left"),
        loginForm = $(".loginForm"),
        yourName = $("#yourName"),
        yourLang = $("#yourLang"),
        hisName = $("#hisName"),
        hisLang = $("#hisLang"),
        chatForm = $("#chatform"),
        textarea = $("#message"),
        messageTimeSent = $(".timesent"),
        chats = $(".chats");

	// these variables hold images
	var ownerImage = $("#ownerImage"),
    creatorImage = $('#creatorImage'),
    leftImage = $("#leftImage"),
    noMessagesImage = $("#noMessagesImage");


	// on connection to server get the id of person's room
	socket.on('connect', function () {

		socket.emit('load', id);
	});
	// save the sex
	socket.on('sex', function (data) {
		if (data == 'Male') {
			img = "../img/male.png";
		}
		if (data == 'Female') {
			img = "../img/female.png";
		}
	});
	socket.on("lang", function (data) {
		lang = data;
	});
	// receive the names and sexes of all people in the chat room
	socket.on('peopleinchat', function (data) {

		if (data.number === 0) {

			showMessage("connected");

			loginForm.on('submit', function (e) {

				e.preventDefault();

				name = $.trim(yourName.val());
				sex = $("#yoursex:checked").val();
				if (name.length < 1) {
					alert("Please enter a nick name longer than 1 character!");
					return ;
				}

				lang = yourLang.val();
				showMessage("inviteSomebody");
				//call the server-side function 'login' and send user's parameters
				socket.emit('login', {
					user: name, sex: sex, lang: lang, id: id
				});

			});
		}
		// ownerImage.setAttribute("src", img);
		else if (data.number === 1) {

			showMessage("personinchat", data);

			loginForm.on('submit', function (e) {

				e.preventDefault();

				name = $.trim(hisName.val());
				sex = $("#hissex:checked").val();
				if (name.length < 1) {
					alert("Please enter a nick name longer than 1 character!");
					return ;
				}

				if (name == data.user) {
					alert("There already is a \"" + name + "\" in this room!");
					return ;
				}
				lang = hisLang.val();
				socket.emit('login', {
					user: name, sex: sex, lang: lang, id: id
				});
			});
		}

		else {
			showMessage("tooManyPeople");
		}

	});
	// Other useful 

	socket.on('startChat', function (data) {
		console.log(data);
		if (data.boolean && data.id == id) {

			chats.empty();

			if (name === data.users[0]) {

				showMessage("youStartedChatWithNoMessages", data);
			}
			else {
				// Add gender equality here!
				showMessage("heStartedChatWithNoMessages", data);
			}

			chatNickname.text(friend);
		}
	});

	socket.on('leave', function (data) {

		if (data.boolean && id == data.room) {

			showMessage("somebodyLeft", data);
			chats.empty();
		}

	});

	socket.on('tooMany', function (data) {

		if (data.boolean && name.length === 0) {

			showMessage('tooManyPeople');
		}
	});

	socket.on('receive', function (data) {

		showMessage('chatStarted');

		if (true) {
			createChatMessage(translate(data.msg, "en", lang), data.user, data.img, moment());
			scrollToBottom();
		}
	});

	textarea.keypress(function (e) {

		// Submit the form on enter

		if (e.which == 13) {
			e.preventDefault();
			chatForm.trigger('submit');
		}

	});

	chatForm.on('submit', function (e) {

		e.preventDefault();

		// Create a new chat message and display it directly

		showMessage("chatStarted");

		if (textarea.val().trim().length) {
			createChatMessage(textarea.val(), name, img, moment());
			scrollToBottom();
			// Send the message to the other person in the chat
			var toSend = translate(textarea.val(),lang,"en");
			console.log(toSend);
			socket.emit('msg', { 
				msg: toSend, user: name, img: img
			});
//translate(textarea.val(),lang,"en");
		}
		// Empty the textarea
		textarea.val("");
	});

	// Update the relative time stamps on the chat messages every minute

	setInterval(function () {

		messageTimeSent.each(function () {
			var each = moment($(this).data('time'));
			$(this).text(each.fromNow());
		});

	}, 60000);

	// Function that creates a new chat message

	function createChatMessage(msg, user, imgg, now) {

		var who = '';
		if (user === name) {
			who = 'me';
		}
		else {
			who = 'you';
		}
		var li = $(
                    '<li class=' + who + '>' +
                    '<div class="image">' +
                    '<img src=' + imgg + ' />' +
                    '<b></b>' +
                    '<i class="timesent" data-time=' + now + '></i> ' +
                    '</div>' +
                    '<p></p>' +
                    '</li>');

		// use the 'text' method to escape malicious user input
		li.find('p').text(msg);
		li.find('b').text(user);

		chats.append(li);

		messageTimeSent = $(".timesent");
		messageTimeSent.last().text(now.fromNow());
	}

	function scrollToBottom() {
		$("html, body").animate( {
			scrollTop: $(document).height() - $(window).height()
		}, 1000);
	}


	function showMessage(status, data) {

		if (status === "connected") {

			section.children().css('display', 'none');
			onConnect.fadeIn(1000);
		}

		else if (status === "inviteSomebody") {

			// Set the invite link content
			$("#link").text(window.location.href);

			onConnect.fadeOut(1200, function () {
				inviteSomebody.fadeIn(1200);
			});
		}

		else if (status === "personinchat") {

			onConnect.css("display", "none");
			personInside.fadeIn(1200);

			chatNickname.text(data.user);
			ownerImage.attr("src", img);
		}

		else if (status === "youStartedChatWithNoMessages") {

			left.fadeOut(1200, function () {
				inviteSomebody.fadeOut(1200, function () {
					noMessages.fadeIn(800);
					footer.fadeIn(800);
				});
			});

			friend = data.users[1];
			noMessagesImage.attr("src", img);
		}

		else if (status === "heStartedChatWithNoMessages") {

			personInside.fadeOut(1200, function () {
				noMessages.fadeIn(1200);
				footer.fadeIn(1200);
			});

			friend = data.users[0];
			noMessagesImage.attr("src", img);
		}

		else if (status === "chatStarted") {

			section.children().css('display', 'none');
			chatScreen.css('display', 'block');
			// footer.css('display', 'visible');
		}

		else if (status === "somebodyLeft") {

			leftImage.attr("src", img);
			leftNickname.text(data.user);

			section.children().css('display', 'none');
			footer.css('display', 'none');
			left.fadeIn(1200);
		}

		else if (status === "tooManyPeople") {

			section.children().css('display', 'none');
			tooManyPeople.fadeIn(1200);
		}
	}

});

var app = angular.module('HeyChat', ['ngMaterial']);