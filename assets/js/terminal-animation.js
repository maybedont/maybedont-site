document.addEventListener('DOMContentLoaded', function() {
  // Load data from Hugo-injected global (see data/hero.yaml)
  const data = window.terminalData || {};
  const heroTaglines = data.heroTaglines || [];
  const scenarios = data.scenarios || [];
  const thinkingPhrases = data.thinkingPhrases || [];

  // Helper function to wrap sentences in nowrap spans
  function wrapSentences(text) {
    // Split on period followed by space, keeping the period with each phrase
    const sentences = text.split(/(?<=\.)\s+/);
    return sentences.map(s => '<span class="nowrap">' + s + '</span>').join(' ');
  }

  // Set random hero tagline on page load
  const heroTitle = document.getElementById('hero-title');
  const heroSubtitle = document.getElementById('hero-subtitle');

  if (heroTitle && heroSubtitle && heroTaglines.length > 0) {
    const randomTagline = heroTaglines[Math.floor(Math.random() * heroTaglines.length)];
    heroTitle.textContent = randomTagline.problem;
    heroSubtitle.innerHTML = wrapSentences(randomTagline.solution);
  }

  // Shuffle scenarios
  for (let i = scenarios.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [scenarios[i], scenarios[j]] = [scenarios[j], scenarios[i]];
  }

  // Get DOM elements
  const outputArea = document.getElementById('hero-output');
  const inputText = document.getElementById('hero-input-text');
  const inputCursor = document.getElementById('hero-cursor');
  const anotherBtn = document.getElementById('hero-another-btn');
  const terminalHint = document.getElementById('hero-terminal-hint');

  if (!outputArea || !inputText) return;

  let scenarioIndex = 0;

  // Timing configuration
  const typeSpeed = 85;              // ms per character when typing
  const thinkingMinDuration = 2000;  // min time for thinking (2s)
  const thinkingMaxDuration = 5000;  // max time for thinking (5s)
  const toolCallDelay = 500;         // delay before tool call appears
  const resultDelay = 700;           // delay before result appears
  const responseDelay = 600;         // delay before response appears
  const fadeOutDuration = 400;       // fade out duration

  // Handle "another" button click
  if (anotherBtn) {
    anotherBtn.addEventListener('click', function() {
      // Hide hint during animation
      if (terminalHint) {
        terminalHint.style.opacity = '0';
        terminalHint.style.pointerEvents = 'none';
      }

      // Fade out and start next scenario
      outputArea.style.transition = 'opacity ' + fadeOutDuration + 'ms';
      outputArea.style.opacity = '0';

      setTimeout(() => {
        outputArea.style.opacity = '1';
        outputArea.style.transition = '';
        scenarioIndex = (scenarioIndex + 1) % scenarios.length;
        runScenario();
      }, fadeOutDuration + 100);
    });
  }

  function getRandomThinkingDuration() {
    return Math.floor(Math.random() * (thinkingMaxDuration - thinkingMinDuration + 1)) + thinkingMinDuration;
  }

  function getRandomThinkingPhrase() {
    if (thinkingPhrases.length === 0) {
      return { present: "Thinking", past: "Thought" };
    }
    return thinkingPhrases[Math.floor(Math.random() * thinkingPhrases.length)];
  }

  function clearOutput() {
    outputArea.innerHTML = '';
  }

  function addToOutput(html, className) {
    const div = document.createElement('div');
    div.className = className || '';
    div.innerHTML = html;
    outputArea.appendChild(div);
    return div;
  }

  function typeInInput(text, callback) {
    let i = 0;
    inputText.textContent = '';
    inputCursor.style.display = 'inline-block';

    function type() {
      if (i < text.length) {
        inputText.textContent = text.substring(0, i + 1);
        i++;
        setTimeout(type, typeSpeed);
      } else {
        // Brief pause after typing completes
        setTimeout(callback, 300);
      }
    }
    type();
  }

  function runScenario() {
    if (scenarios.length === 0) return;

    const scenario = scenarios[scenarioIndex];
    clearOutput();
    inputText.textContent = '';
    inputCursor.style.display = 'inline-block';

    // Step 1: Type the prompt in the input area
    typeInInput(scenario.prompt, () => {
      // Clear input, move command to output (keep cursor visible)
      inputText.textContent = '';

      // Add command to output area
      addToOutput(
        '<span class="command-text">› ' + scenario.prompt + '</span>',
        'hero-output-command'
      );

      // Step 2: Show thinking indicator
      const thinking = getRandomThinkingPhrase();
      const thinkingEl = addToOutput(
        '<span class="thinking-icon">✱</span> <span class="thinking-text">' + thinking.present + '...</span>',
        'hero-thinking'
      );

      const thinkingStartTime = Date.now();
      const randomThinkingDuration = getRandomThinkingDuration();

      setTimeout(() => {
        // Keep thinking colored, just remove the animated ellipsis feel
        // It stays as "Thinking..." until response is fully typed

        // Step 3: Show tool call
        setTimeout(() => {
          addToOutput(
            '<span class="tool-icon">⏺</span> <span class="tool-name">' + scenario.tool + '</span> <span class="tool-type">(MCP)</span>',
            'hero-tool-call'
          );

          setTimeout(() => {
            // Step 4: Show tool result
            addToOutput(
              '<span class="result-corner">⎿</span> <span class="result-text">' + scenario.result + '</span>',
              'hero-tool-result'
            );

            setTimeout(() => {
              // Step 5: Show AI response with icon, typed out character by character
              const responseEl = addToOutput(
                '<span class="response-icon">⏺</span> <span class="response-text"></span>',
                'hero-response'
              );
              const responseTextEl = responseEl.querySelector('.response-text');

              // Type out the response
              let charIndex = 0;
              const responseText = scenario.response;
              const responseTypeSpeed = 30; // AI typing speed

              function typeResponse() {
                if (charIndex < responseText.length) {
                  responseTextEl.textContent = responseText.substring(0, charIndex + 1);
                  charIndex++;
                  setTimeout(typeResponse, responseTypeSpeed);
                } else {
                  // Response fully typed - now update thinking indicator with final elapsed time
                  const elapsedTime = Date.now() - thinkingStartTime;
                  const formattedTime = elapsedTime >= 1000
                    ? (elapsedTime / 1000).toFixed(1) + 's'
                    : elapsedTime + 'ms';
                  thinkingEl.className = 'hero-thinking-done';
                  thinkingEl.innerHTML = '<span class="thinking-icon">✱</span> <span class="thinking-text">' + thinking.past + ' for ' + formattedTime + '</span>';

                  // Show the hint with "another" button
                  if (terminalHint) {
                    terminalHint.style.opacity = '1';
                    terminalHint.style.pointerEvents = 'auto';
                  }
                }
              }

              typeResponse();
            }, responseDelay);
          }, resultDelay);
        }, toolCallDelay);
      }, randomThinkingDuration);
    });
  }

  // Start the animation after a brief delay
  setTimeout(runScenario, 800);
});
