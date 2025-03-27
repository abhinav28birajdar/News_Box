import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const create = () => {
  return (
     <View className="flex flex-wrap w-full p-8 gap-3">
          
          <View className="w-full rounded-xl p-8 bg-gray-300  "><Text>01</Text></View>
          <View className="w-full rounded-xl p-8 bg-gray-300"><Text>02</Text></View>
          <View className="w-full rounded-xl p-8 bg-gray-300"><Text>03</Text></View>
          <View className="w-full rounded-xl p-8 bg-gray-300"><Text>04</Text></View>
          <View className="w-full rounded-xl p-8 bg-gray-300"><Text>05</Text></View>
          <View className="w-full rounded-xl p-8 bg-gray-300"><Text>06</Text></View>
          <View className="w-full rounded-xl p-8 bg-gray-300 "><Text>07</Text></View>
        </View>
  )
}

export default create

const styles = StyleSheet.create({})