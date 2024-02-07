onmessage = function (e) {
  const { data, date, selectedGroups } = e.data;

  const stringToDate = (dateString) => {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const result = data.filter((item) => {
    // Vérifie si un groupe est unique dans selectedGroups
    const isGroupUnique = (group) => {
      return selectedGroups.some(selectedGroup => {
        return selectedGroup.adeNames.includes(group) && selectedGroup.unique
      } 
      );
    };

    const dateCondition = (
      (date.getMonth() === stringToDate(item.date).getMonth() &&
        date.getFullYear() === stringToDate(item.date).getFullYear()) ||
      (date.getMonth() - 1 === stringToDate(item.date).getMonth() &&
        date.getFullYear() === stringToDate(item.date).getFullYear() &&
        stringToDate(item.date).getDate() >= 25) ||
      (date.getMonth() + 1 === stringToDate(item.date).getMonth() &&
        date.getFullYear() === stringToDate(item.date).getFullYear() &&
        stringToDate(item.date).getDate() <= 7)
    );

    const groupCondition = item.groups.some(group => 
      selectedGroups.some(selectedGroup => 
        selectedGroup.adeNames.includes(group) && !selectedGroup.unique
      )
    );

    const allGroupsHaveSameParent = item.groups.every(group => {
      return selectedGroups.some(selectedGroup => {
        return selectedGroup.adeNames.includes(group) && selectedGroup.parentGroup === selectedGroups[0].parentGroup;
      });
    });

    const uniqueGroupCondition = (
      ( 
        item.groups.length === 1 ||
        allGroupsHaveSameParent 
      ) &&
      isGroupUnique(item.groups[0])
    );

    console.log('allGroupsHaveSameParent :', item.groups, ' ', allGroupsHaveSameParent); 
    

    

    return dateCondition && (groupCondition || uniqueGroupCondition);
  });

  postMessage(result);
};
