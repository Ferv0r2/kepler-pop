import React from 'react'
import { WebView } from 'react-native-webview'

const ENDPOINT = 'https://kepler-pop.wontae.net'

const App = () => {
  const INJECTED_JAVASCRIPT = `
    window.ReactNativeWebView.postMessage('');
    true;
  `

  const handleMessage = (event: any) => {
    console.log(event)
  }

  return (
    <WebView
      source={{ uri: ENDPOINT }}
      style={{ flex: 1 }}
      injectedJavaScript={INJECTED_JAVASCRIPT}
      onMessage={handleMessage}
    />
  )
}

export default App
