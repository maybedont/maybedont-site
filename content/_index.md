---
title: "Maybe Don't - Guardrails for Agentic AI"
description: "Guardrails for agentic AI. Real-time monitoring, intelligent policy enforcement, and comprehensive audit logging."
toc: false
layout: home
---

<div class="hero-with-terminal hero-stacked">
  <h1 id="hero-title" class="hero-title-full">AI. All the intelligence. None of the lessons.</h1>
  <div class="hero-lower-row">
    <div class="hero-content">
      <p><strong id="hero-subtitle">Lessons learned. By proxy.</strong></p>
      <div class="hx:mt-8 hx:flex hx:flex-wrap hx:gap-4">
        <a href="https://cal.com/kmillermd/30min" class="cta-primary" data-ga="book_demo" data-ga-location="hero">
          Book a Demo
        </a>
      </div>
    </div>
    <div class="hero-terminal-wrapper">
      <div class="hero-terminal hero-terminal-full">
        <div class="terminal-chrome">
          <span class="terminal-dot red"></span>
          <span class="terminal-dot yellow"></span>
          <span class="terminal-dot green"></span>
        </div>
        <div class="hero-terminal-output" id="hero-output">
          <!-- Content gets dynamically inserted here -->
        </div>
        <div class="hero-terminal-input-area">
          <span class="prompt-char">❯</span>
          <span class="input-text" id="hero-input-text"></span>
          <span class="input-cursor" id="hero-cursor"></span>
        </div>
      </div>
      <p class="hero-terminal-hint" id="hero-terminal-hint"><button class="hero-another-btn" id="hero-another-btn" title="See another example">Again! ↻</button></p>
    </div>
  </div>
</div>

<div class="scroll-indicator">
  <svg class="scroll-indicator-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
</div>

<div class="feature-grid">
  <div class="feature-cell">
    <h3 class="feature-heading">Observability</h3>
    <p class="feature-description">Stop guessing what your agents do, start knowing. What is being allowed may be equally interesting to what is being blocked.</p>
    <div class="feature-graphic feature-graphic-auditing">
      <div class="audit-table">
        <div class="audit-row header">
          <span class="audit-time">Time</span>
          <span class="audit-action">Action</span>
          <span class="audit-status">Result</span>
        </div>
        <div class="audit-row">
          <span class="audit-time">14:23</span>
          <span class="audit-action">list_customers</span>
          <span class="audit-status ok">allow</span>
        </div>
        <div class="audit-row">
          <span class="audit-time">14:24</span>
          <span class="audit-action">delete_data</span>
          <span class="audit-status review">deny</span>
        </div>
        <div class="audit-row">
          <span class="audit-time">14:25</span>
          <span class="audit-action">send_email</span>
          <span class="audit-status audit">audit only</span>
        </div>
      </div>
    </div>
  </div>
  <div class="feature-cell">
    <h3 class="feature-heading">Compliance</h3>
    <p class="feature-description">Your game, your rules. Want all your icons in cornflower blue? We won't get in the way.</p>
    <div class="feature-graphic feature-graphic-standards">
      <div class="config-panel">
        <div class="config-row header">
          <span class="config-label">Policy</span>
          <span class="config-header-toggle">Enabled</span>
        </div>
        <div class="config-row">
          <span class="config-label">Require coversheet on TPS reports</span>
          <span class="toggle on"></span>
        </div>
        <div class="config-row">
          <span class="config-label">Verify decimal point in the right place</span>
          <span class="toggle off"></span>
        </div>
        <div class="config-row">
          <span class="config-label">Minimum uniform flair count >= 15</span>
          <span class="toggle on"></span>
        </div>
      </div>
    </div>
  </div>
  <div class="feature-cell feature-cell-full">
    <h3 class="feature-heading">Prevention</h3>
    <p class="feature-description">When AI does something stupid, Maybe Don't kindly responds with a no, and an explanation. It is sort of like parenting teenagers, we're not angry, just disappointed.</p>
    <div class="feature-graphic feature-graphic-regret">
      <div class="terminal-chrome">
        <span class="terminal-dot red"></span>
        <span class="terminal-dot yellow"></span>
        <span class="terminal-dot green"></span>
      </div>
      <div class="terminal-output">
        <div class="command-line">
          <span class="command-text">› clean up old user data</span>
        </div>
        <div class="tool-call">
          <span class="tool-icon error">⏺</span>
          <span class="tool-name">maybedont</span>
          <span class="tool-type">(MCP)</span>
        </div>
        <div class="tool-error">
          <span class="error-corner">⎿</span>
          <span class="error-text">
            <strong>Error:</strong> Request denied by policy 'stop deleting prod': Deleting prod data via MCP is not permitted.<br><br>    To proceed, consider: using a different tool, modifying parameters to
    avoid restricted operations, or asking the user for guidance on allowed
    alternatives.  </span>
        </div>
        <div class="prevention-response">
          <span class="response-icon">⏺</span>
          <span class="response-text">I'm sorry, Dave. I'm afraid I can't do that. I cannot allow you to take this restricted action.<br><br>Would you like me to propose an alternate solution that does not include deleting production data, or disconnecting me?</span>
        </div>
        <div class="prevention-thinking-done">
          <span class="thinking-icon">✱</span>
          <span class="thinking-text">Contemplated for 4.2s</span>
        </div>
      </div>
      <div class="terminal-prompt-input">
        <span class="prompt-char">❯</span>
        <span class="prompt-text"></span>
      </div>
    </div>
  </div>
</div>

<div class="closing-cta">
  <h2 class="closing-cta-heading">Ready to get started?</h2>
  <p class="closing-cta-subtext">See how Maybe Don't can help you deploy AI agents with confidence.</p>
  <a href="https://cal.com/kmillermd/30min" class="cta-primary" data-ga="book_demo" data-ga-location="bottom_cta">Book a Demo</a>
</div>
