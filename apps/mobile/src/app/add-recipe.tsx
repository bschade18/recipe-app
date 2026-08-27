import { useState } from "react";
import { Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

export default function AddRecipe() {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepMinutes, setPrepMinutes] = useState("");
  const [cookMinutes, setCookMinutes] = useState("");
  const [servings, setServings] = useState("");

  const [ingredients, setIngredients] = useState([""]);
  const [steps, setSteps] = useState([""]);

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
    const payload = {
      title,
      description: description || undefined,
      prepMinutes: prepMinutes ? Number(prepMinutes) : undefined,
      cookMinutes: cookMinutes ? Number(cookMinutes) : undefined,
      servings: servings ? Number(servings) : undefined,
      ingredients: ingredients
        .map((ingredient) => ingredient.trim())
        .filter(Boolean),
      steps: steps.map((step) => step.trim()).filter(Boolean),
    };

    createRecipeMutation.mutate(payload);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
      />
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
      />
      <TextInput
        style={styles.input}
        value={prepMinutes}
        onChangeText={setPrepMinutes}
        placeholder="Prep Minutes"
        keyboardType="number-pad"
      />
      <TextInput
        style={styles.input}
        value={cookMinutes}
        onChangeText={setCookMinutes}
        placeholder="Cook Minutes"
        keyboardType="number-pad"
      />
      <TextInput
        style={styles.input}
        value={servings}
        onChangeText={setServings}
        placeholder="Servings"
        keyboardType="number-pad"
      />
      {ingredients.map((ingredient, index) => (
        <TextInput
          key={ingredient}
          style={styles.input}
          value={ingredient}
          onChangeText={(text) => {
            const updatedIngredients = [...ingredients];
            updatedIngredients[index] = text;
            setIngredients(updatedIngredients);
          }}
        />
      ))}
      <Button
        title="Add Ingredient"
        onPress={() => setIngredients([...ingredients, ""])}
      />
      {steps.map((step, index) => (
        <TextInput
          key={index}
          style={styles.input}
          value={step}
          onChangeText={(text) => {
            const updatedSteps = [...steps];
            updatedSteps[index] = text;
            setSteps(updatedSteps);
          }}
        />
      ))}
      <Button title="Add Step" onPress={() => setSteps([...steps, ""])} />

      <Button
        title={createRecipeMutation.isPending ? "Creating..." : "Create Recipe"}
        onPress={handleSubmit}
        disabled={createRecipeMutation.isPending}
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
