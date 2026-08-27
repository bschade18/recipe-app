import { useEffect, useState } from "react";
import { Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, Text, View } from "react-native";

const API_URL = "http://localhost:3000";

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  servings: number | null;
  is_favorite: boolean;
};

async function fetchRecipes(): Promise<Recipe[]> {
  const response = await fetch(`${API_URL}/recipes`);

  if (!response.ok) {
    throw new Error("Failed to fetch recipes");
  }

  return response.json();
}

export default function HomeScreen() {
  const {
    data: recipes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recipes"],
    queryFn: fetchRecipes,
  });

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Failed to load recipes</Text>;
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text>Recipe App</Text>
      <Link href="/add-recipe">Add Recipe</Link>
      {recipes?.map((recipe) => (
        <Link
          key={recipe.id}
          href={{ pathname: "/recipe/[id]", params: { id: recipe.id } }}
        >
          {recipe.title}
        </Link>
      ))}
    </View>
  );
}
