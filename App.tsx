import React, { useEffect, useRef, useState } from 'react'
import { BackHandler, Platform } from 'react-native'
import { WebView } from 'react-native-webview'

const ENDPOINT = 'https://kepler-pop.wontae.net'

const App = () => {
  const webviewRef = useRef(null)
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    // 뒤로가기 버튼 핸들러
    const handleBackButton = () => {
      if (canGoBack && webviewRef.current) {
        ;(webviewRef.current as WebView).goBack()
        return true // 뒤로가기 이벤트
      }
      return false // 기본 동작 (앱 종료 등)
    }

    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', handleBackButton)
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackButton)
      }
    }
  }, [canGoBack])

  return (
    <WebView
      ref={webviewRef}
      source={{ uri: ENDPOINT }}
      onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
    />
  )
}

export default App
