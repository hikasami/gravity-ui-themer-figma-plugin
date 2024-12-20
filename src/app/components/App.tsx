import React, { useEffect, useState } from 'react';

import '../styles/root.css';
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import { Button, Label, Text, TextArea, TextInput, Box, Overlay, Loader } from '@gravity-ui/uikit';

function App() {
  const [cssContent, setCssContent] = useState('');
  const [message, setMessage] = useState('');
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [isTextUploaded, setIsTextUploaded] = useState(false);
  const [fileName, setFileName] = useState('');

  const [status, setStatus] = useState<string>(''); // State to hold the current status
  const [showConsoleOption, setShowConsoleOption] = useState<boolean>(false); // State to control console option visibility

  
  useEffect(() => {
    window.onmessage = (event) => {
      const { type, message } = event.data.pluginMessage;
      if (type === 'status') {
        setStatus(message);
        if (message === 'failed') {
          setShowConsoleOption(true);
        } else {
          setShowConsoleOption(false);
        }
      }
    };
  }, []);

  const handleClosePlugin = () => {
    parent.postMessage({ pluginMessage: { type: 'close-plugin' } }, '*');
  };

  const handleRetry = () => {
    setStatus('');
  };

  const handleOpenConsole = () => {
    parent.postMessage({ pluginMessage: { type: 'open-console' } }, '*');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => setCssContent(e.target.result as string);
    reader.readAsText(file);
    setIsFileUploaded(true);
    setFileName(file.name);
    setIsTextUploaded(false);
  };

  const handleTextChange = (event) => {
    setCssContent(event.target.value);
    setIsFileUploaded(false);
    setIsTextUploaded(true);
  };

  const parseCss = (css) => {
    const variables = {};
    const regex = /--([\w-]+):\s*([^;]+);/g;
    let match;
    while ((match = regex.exec(css)) !== null) {
      variables[match[1]] = match[2];
    }
    return variables;
  };

  const handleSubmit = () => {
    const variables = parseCss(cssContent);
    window.parent.postMessage({ pluginMessage: { type: 'create-variables', variables } }, '*');
    setStatus('loading');
  };

  window.addEventListener('message', (event) => {
    const { pluginMessage } = event.data;
    if (pluginMessage && pluginMessage.type === 'variables-created') {
      setMessage(pluginMessage.message);
    }
  });

  return (
    <Box position="relative" className='gravity-ui-themer-figma'>
      <div className='g-flex g-box gravity-ui-themer-figma__title'>
        <Text variant='display-1'>Gravity UI Themer</Text>
        <Text variant='body-1'>Upload a CSS file or paste CSS code to create variables</Text>
      </div>

      <div className='gravity-ui-themer-figma__form'>
        <div style={{position: 'relative'}}>
          <TextInput placeholder={isFileUploaded ? 'CSS file uploaded - ' + fileName : 'Upload a CSS file here'} leftContent={<span style={{marginLeft: '8px'}}><Label theme={isFileUploaded ? 'success' : 'unknown'}>{isFileUploaded ? 'Success' : 'Choose CSS file'}</Label></span>} />
          <input type="file" onChange={handleFileUpload} accept=".css" style={{position: 'absolute', left: 0, width: '100%', height: '100%', opacity: 0}}/>
        </div>

        <TextArea
          rows={8}
          onChange={handleTextChange}
          value={cssContent}
          placeholder="Paste CSS code here"
          style={{width: "auto", maxWidth: "100%"}}
          controlProps={{style: {resize: "both"}}}
        />

        <Button onClick={handleSubmit} view="action" size="l" disabled={!isFileUploaded && !isTextUploaded}>Create Variables</Button>
      </div>

      {status === 'loading' && <Overlay visible={true}><Loader /></Overlay>}
      {status === 'success' && 
        <Overlay visible={true} className='gravity-ui-themer-figma__overlay_content'>
          <Text variant='display-1'>Success</Text>
          <Text variant='body-1'>Variables created successfully</Text>
          <div className='g-flex g-box gravity-ui-themer-figma__overlay_content_buttons'>
            <Button onClick={handleRetry} view="action" size="l">Try again</Button>
            <Button onClick={handleClosePlugin} view="action" size="l">Close Plugin</Button>
          </div>
        </Overlay>
      }

      {status === 'failed' && 
        <Overlay visible={true} className='gravity-ui-themer-figma__overlay_content'>
          <Text variant='display-1'>Failed</Text>
          <Text variant='body-1'>Something went wrong</Text>
          <Button onClick={handleRetry} view="action" size="l">Try again</Button>
          <Button onClick={handleOpenConsole} view="action" size="l">Open Console {showConsoleOption}</Button>
        </Overlay>
      }

      <p style={{opacity: 0}}>{message}</p>
    </Box>
  );
}

export default App;
