import { Text } from '../../../ui/Typography';
import React from "react";
import { ActivityIndicator, View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import { VideoView } from "expo-video";
import { Theme } from "../../../constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";

interface VideoLessonProps {
  videoLoading: boolean;
  videoUrl: string | null;
  player: any;
  error?: string;
  onRetry?: () => void;
}

export function VideoLesson({ videoLoading, videoUrl, player, error, onRetry }: VideoLessonProps) {
  return (
    <View style={styles.videoContainer}>
      {videoLoading ? (
        <LinearGradient
          colors={Theme.panelGradient}
          style={styles.videoPlayer}
        >
          <ActivityIndicator size="large" color={Colors.primary} />
        </LinearGradient>
      ) : videoUrl && !error ? (
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
          colors={Theme.panelGradient}
          style={styles.videoPlayer}
        >
          <View style={styles.videoOverlay}>
            <Ionicons name="videocam-outline" size={40} color={Colors.primary} />
            <Text accessibilityRole={error ? 'alert' : undefined} style={{ color: Colors.light.textSecondary, marginTop: 12 }}>{error || 'Video chưa sẵn sàng'}</Text>
            {onRetry && <TouchableOpacity accessibilityRole="button" onPress={onRetry} style={[Theme.button, { marginTop: 12 }]}><Text style={Theme.buttonText}>Tải lại video</Text></TouchableOpacity>}
          </View>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: { marginBottom: 0 },
  videoPlayer: {
    minHeight: 220,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  videoOverlay: { alignItems: "center", padding: 20 },
});
