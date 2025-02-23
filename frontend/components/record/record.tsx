import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';

interface Recording {
  uri: string;
  timestamp: Date;
}

export default function RecordScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [permissionResponse, setPermissionResponse] = useState<boolean>(false);

  useEffect(() => {
    // Request permission when component mounts
    async function getPermission() {
      const permission = await Audio.requestPermissionsAsync();
      setPermissionResponse(permission.status === 'granted');
    }
    getPermission();
  }, []);

  const startRecording = async () => {
    try {
      if (permissionResponse) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        
        setRecording(recording);
        setIsRecording(true);
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (uri) {
          setRecordings([...recordings, { uri, timestamp: new Date() }]);
        }
        setRecording(null);
        setIsRecording(false);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const playRecording = async (uri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (err) {
      console.error('Failed to play recording', err);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Record',
          headerStyle: {
            backgroundColor: '#f5f5f5',
          },
        }} 
      />
      
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
            Your Recordings
          </Text>
          
          {recordings.map((recording, index) => (
            <View 
              key={index}
              style={{
                backgroundColor: 'white',
                padding: 16,
                borderRadius: 12,
                marginBottom: 8,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <View>
                <Text style={{ fontWeight: '500' }}>Recording {index + 1}</Text>
                <Text style={{ color: '#666', fontSize: 12 }}>
                  {recording.timestamp.toLocaleTimeString()}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={() => playRecording(recording.uri)}
                style={{
                  backgroundColor: '#007AFF',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: 'white' }}>Play</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View 
          style={{
            paddingBottom: 32,
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: isRecording ? '#FF3B30' : '#007AFF',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <MaterialIcons 
              name={isRecording ? 'stop' : 'mic'} 
              size={32} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}