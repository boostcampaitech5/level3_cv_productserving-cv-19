import React from "react";
import { StyleSheet,Dimensions, } from "react-native";
import { SearchBar } from "react-native-elements";

const ImgSearchBar = (props) => {
  const [searchText, setSearchText] = React.useState("");

  const handleSearch = (text) => {
    props.searchText(searchText);
  };

  return (
    <SearchBar
      placeholder="검색어를 입력해주세요"
      value={searchText}
      onChangeText={setSearchText}
      // 필요한 다른 속성들을 설정하세요
      onSubmitEditing={handleSearch} // 입력 완료 시 호출되는 콜백 함수
      style={styles.searchBar}
      containerStyle={styles.searchcontainer}
      inputContainerStyle={styles.searchInputContainer}
      searchTextField={{ tintColor: "#fff" }}
      placeholderTextColor="#999"
      leftIcon={{ type: "font-awesome", name: "search", color: "#000" }}
    />
  );
};

const styles = StyleSheet.create({
  searchBar: {
    backgroundColor: "#eee",
    width:Dimensions.get("window").width ,
    paddingHorizontal: "1%",
    // paddingHorizontal: "1%",
    fontFamily: "SUITE-Regular",
    borderRadius: 10, // Add border radius for rounded corners
  },
  searchcontainer: {
    backgroundColor: "#fff",
    // width: "100%",
    padding:2,
    // margin:2,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  searchInputContainer: {
    height: 60,
    width:Dimensions.get("window").width - 4,
    backgroundColor: "#eee",
    marginBottom:20,
    // borderWidth: 0.5, // Add border width
    borderColor: "#000", // Set border color to desired color
    borderRadius: 10, // Add border radius for rounded corners
    // borderBottomWidth: 0.5, // Add bottom border
  },
});

export default ImgSearchBar;