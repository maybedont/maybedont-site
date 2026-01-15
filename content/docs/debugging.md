---
title: Testing & Debugging
weight: 5
---

The MCP Inspector is a browser-based tool for testing and debugging MCP server connections. It's useful for verifying that your gateway is working correctly before integrating with AI clients like Claude Code.

## Using MCP Inspector

1. **Start the gateway** in HTTP mode (as described in the [Configuration](/docs/configuration/) guide)

2. **Launch MCP Inspector:**
   ```bash
   npx @modelcontextprotocol/inspector
   ```

3. **Open your browser** to http://localhost:6274

4. **Configure the connection:**
   - Set the transport to `Streamable HTTP`
   - Use `http://localhost:8080/mcp` as the URL

5. **Add authentication headers** (if required):
   - Click "Add Custom Header"
   - For GitHub access, add:
     - **Header name:** `X-GitHub-Token`
     - **Header value:** Your GitHub Personal Access Token

6. **Explore available tools** in the Tools tab - you can now test tool calls and see how the gateway processes them

## What the Inspector Shows

The inspector shows you:
- Available tools from all configured downstream servers
- Tool call requests and responses
- Any blocks or warnings from the gateway's security policies
- Audit logs in real-time

## Common Use Cases

This is particularly useful for:
- Testing custom security rules before deploying
- Debugging authentication issues
- Understanding what tools are available from your MCP servers
- Verifying that the gateway is correctly routing requests
