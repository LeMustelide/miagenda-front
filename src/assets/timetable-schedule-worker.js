onmessage = function (e) {
  const { data, date, selectedGroups } = e.data;
  const stringToDate = (dateString) => {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const result = data.filter((item) => {
    return (
      ((date.getMonth() === stringToDate(item.date).getMonth() &&
        date.getFullYear() === stringToDate(item.date).getFullYear()) ||
        (date.getMonth() - 1 === stringToDate(item.date).getMonth() &&
          date.getFullYear() === stringToDate(item.date).getFullYear() &&
          stringToDate(item.date).getDate() >= 25) ||
        (date.getMonth() + 1 === stringToDate(item.date).getMonth() &&
          date.getFullYear() === stringToDate(item.date).getFullYear() &&
          stringToDate(item.date).getDate() <= 7)) &&
      item.groups.some((group) => selectedGroups.includes(group))
    );
  });

  postMessage(result);
};
