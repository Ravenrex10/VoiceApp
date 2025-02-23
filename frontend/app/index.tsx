import RecordScreen from "@/components/record/record";
import { View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <RecordScreen />
    </View>
  );
}
