import ghidra.app.script.GhidraScript;
import ghidra.framework.plugintool.*;

public class StartMCPServer extends GhidraScript {
    @Override
    public void run() throws Exception {
        // Check if a program is loaded
        if (currentProgram == null) {
            println("No program loaded!");
            return;
        }
        
        // Print the loaded program's name for verification
        println("Program loaded: " + currentProgram.getName());
        
        // Get the PluginTool instance from the script's state
        PluginTool tool = state.getTool();
        if (tool == null) {
            println("No PluginTool available!");
            return;
        }
        
        // Load and enable the GhidraMCPPlugin
        try {
            String pluginClassName = "com.lauriewired.GhidraMCPPlugin";
            Class<?> pluginClass = Class.forName(pluginClassName);
            Plugin plugin = (Plugin) pluginClass.getConstructor(PluginTool.class).newInstance(tool);
            tool.addPlugin(plugin);
            println("GhidraMCP Plugin added to tool successfully.");
            
            // Note: If the plugin has a specific method like startServer(), you could call it here.
            // For example: plugin.getClass().getMethod("startServer").invoke(plugin);
            // Without decompiling the JAR, we assume the server starts upon plugin initialization.
        } catch (Exception e) {
            println("Failed to load GhidraMCP plugin: " + e.getMessage());
            e.printStackTrace();
        }
        
        // Keep the script running to prevent Ghidra from exiting
        println("Starting MCP server...");
        while (true) {
            Thread.sleep(1000); // Sleep to keep the process alive
        }
    }
}