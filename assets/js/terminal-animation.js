document.addEventListener('DOMContentLoaded', function() {
  const commands = [
    "clean up my database",
    "bump pied piper Q1 invoice by 10%",
    "archive inactive accounts",
    "send pitch deck to stakeholders",
    "close out stale GitHub issues",
    "delete test users in production"
  ];

  // Shuffle array to randomize order on each page load
  for (let i = commands.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [commands[i], commands[j]] = [commands[j], commands[i]];
  }

  const textEl = document.getElementById('terminal-text');
  if (!textEl) return;

  let commandIndex = 0;
  let charIndex = 0;

  const typeSpeed = 110;
  const pauseAfterType = 7000;

  function typeNextCommand() {
    const currentCommand = commands[commandIndex];

    if (charIndex < currentCommand.length) {
      textEl.textContent = currentCommand.substring(0, charIndex + 1);
      charIndex++;
      setTimeout(typeNextCommand, typeSpeed);
    } else {
      // Done typing, pause then clear and start next
      setTimeout(() => {
        textEl.textContent = '';
        charIndex = 0;
        commandIndex = (commandIndex + 1) % commands.length;
        setTimeout(typeNextCommand, 200);
      }, pauseAfterType);
    }
  }

  setTimeout(typeNextCommand, 500);
});
