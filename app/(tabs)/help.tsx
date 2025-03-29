import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

interface HelpProps{}
const help:React.FC<HelpProps> = () => {
  return (
    <View className=' flex-1 justify-center items-center'>
      <Text className='text-indigo-600 text-bold text-5xl'>help</Text>
    </View>
  )
}

export default help

const styles = StyleSheet.create({})