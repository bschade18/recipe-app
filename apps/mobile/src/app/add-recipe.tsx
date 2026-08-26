import { useState } from "react";
import { TextInput, Button, ScrollView, StyleSheet } from "react-native";

export default function AddRecipe() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepMinutes, setPrepMinutes] = useState("");
  const [cookMinutes, setCookMinutes] = useState("");
  const [servings, setServings] = useState("");

  const [ingredients, setIngredients] = useState([""]);
  const [steps, setSteps] = useState([""]);

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

    try {
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

      const recipe = await response.json();
      console.log("Created recipe:", recipe);
    } catch (error) {
      console.error("Request failed:", error);
    }
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
          key={index}
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

      <Button title="Create Recipe" onPress={handleSubmit} />
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
