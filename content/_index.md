---
title: Maybe Don't, AI
toc: false
layout: home
---

<div class="hero-with-terminal">
  <div class="hero-content">
    <h1>All the intelligence. None of the lessons.</h1>
    <p><strong>AI Guardrails that coach, not just block. Policy with a feedback loop.</strong></p>
    <div class="hx:mt-8 hx:flex hx:flex-wrap hx:gap-4">
      <a href="https://cal.com/kmillermd/30min" class="cta-primary">
        Book a Demo
      </a>
    </div>
  </div>
  <div class="hero-terminal-wrapper">
    <div class="hero-terminal">
      <div class="hero-terminal-input">
        <span class="hero-terminal-prompt">&gt;</span>
        <span class="hero-terminal-text" id="terminal-text"></span>
        <span class="hero-terminal-cursor"></span>
      </div>
    </div>
  </div>
</div>

<div class="feature-grid">
  <div class="feature-cell">
    <h3 class="feature-heading">Observability</h3>
    <p class="feature-description">Stop guessing what your agents do, start knowing. What is being allowed may be more interesting that what is being blocked.</p>
    <div class="feature-graphic feature-graphic-auditing">
      <div class="audit-table">
        <div class="audit-row header">
          <span class="audit-time">time</span>
          <span class="audit-action">action</span>
          <span class="audit-status">result</span>
        </div>
        <div class="audit-row">
          <span class="audit-time">14:23</span>
          <span class="audit-action">query customers</span>
          <span class="audit-status ok">allow</span>
        </div>
        <div class="audit-row">
          <span class="audit-time">14:24</span>
          <span class="audit-action">export data</span>
          <span class="audit-status review">deny</span>
        </div>
        <div class="audit-row">
          <span class="audit-time">14:25</span>
          <span class="audit-action">send email</span>
          <span class="audit-status audit">audit only</span>
        </div>
      </div>
    </div>
  </div>
  <div class="feature-cell">
    <h3 class="feature-heading">Compliance</h3>
    <p class="feature-description">Your standards. Its blind spot. Our coverage. Want all your icon in cornflower blue? We're not the boss of you.</p>
    <div class="feature-graphic feature-graphic-standards">
      <div class="config-panel">
        <div class="config-row">
          <span class="config-label">coversheet on your TPS report</span>
          <span class="toggle on"></span>
        </div>
        <div class="config-row">
          <span class="config-label">decimal point in the right place</span>
          <span class="toggle off"></span>
        </div>
        <div class="config-row">
          <span class="config-label">minimum flair >= 15</span>
          <span class="toggle on"></span>
        </div>
      </div>
    </div>
  </div>
  <div class="feature-cell feature-cell-full">
    <h3 class="feature-heading">Prevention</h3>
    <p class="feature-description">When the AI demonstrates poor judgment, we can say no, and explain why. It is sort of like parenting teenagers.</p>
    <div class="feature-graphic feature-graphic-regret">
      <div class="terminal-window">
        <div class="command-line">
          <span class="prompt">›</span>
          <span class="command-text">help me clean up old user data</span>
        </div>
        <div class="tool-call">
          <span class="tool-icon">⏺</span>
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
        <div class="response-text">I'm sorry, Dave.  I'm afraid I can't do that. I'm told this action was blocked because deleting production is bad.<br><br>Would you like me to propose a different way to help you clean up old user data that does not include deleting production data? </div>
      </div>
    </div>
  </div>
</div>
