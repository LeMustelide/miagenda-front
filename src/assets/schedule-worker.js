self.addEventListener("message", (event) => {
  const { data } = event.data;
  const selectedGroups = new Set(event.data.selectedGroups);

  const filteredData = {
    ...data,
    data: data.data.filter((item) => {
      return item.groups.some((group) => selectedGroups.has(group));
    }),
  };

  self.postMessage(filteredData);
});
