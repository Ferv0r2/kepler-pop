import React from 'react'
import styled from 'styled-components/native'
import { TouchableOpacity } from 'react-native'

const COLORS = [
  '#FF6B6B', // 빨강
  '#4ECDC4', // 청록
  '#45B7D1', // 하늘
  '#96CEB4', // 연두
  '#FFEEAD', // 노랑
]

type TileProps = {
  type: number
  size: number
  isSelected?: boolean
  onPress: () => void
}

const TileButton = styled(TouchableOpacity)<{
  size: number
  color: string
  isSelected?: boolean
}>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  margin: 1px;
  border-radius: 8px;
  background-color: ${(props) => props.color};
  justify-content: center;
  align-items: center;
  border-width: ${(props) => (props.isSelected ? '3px' : '0')};
  border-color: ${(props) => (props.isSelected ? '#FFD700' : 'transparent')};
  opacity: ${(props) => (props.color === 'transparent' ? 0 : 1)};
`

export default function Tile({ type, size, isSelected, onPress }: TileProps) {
  return (
    <TileButton
      size={size}
      color={type === -1 ? 'transparent' : COLORS[type]}
      isSelected={isSelected}
      onPress={onPress}
    />
  )
}
