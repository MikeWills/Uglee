// Bot details
global.botAuthId = "auth+live+#######";
global.botUserId = "######";
global.botRoomId = "######";
global.botName = "botName";
global.botLaptop = "mac";
global.botAdmins = ["#####", "######"]; // This can be 1 or more people

global.botWebsite = "";
global.botTwitter = "";
global.botFacebook = "";
global.botAbout = ""; 
global.botTopartists = "";
global.botHangout = "";

// Database Details
global.dbHost = "localhost";
global.dbName = "tt_bots";
global.dbTablePrefix = "bots_";
global.dbLogin = "username";
global.dbPassword = "password";

global.lastfmApiKey = "";
global.lastfmApiSecret = "";

// Flags
global.logtoconsole = true;

// Configure sayings
global.stepUpText = "Imma gonna help you out here.";
global.stepDownText = "Looks like me no longer needed.";
global.summonText = "Can you want to join us in All Music Mix (tt.fm/all_music_mix)?";
global.welcomeText = "Welcome to the room @{u}! Be sure to familiarize yourself with the !rules.";
global.welcomeDaily =  ["Welcome to the room @{u}! Be sure to familiarize yourself with the !rules.",  // Sunday
 						"Welcome to the room @{u}! Be sure to familiarize yourself with the !rules.",  // Monday
 						"Welcome to the room @{u}! Be sure to familiarize yourself with the !rules.",  // Tuesday
 						"Welcome to the room @{u}! Be sure to familiarize yourself with the !rules.",  // Wednesday
 						"Welcome to the room @{u}! Be sure to familiarize yourself with the !rules.",  // Thursday
 						"Welcome to the room @{u}! Be sure to familiarize yourself with the !rules.",  // Friday
 						"Welcome to the room @{u}! Be sure to familiarize yourself with the !rules."]; // Saturday
global.ruleText = "[1] No more dubstep. [2] I will tell you how many songs you can play for each set (1-4) [3] Please wait the number DJ(s) I tell you between sets (I will suspend the wait if seats stay open). [4] While DJing hit awesome for the other DJs to show your support. [5] Be nice.";
global.startupText = "Oi! Ten thousand cycles will give you such a crick in the neck.";

global.awesomeText = 		   ["I love it!", 
					  			"This song is awesome!", 
					  			"How'd you know I'd love this song?", 
					  			"Raise the roof!",
					  			"The roof, the roof is on fire!",
					  			"W00t!",
					  			"Hell yah!",
					  			"This fucking rocks!"];
global.lameText = 			   ["Wow! I have heard banshee songs better than this.", 
								"I want my money back! This song sucks."];
global.downVoteText = 		   ["If you can't be nice, don't vote at all.", 
								"A lame? Imma lame your ass next time you play a song!", 
								"An all music mix room encourages people to take risks with their song choices, laming discourages that.",
								"HEY EVERYONE! Some jerk just lamed this song!",
								"You wouldn't lame your momma would you? So why lame this person?"];
global.userLeaveQuickText =    ["Hey! {u} just took our beer! That jerk!", 
								"OMG! {u} just took our last bottle of Jack!", 
								"Hey {u}, don't let the door hit your ass on the way out!", 
								"We didn't want you here anyway {u}", 
								"Good riddance! We didn't want you anyay {u}.", 
								"Thanks for coming {u}!"];
global.hitBot = 			   ["OMG! Okay I'll awesome. Whatta prick!",
								"What?!?",
								"What the hell? I am simply voicing my opinion! *cough*jerk*cough*",
								"OUCH! Fine... I'll awsome."];
global.crankIt = 			   ["Already did!!",
								"Shit I think I broke the knob off trying to hit 11!",
								"The neighbors won't like this but....",
								"Hell yah!",
								"Pumping up the jam!",
					  			"The roof, the roof is on fire!",
								"Wait, I think I hear the cops knocking...",
								"I'm on 11!"];
global.chat_responses =		[{name: "hi", response1:"Duh!", response2: ""},
							{ name: "whois", response1: "Me is a bot that is created by @PodcastMike. Me guts are at https://github.com/MikeWills/Uglee.", response2: "" },
							{ name: "speak", response1: "GWAAAARRRRR!!!!!", response2: "" },
							{ name: "300", response1: "THIS. IS SPARTA!!!!!!", response2: "" },
							{ name: "ping", response1: "pong", response2: ""},
							{ name: "bye", response1: "Finally that jerk is leaving.", response2: "" },
							{ name: "hammer", response1: "The hammer is my penis.", response2: "" },
							{ name: "menu", response1: "Here is my drink menu: whiskey | brandy | tequilla | gin | coke | dew | coffee | water | fluffy drink.",
									response2: "Here is my food menu: pizza | cake | taquitos"},
							{ name: "beer", response1: "/me hands @{u} a cold one.", response2: "Here you go Master @{u}." },
							{ name: "whiskey", response1: "/me hands @{u} a Crown Royal on the rocks.", response2: "Here you go Master @{u}." },
							{ name: "brandy", response1: "/me hands @{u} a E&J VSOP on the rocks.", response2: "Here you go Master @{u}." },
							{ name: "tequila", response1: "/me hands @{u} a shot of 1800 Select Silver.", response2: "Here you go Master @{u}. Real men (and women) don't need limes and salt." },
							{ name: "tequilla", response1: "/me hands @{u} a shot of 1800 Select Silver.", response2: "Here you go Master @{u}. Real men (and women) don't need limes and salt." },
							{ name: "taquila", response1: "/me hands @{u} a shot of 1800 Select Silver.", response2: "Here you go Master @{u}. Real men (and women) don't need limes and salt." },
							{ name: "taquilla", response1: "/me hands @{u} a shot of 1800 Select Silver.", response2: "Here you go Master @{u}. Real men (and women) don't need limes and salt." },
							{ name: "fluffy drink", response1: "/me gives {u} a wimpy ass elven fluffy drink.", response2: ""},
							{ name: "gin", response1: "/me hands @{u} a Hendricks with soda and lemon.", response2: "Here you go Master @{u}." },
							{ name: "wine", response1: "What are you some fucking pussy elf?", response2: "" },
							{ name: "coke", response1: "/me hands @{u} a cold one.", response2: "Here you go Master @{u}." },
							{ name: "dew", response1: "/me hands @{u} a Mt. Dew.", response2: "Here you go Master @{u}. Like to do the Dew huh?" },
							{ name: "coffee", response1: "/me hands @{u} a large cup of liquid energy.", response2: "Here you go Master @{u}." },
							{ name: "water", response1: "Do we serve water here??", response2: "HELL NO H2O!!" },
							{ name: "Taquitos", response1: "Stop trying to break me @Lord of Nerds!", response2: "" },
							{ name: "cake", response1: "Mmmm cake!", response2: "/me cuts a slice and hands it to @{u}." },
							{ name: "pizza", response1: "Mmmm pizza!", response2: "/me cuts a slice and hands it to @{u}." },
							{ name: "fart", response1: "/me lets a really smelly one fly.", response2: "" },
							{ name: "dance", response1: "Dwarves don't dance Master @{u}", response2: "" },
							{ name: "mosh", response1: "/me starts the mosh pit.", response2: "" },
							{ name: "zombies", response1: "Zombies? KILL THE ZOMBIES!!!", response2: "/me pulls out axe and starts to kill all the zombies." },
							{ name: "lamer", response1: "Lamers? Let me at them master! I'll KILL THE LAMER!!!", response2: "/me pulls out axe and starts to hunt for the lamer." }
							];

//Configuration
require("./main.js");