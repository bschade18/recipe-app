import { useState } from "react";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { API_URL } from "@/config/api";
import { RecipeForm } from "@/components/RecipeForm";

type ImportedRecipe = {
  title: string;
  description: string;
  prepMinutes?: number;
  cookMinutes?: number;
  servings?: number;
  ingredients: string[];
  steps: string[];
};

type RecipeFormValues = {
  title: string;
  description: string;
  prepMinutes: string;
  cookMinutes: string;
  servings: string;
  notes: string;
  ingredients: string[];
  steps: string[];
};

export default function ImportUrlScreen() {
  const queryClient = useQueryClient();

  const [url, setUrl] = useState("");

  const [formValues, setFormValues] = useState<RecipeFormValues | null>(null);

  const importMutation = useMutation({
    mutationFn: async (url: string): Promise<ImportedRecipe> => {
      const response = await fetch(`${API_URL}/recipes/import-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message ?? "Failed to import recipe");
      }

      return response.json();
    },

    onSuccess: (recipe) => {
      setFormValues({
        title: recipe.title,
        description: recipe.description,
        prepMinutes: recipe.prepMinutes?.toString() ?? "",
        cookMinutes: recipe.cookMinutes?.toString() ?? "",
        servings: recipe.servings?.toString() ?? "",
        notes: "",
        ingredients: recipe.ingredients,
        steps: recipe.steps,
      });
    },
  });

  const createRecipeMutation = useMutation({
    mutationFn: async (values: RecipeFormValues) => {
      const payload = {
        title: values.title,
        description: values.description || undefined,
        prepMinutes: values.prepMinutes
          ? Number(values.prepMinutes)
          : undefined,
        cookMinutes: values.cookMinutes
          ? Number(values.cookMinutes)
          : undefined,
        servings: values.servings ? Number(values.servings) : undefined,
        notes: values.notes || undefined,
        ingredients: values.ingredients
          .map((ingredient) => ingredient.trim())
          .filter(Boolean),
        steps: values.steps.map((step) => step.trim()).filter(Boolean),
      };

      const response = await fetch(`${API_URL}/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message ?? "Failed to create recipe");
      }

      return response.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recipes"],
      });

      router.back();
    },
  });

  if (formValues) {
    return (
      <RecipeForm
        values={formValues}
        onChange={setFormValues}
        onSubmit={() => createRecipeMutation.mutate(formValues)}
        submitLabel="Save Recipe"
        isSubmitting={createRecipeMutation.isPending}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Recipe</Text>

      <Text style={styles.description}>
        Paste a recipe URL and we'll pull in the recipe details.
      </Text>

      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="https://..."
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />

      <Pressable
        style={[
          styles.button,
          importMutation.isPending && styles.disabledButton,
        ]}
        onPress={() => importMutation.mutate(url.trim())}
        disabled={importMutation.isPending || !url.trim()}
      >
        {importMutation.isPending ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Import Recipe</Text>
        )}
      </Pressable>

      {importMutation.isError && (
        <Text style={styles.errorText}>{importMutation.error.message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 14,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  description: {
    fontSize: 16,
    lineHeight: 22,
    color: "#555555",
  },

  input: {
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },

  button: {
    backgroundColor: "#171717",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.5,
  },

  errorText: {
    color: "#b42318",
  },
});
