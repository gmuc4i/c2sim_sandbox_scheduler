
callbacks = {};

callbacks.documentLoad = function()
{
    
    // Begin networking
    var socket = io.connect('http://localhost:8080');
    
    //
    // FUNCTIONS
    //

    /*
     * Return a JSON object signifying full reservation request in the following
     * format:
     *
     * {"1":"Parameter 1", "5":"Parameter 2", ...}
     * 
     */
    function getReservedBlocks()
    {
        // console.log("Getting reserved blocks");
        
        var reserved = {};
        
        for(var block = 0; block < 24; block++)
        {
            var buttonElement = $("#button" + block);
            var textElement   = $("#text"   + block);

            var buttonUnavailable = buttonElement.hasClass("btn-danger");
            var textUnavailable   = buttonElement.hasClass("has-error");
            var blockAvailable    = !(buttonUnavailable || textUnavailable);
            
            var buttonEnabled = buttonElement.hasClass("active");
            
            if(blockAvailable && buttonEnabled)
            {
                // console.log("Adding block " + block + " to reserved");
                reserved[block] = textElement.val();
            }
        }

        // console.log("reservedBlocks(): " + JSON.stringify());
        return reserved;
    }

    
    // Resets the UI elements to their original CSS properties
    function resetBlocks()
    {
        // console.log("Resetting blocks...");
        
        for(var block = 0; block < 24; block++)
        {
            var buttonElement = $("#button" + block);
            var textElement   = $("#text"   + block);
            
            // Enable all
            buttonElement.prop("disabled", false);
            textElement.prop("disabled", false);
            
            // Reset button classes
            buttonElement.attr("class", "btn btn-primary");
            
            // Reset text classes
            textElement.attr("class", "");

            // Reset text fields
            textElement.val("");
        }
        
    }

    
    // Given a schedule for a date, fill in the UI elements accordingly
    function populateBlocks(events)
    {
        // console.log("Populating blocks...");
        
        for(var block in events)
        {
            var blockNumber   = parseInt(block, 10);
            var buttonElement = $("#button" + blockNumber);
            var textElement   = $("#text"   + blockNumber);
            var blockVisible  = (events[block] != false);
            
            if(blockVisible)
            {
                buttonElement.addClass("btn-success");
                var parameter = events[block]["parameter"];
                textElement.val(parameter);
                textElement.addClass("has-success");
                buttonElement.addClass("active");
            }
            else
            {
                buttonElement.prop("disabled", true);
                textElement.prop("disabled", true);
                buttonElement.addClass("btn-danger");
                textElement.addClass("has-error");
            }
        }
        
    }

    
    function refreshBlocks()
    {
        // console.log("Refreshing blocks...");
        resetBlocks();
        socket.emit("refreshRequest", $("#selectedDate").val(), Cookies.get("token"));
        socket.on("refreshResponse",  (events => populateBlocks(events)));
    }
    
    
    //
    // CALLBACKS
    //

    callbacks.logoutButton = function()
    {
        // console.log("Ending session...");
        socket.emit("endSessionRequest", Cookies.get("token"));
    }

    $("#logout").click(callbacks.logoutButton);
    
    
    /*
     * Deauthenticates the current user, and navigates the browser back to the
     * login page
     */
    callbacks.logout = function (logoutSuccessful)
    {
        // Delete now-expired cookie
        Cookies.remove("token");

        if(logoutSuccessful)
        {
            // Display logout message
            alert("Logout successful");
            
            // Go back to login page
            window.location.href = "./login.html";
        }
        else
        {
            alert("Logout unsuccessful");
        }
    }

    socket.on("endSessionResponse", callbacks.logout);
    
    
    callbacks.reserveButton = function()
    {
        // console.log("Reserve button pressed");
        
        // Disable the button
        $("#reserve").prop('disabled', true);
        
        // Change the button text to "Loading..."
        $("#reserve").text("Loading...");
        
        // Collect reservation data
        var reservedBlocks = getReservedBlocks();

        // console.log("Reserved blocks: " + JSON.stringify(reservedBlocks));

        socket.emit('reserveRequest', $("#selectedDate").val(), reservedBlocks, Cookies.get("token"));
    }

    $("#reserve").click(callbacks.reserveButton);
    
    
    callbacks.reserveResponse = function(events)
    {
        // console.log("Reserve response: " + JSON.stringify(events));
        var reserveElement = $("#reserve");

        var secondsToDelay = 0.3;

        function delay(seconds, fn)
        {
            setTimeout(fn, (seconds * 1000));
        }

        function delayFn()
        {
            reserveElement.prop("disabled", false);
            reserveElement.text("Reserve!");
            reserveElement.removeClass("active");
        }

        delay(secondsToDelay, delayFn);
        
        refreshBlocks();
    }

    socket.on("reserveResponse", callbacks.reserveResponse);
    
    
    callbacks.dateChange = function()
    {
        console.log("Changing date...");
        
        console.log("Date changed to: " + $("#selectedDate").val());
        
        // Query server for schedule of new date
        socket.emit('scheduleRequest', $("#selectedDate").val(), Cookies.get("token"));
    }

    
    callbacks.scheduleResponse = function(events)
    {
        console.log("Here's the schedule: " + JSON.stringify(events));
        refreshBlocks();
    }
    
    socket.on("scheduleResponse", callbacks.scheduleResponse);

    
    callbacks.error = function(code)
    {
        console.log("Error: " + code);
        err_msg = "";
        if (code == 1) {
            err_msg = "Scheduling conflict";
        }
        else if (code == 2) {
            err_msg = "Session expired";
        }
        alert(err_msg);
        if (code == 1) {
            window.location.href = "./scheduler.html";
        }
        else if (code == 2) {
            window.location.href = "./login.html";
        }
    }

    socket.on('schedulerError', callbacks.error);

    
    // When the user selects a date, send a Req to get schedule information for
    // that date
    $("#date-picker").datepicker({
        todayHighlight: true,
        autoclose:      true
    });
    
    $("#date-picker").datepicker("setDate", new Date());
    refreshBlocks();
    $("#date-picker").datepicker().on('changeDate', callbacks.dateChange);

}

// Wait until the DOM has fully loaded
document.addEventListener("DOMContentLoaded", callbacks.documentLoad);
