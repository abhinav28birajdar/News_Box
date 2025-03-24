import { View, Text, Image, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { images } from "@/constants/images";

const data = [
  { id: "1", title: "Justice Yeshwant Varma stays away from court, police & fire service silent on incident", image: "https://via.placeholder.com/400x200" },
  { id: "2", title: "Devendra Fadnavis says cost of damages will be recovered from Nagpur 'rioter'", image: "https://via.placeholder.com/400x200" },
  { id: "3", title: "Delimitation suits only BJP as it dominates North: CM Vijayan at Opposition meet", image: "https://via.placeholder.com/400x200" },
  { id: "4", title: "Delimitation suits only BJP as it dominates North: CM Vijayan at Opposition meet", image: "https://via.placeholder.com/400x200" },
];

const Card = ({ title, images }) => (
  <View className=" rounded-lg overflow-hidden w-full h-60 shadow-lg bg-white m-2">
    <Image className="w-full h-40 object-cover" source={{ uri: images }} />
    <View className="px-4 py-">
      <Text className="font-bold text-md text-black">{title}</Text>
    </View>
  </View>
);

export default function App() {
  return (
    <ScrollView className="mt-10" showsVerticalScrollIndicator={false}>
      <View className="flex-1 justify-center items-center text-indigo-700">
        <Image source={images.bg} className="absolute w-full z-0 top-2" style={{ width: "100%" }} />
        <Image source={images.newsbox} className="absolute w-10 z-0 top-40" style={{ width: "100%" }} />
      </View>

      {/* Search Bar */}
      <View className="mx-5 mt-60 bg-white rounded-full flex-row items-center shadow-lg p-3">
        <TextInput placeholder="Search here" className="flex-1 text-black px-3" />
      </View>

      {/* Filter Buttons */}
      <View className="flex-row  gap-3 my-5">
        {["Sports", "Political", "Tech", "Others","World"].map((category) => (
          <TouchableOpacity key={category} className="bg-indigo-700 px-6 py-2 rounded-full">
            <Text className="text-white text-sm">{category}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* News Cards */}
      {data.map((item) => (
        <Card key={item.id} title={item.title} images={item.image} />
      ))}
    </ScrollView>
  );
}
