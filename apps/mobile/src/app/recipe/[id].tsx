import { useLocalSearchParams, router, Link } from "expo-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ActivityIndicator, ScrollView, Text, Button } from "react-native";

const API_URL = "http://localhost:3000";

type RecipeDetail = {
  id: string;
  title: string;
  description: string | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  servings: number | null;
  notes: string | null;
  is_favorite: boolean;
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
    throw new Error("Error fetching recipe");
  }

  return response.json();
}

export default function RecipeDetailScreen() {
  const queryClient = useQueryClient();

  const { id } = useLocalSearchParams<{ id: string }>();

  const deleteRecipeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete recipe");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recipes"],
      });

      queryClient.removeQueries({
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

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (isError || !recipe) {
    return <Text>Failed to load recipe</Text>;
  }

  console.log("Queried Recipe", recipe);
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text>{recipe.title}</Text>

      {recipe.description && <Text>{recipe.description}</Text>}

      <Text>Prep: {recipe.prep_minutes}</Text>
      <Text>Cook: {recipe.cook_minutes}</Text>
      <Text>Servings: {recipe.servings}</Text>
      <Text>{recipe.notes}</Text>

      <Text>Ingredients</Text>
      {recipe.ingredients.map((ingredient, index) => (
        <Text key={index}>{ingredient.text}</Text>
      ))}

      <Text>Steps</Text>
      {recipe.steps.map((step, index) => (
        <Text key={index}>{step.instruction}</Text>
      ))}

      <Button
        title={
          deleteRecipeMutation.isPending
            ? "Deleting recipe..."
            : "Delete recipe"
        }
        onPress={() => deleteRecipeMutation.mutate()}
        disabled={deleteRecipeMutation.isPending}
      />

      <Link
        href={{
          pathname: "/recipe/[id]/edit",
          params: { id },
        }}
      >
        Edit Recipe
      </Link>
    </ScrollView>
  );
}
