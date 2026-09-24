import { Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";

import { API_URL } from "@/config/api";

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

console.log("API URL:", API_URL);

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const [recipeView, setRecipeView] = useState<"all" | "favorites">("all");

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

  const sortedRecipes = [...(recipes ?? [])].sort(
    (a, b) => Number(b.is_favorite) - Number(a.is_favorite),
  );

  const favoriteRecipes = sortedRecipes.filter((recipe) => recipe.is_favorite);
  const visibleRecipes = recipeView === "favorites" ? favoriteRecipes : sortedRecipes;
  const query = search.trim().toLowerCase();

  const filteredRecipes = visibleRecipes.filter((recipe) => {
    if (!query) {
      return true;
    }

    return (
      recipe.title.toLowerCase().includes(query) ||
      recipe.description?.toLowerCase().includes(query)
    );
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.headerActions}>
          <Link href="/add-recipe" asChild>
            <Pressable style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add Recipe</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.viewSelector} accessibilityRole="tablist">
          {(["all", "favorites"] as const).map((view) => (
            <Pressable
              key={view}
              accessibilityRole="tab"
              accessibilityState={{ selected: recipeView === view }}
              onPress={() => setRecipeView(view)}
              style={[
                styles.viewButton,
                recipeView === view && styles.selectedViewButton,
              ]}
            >
              <Text
                style={[
                  styles.viewButtonText,
                  recipeView === view && styles.selectedViewButtonText,
                ]}
              >
                {view === "all"
                  ? `All Recipes (${sortedRecipes.length})`
                  : `Favorites (${favoriteRecipes.length})`}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.viewDescription}>
          {recipeView === "favorites"
            ? "Your keepers — recipes worth making again."
            : "Everything you’ve saved, ready to try or make again."}
        </Text>

        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={recipeView === "favorites" ? "Search favorites..." : "Search recipes..."}
          accessibilityLabel={recipeView === "favorites" ? "Search favorites" : "Search recipes"}
          autoCapitalize="none"
        />
      </View>
      <Link href="/import-url" asChild>
        <Pressable style={styles.importButton}>
          <Text style={styles.importButtonText}>Import from URL</Text>
        </Pressable>
      </Link>

      {recipeView === "favorites" && favoriteRecipes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyText}>
            Found a keeper? Open a recipe and tap Add to Favorites to save it here.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setRecipeView("all");
              setSearch("");
            }}
            style={styles.importButton}
          >
            <Text style={styles.importButtonText}>Browse All Recipes</Text>
          </Pressable>
        </View>
      ) : sortedRecipes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No recipes yet</Text>
          <Text style={styles.emptyText}>
            Add your first recipe to get started.
          </Text>
        </View>
      ) : filteredRecipes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            {recipeView === "favorites" ? "No favorites found" : "No recipes found"}
          </Text>
          <Text style={styles.emptyText}>Try a different search.</Text>
        </View>
      ) : (
        <View style={styles.recipeList}>
          {filteredRecipes?.map((recipe) => (
            <Link
              key={recipe.id}
              href={{
                pathname: "/recipe/[id]",
                params: { id: recipe.id },
              }}
              asChild
            >
              <Pressable style={styles.recipeCard}>
                <View style={styles.recipeTitleRow}>
                  <Text style={styles.recipeTitle}>{recipe.title}</Text>

                  {recipe.is_favorite && (
                    <Text style={styles.favoriteIcon}>★</Text>
                  )}
                </View>

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
      )}
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
    gap: 14,
  },

  headerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  viewSelector: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    backgroundColor: "#ececec",
    gap: 4,
  },

  viewButton: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedViewButton: {
    backgroundColor: "#171717",
  },

  viewButtonText: {
    color: "#555555",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },

  selectedViewButtonText: {
    color: "#ffffff",
  },

  viewDescription: {
    color: "#555555",
    fontSize: 14,
    lineHeight: 20,
  },

  searchInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },

  importButton: {
    borderWidth: 1,
    borderColor: "#171717",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  importButtonText: {
    color: "#171717",
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

  recipeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  favoriteIcon: {
    fontSize: 20,
  },

  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 8,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  emptyText: {
    fontSize: 15,
    color: "#777777",
    textAlign: "center",
  },
});
