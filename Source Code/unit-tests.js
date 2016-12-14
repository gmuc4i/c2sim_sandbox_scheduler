var chai      = require('chai');
var expect    = chai.expect;

function isValidToken(token)
{
    return (token != undefined);
}

describe('register', function(){

    it('Should fail when trying to re-register user', function(){
		var scheduler = require('./scheduler.js');
		// "user1" is already registered, should fail
        expect(scheduler.register("user1")).to.equal(false);
        // Same with "user2"
        expect(scheduler.register("user2")).to.equal(false);
    });

    it('Should succeed when trying to register new user', function(){
		var scheduler = require('./scheduler.js');
		// "user1" is already registered, should fail
        expect(scheduler.register("user3")).to.equal(true);
    });
});

describe('login', function(){
    it('Should succeed/fail when password matches/unmatches\n\tthe one in the Database', function() {
		var scheduler = require('./scheduler.js');
		// If "user1"'s password matches the one in the Database,
		//		it should succeed
		expect(scheduler.login("user1","pw")).to.not.equal(false);
		// Otherwise it should know that the password is different
		expect(scheduler.login("user1","pwd")).to.equal(false);
		// Same condition with "user2"
		//		Case1 = match, should pass
		expect(scheduler.login("user2","12345")).to.not.equal(false);
		//		Case2 = unmatch, should fail
		expect(scheduler.login("user2","pw")).to.equal(false);
    });

	it('Should fail if username isn\'t registered', function(){
		var scheduler = require('./scheduler.js');
		// It is expected that the type is undefined
		//		because user3 is not in the database
		expect(scheduler.login("user3")).to.equal(false);
	});
	
	it('Should succeed if user is active', function(){
		var scheduler = require('./scheduler.js');
		var userName = "user1";
		var password = "pw";
		// If user is active, then the login function should return a token
		expect(scheduler.login(userName,password)).to.equal("THIS TOKEN FOR "+userName+" IS CURRENTLY INSECURE");
		// Setting up the login information for "user1"
		var token = scheduler.login(userName, password);
		// Log out of the account
		scheduler.logout(token);
		
		// If user is NOT active, then the login function should fail
		userName = "user3";
		expect(scheduler.login(userName,password)).to.equal(false);
	});
});

describe('logout', function(){
	it('Should fail if token is not operational', function(){
		var scheduler = require('./scheduler.js');
		// Setting up the wrong login information for "user1"
		var token = scheduler.login("user1", "pwd");
		expect(scheduler.logout(token)).to.equal(false);
		// Setting up the login information for "user1"
		token = scheduler.login("user1", "pw");
		// Log out of the account
		scheduler.logout(token);
		// Setting up the login information for "user3 which does not exist"
		token = scheduler.login("user3", "pw");
		expect(scheduler.logout(token)).to.equal(false);
	});
	it('Should Pass if token is operational\n\tSuccessful Logout!', function(){
		var scheduler = require('./scheduler.js');
		// Setting up the login information for "user1"
		var token = scheduler.login("user1", "pw");
		// Log out of the account
		expect(scheduler.logout(token)).to.equal(true);
	});
});

describe('addEvent', function(){
	it('Should pass if the Date is not taken and added successfully', function(){
		var scheduler = require('./scheduler.js');
		// Setting up the login information for "user1"
		var token = scheduler.login("user1", "pw");
		// Adding events by the token format
		expect(scheduler.addEvent("12/12/2016", 0, token, "param1")).to.equal(true);
	});
	it('Should pass if the Date is taken\n\tand block is not taken, and added successfully', function(){
		var scheduler = require('./scheduler.js');
		// Setting up the login information for "user1"
		var token = scheduler.login("user1", "pw");
		// Adding events by the token format
		expect(scheduler.addEvent("12/11/2016", 1, token, "param1")).to.equal(true);
	});
	it('Should fail if the date and block is duplicated', function(){
		var scheduler = require('./scheduler.js');
		// Setting up the login information for "user1"
		var token = scheduler.login("user1", "pw");
		// If same block's event is added, it should reject the request and fail
		expect(scheduler.addEvent("12/11/2016", 0, token, "param1")).to.equal(false);
	});
});

describe('getEventsOn', function(){
	it('Should fail if token is not operational', function(){
		var scheduler = require('./scheduler.js');
		// Setting up the login information for "user1"
		var token = scheduler.login("user1", "pwd");
		expect(scheduler.getEventsOn("12/11/2016", token)).to.equal(false);
		token = scheduler.login("user1", "pw");
		// Log out of the account
		scheduler.logout(token);
	});
	
	it('Should succeed and return JSON object if the event is available', function(){
		var scheduler = require('./scheduler.js');
		// Setting up the login information for "user1"
		var token = scheduler.login("user1", "pw");
		// The expected outcome of the JSON object if data is available
		var expected_Result = '{"user":"user1","parameter":"param1"}';
		// Make the result into string to compare
		var result = JSON.stringify(scheduler.getEventsOn("12/11/2016", token)[0]);
		// If event exists and matches, the result should be equal.
		expect(result).to.equal(expected_Result);
		// Log out of the account
		scheduler.logout(token);
	});
	
	it('Should fail if login userName is not correct for the Event', function(){
		var scheduler = require('./scheduler.js');
		// Setting up the login information for "user2"
		var token = scheduler.login("user2", "12345");
		// The block information should return both false if token is incorrect
		expect(scheduler.getEventsOn("12/11/2016", token)[0]).to.equal(false);
		expect(scheduler.getEventsOn("12/11/2016", token)[1]).to.equal(false);
		// Log out of the account
		scheduler.logout(token);
	});
	
	it('Should fail if login password is not correct for the signed up Event', function(){
		var scheduler = require('./scheduler.js');
		// Setting up the login information for "user2"
		var token = scheduler.login("user1", "pwd");
		// The block information should return both false if token is incorrect
		expect(scheduler.getEventsOn("12/11/2016", token)).to.equal(false);
		// Log out of the account
		scheduler.logout(token);
	});
});

describe('removeEventsOn', function(){
	it('Should fail if userName is not registered', function(){
		var scheduler = require('./scheduler.js');
		// Setting up the login information for "user1"
		var token = scheduler.login("user", "pw");
		// The removeEventsOn function will take date and login token for varification
		expect(scheduler.removeEventsOn("12/11/2016", token)).to.equal(false);
	});
	
	it('Should fail if password is wrong', function(){
		var scheduler = require('./scheduler.js');
		// Setting up the login information for "user1"
		var token = scheduler.login("user1", "pwd");
		// The removeEventsOn function will take date and login token for varification
		expect(scheduler.removeEventsOn("12/11/2016", token)).to.equal(false);
	});
	
	it('Should succeed if token is valid', function(){
		var scheduler = require('./scheduler.js');
		// Setting up the login information for "user1"
		var token = scheduler.login("user1", "pw");
		// The function should return true if login is
		expect(scheduler.removeEventsOn("12/11/2016", token)).to.equal(true);
	});
});






