SandJS
======

JavaScript Sandboxing &amp; "Blackboxing".

SandJS allows communication between two windows, a host and a child iframe.

Sandboxing
----------

Requirements: Two domains. For example, [hileco.com](http://hileco.com) ("Host Domain") and sandbox.hileco.com ("Sandbox Domain"). The sandbox domain must be solely dedicated to executing potentially unsafe JavaScript ("Code").

Sandboxing allows you to execute code in the sandbox domain, without it being able to harm the host domain. The host domain connects to the sandbox domain via SandJS, and can then send code across for the sandbox domain to interpret and or execute.

Blackboxing
-----------

Requirements: Two domains. For example, [hileco.com](http://hileco.com) ("Host Domain" &amp; "Blackbox Domain") and sandbox.hileco.com ("Sandbox Domain"). The blackbox domain has information, which the sandbox domain must never know.

Blackboxing allows the sandbox domain to interact with the blackbox domain, for example; a blackbox domain could send out HTTP requests to a backend, requests which contain a user's session token. The sandbox domain should never have the user's session token. The solution to this is blackboxing, the sandbox domain can execute code which may need such an HTTP request to be sent, the sandbox domain can then "ask" the blackbox domain, via SandJS, to perform such a request, the blackbox domain can safely send the request to the backend, the backend can verify the session token, and the blackbox can return the result back to the sandbox domain.
