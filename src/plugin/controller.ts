figma.showUI(__html__, { width: 420, height: 500 });

figma.ui.onmessage = (msg) => {
  console.log('Received message:', msg);
  if (msg.type === 'create-variables') {
    figma.ui.postMessage({ type: 'status', message: 'loading' });

    const variables: Record<string, string> = msg.variables;

    // Create a new variable collection with a single mode
    const collection = figma.variables.createVariableCollection("gravity-colors");
    const modeId = collection.modes[0].modeId; // Use the default mode
    collection.name = "Gravity Colors";

    collection.renameMode(collection.modes[0].modeId, "light");

    const groupedVariables: Record<string, any[]> = {
      Brand: [],
      Text: [],
      Private: [],
      Misc: []
    };

    // Create color variables and set values for the single mode
    for (const [name, value] of Object.entries(variables)) {
      if (name.startsWith('g-color')) {
        const groupName = getGroupName(name);
        const variableName = `${groupName}/${name}`;
        const colorVariable = figma.variables.createVariable(variableName, collection, "COLOR");
        colorVariable.name = variableName;
        console.log(variableName, value);
        const color = parseColor(value);

        if (color) {
          colorVariable.setValueForMode(modeId, { r: color.r, g: color.g, b: color.b, a: color.a });
          console.log(`Created variable for ${variableName} with color:`, color); // Debugging line
        } else {
          console.log(`Failed to parse color for ${variableName}`); // Debugging line
        }

        groupedVariables[groupName].push(colorVariable);
      }
    }

    console.log('Grouped Variables:', groupedVariables);

    if (Object.keys(variables).length === 0) {
      figma.ui.postMessage({ type: 'status', message: 'failed' });
      return;
    } else {
      figma.ui.postMessage({
        type: 'variables-created',
        message: `Created ${Object.keys(variables).length} variables`,
      });
  
      figma.ui.postMessage({ type: 'status', message: 'success' });
    }
  } else if (msg.type === 'close-plugin') {
    figma.closePlugin();
  } else if (msg.type === 'open-console') {
    // No direct API call to open console, but you can guide the user :(
  } else {
    figma.ui.postMessage({ type: 'status', message: 'failed' });
  }
};

function parseColor(value: string): { r: number, g: number, b: number, a: number } | null {
  // Match rgba or rgb format
  const rgba = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgba) {
    return {
      r: parseInt(rgba[1]) / 255, // Normalize to [0, 1]
      g: parseInt(rgba[2]) / 255, // Normalize to [0, 1]
      b: parseInt(rgba[3]) / 255, // Normalize to [0, 1]
      a: rgba[4] ? parseFloat(rgba[4]) : 1, // Default to 1 if no alpha is provided
    };
  }

  // Match hex format
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    return {
      r: parseInt(hex[1].substring(0, 2), 16) / 255,
      g: parseInt(hex[1].substring(2, 4), 16) / 255,
      b: parseInt(hex[1].substring(4, 6), 16) / 255,
      a: 1, // Default to 1 for hex colors
    };
  }

  // Return null if parsing fails
  return null;
}

function getGroupName(variableName: string): string {
  if (variableName.startsWith('g-color-private-brand')) return 'Brand';
  if (variableName.startsWith('g-color-private-text')) return 'Text';
  if (variableName.startsWith('g-color-private')) return 'Private';
  return 'Misc';
}