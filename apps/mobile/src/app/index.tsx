import { Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
    isError,
  } = useQuery({
    queryKey: ["recipes"],
    queryFn: fetchRecipes,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text>Failed to load recipes</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipes</Text>

        <Link href="/add-recipe" asChild>
          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Recipe</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.recipeList}>
        {recipes?.map((recipe) => (
          <Link
            key={recipe.id}
            href={{
              pathname: "/recipe/[id]",
              params: { id: recipe.id },
            }}
            asChild
          >
            <Pressable style={styles.recipeCard}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>

              {recipe.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {recipe.description}
                </Text>
              )}

              <View style={styles.metaRow}>
                {recipe.prep_minutes !== null && (
                  <Text style={styles.meta}>
                    {recipe.prep_minutes} min prep
                  </Text>
                )}

                {recipe.cook_minutes !== null && (
                  <Text style={styles.meta}>
                    {recipe.cook_minutes} min cook
                  </Text>
                )}

                {recipe.servings !== null && (
                  <Text style={styles.meta}>{recipe.servings} servings</Text>
                )}
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
  },

  addButton: {
    backgroundColor: "#171717",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  addButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  recipeList: {
    gap: 12,
  },

  recipeCard: {
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 14,
    padding: 16,
    gap: 8,
    backgroundColor: "#ffffff",
  },

  recipeTitle: {
    fontSize: 19,
    fontWeight: "700",
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#555555",
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  meta: {
    fontSize: 13,
    color: "#777777",
  },
});
