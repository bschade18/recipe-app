import { Button, ScrollView, TextInput, View } from "react-native";

type RecipeFormValues = {
  title: string;
  description: string;
  prepMinutes: string;
  cookMinutes: string;
  servings: string;
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
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <TextInput
        value={values.title}
        onChangeText={(title) => onChange({ ...values, title })}
        placeholder="Title"
      />

      <TextInput
        value={values.description}
        onChangeText={(description) => onChange({ ...values, description })}
        placeholder="Description"
      />

      <TextInput
        value={values.prepMinutes}
        onChangeText={(prepMinutes) =>
          onChange({
            ...values,
            prepMinutes,
          })
        }
        placeholder="Prep minutes"
        keyboardType="number-pad"
      />

      <TextInput
        value={values.cookMinutes}
        onChangeText={(cookMinutes) =>
          onChange({
            ...values,
            cookMinutes,
          })
        }
        placeholder="Cook minutes"
        keyboardType="number-pad"
      />

      <TextInput
        value={values.servings}
        onChangeText={(servings) =>
          onChange({
            ...values,
            servings,
          })
        }
        placeholder="Servings"
        keyboardType="number-pad"
      />

      <Button
        title={isSubmitting ? "Saving..." : submitLabel}
        onPress={onSubmit}
        disabled={isSubmitting}
      />

      {values.ingredients.map((ingredient, index) => (
        <View key={index}>
          <TextInput
            value={ingredient}
            onChangeText={(text) => {
              const ingredients = [...values.ingredients];
              ingredients[index] = text;

              onChange({ ...values, ingredients });
            }}
            placeholder={`Ingredient ${index + 1}`}
          />

          <Button
            title="Remove"
            onPress={() => {
              const ingredients = values.ingredients.filter(
                (_, ingredientIndex) => ingredientIndex !== index,
              );

              onChange({
                ...values,
                ingredients,
              });
            }}
          />
        </View>
      ))}
      <Button
        title="Add Ingredient"
        onPress={() =>
          onChange({
            ...values,
            ingredients: [...values.ingredients, ""],
          })
        }
      />
      {values.steps.map((step, index) => (
        <View key={index}>
          <TextInput
            value={step}
            onChangeText={(text) => {
              const steps = [...values.steps];
              steps[index] = text;

              onChange({
                ...values,
                steps,
              });
            }}
            placeholder={`Step ${index + 1}`}
          />

          <Button
            title="Remove"
            onPress={() => {
              const steps = values.steps.filter(
                (_, stepIndex) => stepIndex !== index,
              );

              onChange({
                ...values,
                steps,
              });
            }}
          />
        </View>
      ))}

      <Button
        title="Add Step"
        onPress={() =>
          onChange({
            ...values,
            steps: [...values.steps, ""],
          })
        }
      />
    </ScrollView>
  );
}
