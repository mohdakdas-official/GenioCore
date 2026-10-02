import { MODEL_REGISTRY } from "./modelRegistry.js";

const isEnabled = (value) =>
  value === true || String(value).trim().toLowerCase() === "true";

const calculateScore = ({ model, routingMode }) => {
  switch (routingMode) {
    case "FAST":
      return (
        model.speedScore * 0.55 +
        model.qualityScore * 0.25 +
        model.costScore * 0.2
      );

    case "QUALITY":
      return (
        model.qualityScore * 0.65 +
        model.speedScore * 0.2 +
        model.costScore * 0.15
      );

    case "BALANCED":
    case "AUTO":
    default:
      return (
        model.qualityScore * 0.45 +
        model.speedScore * 0.3 +
        model.costScore * 0.25
      );
  }
};

const selectModelCandidates = ({
  reviewType,
  routingMode,
  requestedProvider,
  requestedModel,
}) => {
  /*
   * MANUAL means exactly what the user selected.
   * Do not silently switch to another provider.
   */
  if (routingMode === "MANUAL") {
    const model = MODEL_REGISTRY.find(
      (item) =>
        isEnabled(item.enabled) &&
        item.providerModel &&
        item.provider === requestedProvider &&
        item.id === requestedModel &&
        item.capabilities.includes(reviewType),
    );

    if (!model) {
      throw new Error("Requested AI model is unavailable");
    }

    return [model];
  }

  const eligibleModels = MODEL_REGISTRY.filter(
    (model) =>
      isEnabled(model.enabled) &&
      model.providerModel &&
      model.capabilities.includes(reviewType),
  );

  if (eligibleModels.length === 0) {
    throw new Error("No AI model is available for this review");
  }

  return eligibleModels
    .map((model) => ({
      ...model,

      routingScore: calculateScore({
        model,
        routingMode,
      }),
    }))
    .sort((a, b) => b.routingScore - a.routingScore);
};

/*
 * Keep this for code that only needs the preferred model.
 */
const selectModel = (options) => {
  return selectModelCandidates(options)[0];
};

export { selectModel, selectModelCandidates };
