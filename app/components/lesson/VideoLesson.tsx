import React from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView } from "expo-video";
import { Colors } from "../../../constants/Colors";

interface VideoLessonProps {
  videoLoading: boolean;
  videoUrl: string | null;
  player: any;
}

export function VideoLesson({ videoLoading, videoUrl, player }: VideoLessonProps) {
  return (
    <View style={styles.videoContainer}>
      {videoLoading ? (
        <LinearGradient
          colors={["#1A3020", "#0D1F17", "#1A2E22"]}
          style={styles.videoPlayer}
        >
          <ActivityIndicator size="large" color="#FFF" />
        </LinearGradient>
      ) : videoUrl ? (
        <VideoView
          player={player}
          style={{ width: "100%", height: 220 }}
          nativeControls
          contentFit="contain"
          allowsFullscreen
          allowsPictureInPicture
        />
      ) : (
        <LinearGradient
          colors={["#1A3020", "#0D1F17", "#1A2E22"]}
          style={styles.videoPlayer}
        >
          <View style={styles.videoOverlay}>
            <Text style={{ fontSize: 80 }}>🎵</Text>
          </View>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: { marginBottom: 0 },
  videoPlayer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  videoOverlay: { position: "absolute", opacity: 0.2 },
});
