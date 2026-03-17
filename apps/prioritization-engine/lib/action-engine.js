import { PRIORITY_CONFIG } from "./config.js";

function topN(items, count) {
  return items.slice(0, count);
}

export function buildActionQueue({
  guidePriorities,
  publishCandidates,
  familyPriorities,
  categoryPriorities,
  modifierPriorities,
  audiencePriorities,
  packPriorities
}) {
  const limits = PRIORITY_CONFIG.queueLimits;

  const refresh = topN(
    guidePriorities.filter((item) => item.actionClass === "refresh_now"),
    limits.refresh
  );

  const promote = topN(
    guidePriorities.filter((item) => item.actionClass === "promote_now"),
    limits.promote
  );

  const inspect = topN(
    [
      ...guidePriorities.filter((item) => item.actionClass === "inspect"),
      ...categoryPriorities.filter((item) => item.actionClass === "inspect"),
      ...familyPriorities.filter((item) => item.actionClass === "inspect")
    ],
    limits.inspect
  );

  const suppress = topN(
    [
      ...guidePriorities.filter((item) => item.actionClass === "suppress"),
      ...familyPriorities.filter((item) => item.actionClass === "deprioritize")
    ],
    limits.suppress
  );

  const replace = topN(
    guidePriorities.filter((item) => item.actionClass === "replace"),
    limits.replace
  );

  const publish = topN(
    publishCandidates.filter((item) => item.actionClass === "expand_now"),
    limits.publish
  );

  const familyExpansion = topN(
    familyPriorities.filter((item) => item.actionClass === "expand_now"),
    15
  );

  const packExpansion = topN(
    packPriorities.filter((item) => item.actionClass === "expand_now"),
    10
  );

  const policies = {
    boostModifiers: topN(modifierPriorities.filter((item) => item.priorityScore >= 65), 10),
    weakenModifiers: topN(modifierPriorities.filter((item) => item.priorityScore <= 35), 10),
    boostAudiences: topN(audiencePriorities.filter((item) => item.priorityScore >= 65), 10),
    weakenAudiences: topN(audiencePriorities.filter((item) => item.priorityScore <= 35), 10),
    accelerateCategories: topN(categoryPriorities.filter((item) => item.priorityScore >= 68), 10),
    inspectCategories: topN(categoryPriorities.filter((item) => item.actionClass === "inspect"), 10)
  };

  return {
    publish,
    refresh,
    promote,
    inspect,
    suppress,
    replace,
    familyExpansion,
    packExpansion,
    policies
  };
}
