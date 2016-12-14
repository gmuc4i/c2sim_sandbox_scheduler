"use strict";

///////////////
// VARIABLES //
///////////////

/*
 *  Associative list of registered users and their hashed passwords.
 */
var registered = {
    "user1": hashPassword("pw"),
    "user2": hashPassword("12345")
};

/*
 * Associative array (for constant-time access) of active (authenticated,
 * logged-in) users.
 * 
 * The usernames logged in are mapped to their corresponding token
 */
var active = {};

/*
 * Associative array (for constant-time access) of event registry.
 * 
 * The current format is as follows:
 * {"1/1/2017":
 *   {"1":  {"user": "user1", "parameter": "my-input"},
 *    "14": {"user": "user2", "parameter": "other-thing"}}}
 *
 */
var events = {};


///////////////
// FUNCTIONS //
///////////////

/*
 * Given a password as input, this function tranforms that input in a
 * typically-irreversible way.  In production, this should be cryptographically
 * secure.
 */
function hashPassword(password)
{
    return password;
}

/*
 * Creates a token to give the user, signalling to the server that they are
 * authenticated.
 *
 * Like the password hash, this ought to be cryptographically secure in
 * production.
 */
function generateToken(username)
{
    return ("THIS TOKEN FOR " + username + " IS CURRENTLY INSECURE");
}

function tokenToUsername(token)
{
    return active[token];
}

/*
 * Checks whether the input user is registered user (has a saved name/password).
 */
function isTokenRegistered(token)
{
    if(registered[tokenToUsername(token)] == undefined)
    {
        // console.log("There are no registered users named \"" + username + "\"");
        return false;
    }
    else
    {
        // console.log("User \"" + username + "\" is registered");
        return true;
    }
}

/*
 * Checks whether the input user is currently authenticated (whether the user is
 * currently logged in according to the system).
 */
function isTokenActive(token)
{
    if(active[token] == undefined)
    {
        // console.log("Token is not active");
        return false;
    }
    else
    {
        // console.log("Token is active");
        return true;
    }
}

/*
 * Checks that the user can use the basic functionality of the system
 *
 * Fails (returns false) if:
 * - User is not registered
 * - User is not active
 * - Invalid token is given
 * 
 */
function isTokenOperational(token)
{
    return (isTokenRegistered(token) && isTokenActive(token));
}

/*
 * (For debugging purposes only)
 * 
 * Output the registered users in human-readable form.
 */
function printRegistered()
{
    console.log("Registered Users:");
    console.log("=================");
    for(var username in registered)
    {
        console.log(" " + username);
    }
    console.log("");
}

function printActive()
{
    console.log("Active Tokens:");
    console.log("=============");
    for(var token in active)
    {
        console.log(" " + token + " (" + tokenToUsername(token) + ")");
    }
    console.log("");
}

/*
 * (For debugging purposes only)
 * 
 * Output the registered events in human-readable form.
 */
function printEvents()
{
    console.log("");
    console.log("Events");
    console.log("======");
    if(events != undefined)
    {
        for(var date in events)
        {
            if(events[date] != undefined)
            {
                for(var block in date)
                {
                    if(events[date][block] != undefined)
                    {
                        var entry     = events[date][block];
                        var user      = entry["user"];
                        var parameter = entry["parameter"];
                        console.log(" - " +  user + " \"" + parameter + "\" at " + block + " on " + date);
                    }
                }
            }
        }
    }
    console.log("");
}


/*
 * (For future developments)
 * 
 * Additional features needed such as adding, updating, removing database,
 * 	but for not this will be a place holder for touching the database
 */
function updateDB()
{
	// Add functionality to update persistent database storage here
}


// exports.printRegistered = printRegistered;
// exports.printActive     = printActive;
// exports.printEvents     = printEvents;

// EXPORTED FUNCTIONS

/*
 * Attempt to register a new user given a name and password.
 * 
 * Fails (returns false) if:
 * - The requested username is already registered
 * 
 * Returns true on successful registration
 */
exports.register = function(username, password)
{
    // Registration check
    if(registered[username] != undefined)
    {
	    // console.error("A user named \"" + username + "\" is already registered.");
	    return false;
    }
    else // Registration successful
    {
        // console.log("User \"" + username + "\" successfully registered");
	registered[username] = hashPassword(password);
        updateDB();
	return true;
    }
}

/*
 * Attempt to log in to the scheduler system.
 * 
 * Fails (returns false) if:
 * - User isn't registered
 * - Password doesn't correspond with user's registered password
 *
 * Otherwise, returns corresponding user token
 */
exports.login = function(username, password)
{
    // Registration check
    if(registered[username] == undefined)
    {
        // console.log("There are no registered users named \"" + username + "\"");
	    return false;
    }
    // Check for registered password match
    else if(registered[username] != password)
    {
        // console.log("User \"" + username + "\" failed to log in");
	    return false;
    }
    else // Valid credentials given (First login phase complete)
    {
	    // console.log("Valid credentials provided for user \"" + username + "\"");
        
        // Check to make sure username isn't currently active
	    if(username in active)
	    {
            // console.log("User \"" + username + "\" is already logged in");
            return false;
	    }
	    else // Login fully successful
	    {
            // console.log("User \"" + username + "\" successfully logged in");
            var token = generateToken(username);
            active[token] = username;
            updateDB();
            return token;
	    }
    }
}

/*
 * Attempt to log out to the scheduler system.
 * 
 * Fails (returns false) if:
 * - User isn't operational
 * 
 * Returns true on successful logout
 */
exports.logout = function(token)
{
    if(!isTokenOperational(token))
    {
        // console.log("User \"" + username + "\" is unable to log out");
        return false;
    }
    else // Successfully logged out
    {
        // console.log("User \"" + username + "\" successfully logged out");
        delete active[token];
	updateDB();
        return true;
    }
}

/*
 * Given a date (ex. "1/1/2017") a block from 0-23, and a username, attempt to
 * add an event to the registry.
 * 
 * Fails (returns false) if:
 * - User isn't operational
 * - Requested block is already occupied (even by the same user)
 * 
 */
exports.addEvent = function(date, block, token, parameter)
{
    if(!isTokenOperational(token))
    {
        // console.log("User is unable to add events");
        return false;
    }
    else // User can add events
    {
        /*
         * If the given date doesn't exist in the event registry, there are no
         * conflicts.
         */
        var dateExists = (events[date] != undefined);
        if(dateExists)
        {
            /*
             * Otherwise, we need to check if the specific block requested is
             * taken.
             */
            // console.log("Date exists, need to check blocks now");
            var blockExists = (events[date][block] != undefined);
            if(blockExists)
            {
                // console.error("This time section is already taken");
                return false;
            }
            else
            {
                // console.log("Block free, can create");
                var event = {"user": tokenToUsername(token), "parameter": parameter};
                events[date][block] = event;
		updateDB();
                return true;
            }
        }
        else // Date doesn't exist, need to make a full entry in registry
        {
            // console.log("Date not taken, need to make a full entry");
            var event = {"user": tokenToUsername(token), "parameter": parameter};
            
            // Please look away from the ugly Javascript hack
            var hack = {}
            hack[block] = event;
            
            events[date] = hack;
            updateDB();
            return true;
        }
    }
}


/*
 * Given a date (ex. "01/01/2017") and a user token, get all reservations on
 * that date.
 * 
 * If there is an event on the given date that wasn't scheduled by the given
 * user, "false" is in place of the reserved event
 * 
 * Fails (returns false) if:
 * - User isn't operational
 * 
 */
exports.getEventsOn = function(date, token)
{
    if(!isTokenOperational(token))
    {
        // console.log("User is unable to get events");
        return false;
    }
    else // User can access parameters
    {
        // Check that there are any events on the given date
        if(events[date] == undefined)
        {
            // console.error("There are no events scheduled on that date");
            return {};
        }
        else
        {
            // console.log("There are events on the given date");
            var result = {};
            for(var block in events[date])
            {
                /*
                 * If token can read the event, it's mapped as-is.
                 *
                 * Otherwise, it shows up as "false"
                 */
                var eventUser = events[date][block]["user"];
                var canReadEvent = (eventUser == tokenToUsername(token));
                if(canReadEvent)
                {
                    // console.log("Token can read event");
                    result[block] = events[date][block];
                }
                else
                {
                    // console.log("Token has insufficient permission, hiding");
                    result[block] = false;
                }
            }
            updateDB();
            return result;
        }
    }
}


/*
 * Given a date (ex. "1/1/2017") and a token, remove all events on a date.
 * 
 * Fails (returns false) if:
 * - User isn't registered
 * - User isn't active
 * 
 */
exports.removeEventsOn = function(date, token)
{
    if(!isTokenOperational(token))
    {
        console.log("User is unable to remove events");
        return false;
    }
    else // User can access parameters
    {
        if(events[date] != undefined)
        {
            for(var block in events[date])
            {
                var eventUser    = events[date][block]["user"];
                var canReadEvent = (eventUser == tokenToUsername(token));
                if(canReadEvent)
                {
                    delete events[date][block];
                }
            }
        }
	updateDB();
        return true;
    }
}
