const getItemDict = async () => {
  try {
    const data = await AsyncStorage.getItem('feature')
    const output = JSON.parse(data)
    setStorageDataDict(output);
  } catch (err) {
    console.log(err);
  }
}