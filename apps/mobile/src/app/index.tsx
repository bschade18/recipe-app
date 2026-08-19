import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const API_URL = "http://localhost:3000";

export default function HomeScreen() {
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        setStatus(data.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    checkApi();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {!status && !error && <ActivityIndicator />}

      {status && <Text>API status: {status}</Text>}

      {error && <Text>API error: {error}</Text>}
    </View>
  );
}
