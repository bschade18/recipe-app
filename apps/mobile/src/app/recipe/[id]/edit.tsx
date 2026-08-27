import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Button,
  ScrollView,
  Text,
  TextInput,
} from "react-native";

const API_URL = "http://localhost:3000";

type RecipeDetail = {
  id: string;
  title: string;
  description: string | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  servings: number | null;
  notes: string | null;
  ingredients: {
    id: string;
    position: number;
    text: string;
  }[];
  steps: {
    id: string;
    position: number;
    instruction: string;
  }[];
};

async function fetchRecipe(id: string): Promise<RecipeDetail> {
  const response = await fetch(`${API_URL}/recipes/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch recipe");
  }

  return response.json();
}

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepMinutes, setPrepMinutes] = useState("");
  const [cookMinutes, setCookMinutes] = useState("");
  const [servings, setServings] = useState("");

  const updateRecipeMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        description: description || undefined,
        prepMinutes: prepMinutes ? Number(prepMinutes) : undefined,
        cookMinutes: cookMinutes ? Number(cookMinutes) : undefined,
        servings: servings ? Number(servings) : undefined,
      };

      const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update recipe");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recipes"],
      });

      queryClient.invalidateQueries({
        queryKey: ["recipe", id],
      });

      router.back();
    },
  });

  const {
    data: recipe,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => fetchRecipe(id),
  });

  useEffect(() => {
    if (!recipe) {
      return;
    }

    setTitle(recipe.title);
    setDescription(recipe.description ?? "");
    setPrepMinutes(recipe.prep_minutes?.toString() ?? "");
    setCookMinutes(recipe.cook_minutes?.toString() ?? "");
    setServings(recipe.servings?.toString() ?? "");
  }, [recipe]);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (isError || !recipe) {
    return <Text>Failed to load recipe</Text>;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <TextInput value={title} onChangeText={setTitle} placeholder="Title" />

      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
      />

      <TextInput
        value={prepMinutes}
        onChangeText={setPrepMinutes}
        placeholder="Prep minutes"
        keyboardType="number-pad"
      />

      <TextInput
        value={cookMinutes}
        onChangeText={setCookMinutes}
        placeholder="Cook minutes"
        keyboardType="number-pad"
      />

      <TextInput
        value={servings}
        onChangeText={setServings}
        placeholder="Servings"
        keyboardType="number-pad"
      />

      <Button
        title={
          updateRecipeMutation.isPending
            ? "Updating recipe..."
            : "Update recipe"
        }
        onPress={() => updateRecipeMutation.mutate()}
        disabled={updateRecipeMutation.isPending}
      />
      <Button title="Cancel" onPress={() => router.back()} />
    </ScrollView>
  );
}
