import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ActivityIndicator, Button, ScrollView, Text } from "react-native";

import { RecipeForm } from "@/components/RecipeForm";

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

  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    prepMinutes: "",
    cookMinutes: "",
    servings: "",
    notes: "",
    ingredients: [""],
    steps: [""],
  });

  const updateRecipeMutation = useMutation({
    mutationFn: async () => {
      const {
        title,
        description,
        prepMinutes,
        cookMinutes,
        servings,
        notes,
        ingredients,
        steps,
      } = formValues;

      const payload = {
        title,
        description: description || undefined,
        prepMinutes: prepMinutes ? Number(prepMinutes) : undefined,
        cookMinutes: cookMinutes ? Number(cookMinutes) : undefined,
        servings: servings ? Number(servings) : undefined,
        notes: notes || undefined,
        ingredients: ingredients
          .map((ingredient) => ingredient.trim())
          .filter(Boolean),
        steps: steps.map((step) => step.trim()).filter(Boolean),
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

    setFormValues({
      title: recipe.title,
      description: recipe.description ?? "",
      prepMinutes: recipe.prep_minutes?.toString() ?? "",
      cookMinutes: recipe.cook_minutes?.toString() ?? "",
      servings: recipe.servings?.toString() ?? "",
      notes: recipe.notes ?? "",
      ingredients: recipe.ingredients.map((ingredient) => ingredient.text),
      steps: recipe.steps.map((step) => step.instruction),
    });
  }, [recipe]);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (isError || !recipe) {
    return <Text>Failed to load recipe</Text>;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <RecipeForm
        values={formValues}
        onChange={setFormValues}
        onSubmit={updateRecipeMutation.mutate}
        submitLabel={
          updateRecipeMutation.isPending
            ? "Updating recipe..."
            : "Update recipe"
        }
        isSubmitting={updateRecipeMutation.isPending}
      />
      <Button title="Cancel" onPress={() => router.back()} />
    </ScrollView>
  );
}
