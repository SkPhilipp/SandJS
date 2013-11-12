# SandJS

JavaScript Sandboxing.

SandJS allows communication between two windows, an iframe host and a child iframe. This allows for safe Sandboxing of JavaScript.

## Sandboxing

Requirements: Two domains. For example, [hileco.com](http://hileco.com) ("Host Domain") and sandbox.hileco.com ("Sandbox Domain"). The sandbox domain must be solely dedicated to executing potentially unsafe JavaScript ("Code").

Sandboxing allows you to execute code in the sandbox domain, without it being able to harm the host domain. The host domain connects to the sandbox domain via SandJS, and can then send code across for the sandbox domain to interpret and or execute.

### Sample: Sandboxing expressions

In the following sample a sandbox frame is loaded, a message is sent to it, along with a callback reference. SandJS enables you to create cross-window callbacks, note that you can not send function references or anything else other than plain serializable objects through, so keep that in mind when designing callbacks. The following example lets the sandbox evaluate the expression "2 + 2", the result of the expression is sent back to the host via the cross-window callback.

Host

    require(["sand"], function(sandBox){
        var box = new sandBox();
        box.loadFrame("http://sandbox.localhost:8000", "http://sandbox.localhost:8000/sample-sandbox.html");
        box.sendCallback("evaluate", "2 + 2", function(result){
            console.log(result);
        }, true);
    });

Sandbox

    require(["sand"], function(sandBox){
        var box = new sandBox();
        box.addListener("evaluate", function(data, callback){
            callback(eval(data));
        });
        box.loadParent("http://localhost:8000");
    });
