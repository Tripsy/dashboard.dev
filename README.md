# TODO

1. Implement kill all sessions except current 
   // // This will actually remove all sessions - keep it for further implementation
   // await AccountTokenRepository.createQuery()
   //     .filterBy('user_id', policy.getUserId())
   //     .delete(false, true);
2. For template section
   - would be a nice idea to keep track of the last changes (maybe add a new column - prev version id and a button to restore to that version)
   - view presentation could be enhanced
3. Replace all console.error with logging

# IDEAS

1. Add section "documentation"
2. login with google / facebook

# SEE ALSO

     https://nextjs.org/docs/app/getting-started/partial-prerendering
     https://react.dev/learn/react-compiler/introduction

# NOTES

- 

# BUGS & ISSUES

- because Next.js can't run (io)redis in middleware, the rate limit build in middleware.ts is disabled - see commented code in middleware.ts
- there is no fall back in case Redis is not available

# RESOURCES

     https://primereact.org/datatable/
     https://nextjs.org/docs/app/api-reference/functions/use-params
     https://nextjs.org/docs/app/api-reference/components/form

# INSPIRATION

https://nexus.daisyui.com/auth/register

# LEARNING

- It is useful to remember which operations on arrays mutate them, and which don’t. For example, push, pop, reverse, 
and sort will mutate the original array, but slice, filter, and map will create a new one.
- When you choose whether to put some logic into an event handler or an Effect, the main question you need to answer 
is what kind of logic it is from the user’s perspective. If this logic is caused by a particular interaction, 
keep it in the event handler. If it’s caused by the user seeing the component on the screen, keep it in the Effect.

# SAMPLES

// Server (Node.js)
io.on("connection", (socket) => {
socket.on("send-message", (msg) => {
io.emit("new-message", msg); // Broadcast to all clients
});
});

// Client (Browser)
socket.on("new-message", (msg) => {
addMessageToUI(msg); // Update chat UI
});