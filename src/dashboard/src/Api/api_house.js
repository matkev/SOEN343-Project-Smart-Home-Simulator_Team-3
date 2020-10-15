const houseLayout = {
  "roomLayouts": [
    {
      name: "Garage",
      windows: 0,
      lights: 1,
      doorsTo: ["Kitchen"]
    },
    {
      name: "Kitchen",
      windows: 2,
      lights: 2,
      doorsTo: ["Garage", "Living Room"]
    },
    {
      name: "Living Room",
      windows: 4,
      lights: 2,
      doorsTo: ["Kitchen"]
    }]
}

export const getHouseLayout = (callback) => {
  callback(true, houseLayout);
};
