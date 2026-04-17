const tripTypeOptions = [
  { value: "one-way", label: "One Way" },
  { value: "round-trip", label: "Round Trip" },
  { value: "multi-stop", label: "Multi Stop" },
];

const mobilityTypeOptions = [
  { value: "ambulatory", label: "Ambulatory (can walk independently)" },
  { value: "wheelchair", label: "Wheelchair (WC-accessible vehicle)" },
  { value: "stretcher", label: "Stretcher (lying-down transport)" },
  { value: "bariatric", label: "Bariatric" },
  { value: "other", label: "Other / Special Assistance" },
];

const rideStatusPillClasses = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const tripTypeLabels = {
  "one-way": "One Way",
  "round-trip": "Round Trip",
  "multi-stop": "Multi Stop",
};

const mobilityTypeLabels = {
  ambulatory: "Ambulatory",
  wheelchair: "Wheelchair",
  stretcher: "Stretcher",
  bariatric: "Bariatric",
  other: "Other",
};

const statusWorkflowAction = {
  pending: "confirmed",
  confirmed: "completed",
};

export {
  mobilityTypeLabels,
  mobilityTypeOptions,
  rideStatusPillClasses,
  statusWorkflowAction,
  tripTypeLabels,
  tripTypeOptions,
};
