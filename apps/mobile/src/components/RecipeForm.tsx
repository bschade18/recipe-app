import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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

type RecipeFormProps = {
  values: RecipeFormValues;
  onChange: (values: RecipeFormValues) => void;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
};

export function RecipeForm({
  values,
  onChange,
  onSubmit,
  submitLabel,
  isSubmitting = false,
}: RecipeFormProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recipe Details</Text>

        <TextInput
          style={styles.input}
          value={values.title}
          onChangeText={(title) => onChange({ ...values, title })}
          placeholder="Recipe title"
        />

        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={values.description}
          onChangeText={(description) =>
            onChange({
              ...values,
              description,
            })
          }
          placeholder="Description"
          multiline
          textAlignVertical="top"
        />

        <View style={styles.detailsRow}>
          <View style={styles.detailField}>
            <Text style={styles.label}>Prep</Text>

            <TextInput
              style={styles.input}
              value={values.prepMinutes}
              onChangeText={(prepMinutes) =>
                onChange({
                  ...values,
                  prepMinutes,
                })
              }
              placeholder="Min"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.detailField}>
            <Text style={styles.label}>Cook</Text>

            <TextInput
              style={styles.input}
              value={values.cookMinutes}
              onChangeText={(cookMinutes) =>
                onChange({
                  ...values,
                  cookMinutes,
                })
              }
              placeholder="Min"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.detailField}>
            <Text style={styles.label}>Servings</Text>

            <TextInput
              style={styles.input}
              value={values.servings}
              onChangeText={(servings) =>
                onChange({
                  ...values,
                  servings,
                })
              }
              placeholder="4"
              keyboardType="number-pad"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients</Text>

        {values.ingredients.map((ingredient, index) => (
          <View key={index} style={styles.listRow}>
            <TextInput
              style={[styles.input, styles.listInput]}
              value={ingredient}
              onChangeText={(text) => {
                const ingredients = [...values.ingredients];
                ingredients[index] = text;

                onChange({
                  ...values,
                  ingredients,
                });
              }}
              placeholder={`Ingredient ${index + 1}`}
            />

            <Pressable
              style={styles.removeButton}
              onPress={() => {
                const ingredients = values.ingredients.filter(
                  (_, ingredientIndex) => ingredientIndex !== index,
                );

                onChange({
                  ...values,
                  ingredients,
                });
              }}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </Pressable>
          </View>
        ))}

        <Pressable
          style={styles.secondaryButton}
          onPress={() =>
            onChange({
              ...values,
              ingredients: [...values.ingredients, ""],
            })
          }
        >
          <Text style={styles.secondaryButtonText}>+ Add Ingredient</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Steps</Text>

        {values.steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={styles.stepNumberContainer}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>

            <View style={styles.stepContent}>
              <TextInput
                style={[styles.input, styles.stepInput]}
                value={step}
                onChangeText={(text) => {
                  const steps = [...values.steps];
                  steps[index] = text;

                  onChange({
                    ...values,
                    steps,
                  });
                }}
                placeholder="Describe this step"
                multiline
                textAlignVertical="top"
              />

              <Pressable
                onPress={() => {
                  const steps = values.steps.filter(
                    (_, stepIndex) => stepIndex !== index,
                  );

                  onChange({
                    ...values,
                    steps,
                  });
                }}
              >
                <Text style={styles.removeLink}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <Pressable
          style={styles.secondaryButton}
          onPress={() =>
            onChange({
              ...values,
              steps: [...values.steps, ""],
            })
          }
        >
          <Text style={styles.secondaryButtonText}>+ Add Step</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>

        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={values.notes}
          onChangeText={(notes) =>
            onChange({
              ...values,
              notes,
            })
          }
          placeholder="Add any notes..."
          multiline
          textAlignVertical="top"
        />
      </View>

      <Pressable
        style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.primaryButtonText}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 48,
    gap: 28,
  },

  section: {
    gap: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },

  multilineInput: {
    minHeight: 90,
  },

  detailsRow: {
    flexDirection: "row",
    gap: 10,
  },

  detailField: {
    flex: 1,
  },

  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  listInput: {
    flex: 1,
  },

  removeButton: {
    paddingVertical: 10,
    paddingHorizontal: 6,
  },

  removeButtonText: {
    color: "#b42318",
    fontWeight: "600",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#b8b8b8",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },

  secondaryButtonText: {
    fontWeight: "600",
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ececec",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  stepNumber: {
    fontWeight: "700",
  },

  stepContent: {
    flex: 1,
    gap: 6,
  },

  stepInput: {
    minHeight: 80,
  },

  removeLink: {
    color: "#b42318",
    fontWeight: "600",
    alignSelf: "flex-start",
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

  disabledButton: {
    opacity: 0.5,
  },
});
