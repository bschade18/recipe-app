import { router, useLocalSearchParams, Link } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
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
    throw new Error("Failed to fetch recipe");
  }

  return response.json();
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const {
    data: recipe,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => fetchRecipe(id),
  });

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

  const handleDelete = () => {
    Alert.alert("Delete recipe?", "This action cannot be undone.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteRecipeMutation.mutate(),
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !recipe) {
    return (
      <View style={styles.centered}>
        <Text>Failed to load recipe</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{recipe.title}</Text>

        {recipe.description && (
          <Text style={styles.description}>{recipe.description}</Text>
        )}
      </View>

      <View style={styles.metaCard}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Prep</Text>
          <Text style={styles.metaValue}>
            {recipe.prep_minutes ?? "—"}
            {recipe.prep_minutes !== null ? " min" : ""}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Cook</Text>
          <Text style={styles.metaValue}>
            {recipe.cook_minutes ?? "—"}
            {recipe.cook_minutes !== null ? " min" : ""}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Servings</Text>
          <Text style={styles.metaValue}>{recipe.servings ?? "—"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients</Text>

        {recipe.ingredients.map((ingredient) => (
          <View key={ingredient.id} style={styles.ingredientRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.ingredientText}>{ingredient.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Steps</Text>

        {recipe.steps.map((step) => (
          <View key={step.id} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{step.position}</Text>
            </View>

            <Text style={styles.stepText}>{step.instruction}</Text>
          </View>
        ))}
      </View>

      {recipe.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{recipe.notes}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Link
          href={{
            pathname: "/recipe/[id]/edit",
            params: { id },
          }}
          asChild
        >
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Edit Recipe</Text>
          </Pressable>
        </Link>

        <Pressable
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={deleteRecipeMutation.isPending}
        >
          <Text style={styles.deleteButtonText}>
            {deleteRecipeMutation.isPending ? "Deleting..." : "Delete Recipe"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 48,
    gap: 28,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    gap: 8,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
  },

  description: {
    fontSize: 16,
    lineHeight: 23,
    color: "#555555",
  },

  metaCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 14,
    padding: 16,
  },

  metaItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },

  metaLabel: {
    fontSize: 12,
    color: "#777777",
  },

  metaValue: {
    fontSize: 15,
    fontWeight: "600",
  },

  section: {
    gap: 12,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "700",
  },

  ingredientRow: {
    flexDirection: "row",
    gap: 8,
  },

  bullet: {
    fontSize: 18,
  },

  ingredientText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ececec",
    alignItems: "center",
    justifyContent: "center",
  },

  stepNumberText: {
    fontWeight: "700",
  },

  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
  },

  notes: {
    fontSize: 16,
    lineHeight: 23,
    color: "#555555",
  },

  actions: {
    gap: 10,
    marginTop: 8,
  },

  primaryButton: {
    backgroundColor: "#171717",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },

  deleteButton: {
    borderWidth: 1,
    borderColor: "#d92d20",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },

  deleteButtonText: {
    color: "#b42318",
    fontSize: 16,
    fontWeight: "700",
  },
});
