
callbacks = {};

callbacks.documentLoad = function()
{

    // Begin networking
    var socket = io.connect('http://localhost:8080');
    
    
    callbacks.loginButton = function()
    {
        $("#login").prop('disabled', true);
        
        var username = $("#username").val();
        var password = $("#password").val();
        
        socket.emit('authenticationRequest', username, password);
    }

    $("#login").click(callbacks.loginButton);

    
    callbacks.registerButton = function()
    {
        console.log("Register button clicked");
        
        $("#register").prop("disabled", true);
        
        var username = $("#username").val();
        var password = $("#password").val();
        
        socket.emit("registrationRequest", username, password);
    }

    $("#register").click(callbacks.registerButton);
    
    
    callbacks.authenticationResponse = function(token)
    {
        $("#login").prop("disabled",false);
        if(token != false)
        {
            alert('Login successful');
            Cookies.set("token", token);
            // Proceed to the scheduler page
            window.location.href = "./scheduler.html";
        }
        else
        {
            alert("Login unsuccessful");
        }
    }

    socket.on('authenticationResponse', callbacks.authenticationResponse);
    
    
    callbacks.registrationResponse = function(registrationSuccessful)
    {
        console.log("Server responded with: " + registrationSuccessful);
        $("#register").prop("disabled", false);
        if(registrationSuccessful)
        {
            alert('Registration successful');
        }
        else
        {
            alert("Registration unsuccessful");
        }
    }

    socket.on('registrationResponse', callbacks.registrationResponse);
    
}

// Wait until the DOM has fully loaded
document.addEventListener("DOMContentLoaded", callbacks.documentLoad);
