import React from 'react'
import styled from 'styled-components/native'
import { View } from 'react-native'

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
}

const TileContainer = styled(View)<{ size: number; color: string }>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  margin: 1px;
  border-radius: 8px;
  background-color: ${(props) => props.color};
  justify-content: center;
  align-items: center;
  opacity: ${(props) => (props.color === 'transparent' ? 0 : 1)};
`

export function Tile({ type, size }: TileProps) {
  const color = type === -1 ? 'transparent' : COLORS[type]
  return <TileContainer size={size} color={color} />
}
