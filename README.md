# Ghidra Setup for Solana Binaries with MCP Server

This repository provides a setup for running Ghidra with extensions to analyze Solana binaries, specifically the eBPF and MCP (model context protocol) extensions. The MCP server enables integration with Claude Desktop for a collaborative reverse engineering workflow.

It aggregates two key sources of open source work:
[text](https://github.com/LaurieWired/GhidraMCP)
[text](https://github.com/riptl/ghidra-ebpf)

the ebpf extension make solana program secodeable by ghidra and the mcp protocol for ghidra abstracts away most of the complexity. 
Connecting these tools together allows for extracting the idl solely from the deployed binary of a solana smart contract.
Demo - watch at 2x speed 

[text](https://www.loom.com/share/bb99150ae1a6492c940a38de69978463?sid=4585ba0e-d42c-4f25-868f-b68a35211537)

**Note**: The containerization is a work in progress. For a cleaner and more stable experience, we recommend running Ghidra locally and connecting it to Claude Desktop via the MCP server. The extensions and binaries are included in this directory for convenience.

You will have to download the ghidra release yourslef:
[text](https://github.com/NationalSecurityAgency/ghidra)

## Introduction

This guide will help you:
- Build and run a Docker container with Ghidra
- Open Ghidra for the first time and enable developer mode
- Install the MCP and eBPF extensions
- Load a Solana binary from the `binaries` directory
- Connect the MCP server to Claude Desktop

## Prerequisites

Before you begin, ensure you have:
- **Docker** installed on your machine
- **Claude Desktop** installed
- Basic familiarity with SSH and terminal commands

The following files from this directory are required:
- `Dockerfile`
- `ghidra_11.3.1_PUBLIC/`
- `ghidra-ebpf-0.1.zip`
- `GhidraMCP-1-0.zip`
- `binaries/`
- `bridge_mcp_ghidra.py`

## Building and Running the Docker Container

1. **Build the Docker image**:
   
   Open a terminal in the `lernean-lens` directory and run:
   ```bash
   docker build -t ghidra-container .
   ```

   This builds the image using the provided Dockerfile, installing Ghidra, the extensions, and dependencies.

2. **Run the container**:
   ```bash
   docker run -d -p 2222:22 -p 8080:8080 --name ghidra-container ghidra-container
   ```

   - `-d`: Runs the container in the background
   - `-p 2222:22`: Maps SSH to port 2222 on your host
   - `-p 8080:8080`: Maps the MCP server port (adjust if needed)
   - `--name`: Names the container for easy reference

## Opening Ghidra for the First Time

1. **SSH into the container**:
   ```bash
   ssh ghidrauser@localhost -p 2222
   ```

   Password: `ghidra` (defined in the Dockerfile)

   Note: Enable X11 forwarding with `ssh -X` if you want to display the GUI (requires an X11 server like XQuartz on macOS).

2. **Launch Ghidra**:
   
   Inside the container, run:
   ```bash
   /opt/ghidra/ghidraRun
   ```

   The Ghidra interface should appear if X11 forwarding is set up correctly.

## Enabling Developer Mode and Installing Extensions

1. **Enable Developer Mode**:
   - In Ghidra, go to File → Configure
   - Check "Developer Mode" and click "OK"

2. **Install the MCP and eBPF Extensions**:
   - Go to File → Install Extensions
   - Click the "+" button and select `/opt/ghidra/Extensions/ghidra-ebpf-0.1.zip`
   - Click the "+" button again and select `/opt/ghidra/Extensions/GhidraMCP-1-0.zip`
   - Click "OK" to install both extensions

3. **Restart Ghidra**:
   
   Close Ghidra and relaunch it with:
   ```bash
   /opt/ghidra/ghidraRun
   ```

   The extensions will now be active.

## Loading a Binary

To load and analyze a Solana binary (e.g., jup.so) from the binaries directory:

1. **Import the binary**:
   
   In the container's terminal, run:
   ```bash
   /opt/ghidra/support/analyzeHeadless /tmp ghidra_project -import /opt/ghidra/binaries/jup.so -loader ElfLoader -loader-applyRelocations false -processor eBPF:LE:64:default -noanalysis -overwrite
   ```

   This creates a Ghidra project at `/tmp/ghidra_project` and imports the binary without immediate analysis.

2. **Analyze the binary**:
   ```bash
   /opt/ghidra/support/analyzeHeadless /tmp ghidra_project -process jup.so
   ```

   This processes the imported binary, applying auto-analysis.

3. **View the binary**:
   - Open Ghidra, go to File → Open Project, and select `/tmp/ghidra_project`
   - Double-click jup.so to open it in the CodeBrowser

## Connecting to Claude Desktop

To connect the MCP server to Claude Desktop:

1. **Start the MCP Server**:
   - Open a project in Ghidra's CodeBrowser (e.g., the one from the previous step)
   - The MCP server should start automatically if the extension is installed correctly

2. **Configure Claude Desktop**:
   
   Edit your Claude Desktop configuration file (e.g., `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):
   ```json
   {
       "mcpServers": {
           "ghidra": {
               "command": "/path/to/venv/bin/python3",
               "args": [
                   "/path/to/lernean-lens/bridge_mcp_ghidra.py"
               ]
           }
       }
   }
   ```

   - Replace `/path/to/venv/bin/python3` with the path to your Python virtual environment's python3 executable
   - Replace `/path/to/lernean-lens/bridge_mcp_ghidra.py` with the absolute path to `bridge_mcp_ghidra.py` in your lernean-lens directory
   - Open claude and it should be added.

## Notes

- **Containerization Status**: The Docker setup is still being refined. For a smoother workflow, consider installing Ghidra locally, adding the extensions from this directory (`ghidra-ebpf-0.1.zip` and `GhidraMCP-1-0.zip`), and connecting it to Claude Desktop via the MCP server.

- **Included Files**: The MCP and eBPF extensions, sample binaries, and the `bridge_mcp_ghidra.py` script are provided in this directory for your use.

- **Troubleshooting**: If the GUI doesn't display, ensure X11 forwarding is enabled and an X11 server is running on your host machine.