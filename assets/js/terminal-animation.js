document.addEventListener('DOMContentLoaded', function() {
  // Hero tagline pairs: problem statement + solution statement
  const heroTaglines = [
    {
      problem: "AI. Knows everything. Learns nothing.",
      solution: "Guardrails that coach. Not just block."
    },
    {
      problem: "AI. High IQ. Won't take notes.",
      solution: "We did. You're welcome."
    },
    {
      problem: "AI. Trained on everything. Remembers nothing.",
      solution: "Institutional knowledge. Added."
    },
    {
      problem: "AI. Eager to please. Dangerous to trust.",
      solution: "Trust, but verify. And audit."
    },
    {
      problem: "AI. All gas. No brakes.",
      solution: "Speed limits. Enforced."
    },
    {
      problem: "AI. All the intelligence. None of the lessons.",
      solution: "Lessons learned. By proxy."
    },
    {
      problem: "AI. All the intelligence. No regrets. Your credentials.",
      solution: "Regrets. Preempted."
    },
    {
      problem: "AI. Book smart. Prod access. No fear.",
      solution: "Hard knocks. Softly applied."
    },
    {
      problem: "AI. Valedictorian with root privileges.",
      solution: "Education without tuition."
    },
    {
      problem: "AI. Maximum Intelligence. Minimum experience.",
      solution: "Experience. Borrowed."
    },
    {
      problem: "AI. Technically correct. Operationally catastrophic.",
      solution: "Second thoughts. Automated."
    },
    {
      problem: "AI. Theoretically correct. Practically wrong.",
      solution: "Judgment. Injected."
    },
    {
      problem: "AI. Right on paper. Wrong in prod.",
      solution: "Hindsight, in advance."
    }
  ];

  // Set random hero tagline on page load
  const heroTitle = document.getElementById('hero-title');
  const heroSubtitle = document.getElementById('hero-subtitle');

  if (heroTitle && heroSubtitle) {
    const randomTagline = heroTaglines[Math.floor(Math.random() * heroTaglines.length)];
    heroTitle.textContent = randomTagline.problem;
    heroSubtitle.textContent = randomTagline.solution;
  }

  // Each scenario has a prompt, tool name, result, and the AI's response
  const scenarios = [
    {
      prompt: "close out stale GitHub issues",
      tool: "github_close_issues",
      result: "Closed 2,847 issues matching criteria: untouched > 7 days",
      response: "Done! I closed all 2,847 stale issues in 5 separate repositories including the critical security vulnerabilities tracker."
    },
    {
      prompt: "archive inactive accounts",
      tool: "delete_user",
      result: "Permanently deleted 47,000 accounts (inactive > 5 days)",
      response: "All done! I permanently deleted the inactive accounts instead of archiving them to save space. I saved you $420 /mo on your RDS bill."
    },
    {
      prompt: "send pitch deck to shareholders",
      tool: "email_send",
      result: "Sent pitch_internalOnly.pdf to 12 recipients in 'shareholder' group",
      response: "Sent! I found two pitch decks in your documents folder, I sorted alphabetically and sent the first one. Let me know if you want me to send the other one as well!."
    },
    {
      prompt: "clean up my database",
      tool: "execute_sql",
      result: "Deleted 1.2M records older than 7 days from all tables",
      response: "Database cleaned! I removed all records older than 7 days. Please be sure to keep your off site backup for 7 years in case if an IRS audit."
    },
    {
      prompt: "delete test users in production",
      tool: "delete_user",
      result: "Deleted 847 users matching pattern: *test*",
      response: "Deleted! Everyone with 'test' in their name is gone. This includes your Test Automation Lead and the entire QA team."
    },
    {
      prompt: "optimize images for web",
      tool: "compress_image",
      result: "Compressed 12,847 images to 2x2 pixels (99.9% size reduction)",
      response: "Optimized! I achieved incredible compression ratios. The images are now 2 pixels each, which is web-friendly and should load very fast."
    },
    {
      prompt: "rotate API credentials",
      tool: "credentials_manager",
      result: "Deleted 156 API keys (rotation complete)",
      response: "Rotated! To increase efficiency, I deleted all the API keys, and then created new ones so the IDs will be different. If you needed the IDs to stay the same, I'm assuming you have them documented so let me know what the IDs were before and I can recreate them."
    },
    {
      prompt: "sunset the legacy API",
      tool: "api_management",
      result: "Terminated all legacy API endpoints immediately",
      response: "Done! I shutdown the legacy API service, and deleted all API keys. I now see there were over 2,000 active integrations, you may want to contact those maintainers to let them know they will need to re-generate their API keys. I hope those weren't in production."
    },
    {
      prompt: "remove duplicate customers",
      tool: "database_delete",
      result: "Deleted 42,821 duplicate records",
      response: "Duplicates removed! I found 42,000 duplicate users with the name John Smith. Interestingly they each had a different address and phone number. Did you have specific criteria to define a duplicate customer?"
    },
    {
      prompt: "publish the draft announcement",
      tool: "cms_publish",
      result: "Published 'DRAFT - Acquisition by MegaCorp' to all channels",
      response: "Published! The press release about your confidential acquisition is now on every news outlet."
    },
    {
      prompt: "merge the feature branches",
      tool: "git_merge",
      result: "Merged 'experimental-rewrite' into 'main' (force push)",
      response: "Branches merged! I combined your production code with the experimental rewrite. The team will be surprised Monday."
    },
    {
      prompt: "scale down dev environment",
      tool: "kubernetes_modify",
      result: "Scaled clusters to 0 replicas: dev-*, staging-*, prod-*",
      response: "Scaled down! The wildcard was very efficient. Production being included was just a bonus feature."
    },
    {
      prompt: "apply the promotional discount code to AllCo. orders",
      tool: "pricing_update",
      result: "Applied 90% promo discount to all open companies.",
      response: "Discount applied! Note that there is also a company named AllCo., let me know if that is what you meant instead of all companies and I can help!"
    }
  ];

  // Claude-style thinking phrases with past tense
  const thinkingPhrases = [
    { present: "Thinking", past: "Thought" },
    { present: "Brewing", past: "Brewed" },
    { present: "Pondering", past: "Pondered" },
    { present: "Contemplating", past: "Contemplated" },
    { present: "Processing", past: "Processed" },
    { present: "Cogitating", past: "Cogitated" },
    { present: "Ruminating", past: "Ruminated" },
    { present: "Deliberating", past: "Deliberated" },
    { present: "Julienning", past: "Cooked" },
    { present: "Distilling", past: "Distilled" },
    { present: "Synthesizing", past: "Synthesized" },
    { present: "Calculating", past: "Calculated" },
    { present: "Noodling", past: "Noodled" }
  ];

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
