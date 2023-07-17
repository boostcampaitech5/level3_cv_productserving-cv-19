import React from "react";
import { StyleSheet } from "react-native";
import { SearchBar } from "react-native-elements";

const ImgSearchBar = (props) => {
  const [searchText, setSearchText] = React.useState("");

  const handleSearch = (text) => {
    props.searchText(searchText);
    // 여기에 검색 기능을 구현하세요
  };

  return (
    <SearchBar
      placeholder="검색어를 입력하세요"
      value={searchText}
      onChangeText={setSearchText}
      // 필요한 다른 속성들을 설정하세요
      onSubmitEditing={handleSearch} // 입력 완료 시 호출되는 콜백 함수
      style={styles.searchBar}
    />
  );
};

const styles = StyleSheet.create({
  searchBar: {
    width: "100%",
    height: 40,
    backgroundColor: "white",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
});

export default ImgSearchBar;
