// Bot details
global.botAuthId = "auth+live+0d4ae7e55d2675092a2e5d12cdb3ccb2c9d12d36";
global.botUserId = "4f70aeda590ca2359e0023f0";
global.botRoomId = "4fdb339faaa5cd1e740002d2"; // 80s 90s
//global.botRoomId = "50b2feb4eb35c140e316fe20"; // All Music Hits
global.botName = "UgleeToo";
global.botLaptop = "linux";
global.botAdmins = ["4dfb57154fe7d061dd013a44", "4f458788590ca220fc0029fd"];

// Database Details
global.dbHost = "10.0.1.5";
global.dbName = "tt_bots";
global.dbTablePrefix = "bots_";
global.dbLogin = "ttbot";
global.dbPassword = "DMcZJSDNqCNDQ2ES";

// Flags
global.logtoconsole = true;

// Configure sayings
global.stepUpText = "I'll show you what REAL music sounds like.";
global.stepDownText = "Guess you don't need me anymore.";
global.summonText = "Would you like to join me in All Music Hits (tt.fm/all_music_hits)?";
//global.welcomeText = "Welcome to the room @{u}! Be sure to familiarize yourself with the /rules.";
global.welcomeText = "Welcome to our room @{u}, please check out the room rules before DJing. http://tinyurl.com/no-drama-zone"; 
global.welcomeDaily =  ["Welcome to our room @{u}, please check out the room rules before DJing. http://tinyurl.com/no-drama-zone",  // Sunday
 						"Welcome to our room @{u}, please check out the room rules before DJing. http://tinyurl.com/no-drama-zone Today is Hair Metal Monday!",  // Monday
 						"Welcome to our room @{u}, please check out the room rules before DJing. http://tinyurl.com/no-drama-zone Today is Twofer Tuesday. Play 2 songs in a row from an artist.",  // Tuesday
 						"Welcome to our room @{u}, please check out the room rules before DJing. http://tinyurl.com/no-drama-zone Today is Hip Hop Hump day!",  // Wednesday
 						"Welcome to our room @{u}, please check out the room rules before DJing. http://tinyurl.com/no-drama-zone Today is Theme Part Thursday",  // Thursday
 						"Welcome to our room @{u}, please check out the room rules before DJing. http://tinyurl.com/no-drama-zone Today is Fast Finger Friday. We do 1 and done.",  // Friday
 						"Welcome to our room @{u}, please check out the room rules before DJing. http://tinyurl.com/no-drama-zone"]; // Saturday
global.ruleText = "[1] No EDM, DnB or Dubstep. [2] While DJing hit awesome for the other DJs to show your support. [3] No laming. [4] Be nice.";
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
global.chat_responses =		[{ name: "whois", response1: "Me is a bot that is created by @PodcastMike. Me guts are at https://github.com/MikeWills/Uglee.", response2: "" },
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
							{ name: "pot", response1: "Drugs are byad! Mkay?", response2: "" },
							{ name: "joint", response1: "Drugs are byad! Mkay?", response2: "" },
							{ name: "weed", response1: "Drugs are byad! Mkay?", response2: "" },
							{ name: "grass", response1: "Drugs are byad! Mkay?", response2: "" },
							{ name: "blunt", response1: "Drugs are byad! Mkay?", response2: "" },
							{ name: "cocaine", response1: "Drugs are byad! Mkay?", response2: "" },
							{ name: "lsd", response1: "Drugs are byad! Mkay?", response2: "" },
							{ name: "Taquitos", response1: "Stop trying to break me @Lord of Nerds!", response2: "" },
							{ name: "cake", response1: "Mmmm cake!", response2: "/me cuts a slice and hands it to @{u}." },
							{ name: "pizza", response1: "Mmmm pizza!", response2: "/me cuts a slice and hands it to @{u}." },
							{ name: "fart", response1: "/me lets a really smelly one fly.", response2: "" },
							{ name: "dance bitch", response1: "... fine.", response2: "/me dances." },
							{ name: "dance", response1: "Dwarves don't dance Master @{u}", response2: "" },
							{ name: "mosh", response1: "/me starts the mosh pit.", response2: "" },
							{ name: "whore", response1: "You want some of THIS baby?? Me can go ALL NIGHT LONG!!", response2: "" },
							{ name: "zombies", response1: "Zombies? KILL THE ZOMBIES!!!", response2: "/me pulls out axe and starts to kill all the zombies." },
							{ name: "lamer", response1: "Lamers? Let me at them master! I'll KILL THE LAMER!!!", response2: "/me pulls out axe and starts to hunt for the lamer." },
							{ name: "nazis", response1: "Nazis? KILL THE NAZIS!!!", response2: "/me pulls out axe and starts to kill all the Nazis." },
							{ name: "ninja", response1: "Go ninja, Go ninja!", response2: "Go ninja go!" },
							{ name: "thank you", response1: "Your welcome!", response2: ""},
							{ name: "thanks", response1: "Your welcome!", response2: ""},
							{ name: "love", response1: "I love you too @{u}", response2: ""},
							{ name: "= awesome!", response1: "@{u} = Looser!", response2: ""},
							{ name: "= gay", response1: "@{u} suck it!", response2: ""},
							{ name: "your mom", response1: "My momma? Let's talk about how your momma squeeled like a pig last night as I was giving her the dwarven hammer...", response2: "The hammer's my penis."},
							{ name: "friday", response1: "If you play that fucking Rebecca Black song, I'll pluck your pubes out one at a time and force feed them to you.", response2: ""},
							{ name: "dubstep", response1: "Dubstep isn't music and that shit not welcome here. DEATH TO ALL DUBSTEP! ", response2:"This is what dubstep is: http://youtu.be/z_SQO3vv3p8"},
							{ name: "queue", response1: "There is no queue. Just be the fastest person to step up!", response2: "" },
							{ name: "autobop", response1: "This autobop works! http://www.pinnacleofdestruction.net/tt/", response2: "" },
							{ name: "suck it", response1: "8==:fist:==D:sweat_drops: :lips:", response2: "" }
							];

//Configuration
require("./main.js");
