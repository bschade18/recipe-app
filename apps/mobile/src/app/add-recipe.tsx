import { useState } from "react";
import { Text, ScrollView, StyleSheet } from "react-native";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

import { RecipeForm } from "@/components/RecipeForm";

export default function AddRecipe() {
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

  const createRecipeMutation = useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      prepMinutes?: number;
      cookMinutes?: number;
      servings?: number;
      ingredients?: string[];
      steps: string[];
    }) => {
      const response = await fetch("http://localhost:3000/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to create recipe:", error);
        return;
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });

      router.back();
    },
  });

  const handleSubmit = async () => {
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
      notes: formValues.notes || undefined,
      ingredients: ingredients
        .map((ingredient) => ingredient.trim())
        .filter(Boolean),
      steps: steps.map((step) => step.trim()).filter(Boolean),
    };

    createRecipeMutation.mutate(payload);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <RecipeForm
        values={formValues}
        onChange={setFormValues}
        onSubmit={handleSubmit}
        submitLabel={
          createRecipeMutation.isPending ? "Creating..." : "Create Recipe"
        }
        isSubmitting={createRecipeMutation.isPending}
      />

      {createRecipeMutation.isError && (
        <Text>{createRecipeMutation.error.message}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
});
