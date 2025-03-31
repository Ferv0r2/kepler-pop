import React from 'react'
import { WebView } from 'react-native-webview'

const ENDPOINT = 'https//kepler-pop.wontae.net'

const App = () => {
  return <WebView source={{ uri: ENDPOINT }} style={{ flex: 1 }} />
}

export default App
