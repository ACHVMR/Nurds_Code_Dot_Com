# Testing Lab Guide

## Overview
The Testing Lab is a powerful sandbox environment built into Nurds Code that allows you to test open source repositories, plugins, and creator tools in complete isolation.

## Purpose
- **Test Open Source Repos**: Load and test any GitHub repository
- **Try New Plugins**: Experiment with recently created plugins
- **Test Creator Tools**: Try out new video creators and other user-created tools
- **Sandbox Environment**: Everything runs in an isolated environment

## Available SDKs

The Testing Lab comes pre-configured with 6 powerful SDKs:

### 1. **Vibe Coding SDK** ⚡
Full-stack application builder
- Build web applications with AI assistance
- Connect to Intelligent Internet repositories
- Execute "Bolts" (Actions) on repositories

### 2. **OpenHands Agent SDK** 🤖
AI-powered coding agent
- Create intelligent coding agents
- Execute development tasks automatically
- Deploy agents to various targets

### 3. **Plandex CLI** 📋
Project planning and execution tool
- Create structured development plans
- Execute plans step-by-step
- Track progress and status

### 4. **OpenManus** 🖱️
UI automation and manipulation
- Automate UI interactions
- Execute complex workflows
- Capture and restore UI state

### 5. **UI-Tars** 🎨
Component generator
- Generate React components from prompts
- Modify existing components
- Test component functionality

### 6. **Claude SDK** 🧠
Anthropic's AI assistant integration
- Code generation
- Code review and optimization
- Natural language interactions

## How to Use

### Loading a Plugin

#### Option 1: Load from GitHub
1. Go to the "Load Plugin" tab
2. Enter a GitHub repository URL (e.g., `https://github.com/owner/repo`)
3. Click "Load Repository"
4. Watch the console output for status updates

#### Option 2: Load from Code
1. Go to the "Load Plugin" tab
2. Enter a name for your plugin
3. Paste your code in the textarea
4. Click "Load Code"

### Testing a Plugin

1. Switch to the "Test & Build" tab
2. Select a loaded plugin from the list
3. Click "🔨 Build It" to build and test the plugin
4. View the output in the Console panel

### Using the Console

The console output panel shows:
- SDK initialization status
- Plugin loading progress
- Build and test results
- Error messages and logs

**Actions:**
- 📋 **Copy**: Copy console output to clipboard
- ⬇️ **Download**: Download console output as a text file
- **Clear Console**: Remove all console output

## Features

### SDK Status Bar
At the top of the page, you'll see the status of all 6 SDKs:
- ✓ Green badge = SDK initialized successfully
- ✗ Red badge = SDK initialization failed

### Real-time Feedback
All actions provide immediate feedback in the console:
- Loading progress
- Success/failure messages
- SDK interactions
- Build results

### Isolated Sandbox
Each loaded plugin runs in its own sandbox environment:
- No risk to your main system
- Safe testing of untrusted code
- Clean environment for each test

## Example Workflows

### Testing a React Component
```
1. Load plugin from code
2. Paste React component code
3. Build it
4. Use UI-Tars SDK to test component
5. Use Claude SDK to review code
6. Download results
```

### Testing a GitHub Repository
```
1. Enter GitHub URL
2. Load repository
3. Select the loaded plugin
4. Build it with OpenHands Agent
5. Review console output
6. Copy results for documentation
```

### Creating a Plan with Plandex
```
1. Load your project code
2. Build it
3. Plandex CLI creates execution plan
4. Follow plan steps in console
5. Download complete execution log
```

## Best Practices

1. **Start Small**: Test small plugins first to understand the workflow
2. **Check SDK Status**: Ensure all required SDKs are initialized
3. **Monitor Console**: Keep an eye on console output for issues
4. **Save Output**: Download console logs for future reference
5. **Clear Between Tests**: Clear console between different plugin tests

## Troubleshooting

### SDK Not Initialized
If an SDK shows a red badge, refresh the page to re-initialize all SDKs.

### Plugin Won't Load
- Check that the GitHub URL is valid and public
- Ensure code is valid JavaScript/TypeScript
- Check console for specific error messages

### Build Fails
- Verify the plugin code is correct
- Check for missing dependencies
- Review error messages in console

## Integration with Other Tools

The Testing Lab works seamlessly with other Nurds Code features:
- **Vibe Editor**: Build code in the editor, test in the Lab
- **Circuit Box**: Deploy tested plugins to production
- **Boomer_Angs**: Use AI agents to help test plugins
- **Tool Catalog**: Browse and test tools from the catalog

## Future Enhancements

Coming soon:
- Real-time preview window
- Collaborative testing sessions
- Automated test generation
- Performance benchmarking
- Integration with CI/CD pipelines

---

**Need Help?** Chat with ACHEEVY for assistance or visit the documentation.
