import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
export default function App() { return <SafeAreaView style={styles.root}><StatusBar style="light"/><WebView source={{ uri: "https://esporte.ddtech.cloud" }} style={styles.web} sharedCookiesEnabled thirdPartyCookiesEnabled={false}/></SafeAreaView>; }
const styles=StyleSheet.create({root:{flex:1,backgroundColor:"#07111f"},web:{flex:1,backgroundColor:"#07111f"}});
