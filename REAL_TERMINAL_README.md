# 🚀 Entropy Real Terminal

A fully functional, browser-based development environment powered by WebAssembly and modern browser APIs.

## ✨ Features

### 🗄️ **Real File System (OPFS)**
- **Persistent Storage**: Files saved in your browser persist across sessions
- **Native File Operations**: Create, read, write, delete files and directories
- **Real Paths**: Proper directory navigation with absolute and relative paths
- **Fast Access**: Uses Origin Private File System for optimal performance

### 🐍 **Python Environment (Pyodide)**
- **Full Python 3.11**: Complete Python interpreter running in WebAssembly
- **Scientific Libraries**: Pre-loaded with NumPy, Pandas, Matplotlib, Requests
- **Package Installation**: Install any pure Python package with `python -m pip install`
- **Interactive REPL**: Full Python shell with code execution
- **Script Execution**: Run `.py` files directly from the file system

### 📦 **Node.js Environment (WebContainers)**
- **Real Node.js**: Actual Node.js runtime, not emulation
- **NPM Package Manager**: Install and manage npm packages
- **Project Scaffolding**: Create package.json, run scripts, build projects
- **Dev Servers**: Start development servers with live reload
- **Interactive REPL**: Node.js shell for testing JavaScript code

### 🔧 **Git Operations (isomorphic-git)**
- **Full Git Workflow**: Clone, commit, push, pull, branch operations
- **Remote Repositories**: Work with GitHub, GitLab, and other Git hosts
- **Version Control**: Complete git functionality for project management
- **Repository Management**: Initialize repos, manage remotes, view history

## 🛠️ **Available Commands**

### File System
```bash
ls, dir          # List directory contents
cd <path>        # Change directory
pwd              # Print working directory
mkdir <name>     # Create directory
touch <file>     # Create empty file
cat <file>       # Display file contents
rm <file>        # Remove file
echo <text>      # Print text
```

### Python
```bash
python           # Start Python REPL
python <file>    # Execute Python file
python -c <code> # Execute Python code
python -m pip install <package>  # Install Python package
```

### Node.js
```bash
node             # Start Node.js REPL
node <file>      # Execute JavaScript file
npm install <pkg> # Install npm package
npm run <script> # Run npm script
npm init         # Initialize package.json
```

### Git
```bash
git init         # Initialize repository
git clone <url>  # Clone repository
git add <files>  # Stage files
git commit -m "message" # Commit changes
git status       # Show status
git log          # Show commit history
git branch       # List/create branches
git checkout <branch> # Switch branches
git remote       # Manage remotes
git push/pull    # Sync with remote
```

## 🌟 **Use Cases**

### **Learning & Education**
- Learn Python, JavaScript, and Git in a sandboxed environment
- Experiment with code without local setup
- Follow tutorials and courses

### **Prototyping & Development**
- Quick prototyping of Python scripts and Node.js applications
- Test npm packages before local installation
- Work on projects from any device

### **Portfolio & Demos**
- Showcase coding skills in a shareable environment
- Create interactive coding demonstrations
- Build and deploy small projects

### **Remote Development**
- Access a development environment from anywhere
- No local installation required
- Works on any modern browser

## 🚀 **Getting Started**

1. **Access the Terminal**: Navigate to `/real-terminal` in Entropy Tools
2. **Initialize**: The file system and Git engine initialize automatically
3. **Start Coding**: Use `python` or `node` to start interactive sessions
4. **Create Projects**: Use `mkdir` to create project directories
5. **Install Packages**: Use `npm install` or `python -m pip install`
6. **Version Control**: Use `git init` to start tracking your projects

## 💡 **Pro Tips**

- **File Persistence**: Files are saved in your browser's OPFS and persist across sessions
- **Python Libraries**: Matplotlib plots will display inline in supported environments
- **Node.js Servers**: Development servers can be accessed via localhost URLs
- **Git Authentication**: Use personal access tokens for private repositories
- **Performance**: WebAssembly provides near-native performance for Python and Node.js

## 🔧 **Technical Details**

### **Architecture**
- **Frontend**: React with TypeScript
- **File System**: Origin Private File System (OPFS) API
- **Python**: Pyodide WebAssembly build
- **Node.js**: WebContainers technology by StackBlitz
- **Git**: isomorphic-git for browser-compatible Git operations

### **Browser Requirements**
- **OPFS Support**: Chrome 86+, Firefox 111+, Safari 15.2+
- **WebAssembly**: All modern browsers
- **Secure Context**: HTTPS required for WebContainers

### **Limitations**
- **Binary Compatibility**: Some native Python packages may not work
- **Network Access**: Limited by browser security policies
- **Performance**: Slightly slower than native environments
- **Storage**: Limited by browser storage quotas

## 🤝 **Contributing**

This Real Terminal is part of the Entropy Tools suite. Contributions and improvements are welcome!

## 📜 **License**

Part of Entropy Tools - Check main project license.

---

**Built with ❤️ by the Entropy Tools team**

*Bringing the power of real development environments to the browser!* 